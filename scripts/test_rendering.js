// Exercise the production renderers with markup-shaped data, without a browser.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const attack = '\"><img src=x onerror=alert(1)><script>alert(2)</script>&\'';
function between(text, start, end) {
  const a = text.indexOf(start), b = text.indexOf(end, a + start.length);
  assert(a >= 0 && b > a, `Missing renderer: ${start}`);
  return text.slice(a, b);
}
function safe(markup) {
  assert(!markup.includes('<img'), 'Data created an image element');
  assert(!markup.includes('<script'), 'Data created a script element');
  assert(markup.includes('&lt;img'), 'Expected data was lost instead of escaped');
}
const main = read('source/template.html');
const escapeSource = main.split('\n').find(line => /^const esc\s*=/.test(line));
assert(escapeSource, 'Missing production text escape helper');
const context = vm.createContext({attack});
vm.runInContext(escapeSource, context);
vm.runInContext(`
const countySections=[{label:attack,name:'Test'}];
const records=[{group:'1',fid:attack,number:attack,road:attack}];
const COUNTY={by_group:{'1':{primary:'Test'}}};
const movement=()=>attack, publicRoad=x=>x;
`, context);
vm.runInContext(between(main, 'function comparisonOptionHTML()', 'function toggleTour('), context);
safe(vm.runInContext('comparisonOptionHTML()', context));

const moduleSource = read('source/superlatives_module.js');
const shapes = vm.createContext({attack});
vm.runInContext(escapeSource, shapes);
vm.runInContext(`
const state={theme:'light'};
const getCategory=()=>({id:'longest',color:attack,night:attack});
const number=Number;
const ATLAS={corridor_bounds:[0,0,10,10],corridor_mainlines:[{xy:[[0,0],[10,10]]}]};
const item={number:attack,road:attack,records:[{source_xy:[[0,0],[10,10]]}]};
`, shapes);
vm.runInContext(between(moduleSource, 'function boundsOf(', 'function histogram('), shapes);
vm.runInContext(between(moduleSource, 'function plazaSVG(', 'function renderHero('), shapes);
safe(vm.runInContext('shapeSVG(item,200,180,{hero:true})', shapes));
safe(vm.runInContext('plazaSVG({plaza:{name:attack,milepost:attack,anchor_xy:[5,5]}},200,180)', shapes));

const analytics = read('extras/GSP_Parkway_Analytics.html');
const elements = new Map();
const document = {getElementById(id) {
  if (!elements.has(id)) elements.set(id, {});
  return elements.get(id);
}};
const legacy = vm.createContext({attack,document});
vm.runInContext(escapeSource, legacy);
vm.runInContext(`
const r={fid:1,number:attack,group:attack,direction:attack,kind:attack,road:attack,
county_label:attack,shape:[[0,0],[10,10]],length_ft:100,vertex_count:2,
path_to_chord_ratio:1,total_turn_deg:0};
const byFid=new Map([['1',r]]),select={};
const DATA={similarity:{'1':[{fid:1,distance:0,reasons:[attack]}]}};
const metricsForBars=[];
`, legacy);
vm.runInContext(between(analytics, 'function fmt(', 'const metricMeta='), legacy);
vm.runInContext(between(analytics, 'function renderFingerprint(', 'search.addEventListener('), legacy);
vm.runInContext('renderFingerprint(1)', legacy);
safe(elements.get('fingerprintHost').innerHTML);

const app = read('extras/true-visuals/app.js');
assert(read('extras/true-visuals/GSP_True_Visuals.html').includes(app), 'Supporting app build is stale');
const drawing = vm.createContext({});
vm.runInContext(escapeSource + "\nconst NS='http://www.w3.org/2000/svg';", drawing);
vm.runInContext(between(app, 'function serializeDrawing(', 'function svgString('), drawing);
function element(tag, attrs={}, children=[]) {
  return {nodeType:1,namespaceURI:'http://www.w3.org/2000/svg',localName:tag,
    hasAttribute:name=>Object.hasOwn(attrs,name),getAttribute:name=>attrs[name],childNodes:children};
}
drawing.node=element('svg',{viewBox:'0 0 10 10',onload:'alert(1)'},[
  element('metadata',{},[{nodeType:3,textContent:attack}]),
  element('script',{},[{nodeType:3,textContent:'alert(1)'}]),
  element('path',{d:'M0 0L10 10',stroke:attack,href:'javascript:alert(1)',fill:'url(https://example.com/payload)'})
]);
const exported=vm.runInContext('serializeDrawing(node)',drawing);
safe(exported);
assert(!exported.includes('onload='));
assert(!exported.includes('href='));
assert(!exported.includes('fill='));
assert(exported.includes('d="M0 0L10 10"'));
vm.runInContext(between(app, 'function downloadJSON(', 'function serializeDrawing('), drawing);
drawing.value={label:attack,coordinates:[[1,2],[3,4]],quote:'"'};
const jsonDownload=vm.runInContext('downloadJSON(value)',drawing);
assert.deepEqual(JSON.parse(jsonDownload),drawing.value);
assert(!/[<>&]/.test(jsonDownload));
let downloadBlob;
const download = vm.createContext({
  Blob, URL:{createObjectURL(blob) {downloadBlob=blob;return 'blob:test';},revokeObjectURL(){}},
  document:{createElement:()=>({click(){}})},setTimeout(){},notify(){},
});
vm.runInContext(between(app, 'function save(', 'function downloadJSON('), download);
vm.runInContext(`save('test.svg','<svg/>','image/svg+xml')`, download);
assert.equal(downloadBlob.type,'application/octet-stream');
console.log('Passed: hostile comparison labels, SVG colors, plaza metadata, analytics labels and inert supporting downloads.');
