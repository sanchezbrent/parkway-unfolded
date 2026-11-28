// Exercise the production portrait geometry, safe labels and asynchronous export flow.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const template=read('source/template.html'),source=read('source/portrait_module.js'),data=JSON.parse(read('data/study-data.json')),counties=JSON.parse(read('data/county-data.json'));
function between(text,start,end){const a=text.indexOf(start),b=text.indexOf(end,a+start.length);assert(a>=0&&b>a);return text.slice(a,b);}
const measure={font:'',measureText(value){const size=Number(this.font.match(/(\d+)px/)[1]);return {width:Array.from(value).length*size*.65};}};
const context=vm.createContext({DATA:data,Blob,URL,textMeasure:measure,groupCounties:id=>counties.by_group[id].counties});
vm.runInContext('const records=DATA.records;const sourceFID=r=>r.source_fid??r.fid;',context);
for(const pattern of [/^const esc\s*=/,/^const clamp\s*=/,/^const mix\s*=/,/^const movement=/,/^const numberTitle=/,/^function sourceBounds\(/,/^function publicRoad\(/])vm.runInContext(template.split('\n').find(line=>pattern.test(line)),context);
vm.runInContext(between(template,'function xyPath(','function addStaticChevron('),context);
vm.runInContext(between(source,'function portraitGeometry(','function paintPortrait('),context);
let vertices=0;
for(const r of data.records){
 const g=context.portraitGeometry(r),coordinates=[...g.d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map(m=>[Number(m[1]),Number(m[2])]);
 assert.equal(coordinates.length,r.source_xy.length);
 for(let i=0;i<coordinates.length;i++){
  assert(Math.abs(coordinates[i][0]-coordinates[0][0]-(r.source_xy[i][0]-r.source_xy[0][0])*g.project.s)<.0001);
  assert(Math.abs(coordinates[i][1]-coordinates[0][1]+(r.source_xy[i][1]-r.source_xy[0][1])*g.project.s)<.0001);
  assert(coordinates[i][0]>=170&&coordinates[i][0]<=910&&coordinates[i][1]>=300&&coordinates[i][1]<=790);
 }
 vertices+=coordinates.length;
 for(const name of ['', 'A Very Long Noodle Name']){
  const markup=context.portraitMarkup(r,name);
  assert(markup.includes(`data-source-vertices="${r.source_xy.length}"`));
  assert(markup.includes('width="1080" height="1350"'));
  assert(!markup.includes('github.io'));
  const road=markup.match(/class="portrait-road" d="([^"]+)"/)[1];assert.equal(road,g.d);
  const textArea=markup.slice(markup.indexOf('</metadata>'));
  assert(!textArea.includes('NaN'));
 }
}
assert.equal(vertices,12877);
const attack='\"><img src=x onerror=1>&\'';
const unsafe=context.portraitMarkup({...data.records[0],road:attack,number:attack},attack);
assert(!unsafe.includes('<img'));assert(!unsafe.includes('<script'));assert(unsafe.includes('&lt;img'));
const brand=read('assets/branding/Parkway_Unfolded_Wordmark.svg');
for(const d of [...brand.matchAll(/<path[^>]* d="([^"]+)"/g)].map(m=>m[1]))assert(context.portraitWordmark().includes(`d="${d}"`));
const access=data.records.find(r=>r.group==='12');assert(context.portraitMarkup(access).includes('Access 12'));assert(context.portraitFilename(access).startsWith('parkway-access-12-'));
assert(/\.png$/.test(context.portraitFilename(data.records[0],'🛣️')));
assert(!context.portraitMarkup(data.records[0]).includes('<ellipse'));
assert.equal((context.portraitMarkup(data.records[0],'Noodle').match(/<ellipse/g)||[]).length,2);

async function testExport(){
 const nodes=new Map(),saved=[];const node=()=>({textContent:'',checked:true,disabled:false,setAttribute(){},removeAttribute(){}});
 const env=vm.createContext({Blob,portraitRecord:data.records[0],portraitNickname:'Noodle',portraitSaving:false,$:id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);},portraitMarkup:context.portraitMarkup,portraitFilename:context.portraitFilename,savePortraitBlob:(blob,name)=>saved.push({blob,name})});
 let resolveImage;env.portraitPNG=()=>new Promise(resolve=>{resolveImage=resolve;});
 vm.runInContext(between(source,'async function downloadPortrait(){',"$('rampPortraitClose')"),env);
 const first=env.downloadPortrait();await env.downloadPortrait();assert.equal(env.portraitSaving,true);assert.equal(nodes.get('rampPortraitSave').disabled,true);
 // A reroll or close during encoding must not change the selected export.
 env.portraitRecord=data.records[1];env.portraitNickname='Other';resolveImage(new Blob(['png'],{type:'image/png'}));await first;
 assert.equal(saved.length,1);assert.equal(saved[0].name,context.portraitFilename(data.records[0],'Noodle'));assert.equal(env.portraitSaving,false);assert.equal(nodes.get('rampPortraitSave').disabled,false);
 nodes.get('rampPortraitNickname').checked=false;env.portraitPNG=async()=>{throw new Error('No canvas');};await env.downloadPortrait();
 assert(saved[1].name.endsWith('.svg'));assert.equal(saved[1].blob.type,'image/svg+xml;charset=utf-8');assert(!await saved[1].blob.text().then(text=>text.includes('<ellipse')));
 assert(nodes.get('rampPortraitStatus').textContent.includes('SVG'));
 env.savePortraitBlob=()=>{throw new Error('No download');};await env.downloadPortrait();assert(nodes.get('rampPortraitStatus').textContent.includes('try again'));assert.equal(env.portraitSaving,false);
 const revoked=[],timers=new Set();let drawn=false;
 const png=vm.createContext({Blob,setTimeout:fn=>{timers.add(fn);return fn;},clearTimeout:id=>timers.delete(id),URL:{createObjectURL:()=> 'blob:image',revokeObjectURL:url=>revoked.push(url)},Image:class{set src(value){queueMicrotask(()=>this.onload());}},document:{createElement:()=>({getContext:()=>({drawImage(){drawn=true;}}),toBlob:callback=>callback(new Blob(['png'],{type:'image/png'}))})}});
 vm.runInContext(between(source,'async function portraitPNG(','function savePortraitBlob('),png);
 const blob=await png.portraitPNG('<svg/>');assert.equal(blob.type,'image/png');assert(drawn);assert.deepEqual(revoked,['blob:image']);assert.equal(timers.size,0);
}
testExport().then(()=>console.log('Passed: all 359 portrait paths retain 12,877 north-up vertices; safe names, wordmark, optional eyes, captured downloads, PNG cleanup and SVG/error fallbacks.')).catch(error=>{console.error(error);process.exitCode=1;});
