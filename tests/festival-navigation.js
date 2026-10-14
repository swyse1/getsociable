// Focused regression checks for festival browsing, with no browser dependencies.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
for (const script of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) new Function(script[1]);
const context = vm.createContext({UI:{}, PROTO_TODAY:'2026-09-17', FESTIVAL_GUIDE_EVENTS:{}});
for (const name of ['festivalEventPhoto','festivalEventKey','resolveFestivalEvent','festivalMapGroups','festivalOverlapsRange','savedEventIsPast','festivalDays','festivalGuideDays','formatGuideDay','festivalProgramme','festivalFilteredEvents']) {
  const source = html.match(new RegExp('^function ' + name + '\\([^]*?^}', 'm'));
  assert.ok(source, name + ' exists');
  vm.runInContext(source[0], context);
}
const fest = {id:'test',start:'2026-09-16',end:'2026-09-19',photo:'stage',cat:'Live Music'};
context.FESTIVAL_GUIDE_EVENTS.test = {
 '2026-09-16':[{title:'Past show',venue:'A',start:'19:00',end:'20:00'}],
 '2026-09-17':[{title:'Earlier today',venue:'B',start:'12:00',end:'13:00',tag:'Free'}, {title:'Evening show',venue:'A',start:'19:00',end:'21:00',price:'£22'}],
 '2026-09-18':[{title:'Tomorrow show',venue:'C',start:'20:00',end:'22:00',tag:'Free'}]
};
const titles = guide => Array.from(context.festivalFilteredEvents(fest, guide), e => e.title);
assert.deepEqual(titles(), ['Evening show','Tomorrow show']);
context.UI.festPeriod='past';
assert.deepEqual(titles(), ['Past show','Earlier today']);
assert.equal(titles(true).length, 4, 'guide ignores past/upcoming but keeps all days');
context.UI.festDateFrom='2026-09-17'; context.UI.festDateTo='2026-09-18';
assert.deepEqual(Array.from(context.festivalGuideDays(fest)), ['2026-09-17','2026-09-18']);
context.UI.festPeriod='upcoming'; context.UI.festFreeOnly=true;
assert.deepEqual(titles(), ['Tomorrow show']);
context.UI.festFreeOnly=false; context.UI.festSearch='EVENING';
assert.deepEqual(titles(), ['Evening show']);
context.UI.festSearch=''; context.UI.festSortDesc=true;
assert.deepEqual(titles(), ['Tomorrow show','Evening show']);
assert.equal(context.UI.festDateFrom, '2026-09-17', 'view queries must not rewrite date range');
assert.equal(context.festivalProgramme(fest)[0].price, 'See tickets', 'unknown prices remain explicit');
context.UI.festSearch='missing';
assert.equal(titles().length,0,'empty queries must not produce placeholder map pins');
console.log('PASS: syntax, same-day past/upcoming, date bounds, guide independence, search, price filter, sort, unknown price and empty results');

assert.ok(html.includes('festivalAttr(JSON.stringify(ev))'), 'event payloads must escape attribute quotes');
assert.ok(html.includes('festivalAttr(JSON.stringify(item))'), 'save payloads must escape attribute quotes');

assert.equal(context.savedEventIsPast({when:'Sat 2 Aug 16:00'}), true);
assert.equal(context.savedEventIsPast({when:'Tonight 19:30'}), false);
assert.equal(context.savedEventIsPast({date:'2026-09-17',end:'13:00'}), true);

context.UI.festSearch=''; context.UI.festSortDesc=false;
context.UI.festPrice='paid';
assert.deepEqual(titles(), ['Evening show']);
context.UI.festTypes=['Theatre'];
assert.deepEqual(titles(), []);
context.UI.festTypes=null; context.UI.festPrice='all';
assert.equal(context.festivalOverlapsRange(fest, '2026-09-19', '2026-09-20'), true);
assert.equal(context.festivalOverlapsRange(fest, '2026-09-20', '2026-09-21'), false);
assert.equal(context.festivalOverlapsRange(fest, '2026-09-17', '2026-09-17'), true);
console.log('PASS: paid/type filters and inclusive festival date overlap');

context.LIVE_FESTIVALS=[fest];
const original = context.festivalProgramme(fest)[1];
const eventKey = context.festivalEventKey(original);
assert.equal(context.resolveFestivalEvent(eventKey).title, original.title);
assert.equal(context.resolveFestivalEvent('missing-event'), null);
context.UI.festPrice='paid';
assert.deepEqual(Object.keys(context.festivalMapGroups(fest)), ['A']);
context.UI.festPrice='all'; context.UI.festSearch='missing';
assert.equal(Object.keys(context.festivalMapGroups(fest)).length, 0);
console.log('PASS: event-link identity, invalid links and filtered map venues');

// Exercise the actual prototype fixture, not only a synthetic programme.
vm.runInContext(html.match(/var LIVE_FESTIVALS = \[[^]*?^\];/m)[0], context);
vm.runInContext(html.match(/var FESTIVAL_GUIDE_EVENTS = \{[^]*?^};/m)[0], context);
const demo = context.LIVE_FESTIVALS.find(f => f.id === 'cnb');
context.UI = {festDateFrom:'2026-09-20',festDateTo:'2026-09-21'};
const selectedRows = context.festivalFilteredEvents(demo);
assert.equal(selectedRows.length, 6);
assert.deepEqual([...new Set(selectedRows.map(e => e.date))], ['2026-09-20','2026-09-21']);
assert.deepEqual(Array.from(context.festivalGuideDays(demo)), ['2026-09-20','2026-09-21']);
assert.ok(context.festivalMapGroups(demo)['Ulster Hall']);
assert.ok(context.festivalMapGroups(demo)['Lyric Theatre']);
assert.equal(context.festivalMapGroups(demo)['Black Box'].length, 2);
assert.ok(selectedRows.some(e => e.tag === 'Free'));
assert.ok(selectedRows.some(e => /£/.test(e.price)));
console.log('PASS: multi-day demo range includes both days and their free/paid events and map venues');

Object.assign(context, {GUIDE_COL_W:192,GUIDE_DAY_START:0, ICONS:{}, renderIcon:()=>'<svg></svg>', escapeHtml:s=>s});
for (const name of ['guideTimeToX','hmMin','minHm','guideIcon','guideMatrixHtml','festivalSaveButton','scrFestivalGuideMatrix','festivalBrowseSheet']) {
 vm.runInContext(html.match(new RegExp('^function ' + name + '\\([^]*?^}', 'm'))[0], context);
}
context.festivalAttr = s => s.replace(/"/g,'&quot;');
context.UI = {};
const morning = context.scrFestivalGuideMatrix(demo, '2026-09-20');
assert.ok(morning.includes('left:1729px'), '9am must have its own timeline position');
const overnight = context.scrFestivalGuideMatrix(demo, '2026-09-21');
assert.ok(overnight.includes('01:00 +1d'));
assert.ok(overnight.includes('width:574px'), '23:00–02:00 occupies three hours');
context.UI.festivalBrowseSheet='sort-events';
assert.match(context.festivalBrowseSheet(), /Earliest first/);
assert.match(context.festivalBrowseSheet(), /Latest first/);
assert.match(context.festivalSaveButton(selectedRows[0],'events','festival-preview-add'), /Sunday Art Workshop/);
console.log('PASS: morning and overnight guide geometry, sort choices and item-specific parent saving');
