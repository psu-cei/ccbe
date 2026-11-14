(function () {
  const CEI_ICON_STYLE_ID = 'cei-style-guide-icon-size-utilities';
  const CEI_ICON_CSS = "\n/* CEI Style Guide Canvas icon sizing */\n.cei-callout-icon::before,\ni.cei-callout-icon::before,\na.cei-callout-icon::before {\n  font-family: \"InstructureIcons-Line\" !important;\n  display: inline-block !important;\n  vertical-align: top !important;\n  line-height: 1 !important;\n  font-size: 25px !important;\n  text-transform: none !important;\n  font-weight: normal !important;\n  font-style: normal !important;\n}\n.cei-asset-icon-50::before,\ni.cei-asset-icon-50::before,\na.cei-asset-icon-50::before {\n  font-family: \"InstructureIcons-Line\" !important;\n  display: inline-block !important;\n  width: 50px !important;\n  height: 50px !important;\n  vertical-align: middle !important;\n  line-height: 1 !important;\n  font-size: 50px !important;\n  color: inherit !important;\n  text-transform: none !important;\n  font-weight: normal !important;\n  font-style: normal !important;\n}\n";

  function injectCanvasIconStyles(doc = document) {
    if (!doc || !doc.head) return;

    try {
      const sourceDoc = window.parent && window.parent.document ? window.parent.document : document;
      const parentLinks = Array.from(sourceDoc.querySelectorAll('link[rel~="stylesheet"][href]'));
      parentLinks
        .filter((link) => /common-|instructure|canvas/i.test(link.href))
        .forEach((link) => {
          const alreadyAdded = Array.from(doc.querySelectorAll('link[data-cei-canvas-icon-css]'))
            .some((existing) => existing.getAttribute('data-cei-canvas-icon-css') === link.href);
          if (alreadyAdded) return;
          const clone = doc.createElement('link');
          clone.rel = 'stylesheet';
          clone.href = link.href;
          clone.setAttribute('data-cei-canvas-icon-css', link.href);
          doc.head.appendChild(clone);
        });
    } catch (e) {}

    if (!doc.getElementById(CEI_ICON_STYLE_ID)) {
      const style = doc.createElement('style');
      style.id = CEI_ICON_STYLE_ID;
      style.textContent = CEI_ICON_CSS;
      doc.head.appendChild(style);
    }
  }

  function dispatchEditableEvents(el) {
    if (!el) return;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
  }

  function findTargetHeading(doc) {
    try {
      const sel = doc.getSelection && doc.getSelection();
      if (!sel || !sel.rangeCount) return null;
      let node = sel.getRangeAt(0).startContainer;
      if (node && node.nodeType === 3) node = node.parentNode;
      let el = node;
      while (el && el.tagName) {
        if (/^H[1-6]$/.test(el.tagName)) return el;
        el = el.parentNode;
      }
      const block = node && node.closest ? node.closest('p,div,li,td,section,blockquote') : null;
      const candidates = [];
      if (block) {
        candidates.push(block, block.nextElementSibling, block.previousElementSibling);
      }
      for (const candidate of candidates) {
        if (!candidate || !candidate.tagName) continue;
        if (/^H[1-6]$/.test(candidate.tagName)) return candidate;
        const heading = candidate.querySelector && candidate.querySelector('h1,h2,h3,h4,h5,h6');
        if (heading) return heading;
      }
    } catch (e) {}
    return null;
  }

  function insertIconIntoHeading(doc, html) {
    const heading = findTargetHeading(doc);
    if (!heading) return false;
    const temp = doc.createElement('div');
    temp.innerHTML = String(html).trim();
    let nodes = Array.from(temp.childNodes);
    if (nodes.length === 1 && nodes[0].tagName === 'P') {
      nodes = Array.from(nodes[0].childNodes);
    }
    if (!nodes.length) return false;
    const ref = heading.firstChild;
    nodes.forEach((n) => heading.insertBefore(n, ref));
    return true;
  }

  function insertIntoElement(el, html, insertMode) {
    if (!el) return false;

    const tag = (el.tagName || '').toUpperCase();

    if (tag === 'TEXTAREA' || tag === 'INPUT') {
      el.focus();
      const start = typeof el.selectionStart === 'number' ? el.selectionStart : el.value.length;
      const end = typeof el.selectionEnd === 'number' ? el.selectionEnd : el.value.length;
      el.value = el.value.slice(0, start) + html + el.value.slice(end);
      el.selectionStart = el.selectionEnd = start + html.length;
      dispatchEditableEvents(el);
      return true;
    }

    if (el.isContentEditable || el.getAttribute('contenteditable') === 'true' || tag === 'BODY') {
      const doc = el.ownerDocument || document;
      injectCanvasIconStyles(doc);
      el.focus();
      if (insertMode === 'inline-heading' && insertIconIntoHeading(doc, html)) {
        dispatchEditableEvents(el);
        return true;
      }
      try {
        const selection = doc.getSelection();
        if (selection && selection.rangeCount) {
          selection.deleteFromDocument();
        }
        doc.execCommand('insertHTML', false, html);
      } catch (e) {
        el.insertAdjacentHTML('beforeend', html);
      }
      dispatchEditableEvents(el);
      return true;
    }

    return false;
  }

  function tryTinyMce(win, html, insertMode) {
    try {
      const tinymce = win.tinymce;
      if (!tinymce) return false;

      const editorsToTry = [];
      const active = tinymce.activeEditor;
      if (active && !active.isHidden()) editorsToTry.push(active);
      else Array.from(tinymce.editors || []).forEach((editor) => {
        if (editor && !editor.isHidden()) editorsToTry.push(editor);
      });

      for (const editor of editorsToTry) {
        injectCanvasIconStyles(editor.getDoc && editor.getDoc());
        editor.focus();
        if (insertMode === 'inline-heading' && insertIconIntoHeading(editor.getDoc && editor.getDoc(), html)) {
          editor.save && editor.save();
        } else {
          editor.insertContent(html);
        }
        editor.fire('change');
        editor.fire('keyup');
        return true;
      }
    } catch (e) {}
    return false;
  }

  function findAndInsert(html, insertMode) {
    injectCanvasIconStyles(document);
    if (tryTinyMce(window, html, insertMode)) return true;

    const active = document.activeElement;
    if (insertIntoElement(active, html, insertMode)) return true;

    const selectors = [
      '.tox-edit-area iframe',
      'iframe.tox-edit-area__iframe',
      'iframe[id*="wiki_page_body"]',
      'iframe[id*="discussion-topic-message"]',
      'iframe[id*="assignment_description"]',
      'body.mce-content-body',
      'body[contenteditable="true"]',
      '[contenteditable="true"]',
      'textarea[name="wiki_page[body]"]',
      'textarea[id*="wiki_page_body"]',
      'textarea[id*="discussion_topic_message"]',
      'textarea[id*="assignment_description"]',
      'textarea'
    ];

    for (const selector of selectors) {
      const found = document.querySelector(selector);
      if (!found) continue;

      if ((found.tagName || '').toUpperCase() === 'IFRAME') {
        try {
          const win = found.contentWindow;
          const doc = found.contentDocument || (win && win.document);
          injectCanvasIconStyles(doc);
          if (win && tryTinyMce(win, html, insertMode)) return true;
          const editable = doc && (doc.querySelector('body[contenteditable="true"]') || doc.querySelector('body.mce-content-body'));
          if (insertIntoElement(editable, html, insertMode)) return true;
        } catch (e) {}
      } else if (insertIntoElement(found, html, insertMode)) {
        return true;
      }
    }

    return false;
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || message.type !== 'PSU_INSERT_CANVAS_HTML') return;

    const inserted = findAndInsert(message.html || '', message.insertMode || 'block');

    sendResponse({
      ok: inserted,
      message: inserted
        ? 'Content pasted into the Canvas editor.'
        : 'Could not find an active Canvas editor. Click inside the editor, then try again.'
    });

    return true;
  });

  // CEI Style Guide: Canvas icon size utility classes.
  // Runs inside this IIFE so it can see injectCanvasIconStyles above.
  function addStyle() {
    injectCanvasIconStyles(document);
    document.querySelectorAll('iframe').forEach((iframe) => {
      try {
        injectCanvasIconStyles(iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document));
      } catch (e) {}
    });
  }

  // Debounced so the observer doesn't re-scan every iframe on every DOM mutation.
  let addStyleTimer = null;
  function scheduleAddStyle() {
    if (addStyleTimer) return;
    addStyleTimer = setTimeout(() => {
      addStyleTimer = null;
      addStyle();
    }, 250);
  }

  function startIconStyleObserver() {
    addStyle();
    const observer = new MutationObserver(scheduleAddStyle);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  // content.js runs at document_start, so documentElement may not exist yet.
  if (document.documentElement) {
    startIconStyleObserver();
  } else {
    document.addEventListener('DOMContentLoaded', startIconStyleObserver, { once: true });
  }
})();
