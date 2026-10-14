#!/usr/bin/env node
/**
 * Runtime design audit — the checks a static scan cannot make.
 *
 *   node tools/audit-runtime.js                 audit every screen, light + dark
 *   node tools/audit-runtime.js --screen=home   one screen (id from SCREEN_GROUPS)
 *   node tools/audit-runtime.js --baseline      record today's findings as known
 *
 * Renders every registered screen (and every variant/state) in a real browser
 * at the phone's native 393x852 (iPhone 14 Pro screen) and measures (via a11yAuditAll() in
 * index.html — the same function behind Library → Accessibility):
 *
 *   tap-target  interactive element smaller than 44x44 on either axis
 *   clipped     text overflowing its box with no ellipsis/line-clamp (zero
 *               tolerance — a +1px allowance once passed a visibly cut label)
 *   contrast    text below WCAG AA against its actual painted background
 *               (4.5:1, or 3:1 for >=18.66px bold / >=24px)
 *   font-min    computed font-size under 11px
 *   error       any page error while rendering the screen
 *
 * Findings already in .runtime-baseline.json are reported but don't fail; new
 * ones exit 1 — the same ratchet as design-eval.js.
 *
 * Needs Playwright + Chromium. It looks for them in this order:
 *   PLAYWRIGHT_MODULE=/path/to/node_modules/playwright   (env)
 *   require('playwright') / require('playwright-core')
 *   CHROME_PATH=/path/to/chrome                          (env, optional)
 * One-time setup if missing:  npm i -D playwright && npx playwright install chromium
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASELINE = path.join(ROOT, '.runtime-baseline.json');
const args = process.argv.slice(2);
const only = (args.find(a => a.startsWith('--screen=')) || '').split('=')[1];

function loadPlaywright() {
  const tries = [process.env.PLAYWRIGHT_MODULE, 'playwright', 'playwright-core'].filter(Boolean);
  for (const t of tries) { try { return require(t); } catch (e) { /* next */ } }
  return null;
}

(async () => {
  const pw = loadPlaywright();
  if (!pw) {
    console.log('audit-runtime: Playwright not found — skipped.\n'
      + '  One-time setup: npm i -D playwright && npx playwright install chromium\n'
      + '  (or point PLAYWRIGHT_MODULE at an existing install)');
    process.exit(0);
  }
  const launchOpts = { args: ['--no-sandbox', '--disable-dev-shm-usage'] };
  if (process.env.CHROME_PATH) launchOpts.executablePath = process.env.CHROME_PATH;
  const browser = await pw.chromium.launch(launchOpts);
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  // Third-party images/tiles are irrelevant to layout and are blocked. Fonts are
  // NOT: clipping measured against a fallback face instead of Poppins is wrong.
  await page.route('**/*', r => /^file:|fonts\.(googleapis|gstatic)\.com/.test(r.request().url()) ? r.continue() : r.abort());
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  await page.goto('file://' + path.join(ROOT, 'index.html'), { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { document.startViewTransition = undefined; });
  await page.evaluate(() => document.fonts.ready);   // measure against Poppins, not the fallback

  // The measurements live in index.html (a11yAuditAll) — the same code the
  // console runs from Library → Accessibility — so the two can't disagree.
  const res = await page.evaluate(only => a11yAuditAll({ only }), only || null);
  const findings = res.findings.slice();
  const targets = { length: res.screens };
  pageErrors.forEach(m => findings.push({ screen: '(page)', theme: '', rule: 'error', what: m.slice(0, 80), detail: '' }));
  await browser.close();

  // de-duplicate identical findings on the same screen/theme
  const uniq = new Map();
  findings.forEach(f => uniq.set([f.screen, f.theme, f.rule, f.what, f.detail].join('|'), f));
  const all = [...uniq.values()];
  const keyOf = f => [f.screen, f.theme, f.rule, f.what].join('|');

  if (args.includes('--baseline')) {
    fs.writeFileSync(BASELINE, JSON.stringify({
      note: 'Known runtime findings (tap targets, clipping, contrast). New ones fail tools/audit-runtime.js. Fix one, re-run with --baseline.',
      generated: new Date().toISOString().slice(0, 10),
      count: all.length,
      keys: [...new Set(all.map(keyOf))].sort(),
    }, null, 2) + '\n');
    console.log('runtime baseline written: ' + all.length + ' known findings');
    return;
  }
  const known = new Set(fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')).keys : []);
  const SEVERITY = { error: 0, contrast: 1, name: 1, state: 1, dialog: 1, heading: 2, img: 2, svg: 2, clipped: 2, 'font-min': 3, 'tap-target': 4 };
  const fresh = all.filter(f => !known.has(keyOf(f)))
    .sort((a, b) => (SEVERITY[a.rule] - SEVERITY[b.rule]) || a.screen.localeCompare(b.screen));
  const by = {};
  all.forEach(f => { by[f.rule] = by[f.rule] || { n: 0, fresh: 0 }; by[f.rule].n++; });
  fresh.forEach(f => by[f.rule].fresh++);
  console.log('\nRUNTIME AUDIT — ' + targets.length + ' screen(s) x light/dark\n' + '='.repeat(52));
  Object.keys(by).sort().forEach(r => console.log('  ' + r.padEnd(12) + String(by[r].n).padStart(5) + ' total  ' + (by[r].fresh ? String(by[r].fresh).padStart(4) + ' NEW' : '   0 new')));
  if (fresh.length) {
    console.log('\nNEW findings:\n');
    fresh.slice(0, 200).forEach(f => console.log('  [' + f.rule + '] ' + f.screen + ' (' + f.theme + ')  ' + f.what + '  ' + f.detail));
    console.log('\nFAIL — ' + fresh.length + ' new runtime finding(s).\n');
    process.exit(1);
  }
  console.log('\nPASS — no new runtime findings.\n');
})().catch(e => { console.error('audit-runtime crashed: ' + e.message); process.exit(2); });
