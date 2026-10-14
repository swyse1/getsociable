#!/usr/bin/env node
/**
 * GetSociable design-system eval.
 *
 *   node design-eval.js            report violations, exit 1 if any
 *   node design-eval.js --summary  counts only
 *   node design-eval.js --baseline rewrite .design-baseline.json
 *
 * Scope: the mobile prototype. The surrounding design console is tooling and is
 * exempt — it is excluded by selector prefix (CONSOLE_SELECTORS) and by function
 * name for inline styles (CONSOLE_FNS).
 *
 * Known pre-existing violations are recorded in .design-baseline.json. The eval
 * fails on anything NEW, so the count can only go down. Fix a baselined item and
 * re-run with --baseline to lock the improvement in.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'index.html');
const BASELINE = path.join(__dirname, '.design-baseline.json');
const src = fs.readFileSync(FILE, 'utf8');
const lines = src.split('\n');

// ---------------------------------------------------------------- the system
// Every list below mirrors a token group in index.html's `.phone{}` block and in
// design-system/tokens.json. Change them together or not at all.
const ICON_SIZES   = [12, 14, 16, 20, 24];
const STROKE       = '1.8';
const MIN_FONT     = 11;
// --fs-* : caption 11 · label 11.5 · small 12 · body 12.5 · body-strong 13 ·
// card-title 13.5 · lead 14 · row-title-lg 15 · sheet-title 16 · brand 17 ·
// screen-title 18 · page-title 22 · display-sm 28 · display 40
const TYPE_SCALE   = [11, 11.5, 12, 12.5, 13, 13.5, 14, 15, 16, 17, 18, 22, 28, 40];
const WEIGHTS      = ['400', '500', '600', '700', '800'];   // the only loaded Poppins weights
// --radius-* (px) plus 50% for circles
const RADII        = [0, 4, 8, 10, 12, 14, 16, 20, 24, 999];

// Console selectors — tooling, exempt from the phone design system.
const CONSOLE_SELECTORS = [
  '.shell','.topbar','.tbtn','.tgroup','.tsep','.brand','.topnav','.sharepill','.topbar-end',
  '.body','.side','.rail','.stage','.slot','.scroll','.sect','.keys','.decfilters','.statetoggles',
  '.grp','.gl','.gq','.opts','.opt','.dec','.dbtn','.sbtn','.badge','.when-tag','.unwired-tag',
  '.noteIn','.why','.wt','.wl','.logrow','.lq','.ls','.ln','.stl','.fam','.famhead','.fname',
  '.fcount','.car','.decempty','.morefilters','.mf-sum','.agenda-empty','.spec','.specnote',
  '.lib','.idx','.palette','.pal','.cat','.comp','.handoff','.hand','.tok','.contrast','.ca-',
  '.health','.tally','.presetmenu','.presetdrop','.toolsmenu','.toolsdrop','.toolsrow','.phr',
  '.sum','.anno','.gutter','.lookingat','.fbfloat','.icon-lib','.iconcard','.ic-','.lb','.lightbox',
  '.gx-', // screen index gallery grid + lightbox — console tooling, not the phone
  '.compare-', // live-vs-prototype compare panel in the lightbox — console tooling
  '.demo-spine','.spine','.review','.present','.modeswitch','.screenidx','.sidx','.sii','.vi2',
  // icon library, handoff tables, nav menus, principles — all console chrome
  '.isz','.ist','.idet','.icat','.ho-','.navitem','.navcar','.principles','.qrbox','.proto-toast',
  // console nav dropdown, component-catalogue cards, decision ship rows, export box
  '.navdrop','.cc-','.cstate','.compcard','.shiprow','.exportbox','.agenda-caption',
];

/**
 * Deliberate exceptions, each with a reason. These are NOT design-system misses —
 * they are places where the system correctly does not apply. Anything not listed
 * here and not in the baseline fails the eval.
 */
const ALLOW = [
  { match: /#4285f4/i, why: "Google Maps' own location-dot blue — matching an external convention users recognise, not our palette" },
  { match: /#007aff|\.perm-/i, why: 'The OS permission popup imitates native iOS chrome (system blue, iOS icon scale) — it must look like the OS, not like our app, so our palette and icon scale deliberately do not apply' },
  { match: /\.gs-social|instagram|facebook|tiktok|linkedin|youtube|google:|apple:/i, why: 'Third-party brand marks — must render in their own colours' },
  { match: /obcar|obsw|phero|fest-band|seedThumb|scrim|map-/i, why: 'Photographic / full-bleed surfaces — #000 and #fff are contrast against imagery, not page colour, and must not flip with theme' },
  { match: /LIVE_BRANDS|brand\.bg|brand\.fg|brandCircle|brandGlyph/, why: 'Brand colours are data, not tokens (see design-system/foundations/color.md)' },
  { match: /\.notch\b/, why: 'Device-frame imitation (the hardware notch), not app UI — its radius, colour and stacking copy the phone, not our system' },
  { match: /\.phone \*, \.phone \*::before/, why: 'prefers-reduced-motion override: it zeroes every duration on purpose, so a --dur-* token would be meaningless' },
  { match: /\.sr-only/, why: 'Standard visually-hidden utility — the 1px box and -1px margin are the technique, not spacing' },
];
function allowedReason(raw, context) {
  const hay = raw + ' ' + context;
  const hit = ALLOW.find(a => a.match.test(hay));
  return hit ? hit.why : null;
}

// Builder functions that render the console, not the phone.
const CONSOLE_FNS = [
  'decisionCard','renderControls','renderRail','renderDecFilters','summaryHtml','renderTally',
  'renderHealth','screenIndexHtml','libraryPaneHtml','libraryRailHtml','libraryControlsHtml',
  'handoffHtml','specnote','paletteHtml','contrastHtml','iconLibraryHtml','componentCatalogue',
  'exportLog','renderDemoSpine','renderPresetMenu','renderStage','buildPhone',
];
// Library + handoff builders are console pages about the system, not phone UI.
// Component demos inside them render the real phone classes, which are checked
// where those classes are defined.
const CONSOLE_FN_RE = /^(library[A-Z]\w*Html|handoff\w*|contrastAuditHtml|componentSpecs|componentMarkup|libDemo|icon(SvgFile|Jsx|Sprite|Manifest))$/;
const isConsoleFn = fn => CONSOLE_FNS.includes(fn) || CONSOLE_FN_RE.test(fn || '');

function isConsoleSelector(sel) {
  return CONSOLE_SELECTORS.some(p => sel.includes(p));
}

// Which function encloses a given line (for inline-style attribution).
const fnStarts = [];
lines.forEach((l, i) => {
  const m = l.match(/^\s*function\s+(\w+)/);
  if (m) fnStarts.push({ line: i + 1, name: m[1] });
});
function fnAt(line) {
  let name = '(top level)';
  for (const f of fnStarts) { if (f.line <= line) name = f.name; else break; }
  return name;
}

const violations = [];
const allowed = [];
function flag(rule, line, detail, context, raw) {
  const why = allowedReason(raw || '', context);
  if (why) { allowed.push({ rule, line, detail, context, why }); return; }
  violations.push({ rule, line, detail, context });
}

// ------------------------------------------- shared declaration-level checks
// Run on phone CSS rules and on inline style="" strings in phone builders.
// Anything written with a var(--token) passes by construction: these rules only
// fire on literal values, which is exactly the drift they exist to stop.
function checkDeclarations(raw, ln, ctx) {
  // font-weight: only the five loaded weights (anything else is browser-faked)
  (raw.match(/font-weight:\s*(?!var\()([a-z0-9]+)/gi) || []).forEach(d => {   // var(--fw-*) passes
    const v = d.split(':')[1].trim();
    if (!WEIGHTS.includes(v)) flag('font-weight', ln, `${v} — use --fw-* (400/500/600/700/800)`, ctx, raw);
  });

  // border-radius: every corner on the --radius-* scale, or 50% for circles
  (raw.match(/border-radius:\s*([^;"'}]+)/g) || []).forEach(d => {
    const val = d.split(':')[1].trim();
    if (/var\(/.test(val)) return;
    val.split(/\s+/).forEach(part => {
      if (part === '50%' || part === '0') return;
      const m = part.match(/^([\d.]+)px$/);
      if (m && !RADII.includes(parseFloat(m[1])))
        flag('radius', ln, `${part} — use --radius-*`, ctx, raw);
    });
  });

  // spacing: padding / margin / gap on the 2px grid (no odd or fractional px)
  (raw.match(/(?:^|[;{\s"'])(?:padding|margin|gap|row-gap|column-gap)(?:-(?:top|right|bottom|left))?:\s*([^;"'}]+)/g) || []).forEach(d => {
    const prop = d.replace(/^[;{\s"']/, '').split(':')[0];
    d.split(':').slice(1).join(':').trim().split(/\s+/).forEach(part => {
      const m = part.match(/^-?([\d.]+)px$/);
      if (!m) return;
      const n = parseFloat(m[1]);
      if (n % 2 !== 0) flag('spacing', ln, `${prop} ${part} — off the 2px grid, use --space-*`, ctx, raw);
    });
  });

  // box-shadow: colour must come from a token (--shadow-* or a var() ring)
  (raw.match(/box-shadow:\s*([^;"'}]+)/g) || []).forEach(d => {
    const val = d.split(':').slice(1).join(':').trim();
    if (val === 'none' || /^var\(--shadow-/.test(val)) return;
    if (/rgba?\(|#[0-9a-f]{3,8}/i.test(val))
      flag('shadow', ln, `literal shadow — use --shadow-1..4`, ctx, raw);
  });

  // motion: transition / animation durations come from --dur-*
  (raw.match(/(?:transition|animation)(?:-duration)?:\s*([^;"'}]+)/g) || []).forEach(d => {
    const val = d.split(':').slice(1).join(':');
    if (/(^|[\s,])\.?\d+(\.\d+)?m?s\b/.test(val.replace(/var\([^)]*\)/g, '')))
      flag('motion', ln, `literal duration — use --dur-* / --ease-*`, ctx, raw);
  });

  // z-index: layered surfaces use the --z-* stack
  (raw.match(/z-index:\s*(-?\d+)/g) || []).forEach(d => {
    const n = parseInt(d.split(':')[1], 10);
    if (n > 1) flag('z-index', ln, `z-index:${n} — use --z-*`, ctx, raw);
  });
}

// ------------------------------------------------------------- CSS rule scan
// Walk declarations, tracking the selector each belongs to. Bounded to
// <style> blocks: this loop used to run over the whole file, so every JS line
// after the stylesheet was re-checked as CSS under whatever selector came last
// (`@keyframes popBounce`) and each inline violation was counted twice.
let curSel = '';
let inStyle = false;
lines.forEach((raw, i) => {
  const ln = i + 1;
  if (/<style\b/i.test(raw)) { inStyle = true; curSel = ''; }
  if (/<\/style>/i.test(raw)) { inStyle = false; curSel = ''; return; }
  if (!inStyle) return;
  const line = raw.trim();
  if (!line || line.startsWith('//')) return;

  const selMatch = raw.match(/^\s*([.#@:][^{]*?)\s*\{/);
  if (selMatch) curSel = selMatch[1].trim();
  if (!curSel) return;
  if (isConsoleSelector(curSel)) return;
  // token declaration blocks define the palette; they are the source, not a use
  const isTokenBlock = /^\.phone(\.dark)?$/.test(curSel) || curSel.includes(':root');

  // icon sizing on svg rules
  if (/svg\s*\{|svg\{/.test(raw) || curSel.includes('svg')) {
    const w = raw.match(/width:(\d+(?:\.\d+)?)px/);
    const h = raw.match(/height:(\d+(?:\.\d+)?)px/);
    if (w && h && w[1] === h[1]) {
      const n = parseFloat(w[1]);
      if (!ICON_SIZES.includes(n)) flag('icon-size', ln, `${n}px icon (scale: ${ICON_SIZES.join('/')})`, curSel, raw);
    }
  }

  // font sizes
  const fs_ = raw.match(/font-size:(\d+(?:\.\d+)?)px/g);
  if (fs_) fs_.forEach(d => {
    const n = parseFloat(d.split(':')[1]);
    if (n < MIN_FONT) flag('font-min', ln, `${n}px (floor ${MIN_FONT}px)`, curSel, raw);
    else if (!TYPE_SCALE.includes(n)) flag('font-scale', ln, `${n}px — not a --fs-* step`, curSel, raw);
  });

  if (!isTokenBlock) checkDeclarations(raw, ln, curSel);

  // raw hex outside token declarations
  if (!isTokenBlock) {
    const hex = raw.match(/(?:^|[^-\w])(?:color|background|background-color|border-color|fill|stroke):\s*(#[0-9a-fA-F]{3,8})/g);
    if (hex) hex.forEach(d => {
      const v = d.match(/#[0-9a-fA-F]{3,8}/)[0];
      flag('raw-hex', ln, `${v} — use a token`, curSel, raw);
    });
  }
});

// --------------------------------------------------- inline styles in builders
lines.forEach((raw, i) => {
  const ln = i + 1;
  const fn = fnAt(ln);
  if (isConsoleFn(fn)) return;
  if (!/style="/.test(raw) && !/style=\\"/.test(raw)) return;

  // stroke-width on hand-built svgs
  const sw = raw.match(/stroke-width="(\d+(?:\.\d+)?)"/g);
  if (sw) sw.forEach(d => {
    const v = d.match(/"([\d.]+)"/)[1];
    // 2 is tolerated on chevrons only (a 1.8 chevron reads thin at 14px)
    // chevrons carry 2 deliberately (1.8 reads thin at 14px) — detect by name OR by the chevron path itself
    const isChevron = /chev/i.test(raw) || /points="9 18 15 12 9 6"|points="15 18 9 12 15 6"/.test(raw);
    if (v !== STROKE && !(v === '2' && isChevron)) {
      flag('stroke-width', ln, `stroke-width="${v}" (system: ${STROKE})`, fn, raw);
    }
  });

  // inline icon sizing — only when the line actually renders an svg. A 6px dot
  // <span> or a 28px avatar <div> is not an icon and must not be held to the scale.
  const m = /<svg|viewBox=/.test(raw)
    ? raw.match(/width:(\d+(?:\.\d+)?)px;height:(\d+(?:\.\d+)?)px/g) : null;
  if (m) m.forEach(d => {
    const [w, h] = d.match(/(\d+(?:\.\d+)?)px/g).map(parseFloat);
    if (w === h && w <= 28 && !ICON_SIZES.includes(w)) {
      flag('icon-size', ln, `${w}px inline icon`, fn, raw);
    }
  });

  // inline font sizes below the floor / off the type scale
  const f = raw.match(/font-size:(\d+(?:\.\d+)?)px/g);
  if (f) f.forEach(d => {
    const n = parseFloat(d.split(':')[1]);
    if (n < MIN_FONT) flag('font-min', ln, `${n}px inline (floor ${MIN_FONT}px)`, fn, raw);
    else if (!TYPE_SCALE.includes(n)) flag('font-scale', ln, `${n}px inline — not a --fs-* step`, fn, raw);
  });

  // only the style="" contents, so markup attributes can't false-positive
  (raw.match(/style=\\?"[^"\\]*\\?"/g) || []).forEach(s => checkDeclarations(s, ln, fn));

  // raw hex inline
  const hex = raw.match(/(?:color|background|background-color|border-color):\s*(#[0-9a-fA-F]{3,8})/g);
  if (hex) hex.forEach(d => {
    const v = d.match(/#[0-9a-fA-F]{3,8}/)[0];
    flag('raw-hex', ln, `${v} inline — use a token`, fn, raw);
  });
});

// ------------------------------------------------------------ ICONS[] misuse
lines.forEach((raw, i) => {
  const ln = i + 1;
  if (isConsoleFn(fnAt(ln))) return;
  // ICONS[x] nested inside a hand-built <svg> double-sizes the glyph
  if (/<svg[^>]*>'\s*\+\s*ICONS\./.test(raw)) {
    flag('nested-icon', ln, 'ICONS[key] inside another <svg> — use ICON_PATHS', fnAt(ln), raw);
  }
});

// ------------------------------------------------ undefined custom properties
// var(--ink-3) with no --ink-3 anywhere silently falls back to the inherited
// value — it shipped once and looked "almost right". Every var(--name) used
// must be declared somewhere. Names built by string concatenation
// ('var(--fs-' + key + ')') are not complete here and are skipped.
const DEFINED = new Set([...src.matchAll(/(?:^|[\s;{(])--([a-z0-9-]+)\s*:/gi)].map(m => m[1]));
[...src.matchAll(/--([a-z0-9-]+)\b/gi)].forEach(m => { /* setProperty('--x') etc. */
  const before = src.slice(Math.max(0, m.index - 16), m.index);
  if (/setProperty\(['"]$/.test(before)) DEFINED.add(m[1]);
});
lines.forEach((raw, i) => {
  (raw.match(/var\(--([a-z0-9-]+)(?=[),])/gi) || []).forEach(v => {
    const name = v.slice(6);
    if (!DEFINED.has(name)) flag('undefined-token', i + 1, 'var(--' + name + ') is not declared anywhere', fnAt(i + 1), raw);
  });
});

// --------------------------------------------------- markup rules in builders
// Heuristic, single-line: a tag split across several string literals is not
// seen. It errs toward silence, never toward a false alarm on correct markup.
const SCREEN_FN = /^scr[A-Z]/;
lines.forEach((raw, i) => {
  const ln = i + 1;
  const fn = fnAt(ln);
  if (isConsoleFn(fn)) return;
  if (/^\s*(\/\/|\/\*|\*)/.test(raw)) return;   // comments describe markup, they aren't markup

  // Interactive <div>/<span> must be reachable and announced: role + tabindex.
  // (A global keydown bridge turns Enter/Space into click for these.)
  (raw.match(/<(div|span)\b[^<>]*\bdata-(?:act|screen)="[^"]*"[^<>]*>/g) || []).forEach(tag => {
    const what = (tag.match(/data-(?:act|screen)="([^"]*)"/) || [])[1] || '?';
    if (!/\brole=/.test(tag))
      flag('a11y-role', ln, `<${tag.match(/^<(\w+)/)[1]} ${what}> clickable without role=`, fn, raw);
    else if (!/\btabindex=/.test(tag))
      flag('a11y-focus', ln, `<${tag.match(/^<(\w+)/)[1]} ${what}> role but no tabindex`, fn, raw);
  });

  // Hand-built SVGs are decorative by default and must be hidden from AT,
  // unless explicitly labelled as an image.
  (raw.match(/<svg\b[^>]*>/g) || []).forEach(tag => {
    if (!/aria-hidden=/.test(tag) && !/role=\\?"img/.test(tag))
      flag('a11y-svg', ln, 'decorative <svg> without aria-hidden="true"', fn, raw);
  });

  // Sheets render at .phone level (see buildPhone), never inside a screen
  // builder — inside .feed they are clipped by its overflow and cannot dim
  // the phone.
  if (SCREEN_FN.test(fn) && /class=\\?"(sheet|scrim)\b/.test(raw))
    flag('sheet-placement', ln, 'sheet/scrim rendered inside a screen builder', fn, raw);
});

// ---------------------------------------------------------- tokens.json sync
// The developer handoff file is generated from the CSS. A stale copy is not
// debt that can be baselined — it is a lie to whoever builds from it.
let tokensStale = false;
try {
  const { build } = require('./tools/build-tokens.js');
  const out = path.join(__dirname, 'design-system', 'tokens.json');
  tokensStale = !fs.existsSync(out) || fs.readFileSync(out, 'utf8') !== build();
} catch (e) {
  tokensStale = true;
  console.error('tokens check failed to run: ' + e.message);
}

// ----------------------------------------------------------------- reporting
const args = process.argv.slice(2);
const key = v => `${v.rule}|${v.context}|${v.detail}`;

if (args.includes('--baseline')) {
  fs.writeFileSync(BASELINE, JSON.stringify({
    note: 'Pre-existing design-system violations. The eval fails on anything NEW. Fix one, then re-run with --baseline to lock it in.',
    generated: new Date().toISOString().slice(0, 10),
    count: violations.length,
    keys: violations.map(key).sort(),
  }, null, 2) + '\n');
  console.log(`baseline written: ${violations.length} known violations`);
  process.exit(0);
}

let baseline = { keys: [] };
if (fs.existsSync(BASELINE)) baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
const known = new Set(baseline.keys);
const fresh = violations.filter(v => !known.has(key(v)));

const byRule = {};
violations.forEach(v => { byRule[v.rule] = (byRule[v.rule] || 0) + 1; });

console.log('\nDESIGN SYSTEM EVAL — mobile prototype\n' + '='.repeat(52));
Object.keys(byRule).sort().forEach(r => {
  const n = byRule[r];
  const nf = fresh.filter(v => v.rule === r).length;
  console.log(`  ${r.padEnd(14)} ${String(n).padStart(4)} total   ${nf ? String(nf).padStart(3) + ' NEW' : '  0 new'}`);
});
console.log('-'.repeat(52));
console.log(`  ${'allowed'.padEnd(14)} ${String(allowed.length).padStart(4)} documented exceptions (see ALLOW in this file)`);
console.log(`  ${'TOTAL'.padEnd(14)} ${String(violations.length).padStart(4)}         ${String(fresh.length).padStart(3)} new`);

if (!args.includes('--summary') && fresh.length) {
  console.log('\nNEW violations (not in baseline):\n');
  fresh.slice(0, 400).forEach(v => {
    console.log(`  ${FILE.split('/').pop()}:${v.line}  [${v.rule}]  ${v.detail}`);
    console.log(`      in ${v.context}`);
  });
  if (fresh.length > 400) console.log(`  … and ${fresh.length - 60} more`);
}

console.log(`  ${'tokens.json'.padEnd(14)} ${tokensStale ? 'STALE — run: node tools/build-tokens.js' : 'in sync with index.html'}`);

if (fresh.length || tokensStale) {
  if (fresh.length)
    console.log(`\nFAIL — ${fresh.length} new violation(s). Fix them; a genuine exception goes in ALLOW with a written reason.\n`);
  if (tokensStale)
    console.log('\nFAIL — design-system/tokens.json does not match the tokens in index.html. Regenerate it: node tools/build-tokens.js\n');
  process.exit(1);
}
console.log('\nPASS — no new violations.\n');
