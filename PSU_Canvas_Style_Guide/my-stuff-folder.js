// Folder settings UI, shared by the popup (My Stuff > Folder settings) and
// the standalone my-stuff-folder.html tab. Call CCBEMyStuffFolderUI.mount(el).
(function () {
  const store = window.CCBEMyStuff;

  const MARKUP = `
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

  function syncSummary(result) {
    if (!result.ok && !result.written && !result.deleted) return 'Could not write to the folder.';
    return `Sync complete: ${result.written} file(s) written, ${result.deleted} file(s) removed.${result.ok ? '' : ' Some changes failed; try Sync now again.'}`;
  }

  function mount(root) {
    if (!store || !root) return null;
    root.innerHTML = MARKUP;
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

    async function run(button, task) {
      button.disabled = true;
      try {
        await task();
      } catch (error) {
        if (error && error.name === 'AbortError') say('No folder chosen.');
        else say(`Something went wrong: ${error && error.message ? error.message : error}`, true);
      } finally {
        button.disabled = false;
        render();
      }
    }

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
      const count = await store.importFromFolder();
      say(count ? `Imported ${count} item(s) into My Stuff.` : 'No new .html files found in the folder.');
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

  window.CCBEMyStuffFolderUI = { mount };

  // Standalone tab page.
  const standalone = document.getElementById('msFolderStandalone');
  if (standalone) mount(standalone);
})();
