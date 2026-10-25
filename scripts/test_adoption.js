// Exercise the actual nickname, stored-family and SVG export code with hostile data.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const template=fs.readFileSync(path.join(root,'source/template.html'),'utf8');
const moduleSource=fs.readFileSync(path.join(root,'source/adoption_module.js'),'utf8');
const data=JSON.parse(fs.readFileSync(path.join(root,'data/study-data.json'),'utf8'));
function between(text,start,end){const a=text.indexOf(start),b=text.indexOf(end,a+start.length);assert(a>=0&&b>a);return text.slice(a,b);}
const context=vm.createContext({DATA:data});
vm.runInContext(`const records=DATA.records;const sourceFID=r=>r.source_fid??r.fid;const byFID=new Map(records.map(r=>[r.fid,r]));`,context);
vm.runInContext(template.split('\n').find(line=>/^const esc\s*=/.test(line)),context);
vm.runInContext(template.split('\n').find(line=>/^const clamp\s*=/.test(line)),context);
vm.runInContext(template.split('\n').find(line=>/^const mix\s*=/.test(line)),context);
vm.runInContext(between(template,'function xyPath(','function addStaticChevron('),context);
vm.runInContext(template.split('\n').find(line=>/^function sourceBounds\(/.test(line)),context);
vm.runInContext(template.split('\n').find(line=>/^function publicRoad\(/.test(line)),context);
vm.runInContext(template.split('\n').find(line=>/^const movement=/.test(line)),context);
vm.runInContext(between(moduleSource,'function nicknameText(','function loadFamily('),context);
vm.runInContext(between(moduleSource,'function characterGeometry(','function characterMarkup('),context);
vm.runInContext(between(moduleSource,'function certificateMarkup(','function downloadCertificate('),context);
assert.equal(vm.runInContext(`nicknameText('  Sir   Bends-a-Lot\u0000 ')`,context),'Sir Bends-a-Lot');
assert.equal(vm.runInContext(`Array.from(nicknameText('🛣️'.repeat(30))).length`,context),24);
const id=data.records[0].fid;
context.sampleId=id;
const cleaned=vm.runInContext(`normalizeFamily([null,{fid:sampleId,name:' First '},{fid:sampleId,name:'Newest'},{fid:sampleId,name:''},{fid:99999999,name:'Ghost'},{fid:String(sampleId),name:'Wrong type'},{fid:sampleId,name:{html:'bad'}}])`,context);
assert.equal(cleaned.length,1);assert.equal(cleaned[0].name,'Newest');
assert.equal(vm.runInContext(`normalizeFamily({fid:sampleId,name:'Not an array'}).length`,context),0);
const attack='\"><img src=x onerror=1>';
context.attack=attack;
const certificate=vm.runInContext(`certificateMarkup({...records[0],number:attack,road:attack,direction:attack},nicknameText(attack))`,context);
assert(!certificate.includes('<img'));assert(!certificate.includes('<script'));
assert(certificate.includes('&lt;img'));assert(certificate.includes('xmlns="http://www.w3.org/2000/svg"'));
let vertices=0;
for(const r of data.records){
 context.roadRecord=r;
 const geometry=vm.runInContext('characterGeometry(roadRecord)',context);
 const coordinates=[...geometry.d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map(m=>[Number(m[1]),Number(m[2])]);
 assert.equal(coordinates.length,r.source_xy.length,`Lost points: ${r.fid}`);
 assert(coordinates.flat().every(Number.isFinite));
 // One scale in both axes, north up: compare every fitted point with the source.
 const p0=r.source_xy[0],q0=coordinates[0];
 const farthest=r.source_xy.map((p,i)=>({i,d:Math.hypot(p[0]-p0[0],p[1]-p0[1])})).sort((a,b)=>b.d-a.d)[0];
 const q=coordinates[farthest.i];
 const scale=Math.hypot(q[0]-q0[0],q[1]-q0[1])/farthest.d;
 assert(scale>0);
 for(let i=0;i<coordinates.length;i++){
  assert(Math.abs(coordinates[i][0]-q0[0]-(r.source_xy[i][0]-p0[0])*scale)<.0001);
  assert(Math.abs(coordinates[i][1]-q0[1]+(r.source_xy[i][1]-p0[1])*scale)<.0001);
 }
 vertices+=coordinates.length;
}
assert.equal(vertices,12877);
console.log('Passed: safe nicknames and certificates, invalid and duplicate saves, 359 north-up characters with all 12,877 points.');
