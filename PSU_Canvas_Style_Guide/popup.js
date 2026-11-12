const CEI_PUBLIC_ASSET_BASE = 'https://raw.githubusercontent.com/psu-cei/ccbe/main';
const statusEl = document.getElementById('status');
const slider = document.getElementById('panelSlider');

const sliderShell = document.getElementById('sliderShell');
const layoutCategory = document.getElementById('layoutCategory');
const layoutMainView = document.getElementById('layoutMainView');
const layoutOptionsView = document.getElementById('layoutOptionsView');
const layoutOptionsBack = document.getElementById('layoutOptionsBack');
const layoutOptionsTitle = document.getElementById('layoutOptionsTitle');
const layoutOptionsDesc = document.getElementById('layoutOptionsDesc');
const layoutInsertButton = document.getElementById('layoutInsertButton');
const layoutCustomColor = document.getElementById('layoutCustomColor');
const layoutCustomColorHex = document.getElementById('layoutCustomColorHex');
let selectedLayoutKey = null;
let selectedLayoutColor = '#001E44';
const elementCategorySelect = document.getElementById('elementCategorySelect');
const elementMainView = document.getElementById('elementMainView');
const elementOptionsView = document.getElementById('elementOptionsView');
const elementOptionsBack = document.getElementById('elementOptionsBack');
const elementOptionsTitle = document.getElementById('elementOptionsTitle');
const elementOptionsDesc = document.getElementById('elementOptionsDesc');
const elementInsertButton = document.getElementById('elementInsertButton');
const elementCustomColor = document.getElementById('elementCustomColor');
const elementCustomColorHex = document.getElementById('elementCustomColorHex');
const conceptCheckerEmbedOptions = document.getElementById('conceptCheckerEmbedOptions');
const conceptCheckerEmbed = document.getElementById('conceptCheckerEmbed');
const videoTranscriptOptions = document.getElementById('videoTranscriptOptions');
const transcriptEmbedLabel = document.getElementById('transcriptEmbedLabel');
const transcriptEmbedLink = document.getElementById('transcriptEmbedLink');
const videoTranscriptIframe = document.getElementById('videoTranscriptIframe');
const transcriptSummaryLabel = document.getElementById('transcriptSummaryLabel');
const videoTranscriptSummary = document.getElementById('videoTranscriptSummary');
const transcriptTextLabel = document.getElementById('transcriptTextLabel');
const videoTranscriptText = document.getElementById('videoTranscriptText');
const showHideOptions = document.getElementById('showHideOptions');
const showHideSummary = document.getElementById('showHideSummary');
const showHideText = document.getElementById('showHideText');
const showHideStyleSelect = document.getElementById('showHideStyleSelect');
const showHideAlignSelect = document.getElementById('showHideAlignSelect');
const transcriptStyleSelect = document.getElementById('transcriptStyleSelect');
const transcriptAlignSelect = document.getElementById('transcriptAlignSelect');
const calloutTitleInput = document.getElementById('calloutTitleInput');
const calloutBodyInput = document.getElementById('calloutBodyInput');
const tableOptions = document.getElementById('tableOptions');
const tableCaptionInput = document.getElementById('tableCaptionInput');
const tableColumnsSelect = document.getElementById('tableColumnsSelect');
const tableRowsSelect = document.getElementById('tableRowsSelect');
const tableHeaderScopeSelect = document.getElementById('tableHeaderScopeSelect');
const tableHeaderLabels = document.getElementById('tableHeaderLabels');

// The table builder opens on the light Background swatch rather than navy.
const TABLE_DEFAULT_HEADER_COLOR = '#F7F9FB';
const elementBuilderFields = document.getElementById('elementBuilderFields');
const layoutPrefillOptions = document.getElementById('layoutPrefillOptions');
const layoutPrefillFields = document.getElementById('layoutPrefillFields');
const layoutPreviewFrame = document.getElementById('layoutPreviewFrame');
const layoutCopyHtmlButton = document.getElementById('layoutCopyHtmlButton');
const layoutBorderSelect = document.getElementById('layoutBorderSelect');
const elementCopyHtmlButton = document.getElementById('elementCopyHtmlButton');
const assetIconCategoryWrap = document.getElementById('assetIconCategoryWrap');
const assetIconCategorySelect = document.getElementById('assetIconCategorySelect');
const elementBuilderCount = document.getElementById('elementBuilderCount');
const elementBuilderOptions = document.getElementById('elementBuilderOptions');
const calloutBoxOptions = document.getElementById('calloutBoxOptions');
const calloutBoxStyleSelect = document.getElementById('calloutBoxStyleSelect');
let selectedElementKey = null;
let selectedElementColor = '#001E44';
const elementBuilderPanel = document.getElementById('elementBuilderPanel');
const builderType = document.getElementById('builderType');
const builderCount = document.getElementById('builderCount');
const insertBuiltInteractive = document.getElementById('insertBuiltInteractive');
const assetTypeSelect = document.getElementById('assetTypeSelect');
const assetCategorySelect = document.getElementById('assetCategorySelect');
const assetSizeSelect = document.getElementById('assetSizeSelect');
const assetColorModeSelect = document.getElementById('assetColorModeSelect');
const assetCustomColorControl = document.getElementById('assetCustomColorControl');
const assetCustomColorPicker = document.getElementById('assetCustomColorPicker');
const assetCustomColorText = document.getElementById('assetCustomColorText');
const assetCustomColor = document.getElementById('assetCustomColor');
const assetCustomColorHex = document.getElementById('assetCustomColorHex');
const assetKindButtons = Array.from(document.querySelectorAll('.asset-kind-button'));
const assetButtonOptions = document.getElementById('assetButtonOptions');
const assetIconOptions = document.getElementById('assetIconOptions');
const assetButtonStyleButtons = Array.from(document.querySelectorAll('.asset-button-style-button'));
const assetButtonCustomColor = document.getElementById('assetButtonCustomColor');
const assetButtonCustomColorHex = document.getElementById('assetButtonCustomColorHex');
const assetButtonSizeSelect = document.getElementById('assetButtonSizeSelect');
const assetButtonAlignSelect = document.getElementById('assetButtonAlignSelect');
const assetButtonText = document.getElementById('assetButtonText');
const assetIconCollectionSelect = document.getElementById('assetIconCollectionSelect');
const assetInstructureSizeOption = document.getElementById('assetInstructureSizeOption');
const assetInstructureIconSizeSelect = document.getElementById('assetInstructureIconSizeSelect');
const assetIconSearch = document.getElementById('assetIconSearch');
const assetIconSelect = document.getElementById('assetIconSelect');
const assetIconGrid = document.getElementById('assetIconGrid');
const assetIconGridCount = document.getElementById('assetIconGridCount');
const assetInsertButton = document.getElementById('assetInsertButton');
let selectedAssetColor = '#001E44';
let selectedAssetIconKey = null;
let selectedAssetKind = 'icons';
let selectedAssetButtonStyle = 'solid';
let selectedAssetButtonColor = '#1E407C';
let selectedAssetInstructureIconSize = 'medium';
let selectedAssetIconVariant = 'dark';
const assetIconVariantSelect = document.getElementById('assetIconVariantSelect');

// Per-collection variant options; the first entry is the default and also the
// directory the packaged local preview files are read from.
const ASSET_ICON_VARIANT_OPTIONS = {
  general: [
    { value: 'dark', label: 'Dark', dir: 'Dark' },
    { value: 'light', label: 'Light', dir: 'Light' }
  ],
  'icon-banners': [
    { value: 'color', label: 'Color', dir: 'Color' },
    { value: 'dark', label: 'Dark', dir: 'Dark' },
    { value: 'light', label: 'Light', dir: 'Light' }
  ],
  // Fill Icons ship in a single Color style; subfolders are categories, not variants.
  'fill-icons': [
    { value: 'color', label: 'Color', dir: '' }
  ]
};

function getAssetIconVariantOptions(collection) {
  return ASSET_ICON_VARIANT_OPTIONS[collection] || ASSET_ICON_VARIANT_OPTIONS.general;
}

function getAssetIconVariantDir(collection, variantValue) {
  const options = getAssetIconVariantOptions(collection);
  const match = options.find((option) => option.value === variantValue);
  return (match || options[0]).dir;
}

function populateAssetIconVariantSelect(collection) {
  if (!assetIconVariantSelect) return;
  const options = getAssetIconVariantOptions(collection);
  assetIconVariantSelect.innerHTML = options
    .map((option, index) => `<option value="${option.value}"${index === 0 ? ' selected' : ''}>${option.label}</option>`)
    .join('');
  selectedAssetIconVariant = options[0].value;
}

// ---------------------------------------------------------------------------
// Category filter for icon collections (populated from entry.category values).
// ---------------------------------------------------------------------------
let selectedAssetIconCategory = '';

function populateAssetIconCategorySelect(collection) {
  if (!assetIconCategorySelect || !assetIconCategoryWrap) return;

  const entries = getCeiSvgIconEntries(collection);
  const categories = [...new Set(entries.map((icon) => icon.category).filter(Boolean))]
    .filter((category) => category.toLowerCase() !== collection.toLowerCase().replace(/-/g, ' '))
    .sort((a, b) => a.localeCompare(b));

  selectedAssetIconCategory = '';
  assetIconCategorySelect.innerHTML = ['<option value="" selected>All categories</option>']
    .concat(categories.map((category) => `<option value="${escapeHtmlAttribute(category)}">${escapeHtmlText(category)}</option>`))
    .join('');
  assetIconCategoryWrap.hidden = categories.length < 2;
}

const panelMessages = [
  'Search for layouts and elements, then paste a recommended option into Canvas.',
  'Choose a layout, then customize options before inserting into Canvas.',
  'Choose an element to paste into Canvas.',
  'Choose an asset to paste into Canvas.',
  'Copy a prompt template, then open AI Studio.',
  'Connect your AI account, then analyze the open Canvas page for content and layout suggestions.',
  'Save your own pages and elements, then insert them into Canvas. Only you can see them.'
];

const palettes = { blue: { name: 'Default', primary: '#1e407c', secondary: '#2f81d3', accent: '#35a6e1', dark: '#123061', soft: '#f2f2f2' } };

let selectedPalette = 'blue';

function setStatus(message, isError) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.toggle('visually-hidden', !message);
  statusEl.style.borderLeftColor = isError ? '#b42318' : palettes[selectedPalette].accent;
}

function getAssetColor() {
  const mode = assetColorModeSelect ? assetColorModeSelect.value : 'dark';
  const customColor = assetCustomColorPicker ? assetCustomColorPicker.value : '#1e407c';

  if (mode === 'light') return '#ffffff';
  if (mode === 'custom') return customColor || '#1e407c';
  return '#1e407c';
}

function getAssetOptions() {
  const theme = assetColorModeSelect ? assetColorModeSelect.value : 'dark';
  const size = assetSizeSelect ? assetSizeSelect.value : 'medium';

  const sizes = {
    small: {
      icon: '52',
      iconFont: '25px',
      wrap: '66px',
      title: '22px',
      padding: '8px',
      preview: '24px'
    },
    medium: {
      icon: '84',
      iconFont: '40px',
      wrap: '110px',
      title: '28px',
      padding: '18px',
      preview: '32px'
    },
    large: {
      icon: '120',
      iconFont: '56px',
      wrap: '148px',
      title: '38px',
      padding: '28px',
      preview: '48px'
    }
  };

  return {
    theme,
    size,
    color: getAssetColor(),
    ...sizes[size]
  };
}

function applyAssetOptionsToHtml(html) {
  if (!html) return html;

  const options = getAssetOptions();

  return html
    .replaceAll('{{ICON_COLOR}}', options.color)
    .replaceAll('{{ICON_SIZE}}', options.icon)
    .replaceAll('{{ICON_FONT_SIZE}}', options.iconFont)
    .replaceAll('{{ICON_WRAP_WIDTH}}', options.wrap)
    .replaceAll('{{TITLE_SIZE}}', options.title)
    .replaceAll('{{TITLE_PADDING}}', options.padding);
}

function applyPaletteToHtml(html) {
  return html;
}

function wrapContentInsertSpacing(html) {
  if (!html) return html;
  return `<p>&nbsp;</p>
${html}
<p>&nbsp;</p>`;
}

function makePreview(type) {
  const preview = document.createElement('span');
  preview.className = `preview ${type || 'full'}`;
  preview.setAttribute('aria-hidden', 'true');
  const columnCounts = { 'cols-3': 3, 'cols-4': 4, 'cols-5': 5, 'two-5050': 2, 'two-3862': 2, 'two-6238': 2, table: 9 };
  const count = columnCounts[type] || (type === 'grid' ? 4 : type === 'tabs' ? 4 : type === 'hero' ? 4 : type === 'icon' ? 1 : 3);
  for (let i = 0; i < count; i += 1) {
    const span = document.createElement('span');
    if (i === 0) span.className = 'accent';
    if (type === 'full' && i === 0) span.className = 'sky';
    preview.appendChild(span);
  }
  return preview;
}

function makeAssetPreview(item) {
  const preview = document.createElement('span');
  preview.className = 'preview asset-preview';
  preview.setAttribute('aria-hidden', 'true');

  const options = getAssetOptions();

  preview.style.background = getAssetOptions().theme === 'light' ? '#1e407c' : 'linear-gradient(180deg, #eef7fb, #fff)';
  preview.style.color = getAssetColor();
  preview.style.borderColor = getAssetOptions().theme === 'light' ? '#1e407c' : '#e3e8ef';

  if (item.assetType === 'canvas') {
    preview.classList.add('canvas-native-preview');
    const icon = document.createElement('i');
    icon.className = item.iconClass || 'icon-info';
    icon.style.fontSize = options.preview;
    icon.style.lineHeight = '1';
    icon.style.color = 'currentColor';
    icon.style.fontStyle = 'normal';
    preview.appendChild(icon);
    return preview;
  }

  const parser = new DOMParser();
  const previewHtml = applyAssetOptionsToHtml(applyPaletteToHtml(item.html));
  const doc = parser.parseFromString(previewHtml, 'text/html');
  const svg = doc.querySelector('svg');

  if (svg) {
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.setAttribute('focusable', 'false');
    svg.style.width = options.size === 'small' ? '48px' : options.size === 'large' ? '78px' : '64px';
    svg.style.height = options.size === 'small' ? '48px' : options.size === 'large' ? '78px' : '64px';
    svg.style.display = 'block';
    svg.style.color = 'inherit';
    preview.appendChild(svg);
  } else {
    preview.appendChild(makePreview('icon'));
  }

  return preview;
}

const calloutOptions = [
  { name: 'Beaver Blue', value: '#1e407c', text: '#ffffff' },
  { name: 'Sky Blue', value: '#009cde', text: '#ffffff' },
  { name: 'Grey', value: '#f2f4f4', text: '#2d3b45' },
  { name: 'Lime Green', value: '#c8e48b', text: '#2d3b45' }
];

function buildCalloutBoxHtml(option) {
  const color = option && option.value ? option.value : '#1e407c';
  const textColor = option && option.text ? option.text : '#ffffff';

  return `<style>
i[class*=icon-]:before,
i[class^=icon-]:before,
a[class*=icon-]:before,
a[class^=icon-]:before {
  font-family: "InstructureIcons-Line";
  display: inline-block;
  vertical-align: top;
  line-height: 1;
  font-size: 25px !important;
  text-transform: none !important;
  font-weight: normal !important;
  font-style: normal !important;
}
</style>

<div style="padding:20px 50px 30px; margin:50px 0; background:${color}; color:${textColor}; font-size:130%; overflow:auto;">
  <h3>For Example</h3>
  <p>A review is conducted to assure that the design input requirements are adequate before they are converted into the design specifications. Another is used to assure that the product design is adequate before prototypes are produced for simulated use testing and clinical evaluation. Another, a validation review, is conducted prior to the transfer of the design to production. Generally, they are used to provide assurance that an activity or phase has been completed in an acceptable manner and that the next activity or phase can begin.&nbsp; This is also referred to as a <strong>Stage-Gate Process</strong>, where after each stage of a process, a review is held as a gate that must be passed through before beginning the next stage.</p>
</div>
<p>&nbsp;</p>`;
}

function closeCalloutPickers() {
  document.querySelectorAll('.callout-picker').forEach((picker) => picker.remove());
}

function showCalloutPicker(button) {
  closeCalloutPickers();

  const picker = document.createElement('div');
  picker.className = 'callout-picker';
  picker.addEventListener('click', (event) => event.stopPropagation());

  const label = document.createElement('label');
  const selectId = `callout-color-${Date.now()}`;
  label.setAttribute('for', selectId);
  label.textContent = 'Choose callout color';

  const select = document.createElement('select');
  select.id = selectId;

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select a color';
  select.appendChild(placeholder);

  calloutOptions.forEach((option) => {
    const item = document.createElement('option');
    item.value = option.value;
    item.textContent = option.name;
    select.appendChild(item);
  });

  select.addEventListener('change', () => {
    const selected = calloutOptions.find((option) => option.value === select.value);
    if (!selected) return;

    closeCalloutPickers();
    pasteCustomHtml(wrapContentInsertSpacing(buildCalloutBoxHtml(selected)), `${selected.name} callout box pasted into the Canvas editor.`);
  });

  picker.appendChild(label);
  picker.appendChild(select);
  button.appendChild(picker);
  select.focus();
}


async function executeCanvasInsertFallback(tabId, html, insertMode) {
  if (!chrome.scripting || !chrome.scripting.executeScript) return { ok: false };

  const results = await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    injectImmediately: true,
    func: (htmlToInsert, insertModeArg) => {
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
        } catch (error) {}

        if (!doc.getElementById(CEI_ICON_STYLE_ID)) {
          const style = doc.createElement('style');
          style.id = CEI_ICON_STYLE_ID;
          style.textContent = CEI_ICON_CSS;
          doc.head.appendChild(style);
        }
      }

      function fireEvents(el) {
        if (!el) return;
        ['input', 'change', 'keyup', 'blur'].forEach((name) => {
          try {
            el.dispatchEvent(new Event(name, { bubbles: true }));
          } catch (error) {}
        });
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
        } catch (error) {}
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

      function insertHtml(el, html) {
        if (!el) return false;
        const tag = (el.tagName || '').toUpperCase();

        if (tag === 'TEXTAREA' || tag === 'INPUT') {
          el.focus();
          const start = typeof el.selectionStart === 'number' ? el.selectionStart : el.value.length;
          const end = typeof el.selectionEnd === 'number' ? el.selectionEnd : el.value.length;
          el.value = el.value.slice(0, start) + html + el.value.slice(end);
          el.selectionStart = el.selectionEnd = start + html.length;
          fireEvents(el);
          return true;
        }

        if (el.isContentEditable || el.getAttribute('contenteditable') === 'true' || tag === 'BODY') {
          const doc = el.ownerDocument || document;
          injectCanvasIconStyles(doc);
          el.focus();
          if (insertModeArg === 'inline-heading' && insertIconIntoHeading(doc, html)) {
            fireEvents(el);
            return true;
          }
          try {
            const sel = doc.getSelection && doc.getSelection();
            if (sel && sel.rangeCount) {
              sel.deleteFromDocument();
            }
            doc.execCommand('insertHTML', false, html);
          } catch (error) {
            try {
              el.insertAdjacentHTML('beforeend', html);
            } catch (e) {
              return false;
            }
          }
          fireEvents(el);
          return true;
        }

        return false;
      }

      function insertViaEditor(editor, html) {
        injectCanvasIconStyles(editor.getDoc && editor.getDoc());
        editor.focus();
        if (insertModeArg === 'inline-heading' && insertIconIntoHeading(editor.getDoc && editor.getDoc(), html)) {
          editor.save();
          editor.fire('change');
          editor.fire('keyup');
          return true;
        }
        editor.insertContent(html);
        editor.save();
        editor.fire('change');
        editor.fire('keyup');
        return true;
      }

      function tryTinymce(html) {
        try {
          if (!window.tinymce) return false;

          const active = window.tinymce.activeEditor;
          if (active && !active.isHidden()) {
            return insertViaEditor(active, html);
          }

          const editors = Array.from(window.tinymce.editors || []);
          for (const editor of editors) {
            if (!editor || editor.isHidden()) continue;
            return insertViaEditor(editor, html);
          }
        } catch (error) {}
        return false;
      }

      function tryCurrentDocument(html) {
        injectCanvasIconStyles(document);
        if (tryTinymce(html)) return true;

        const active = document.activeElement;
        if (insertHtml(active, html)) return true;

        const selectors = [
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
          const el = document.querySelector(selector);
          if (insertHtml(el, html)) return true;
        }

        return false;
      }

      return tryCurrentDocument(htmlToInsert);
    },
    args: [html, insertMode || 'block']
  });

  return {
    ok: Array.isArray(results) && results.some((result) => result && result.result === true)
  };
}


async function pasteCustomHtml(html, successMessage, options = {}) {
  if (!html) {
    setStatus('Element not found.', true);
    return;
  }

  const insertMode = options.insertMode || 'block';
  const cleanHtml = String(html).trim();
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.id) {
    await navigator.clipboard.writeText(cleanHtml);
    setStatus('Could not find the active Canvas tab, so the element was copied. Paste it into the Canvas editor with Command/Ctrl + V.', true);
    return;
  }

  let inserted = false;

  try {
    const directResponse = await executeCanvasInsertFallback(tab.id, cleanHtml, insertMode);
    inserted = Boolean(directResponse && directResponse.ok);
  } catch (error) {
    inserted = false;
  }

  if (!inserted) {
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: 'PSU_INSERT_CANVAS_HTML',
        html: cleanHtml,
        insertMode
      });
      inserted = Boolean(response && response.ok);
    } catch (error) {
      inserted = false;
    }
  }

  if (inserted) {
    setStatus(successMessage || 'Element pasted into the Canvas editor.', false);
    setTimeout(() => window.close(), 500);
    return;
  }

  await navigator.clipboard.writeText(cleanHtml);
  setStatus('Could not paste automatically, so the element was copied. Click inside the Canvas editor and paste with Command/Ctrl + V.', true);
}


function normalizeSearchText(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function filterCards(input) {
  const container = document.getElementById(input.dataset.target);
  if (!container) return;

  if (container.id === 'assetsPanel' && typeof filterAssetCards === 'function') {
    filterAssetCards();
    return;
  }

  const query = normalizeSearchText(input.value);
  const activeLayoutGroup = container.id === 'layoutsPanel' && layoutCategory ? layoutCategory.value : '';
  const activeElementCategory = '';

  const cards = Array.from(container.querySelectorAll('.layout-card'));
  let visibleCount = 0;

  cards.forEach((card) => {
    const text = card.dataset.searchText || '';
    const matchesSearch = !query || text.includes(query);
    const matchesGroup = !activeLayoutGroup || activeLayoutGroup === 'all' || card.dataset.layoutGroup === activeLayoutGroup;
    const matchesElementCategory = !activeElementCategory || card.dataset.elementCategory === activeElementCategory;
    const isVisible = matchesSearch && matchesGroup && matchesElementCategory;
    card.classList.toggle('is-hidden', !isVisible);
    if (isVisible) visibleCount += 1;
  });

  let noResults = container.querySelector('.no-results');
  if (!visibleCount) {
    if (!noResults) {
      noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.textContent = 'No matching cards found.';
      container.appendChild(noResults);
    }
  } else if (noResults) {
    noResults.remove();
  }
}

function filterLayoutsByCategory() {
  const layoutSearch = document.getElementById('layoutsSearch');
  if (layoutSearch) filterCards(layoutSearch);
}

function setupLiveSearch() {
  document.querySelectorAll('.card-search').forEach((input) => {
    input.addEventListener('input', () => filterCards(input));
  });

  if (layoutCategory) {
    layoutCategory.addEventListener('change', () => {
      filterLayoutsByCategory();
      setStatus(`Showing ${layoutCategory.options[layoutCategory.selectedIndex].text} layouts. Choose a layout to paste into Canvas.`, false);
    });
    filterLayoutsByCategory();
  }
}

function filterAssetCards() {
  const container = document.getElementById('assetsPanel');
  if (!container) return;

  const searchInput = document.getElementById('assetsSearch');
  const query = searchInput ? normalizeSearchText(searchInput.value) : '';
  const type = assetTypeSelect ? assetTypeSelect.value : 'canvas';
  const category = assetCategorySelect ? assetCategorySelect.value : 'all';

  const cards = Array.from(container.querySelectorAll('.layout-card'));
  let visibleCount = 0;

  cards.forEach((card) => {
    const matchesSearch = !query || (card.dataset.searchText || '').includes(query);
    const matchesType = !type || card.dataset.assetType === type;
    const matchesCategory = category === 'all' || card.dataset.assetCategory === category;
    const isVisible = matchesSearch && matchesType && matchesCategory;
    card.classList.toggle('is-hidden', !isVisible);
    if (isVisible) visibleCount += 1;
  });

  let noResults = container.querySelector('.no-results');
  if (!visibleCount) {
    if (!noResults) {
      noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.textContent = 'No matching assets found.';
      container.appendChild(noResults);
    }
  } else if (noResults) {
    noResults.remove();
  }
}

function updateAssetCategoryOptions() {
  if (!assetTypeSelect || !assetCategorySelect) return;

  const type = assetTypeSelect.value;
  const allowed = type === 'custom'
    ? ['all', 'custom-icons']
    : ['all', 'course-content', 'media', 'learning-activities', 'alerts'];

  Array.from(assetCategorySelect.options).forEach((option) => {
    option.hidden = !allowed.includes(option.value);
  });

  if (!allowed.includes(assetCategorySelect.value)) {
    assetCategorySelect.value = 'all';
  }
}

function refreshAssetPreviews() {
  document.querySelectorAll('.asset-card').forEach((card) => {
    const item = window.PSU_CANVAS_ITEMS.find((asset) => asset.key === card.dataset.layout);
    const oldPreview = card.querySelector('.asset-preview');
    if (item && oldPreview) oldPreview.replaceWith(makeAssetPreview(item));
  });
}


function normalizeHexColor(value) {
  const fallback = '#1e407c';
  if (!value) return fallback;
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed;
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed}`;
  return fallback;
}

function updateColorToggleSummary(toggle, color) {
  if (!toggle) return;
  const normalized = normalizeHexColor(color || '#001E44').toUpperCase();
  const chip = toggle.querySelector('.color-toggle-chip');
  const hex = toggle.querySelector('.color-toggle-hex');

  if (chip) chip.style.background = normalized;
  if (hex) hex.textContent = normalized;
}

function updateNearestColorToggleSummary(control, color) {
  const toggle = control ? control.closest('.color-options-toggle') : null;
  updateColorToggleSummary(toggle, color);
}

function syncColorToggleSummaries() {
  updateColorToggleSummary(document.querySelector('.layout-color-options'), selectedLayoutColor);
  updateColorToggleSummary(document.querySelector('.element-color-options'), selectedElementColor);
  updateColorToggleSummary(document.querySelector('.asset-color-options'), selectedAssetColor);
  updateColorToggleSummary(document.querySelector('.asset-button-color-options'), selectedAssetButtonColor);
}

function updateAssetCustomColorControl() {
  if (!assetCustomColorControl || !assetColorModeSelect) return;
  assetCustomColorControl.hidden = assetColorModeSelect.value !== 'custom';
}

function syncAssetColorInputs(source) {
  if (!assetCustomColorPicker || !assetCustomColorText) return;

  if (source === 'text') {
    const normalized = normalizeHexColor(assetCustomColorText.value);
    assetCustomColorPicker.value = normalized;
    assetCustomColorText.value = normalized;
  } else {
    assetCustomColorText.value = assetCustomColorPicker.value;
  }
}

function syncAssetBuilderColor(source) {
  if (!assetCustomColor || !assetCustomColorHex) return;

  if (source === 'hex') {
    selectedAssetColor = normalizeHexColor(assetCustomColorHex.value, selectedAssetColor);
    assetCustomColor.value = selectedAssetColor;
    assetCustomColorHex.value = selectedAssetColor.toUpperCase();
  } else {
    selectedAssetColor = assetCustomColor.value || '#001E44';
    assetCustomColorHex.value = selectedAssetColor.toUpperCase();
  }

  document.querySelectorAll('.asset-swatch').forEach((button) => button.classList.remove('is-selected'));
  updateColorToggleSummary(document.querySelector('.asset-color-options'), selectedAssetColor);
}

function syncAssetButtonColor(source) {
  if (!assetButtonCustomColor || !assetButtonCustomColorHex) return;

  if (source === 'hex') {
    selectedAssetButtonColor = normalizeHexColor(assetButtonCustomColorHex.value);
    assetButtonCustomColor.value = selectedAssetButtonColor;
    assetButtonCustomColorHex.value = selectedAssetButtonColor.toUpperCase();
  } else {
    selectedAssetButtonColor = assetButtonCustomColor.value || '#1E407C';
    assetButtonCustomColorHex.value = selectedAssetButtonColor.toUpperCase();
  }

  document.querySelectorAll('.asset-button-swatch').forEach((button) => button.classList.remove('is-selected'));
  updateColorToggleSummary(document.querySelector('.asset-button-color-options'), selectedAssetButtonColor);
}

function updateAssetInstructureSizeVisibility() {
  if (!assetInstructureSizeOption || !assetIconCollectionSelect) return;
  assetInstructureSizeOption.hidden = assetIconCollectionSelect.value !== 'instructure';
}

function populateAssetIconSelect() {
  if (!assetIconCollectionSelect || !assetIconSelect) return;

  const selectedCollection = assetIconCollectionSelect.value || 'general';
  updateAssetInstructureSizeVisibility();
  const icons = getCeiSvgIconEntries(selectedCollection);
  const fallbackIcons = icons.length ? icons : getCeiSvgIconEntries('general');
  const selectedStillExists = fallbackIcons.some((icon) => icon.key === selectedAssetIconKey);
  selectedAssetIconKey = selectedStillExists ? selectedAssetIconKey : (fallbackIcons[0] ? fallbackIcons[0].key : null);
  if (assetIconSearch) {
    assetIconSearch.placeholder = 'Search icons...';
  }

  assetIconSelect.innerHTML = fallbackIcons
    .map((icon) => `<option value="${icon.key}"${icon.key === selectedAssetIconKey ? ' selected' : ''}>${icon.label}</option>`)
    .join('');

  if (selectedAssetIconKey) assetIconSelect.value = selectedAssetIconKey;
  renderAssetIconGrid(fallbackIcons);
}

function renderAssetIconGrid(icons) {
  if (!assetIconGrid) return;

  const selectedCollection = assetIconCollectionSelect ? assetIconCollectionSelect.value : 'general';
  let fullIconList = Array.isArray(icons) ? icons : getCeiSvgIconEntries(selectedCollection);
  if (selectedAssetIconCategory) {
    fullIconList = fullIconList.filter((icon) => icon.category === selectedAssetIconCategory);
  }
  const searchTerm = assetIconSearch ? assetIconSearch.value.trim().toLowerCase() : '';
  const iconList = searchTerm
    ? fullIconList.filter((icon) => getAssetIconSearchText(icon).includes(searchTerm))
    : fullIconList;
  const previewColor = selectedAssetColor || '#001E44';

  assetIconGrid.innerHTML = '';
  if (assetIconGridCount) {
    assetIconGridCount.textContent = searchTerm
      ? `${iconList.length} of ${fullIconList.length} icons`
      : (iconList.length ? `${iconList.length} icons` : 'No icons');
  }

  if (!iconList.length) {
    const emptyState = document.createElement('div');
    emptyState.className = 'asset-icon-grid-empty';
    emptyState.textContent = 'No icons match your search.';
    assetIconGrid.appendChild(emptyState);
    return;
  }

  iconList.forEach((icon) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'asset-icon-tile';
    button.dataset.iconKey = icon.key;
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-checked', icon.key === selectedAssetIconKey ? 'true' : 'false');
    button.setAttribute('aria-label', icon.label || 'Icon');
    if (icon.key === selectedAssetIconKey) button.classList.add('is-selected');

    const preview = document.createElement('span');
    preview.className = 'asset-icon-tile-preview';

    const type = (icon.type || '').toLowerCase();
    const isInstructure = type === 'instructure' || icon.collection === 'instructure';
    const isGeneral = icon.collection === 'general';
    const isPng = type === 'png' || /\.png$/i.test(icon.path || '');

    if (isGeneral || icon.collection === 'icon-banners' || icon.collection === 'fill-icons') {
      // Preview from the packaged local files (instant, no network).
      // General previews Dark; Icon Banners and Fill Icons preview Color.
      const image = document.createElement('img');
      image.src = icon.path;
      image.alt = '';
      image.loading = 'lazy';
      image.decoding = 'async';
      image.setAttribute('aria-hidden', 'true');
      if (icon.collection === 'icon-banners' || icon.collection === 'fill-icons') {
        image.style.height = '32px';
        image.style.width = 'auto';
        image.style.maxWidth = '100%';
      }
      preview.appendChild(image);
    } else if (isInstructure) {
      preview.classList.add('asset-icon-tile-preview-instructure');
      preview.style.color = '#001E44';
      preview.appendChild(buildInstructurePreviewIcon(icon));
    } else if (isPng) {
      preview.classList.add('asset-icon-tile-preview-custom');
      preview.style.background = previewColor;
      const image = document.createElement('img');
      image.src = getCeiSvgUrl(icon.key);
      image.alt = '';
      image.setAttribute('aria-hidden', 'true');
      preview.appendChild(image);
    } else {
      const image = document.createElement('img');
      image.src = getCeiSvgUrl(icon.key);
      image.alt = '';
      image.setAttribute('aria-hidden', 'true');
      preview.appendChild(image);
    }

    const label = document.createElement('span');
    label.className = 'asset-icon-tile-label';
    label.textContent = icon.label || 'Icon';

    button.append(preview, label);
    button.addEventListener('click', () => selectAssetIcon(icon.key));
    assetIconGrid.appendChild(button);
  });
}

function getAssetIconSearchText(icon) {
  return [
    icon.label,
    icon.key,
    icon.category,
    icon.collection,
    icon.iconClass
  ].filter(Boolean).join(' ').toLowerCase();
}

function buildInstructurePreviewIcon(icon) {
  const iconClass = icon.iconClass || `icon-${String(icon.key).replace(/^instructure-/, '')}`;
  const previewData = window.CEI_INSTRUCTURE_ICON_PREVIEWS && window.CEI_INSTRUCTURE_ICON_PREVIEWS[iconClass];

  if (!previewData || !Array.isArray(previewData.paths)) {
    const glyph = document.createElement('i');
    glyph.className = `${iconClass} icon-lg`;
    glyph.style.setProperty('color', '#001E44', 'important');
    glyph.setAttribute('aria-hidden', 'true');
    return glyph;
  }

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', previewData.viewBox || '0 0 1920 1920');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  previewData.paths.forEach((pathData) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData.d);
    path.setAttribute('fill', 'currentColor');
    if (pathData.fillRule) path.setAttribute('fill-rule', pathData.fillRule);
    if (pathData.clipRule) path.setAttribute('clip-rule', pathData.clipRule);
    svg.appendChild(path);
  });

  return svg;
}

function selectAssetIcon(iconKey) {
  selectedAssetIconKey = iconKey;
  if (assetIconSelect) assetIconSelect.value = iconKey;

  document.querySelectorAll('.asset-icon-tile').forEach((tile) => {
    const isSelected = tile.dataset.iconKey === iconKey;
    tile.classList.toggle('is-selected', isSelected);
    tile.setAttribute('aria-checked', isSelected ? 'true' : 'false');
  });

}

function buildAssetButtonHtml() {
  const buttonColor = selectedAssetButtonColor || '#1E407C';
  const isOutline = selectedAssetButtonStyle === 'outline';
  const size = assetButtonSizeSelect ? assetButtonSizeSelect.value : 'medium';
  const text = assetButtonText && assetButtonText.value.trim() ? assetButtonText.value.trim() : 'Button Text';

  const sizeStyles = {
    small: {
      padding: '6px 12px',
      fontSize: '14px'
    },
    medium: {
      padding: '8px 16px',
      fontSize: '16px'
    },
    large: {
      padding: '12px 22px',
      fontSize: '20px'
    }
  };

  const colors = {
    background: isOutline ? '#ffffff' : buttonColor,
    border: buttonColor,
    text: isOutline ? buttonColor : '#ffffff'
  };
  const sizes = sizeStyles[size] || sizeStyles.medium;

  const align = ['left', 'center', 'right'].includes(assetButtonAlignSelect && assetButtonAlignSelect.value)
    ? assetButtonAlignSelect.value
    : 'left';

  return `<p style="text-align: ${align};"><span style="display:inline-block;box-sizing:border-box;border:1px solid ${escapeHtmlAttribute(colors.border)};border-radius:4px;background:${escapeHtmlAttribute(colors.background)};color:${escapeHtmlAttribute(colors.text)};padding:${sizes.padding};font-size:${sizes.fontSize};font-weight:700;line-height:1.4;text-decoration:none;">${escapeHtmlAttribute(text)}</span></p>`;
}

function escapeHtmlAttribute(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function escapeHtmlText(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function buildDetailsParagraphs(text, fallbackText) {
  const normalized = String(text || '').trim();
  if (!normalized) return `<p><span>${escapeHtmlText(fallbackText)}</span></p>`;

  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p><span>${escapeHtmlText(paragraph).replace(/\n/g, '<br>')}</span></p>`)
    .join('');
}

function buildTranscriptParagraphs(text) {
  return buildDetailsParagraphs(text, 'Add video transcript here...');
}

function getTranscriptConfig(elementKey) {
  if (elementKey === 'podcastTranscript') {
    return {
      mediaType: 'Podcast',
      embedLinkLabel: '(Podcast)',
      embedLinkUrl: 'https://podcasts.apple.com/us/new',
      summaryDefault: 'Click to view Podcast Transcript',
      transcriptPlaceholder: 'Paste podcast transcript here'
    };
  }

  return {
    mediaType: 'Video',
    embedLinkLabel: '(Kaltura)',
    embedLinkUrl: 'https://psu.mediaspace.kaltura.com',
    summaryDefault: 'Click to view Video Transcript',
    transcriptPlaceholder: 'Paste video transcript here'
  };
}

function buildVideoTranscriptIframeHtml(embedHtml) {
  const cleanEmbed = String(embedHtml || '').trim();
  if (!cleanEmbed) return '';

  return `<div style="margin: 0 0 24px; text-align: center;">
${cleanEmbed}
</div>
`;
}

function recolorSvgForInlineInsert(svgText, color, size) {
  const cleanSvg = String(svgText || '')
    .replace(/<\?xml[\s\S]*?\?>/gi, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .trim();

  return cleanSvg
    .replace(/<svg\b([^>]*)>/i, `<svg$1 width="${size}" height="${size}" aria-hidden="true" focusable="false" style="width:${size}px;height:${size}px;max-width:none;display:inline-block;vertical-align:middle;flex:0 0 auto;">`)
    .replace(/\sfill="(?!none|transparent|currentColor)[^"]*"/gi, ` fill="${color}"`)
    .replace(/\sstroke="(?!none|transparent|currentColor)[^"]*"/gi, ` stroke="${color}"`);
}

function buildInstructureAssetIconHtml(iconClass, color, sizeKey = 'medium') {
  const safeClass = escapeHtmlAttribute(iconClass);
  const safeColor = escapeHtmlAttribute(color || '#001E44');
  const normalizedSizeKey = typeof sizeKey === 'number'
    ? (sizeKey >= 64 ? 'large' : sizeKey <= 36 ? 'small' : 'medium')
    : sizeKey;
  const glyphSizes = {
    small: 30,
    medium: 42,
    large: 60
  };
  const glyph = glyphSizes[normalizedSizeKey] || glyphSizes.medium;
  const wrapperStyle = [
    'display:inline-flex',
    'align-items:center',
    'justify-content:center',
    `width:${glyph}px`,
    `height:${glyph}px`,
    'line-height:1',
    'vertical-align:middle',
    'margin-right:8px',
    'overflow:visible',
    'flex:0 0 auto'
  ].join(';');

  // Emit a real inline <svg> mirroring buildInstructurePreviewIcon: sized in
  // actual pixels and colored via fill, so it renders identically in the editor
  // and the saved/published view with no ::before, transform, or CSS dependency.
  const previewData = window.CEI_INSTRUCTURE_ICON_PREVIEWS && window.CEI_INSTRUCTURE_ICON_PREVIEWS[iconClass];
  if (previewData && Array.isArray(previewData.paths)) {
    const viewBox = previewData.viewBox || '0 0 1920 1920';
    const paths = previewData.paths.map((pathData) => {
      const attrs = [`d="${pathData.d}"`, `fill="${safeColor}"`];
      if (pathData.fillRule) attrs.push(`fill-rule="${pathData.fillRule}"`);
      if (pathData.clipRule) attrs.push(`clip-rule="${pathData.clipRule}"`);
      return `<path ${attrs.join(' ')}/>`;
    }).join('');
    const svgStyle = [
      `width:${glyph}px`,
      `height:${glyph}px`,
      'max-width:none',
      'display:inline-block',
      'vertical-align:middle',
      'flex:0 0 auto'
    ].join(';');
    return `<span style="${wrapperStyle};"><svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${glyph}" height="${glyph}" aria-hidden="true" focusable="false" style="${svgStyle};">${paths}</svg></span>`;
  }

  // Fallback for any icon missing from the preview map: render the font glyph,
  // scaled up via transform since Canvas pins the ::before to 1rem (16px).
  const scale = glyph / 16;
  const iconStyle = [
    'font-size:16px',
    'line-height:1',
    `color:${safeColor}`,
    'display:inline-block',
    'vertical-align:middle',
    `transform:scale(${scale})`,
    'transform-origin:center'
  ].join(';');
  return `<span style="${wrapperStyle};"><i class="${safeClass} icon-lg" style="${iconStyle};" aria-hidden="true"></i></span>`;
}

async function buildSelectedAssetHtml() {
  if (selectedAssetKind === 'buttons') return buildAssetButtonHtml();

  if (!assetIconSelect) return '';

  const iconKey = selectedAssetIconKey || assetIconSelect.value;
  const iconEntry = getCeiSvgIconEntry(iconKey);
  if (!iconEntry) return '';

  const type = (iconEntry.type || '').toLowerCase();
  const isInstructure = type === 'instructure' || iconEntry.collection === 'instructure';
  const isPng = type === 'png' || /\.png$/i.test(iconEntry.path || '');

  if (iconEntry.collection === 'general' || iconEntry.collection === 'icon-banners' || iconEntry.collection === 'fill-icons') {
    const baseDir = getAssetIconVariantOptions(iconEntry.collection)[0].dir;
    const variantDir = getAssetIconVariantDir(iconEntry.collection, selectedAssetIconVariant);
    const variantPath = (baseDir && variantDir && baseDir !== variantDir)
      ? String(iconEntry.path).replace(`/${baseDir}/`, `/${variantDir}/`)
      : String(iconEntry.path);
    const encodedPath = variantPath.split('/').map((part) => encodeURIComponent(part)).join('/');
    const url = `${CEI_PUBLIC_ASSET_BASE}/${encodedPath}`;

    if (iconEntry.collection === 'icon-banners') {
      // Banners convey meaning ("Stop and Think"), so they get real alt text.
      // Banners are wide; size by height and let the width follow.
      return `<img src="${escapeHtmlAttribute(url)}" alt="${escapeHtmlAttribute(iconEntry.label || 'Icon banner')}" height="60" style="height:60px;width:auto;max-width:none;display:inline-block;vertical-align:middle;margin-right:8px;margin-bottom:15px;">`;
    }

    if (iconEntry.collection === 'fill-icons') {
      return `<img src="${escapeHtmlAttribute(url)}" alt="" aria-hidden="true" height="60" style="height:60px;width:auto;max-width:none;display:inline-block;vertical-align:middle;margin-right:8px;">`;
    }

    return `<img src="${escapeHtmlAttribute(url)}" alt="" aria-hidden="true" width="32" height="32" style="width:32px;height:32px;max-width:none;display:inline-block;vertical-align:middle;margin-right:8px;">`;
  }

  if (isInstructure) {
    const color = selectedAssetColor || '#001E44';
    const iconClass = iconEntry.iconClass || `icon-${iconKey.replace(/^instructure-/, '')}`;
    return buildInstructureAssetIconHtml(iconClass, color, selectedAssetInstructureIconSize);
  }

  const url = getCeiSvgUrl(iconKey);
  if (isPng) {
    return `<img src="${escapeHtmlAttribute(url)}" alt="" aria-hidden="true" width="65" style="height:65px;width:auto;max-width:none;display:inline-block;vertical-align:middle;margin-right:8px;">`;
  }

  return `<img src="${escapeHtmlAttribute(url)}" alt="" aria-hidden="true" width="50" height="50" style="width:50px;height:50px;max-width:none;display:inline-block;vertical-align:middle;margin-right:8px;">`;
}

let assetIconGridInitialized = false;

function ensureAssetIconGridInitialized() {
  if (assetIconGridInitialized) return;
  assetIconGridInitialized = true;
  const collection = assetIconCollectionSelect ? assetIconCollectionSelect.value : 'general';
  populateAssetIconVariantSelect(collection);
  populateAssetIconCategorySelect(collection);
  populateAssetIconSelect();
}

function setupAssetOptions() {
  selectedAssetColor = '#001E44';
  if (assetCustomColor) assetCustomColor.value = selectedAssetColor;
  if (assetCustomColorHex) assetCustomColorHex.value = selectedAssetColor;
  if (assetButtonCustomColor) assetButtonCustomColor.value = selectedAssetButtonColor;
  if (assetButtonCustomColorHex) assetButtonCustomColorHex.value = selectedAssetButtonColor;
  // Icon grid rendering is deferred until the Asset Library panel is opened,
  // so the popup paints instantly instead of waiting on ~386 remote images.

  const updateAssetKind = (kind = selectedAssetKind) => {
    selectedAssetKind = kind === 'buttons' ? 'buttons' : 'icons';
    const isButtons = selectedAssetKind === 'buttons';
    if (assetButtonOptions) assetButtonOptions.hidden = !isButtons;
    if (assetIconOptions) assetIconOptions.hidden = isButtons;
    assetKindButtons.forEach((button) => {
      const isSelected = button.dataset.assetKind === selectedAssetKind;
      button.classList.toggle('is-selected', isSelected);
      button.setAttribute('aria-checked', String(isSelected));
    });
    setStatus(isButtons
      ? 'Choose button options, then Insert Asset.'
      : 'Choose an icon, then Insert Asset.', false);
  };

  if (assetKindButtons.length) {
    assetKindButtons.forEach((button) => {
      button.addEventListener('click', () => updateAssetKind(button.dataset.assetKind));
    });
    updateAssetKind();
  }

  if (assetButtonStyleButtons.length) {
    assetButtonStyleButtons.forEach((button) => {
      button.addEventListener('click', () => {
        selectedAssetButtonStyle = button.dataset.buttonStyle === 'outline' ? 'outline' : 'solid';
        assetButtonStyleButtons.forEach((styleButton) => {
          const isSelected = styleButton.dataset.buttonStyle === selectedAssetButtonStyle;
          styleButton.classList.toggle('is-selected', isSelected);
          styleButton.setAttribute('aria-checked', String(isSelected));
        });
      });
    });
  }

  document.querySelectorAll('.asset-button-swatch').forEach((swatch) => {
    swatch.addEventListener('click', () => {
      selectedAssetButtonColor = swatch.dataset.color || '#1E407C';
      if (assetButtonCustomColor) assetButtonCustomColor.value = selectedAssetButtonColor;
      if (assetButtonCustomColorHex) assetButtonCustomColorHex.value = selectedAssetButtonColor.toUpperCase();
      document.querySelectorAll('.asset-button-swatch').forEach((button) => button.classList.remove('is-selected'));
      swatch.classList.add('is-selected');
      updateNearestColorToggleSummary(swatch, selectedAssetButtonColor);
    });
  });

  if (assetButtonCustomColor) {
    assetButtonCustomColor.addEventListener('input', () => {
      syncAssetButtonColor('picker');
      updateNearestColorToggleSummary(assetButtonCustomColor, selectedAssetButtonColor);
    });
  }

  if (assetButtonCustomColorHex) {
    assetButtonCustomColorHex.addEventListener('change', () => {
      syncAssetButtonColor('hex');
      updateNearestColorToggleSummary(assetButtonCustomColorHex, selectedAssetButtonColor);
    });
  }

  document.querySelectorAll('.asset-swatch').forEach((swatch) => {
    swatch.addEventListener('click', () => {
      selectedAssetColor = swatch.dataset.color || '#001E44';
      if (assetCustomColor) assetCustomColor.value = selectedAssetColor;
      if (assetCustomColorHex) assetCustomColorHex.value = selectedAssetColor.toUpperCase();
      document.querySelectorAll('.asset-swatch').forEach((button) => button.classList.remove('is-selected'));
      swatch.classList.add('is-selected');
      updateNearestColorToggleSummary(swatch, selectedAssetColor);
      renderAssetIconGrid();
    });
  });

  if (assetCustomColor) {
    assetCustomColor.addEventListener('input', () => {
      syncAssetBuilderColor('picker');
      updateNearestColorToggleSummary(assetCustomColor, selectedAssetColor);
      renderAssetIconGrid();
    });
  }

  if (assetCustomColorHex) {
    assetCustomColorHex.addEventListener('change', () => {
      syncAssetBuilderColor('hex');
      updateNearestColorToggleSummary(assetCustomColorHex, selectedAssetColor);
      renderAssetIconGrid();
    });
  }

  if (assetIconCollectionSelect) {
    assetIconCollectionSelect.addEventListener('change', () => {
      if (assetIconSearch) assetIconSearch.value = '';
      populateAssetIconVariantSelect(assetIconCollectionSelect.value);
      populateAssetIconCategorySelect(assetIconCollectionSelect.value);
      populateAssetIconSelect();
      const label = assetIconCollectionSelect.options[assetIconCollectionSelect.selectedIndex].text;
      setStatus(`Asset Library set to ${label}. Choose an icon, then Insert Asset.`, false);
    });
  }

  if (assetIconCategorySelect) {
    assetIconCategorySelect.addEventListener('change', () => {
      selectedAssetIconCategory = assetIconCategorySelect.value || '';
      renderAssetIconGrid();
    });
  }

  if (assetInstructureIconSizeSelect) {
    selectedAssetInstructureIconSize = assetInstructureIconSizeSelect.value || 'medium';
    assetInstructureIconSizeSelect.addEventListener('change', () => {
      selectedAssetInstructureIconSize = assetInstructureIconSizeSelect.value || 'medium';
    });
  }

  if (assetIconVariantSelect) {
    selectedAssetIconVariant = assetIconVariantSelect.value || 'dark';
    assetIconVariantSelect.addEventListener('change', () => {
      selectedAssetIconVariant = assetIconVariantSelect.value;
      const label = assetIconVariantSelect.options[assetIconVariantSelect.selectedIndex].text;
      setStatus(`Icons will insert in the ${label} color.`, false);
    });
  }

  if (assetIconSearch) {
    assetIconSearch.addEventListener('input', () => {
      renderAssetIconGrid();
    });
  }

  if (assetInsertButton) {
    assetInsertButton.addEventListener('click', async () => {
      const html = await buildSelectedAssetHtml();
      if (!html) return;
      const insertMode = selectedAssetKind === 'icons' ? 'inline-heading' : 'block';

      if (selectedAssetKind === 'icons' && selectedAssetIconKey) {
        const entry = getCeiSvgIconEntry(selectedAssetIconKey);
        if (entry && (entry.collection === 'general' || entry.collection === 'icon-banners' || entry.collection === 'fill-icons')) {
          recordRecentInsert('assets', {
            key: entry.key,
            label: entry.label,
            collection: entry.collection,
            variant: selectedAssetIconVariant,
            dedupe: `${entry.key}-${selectedAssetIconVariant}`
          });
        }
      }

      await pasteCustomHtml(html, 'Asset pasted into the Canvas editor.', { insertMode });
    });
  }
}

function filterElementsByCategory() {
  const elementSearch = document.getElementById('interactiveSearch');
  if (elementSearch) filterCards(elementSearch);

  if (elementBuilderPanel && elementCategorySelect) {
    elementBuilderPanel.hidden = elementCategorySelect.value !== 'interactives';
  }
}

function setupElementOptions() {
  if (!elementCategorySelect) return;

  elementCategorySelect.addEventListener('change', () => {
    filterElementsByCategory();
    const label = elementCategorySelect.options[elementCategorySelect.selectedIndex].text;
    setStatus(`Showing ${label} elements. Choose an element to paste into Canvas.`, false);
  });

  filterElementsByCategory();
}

// Per-builder-type labels for the item fields and placeholder fallbacks.
const BUILDER_ITEM_CONFIG = {
  accordion: { titleLabel: 'Item title', bodyLabel: 'Item content', titleFallback: (i) => `Accordion Item ${i + 1}`, bodyFallback: () => 'Edit this hidden accordion content in Canvas.' },
  faq: { titleLabel: 'Question', bodyLabel: 'Answer', titleFallback: (i) => `FAQ Question ${i + 1}`, bodyFallback: () => 'Edit this FAQ answer in Canvas.' },
  qa: { titleLabel: 'Question', bodyLabel: 'Answer', titleFallback: (i) => `Question ${i + 1}: Add your question here`, bodyFallback: () => 'Edit this answer in Canvas.' },
  knowledge: { titleLabel: 'Question', bodyLabel: 'Answer / feedback', titleFallback: () => 'Write a low-stakes question here.', bodyFallback: () => 'Add feedback, explanation, or the correct answer here.' }
};

function getBuilderItemText(items, index, field, fallback) {
  const value = items && items[index] && items[index][field] ? String(items[index][field]).trim() : '';
  return value ? escapeHtmlText(value) : fallback;
}

function buildInteractiveHtml(type, count, items) {
  const total = Number(count) || 3;
  const config = BUILDER_ITEM_CONFIG[type] || BUILDER_ITEM_CONFIG.accordion;

  if (type === 'accordion') {
    const rows = Array.from({ length: total }, (_, i) => `
  <details style="background:#ffffff; border:1px solid #d7dbe0; border-radius:8px; padding:14px 16px; margin-bottom:10px;">
    <summary style="cursor:pointer; font-weight:700; color:#1e407c;">${getBuilderItemText(items, i, 'title', config.titleFallback(i))}</summary>
    <p style="margin:12px 0 0;">${getBuilderItemText(items, i, 'body', config.bodyFallback(i))}</p>
  </details>`).join('');
    return `<h2 style="margin:0 0 16px; color:#1e407c; font-size:30px; line-height:1.25;">Accordion</h2>
<div style="color:#2d3b45; line-height:1.55;">
${rows}
</div>
<p>&nbsp;</p>`;
  }

  if (type === 'faq') {
    const rows = Array.from({ length: total }, (_, i) => `
  <details style="margin-bottom:10px; background:#fff; border:1px solid #d7dbe0; border-radius:8px; padding:14px 16px;">
    <summary style="cursor:pointer; font-weight:700; color:#1e407c;">${getBuilderItemText(items, i, 'title', config.titleFallback(i))}</summary>
    <p style="margin:12px 0 0;">${getBuilderItemText(items, i, 'body', config.bodyFallback(i))}</p>
  </details>`).join('');
    return `<h2 style="margin:0 0 16px; color:#1e407c; font-size:30px; line-height:1.25;">Frequently Asked Questions</h2>
<div style="color:#2d3b45; line-height:1.55;">
${rows}
</div>
<p>&nbsp;</p>`;
  }

  if (type === 'qa') {
    const rows = Array.from({ length: total }, (_, i) => `
  <details style="background:#ffffff; border:1px solid #d7dbe0; border-radius:8px; padding:14px 16px; margin-bottom:10px;">
    <summary style="cursor:pointer; font-weight:700; color:#1e407c;">${getBuilderItemText(items, i, 'title', config.titleFallback(i))}</summary>
    <p style="margin:12px 0 0;"><strong>Answer:</strong> ${getBuilderItemText(items, i, 'body', config.bodyFallback(i))}</p>
  </details>`).join('');
    return `<h2 style="margin:0 0 16px; color:#1e407c; font-size:30px; line-height:1.25;">Question and Answer</h2>
<div style="color:#2d3b45; line-height:1.55;">
${rows}
</div>
<p>&nbsp;</p>`;
  }

  const rows = Array.from({ length: total }, (_, i) => `
  <div style="background:#ffffff; border:1px solid #d7dbe0; border-radius:10px; padding:18px; margin-bottom:14px;">
    <h3 style="margin:0 0 10px; color:#1e407c;">Knowledge Check ${i + 1}</h3>
    <p style="margin:0 0 10px;">${getBuilderItemText(items, i, 'title', config.titleFallback(i))}</p>
    <details>
      <summary style="cursor:pointer; font-weight:700; color:#005fa9;">Show answer</summary>
      <p style="margin:10px 0 0;">${getBuilderItemText(items, i, 'body', config.bodyFallback(i))}</p>
    </details>
  </div>`).join('');

  return `<h2 style="margin:0 0 16px; color:#1e407c; font-size:30px; line-height:1.25;">Knowledge Check</h2>
<div style="color:#2d3b45; line-height:1.55;">
${rows}
</div>
<p>&nbsp;</p>`;
}

// ---------------------------------------------------------------------------
// Accessible data table builder.
// Emits a real <table> with a <caption>, <thead>/<tbody>, and scoped <th>
// cells so screen readers announce the right heading for every cell.
// ---------------------------------------------------------------------------
function buildDataTableHtml() {
  const headerColor = selectedElementColor || TABLE_DEFAULT_HEADER_COLOR;
  const headerTextColor = getCeiContrastIconColor(headerColor);
  const columns = Math.max(2, Math.min(8, Number(tableColumnsSelect ? tableColumnsSelect.value : 3) || 3));
  const bodyRows = Math.max(1, Math.min(15, Number(tableRowsSelect ? tableRowsSelect.value : 3) || 3));
  const scopeMode = tableHeaderScopeSelect ? tableHeaderScopeSelect.value : 'row';
  const hasHeaderRow = scopeMode === 'row' || scopeMode === 'both';
  const hasHeaderColumn = scopeMode === 'column' || scopeMode === 'both';

  const caption = tableCaptionInput && tableCaptionInput.value.trim()
    ? tableCaptionInput.value.trim()
    : 'Add a caption that describes this table.';

  const labels = String(tableHeaderLabels ? tableHeaderLabels.value : '')
    .split('\n')
    .map((line) => line.trim());
  const headingFor = (index) => (labels[index] ? escapeHtmlText(labels[index]) : `Column ${index + 1}`);

  // Clean, even-spaced grid: light borders, the same padding on every side,
  // bold headers, and no fixed heights so rows size to their text.
  const cellBorder = '1px solid #d0d7de';
  // Fixed row height with no vertical padding. Canvas's editor strips box-sizing
  // and rewrites each row's measured height as a fixed height; if the cells had
  // top/bottom padding, that padding would be counted twice and rows would grow.
  // With padding only on the sides, the measured height matches what we set, and
  // vertical-align:middle keeps the text evenly spaced above and below.
  const ROW_HEIGHT = '48px';
  const cellBase = `border:${cellBorder}; padding:0 12px; height:${ROW_HEIGHT}; text-align:left; vertical-align:middle;`;
  const columnHeadStyle = `background:${headerColor}; color:${headerTextColor}; font-weight:700; ${cellBase}`;
  // With a header row, row headers are simply bold; without one they carry the color.
  const rowHeadStyle = hasHeaderRow
    ? `background:#ffffff; color:#2d3b45; font-weight:700; ${cellBase}`
    : columnHeadStyle;
  const cellStyle = `background:#ffffff; ${cellBase}`;
  const rowStyle = `height:${ROW_HEIGHT};`;

  const head = hasHeaderRow
    ? `  <thead>
    <tr style="${rowStyle}">
${Array.from({ length: columns }, (_, c) => `      <th scope="col" style="${columnHeadStyle}">${headingFor(c)}</th>`).join('\n')}
    </tr>
  </thead>
`
    : '';

  const body = Array.from({ length: bodyRows }, (_, r) => {
    const cells = Array.from({ length: columns }, (_, c) => {
      if (c === 0 && hasHeaderColumn) {
        return `      <th scope="row" style="${rowHeadStyle}">Row ${r + 1}</th>`;
      }
      return `      <td style="${cellStyle}"><br></td>`;
    }).join('\n');
    return `    <tr style="${rowStyle}">\n${cells}\n    </tr>`;
  }).join('\n');

  return `<table style="width:100%; border-collapse:collapse; border:1px solid #d0d7de; margin:20px 0; line-height:1.5; color:#2d3b45;">
  <caption style="caption-side:top; text-align:center; font-weight:700; color:#2d3b45; padding:0 0 10px;">${escapeHtmlText(caption)}</caption>
${head}  <tbody>
${body}
  </tbody>
</table>
<p>&nbsp;</p>`;
}

// Renders per-item title/content fields for the selected builder element,
// preserving any values already typed when the count changes.
function renderElementBuilderFields() {
  if (!elementBuilderFields) return;

  const builderType = getBuilderTypeForElement(selectedElementKey);
  if (!builderType) {
    elementBuilderFields.innerHTML = '';
    return;
  }

  const config = BUILDER_ITEM_CONFIG[builderType] || BUILDER_ITEM_CONFIG.accordion;
  const total = Number(elementBuilderCount ? elementBuilderCount.value : 3) || 3;
  const previousValues = collectElementBuilderValues();

  elementBuilderFields.innerHTML = '';
  for (let i = 0; i < total; i += 1) {
    const wrap = document.createElement('div');
    wrap.className = 'element-builder-item';

    const heading = document.createElement('span');
    heading.className = 'element-builder-item-heading';
    heading.textContent = `Item ${i + 1}`;

    const titleLabel = document.createElement('label');
    titleLabel.setAttribute('for', `builderItemTitle-${i}`);
    titleLabel.textContent = config.titleLabel;
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.id = `builderItemTitle-${i}`;
    titleInput.className = 'element-builder-title';
    titleInput.placeholder = config.titleFallback(i);
    if (previousValues[i] && previousValues[i].title) titleInput.value = previousValues[i].title;

    const bodyLabel = document.createElement('label');
    bodyLabel.setAttribute('for', `builderItemBody-${i}`);
    bodyLabel.textContent = config.bodyLabel;
    const bodyInput = document.createElement('textarea');
    bodyInput.rows = 2;
    bodyInput.id = `builderItemBody-${i}`;
    bodyInput.className = 'element-builder-body';
    bodyInput.placeholder = config.bodyFallback(i);
    if (previousValues[i] && previousValues[i].body) bodyInput.value = previousValues[i].body;

    wrap.append(heading, titleLabel, titleInput, bodyLabel, bodyInput);
    elementBuilderFields.appendChild(wrap);
  }
}

function collectElementBuilderValues() {
  if (!elementBuilderFields) return [];
  const titles = Array.from(elementBuilderFields.querySelectorAll('.element-builder-title'));
  const bodies = Array.from(elementBuilderFields.querySelectorAll('.element-builder-body'));
  return titles.map((input, i) => ({ title: input.value, body: bodies[i] ? bodies[i].value : '' }));
}

function setupInteractiveBuilder() {
  if (!insertBuiltInteractive) return;

  insertBuiltInteractive.addEventListener('click', () => {
    const html = applyPaletteToHtml(buildInteractiveHtml(builderType ? builderType.value : 'accordion', builderCount ? builderCount.value : 3));
    pasteCustomHtml(wrapContentInsertSpacing(html), 'Built interactive pasted into the Canvas editor.');
  });
}

function renderPanel(panelName, containerId) {
  const container = document.getElementById(containerId);
  window.PSU_CANVAS_ITEMS.filter(item => item.panel === panelName).forEach((item) => {
    const button = document.createElement('button');
    button.className = panelName === 'assets' ? 'layout-card asset-card' : item.key === 'calloutBox' ? 'layout-card callout-card' : 'layout-card';
    button.type = 'button';
    button.dataset.layout = item.key;
    button.dataset.searchText = `${item.title || ''} ${item.desc || ''} ${item.key || ''}`.toLowerCase();
    if (item.layoutGroup) button.dataset.layoutGroup = item.layoutGroup;
    if (item.assetType) button.dataset.assetType = item.assetType;
    if (item.assetCategory) button.dataset.assetCategory = item.assetCategory;
    if (item.elementCategory) button.dataset.elementCategory = item.elementCategory;
    button.appendChild(panelName === 'assets' ? makeAssetPreview(item) : makePreview(item.preview));

    const title = document.createElement('strong');
    title.textContent = item.title;

    const desc = document.createElement('small');
    desc.textContent = item.desc;

    button.appendChild(title);
    button.appendChild(desc);
    button.addEventListener('click', (event) => {
      if (panelName === 'layouts') {
        openLayoutOptions(item.key);
        return;
      }

      if (panelName === 'interactive') {
        openElementOptions(item.key);
        return;
      }

      pasteLayout(item.key);
    });
    container.appendChild(button);
  });
}


function openLayoutOptions(layoutKey) {
  const item = window.PSU_CANVAS_ITEMS.find((entry) => entry.key === layoutKey);
  if (!item) return;

  selectedLayoutKey = layoutKey;
  selectedLayoutColor = '#001E44';

  if (layoutOptionsTitle) layoutOptionsTitle.textContent = item.title || 'Layout Options';
  if (layoutOptionsDesc) layoutOptionsDesc.textContent = item.desc || 'Customize this layout before inserting it into Canvas.';
  if (layoutCustomColor) layoutCustomColor.value = selectedLayoutColor;
      if (layoutCustomColorHex) layoutCustomColorHex.value = selectedLayoutColor.toUpperCase();
  if (layoutCustomColorHex) layoutCustomColorHex.value = selectedLayoutColor;
  updateColorToggleSummary(document.querySelector('.layout-color-options'), selectedLayoutColor);

  document.querySelectorAll('.layout-swatch').forEach((swatch) => {
    swatch.classList.toggle('is-selected', swatch.dataset.color === selectedLayoutColor);
  });

  renderLayoutPrefillFields(layoutKey);
  if (layoutBorderSelect) layoutBorderSelect.value = 'no-borders';

  if (layoutMainView) layoutMainView.hidden = true;
  if (layoutOptionsView) layoutOptionsView.hidden = false;
  updateLayoutPreview();
  setStatus('Customize the selected layout, then choose Insert Layout.', false);
}

function closeLayoutOptions() {
  selectedLayoutKey = null;
  if (layoutOptionsView) layoutOptionsView.hidden = true;
  if (layoutMainView) layoutMainView.hidden = false;
  setStatus('Choose a layout, then customize options before inserting into Canvas.', false);
}

function applyLayoutOptionsToHtml(html) {
  let updated = String(html || '');
  const color = selectedLayoutColor || (layoutCustomColor ? layoutCustomColor.value : '#003366');

  updated = updated
    .replaceAll('#001E44', color)
    .replaceAll('#003366', color)
    .replaceAll('#1e407c', color)
    .replaceAll('#123061', color)
    .replaceAll('#96bee6', color)
    .replaceAll('#96BEE6', color)
    .replaceAll('#038c33', color)
    .replaceAll('#038C33', color);

  return updated;
}


function normalizeLayoutHexColor(value) {
  const fallback = '#001E44';
  if (!value) return fallback;
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toUpperCase();
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed.toUpperCase()}`;
  return fallback;
}

function syncLayoutCustomColor(source) {
  if (!layoutCustomColor || !layoutCustomColorHex) return;

  if (source === 'hex') {
    const normalized = normalizeLayoutHexColor(layoutCustomColorHex.value);
    selectedLayoutColor = normalized;
    layoutCustomColor.value = normalized;
    layoutCustomColorHex.value = normalized;
  } else {
    selectedLayoutColor = layoutCustomColor.value || '#001E44';
    layoutCustomColorHex.value = selectedLayoutColor.toUpperCase();
  }

  document.querySelectorAll('.layout-swatch').forEach((button) => button.classList.remove('is-selected'));
}

// ---------------------------------------------------------------------------
// Layout prefill fields: optional inputs that replace placeholder text tokens
// in the layout HTML at preview/insert time.
// ---------------------------------------------------------------------------
const LAYOUT_PREFILL_FIELDS = {
  courseIntroductionNew: [
    { name: 'courseName', label: 'Course code & name', token: 'ABC 123: Course Name', placeholder: 'ABC 123: Course Name' },
    { name: 'courseDesc', label: 'Brief course description', token: 'Brief course description', placeholder: 'One or two sentences about the course' }
  ],
  meetTheInstructor: [
    { name: 'instructorName', label: 'Instructor name', token: 'Instructor Name', placeholder: 'Dr. Jane Doe' },
    { name: 'instructorTitle', label: 'Title', token: '<strong>Title</strong>', template: '<strong>%s</strong>', placeholder: 'Associate Teaching Professor' },
    { name: 'instructorEmail', label: 'Email address', token: 'email@psu.edu', placeholder: 'abc123@psu.edu' },
    { name: 'instructorOffice', label: 'Office', token: '123 Burke Center', placeholder: '123 Burke Center' },
    {
      name: 'instructorPhone',
      label: 'Phone',
      token: '(999) 999-9999',
      placeholder: '(814) 555-1234',
      extraTokens: (value) => {
        const digits = value.replace(/\D/g, '');
        return digits ? [{ token: 'tel:9999999999', replacement: `tel:${digits}` }] : [];
      }
    },
    { name: 'instructorHours', label: 'Office hours', token: 'By appointment via Zoom or in person', placeholder: 'MWF 10-11am, or by appointment' }
  ]
};

let layoutPrefillValues = {};

function renderLayoutPrefillFields(layoutKey) {
  layoutPrefillValues = {};
  if (!layoutPrefillOptions || !layoutPrefillFields) return;

  const fields = LAYOUT_PREFILL_FIELDS[layoutKey] || [];
  layoutPrefillFields.innerHTML = '';
  layoutPrefillOptions.hidden = fields.length === 0;

  fields.forEach((field) => {
    const label = document.createElement('label');
    label.setAttribute('for', `layoutPrefill-${field.name}`);
    label.textContent = field.label;

    const input = document.createElement('input');
    input.type = 'text';
    input.id = `layoutPrefill-${field.name}`;
    input.placeholder = field.placeholder || '';
    input.addEventListener('input', () => {
      layoutPrefillValues[field.name] = input.value;
      scheduleLayoutPreviewUpdate();
    });

    layoutPrefillFields.append(label, input);
  });
}

function applyLayoutPrefillToHtml(html, layoutKey) {
  let updated = String(html || '');
  const fields = LAYOUT_PREFILL_FIELDS[layoutKey] || [];

  fields.forEach((field) => {
    const value = (layoutPrefillValues[field.name] || '').trim();
    if (!value) return;
    const escaped = escapeHtmlText(value);
    const replacement = field.template ? field.template.replace('%s', escaped) : escaped;
    updated = updated.split(field.token).join(replacement);

    if (typeof field.extraTokens === 'function') {
      field.extraTokens(value).forEach((extra) => {
        updated = updated.split(extra.token).join(extra.replacement);
      });
    }
  });

  return updated;
}

// ---------------------------------------------------------------------------
// Layout preview: renders the customized layout HTML in a sandboxed iframe.
// ---------------------------------------------------------------------------
let layoutPreviewTimer = null;

function scheduleLayoutPreviewUpdate() {
  if (layoutPreviewTimer) clearTimeout(layoutPreviewTimer);
  layoutPreviewTimer = setTimeout(updateLayoutPreview, 150);
}

// Card borders option: "no-borders" (default) zeroes the width of the 1px
// card borders while keeping the style/color declarations intact. Borderless
// cards are also normalized: padding becomes 24px, and flex cards lose their
// left padding and background color so content sits flush with the page.
function applyLayoutBorderOptionToHtml(html) {
  const mode = layoutBorderSelect ? layoutBorderSelect.value : 'no-borders';
  if (mode === 'borders') return html;

  return String(html || '').replace(/style="([^"]*)"/gi, (match, style) => {
    if (!/border:\s*1px\s+solid\s+#(?:d7dbe0|e1e6eb)/i.test(style)) return match;

    let updated = style.replace(/border:(\s*)1px(\s+solid\s+#(?:d7dbe0|e1e6eb))/gi, 'border:$10px$2');
    updated = updated.replace(/(^|;)(\s*)padding:\s*[^;]+/i, '$1$2padding: 0px 24px 24px 0px');
    // Borderless cards lose their background color so content sits flat on the page.
    updated = updated.replace(/(^|;)(\s*)background(-color)?:\s*[^;]+;?/gi, '$1');

    return `style="${updated}"`;
  });
}

async function buildCustomizedLayoutHtml(layoutKey) {
  let html = window.PSU_CANVAS_LAYOUTS[layoutKey];
  if (typeof html === 'function') html = await html();
  if (html && typeof html.then === 'function') html = await html;
  if (!html) return '';
  html = applyLayoutPrefillToHtml(html, layoutKey);
  html = applyLayoutBorderOptionToHtml(html);
  html = applyLayoutOptionsToHtml(html);
  return applyPaletteToHtml(html);
}

async function updateLayoutPreview() {
  if (!layoutPreviewFrame || !selectedLayoutKey) return;
  const html = await buildCustomizedLayoutHtml(selectedLayoutKey);
  layoutPreviewFrame.srcdoc = `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:10px; font-family:'Lato', Arial, Helvetica, sans-serif; color:#2d3b45;">${html}</body></html>`;
}

// ---------------------------------------------------------------------------
// Recently used: last 5 inserts per panel, persisted in chrome.storage.local.
// ---------------------------------------------------------------------------
const RECENT_STORAGE_KEY = 'ceiRecentInserts';
let recentInserts = { layouts: [], elements: [], assets: [] };

async function loadRecentInserts() {
  try {
    const stored = await chrome.storage.local.get(RECENT_STORAGE_KEY);
    const value = stored[RECENT_STORAGE_KEY];
    if (value && typeof value === 'object') {
      recentInserts = {
        layouts: Array.isArray(value.layouts) ? value.layouts : [],
        elements: Array.isArray(value.elements) ? value.elements : [],
        assets: Array.isArray(value.assets) ? value.assets : []
      };
    }
  } catch (error) {}
  renderRecentRows();
}

function recordRecentInsert(panel, entry) {
  if (!recentInserts[panel] || !entry || !entry.key) return;
  const dedupeKey = entry.dedupe || entry.key;
  recentInserts[panel] = [entry, ...recentInserts[panel].filter((item) => (item.dedupe || item.key) !== dedupeKey)].slice(0, 5);
  try { chrome.storage.local.set({ [RECENT_STORAGE_KEY]: recentInserts }); } catch (error) {}
  renderRecentRows();
}

function renderRecentRows() {
  renderRecentRow('layouts', 'recentLayoutsRow', 'recentLayoutsChips');
  renderRecentRow('elements', 'recentElementsRow', 'recentElementsChips');
  renderRecentRow('assets', 'recentAssetsRow', 'recentAssetsChips');
}

function renderRecentRow(panel, rowId, chipsId) {
  const row = document.getElementById(rowId);
  const chips = document.getElementById(chipsId);
  if (!row || !chips) return;

  const entries = recentInserts[panel] || [];
  row.hidden = entries.length === 0;
  chips.innerHTML = '';

  entries.forEach((entry) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'recent-chip';
    chip.textContent = entry.label || entry.key;
    chip.title = `Open ${entry.label || entry.key}`;
    chip.addEventListener('click', () => activateRecentEntry(panel, entry));
    chips.appendChild(chip);
  });
}

function activateRecentEntry(panel, entry) {
  if (panel === 'layouts') {
    openLayoutOptions(entry.key);
    return;
  }
  if (panel === 'elements') {
    openElementOptions(entry.key);
    return;
  }
  // Assets: restore the icon selection and insert immediately.
  ensureAssetIconGridInitialized();
  selectedAssetKind = 'icons';
  if (entry.collection && assetIconCollectionSelect && assetIconCollectionSelect.value !== entry.collection) {
    assetIconCollectionSelect.value = entry.collection;
    populateAssetIconVariantSelect(entry.collection);
    populateAssetIconSelect();
  }
  if (entry.variant && assetIconVariantSelect) {
    assetIconVariantSelect.value = entry.variant;
    selectedAssetIconVariant = entry.variant;
  }
  selectAssetIcon(entry.key);
  buildSelectedAssetHtml().then((html) => {
    if (!html) return;
    pasteCustomHtml(html, `${entry.label || 'Icon'} pasted into the Canvas editor.`, { insertMode: 'inline-heading' });
  });
}

function setupLayoutOptions() {
  if (layoutOptionsBack) {
    layoutOptionsBack.addEventListener('click', closeLayoutOptions);
  }

  document.querySelectorAll('.layout-swatch').forEach((swatch) => {
    swatch.addEventListener('click', () => {
      selectedLayoutColor = swatch.dataset.color || '#001E44';
      if (layoutCustomColor) layoutCustomColor.value = selectedLayoutColor;
      if (layoutCustomColorHex) layoutCustomColorHex.value = selectedLayoutColor.toUpperCase();
      document.querySelectorAll('.layout-swatch').forEach((button) => button.classList.remove('is-selected'));
      swatch.classList.add('is-selected');
      updateNearestColorToggleSummary(swatch, selectedLayoutColor);
      scheduleLayoutPreviewUpdate();
    });
  });

  if (layoutCustomColor) {
    layoutCustomColor.addEventListener('input', () => {
      selectedLayoutColor = layoutCustomColor.value || '#001E44';
      if (layoutCustomColorHex) layoutCustomColorHex.value = selectedLayoutColor.toUpperCase();
      document.querySelectorAll('.layout-swatch').forEach((button) => button.classList.remove('is-selected'));
      updateNearestColorToggleSummary(layoutCustomColor, selectedLayoutColor);
      scheduleLayoutPreviewUpdate();
    });
  }

  if (layoutCustomColorHex) {
    layoutCustomColorHex.addEventListener('change', () => {
      syncLayoutCustomColor('hex');
      updateNearestColorToggleSummary(layoutCustomColorHex, selectedLayoutColor);
      scheduleLayoutPreviewUpdate();
    });
  }

  if (layoutBorderSelect) {
    layoutBorderSelect.addEventListener('change', scheduleLayoutPreviewUpdate);
  }

  if (layoutInsertButton) {
    layoutInsertButton.addEventListener('click', async () => {
      if (!selectedLayoutKey) return;
      const item = window.PSU_CANVAS_ITEMS.find((entry) => entry.key === selectedLayoutKey);
      const html = await buildCustomizedLayoutHtml(selectedLayoutKey);
      if (!html) {
        setStatus('Element not found.', true);
        return;
      }

      recordRecentInsert('layouts', { key: selectedLayoutKey, label: item ? item.title : selectedLayoutKey });

      await pasteCustomHtml(wrapContentInsertSpacing(html), `${item ? item.title : 'Layout'} pasted into the Canvas editor.`);
      closeLayoutOptions();
    });
  }

  if (layoutCopyHtmlButton) {
    layoutCopyHtmlButton.addEventListener('click', async () => {
      if (!selectedLayoutKey) return;
      const html = await buildCustomizedLayoutHtml(selectedLayoutKey);
      if (!html) return;
      await navigator.clipboard.writeText(html);
      setStatus('Layout HTML copied to the clipboard.', false);
    });
  }
}


function normalizeElementHexColor(value) {
  const fallback = '#001E44';
  if (!value) return fallback;
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toUpperCase();
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed.toUpperCase()}`;
  return fallback;
}

function syncElementCustomColor(source) {
  if (!elementCustomColor || !elementCustomColorHex) return;

  if (source === 'hex') {
    const normalized = normalizeElementHexColor(elementCustomColorHex.value);
    selectedElementColor = normalized;
    elementCustomColor.value = normalized;
    elementCustomColorHex.value = normalized;
  } else {
    selectedElementColor = elementCustomColor.value || '#001E44';
    elementCustomColorHex.value = selectedElementColor.toUpperCase();
  }

  document.querySelectorAll('.element-swatch').forEach((button) => button.classList.remove('is-selected'));
  updateColorToggleSummary(document.querySelector('.element-color-options'), selectedElementColor);
}

function getBuilderTypeForElement(key) {
  const map = {
    editableAccordion: 'accordion',
    faqShowHide: 'faq',
    qaShowHide: 'qa',
    knowledgeCheck: 'knowledge'
  };
  return map[key] || null;
}

function openElementOptions(elementKey) {
  const item = window.PSU_CANVAS_ITEMS.find((entry) => entry.key === elementKey);
  if (!item) return;

  selectedElementKey = elementKey;
  selectedElementColor = elementKey === 'dataTable' ? TABLE_DEFAULT_HEADER_COLOR : '#001E44';

  if (elementOptionsTitle) elementOptionsTitle.textContent = item.title || 'Element Options';
  if (elementOptionsDesc) elementOptionsDesc.textContent = item.desc || 'Customize this element before inserting it into Canvas.';
  if (elementCustomColor) elementCustomColor.value = selectedElementColor;
  if (elementCustomColorHex) elementCustomColorHex.value = selectedElementColor;
  updateColorToggleSummary(document.querySelector('.element-color-options'), selectedElementColor);
  if (conceptCheckerEmbed) conceptCheckerEmbed.value = '';
  const transcriptConfig = getTranscriptConfig(elementKey);
  if (transcriptEmbedLabel) transcriptEmbedLabel.textContent = 'Iframe Embed';
  if (transcriptEmbedLink) {
    transcriptEmbedLink.textContent = transcriptConfig.embedLinkLabel;
    transcriptEmbedLink.href = transcriptConfig.embedLinkUrl;
  }
  if (videoTranscriptIframe) videoTranscriptIframe.value = '';
  if (videoTranscriptIframe) videoTranscriptIframe.setAttribute('aria-label', `${transcriptConfig.mediaType} iframe embed HTML`);
  if (transcriptSummaryLabel) transcriptSummaryLabel.textContent = 'Transcript link text';
  if (videoTranscriptSummary) videoTranscriptSummary.value = transcriptConfig.summaryDefault;
  if (videoTranscriptSummary) videoTranscriptSummary.placeholder = transcriptConfig.summaryDefault;
  if (transcriptTextLabel) transcriptTextLabel.textContent = `${transcriptConfig.mediaType} transcript`;
  if (videoTranscriptText) videoTranscriptText.value = '';
  if (videoTranscriptText) videoTranscriptText.placeholder = transcriptConfig.transcriptPlaceholder;
  if (videoTranscriptText) videoTranscriptText.setAttribute('aria-label', `${transcriptConfig.mediaType} transcript text`);
  if (showHideSummary) showHideSummary.value = 'Add text for a show/hide element';
  if (showHideText) showHideText.value = '';
  if (calloutBoxStyleSelect) calloutBoxStyleSelect.value = 'left-line';
  if (calloutTitleInput) calloutTitleInput.value = 'Callout Box';
  if (calloutBodyInput) calloutBodyInput.value = '';
  if (tableCaptionInput) tableCaptionInput.value = '';
  if (tableColumnsSelect) tableColumnsSelect.value = '3';
  if (tableRowsSelect) tableRowsSelect.value = '3';
  if (tableHeaderScopeSelect) tableHeaderScopeSelect.value = 'row';
  if (tableHeaderLabels) tableHeaderLabels.value = '';
  if (transcriptStyleSelect) transcriptStyleSelect.value = 'link';
  if (transcriptAlignSelect) transcriptAlignSelect.value = 'center';
  if (showHideStyleSelect) showHideStyleSelect.value = 'link';
  if (showHideAlignSelect) showHideAlignSelect.value = 'left';

  document.querySelectorAll('.element-swatch').forEach((swatch) => {
    swatch.classList.toggle('is-selected', swatch.dataset.color === selectedElementColor);
  });

  const isBuilderElement = Boolean(getBuilderTypeForElement(elementKey));
  const isCallout = elementKey === 'calloutBox';
  const isConceptChecker = elementKey === 'conceptChecker';
  const isTranscript = elementKey === 'videoTranscript' || elementKey === 'podcastTranscript';
  const isShowHide = elementKey === 'showHide';
  const isTable = elementKey === 'dataTable';

  if (conceptCheckerEmbedOptions) conceptCheckerEmbedOptions.hidden = !isConceptChecker;
  if (videoTranscriptOptions) videoTranscriptOptions.hidden = !isTranscript;
  if (showHideOptions) showHideOptions.hidden = !isShowHide;
  if (elementBuilderOptions) elementBuilderOptions.hidden = !isBuilderElement;
  if (calloutBoxOptions) calloutBoxOptions.hidden = !isCallout;
  if (tableOptions) tableOptions.hidden = !isTable;

  renderElementBuilderFields();

  if (elementMainView) elementMainView.hidden = true;
  if (elementOptionsView) elementOptionsView.hidden = false;
  setStatus('Customize the selected element, then choose Insert Element.', false);
}

function closeElementOptions() {
  selectedElementKey = null;
  if (elementOptionsView) elementOptionsView.hidden = true;
  if (elementMainView) elementMainView.hidden = false;
  setStatus('Choose an element to paste into Canvas.', false);
}

function applyElementOptionsToHtml(html) {
  let updated = String(html || '');
  const color = selectedElementColor || (elementCustomColor ? elementCustomColor.value : '#001E44');

  updated = updated
    .replaceAll('#001E44', color)
    .replaceAll('#003366', color)
    .replaceAll('#1e407c', color)
    .replaceAll('#1E407C', color)
    .replaceAll('#123061', color)
    .replaceAll('#2f81d3', color)
    .replaceAll('#1a73e4', color);

  return updated;
}





function getCeiSvgIconCollections() {
  return ["general", "icon-banners", "fill-icons"];
}

function getCeiSvgIconEntries(collection = '') {
  const icons = Array.isArray(window.CEI_SVG_ICON_LIBRARY) ? window.CEI_SVG_ICON_LIBRARY : [];
  const filteredIcons = collection ? icons.filter((icon) => icon.collection === collection) : icons;
  return [...filteredIcons].sort((a, b) =>
    String(a.label || '').localeCompare(String(b.label || ''), undefined, {
      sensitivity: 'base',
      numeric: true
    })
  );
}

function getCeiSvgIconEntry(iconKey) {
  const icons = getCeiSvgIconEntries();
  return icons.find((icon) => icon.key === iconKey) || icons[0] || null;
}

function getCeiSvgUrl(iconKey) {
  const entry = getCeiSvgIconEntry(iconKey);
  if (!entry || !entry.path) return '';

  const encodedPath = String(entry.path)
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');

  return `${CEI_PUBLIC_ASSET_BASE}/${encodedPath}`;
}


async function fetchCeiSvgIcon(iconKey, color = '#001E44', size = 50) {
  const entry = getCeiSvgIconEntry(iconKey);
  if (!entry) {
    return `<span aria-hidden="true" style="display:inline-block;width:${size}px;height:${size}px;"></span>`;
  }

  const url = getCeiSvgUrl(iconKey);
  const type = (entry.type || '').toLowerCase();

  if (type === 'instructure' || entry.collection === 'instructure') {
    const iconClass = entry.iconClass || `icon-${String(iconKey).replace(/^instructure-/, '')}`;
    return buildInstructureAssetIconHtml(iconClass, color, size, false);
  }

  if (type === 'png' || /\.png$/i.test(entry.path || '')) {
    return `<img src="${url}" alt="" aria-hidden="true" width="65" style="height:65px;width:auto;max-width:none;display:inline-block;vertical-align:middle;flex:0 0 auto;">`;
  }

  // Basic SVGs are inserted as normal public images so they display after Canvas save.
  return `<img src="${url}" alt="" aria-hidden="true" width="${size}" height="${size}" style="width:${size}px;height:${size}px;max-width:none;display:inline-block;vertical-align:middle;flex:0 0 auto;">`;
}


function getCalloutSvgIcon(iconKey, color) {
  const stroke = color || '#001E44';
  const attrs = `width="25" height="25" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="width:25px;height:25px;display:inline-block;vertical-align:middle;flex:0 0 25px;"`;
  const common = `stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"`;

  const icons = {
    'icon-info': `<svg ${attrs}><circle cx="24" cy="24" r="19" ${common}/><path d="M24 21v13" ${common}/><path d="M24 14.5h.01" ${common}/></svg>`,
    'icon-announcement': `<svg ${attrs}><path d="M8 28h7l17 8V12L15 20H8v8Z" ${common}/><path d="M15 28v8" ${common}/><path d="M36 19c2 1 3 3 3 5s-1 4-3 5" ${common}/></svg>`,
    'icon-assignment': `<svg ${attrs}><path d="M15 6h18l7 7v29H15V6Z" ${common}/><path d="M32 6v8h8" ${common}/><path d="M21 22h12" ${common}/><path d="M21 30h12" ${common}/></svg>`,
    'icon-discussion': `<svg ${attrs}><path d="M9 12h30v20H18l-9 7V12Z" ${common}/><path d="M16 20h16" ${common}/><path d="M16 27h11" ${common}/></svg>`,
    'icon-quiz': `<svg ${attrs}><path d="M24 42c9.941 0 18-8.059 18-18S33.941 6 24 6 6 14.059 6 24s8.059 18 18 18Z" ${common}/><path d="M19 18a5 5 0 0 1 10 1c0 4-5 4.5-5 8" ${common}/><path d="M24 34h.01" ${common}/></svg>`,
    'icon-video': `<svg ${attrs}><rect x="7" y="12" width="25" height="24" rx="3" ${common}/><path d="m32 21 9-6v18l-9-6v-6Z" ${common}/></svg>`,
    'icon-audio': `<svg ${attrs}><path d="M8 20h8l12-9v26L16 28H8v-8Z" ${common}/><path d="M34 18c2 2 3 4 3 6s-1 4-3 6" ${common}/><path d="M39 13c4 4 6 7 6 11s-2 7-6 11" ${common}/></svg>`,
    'icon-document': `<svg ${attrs}><path d="M14 6h15l7 7v29H14V6Z" ${common}/><path d="M29 6v8h7" ${common}/><path d="M20 23h10" ${common}/><path d="M20 31h12" ${common}/></svg>`,
    'icon-check': `<svg ${attrs}><circle cx="24" cy="24" r="18" ${common}/><path d="m16 24 6 6 11-13" ${common}/></svg>`
  };

  return icons[iconKey] || icons['icon-info'];
}


function buildCustomIconWrapper(iconHtml, iconColor) {
  if (!iconHtml) return '';
  return `<span aria-hidden="true" style="display:inline-flex;align-items:center;justify-content:center;min-width:72px;height:72px;margin-right:2px;">${iconHtml}</span>`;
}



function getCeiHexLuminance(hexColor) {
  const fallback = '#001E44';
  const hex = (hexColor || fallback).replace('#', '').trim();
  const normalized = hex.length === 3
    ? hex.split('').map((char) => char + char).join('')
    : hex.padEnd(6, '0').slice(0, 6);

  const values = [0, 2, 4].map((index) => {
    const channel = parseInt(normalized.slice(index, index + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });

  return (0.2126 * values[0]) + (0.7152 * values[1]) + (0.0722 * values[2]);
}

function getCeiContrastIconColor(backgroundColor) {
  // White works best on dark/mid backgrounds. For very light selected colors,
  // use Penn State navy so the icon remains visible.
  return getCeiHexLuminance(backgroundColor) > 0.68 ? '#001E44' : '#ffffff';
}


async function buildSelectedElementHtml() {
  if (!selectedElementKey) return '';

  if (selectedElementKey === 'conceptChecker') {
    const color = selectedElementColor || '#001E44';
    const embedHtml = conceptCheckerEmbed ? conceptCheckerEmbed.value.trim() : '';

    return `<p>&nbsp;</p>
<hr style="height: 8px; color: ${color}; background-color: ${color}; margin: 40px 0px; border: medium none currentcolor;" />
<h2 style="text-align: right;"><i class="icon-check"></i>&nbsp;Concept Checkpoint</h2>
<p style="text-align: center;">${embedHtml}</p>
<p>&nbsp;</p>
<p>&nbsp;</p>`;
  }

  if (selectedElementKey === 'videoTranscript' || selectedElementKey === 'podcastTranscript') {
    const transcriptConfig = getTranscriptConfig(selectedElementKey);
    const iframeEmbed = videoTranscriptIframe ? videoTranscriptIframe.value : '';
    const summaryText = videoTranscriptSummary && videoTranscriptSummary.value.trim()
      ? videoTranscriptSummary.value.trim()
      : transcriptConfig.summaryDefault;
    const transcriptText = videoTranscriptText ? videoTranscriptText.value : '';

    const transcriptToggleStyle = transcriptStyleSelect ? transcriptStyleSelect.value : 'link';
    const transcriptAlign = ['left', 'center', 'right'].includes(transcriptAlignSelect && transcriptAlignSelect.value)
      ? transcriptAlignSelect.value
      : 'center';

    if (transcriptToggleStyle === 'button') {
      const transcriptButtonColor = selectedElementColor || '#001E44';
      const transcriptButtonTextColor = getCeiContrastIconColor(transcriptButtonColor);
      return `${buildVideoTranscriptIframeHtml(iframeEmbed)}<details style="margin:0 0 25px; text-align:${transcriptAlign};">
<summary style="display:inline-block; cursor:pointer; list-style:none; border:1px solid ${transcriptButtonColor}; border-radius:4px; background:${transcriptButtonColor}; color:${transcriptButtonTextColor}; padding:10px 18px; font-weight:700; line-height:1.4;">${escapeHtmlText(summaryText)}</summary>
<div style="border-width: 1px;border-style: solid;border-color: #E1E6F1;padding: 10px 20px;margin-top: 20px;overflow: auto;border-radius: 8px;background: #ffffff;text-align: left;">
${buildTranscriptParagraphs(transcriptText)}
</div>
</details>`;
    }

    return `${buildVideoTranscriptIframeHtml(iframeEmbed)}<details>
<summary style="cursor: pointer;text-align: ${transcriptAlign};">${escapeHtmlText(summaryText)}</summary>
<div style="border-width: 1px;border-style: solid;border-color: #E1E6F1;padding: 10px 20px;margin-top: 20px;overflow: auto;border-radius: 8px;background: #ffffff;text-align: left;">
${buildTranscriptParagraphs(transcriptText)}
</div>
</details>`;
  }

  if (selectedElementKey === 'showHide') {
    const summaryText = showHideSummary && showHideSummary.value.trim()
      ? showHideSummary.value.trim()
      : 'Add text for a show/hide element';
    const contentText = showHideText ? showHideText.value : '';
    const toggleStyle = showHideStyleSelect ? showHideStyleSelect.value : 'link';
    const align = ['left', 'center', 'right'].includes(showHideAlignSelect && showHideAlignSelect.value)
      ? showHideAlignSelect.value
      : 'left';

    if (toggleStyle === 'link') {
      // Same toggle link as the Podcast/Video Transcript elements.
      return `<details>
<summary style="cursor: pointer;text-align: ${align};">${escapeHtmlText(summaryText)}</summary>
<div style="border-width: 1px;border-style: solid;border-color: #E1E6F1;padding: 10px 20px;margin-top: 20px;overflow: auto;border-radius: 8px;background: #ffffff;text-align: left;">
${buildDetailsParagraphs(contentText, 'Add text or media...')}
</div>
</details>`;
    }

    const buttonColor = selectedElementColor || '#001E44';
    const buttonTextColor = getCeiContrastIconColor(buttonColor);

    return `<details style="margin:0 0 25px; text-align:${align};">
<summary style="display:inline-block; cursor:pointer; list-style:none; border:1px solid ${buttonColor}; border-radius:4px; background:${buttonColor}; color:${buttonTextColor}; padding:10px 18px; font-weight:700; line-height:1.4;">${escapeHtmlText(summaryText)}</summary>
<div style="border-width: 1px;border-style: solid;border-color: #E1E6F1;padding: 10px 20px;margin-top: 20px;overflow: auto;border-radius: 8px;background: #ffffff;text-align: left;">
${buildDetailsParagraphs(contentText, 'Add text or media...')}
</div>
</details>`;
  }

  if (selectedElementKey === 'calloutBox') {
    const color = selectedElementColor || '#001E44';
    const boxStyle = calloutBoxStyleSelect ? calloutBoxStyleSelect.value : 'left-line';
    const padding = '30px';
    const isFullBackground = boxStyle === 'full-background';
    const calloutBackground = isFullBackground ? color : '#f7f9fb';
    const calloutTextColor = isFullBackground ? getCeiContrastIconColor(color) : color;
    const calloutBodyColor = isFullBackground ? getCeiContrastIconColor(color) : '#2d3b45';
    const calloutBorders = isFullBackground
      ? 'border: 1px solid #d7dbe0;'
      : `border-left: 8px solid ${color}; border-top: 1px solid #d7dbe0; border-right: 1px solid #d7dbe0; border-bottom: 1px solid #d7dbe0;`;


    const calloutTitle = calloutTitleInput && calloutTitleInput.value.trim() ? calloutTitleInput.value.trim() : 'Callout Box';
    const calloutBody = calloutBodyInput && calloutBodyInput.value.trim() ? calloutBodyInput.value.trim() : 'Add or paste callout content here.';

    return `<div class="cei-callout-box" style="${calloutBorders} background:${calloutBackground}; border-radius: 8px; padding:${padding}; margin:20px 0; line-height:1.55;">
  <h2 style="display:inline-block; vertical-align:middle; margin:0 0 10px; color:${calloutTextColor};">${escapeHtmlText(calloutTitle)}</h2>
  <p style="margin:0; color:${calloutBodyColor};">${escapeHtmlText(calloutBody)}</p>
</div>
<p>&nbsp;</p>`;
  }

  if (selectedElementKey === 'dataTable') {
    return buildDataTableHtml();
  }

  const builderType = getBuilderTypeForElement(selectedElementKey);
  if (builderType) {
    const count = elementBuilderCount ? elementBuilderCount.value : 3;
    return applyElementOptionsToHtml(buildInteractiveHtml(builderType, count, collectElementBuilderValues()));
  }

  const html = window.PSU_CANVAS_LAYOUTS[selectedElementKey];
  return applyElementOptionsToHtml(html);
}



function setupElementOptionsPanel() {
  if (elementOptionsBack) {
    elementOptionsBack.addEventListener('click', closeElementOptions);
  }

  document.querySelectorAll('.element-swatch').forEach((swatch) => {
    swatch.addEventListener('click', () => {
      selectedElementColor = swatch.dataset.color || '#001E44';
      if (elementCustomColor) elementCustomColor.value = selectedElementColor;
      if (elementCustomColorHex) elementCustomColorHex.value = selectedElementColor.toUpperCase();
      document.querySelectorAll('.element-swatch').forEach((button) => button.classList.remove('is-selected'));
      swatch.classList.add('is-selected');
      updateNearestColorToggleSummary(swatch, selectedElementColor);
    });
  });

  if (elementCustomColor) {
    elementCustomColor.addEventListener('input', () => {
      syncElementCustomColor('picker');
      updateNearestColorToggleSummary(elementCustomColor, selectedElementColor);
    });
  }

  if (elementCustomColorHex) {
    elementCustomColorHex.addEventListener('change', () => {
      syncElementCustomColor('hex');
      updateNearestColorToggleSummary(elementCustomColorHex, selectedElementColor);
    });
  }

  if (elementBuilderCount) {
    elementBuilderCount.addEventListener('change', renderElementBuilderFields);
  }

  if (elementInsertButton) {
    elementInsertButton.addEventListener('click', async () => {
      const html = await buildSelectedElementHtml();
      if (!html) return;
      const item = window.PSU_CANVAS_ITEMS.find((entry) => entry.key === selectedElementKey);
      recordRecentInsert('elements', { key: selectedElementKey, label: item ? item.title : selectedElementKey });
      await pasteCustomHtml(wrapContentInsertSpacing(html), 'Element pasted into the Canvas editor.');
      closeElementOptions();
    });
  }

  if (elementCopyHtmlButton) {
    elementCopyHtmlButton.addEventListener('click', async () => {
      const html = await buildSelectedElementHtml();
      if (!html) return;
      await navigator.clipboard.writeText(html);
      setStatus('Element HTML copied to the clipboard.', false);
    });
  }
}

function showPanel(index) {
  const panelCount = slider ? slider.children.length : 5;
  if (index === 3) ensureAssetIconGridInitialized();
  slider.style.transform = `translateX(-${index * (100 / panelCount)}%)`;
  document.querySelectorAll('.panel-tab').forEach((tab) => {
    const isActive = Number(tab.dataset.panel) === index;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });
  setStatus(panelMessages[index], false);
}

async function pasteLayout(layoutKey, options = {}) {
  const item = window.PSU_CANVAS_ITEMS.find((entry) => entry.key === layoutKey);
  let html = window.PSU_CANVAS_LAYOUTS[layoutKey];

  if (typeof html === 'function') {
    html = await html();
  }

  if (html && typeof html.then === 'function') {
    html = await html;
  }

  if (item && item.panel === 'assets') {
    html = applyAssetOptionsToHtml(html);
  }

  if (options.applyLayoutOptions) {
    html = applyLayoutOptionsToHtml(html);
  }

  html = applyPaletteToHtml(html);

  if (!html) {
    setStatus('Element not found.', true);
    return;
  }

  const shouldWrapContent = item && (item.panel === 'layouts' || item.panel === 'interactive');
  await pasteCustomHtml(shouldWrapContent ? wrapContentInsertSpacing(html) : html, `${item ? item.title : 'Content'} pasted into the Canvas editor.`);
}


async function getSavedAiStudioTab() {
  try {
    const result = await chrome.storage.local.get('aiStudioTabId');
    const savedTabId = result.aiStudioTabId;

    if (!savedTabId) return null;

    const tab = await chrome.tabs.get(savedTabId);

    if (tab && tab.id) {
      return tab;
    }

    return null;
  } catch (error) {
    await chrome.storage.local.remove('aiStudioTabId');
    return null;
  }
}

async function focusTab(tab) {
  if (!tab || !tab.id) return false;

  try {
    await chrome.tabs.update(tab.id, { active: true });

    if (typeof tab.windowId === 'number') {
      await chrome.windows.update(tab.windowId, { focused: true });
    }

    return true;
  } catch (error) {
    return false;
  }
}

async function createAndSaveAiStudioTab() {
  const tab = await chrome.tabs.create({ url: AI_STUDIO_URL });

  if (tab && tab.id) {
    await chrome.storage.local.set({ aiStudioTabId: tab.id });
  }

  return tab;
}

async function openAiStudio() {
  const savedTab = await getSavedAiStudioTab();

  if (savedTab) {
    const focused = await focusTab(savedTab);

    if (focused) {
      showAiCopyStatus('Open AI Studio using the button above.');
      return;
    }

    await chrome.storage.local.remove('aiStudioTabId');
  }

  await createAndSaveAiStudioTab();
}

async function copyPromptAndOpenAiStudio(prompt, title) {
  await navigator.clipboard.writeText(prompt);

  const savedTab = await getSavedAiStudioTab();

  if (savedTab) {
    const focused = await focusTab(savedTab);

    if (focused) {
      showAiCopyStatus(`Copied "${title}" prompt and focused your saved AI Studio tab.`);
      return;
    }

    await chrome.storage.local.remove('aiStudioTabId');
  }

  await createAndSaveAiStudioTab();
  showAiCopyStatus(`Copied "${title}" prompt. Open AI Studio using the button above and paste the copied prompt.`);
}

const aiStudioPrompts = [
  {
    title: 'Canvas Page Builder',
    category: 'Canvas Pages',
    desc: 'Generate a Canvas page from learning objectives.',
    prompt: `Create a Canvas LMS page for the following topic:
[course topic]

Audience:
[student audience]

Learning objectives:
- [objective 1]
- [objective 2]
- [objective 3]

Use a friendly, student-centered tone. Include an H2 title, a short overview, clear sections, and concise directions. Keep the content easy to scan.`
  },
  {
    title: 'Layout Recommender',
    category: 'Canvas Pages',
    desc: 'Recommend the best PSU Canvas Style Guide layout.',
    prompt: `I am using the PSU Canvas Style Guide Chrome Extension. Recommend the best layout for this Canvas content need:

[describe the page, module, activity, or content]

Available layout categories:
- Pages: Hero + 3 Cards, Two Column Guide
- Columns: Two Columns, Three Columns, Four Columns
- Images: Full Image + Caption, Text + Image Right, Image Left + Text

Explain which layout is best and why.`
  },
  {
    title: 'Module Introduction',
    category: 'Module Design',
    desc: 'Create a module overview.',
    prompt: `Create a Canvas module introduction for:
[module topic]

Use a friendly tone. Include:
- A brief overview
- 3 learning objectives
- A short "What to do this week" checklist
- A reminder about where students should submit work`
  },
  {
    title: 'Discussion Prompt',
    category: 'Assessment',
    desc: 'Generate discussion questions.',
    prompt: `Create a Canvas discussion prompt for:
[topic]

Include:
- A short setup paragraph
- One main discussion question
- Two follow-up questions
- Student reply expectations
- A reminder to support claims with course materials`
  },
  {
    title: 'Knowledge Check',
    category: 'Assessment',
    desc: 'Create low-stakes quiz questions.',
    prompt: `Create a short Canvas knowledge check for:
[topic]

Include:
- 5 multiple-choice questions
- 4 answer choices per question
- Correct answer
- Brief feedback for each question
Keep the tone supportive and low-stakes.`
  },
  {
    title: 'Accessibility Review',
    category: 'Accessibility',
    desc: 'Review content for accessibility.',
    prompt: `Review the following Canvas page content for accessibility issues:

[paste content here]

Check for:
- Heading structure
- Link text clarity
- Image alt text needs
- Table/accessibility concerns
- Reading clarity
- Color or visual-only instructions

Return a short prioritized list of fixes.`
  },
  {
    title: 'Course Welcome',
    category: 'Course Design',
    desc: 'Generate welcome page content.',
    prompt: `Create a welcoming Canvas course introduction for:
[course name]

Include:
- A warm welcome message
- What students can expect
- How to get started
- How to contact the instructor
- A short success tip`
  },
  {
    title: 'Learning Objectives',
    category: 'Course Design',
    desc: 'Write measurable objectives.',
    prompt: `Write measurable learning objectives for:
[topic or module]

Create 3-5 objectives using clear action verbs. Keep them student-friendly and aligned with college-level learning.`
  },
  {
    title: 'Assignment Overview',
    category: 'Assessment',
    desc: 'Explain an assignment clearly.',
    prompt: `Create a Canvas assignment overview for:
[assignment name]

Include:
- Purpose
- Steps to complete
- What to submit
- Evaluation criteria
- Due date placeholder
Use clear student-facing language.`
  },
  {
    title: 'Weekly Checklist',
    category: 'Module Design',
    desc: 'Create a student task list.',
    prompt: `Create a weekly Canvas checklist for:
[week/module topic]

Include:
- Review items
- Practice activities
- Discussion or assignment tasks
- Submission reminders
Keep it concise and easy to scan.`
  },
  {
    title: 'Rewrite for Students',
    category: 'Course Design',
    desc: 'Make content clearer and friendlier.',
    prompt: `Rewrite the following Canvas content so it is clearer, friendlier, and easier for students to follow:

[paste content here]

Keep the meaning the same. Use short paragraphs, clear headings, and direct instructions.`
  },
  {
    title: 'Alt Text Helper',
    category: 'Multimedia',
    desc: 'Draft accessible image alt text.',
    prompt: `Write accessible alt text for this image:
[describe image or paste context]

Also provide:
- Decorative alt option if the image is decorative
- A longer description option if the image contains important details`
  },
  {
    title: 'Video Summary Prompt',
    category: 'Multimedia',
    desc: 'Create student-facing context for a course video.',
    prompt: `Create a short Canvas video introduction for:
[video topic or title]

Include:
- Why students are watching it
- What to pay attention to
- 2 reflection questions
- A short follow-up activity`
  },
  {
    title: 'Image-Based Activity',
    category: 'Multimedia',
    desc: 'Turn an image into a learning activity.',
    prompt: `Create a Canvas learning activity around this image:
[describe image]

Include:
- A short introduction
- Observation prompts
- Analysis questions
- A brief reflection task`
  }
];

const localLayoutRecommendations = [
  {
    title: 'Hero + 3 Cards',
    category: 'Pages',
    keywords: ['welcome', 'start', 'home', 'overview', 'intro', 'introduction', 'quick links', 'landing', 'module'],
    reason: 'Use this when you need a strong opening section with three quick actions, links, or next steps.'
  },
  {
    title: 'Two Column Guide',
    category: 'Pages',
    keywords: ['guide', 'instructions', 'overview', 'callout', 'reminder', 'note', 'explain', 'directions'],
    reason: 'Use this when you want main content beside a reminder, note, or callout panel.'
  },
  {
    title: 'Two Columns',
    category: 'Columns',
    keywords: ['two', '2', 'compare', 'comparison', 'side by side', 'left right', 'pros cons'],
    reason: 'Use this for two equal content areas that should stack on smaller screens.'
  },
  {
    title: 'Three Columns',
    category: 'Columns',
    keywords: ['three', '3', 'steps', 'options', 'choices', 'three sections'],
    reason: 'Use this for three short sections, steps, resources, or choices.'
  },
  {
    title: 'Four Columns',
    category: 'Columns',
    keywords: ['four', '4', 'resources', 'categories', 'topics', 'cards'],
    reason: 'Use this for four compact items, categories, resource links, or topic cards.'
  },
  {
    title: 'Full Image + Caption',
    category: 'Images',
    keywords: ['image', 'caption', 'photo', 'diagram', 'visual', 'banner', 'full image'],
    reason: 'Use this for a large visual, diagram, featured image, or banner with a caption.'
  },
  {
    title: 'Text + Image Right',
    category: 'Images',
    keywords: ['image right', 'text left', 'reflection', 'prompt', 'picture right'],
    reason: 'Use this when the text should lead and the supporting image should appear on the right.'
  },
  {
    title: 'Image Left + Text',
    category: 'Images',
    keywords: ['image left', 'text right', 'picture left', 'reading', 'visual left'],
    reason: 'Use this when an image should introduce or anchor text on the right.'
  }
];

function renderAiStudioPrompts() {
  const container = document.getElementById('aiStudioPromptGrid');
  if (!container) return;
  container.innerHTML = '';

  aiStudioPrompts.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'prompt-card';
    card.dataset.searchText = `${item.title} ${item.category} ${item.desc} ${item.prompt}`.toLowerCase();
    card.dataset.category = item.category;

    const category = document.createElement('span');
    category.className = 'prompt-category';
    category.textContent = item.category;

    const title = document.createElement('strong');
    title.textContent = item.title;

    const desc = document.createElement('p');
    desc.textContent = item.desc;

    const preview = document.createElement('div');
    preview.className = 'prompt-preview';
    preview.textContent = item.prompt;

    const actions = document.createElement('div');
    actions.className = 'prompt-actions';

    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.textContent = 'Copy Prompt';
    copyButton.addEventListener('click', async () => {
      await navigator.clipboard.writeText(item.prompt);
      showAiCopyStatus(`Copied "${item.title}" prompt. Open AI Studio using the button above and paste it into the chat.`);
    });

    actions.appendChild(copyButton);

    card.appendChild(category);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(preview);
    card.appendChild(actions);

    container.appendChild(card);
  });

  filterAiPromptCards();
}

function showAiCopyStatus(message) {
  const container = document.getElementById('aiStudioPromptGrid');
  if (!container) return;

  let status = container.querySelector('.copy-status');
  if (!status) {
    status = document.createElement('div');
    status.className = 'copy-status';
    container.prepend(status);
  }

  status.textContent = message;
  setTimeout(() => {
    if (status && status.parentNode) status.remove();
  }, 3500);
}

function filterAiPromptCards() {
  const input = document.getElementById('aiPromptSearch');
  const categorySelect = document.getElementById('aiPromptCategory');
  const container = document.getElementById('aiStudioPromptGrid');
  if (!container) return;

  const query = input ? normalizeSearchText(input.value) : '';
  const category = categorySelect ? categorySelect.value : 'all';
  const cards = Array.from(container.querySelectorAll('.prompt-card'));
  let visibleCount = 0;

  cards.forEach((card) => {
    const matchesSearch = !query || (card.dataset.searchText || '').includes(query);
    const matchesCategory = category === 'all' || card.dataset.category === category;
    const isVisible = matchesSearch && matchesCategory;
    card.classList.toggle('is-hidden', !isVisible);
    if (isVisible) visibleCount += 1;
  });

  let noResults = container.querySelector('.no-results');
  if (!visibleCount) {
    if (!noResults) {
      noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.textContent = 'No matching AI prompts found.';
      container.appendChild(noResults);
    }
  } else if (noResults) {
    noResults.remove();
  }
}

function setupAiPromptSearch() {
  const input = document.getElementById('aiPromptSearch');
  const categorySelect = document.getElementById('aiPromptCategory');

  if (input) input.addEventListener('input', filterAiPromptCards);
  if (categorySelect) categorySelect.addEventListener('change', filterAiPromptCards);
}

function scoreLocalLayout(text, item) {
  const query = normalizeSearchText(text);
  let score = 0;

  item.keywords.forEach((keyword) => {
    if (query.includes(keyword)) score += keyword.length > 7 ? 3 : 2;
  });

  normalizeSearchText(item.title).split(' ').forEach((word) => {
    if (word.length > 2 && query.includes(word)) score += 1;
  });

  return score;
}

function getAvailableLayoutAndElementItems() {
  return window.PSU_CANVAS_ITEMS.filter((item) => item.panel === 'layouts' || item.panel === 'interactive');
}

function getRecommendationTypeLabel(item) {
  return item.panel === 'layouts' ? 'Layout' : 'Element';
}

function getItemKeywordMap(item) {
  const keywordMap = {
    twoColumn5050: ['two column', '50/50', 'equal columns', 'overview and checklist', 'module overview', 'assignment checklist', 'side by side'],
    twoColumn6238: ['two column', '62/38', 'sidebar', 'wide content', 'this week', 'due dates', 'aside', 'main and sidebar'],
    twoColumn3862: ['two column', '38/62', 'sidebar left', 'resources', 'assignment instructions', 'checklist', 'aside left'],
    threeColumn: ['three columns', '3 columns', 'three', 'overview activities assignments', 'three cards', 'three sections'],
    fourColumn: ['four columns', '4 columns', 'four', 'read watch practice submit', 'four cards', 'workflow'],
    fiveColumn: ['five columns', '5 columns', 'five', 'steps', 'step by step', 'five cards', 'weekly workflow', 'process'],
    fullImage: ['image', 'full image', 'banner', 'photo', 'caption', 'figure', 'hero image', 'large image', 'visual'],
    imageRight: ['image right', 'text left', 'picture right', 'right image', 'text and image', 'media right'],
    imageLeft: ['image left', 'text right', 'picture left', 'left image', 'media left', 'visual left'],

    dataTable: ['table', 'data table', 'grid', 'rows', 'columns', 'schedule', 'comparison', 'matrix', 'chart', 'due dates', 'rubric'],
    calloutBox: ['callout', 'box', 'highlight', 'important', 'notice', 'attention', 'example', 'key idea', 'reminder', 'note'],
    conceptChecker: ['concept', 'checker', 'checkpoint', 'h5p', 'interactive', 'check understanding', 'quick check', 'knowledge check', 'practice'],
    editableAccordion: ['accordion', 'expand', 'collapse', 'details', 'show hide', 'faq', 'sections', 'reveal'],
    faqShowHide: ['faq', 'questions', 'frequently asked', 'show hide', 'help', 'answers'],
    qaShowHide: ['q&a', 'qa', 'question answer', 'questions and answers', 'show answer', 'reveal answer'],
    knowledgeCheck: ['knowledge check', 'quiz', 'practice', 'check understanding', 'self check', 'low stakes', 'questions'],
    podcastTranscript: ['podcast transcript', 'podcast', 'audio transcript', 'episode transcript', 'accessible podcast', 'details', 'summary'],
    videoTranscript: ['video transcript', 'transcript', 'caption', 'captions', 'video text', 'accessible video', 'details', 'summary'],
    showHide: ['show hide', 'show/hide', 'details', 'summary', 'expand', 'collapse', 'reveal', 'text', 'media']
  };

  return keywordMap[item.key] || [];
}

function scoreRecommenderItem(description, item) {
  const query = normalizeSearchText(description);
  if (!query) return 0;

  let score = 0;
  const title = normalizeSearchText(item.title || '');
  const desc = normalizeSearchText(item.desc || '');
  const key = normalizeSearchText(item.key || '');
  const type = item.panel === 'layouts' ? 'layout' : 'element';

  getItemKeywordMap(item).forEach((keyword) => {
    const normalizedKeyword = normalizeSearchText(keyword);
    if (query.includes(normalizedKeyword)) {
      score += normalizedKeyword.length > 8 ? 6 : 4;
    }
  });

  title.split(' ').forEach((word) => {
    if (word.length > 2 && query.includes(word)) score += 2;
  });

  desc.split(' ').forEach((word) => {
    if (word.length > 4 && query.includes(word)) score += 1;
  });

  if (query.includes(type)) score += 2;
  if (query.includes(key)) score += 3;

  return score;
}

function renderLayoutRecommendations(description) {
  const output = document.getElementById('aiLayoutRecommendation');
  if (!output) return;

  const query = description.trim();
  if (!query) {
    output.innerHTML = 'Describe the Canvas page, activity, layout, or element you want to build, then select <strong>Recommend Layouts & Elements</strong>.';
    return;
  }

  const ranked = getAvailableLayoutAndElementItems()
    .map((item) => ({
      ...item,
      score: scoreRecommenderItem(query, item)
    }))
    .sort((a, b) => b.score - a.score);

  const scored = ranked.filter((item) => item.score > 0);
  const layoutResults = scored.filter((item) => item.panel === 'layouts').slice(0, 3);
  const elementResults = scored.filter((item) => item.panel === 'interactive').slice(0, 3);

  let results = [...layoutResults, ...elementResults];

  if (!results.length) {
    results = ranked.slice(0, 4);
  }

  output.innerHTML = `
    <strong>Best layout and element options based on your description:</strong>
    <div class="layout-recommendation-list"></div>
  `;

  const list = output.querySelector('.layout-recommendation-list');

  results.forEach((item, index) => {
    const typeLabel = getRecommendationTypeLabel(item);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `layout-recommendation-card ${item.panel === 'interactive' ? 'element-recommendation-card' : ''}`;
    card.innerHTML = `
      <span class="layout-recommendation-rank">${index + 1}</span>
      <span class="layout-recommendation-content">
        <span class="recommendation-type">${typeLabel}</span>
        <strong>${item.title}</strong>
        <small>${item.desc}</small>
      </span>
      <span class="layout-recommendation-action">Paste ${typeLabel}</span>
    `;

    card.addEventListener('click', () => {
      if (item.key === 'calloutBox') {
        const fallback = calloutOptions.find((option) => option.name === 'Beaver Blue') || calloutOptions[0];
        pasteCustomHtml(wrapContentInsertSpacing(buildCalloutBoxHtml(fallback)), `${fallback.name} callout box pasted into the Canvas editor.`);
        return;
      }

      pasteLayout(item.key);
    });

    list.appendChild(card);
  });
}

function setupAiLayoutRecommender() {
  const input = document.getElementById('aiLayoutNeed');
  const button = document.getElementById('aiRecommendLayoutButton');
  if (!input || !button) return;

  button.addEventListener('click', () => {
    renderLayoutRecommendations(input.value);
  });

  input.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      renderLayoutRecommendations(input.value);
    }
  });
}

renderPanel('layouts', 'layoutsPanel');
renderPanel('interactive', 'interactivePanel');
setupLiveSearch();
setupLayoutOptions();
setupElementOptionsPanel();


setupAssetOptions();
loadRecentInserts();
syncColorToggleSummaries();
renderAiStudioPrompts();
setupAiPromptSearch();
setupAiLayoutRecommender();

if (layoutCategory) {
  layoutCategory.value = 'all';
  const layoutSearchInput = document.getElementById('layoutsSearch');
  if (layoutSearchInput) filterCards(layoutSearchInput);
}

showPanel(1);

document.querySelectorAll('.panel-tab').forEach((button) => {
  button.addEventListener('click', () => showPanel(Number(button.dataset.panel)));
});


// CEI header dropdowns: Shortcuts and Support
(() => {
  function initDropdowns() {
    const dropdowns = [
      {
        button: document.getElementById('shortcutsToggle'),
        menu: document.getElementById('shortcutsMenu')
      },
      {
        button: document.getElementById('supportToggle'),
        menu: document.getElementById('supportMenu')
      }
    ];

    function closeAll(exceptMenu = null) {
      dropdowns.forEach(({ button, menu }) => {
        if (!button || !menu || menu === exceptMenu) return;
        menu.classList.remove('is-open');
        button.setAttribute('aria-expanded', 'false');
      });
    }

    dropdowns.forEach(({ button, menu }) => {
      if (!button || !menu) return;

      menu.classList.remove('is-open');

      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const shouldOpen = !menu.classList.contains('is-open');
        closeAll(menu);

        menu.classList.toggle('is-open', shouldOpen);
        button.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
      });

      menu.addEventListener('click', (event) => {
        event.stopPropagation();
        if (event.target.closest('a')) {
          menu.classList.remove('is-open');
          button.setAttribute('aria-expanded', 'false');
        }
      });
    });

    document.addEventListener('click', () => closeAll());

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeAll();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDropdowns);
  } else {
    initDropdowns();
  }
})();
