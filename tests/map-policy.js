const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('index.html', 'utf8');
const mount = source.match(/^function mountFestivalMap\([^]*?^}/m)[0];
let requests = 0, failure, options, removed = 0;
const canvas = {innerHTML:''};
const map = {remove(){removed++;}, fitBounds(){}, invalidateSize(){}};
const L = {
  map(){return map;},
  tileLayer(url, opts){
    assert.equal(url, 'https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    options = opts;
    return {once(name, fn){assert.equal(name, 'tileerror'); failure = fn;}, addTo(){requests++;}};
  },
  divIcon(){}, marker(){return {addTo(){return this;}, on(){}, getElement(){return {setAttribute(){}};}};}
};
const ctx = {window:{location:{protocol:'file:',replace(url){assert.equal(url,'http://localhost:8765/index.html');}}, L}, L,
  document:{querySelector(){return canvas;}}, festivalLeafletMap:null,
  festivalHttpPreviewUrl(){return 'http://localhost:8765/index.html';}, festivalTilesUnavailable:false, UI:{}, festivalById(){return {};}, LIVE_FESTIVALS:[{}],
  listingThumbInner(){return '<img alt="">';}, festivalMapGroups(){return {Venue:[{}]};}, FESTIVAL_VENUE_LOCATIONS:{Venue:{lat:54,lon:-5}},
  ICONS:{pin:''}, requestAnimationFrame(fn){fn();}, setTimeout(fn){fn();}};
vm.createContext(ctx); vm.runInContext(mount, ctx);
ctx.mountFestivalMap(); assert.equal(requests, 0, 'file previews must not request tiles');
ctx.window.location.protocol = 'http:';
ctx.mountFestivalMap(); assert.equal(requests, 1);
assert.equal(options.referrerPolicy, 'origin');
assert.equal(options.keepBuffer, 0);
assert.equal(options.updateWhenIdle, true);
assert.equal(options.updateWhenZooming, false);
assert.match(options.attribution, /OpenStreetMap contributors/);
failure(); assert.equal(removed, 1); assert.match(canvas.innerHTML, /provider is unavailable/);
ctx.mountFestivalMap(); assert.equal(requests, 1, 'rerenders must not retry rejected tiles');
console.log('PASS: HTTP-only tiles, referrer, attribution, viewport loading and failure suppression');
