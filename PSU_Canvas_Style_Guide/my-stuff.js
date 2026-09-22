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
  const folderUi = window.CCBEMyStuffFolderUI ? window.CCBEMyStuffFolderUI.mount($('myStuffFolderSettings')) : null;
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
    window.scrollTo({ top: 0 });
  }

  function openFolderPage() {
    chrome.tabs.create({ url: chrome.runtime.getURL('my-stuff-folder.html') });
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
      const text = `${item.title} ${item.desc} ${item.type}`.toLowerCase();
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
    saveButton.textContent = 'Save';
    formBackButton.textContent = '← Back to My Stuff';
    formPreview.srcdoc = previewDoc('<p style="color:#5f6f7a;">Paste HTML to see a preview.</p>');
    showView('add');
    titleInput.focus();
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
    saveButton.textContent = 'Save Changes';
    formBackButton.textContent = '← Back to item';
    formPreview.srcdoc = previewDoc(item.html);
    showView('add');
    titleInput.focus();
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
    detailMeta.textContent = `${store.TYPES[item.type] || 'Element'} · ${item.fileName}`;
    detailPreview.srcdoc = previewDoc(item.html);
    insertButton.textContent = item.type === 'page' ? 'Insert Page' : 'Insert Element';
    showView('detail');
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
  $('myStuffAddButton').addEventListener('click', openAddForm);
  $('myStuffEmptyAddButton').addEventListener('click', openAddForm);
  $('myStuffAddBack').addEventListener('click', closeForm);
  $('myStuffCancelButton').addEventListener('click', closeForm);
  editButton.addEventListener('click', () => { if (selectedId) openEditForm(selectedId); });
  $('myStuffDetailBack').addEventListener('click', () => showView('main'));
  folderButton.addEventListener('click', openFolderSettings);
  $('myStuffFolderBack').addEventListener('click', () => showView('main'));
  $('myStuffFolderTabLink').addEventListener('click', (event) => { event.preventDefault(); openFolderPage(); });
  form.addEventListener('submit', handleSave);
  htmlInput.addEventListener('input', schedulePreview);
  searchInput.addEventListener('input', renderGrid);
  typeFilter.addEventListener('change', renderGrid);
  insertButton.addEventListener('click', handleInsert);
  copyButton.addEventListener('click', handleCopy);
  removeButton.addEventListener('click', handleRemove);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes[store.ITEMS_KEY] || changes[store.PENDING_DELETES_KEY]) refresh();
  });

  // Quietly catch up on any pending folder writes/deletes when the popup opens.
  // Show saved items right away; folder sync runs in the background.
  refresh();
  store.syncAll().catch(() => {}).finally(refresh);
})();
