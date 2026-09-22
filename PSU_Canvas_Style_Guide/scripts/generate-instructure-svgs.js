#!/usr/bin/env node
// Generates standalone .svg files for the Instructure icon set from the path
// data in instructure-icon-previews.js, so they can be hosted (e.g. committed to
// the psu-cei/ccbe repo) and referenced by URL from Canvas as <img src="...">.
//
// Usage:
//   node scripts/generate-instructure-svgs.js [color] [outDir]
//
//   color   fill color baked into every icon (default #001E44, PSU navy)
//   outDir  output directory (default assets/icons/collections/instructure)
//
// To produce a second color variant, run again with a different color/outDir, e.g.
//   node scripts/generate-instructure-svgs.js "#ffffff" assets/icons/collections/instructure-white

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const color = process.argv[2] || '#001E44';
const outDir = process.argv[3] || path.join('assets', 'icons', 'collections', 'instructure');

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'instructure-icon-previews.js'), 'utf8'), sandbox);

const previews = sandbox.window.CEI_INSTRUCTURE_ICON_PREVIEWS;
if (!previews) {
  console.error('Could not load CEI_INSTRUCTURE_ICON_PREVIEWS');
  process.exit(1);
}

fs.mkdirSync(path.join(__dirname, '..', outDir), { recursive: true });

let written = 0;
for (const [iconClass, data] of Object.entries(previews)) {
  if (!data || !Array.isArray(data.paths)) continue;
  const viewBox = data.viewBox || '0 0 1920 1920';
  const paths = data.paths.map((p) => {
    const attrs = [`d="${p.d}"`, `fill="${color}"`];
    if (p.fillRule) attrs.push(`fill-rule="${p.fillRule}"`);
    if (p.clipRule) attrs.push(`clip-rule="${p.clipRule}"`);
    return `<path ${attrs.join(' ')}/>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${paths}</svg>\n`;
  fs.writeFileSync(path.join(__dirname, '..', outDir, `${iconClass}.svg`), svg);
  written += 1;
}

console.log(`Wrote ${written} SVG files to ${outDir} (fill: ${color})`);
