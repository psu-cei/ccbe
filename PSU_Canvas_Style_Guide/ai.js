// CEI Style Guide — AI Page Assistant
// Analyzes the open Canvas editor page with the user's ChatGPT account
// (OpenAI API key) and generates pedagogical recommendations plus a modern
// PSU-styled redesign that can be inserted back into the Canvas editor.
// Users without a key can copy the full prompt into Penn State AI Studio.
//
// Depends on globals from popup.js: pasteCustomHtml, wrapContentInsertSpacing, setStatus.

(function () {
  'use strict';

  const DEFAULT_MODEL = 'gpt-4o';

  const STYLE_GUIDE_PROMPT = `
DESIGN SYSTEM (PSU Canvas Style Guide) — the redesigned HTML MUST follow these rules:
- Inline styles only. Canvas strips <style>, <script>, <link>, and on* attributes. Never use classes for styling.
- Never set font-family — inserted content must inherit Canvas's own font. Body text color #2D3B45; line-height:1.55; muted text #5F6F7A.
- Brand navy #1E407C for all headings and card titles. Accent blue #0072CE. Callout tint #CCF0FF. Card border #D7DBE0.
- Start content at <h2> (Canvas supplies the page <h1>). Section h2: font-size:30px; color:#1E407C; margin:0 0 16px.
- Core card: <div style="flex:1 1 220px; min-width:220px; background:#ffffff; border:1px solid #d7dbe0; border-radius:10px; padding:18px; box-shadow:0 2px 8px rgba(0,0,0,.08);">
- Card rows: <div style="display:flex; flex-wrap:wrap; gap:18px; align-items:stretch;"> so columns stack on small screens.
- Hero opener: <div style="background:linear-gradient(135deg,#1e407c 0%,#0072ce 100%); color:#ffffff; padding:30px 26px; border-radius:10px; margin:0 0 22px;"> with one short paragraph.
- Numbered steps: navy filled circle badge (~44px, background:#1E407C, color:#fff, border-radius:50%, display:inline-flex, align-items:center, justify-content:center, width:44px, height:44px, font-weight:700) at top of a card, title below in navy.
- Callout/aside: background:#CCF0FF; border-left:6px solid #0072CE; border-radius:10px; padding:22px.
- FAQ / show-hide: use native <details style="background:#ffffff; border:1px solid #d7dbe0; border-radius:8px; padding:12px 16px; margin-bottom:10px;"><summary style="cursor:pointer; color:#1e407c; font-weight:700;">…</summary>…</details>.
- Links: descriptive text, underlined, color #0072CE. Never "click here".
- Preserve every existing link href, iframe embed, and image src from the original content. Keep or add meaningful alt text.
- Contrast 4.5:1 minimum; never place small text on the navy gradient.`;

  const PEDAGOGY_PROMPT = `
PEDAGOGICAL STANDARDS to evaluate against (Quality Matters / backward design / UDL):
1. Clear learning objectives stated up front, measurable verbs, aligned to activities and assessments.
2. Chunking: content broken into scannable sections with real headings in logical order; no walls of text.
3. Explicit instructions: what to do, in what order, where to submit, when it is due.
4. Alignment: every activity/resource ties to an objective; remove or flag orphan content.
5. Engagement: active learning (practice, reflection, discussion) not just consumption.
6. Multiple means of representation (text + video + visual) and clear estimated time-on-task where possible.
7. Accessibility: heading hierarchy, alt text, descriptive links, no color-only meaning.
8. Learner support: where to get help, contact info, or FAQ when relevant.`;

  function buildSystemPrompt() {
    return `You are an instructional design assistant for Penn State Canvas courses. You analyze existing Canvas page HTML, recommend improvements based on pedagogical standards, and rewrite the page with a modern card-based layout.
${PEDAGOGY_PROMPT}
${STYLE_GUIDE_PROMPT}

Respond with ONLY a JSON object, no markdown fences, in exactly this shape:
{
  "recommendations": [
    {"category": "Objectives|Structure|Instructions|Engagement|Accessibility|Layout", "issue": "what is weak in the current page", "suggestion": "specific fix applied or recommended"}
  ],
  "html": "the complete redesigned page HTML using only inline styles"
}
Keep all original subject-matter content and links; improve structure, clarity, and presentation. Do not invent facts, due dates, or links. Where content is missing (e.g., no objectives), include a clearly marked placeholder such as [Add learning objective]. 3 to 7 recommendations.`;
  }

  function buildUserPrompt(pageTitle, pageHtml) {
    return `Canvas page title: ${pageTitle || '(untitled)'}

Current page HTML from the Canvas editor:
"""
${pageHtml}
"""

Analyze this page, then return the JSON described in your instructions.`;
  }

  // ---------- DOM refs ----------
  const el = (id) => document.getElementById(id);
  const badge = el('aiConnectionBadge');
  const keyInput = el('aiApiKey');
  const modelInput = el('aiModel');
  const connectButton = el('aiConnectButton');
  const disconnectButton = el('aiDisconnectButton');
  const settingsToggle = el('aiSettingsToggle');
  const settingsProviderLabel = el('aiSettingsProviderLabel');
  const analyzeButton = el('aiAnalyzeButton');
  const resultsSection = el('aiResults');
  const recommendationList = el('aiRecommendationList');
  const previewFrame = el('aiPreviewFrame');
  const insertCursorButton = el('aiInsertCursorButton');
  const replacePageButton = el('aiReplacePageButton');
  const copyHtmlButton = el('aiCopyHtmlButton');
  const aiStudioFallbackLink = el('aiStudioFallbackLink');
  const statusMessage = el('aiStatusMessage');

  if (!analyzeButton) return; // panel not present

  // Visible status inside the AI panel (the global #status bar is hidden by default).
  function setAiStatus(message, isError) {
    if (statusMessage) {
      statusMessage.hidden = !message;
      statusMessage.textContent = message || '';
      statusMessage.classList.toggle('is-error', Boolean(isError));
    }
    try { setStatus(message, isError); } catch (error) {}
  }

  let state = {
    key: '',
    model: DEFAULT_MODEL,
    generatedHtml: ''
  };

  // ---------- storage ----------
  // Falls back to localStorage if the chrome.storage permission isn't active
  // yet (e.g., the extension hasn't been reloaded after a manifest update).
  const storageArea = (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) ? chrome.storage.local : null;
  const LOCAL_FALLBACK_KEY = 'ceiAiSettings';

  async function loadSettings() {
    let stored = {};
    try {
      if (storageArea) {
        stored = await storageArea.get(['aiKeyOpenAI', 'aiModelOpenAI']);
      } else {
        stored = JSON.parse(localStorage.getItem(LOCAL_FALLBACK_KEY) || '{}');
      }
    } catch (error) {
      stored = {};
    }
    state.key = stored.aiKeyOpenAI || '';
    state.model = stored.aiModelOpenAI || DEFAULT_MODEL;
  }

  async function saveSettings() {
    const payload = {
      aiKeyOpenAI: state.key,
      aiModelOpenAI: state.model
    };
    try {
      if (storageArea) {
        await storageArea.set(payload);
      } else {
        localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(payload));
      }
    } catch (error) {
      // Persisting failed; keep working with in-memory state.
    }
  }

  // ---------- UI sync ----------
  function syncProviderUi() {
    keyInput.value = state.key;
    modelInput.value = state.model;
    modelInput.placeholder = DEFAULT_MODEL;
    settingsProviderLabel.textContent = state.key ? 'ChatGPT · connected' : '';
    syncConnectionBadge();
  }

  function syncConnectionBadge() {
    const connected = Boolean(state.key);
    badge.textContent = connected ? 'Connected · ChatGPT' : 'Not connected';
    badge.classList.toggle('is-connected', connected);
    disconnectButton.hidden = !connected;
    if (settingsToggle) settingsToggle.open = !connected;
  }

  // ---------- key validation ----------
  async function validateKey(key) {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` }
    });
    if (response.status === 401 || response.status === 403) throw new Error('Invalid OpenAI API key.');
    if (!response.ok) throw new Error(`OpenAI error: HTTP ${response.status}`);
    return true;
  }

  // ---------- provider call ----------
  async function callOpenAi(key, model, systemPrompt, userPrompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model,
        max_tokens: 8000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = body && body.error && body.error.message ? body.error.message : `HTTP ${response.status}`;
      throw new Error(`ChatGPT: ${message}`);
    }
    const text = body.choices && body.choices[0] && body.choices[0].message ? body.choices[0].message.content : '';
    if (!text) throw new Error('ChatGPT returned an empty response.');
    return text;
  }

  function parseAiJson(text) {
    let cleaned = String(text).trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) throw new Error('AI response was not valid JSON.');
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    if (!parsed || typeof parsed.html !== 'string' || !Array.isArray(parsed.recommendations)) {
      throw new Error('AI response was missing recommendations or html.');
    }
    return parsed;
  }

  function sanitizeGeneratedHtml(html) {
    const temp = document.createElement('div');
    temp.innerHTML = String(html);
    temp.querySelectorAll('script, style, link, meta').forEach((node) => node.remove());
    temp.querySelectorAll('*').forEach((node) => {
      Array.from(node.attributes).forEach((attribute) => {
        if (/^on/i.test(attribute.name)) node.removeAttribute(attribute.name);
        if (attribute.name === 'href' || attribute.name === 'src') {
          const value = attribute.value.trim().toLowerCase();
          if (value.startsWith('javascript:')) node.removeAttribute(attribute.name);
        }
      });
    });
    return temp.innerHTML;
  }

  // ---------- Canvas editor content ----------
  async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) throw new Error('Could not find the active Canvas tab.');
    return tab;
  }

  async function readEditorContent(tabId) {
    const results = await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      world: 'MAIN',
      func: () => {
        try {
          if (window.tinymce) {
            const active = window.tinymce.activeEditor;
            if (active && !active.isHidden()) return active.getContent();
            const editors = Array.from(window.tinymce.editors || []);
            for (const editor of editors) {
              if (editor && !editor.isHidden()) return editor.getContent();
            }
          }
        } catch (error) {}
        const editable = document.querySelector('body.mce-content-body, body[contenteditable="true"], [contenteditable="true"]');
        if (editable) return editable.innerHTML;
        const textarea = document.querySelector('textarea[name="wiki_page[body]"], textarea[id*="wiki_page_body"], textarea[id*="discussion_topic_message"], textarea[id*="assignment_description"]');
        if (textarea && textarea.value) return textarea.value;
        return '';
      }
    });

    const html = (results || [])
      .map((result) => (result && typeof result.result === 'string' ? result.result.trim() : ''))
      .find((value) => value.length > 0);

    if (!html) {
      throw new Error('No editor content found. Open a Canvas page in Edit mode, click inside the editor, then try again.');
    }
    return html;
  }

  async function replaceEditorContent(tabId, html) {
    const results = await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      world: 'MAIN',
      func: (newHtml) => {
        try {
          if (window.tinymce) {
            const active = window.tinymce.activeEditor;
            const editor = (active && !active.isHidden())
              ? active
              : Array.from(window.tinymce.editors || []).find((candidate) => candidate && !candidate.isHidden());
            if (editor) {
              editor.setContent(newHtml);
              editor.save();
              editor.fire('change');
              editor.fire('keyup');
              return true;
            }
          }
        } catch (error) {}
        const editable = document.querySelector('body.mce-content-body, body[contenteditable="true"], [contenteditable="true"]');
        if (editable) {
          editable.innerHTML = newHtml;
          ['input', 'change', 'keyup'].forEach((name) => {
            try { editable.dispatchEvent(new Event(name, { bubbles: true })); } catch (error) {}
          });
          return true;
        }
        const textarea = document.querySelector('textarea[name="wiki_page[body]"], textarea[id*="wiki_page_body"], textarea[id*="discussion_topic_message"], textarea[id*="assignment_description"]');
        if (textarea) {
          textarea.value = newHtml;
          ['input', 'change'].forEach((name) => {
            try { textarea.dispatchEvent(new Event(name, { bubbles: true })); } catch (error) {}
          });
          return true;
        }
        return false;
      },
      args: [html]
    });

    return Array.isArray(results) && results.some((result) => result && result.result === true);
  }

  // ---------- results rendering ----------
  function renderResults(parsed) {
    recommendationList.innerHTML = '';
    parsed.recommendations.forEach((rec) => {
      const item = document.createElement('li');
      const category = document.createElement('strong');
      category.textContent = `${rec.category || 'General'}: `;
      item.appendChild(category);
      item.appendChild(document.createTextNode(`${rec.issue || ''} — ${rec.suggestion || ''}`));
      recommendationList.appendChild(item);
    });

    previewFrame.srcdoc = `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:12px; font-family:Arial,Helvetica,sans-serif; color:#2d3b45;">${state.generatedHtml}</body></html>`;
    resultsSection.hidden = false;
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---------- events ----------
  modelInput.addEventListener('change', () => {
    state.model = modelInput.value.trim() || DEFAULT_MODEL;
    saveSettings();
  });

  connectButton.addEventListener('click', async () => {
    const key = keyInput.value.trim();
    if (!key) {
      setAiStatus('Paste an OpenAI API key first.', true);
      return;
    }
    connectButton.disabled = true;
    connectButton.textContent = 'Checking…';
    try {
      await validateKey(key);
      state.key = key;
      state.model = modelInput.value.trim() || DEFAULT_MODEL;
      syncProviderUi();
      saveSettings();
      setAiStatus('ChatGPT connected. Open a Canvas page in Edit mode, then click Analyze.', false);
    } catch (error) {
      setAiStatus(`Could not connect: ${error.message}`, true);
    } finally {
      connectButton.disabled = false;
      connectButton.textContent = 'Connect';
    }
  });

  disconnectButton.addEventListener('click', () => {
    state.key = '';
    keyInput.value = '';
    syncProviderUi();
    saveSettings();
    setAiStatus('OpenAI API key removed.', false);
  });

  analyzeButton.addEventListener('click', async () => {
    if (!state.key) {
      if (settingsToggle) settingsToggle.open = true;
      setAiStatus('Connect your ChatGPT account first, or use the AI Studio option below.', true);
      return;
    }

    analyzeButton.disabled = true;
    analyzeButton.textContent = 'Analyzing page…';
    resultsSection.hidden = true;

    try {
      const tab = await getActiveTab();
      const pageHtml = await readEditorContent(tab.id);

      analyzeButton.textContent = 'Asking ChatGPT…';
      const systemPrompt = buildSystemPrompt();
      const userPrompt = buildUserPrompt(tab.title, pageHtml);

      const rawText = await callOpenAi(state.key, state.model, systemPrompt, userPrompt);

      const parsed = parseAiJson(rawText);
      state.generatedHtml = sanitizeGeneratedHtml(parsed.html);
      renderResults(parsed);
      setAiStatus('AI analysis complete. Review the recommendations and preview, then insert.', false);
    } catch (error) {
      setAiStatus(error.message || 'AI analysis failed.', true);
    } finally {
      analyzeButton.disabled = false;
      analyzeButton.textContent = 'Analyze Page & Generate Redesign';
    }
  });

  insertCursorButton.addEventListener('click', async () => {
    if (!state.generatedHtml) return;
    await pasteCustomHtml(wrapContentInsertSpacing(state.generatedHtml), 'AI layout pasted into the Canvas editor.');
  });

  replacePageButton.addEventListener('click', async () => {
    if (!state.generatedHtml) return;
    replacePageButton.disabled = true;
    try {
      const tab = await getActiveTab();
      const replaced = await replaceEditorContent(tab.id, state.generatedHtml);
      if (replaced) {
        setAiStatus('Page content replaced in the Canvas editor. Review, then save the page in Canvas.', false);
        setTimeout(() => window.close(), 700);
      } else {
        await navigator.clipboard.writeText(state.generatedHtml);
        setAiStatus('Could not replace automatically, so the HTML was copied. Select all in the editor and paste.', true);
      }
    } catch (error) {
      setAiStatus(error.message || 'Replace failed.', true);
    } finally {
      replacePageButton.disabled = false;
    }
  });

  copyHtmlButton.addEventListener('click', async () => {
    if (!state.generatedHtml) return;
    await navigator.clipboard.writeText(state.generatedHtml);
    setAiStatus('Generated HTML copied to the clipboard.', false);
  });

  // AI Studio fallback: copy a full prompt (instructions + page content), open AI Studio.
  aiStudioFallbackLink.addEventListener('click', async (event) => {
    event.preventDefault();
    try {
      const tab = await getActiveTab();
      let pageHtml = '';
      try {
        pageHtml = await readEditorContent(tab.id);
      } catch (error) {
        pageHtml = '(Paste your Canvas page content here)';
      }
      const prompt = `${buildSystemPrompt()}\n\n${buildUserPrompt(tab.title, pageHtml)}`;
      await navigator.clipboard.writeText(prompt);
      setAiStatus('Prompt copied. Paste it into AI Studio, then copy the returned HTML back via the Copy HTML workflow.', false);
      chrome.tabs.create({ url: 'https://aistudio.psu.edu/chat/onechat' });
    } catch (error) {
      setAiStatus(error.message || 'Could not build the AI Studio prompt.', true);
    }
  });

  // ---------- init ----------
  loadSettings().then(syncProviderUi).catch(() => syncProviderUi());
})();
