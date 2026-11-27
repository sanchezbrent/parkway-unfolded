// Verify the new transition keeps every original point and a north-up, uniform scale.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const template=read('source/template.html'),moduleSource=read('source/simple_module.js'),data=JSON.parse(read('data/study-data.json'));
const context=vm.createContext({DATA:data});
for(const prefix of ['const mix =','const mix=']){
 const line=template.split('\n').find(line=>line.startsWith(prefix));if(line){vm.runInContext(line,context);break;}
}
function between(source,start,end){const a=source.indexOf(start),b=source.indexOf(end,a+start.length);assert(a>=0&&b>a);return source.slice(a,b);}
vm.runInContext(between(template,'function fit(','const lengths ='),context);
vm.runInContext(template.split('\n').find(line=>line.startsWith('function sourceBounds(')),context);
vm.runInContext(between(moduleSource,'function simpleCellProjection(','function drawScene('),context);
let points=0;
for(const r of data.records){
 context.r=r;
 const b=data.metrics_by_fid[String(r.fid)].source_xy_bounds;
 context.b=b;
 for(const padding of [undefined,16])for(const t of [0,.25,.5,.75,1]){
  context.t=t;context.padding=padding;
  const result=vm.runInContext(`(()=>{const start=fit(b,900,360,35),end=simpleCellProjection(r,{x:20,y:40,w:420,h:150},padding),p=simpleBlendedProjection(start,end,t);return {scale:p.s,points:r.source_xy.map(p)};})()`,context);
  assert.equal(result.points.length,r.source_xy.length);
  assert(result.scale>0);
  const source0=r.source_xy[0],display0=result.points[0];
  result.points.forEach((point,i)=>{
   assert(point.every(Number.isFinite));
   assert(Math.abs(point[0]-display0[0]-(r.source_xy[i][0]-source0[0])*result.scale)<1e-6);
   assert(Math.abs(point[1]-display0[1]+(r.source_xy[i][1]-source0[1])*result.scale)<1e-6);
  });
 }
 points+=r.source_xy.length;
}
assert.equal(points,12877);
for(const width of [280,362,700,1120])for(const group of Object.values(data.groups)){
 context.count=group.fids.length;context.width=width;
 const layout=vm.runInContext('sceneLayout(count,width)',context);
 assert.equal(layout.cells.length,group.fids.length);
 for(const c of layout.cells){assert(c.x>=0&&c.y>=0&&c.w>0&&c.h>0);assert(c.x+c.w<=width&&c.y+c.h<=layout.height);}
}
console.log('Passed: all 359 shapes retain 12,877 vertices throughout the transition; every exit fits phone and desktop grids.');

// Exercise the actual demo controller with a virtual animation clock.
// It must play once, stop when hidden, and remain still for reduced motion.
function demoHarness(reduce=false){
 const nodes=new Map(),frames=new Map();let clock=0,next=0;
 const env=vm.createContext({
  $:id=>{if(!nodes.has(id))nodes.set(id,{textContent:'',disabled:false});return nodes.get(id);},
  reduced:{matches:reduce},document:{hidden:false,body:{dataset:{simpleView:'overview'}}},
  performance:{now:()=>clock},requestAnimationFrame:fn=>{frames.set(++next,fn);return next;},cancelAnimationFrame:id=>frames.delete(id),
  landingDemo:{progress:reduce?1:0},landingDemoFrame:null,landingDemoPlayed:false,landingDemoVisible:true,
  paintLandingDemo:amount=>{env.landingDemo.progress=amount;}
 });
 vm.runInContext(between(moduleSource,'function finishLandingDemo(){','function buildLandingDemo(){'),env);
 return {env,nodes,frames,run:code=>vm.runInContext(code,env),tick(ms){clock=ms;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(ms));}};
}
const demo=demoHarness();demo.run('maybeStartLandingDemo()');
assert.equal(demo.frames.size,1);assert.equal(demo.nodes.get('simpleDemoReplay').disabled,true);
demo.tick(2000);assert.equal(demo.env.landingDemo.progress,1);assert.equal(demo.frames.size,0);
assert.equal(demo.nodes.get('simpleDemoReplay').textContent,'Replay unfolding');
demo.run('maybeStartLandingDemo()');assert.equal(demo.frames.size,0,'automatic playback must not loop');
demo.run('runLandingDemo(true)');demo.env.document.hidden=true;demo.tick(2200);
assert.equal(demo.frames.size,0);assert.equal(demo.env.landingDemo.progress,1);assert.equal(demo.nodes.get('simpleDemoReplay').disabled,false);
demo.env.document.hidden=false;demo.run('runLandingDemo(true)');demo.env.landingDemoVisible=false;demo.tick(2400);
assert.equal(demo.frames.size,0);assert.equal(demo.env.landingDemo.progress,1);
demo.env.landingDemoVisible=true;demo.run('runLandingDemo(true)');demo.env.document.body.dataset.simpleView='atlas';demo.tick(2600);
assert.equal(demo.frames.size,0);assert.equal(demo.nodes.get('simpleDemoReplay').disabled,false);
const still=demoHarness(true);still.run('maybeStartLandingDemo()');assert.equal(still.frames.size,0);
still.run('runLandingDemo(true)');assert.equal(still.env.landingDemo.progress,0);assert.equal(still.nodes.get('simpleDemoReplay').textContent,'Show unfolded');
still.run('runLandingDemo(true)');assert.equal(still.env.landingDemo.progress,1);assert.equal(still.frames.size,0);assert.equal(still.nodes.get('simpleDemoReplay').textContent,'Show on map');
console.log('Passed: opening demo plays once, replays, stops offscreen, and offers still states for reduced motion.');

// The narrow map must leave room for signs without changing bends or separating layers.
vm.runInContext(between(template,'function overviewProjection(','function drawOverview(){'),context);
context.mapBounds=JSON.parse(read('data/county-data.json')).full_bounds;
for(const width of [280,292,320,339,362,700])for(const full of [false,true]){
 context.mapWidth=width;context.fullMap=full;
 const result=vm.runInContext(`(()=>{const small=mapWidth<681,p=overviewProjection(mapBounds,mapWidth,430,small,fullMap),base=fit(mapBounds,mapWidth,430,{left:small?26:65,right:small?26:65,top:35,bottom:35}),source=DATA.corridor_mainlines.flatMap(l=>l.xy);return {scale:p.s,source,points:source.map(p),base:source.map(base)};})()`,context);
 assert(result.scale>0);
 const a=result.source[0],b=result.points[0];
 result.points.forEach((point,i)=>{
  assert(point.every(Number.isFinite));
  assert(Math.abs(point[0]-b[0]-(result.source[i][0]-a[0])*result.scale)<1e-6);
  assert(Math.abs(point[1]-b[1]+(result.source[i][1]-a[1])*result.scale)<1e-6);
  if(full&&width<340){assert(point[0]>=110-1e-6&&point[0]<=width-110+1e-6);assert(point[1]>=0&&point[1]<=430);}
  else assert.deepEqual(point,result.base[i]);
 });
}
console.log('Passed: narrow map leaves a clear road corridor; its shared projection keeps every point north up at one uniform scale.');

// First-visit searches use familiar labels and the source's lettered exit numbers.
const counties=JSON.parse(read('data/county-data.json'));
Object.assign(context,{groupOrder:data.group_order,groupNames:data.group_names,byFID:new Map(data.records.map(r=>[r.fid,r])),groupCounties:id=>counties.by_group[id].counties,esc:value=>String(value)});
vm.runInContext(template.split('\n').find(line=>line.startsWith('function normalSearch(')),context);
vm.runInContext(between(moduleSource,'function exitSearchQuery(','function renderFind('),context);
const find=query=>Array.from(context.findExitGroups(query));
assert.deepEqual(find('Exit 135'),['135']);
assert.deepEqual(find('  EXIT135  '),['135']);
for(const number of ['100A','100B','100C'])assert.deepEqual(find(number),['100']);
assert.deepEqual(find('exit 155b'),['155B']);
assert.deepEqual(find('Access 12'),['12']);
assert.deepEqual(find('Ocean County'),find('Ocean'));
assert.deepEqual(find('County Ocean'),find('Ocean'));
assert.deepEqual(find('Rt. 37'),find('Route 37'));
assert.deepEqual(find('NJ 37'),find('Route 37'));
assert(find('Route 37').includes('82'));
assert(find('Route 33').includes('100'));
assert.deepEqual(find('Clark'),['135']);
assert.deepEqual(find('999'),[]);
assert.deepEqual(find('not a Parkway road'),[]);
assert.deepEqual(find('  '),data.group_order);
for(const record of data.records)assert(find(record.number).includes(record.group),`Missing exit ${record.number}`);
assert(context.findExitRowHTML('100','Exit 100B').includes('Includes Exit 100B'));
assert(!context.findExitRowHTML('135','135').includes('Includes Exit'));
console.log('Passed: exit prefixes, lettered numbers, county wording and road abbreviations find the original exit areas.');
