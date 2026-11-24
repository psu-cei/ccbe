// ---------------------------------------------------------------------------
// Team Stuff storage: the shared folder in the team's GitHub repo.
//
// Reading needs no credentials because psu-cei/ccbe is public, so a teammate
// who has not connected a token can still browse and insert. Writing needs a
// fine-grained personal access token with Contents: read and write on that one
// repo, which each person creates and pastes in once.
//
// IMPORTANT: the repo is public. Anything shared here is readable by anyone on
// the internet, not just the CEI team.
// ---------------------------------------------------------------------------
(function () {
  const TOKEN_KEY = 'ccbeTeamToken';
  const USER_KEY = 'ccbeTeamUser';
  const CACHE_KEY = 'ccbeTeamCache';

  const REPO = 'psu-cei/ccbe';
  const DIR = 'assets/shared';
  const BRANCH = 'main';
  const API = 'https://api.github.com';

  const MARK_START = '<!-- ccbe:my-stuff:start -->';
  const MARK_END = '<!-- ccbe:my-stuff:end -->';
  const TYPES = { page: 'Page', element: 'Element' };

  // ---- Token ------------------------------------------------------------
  async function getToken() {
    const stored = await chrome.storage.local.get(TOKEN_KEY);
    return typeof stored[TOKEN_KEY] === 'string' ? stored[TOKEN_KEY] : '';
  }

  async function getUser() {
    const stored = await chrome.storage.local.get(USER_KEY);
    return typeof stored[USER_KEY] === 'string' ? stored[USER_KEY] : '';
  }

  function clearToken() {
    return chrome.storage.local.remove([TOKEN_KEY, USER_KEY]);
  }

  // ---- Requests ---------------------------------------------------------
  // The token is sent on reads too. Unauthenticated GitHub allows only 60
  // requests an hour per IP, which a few panel refreshes would burn through;
  // with a token the ceiling is 5000.
  async function request(path, options = {}) {
    const token = await getToken();
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {})
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (options.body) headers['Content-Type'] = 'application/json';

    const response = await fetch(`${API}${path}`, { ...options, headers });

    if (response.status === 401) throw new Error('GitHub rejected the token. It may have expired or been revoked.');
    if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
      const reset = Number(response.headers.get('X-RateLimit-Reset') || 0) * 1000;
      const wait = reset ? Math.max(1, Math.round((reset - Date.now()) / 60000)) : 0;
      throw new Error(
        token
          ? `GitHub rate limit reached. Try again in about ${wait} minutes.`
          : `GitHub rate limit reached for unauthenticated use. Connect a token, or try again in about ${wait} minutes.`
      );
    }
    if (response.status === 404) throw new Error('Not found on GitHub. Check the repo and folder still exist.');
    if (!response.ok) {
      let detail = '';
      try { detail = (await response.json()).message || ''; } catch (error) { /* no JSON body */ }
      throw new Error(`GitHub returned ${response.status}${detail ? `: ${detail}` : ''}.`);
    }
    return response.status === 204 ? null : response.json();
  }

  // Confirms the token works AND can actually write to this repo, so the user
  // finds out now rather than when their first share fails.
  async function connect(rawToken) {
    const token = String(rawToken || '').trim();
    if (!token) throw new Error('Paste a token first.');
    await chrome.storage.local.set({ [TOKEN_KEY]: token });
    try {
      const me = await request('/user');
      const repo = await request(`/repos/${REPO}`);
      if (!repo.permissions || !repo.permissions.push) {
        await clearToken();
        throw new Error(`The token works, but ${me.login} does not have write access to ${REPO}. Ask an owner of psu-cei to grant it.`);
      }
      await chrome.storage.local.set({ [USER_KEY]: me.login });
      return { login: me.login, canWrite: true };
    } catch (error) {
      // Never leave a token behind that we could not verify.
      if (await getToken()) {
        const me = await getUser();
        if (!me) await clearToken();
      }
      throw error;
    }
  }

  // ---- Encoding ---------------------------------------------------------
  // The Contents API carries file bodies as base64, and btoa only handles
  // Latin-1, so round-trip through UTF-8 bytes to survive accents and dashes.
  function toBase64(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }

  function fromBase64(base64) {
    const binary = atob(String(base64 || '').replace(/\s/g, ''));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
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

  // The author's name goes in the file name as well as the metadata, so the
  // GitHub folder listing is readable without opening anything.
  function sharedFileName(item, author) {
    return `${item.type}-${slugify(author || 'unknown')}-${slugify(item.title)}-${item.id}.html`;
  }

  function buildSharedFile(item, author, githubUser, shared) {
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
<meta name="ccbe-github-user" content="${escapeAttr(githubUser)}">
<meta name="ccbe-shared" content="${shared ? 'true' : 'false'}">
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

  function parseSharedFile(text, fileName) {
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const meta = (name) => (doc.querySelector(`meta[name="${name}"]`) || {}).content || '';
    const start = text.indexOf(MARK_START);
    const end = text.lastIndexOf(MARK_END);
    const html = (start !== -1 && end > start)
      ? text.slice(start + MARK_START.length, end).trim()
      : (doc.body ? doc.body.innerHTML.trim() : '');
    if (!html) return null;
    const createdAt = meta('ccbe-created') || '';
    return {
      id: meta('ccbe-id') || fileName,
      type: TYPES[meta('ccbe-type')] ? meta('ccbe-type') : 'element',
      title: meta('ccbe-title') || doc.title || fileName.replace(/\.html?$/i, ''),
      desc: meta('ccbe-description'),
      author: meta('ccbe-author'),
      githubUser: meta('ccbe-github-user'),
      // Files written before this feature existed carry no ccbe-shared tag.
      // Treat those as shared, since someone put them in the folder on purpose.
      shared: meta('ccbe-shared') !== 'false',
      html,
      fileName,
      createdAt,
      updatedAt: meta('ccbe-updated') || createdAt
    };
  }

  // ---- Reading ----------------------------------------------------------
  async function readCache() {
    const stored = await chrome.storage.local.get(CACHE_KEY);
    return (stored[CACHE_KEY] && typeof stored[CACHE_KEY] === 'object') ? stored[CACHE_KEY] : {};
  }

  async function listFiles() {
    const entries = await request(`/repos/${REPO}/contents/${DIR}?ref=${BRANCH}`);
    if (!Array.isArray(entries)) return [];
    return entries.filter((entry) => entry.type === 'file' && /\.html?$/i.test(entry.name));
  }

  // Every file's blob sha changes whenever its bytes change, so a sha we have
  // already parsed can be served from cache and never re-fetched.
  async function loadAll() {
    const files = await listFiles();
    const cache = await readCache();
    const nextCache = {};
    const items = [];
    let fetched = 0;

    // A file that fails to fetch or parse used to be dropped silently, which
    // made "4 files in the folder, 2 items on screen" impossible to diagnose.
    // Collect the failures and hand them back so the panel can say so.
    const problems = [];

    for (const file of files) {
      let item = cache[file.sha];
      if (!item) {
        try {
          const blob = await request(`/repos/${REPO}/contents/${encodeURI(file.path)}?ref=${BRANCH}`);
          item = parseSharedFile(fromBase64(blob.content), file.name);
          fetched += 1;
          if (!item) problems.push(`${file.name}: no content between the ccbe markers`);
        } catch (error) {
          problems.push(`${file.name}: ${error && error.message ? error.message : error}`);
          continue;
        }
      }
      if (!item) continue;
      nextCache[file.sha] = item;
      items.push({ ...item, sha: file.sha, path: file.path });
    }

    await chrome.storage.local.set({ [CACHE_KEY]: nextCache });
    const visible = items.filter((item) => item.shared);
    visible.sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
    return {
      items: visible,
      total: files.length,
      hidden: items.length - visible.length,
      fetched,
      problems
    };
  }

  // ---- Writing ----------------------------------------------------------
  async function findExisting(item, author) {
    const files = await listFiles();
    const wanted = sharedFileName(item, author);
    // Match on the id first: a renamed item keeps its id but changes file name.
    const byName = files.find((file) => file.name === wanted);
    if (byName) return byName;
    return files.find((file) => file.name.endsWith(`-${item.id}.html`)) || null;
  }

  async function put(path, text, message, sha) {
    return request(`/repos/${REPO}/contents/${encodeURI(path)}`, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: toBase64(text),
        branch: BRANCH,
        ...(sha ? { sha } : {})
      })
    });
  }

  async function shareItem(item, author) {
    const token = await getToken();
    if (!token) throw new Error('Connect your GitHub token before sharing.');
    const githubUser = await getUser();
    const existing = await findExisting(item, author);
    const fileName = sharedFileName(item, author);
    const path = `${DIR}/${fileName}`;
    const text = buildSharedFile(item, author, githubUser, true);

    // A rename leaves the old file behind, so flag it hidden rather than
    // deleting it; the team agreed shared files stay in the repo.
    if (existing && existing.name !== fileName) {
      const old = await request(`/repos/${REPO}/contents/${encodeURI(existing.path)}?ref=${BRANCH}`);
      const oldItem = parseSharedFile(fromBase64(old.content), existing.name);
      if (oldItem) {
        await put(existing.path, buildSharedFile(oldItem, oldItem.author, oldItem.githubUser, false),
          `Hide renamed shared item: ${oldItem.title}`, existing.sha);
      }
    }

    await put(path, text, `Share ${item.type}: ${item.title}`, existing && existing.name === fileName ? existing.sha : undefined);
    await chrome.storage.local.remove(CACHE_KEY);
    return { fileName, path };
  }

  // Rewrites the file with ccbe-shared false. The file and its history stay in
  // the repo; Team Stuff simply stops listing it.
  async function unshareItem(item, author) {
    const token = await getToken();
    if (!token) throw new Error('Connect your GitHub token before changing what you share.');
    const existing = await findExisting(item, author);
    if (!existing) return { hidden: false };

    const blob = await request(`/repos/${REPO}/contents/${encodeURI(existing.path)}?ref=${BRANCH}`);
    const current = parseSharedFile(fromBase64(blob.content), existing.name);
    if (!current) throw new Error('That shared file could not be read.');

    await put(existing.path, buildSharedFile(current, current.author, current.githubUser, false),
      `Unshare ${current.type}: ${current.title}`, existing.sha);
    await chrome.storage.local.remove(CACHE_KEY);
    return { hidden: true };
  }

  // Which of this user's own items are currently live in the shared folder.
  //
  // This has to read the files, not their names. Whether an item is shared
  // lives in its ccbe-shared meta tag; an earlier version guessed from the
  // file name, which cannot see that tag, so an item that had just been
  // unshared still reported as shared and the toggle snapped back on.
  // loadAll already parses and caches by blob sha, so repeat calls cost one
  // directory listing.
  async function getSharedIds() {
    try {
      const { items } = await loadAll();
      return new Set(items.map((item) => item.id));
    } catch (error) {
      return new Set();
    }
  }

  window.CCBETeamStuff = {
    REPO,
    DIR,
    BRANCH,
    folderUrl: `https://github.com/${REPO}/tree/${BRANCH}/${DIR}`,
    tokenUrl: `https://github.com/settings/personal-access-tokens/new`,
    getToken,
    getUser,
    connect,
    clearToken,
    loadAll,
    shareItem,
    unshareItem,
    getSharedIds,
    sharedFileName
  };
})();
