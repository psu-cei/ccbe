// ---------------------------------------------------------------------------
// My Stuff panel (popup). Depends on my-stuff-store.js and popup.js globals:
// setStatus, pasteCustomHtml, wrapContentInsertSpacing.
// ---------------------------------------------------------------------------
(function () {
  const store = window.CCBEMyStuff;
  if (!store) return;

  const $ = (id) => document.getElementById(id);
  const mainView = $('myStuffMainView');
  const addView = $('myStuffAddView');
  const detailView = $('myStuffDetailView');
  const folderView = $('myStuffFolderView');
  const sharingView = $('myStuffSharingView');
  const folderUi = window.CCBEMyStuffFolderUI ? window.CCBEMyStuffFolderUI.mount($('myStuffFolderSettings')) : null;
  const sharingUi = window.CCBEMyStuffFolderUI ? window.CCBEMyStuffFolderUI.mountSharing($('myStuffSharingSettings')) : null;
  const grid = $('myStuffGrid');
  const emptyState = $('myStuffEmpty');
  const searchInput = $('myStuffSearch');
  const typeFilter = $('myStuffTypeFilter');
  const folderText = $('myStuffFolderText');
  const folderButton = $('myStuffFolderButton');
  const form = $('myStuffForm');
  const typeInput = $('myStuffType');
  const titleInput = $('myStuffTitle');
  const descInput = $('myStuffDesc');
  const htmlInput = $('myStuffHtml');
  const formError = $('myStuffFormError');
  const formPreview = $('myStuffFormPreview');
  const saveButton = $('myStuffSaveButton');
  const formHeading = $('myStuffFormHeading');
  const formIntro = $('myStuffFormIntro');
  const sharingButton = $('myStuffSharingButton');
  const formBackButton = $('myStuffAddBack');
  const editButton = $('myStuffEditButton');
  const ADD_INTRO = formIntro ? formIntro.textContent : '';
  const detailTitle = $('myStuffDetailTitle');
  const detailDesc = $('myStuffDetailDesc');
  const detailMeta = $('myStuffDetailMeta');
  const detailPreview = $('myStuffDetailPreview');
  const insertButton = $('myStuffInsertButton');
  const copyButton = $('myStuffCopyButton');
  const removeButton = $('myStuffRemoveButton');
  const shareToggle = $('myStuffShareToggle');
  const shareNote = $('myStuffShareNote');

  const THUMB_IMAGE = 'assets/images/my-stuff-card.svg';
  let items = [];
  let selectedId = null;
  let removeArmed = false;
  let previewTimer = null;
  let editingId = null;

  const notify = (message, isError) => {
    if (typeof setStatus === 'function') setStatus(message, isError);
  };

  // ---- Views -------------------------------------------------------------
  function showView(name) {
    mainView.hidden = name !== 'main';
    addView.hidden = name !== 'add';
    detailView.hidden = name !== 'detail';
    if (folderView) folderView.hidden = name !== 'folder';
    if (sharingView) sharingView.hidden = name !== 'sharing';
    window.scrollTo({ top: 0 });
  }

  function openFolderPage(hash) {
    chrome.tabs.create({ url: chrome.runtime.getURL(`my-stuff-folder.html${hash || ''}`) });
  }

  function openSharing() {
    if (!sharingUi) { openFolderPage('#team-sharing'); return; }
    sharingUi.clearMessage();
    sharingUi.render();
    showView('sharing');
  }

  function openFolderSettings() {
    if (!folderUi) { openFolderPage(); return; }
    folderUi.clearMessage();
    folderUi.render();
    showView('folder');
  }

  // ---- Preview helpers ---------------------------------------------------
  function previewDoc(html) {
    return `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:10px; font-family:'Lato', Arial, Helvetica, sans-serif; color:#2d3b45;">${html}</body></html>`;
  }

  // Cards use one shared local placeholder image instead of rendering each
  // saved item's HTML, so opening the popup never fetches remote images.
  function makeThumb(item) {
    const thumb = document.createElement('span');
    thumb.className = 'preview ms-thumb';
    thumb.setAttribute('aria-hidden', 'true');
    const image = document.createElement('img');
    image.className = 'ms-thumb-image';
    image.src = THUMB_IMAGE;
    image.alt = '';
    thumb.appendChild(image);
    const badge = document.createElement('span');
    badge.className = `ms-type-badge ms-type-${item.type}`;
    badge.textContent = store.TYPES[item.type] || 'Element';
    thumb.appendChild(badge);
    return thumb;
  }

  // ---- Grid --------------------------------------------------------------
  function renderGrid() {
    grid.innerHTML = '';
    const query = String(searchInput.value || '').toLowerCase().trim();
    const type = typeFilter.value;
    const visible = items.filter((item) => {
      const matchesType = type === 'all' || item.type === type;
      const text = `${item.title} ${item.desc} ${item.type} ${item.author || ''}`.toLowerCase();
      return matchesType && (!query || text.includes(query));
    });

    emptyState.hidden = items.length !== 0;
    grid.hidden = items.length === 0;

    visible.forEach((item) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'layout-card ms-card';
      card.dataset.myStuffId = item.id;
      card.appendChild(makeThumb(item));
      const title = document.createElement('strong');
      title.textContent = item.title;
      // Items that arrived from a teammate are labelled so they aren't
      // mistaken for your own work.
      if (item.author) {
        const badge = document.createElement('span');
        badge.className = 'ms-author-badge';
        badge.textContent = `from ${item.author}`;
        title.appendChild(badge);
      }
      const desc = document.createElement('small');
      desc.textContent = item.desc || 'No description';
      card.appendChild(title);
      card.appendChild(desc);
      card.addEventListener('click', () => openDetail(item.id));
      grid.appendChild(card);
    });

    if (items.length && !visible.length) {
      const none = document.createElement('div');
      none.className = 'no-results';
      none.textContent = 'No matching items found.';
      grid.appendChild(none);
    }

  }

  async function refresh() {
    items = await store.getItems();
    renderGrid();
    renderFolderStatus();
    if (selectedId && !items.some((item) => item.id === selectedId) && (!detailView.hidden || editingId === selectedId)) {
      editingId = null;
      selectedId = null;
      showView('main');
    }
  }

  async function renderFolderStatus() {
    const state = await store.getFolderState();
    const waiting = await store.countUnsynced();
    folderButton.hidden = false;
    folderText.parentElement.dataset.state = state.status;

    if (state.status === 'unsupported') {
      folderText.textContent = 'Saved privately in your Chrome profile. (This browser can\'t save to a folder.)';
      folderButton.hidden = true;
    } else if (state.status === 'none') {
      folderText.textContent = 'Saved privately in your Chrome profile. Connect a folder to also keep each item as an .html file.';
      folderButton.textContent = 'Connect folder';
    } else if (state.status === 'granted') {
      folderText.textContent = waiting
        ? `Saving to “${state.name}” — ${waiting} change(s) waiting to sync.`
        : `Saved in your Chrome profile and in “${state.name}”.`;
      folderButton.textContent = 'Folder settings';
    } else {
      folderText.textContent = `“${state.name}” needs permission again${waiting ? ` — ${waiting} change(s) waiting to sync` : ''}.`;
      folderButton.textContent = 'Reconnect';
    }
  }

  // ---- Add form ----------------------------------------------------------
  function openAddForm() {
    editingId = null;
    form.reset();
    formError.hidden = true;
    formHeading.textContent = 'Add to My Stuff';
    formIntro.textContent = ADD_INTRO;
    // Importing is an alternative to filling in this form, so it is offered
    // when adding but not when editing an existing item.
    if (sharingButton) sharingButton.hidden = false;
    saveButton.textContent = 'Save';
    formBackButton.textContent = '← Back to My Stuff';
    showView('add');
    titleInput.focus();
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
      formPreview.srcdoc = previewDoc('<p style="color:#5f6f7a;">Paste HTML to see a preview.</p>');
    }, 60);
  }

  function openEditForm(id) {
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    editingId = id;
    form.reset();
    formError.hidden = true;
    typeInput.value = item.type;
    titleInput.value = item.title;
    descInput.value = item.desc || '';
    htmlInput.value = item.html;
    formHeading.textContent = `Edit “${item.title}”`;
    formIntro.textContent = 'Changes replace the saved version (and its .html file, if a folder is connected).';
    if (sharingButton) sharingButton.hidden = true;
    saveButton.textContent = 'Save Changes';
    formBackButton.textContent = '← Back to item';
    showView('add');
    titleInput.focus();
    // Same reason as the detail view: an embed assigned while this form is
    // still hidden never loads. Show the view first, then fill the preview.
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => { formPreview.srcdoc = previewDoc(item.html); }, 60);
  }

  function closeForm() {
    if (editingId && items.some((entry) => entry.id === editingId)) openDetail(editingId);
    else showView('main');
    editingId = null;
  }

  function schedulePreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
      const html = htmlInput.value.trim();
      formPreview.srcdoc = previewDoc(html || '<p style="color:#5f6f7a;">Paste HTML to see a preview.</p>');
    }, 200);
  }

  function showFormError(message) {
    formError.textContent = message;
    formError.hidden = false;
  }

  async function handleSave(event) {
    event.preventDefault();
    formError.hidden = true;
    const title = titleInput.value.trim();
    const html = htmlInput.value.trim();
    if (!title) { showFormError('Add a title.'); titleInput.focus(); return; }
    if (!html) { showFormError('Paste the HTML you want to save.'); htmlInput.focus(); return; }
    if (items.some((item) => item.id !== editingId && item.title.toLowerCase() === title.toLowerCase() && item.type === typeInput.value)) {
      showFormError(`You already have a ${typeInput.value} called “${title}”. Use a different title.`);
      titleInput.focus();
      return;
    }

    saveButton.disabled = true;
    try {
      const fields = { type: typeInput.value, title, desc: descInput.value, html };
      if (editingId) {
        const id = editingId;
        const { item, savedToFolder } = await store.updateItem(id, fields);
        editingId = null;
        await refresh();
        openDetail(id);
        notify(savedToFolder
          ? `“${item.title}” updated in My Stuff and ${item.fileName}.`
          : `“${item.title}” updated.`, false);
      } else {
        const { item, savedToFolder } = await store.addItem(fields);
        await refresh();
        showView('main');
        notify(savedToFolder
          ? `“${item.title}” saved to My Stuff and to ${item.fileName}.`
          : `“${item.title}” saved to My Stuff.`, false);
      }
    } catch (error) {
      showFormError(`Could not save: ${error && error.message ? error.message : error}`);
    } finally {
      saveButton.disabled = false;
    }
  }

  // ---- Detail view -------------------------------------------------------
  function resetRemoveButton() {
    removeArmed = false;
    removeButton.textContent = 'Remove';
    removeButton.classList.remove('is-armed');
  }

  function openDetail(id) {
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    selectedId = id;
    resetRemoveButton();
    detailTitle.textContent = item.title;
    detailDesc.textContent = item.desc || 'No description.';
    detailMeta.textContent = `${store.TYPES[item.type] || 'Element'} · ${item.fileName}`
      + (item.author ? ` · from ${item.author}` : '');
    insertButton.textContent = item.type === 'page' ? 'Insert Page' : 'Insert Element';
    renderShareToggle(item);
    showView('detail');
    // Assign srcdoc only after the view is on screen. Saved items often embed
    // a Canvas file with loading="lazy"; an iframe created inside a hidden,
    // transformed subtree never intersects the viewport, so its load is
    // deferred and does not reliably fire once the subtree is shown. Setting
    // it while visible is what makes Team Stuff's identical preview work.
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => { detailPreview.srcdoc = previewDoc(item.html); }, 60);
  }

  // ---- File sharing ------------------------------------------------------
  // An item shared to the team repo is pushed as the connected GitHub user.
  // Turning sharing off rewrites the file as hidden rather than deleting it,
  // which is what the team agreed to.
  async function renderShareToggle(item) {
    if (!shareToggle) return;
    const team = window.CCBETeamStuff;
    if (!team) { shareToggle.hidden = true; return; }

    shareToggle.hidden = false;
    shareToggle.disabled = true;
    shareToggle.textContent = 'Checking…';

    const token = await team.getToken();
    if (!token) {
      shareToggle.textContent = 'Connect GitHub to share';
      shareToggle.setAttribute('aria-pressed', 'false');
      shareToggle.disabled = false;
      shareToggle.dataset.action = 'connect';
      shareNote.textContent = 'Team Stuff needs a GitHub token before you can share. Open Team Stuff, then Connection settings.';
      return;
    }

    const shared = (await team.getSharedIds()).has(item.id);
    shareToggle.dataset.action = shared ? 'unshare' : 'share';
    shareToggle.textContent = shared ? 'Shared with the team' : 'Share with the team';
    shareToggle.setAttribute('aria-pressed', String(shared));
    shareToggle.disabled = false;
    shareNote.textContent = shared
      ? 'Live in the team folder. Turning this off hides it from Team Stuff; the file stays in the repo.'
      : "Puts a copy in the team's GitHub folder. That repo is public, so treat anything you share as readable by anyone.";
  }

  async function handleShareToggle() {
    const item = selectedItem();
    const team = window.CCBETeamStuff;
    if (!item || !team) return;

    if (shareToggle.dataset.action === 'connect') {
      notify('Open Team Stuff, then Connection settings, to add your GitHub token.', false);
      return;
    }

    const unsharing = shareToggle.dataset.action === 'unshare';
    shareToggle.disabled = true;
    shareToggle.textContent = unsharing ? 'Hiding…' : 'Sharing…';
    try {
      const author = (await store.getAuthorName()) || (await team.getUser());
      if (unsharing) {
        // unshareItem reports hidden:false when it cannot find the file, which
        // used to be announced as success.
        const result = await team.unshareItem(item, author);
        notify(
          result.hidden
            ? `${item.title} is no longer listed in Team Stuff.`
            : `Could not find ${item.title} in the team folder, so nothing changed.`,
          !result.hidden
        );
      } else {
        await team.shareItem(item, author);
        notify(`${item.title} shared with the team.`, false);
      }
      if (window.CCBETeamStuffUI) window.CCBETeamStuffUI.reload();
    } catch (error) {
      notify(`Sharing failed: ${error && error.message ? error.message : error}`, true);
    } finally {
      await renderShareToggle(item);
    }
  }

  function selectedItem() {
    return items.find((entry) => entry.id === selectedId);
  }

  async function handleInsert() {
    const item = selectedItem();
    if (!item) return;
    const html = typeof wrapContentInsertSpacing === 'function' ? wrapContentInsertSpacing(item.html) : item.html;
    await pasteCustomHtml(html, `${item.title} pasted into the Canvas editor.`);
  }

  async function handleCopy() {
    const item = selectedItem();
    if (!item) return;
    await navigator.clipboard.writeText(item.html);
    notify(`${item.title} HTML copied to the clipboard.`, false);
  }

  async function handleRemove() {
    const item = selectedItem();
    if (!item) return;
    if (!removeArmed) {
      removeArmed = true;
      removeButton.textContent = 'Click again to remove';
      removeButton.classList.add('is-armed');
      setTimeout(() => { if (removeArmed) resetRemoveButton(); }, 4000);
      return;
    }
    removeButton.disabled = true;
    try {
      // Removing an item locally used to leave its shared copy live in the
      // team folder forever. Take it out of Team Stuff first, while we still
      // have the item's details; a failure here must not block the removal.
      const team = window.CCBETeamStuff;
      if (team && (await team.getToken())) {
        try {
          const author = (await store.getAuthorName()) || (await team.getUser());
          await team.unshareItem(item, author);
          if (window.CCBETeamStuffUI) window.CCBETeamStuffUI.reload();
        } catch (error) {
          notify(`Removed locally, but it is still shared in Team Stuff: ${error && error.message ? error.message : error}`, true);
        }
      }
      const result = await store.removeItem(item.id);
      selectedId = null;
      await refresh();
      showView('main');
      const state = await store.getFolderState();
      let message = `“${item.title}” removed from My Stuff.`;
      if (state.status === 'granted' && result.removedFromFolder) message = `“${item.title}” removed from My Stuff and the ${store.FOLDER_NAME} folder.`;
      else if (state.handle) message += ' The file will be deleted from your folder the next time it syncs.';
      notify(message, false);
    } catch (error) {
      notify(`Could not remove: ${error && error.message ? error.message : error}`, true);
    } finally {
      removeButton.disabled = false;
      resetRemoveButton();
    }
  }

  // ---- Wire up -----------------------------------------------------------
  // Opens the File sharing controls in the popup's own folder view.
  $('myStuffSharingButton').addEventListener('click', openSharing);

  $('myStuffAddButton').addEventListener('click', openAddForm);
  $('myStuffEmptyAddButton').addEventListener('click', openAddForm);
  $('myStuffAddBack').addEventListener('click', closeForm);
  $('myStuffCancelButton').addEventListener('click', closeForm);
  editButton.addEventListener('click', () => { if (selectedId) openEditForm(selectedId); });
  $('myStuffDetailBack').addEventListener('click', () => showView('main'));
  folderButton.addEventListener('click', openFolderSettings);
  $('myStuffFolderBack').addEventListener('click', () => showView('main'));
  $('myStuffSharingBack').addEventListener('click', () => showView('main'));
  $('myStuffFolderTabLink').addEventListener('click', (event) => { event.preventDefault(); openFolderPage(); });
  form.addEventListener('submit', handleSave);
  htmlInput.addEventListener('input', schedulePreview);
  searchInput.addEventListener('input', renderGrid);
  typeFilter.addEventListener('change', renderGrid);
  insertButton.addEventListener('click', handleInsert);
  copyButton.addEventListener('click', handleCopy);
  removeButton.addEventListener('click', handleRemove);
  if (shareToggle) shareToggle.addEventListener('click', handleShareToggle);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes[store.ITEMS_KEY] || changes[store.PENDING_DELETES_KEY]) refresh();
  });

  // Quietly catch up on any pending folder writes/deletes when the popup opens.
  // Show saved items right away; folder sync runs in the background.
  refresh();
  store.syncAll().catch(() => {}).finally(refresh);
})();
