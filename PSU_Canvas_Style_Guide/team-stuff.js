// ---------------------------------------------------------------------------
// Team Stuff panel: browse and insert what teammates have shared.
//
// Reads are anonymous when no token is connected, so a teammate can use the
// panel before they ever set one up. Sharing from My Stuff is what needs the
// token, and that lives in my-stuff.js.
// ---------------------------------------------------------------------------
(function () {
  const store = window.CCBETeamStuff;
  const $ = (id) => document.getElementById(id);

  const mainView = $('teamStuffMainView');
  const detailView = $('teamStuffDetailView');
  const settingsView = $('teamStuffSettingsView');
  if (!store || !mainView) return;

  const statusText = $('teamStuffStatusText');
  const settingsButton = $('teamStuffSettingsButton');
  const searchInput = $('teamStuffSearch');
  const authorFilter = $('teamStuffAuthorFilter');
  const grid = $('teamStuffGrid');
  const emptyState = $('teamStuffEmpty');
  const refreshButton = $('teamStuffRefreshButton');

  const detailBack = $('teamStuffDetailBack');
  const detailTitle = $('teamStuffDetailTitle');
  const detailDesc = $('teamStuffDetailDesc');
  const detailMeta = $('teamStuffDetailMeta');
  const detailPreview = $('teamStuffDetailPreview');
  const insertButton = $('teamStuffInsertButton');
  const copyButton = $('teamStuffCopyButton');
  const saveButton = $('teamStuffSaveButton');

  const settingsBack = $('teamStuffSettingsBack');
  const connState = $('teamStuffConnState');
  const connText = $('teamStuffConnText');
  const tokenInput = $('teamStuffToken');
  const connectButton = $('teamStuffConnect');
  const disconnectButton = $('teamStuffDisconnect');
  const openFolderButton = $('teamStuffOpenFolder');
  const connMessage = $('teamStuffConnMessage');
  const repoName = $('teamStuffRepoName');

  const THUMB_IMAGE = 'assets/images/my-stuff-card.svg';
  const TYPES = { page: 'Page', element: 'Element' };

  let items = [];
  let selectedPath = null;
  let previewTimer = null;

  const notify = (message, isError) => {
    if (typeof setStatus === 'function') setStatus(message, isError);
  };

  function say(message, isError) {
    connMessage.textContent = message || '';
    connMessage.classList.toggle('is-error', Boolean(isError));
  }

  function showView(name) {
    mainView.hidden = name !== 'main';
    detailView.hidden = name !== 'detail';
    settingsView.hidden = name !== 'settings';
    window.scrollTo({ top: 0 });
  }

  function selectedItem() {
    return items.find((item) => item.path === selectedPath) || null;
  }

  function previewDoc(html) {
    return `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:10px; color:#2d3b45;">${html}</body></html>`;
  }

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
    badge.textContent = TYPES[item.type] || 'Element';
    thumb.appendChild(badge);
    return thumb;
  }

  function who(item) {
    return item.author || item.githubUser || 'a teammate';
  }

  function renderAuthorFilter() {
    const current = authorFilter.value;
    const names = Array.from(new Set(items.map(who))).sort((a, b) => a.localeCompare(b));
    authorFilter.innerHTML = '<option value="all">Everyone</option>'
      + names.map((name) => `<option value="${name.replace(/"/g, '&quot;')}">${name}</option>`).join('');
    authorFilter.value = names.includes(current) ? current : 'all';
  }

  function renderGrid() {
    grid.innerHTML = '';
    const query = String(searchInput.value || '').toLowerCase().trim();
    const author = authorFilter.value;
    const visible = items.filter((item) => {
      const matchesAuthor = author === 'all' || who(item) === author;
      const text = `${item.title} ${item.desc} ${item.type} ${who(item)}`.toLowerCase();
      return matchesAuthor && (!query || text.includes(query));
    });

    emptyState.hidden = items.length !== 0;
    grid.hidden = items.length === 0;

    visible.forEach((item) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'layout-card ms-card';
      card.dataset.teamStuffPath = item.path;
      card.appendChild(makeThumb(item));
      const title = document.createElement('strong');
      title.textContent = item.title;
      const badge = document.createElement('span');
      badge.className = 'ms-author-badge';
      badge.textContent = `from ${who(item)}`;
      title.appendChild(badge);
      const desc = document.createElement('small');
      desc.textContent = item.desc || 'No description';
      card.appendChild(title);
      card.appendChild(desc);
      card.addEventListener('click', () => openDetail(item.path));
      grid.appendChild(card);
    });

    if (items.length && !visible.length) {
      const none = document.createElement('div');
      none.className = 'no-results';
      none.textContent = 'No matching items found.';
      grid.appendChild(none);
    }

    if (typeof applyLayoutView === 'function') applyLayoutView();
  }

  function openDetail(path) {
    selectedPath = path;
    const item = selectedItem();
    if (!item) return;
    detailTitle.textContent = item.title;
    detailDesc.textContent = item.desc || 'No description';
    const when = item.updatedAt ? new Date(item.updatedAt) : null;
    const dateText = when && !Number.isNaN(when.valueOf()) ? ` · updated ${when.toLocaleDateString()}` : '';
    detailMeta.textContent = `${TYPES[item.type] || 'Element'} · shared by ${who(item)}${dateText}`;
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => { detailPreview.srcdoc = previewDoc(item.html); }, 60);
    showView('detail');
  }

  // ---- Loading ----------------------------------------------------------
  async function load({ force = false } = {}) {
    statusText.textContent = 'Loading the team folder…';
    try {
      const result = await store.loadAll();
      items = result.items;
      renderAuthorFilter();
      renderGrid();
      const count = items.length;
      const people = new Set(items.map(who)).size;
      let text = count
        ? `${count} shared item${count === 1 ? '' : 's'} from ${people} ${people === 1 ? 'person' : 'people'}.`
        : 'No shared items yet.';
      // Say so when the folder holds more files than the panel can show,
      // rather than quietly displaying fewer items than exist.
      if (result.hidden) text += ` ${result.hidden} hidden.`;
      if (result.problems && result.problems.length) {
        text += ` ${result.problems.length} file${result.problems.length === 1 ? '' : 's'} could not be read.`;
        console.warn('[Team Stuff] files skipped:', result.problems);
      }
      statusText.textContent = text;
    } catch (error) {
      statusText.textContent = error && error.message ? error.message : 'Could not reach GitHub.';
      grid.hidden = true;
      emptyState.hidden = true;
    }
  }

  // ---- Settings ---------------------------------------------------------
  async function renderSettings() {
    const [token, user] = await Promise.all([store.getToken(), store.getUser()]);
    const connected = Boolean(token && user);
    connState.dataset.state = connected ? 'granted' : 'none';
    connText.textContent = connected
      ? `Connected as ${user}. You can share your own items and they will be committed under your GitHub account.`
      : 'Not connected. You can browse and insert everything here; connect a token to share your own items.';
    disconnectButton.hidden = !connected;
    connectButton.textContent = connected ? 'Replace token' : 'Connect';
    tokenInput.value = '';
    tokenInput.placeholder = connected ? 'Paste a new token to replace' : 'github_pat_...';
  }

  async function openSettings() {
    say('');
    await renderSettings();
    showView('settings');
  }

  async function handleConnect() {
    connectButton.disabled = true;
    say('Checking the token with GitHub…');
    try {
      const result = await store.connect(tokenInput.value);
      say(`Connected as ${result.login}. You can now share items from My Stuff.`);
      await renderSettings();
      await load({ force: true });
    } catch (error) {
      say(error && error.message ? error.message : String(error), true);
      await renderSettings();
    } finally {
      connectButton.disabled = false;
    }
  }

  async function handleDisconnect() {
    await store.clearToken();
    say('Token removed from this computer. Nothing was changed on GitHub.');
    await renderSettings();
  }

  // ---- Actions ----------------------------------------------------------
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

  // Optional: keeps a private copy so it survives the teammate unsharing it.
  async function handleSave() {
    const item = selectedItem();
    if (!item || !window.CCBEMyStuff) return;
    saveButton.disabled = true;
    try {
      await window.CCBEMyStuff.addItem({
        type: item.type,
        title: item.title,
        desc: item.desc,
        html: item.html
      });
      notify(`${item.title} saved to My Stuff.`, false);
    } catch (error) {
      notify(`Could not save: ${error && error.message ? error.message : error}`, true);
    } finally {
      saveButton.disabled = false;
    }
  }

  // ---- Wiring -----------------------------------------------------------
  if (repoName) repoName.textContent = store.REPO;
  settingsButton.addEventListener('click', openSettings);
  settingsBack.addEventListener('click', () => showView('main'));
  detailBack.addEventListener('click', () => showView('main'));
  searchInput.addEventListener('input', renderGrid);
  authorFilter.addEventListener('change', renderGrid);
  if (refreshButton) refreshButton.addEventListener('click', () => load({ force: true }));
  insertButton.addEventListener('click', handleInsert);
  copyButton.addEventListener('click', handleCopy);
  if (saveButton) saveButton.addEventListener('click', handleSave);
  connectButton.addEventListener('click', handleConnect);
  disconnectButton.addEventListener('click', handleDisconnect);
  openFolderButton.addEventListener('click', () => chrome.tabs.create({ url: store.folderUrl }));

  window.CCBETeamStuffUI = {
    onShow: () => load(),
    reload: () => load({ force: true })
  };
})();
