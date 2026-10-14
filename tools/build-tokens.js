#!/usr/bin/env node
/**
 * Generates design-system/tokens.json from the token blocks in index.html.
 *
 *   node tools/build-tokens.js           write design-system/tokens.json
 *   node tools/build-tokens.js --check   exit 1 if the file on disk is stale
 *
 * Source of truth is the CSS: the `.phone{…}` block (light + theme-independent
 * tokens) and the `.phone.dark{…}` block (dark overrides).
 *
 * The conversion itself is dtcgTokens() inside index.html — the SAME function
 * the console's Library and Developer handoff use. This script only extracts
 * and runs it, so the JSON a developer downloads from the console and the file
 * in the repo are produced by one piece of code and cannot differ.
 *
 * Output: W3C Design Tokens Format Module 2025.10 (stable). Readable by Style
 * Dictionary, Tokens Studio, Terrazzo, Figma variables import, etc.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const HTML = path.join(ROOT, 'index.html');
const OUT = path.join(ROOT, 'design-system', 'tokens.json');

function build() {
  const src = fs.readFileSync(HTML, 'utf8');
  const fn = src.match(/^function dtcgTokens\([^]*?^}/m);
  if (!fn) throw new Error('dtcgTokens() not found in index.html');
  const ctx = vm.createContext({});
  vm.runInContext(fn[0], ctx);
  return JSON.stringify(ctx.dtcgTokens(src), null, 2) + '\n';
}

if (require.main === module) {
  const next = build();
  if (process.argv.includes('--check')) {
    const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
    if (cur !== next) {
      console.error('design-system/tokens.json is stale — run: node tools/build-tokens.js');
      process.exit(1);
    }
    console.log('tokens.json in sync with index.html');
  } else {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, next);
    console.log('wrote ' + path.relative(ROOT, OUT));
  }
}
module.exports = { build };
