// Two independent panels, shared by the popup and the standalone
// my-stuff-folder.html tab:
//   CCBEMyStuffFolderUI.mount(el)        -> folder connection + sync
//   CCBEMyStuffFolderUI.mountSharing(el) -> team export / import
(function () {
  const store = window.CCBEMyStuff;

  const FOLDER_MARKUP = `
    <p class="ms-folder-intro">Your saved pages and elements always stay in your own Chrome profile. Connect a folder to also keep each one as an <code>.html</code> file. A folder named <strong>my-stuff</strong> is created inside the folder you choose (or pick an existing <strong>my-stuff</strong> folder).</p>
    <div class="ms-folder-status ms-folder-status-large" data-ms="statusBox"><span data-ms="statusText">Checking…</span></div>
    <div class="ms-folder-actions">
      <button data-ms="choose" class="layout-insert-button" type="button">Choose folder…</button>
      <button data-ms="grant" class="layout-insert-button" type="button" hidden>Allow access &amp; sync</button>
      <button data-ms="sync" class="options-copy-button" type="button" hidden>Sync now</button>
      <button data-ms="import" class="options-copy-button" type="button" hidden>Import .html files from folder</button>
      <button data-ms="disconnect" class="options-copy-button ms-danger" type="button" hidden>Disconnect folder</button>
    </div>
    <p data-ms="message" class="ms-folder-message" role="status" aria-live="polite"></p>
    <p class="ms-folder-note">Tip: when Chrome asks, choose <em>Allow on every visit</em> so the folder stays in sync without asking again. Disconnecting never deletes files.</p>`;

  const SHARING_MARKUP = `
    <p class="ms-share-intro">Export your saved items as <code>.html</code> files to share with a teammate, or import new <code>.html</code> files. If an item you already have comes in, the newer copy replaces it.</p>

    <label class="ms-share-label" for="msAuthorName">Your name</label>
    <div class="ms-share-row">
      <input id="msAuthorName" data-ms="authorInput" type="text" maxlength="60" placeholder="e.g. Jaimen" autocomplete="off">
      <button data-ms="authorSave" class="options-copy-button" type="button">Save</button>
    </div>
    <p class="ms-share-note">Added to the files you export so teammates can see who made them. Stored only on this computer.</p>

    <div class="ms-folder-actions">
      <button data-ms="export" class="layout-insert-button" type="button">Export to a folder…</button>
      <button data-ms="importFiles" class="options-copy-button" type="button">Import files…</button>
      <button data-ms="importOther" class="options-copy-button" type="button">Import from another folder…</button>
    </div>
    <input data-ms="fileInput" type="file" accept=".html,.htm" multiple hidden>
    <p data-ms="shareMessage" class="ms-folder-message" role="status" aria-live="polite"></p>
    <p data-ms="popupNote" class="ms-share-note" hidden>If this window closes while you are choosing files, <a href="#" data-ms="fullPageLink">open the full page</a> and import there instead.</p>`;

  function syncSummary(result) {
    if (!result.ok && !result.written && !result.deleted) return 'Could not write to the folder.';
    return `Sync complete: ${result.written} file(s) written, ${result.deleted} file(s) removed.${result.ok ? '' : ' Some changes failed; try Sync now again.'}`;
  }

  function mergeSummary(result) {
    if (!result || !result.total) return 'No .html files found to import.';
    const parts = [];
    if (result.added) parts.push(`${result.added} added`);
    if (result.updated) parts.push(`${result.updated} updated`);
    if (result.skipped) parts.push(`${result.skipped} already up to date`);
    return `Import complete: ${parts.join(', ')}.`;
  }

  function openFullPage() {
    chrome.tabs.create({ url: chrome.runtime.getURL('my-stuff-folder.html#team-sharing') });
  }

  // Wraps an action so the button can't be double-clicked and any failure is
  // reported rather than swallowed.
  function makeRunner(report, after) {
    return async function run(button, task) {
      button.disabled = true;
      try {
        await task();
      } catch (error) {
        if (error && error.name === 'AbortError') report('No folder chosen.');
        else report(`Something went wrong: ${error && error.message ? error.message : error}`, true);
      } finally {
        button.disabled = false;
        if (after) after();
      }
    };
  }

  // ---- Folder settings ----------------------------------------------------
  function mount(root) {
    if (!store || !root) return null;
    root.innerHTML = FOLDER_MARKUP;
    const q = (name) => root.querySelector(`[data-ms="${name}"]`);
    const statusBox = q('statusBox');
    const statusText = q('statusText');
    const message = q('message');
    const chooseButton = q('choose');
    const grantButton = q('grant');
    const syncButton = q('sync');
    const importButton = q('import');
    const disconnectButton = q('disconnect');

    function say(text, isError) {
      message.textContent = text || '';
      message.classList.toggle('is-error', Boolean(isError));
    }

    async function render() {
      const state = await store.getFolderState();
      const [items, waiting] = await Promise.all([store.getItems(), store.countUnsynced()]);
      statusBox.dataset.state = state.status;
      const connected = ['granted', 'prompt', 'denied'].includes(state.status);

      chooseButton.hidden = state.status === 'unsupported';
      chooseButton.textContent = connected ? 'Choose a different folder…' : 'Choose folder…';
      chooseButton.className = connected ? 'options-copy-button' : 'layout-insert-button';
      grantButton.hidden = !(state.status === 'prompt' || state.status === 'denied');
      syncButton.hidden = state.status !== 'granted';
      importButton.hidden = !connected;
      disconnectButton.hidden = !connected;

      if (state.status === 'unsupported') {
        statusText.textContent = 'This browser does not support saving to a folder. Your items are still saved in your Chrome profile.';
      } else if (state.status === 'none') {
        statusText.textContent = `No folder connected. ${items.length} item(s) saved in your Chrome profile.`;
      } else if (state.status === 'granted') {
        statusText.textContent = `Connected to “${state.name}”. ${items.length} item(s)${waiting ? `, ${waiting} change(s) waiting to sync` : ', all synced'}.`;
      } else {
        statusText.textContent = `Connected to “${state.name}”, but Chrome needs your permission again. ${waiting} change(s) waiting to sync.`;
      }
    }

    const run = makeRunner(say, render);

    chooseButton.addEventListener('click', () => run(chooseButton, async () => {
      const result = await store.pickFolder();
      say(`Folder connected. ${syncSummary(result)}`);
    }));

    grantButton.addEventListener('click', () => run(grantButton, async () => {
      const result = await store.syncAll({ request: true });
      const state = await store.getFolderState();
      say(state.status === 'granted' ? syncSummary(result) : 'Permission was not granted.', state.status !== 'granted');
    }));

    syncButton.addEventListener('click', () => run(syncButton, async () => {
      say(syncSummary(await store.syncAll({ request: true })));
    }));

    importButton.addEventListener('click', () => run(importButton, async () => {
      say(mergeSummary(await store.importFromFolder()));
    }));

    disconnectButton.addEventListener('click', () => run(disconnectButton, async () => {
      await store.disconnectFolder();
      say('Folder disconnected. Files already in the folder were left alone.');
    }));

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') render();
    });

    render();
    return { render, clearMessage: () => say('') };
  }

  // ---- File sharing -------------------------------------------------------
  function mountSharing(root) {
    if (!store || !root) return null;
    root.innerHTML = SHARING_MARKUP;
    const q = (name) => root.querySelector(`[data-ms="${name}"]`);
    const authorInput = q('authorInput');
    const authorSaveButton = q('authorSave');
    const exportButton = q('export');
    const importFilesButton = q('importFiles');
    const importOtherButton = q('importOther');
    const fileInput = q('fileInput');
    const shareMessage = q('shareMessage');
    const popupNote = q('popupNote');
    const fullPageLink = q('fullPageLink');

    // Only a popup can be closed by a native file dialog.
    const isStandalone = root.id === 'msSharingStandalone';

    function say(text, isError) {
      shareMessage.textContent = text || '';
      shareMessage.classList.toggle('is-error', Boolean(isError));
    }

    async function render() {
      const [state, items] = await Promise.all([store.getFolderState(), store.getItems()]);
      // Sharing works with or without a connected sync folder; only the
      // folder-based actions need File System Access support.
      const canUseFolders = state.status !== 'unsupported';
      exportButton.hidden = !canUseFolders;
      importOtherButton.hidden = !canUseFolders;
      exportButton.disabled = !items.length;
      if (popupNote) popupNote.hidden = isStandalone;
      if (document.activeElement !== authorInput) {
        authorInput.value = await store.getAuthorName();
      }
    }

    const run = makeRunner(say, render);

    authorSaveButton.addEventListener('click', () => run(authorSaveButton, async () => {
      await store.setAuthorName(authorInput.value);
      const saved = await store.getAuthorName();
      say(saved ? `Saved. Files you export will say “from ${saved}”.` : 'Name cleared.');
    }));

    exportButton.addEventListener('click', () => run(exportButton, async () => {
      const result = await store.exportAllToFolder();
      if (!result.total) { say('You have no saved items to export yet.'); return; }
      say(
        `Exported ${result.written} of ${result.total} item(s) to “${result.folderName}”. `
        + 'Share that folder, or delete any files you would rather not send first.',
        !result.ok
      );
    }));

    importOtherButton.addEventListener('click', () => run(importOtherButton, async () => {
      say(mergeSummary(await store.importFromOtherFolder()));
    }));

    importFilesButton.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => run(importFilesButton, async () => {
      const files = fileInput.files;
      if (!files || !files.length) { say('No files chosen.'); return; }
      const result = await store.importFromFiles(files);
      fileInput.value = '';
      say(mergeSummary(result));
    }));

    if (fullPageLink) {
      fullPageLink.addEventListener('click', (event) => { event.preventDefault(); openFullPage(); });
    }

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') render();
    });

    render();
    return { render, clearMessage: () => say('') };
  }

  window.CCBEMyStuffFolderUI = { mount, mountSharing };

  // Standalone tab page shows both panels.
  const standaloneFolder = document.getElementById('msFolderStandalone');
  if (standaloneFolder) mount(standaloneFolder);

  const standaloneSharing = document.getElementById('msSharingStandalone');
  if (standaloneSharing) {
    mountSharing(standaloneSharing);
    // Opened from the popup's File sharing button: jump straight to it.
    if (window.location.hash === '#team-sharing') {
      standaloneSharing.scrollIntoView({ block: 'start' });
    }
  }
})();
