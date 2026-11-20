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
  const AUTHOR_KEY = 'ccbeMyStuffAuthor';
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

  // ---- Author -----------------------------------------------------------
  // A display name the user sets once. It is stamped into every file this
  // profile writes, so a teammate who imports the file can see where it came
  // from. Items imported from someone else keep their original author.
  async function getAuthorName() {
    const stored = await chrome.storage.local.get(AUTHOR_KEY);
    return typeof stored[AUTHOR_KEY] === 'string' ? stored[AUTHOR_KEY] : '';
  }

  function setAuthorName(name) {
    return chrome.storage.local.set({ [AUTHOR_KEY]: String(name || '').trim().slice(0, 60) });
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

  // fallbackAuthor is this profile's name; an item that came from a teammate
  // keeps the author it arrived with.
  function buildFileContents(item, fallbackAuthor) {
    const author = item.author || fallbackAuthor || '';
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeAttr(item.title)}</title>
<meta name="ccbe-id" content="${escapeAttr(item.id)}">
<meta name="ccbe-type" content="${escapeAttr(item.type)}">
<meta name="ccbe-title" content="${escapeAttr(item.title)}">
<meta name="ccbe-description" content="${escapeAttr(item.desc)}">
<meta name="ccbe-author" content="${escapeAttr(author)}">
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
    const createdAt = meta('ccbe-created') || new Date().toISOString();
    return {
      id: meta('ccbe-id') || makeId(),
      type,
      title: meta('ccbe-title') || (doc.title || fileName.replace(/\.html?$/i, '')),
      desc: meta('ccbe-description'),
      author: meta('ccbe-author'),
      html,
      fileName,
      createdAt,
      // Needed so imports can tell a newer copy from an older one.
      updatedAt: meta('ccbe-updated') || createdAt,
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

  async function writeFile(dir, item, author) {
    const fileHandle = await dir.getFileHandle(item.fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(buildFileContents(item, author));
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
    const author = await getAuthorName();
    const syncedIds = new Set();
    for (const item of items.filter((entry) => !entry.synced)) {
      try { await writeFile(dir, item, author); syncedIds.add(item.id); written += 1; } catch (error) { errors.push(error); }
    }
    if (syncedIds.size) {
      // Re-read so we don't clobber changes made while writing.
      const latest = await getItems();
      await setItems(latest.map((entry) => (syncedIds.has(entry.id) ? { ...entry, synced: true } : entry)));
    }

    return { ok: errors.length === 0, written, deleted, errors };
  }

  // ---- Sharing ----------------------------------------------------------
  function timeOf(item) {
    return Date.parse((item && (item.updatedAt || item.createdAt)) || '') || 0;
  }

  // Merges incoming items into this profile using the "take newer" rule:
  // unknown ids are added, a newer copy of a known id replaces it, and an
  // older or identical copy is skipped. Returns a summary for the UI.
  async function mergeIncoming(incoming) {
    const current = await getItems();
    const next = current.slice();
    const indexById = new Map(current.map((item, i) => [item.id, i]));
    const myName = (await getAuthorName()).trim().toLowerCase();
    let added = 0;
    let updated = 0;
    let skipped = 0;

    incoming.forEach((incomingItem) => {
      if (!incomingItem || !incomingItem.html) return;
      // Re-reading your own folder shouldn't label your own work as a
      // teammate's, so drop the author when it is your own name.
      const item = (myName && String(incomingItem.author || '').trim().toLowerCase() === myName)
        ? { ...incomingItem, author: '' }
        : incomingItem;
      const existingIndex = indexById.get(item.id);

      if (existingIndex === undefined) {
        // Rebuild the file name locally so two people's files can never collide.
        next.unshift({
          ...item,
          fileName: `${item.type}-${slugify(item.title)}-${item.id}.html`,
          synced: false
        });
        // Unshifting shifts every stored index along by one.
        indexById.forEach((value, key) => indexById.set(key, value + 1));
        indexById.set(item.id, 0);
        added += 1;
        return;
      }

      const mine = next[existingIndex];
      if (timeOf(item) > timeOf(mine)) {
        next[existingIndex] = {
          ...mine,
          type: item.type,
          title: item.title,
          desc: item.desc,
          author: item.author || mine.author || '',
          html: item.html,
          updatedAt: item.updatedAt,
          synced: false
        };
        updated += 1;
      } else {
        skipped += 1;
      }
    });

    if (added || updated) {
      await setItems(next);
      // Mirror anything new into this user's own folder, if they have one.
      await syncAll().catch(() => ({ ok: false }));
    }
    return { added, updated, skipped, total: incoming.length };
  }

  async function readHtmlItemsFromDir(dir) {
    const incoming = [];
    for await (const [name, entry] of dir.entries()) {
      if (entry.kind !== 'file' || !/\.html?$/i.test(name)) continue;
      const text = await (await entry.getFile()).text();
      const item = parseFileContents(text, name);
      if (item) incoming.push(item);
    }
    return incoming;
  }

  // Re-reads this user's own connected folder.
  async function importFromFolder() {
    const dir = await getMyStuffDir({ request: true });
    if (!dir) throw new Error('Folder access was not granted.');
    return mergeIncoming(await readHtmlItemsFromDir(dir));
  }

  // One-off read of someone else's folder. Deliberately does NOT save the
  // handle, so the user's own sync folder is left alone.
  async function importFromOtherFolder() {
    if (!supportsFolders()) throw new Error('This browser cannot open folders.');
    const dir = await window.showDirectoryPicker({ id: 'ccbe-my-stuff-import', mode: 'read', startIn: 'documents' });
    let incoming = await readHtmlItemsFromDir(dir);
    // If they shared the parent folder, the files sit in my-stuff/.
    if (!incoming.length) {
      try {
        const nested = await dir.getDirectoryHandle(FOLDER_NAME);
        incoming = await readHtmlItemsFromDir(nested);
      } catch (error) { /* no my-stuff subfolder; nothing to import */ }
    }
    return mergeIncoming(incoming);
  }

  // Import from files chosen in a file picker (accepts a FileList or array).
  async function importFromFiles(fileList) {
    const files = Array.from(fileList || []).filter((file) => /\.html?$/i.test(file.name));
    const incoming = [];
    for (const file of files) {
      const item = parseFileContents(await file.text(), file.name);
      if (item) incoming.push(item);
    }
    return mergeIncoming(incoming);
  }

  // Writes every saved item into a folder the user picks, for sharing. The
  // chosen folder is not remembered and does not become the sync folder.
  async function exportAllToFolder() {
    if (!supportsFolders()) throw new Error('This browser cannot open folders.');
    const items = await getItems();
    if (!items.length) return { written: 0, total: 0, ok: true, folderName: '' };

    const dir = await window.showDirectoryPicker({ id: 'ccbe-my-stuff-export', mode: 'readwrite', startIn: 'documents' });
    const author = await getAuthorName();
    const errors = [];
    let written = 0;
    for (const item of items) {
      try { await writeFile(dir, item, author); written += 1; } catch (error) { errors.push(error); }
    }
    return { written, total: items.length, ok: errors.length === 0, folderName: dir.name, errors };
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
    importFromOtherFolder,
    importFromFiles,
    exportAllToFolder,
    getAuthorName,
    setAuthorName,
    countUnsynced
  };
})();
