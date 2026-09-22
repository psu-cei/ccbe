// ---------------------------------------------------------------------------
// My Stuff storage (shared by popup.html and my-stuff-folder.html)
//
// Each user's saved pages/elements live in chrome.storage.local, which sits
// inside their own Chrome profile. If the user connects a folder, every item
// is also mirrored as a standalone .html file inside a "my-stuff" subfolder,
// and removed from that folder when the item is removed.
// ---------------------------------------------------------------------------
(function () {
  const ITEMS_KEY = 'ccbeMyStuffItems';
  const PENDING_DELETES_KEY = 'ccbeMyStuffPendingDeletes';
  const FOLDER_NAME = 'my-stuff';
  const DB_NAME = 'ccbe-my-stuff';
  const DB_STORE = 'handles';
  const HANDLE_KEY = 'folder';
  const MARK_START = '<!-- ccbe:my-stuff:start -->';
  const MARK_END = '<!-- ccbe:my-stuff:end -->';
  const TYPES = { page: 'Page', element: 'Element' };

  // ---- IndexedDB (folder handles can't go in chrome.storage) -------------
  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idb(mode, fn) {
    const db = await openDb();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, mode);
        const req = fn(tx.objectStore(DB_STORE));
        tx.oncomplete = () => resolve(req ? req.result : undefined);
        tx.onerror = () => reject(tx.error);
      });
    } finally {
      db.close();
    }
  }

  const getHandle = () => idb('readonly', (s) => s.get(HANDLE_KEY)).catch(() => null);
  const saveHandle = (h) => idb('readwrite', (s) => s.put(h, HANDLE_KEY));
  const clearHandle = () => idb('readwrite', (s) => s.delete(HANDLE_KEY));

  // ---- Items ------------------------------------------------------------
  async function getItems() {
    const stored = await chrome.storage.local.get(ITEMS_KEY);
    return Array.isArray(stored[ITEMS_KEY]) ? stored[ITEMS_KEY] : [];
  }

  function setItems(items) {
    return chrome.storage.local.set({ [ITEMS_KEY]: items });
  }

  async function getPendingDeletes() {
    const stored = await chrome.storage.local.get(PENDING_DELETES_KEY);
    return Array.isArray(stored[PENDING_DELETES_KEY]) ? stored[PENDING_DELETES_KEY] : [];
  }

  function setPendingDeletes(list) {
    return chrome.storage.local.set({ [PENDING_DELETES_KEY]: Array.from(new Set(list)) });
  }

  function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function slugify(text) {
    return String(text || 'untitled')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50) || 'untitled';
  }

  function escapeAttr(value) {
    return String(value || '')
      .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function buildFileContents(item) {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeAttr(item.title)}</title>
<meta name="ccbe-id" content="${escapeAttr(item.id)}">
<meta name="ccbe-type" content="${escapeAttr(item.type)}">
<meta name="ccbe-title" content="${escapeAttr(item.title)}">
<meta name="ccbe-description" content="${escapeAttr(item.desc)}">
<meta name="ccbe-created" content="${escapeAttr(item.createdAt)}">
<meta name="ccbe-updated" content="${escapeAttr(item.updatedAt || item.createdAt)}">
</head>
<body>
${MARK_START}
${item.html}
${MARK_END}
</body>
</html>
`;
  }

  function parseFileContents(text, fileName) {
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const meta = (name) => (doc.querySelector(`meta[name="${name}"]`) || {}).content || '';
    const start = text.indexOf(MARK_START);
    const end = text.lastIndexOf(MARK_END);
    const html = (start !== -1 && end > start)
      ? text.slice(start + MARK_START.length, end).trim()
      : (doc.body ? doc.body.innerHTML.trim() : '');
    if (!html) return null;
    const type = TYPES[meta('ccbe-type')] ? meta('ccbe-type') : 'element';
    return {
      id: meta('ccbe-id') || makeId(),
      type,
      title: meta('ccbe-title') || (doc.title || fileName.replace(/\.html?$/i, '')),
      desc: meta('ccbe-description'),
      html,
      fileName,
      createdAt: meta('ccbe-created') || new Date().toISOString(),
      synced: true
    };
  }

  // ---- Folder -----------------------------------------------------------
  function supportsFolders() {
    return typeof window.showDirectoryPicker === 'function';
  }

  // status: unsupported | none | granted | prompt | denied
  async function getFolderState({ request = false } = {}) {
    if (!supportsFolders()) return { status: 'unsupported' };
    const handle = await getHandle();
    if (!handle) return { status: 'none' };
    let status = 'prompt';
    try {
      status = await handle.queryPermission({ mode: 'readwrite' });
      if (status !== 'granted' && request) {
        status = await handle.requestPermission({ mode: 'readwrite' });
      }
    } catch (error) {
      status = 'denied';
    }
    const name = handle.name === FOLDER_NAME ? handle.name : `${handle.name}/${FOLDER_NAME}`;
    return { status, name, handle };
  }

  async function getMyStuffDir(options) {
    const state = await getFolderState(options);
    if (state.status !== 'granted') return null;
    // If the user picked a folder that is already called "my-stuff", use it directly.
    if (state.handle.name === FOLDER_NAME) return state.handle;
    return state.handle.getDirectoryHandle(FOLDER_NAME, { create: true });
  }

  // Must be called from a click in a normal extension tab (not the popup).
  async function pickFolder() {
    const handle = await window.showDirectoryPicker({ id: 'ccbe-my-stuff', mode: 'readwrite', startIn: 'documents' });
    await saveHandle(handle);
    // Write every item into the newly connected folder.
    const items = await getItems();
    await setItems(items.map((item) => ({ ...item, synced: false })));
    await setPendingDeletes([]);
    return syncAll();
  }

  async function disconnectFolder() {
    await clearHandle();
    await setPendingDeletes([]);
  }

  async function writeFile(dir, item) {
    const fileHandle = await dir.getFileHandle(item.fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(buildFileContents(item));
    await writable.close();
  }

  async function removeFile(dir, fileName) {
    try {
      await dir.removeEntry(fileName);
    } catch (error) {
      if (error && error.name !== 'NotFoundError') throw error;
    }
  }

  // Writes unsynced items and removes files for deleted items.
  async function syncAll({ request = false } = {}) {
    const dir = await getMyStuffDir({ request });
    if (!dir) return { ok: false, written: 0, deleted: 0 };

    let written = 0;
    let deleted = 0;
    const errors = [];

    const pending = await getPendingDeletes();
    const stillPending = [];
    for (const fileName of pending) {
      try { await removeFile(dir, fileName); deleted += 1; } catch (error) { stillPending.push(fileName); errors.push(error); }
    }
    await setPendingDeletes(stillPending);

    const items = await getItems();
    const syncedIds = new Set();
    for (const item of items.filter((entry) => !entry.synced)) {
      try { await writeFile(dir, item); syncedIds.add(item.id); written += 1; } catch (error) { errors.push(error); }
    }
    if (syncedIds.size) {
      // Re-read so we don't clobber changes made while writing.
      const latest = await getItems();
      await setItems(latest.map((entry) => (syncedIds.has(entry.id) ? { ...entry, synced: true } : entry)));
    }

    return { ok: errors.length === 0, written, deleted, errors };
  }

  async function importFromFolder() {
    const dir = await getMyStuffDir({ request: true });
    if (!dir) throw new Error('Folder access was not granted.');
    const items = await getItems();
    const knownIds = new Set(items.map((item) => item.id));
    const knownFiles = new Set(items.map((item) => item.fileName));
    const added = [];
    for await (const [name, entry] of dir.entries()) {
      if (entry.kind !== 'file' || !/\.html?$/i.test(name) || knownFiles.has(name)) continue;
      const text = await (await entry.getFile()).text();
      const item = parseFileContents(text, name);
      if (!item || knownIds.has(item.id)) continue;
      knownIds.add(item.id);
      added.push(item);
    }
    if (added.length) await setItems([...added, ...(await getItems())]);
    return added.length;
  }

  // ---- Public add / remove ----------------------------------------------
  async function addItem({ type, title, desc, html }) {
    const id = makeId();
    const cleanType = TYPES[type] ? type : 'element';
    const cleanTitle = String(title || '').trim();
    const item = {
      id,
      type: cleanType,
      title: cleanTitle,
      desc: String(desc || '').trim(),
      html: String(html || '').trim(),
      fileName: `${cleanType}-${slugify(cleanTitle)}-${id}.html`,
      createdAt: new Date().toISOString(),
      synced: false
    };
    await setItems([item, ...(await getItems())]);
    const sync = await syncAll().catch(() => ({ ok: false }));
    return { item, savedToFolder: Boolean(sync.ok && sync.written) };
  }

  async function updateItem(id, { type, title, desc, html }) {
    const items = await getItems();
    const index = items.findIndex((entry) => entry.id === id);
    if (index === -1) throw new Error('Item not found.');
    const old = items[index];
    const cleanType = TYPES[type] ? type : old.type;
    const cleanTitle = String(title || '').trim() || old.title;
    const fileName = `${cleanType}-${slugify(cleanTitle)}-${old.id}.html`;
    const item = {
      ...old,
      type: cleanType,
      title: cleanTitle,
      desc: String(desc || '').trim(),
      html: String(html || '').trim(),
      fileName,
      updatedAt: new Date().toISOString(),
      synced: false
    };
    items[index] = item;
    await setItems(items);
    // A new title/type means a new file name, so the old file goes away.
    if (fileName !== old.fileName && (await getHandle())) {
      await setPendingDeletes([...(await getPendingDeletes()), old.fileName]);
    }
    const sync = await syncAll().catch(() => ({ ok: false }));
    return { item, savedToFolder: Boolean(sync.ok && sync.written) };
  }

  async function removeItem(id) {
    const items = await getItems();
    const item = items.find((entry) => entry.id === id);
    if (!item) return { removed: false };
    await setItems(items.filter((entry) => entry.id !== id));
    if (await getHandle()) {
      await setPendingDeletes([...(await getPendingDeletes()), item.fileName]);
    }
    const sync = await syncAll().catch(() => ({ ok: false }));
    return { removed: true, removedFromFolder: Boolean(sync.ok) };
  }

  async function countUnsynced() {
    const [items, pending] = await Promise.all([getItems(), getPendingDeletes()]);
    return items.filter((item) => !item.synced).length + pending.length;
  }

  window.CCBEMyStuff = {
    ITEMS_KEY,
    PENDING_DELETES_KEY,
    FOLDER_NAME,
    TYPES,
    getItems,
    addItem,
    updateItem,
    removeItem,
    supportsFolders,
    getFolderState,
    pickFolder,
    disconnectFolder,
    syncAll,
    importFromFolder,
    countUnsynced
  };
})();
