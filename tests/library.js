// Library + Developer handoff: every tab renders in both themes without errors,
// every export is generated from the live tokens, and the W3C JSON export is
// byte-identical to design-system/tokens.json. Needs Playwright (skips if absent).
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
function loadPlaywright() {
  for (const t of [process.env.PLAYWRIGHT_MODULE, 'playwright', 'playwright-core'].filter(Boolean)) {
    try { return require(t); } catch (e) { /* next */ }
  }
  return null;
}

(async () => {
  const pw = loadPlaywright();
  if (!pw) { console.log('SKIP: library test needs Playwright (see CLAUDE.md)'); return; }
  const opts = { args: ['--no-sandbox', '--disable-dev-shm-usage'] };
  if (process.env.CHROME_PATH) opts.executablePath = process.env.CHROME_PATH;
  const browser = await pw.chromium.launch(opts);
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  await page.route('**/*', r => /^file:/.test(r.request().url()) ? r.continue() : r.abort());
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.dismiss());
  await page.goto('file://' + path.join(ROOT, 'index.html') + '?mode=library&lib=tokens');

  // 1 · every tab, both themes
  const tabs = await page.evaluate(() => LIB_TABS.map(t => t[0]));
  assert.ok(tabs.includes('a11y'), 'Accessibility tab exists');
  assert.ok(tabs.includes('effects'), 'Elevation & motion tab exists');
  for (const dark of ['off', 'on']) {
    for (const tab of tabs) {
      const html = await page.evaluate(({ tab, dark }) => {
        A.dark = dark; UI.libTab = tab; render();
        return document.querySelector('.libpane').innerHTML;
      }, { tab, dark });
      assert.ok(html.length > 500, tab + ' (' + dark + ') renders content');
      assert.ok(!/undefined|NaN|\[object Object\]/.test(html.replace(/<[^>]+>/g, ' ')), tab + ' (' + dark + ') has no undefined/NaN text');
    }
  }

  // 2 · scales come from the CSS tokens, not a second copy
  const scales = await page.evaluate(() => ({
    type: TYPE_ROLES.map(t => [t.key, t.size]),
    space: SPACE_SCALE.map(s => [s.key, s.px]),
    radius: RADIUS_SCALE.map(r => [r.key, r.css]),
  }));
  const tokens = JSON.parse(fs.readFileSync(path.join(ROOT, 'design-system/tokens.json'), 'utf8'));
  for (const [k, px] of scales.type) assert.equal(px, tokens.font.size[k].$value.value, 'type ' + k);
  for (const [k, px] of scales.space) assert.equal(px, tokens.space[k].$value.value, 'space ' + k);
  assert.equal(scales.type.length, Object.keys(tokens.font.size).length, 'every type token has a role');
  assert.equal(scales.radius.length, Object.keys(tokens.radius).length, 'every radius token shown');

  // 3 · exports
  const exportsOut = await page.evaluate(() => {
    A.dark = 'off'; resetTokens('light'); resetTokens('dark');
    const out = {};
    HANDOFF_FORMATS.forEach(f => { UI.handoffFormat = f[0]; out[f[0]] = handoffCode(); });
    return out;
  });
  assert.equal(exportsOut.json, fs.readFileSync(path.join(ROOT, 'design-system/tokens.json'), 'utf8'),
    'W3C JSON export === design-system/tokens.json');
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const phoneBlock = html.match(/\n\s*\.phone\{\s*\n([\s\S]*?)\n\s*width:413px/)[1].replace(/\/\*[\s\S]*?\*\//g, '');
  const cssVars = [...phoneBlock.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]);
  assert.ok(cssVars.length > 90, 'parsed the phone token block (' + cssVars.length + ')');
  for (const [name, val] of cssVars) {
    const re = new RegExp('--' + name + ':\\s*([^;]+);');
    const got = (exportsOut.css.match(re) || [])[1];
    assert.ok(got, 'CSS export has --' + name);
    const norm = v => v.replace(/\s+/g, '').replace(/(\.\d*?)0+(?=\D|$)/g, '$1').replace(/(^|[^\d.])0\./g, '$1.').replace(/(^|[^\d.])0px/g, '$10');
    assert.equal(norm(got), norm(val), 'CSS export --' + name + ' value');
  }
  for (const f of ['scss', 'tailwind', 'swift', 'android']) {
    const out = exportsOut[f];
    for (const needle of [/spac/i, /radius/i, /(shadow|z|duration)/i, /pink/i])
      assert.match(out, needle, f + ' export covers ' + needle);
    assert.ok(!/undefined|NaN/.test(out), f + ' export has no undefined/NaN');
  }

  // 4 · a live colour edit flows into the export, and reset restores it
  const edited = await page.evaluate(() => {
    TOKENS.light.accent = '#123456'; UI.handoffFormat = 'json';
    const j = JSON.parse(handoffCode());
    resetTokens('light');
    return { edited: j.color.light.accent.$value.hex, reset: JSON.parse(handoffCode()).color.light.accent.$value.hex };
  });
  assert.equal(edited.edited, '#123456');
  assert.equal(edited.reset, tokens.color.light.accent.$value.hex);

  // 5 · every Library button is wired: click each once
  for (const tab of tabs) {
    await page.evaluate(t => { UI.libTab = t; render(); }, tab);
    const acts = await page.$$eval('.libpane [data-act]', els => [...new Set(els.map(e => e.getAttribute('data-act')))]);
    for (const act of acts) {
      if (['iconFilter', 'compFilter', 'tokenEdit'].includes(act)) continue;   // inputs
      if (act === 'libOpen') continue;                                          // leaves the Library; checked below
      const el = await page.$('.libpane [data-act="' + act + '"]');
      if (el && await el.isVisible()) await el.click({ timeout: 2000 }).catch(() => {});
    }
  }

  // 5a · every component demo matches what the screens render (compMeasure builds every
  //      screen and state and measures each component's own classes). Only the parts in
  //      COMP_ONLY_AFTER may be absent from the screens, and each carries its reason.
  const comp = await page.evaluate(() => {
    compMeasure.cache = null;
    const m = compMeasure(), bad = [];
    Object.keys(m).forEach(id => m[id].forEach(r => {
      if (r.status === 'differs') bad.push(id + ' ' + r.sel + ' differs: ' + r.missing.map(compSigText).join('; '));
      if (r.status === 'unused') bad.push(id + ' ' + r.sel + ' is not used on any screen');
    }));
    return { bad, n: Object.keys(m).length };
  });
  assert.ok(comp.n > 30, 'measured the component specs (' + comp.n + ')');
  assert.deepEqual(comp.bad, [], 'Library demos match the screens');

  // 5b · Listing row spec: measured, matches across .lrow / .result-row, every value has a token,
  //      and a "used on" chip opens that screen in the prototype.
  await page.evaluate(() => { setConsoleMode('library'); UI.libTab = 'components'; UI.compQuery = ''; render(); });
  const spec = await page.evaluate(() => ({
    parity: (document.querySelector('[data-parity]') || {}).textContent || '',
    cells: [...document.querySelectorAll('[data-measure]')].map(c => c.textContent),
    variants: document.querySelectorAll('.lv-card').length
  }));
  assert.match(spec.parity, /Identical/, 'Home row and list row measure the same');
  assert.equal(spec.cells.length, 7, 'anatomy has 7 measured parts');
  for (const c of spec.cells) assert.ok(c && c !== '…' && !/no token/.test(c), 'anatomy cell measured with tokens: ' + c);
  assert.ok(spec.variants >= 12, 'listing variants rendered: ' + spec.variants);
  await page.click('.lib-where[data-screen-id="resultseventsapp"]');
  assert.deepEqual(await page.evaluate(() => [UI.mode, UI.screen]), ['design', 'resultseventsapp'], 'Used-on chip opens the screen');
  await page.evaluate(() => setConsoleMode('library'));

  // 5c · token descriptions come from the token's own comment (regression: misattribution)
  assert.match(tokens.color.light['on-solid'].$description, /solid/i, '--on-solid keeps its own description');
  assert.ok(!/tint/i.test(tokens.color.light['on-solid'].$description), '--on-solid is not described as a tint');

  // 6 · the in-console accessibility audit runs and reports
  await page.evaluate(() => { UI.libTab = 'a11y'; UI.a11yAudit = null; render(); });
  await page.click('[data-act="a11yAuditRun"]');
  await page.waitForFunction(() => UI.a11yAudit && !UI.a11yAuditRunning, null, { timeout: 60000 });
  const audit = await page.evaluate(() => ({ screens: UI.a11yAudit.screens, rules: UI.a11yAudit.findings.map(f => f.rule) }));
  assert.ok(audit.screens > 40, 'audit covered every screen');
  assert.ok(!audit.rules.includes('error'), 'no screen failed to render');
  assert.match(await page.textContent('.libpane'), /Under-size targets by component/);

  await browser.close();
  assert.deepEqual(errors, [], 'no page errors');
  console.log('PASS: library tabs (' + tabs.length + ' x light/dark), exports from live tokens, JSON === tokens.json, colour edit + reset, buttons wired, in-console a11y audit');
})().catch(e => { console.error(e); process.exit(1); });
