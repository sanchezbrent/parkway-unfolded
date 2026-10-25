'use strict';
const DATA=JSON.parse(document.getElementById('study-data').textContent);
const COUNTY=JSON.parse(document.getElementById('county-data').textContent);
const $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg';
const W=1920,H=1080,BOX={x:64,y:158,w:1792,h:830};
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>{t=clamp(t);return t*t*t*(t*(t*6-15)+10)};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const fmt=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:0});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state={mode:'overlay',collection:'all',county:'',kind:'',direction:'',anchor:'start',scale:'common',opacity:.38,points:false,selected:null,hover:null,time:0,playing:false,speed:1,motion:'wave',loop:false,drawing:false,drawProgress:1};
const recordMap=new Map(DATA.records.map(r=>[r.fid,r])),featured=new Set(DATA.featured_fids);
let list=[],nodes=[],scene=null,frameTimer=0,last=0,toastTimer,forceCapture=false;
const properties=new Map(DATA.records.map(r=>{
 let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity,total=0,cum=[0];
 r.source_xy.forEach((p,i)=>{minX=Math.min(minX,p[0]);maxX=Math.max(maxX,p[0]);minY=Math.min(minY,p[1]);maxY=Math.max(maxY,p[1]);if(i){total+=Math.hypot(p[0]-r.source_xy[i-1][0],p[1]-r.source_xy[i-1][1]);cum.push(total)}});
 const cx=(minX+maxX)/2,cy=(minY+maxY)/2;
 // No spline / curve commands: one L command per recorded segment.
 const d=r.source_xy.map((p,i)=>`${i?'L':'M'}${p[0]-cx} ${cy-p[1]}`).join(' ');
 return [r.fid,{bounds:[minX,minY,maxX,maxY],cx,cy,total,cum,d}];
}));
function el(tag,attrs={},text){const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))if(v!==undefined)n.setAttribute(k,String(v));if(text!==undefined)n.textContent=text;return n}
function add(p,tag,a={},t){const n=el(tag,a,t);p.append(n);return n}
function palette(){const night=document.body.classList.contains('night');return night?{paper:'#202e2c',ink:'#edf1e8',muted:'#afbeb7',line:'#485e55',exit:'#ffbd40',entrance:'#7acbbb',land:'#293d35',county:'#526359',route:'#b0c2b2',green:'#a0d3c3'}:{paper:'#fffefa',ink:'#192e38',muted:'#586c6b',line:'#d4dbd5',exit:'#a15b00',entrance:'#226d60',land:'#eff0e9',county:'#c4cec7',route:'#7b9489',green:'#075341'}}
function ink(r){return r.kind==='Exit'?palette().exit:palette().entrance}
function text(parent,x,y,t,size=16,fill=palette().muted,more={}){return add(parent,'text',{x,y,fill,'font-family':'Arial,Helvetica,sans-serif','font-size':size,...more},t)}
function path(points,project){return points.map((p,i)=>{let q=project(p);return `${i?'L':'M'}${q[0]} ${q[1]}`}).join(' ')}
function bounds(points){let b=[Infinity,Infinity,-Infinity,-Infinity];for(const p of points){b[0]=Math.min(b[0],p[0]);b[1]=Math.min(b[1],p[1]);b[2]=Math.max(b[2],p[0]);b[3]=Math.max(b[3],p[1])}return b}
function projection(b,box){const s=Math.min(box.w/Math.max(1,b[2]-b[0]),box.h/Math.max(1,b[3]-b[1])),cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2;const f=p=>[box.x+box.w/2+(p[0]-cx)*s,box.y+box.h/2-(p[1]-cy)*s];f.s=s;return f}
function anchor(r){const p=properties.get(r.fid);if(state.anchor==='end')return r.source_xy.length-1;if(state.anchor==='parkway')return r.checked_endpoint==='end'?r.source_xy.length-1:0;if(state.anchor==='mid'){let k=0,best=Infinity;p.cum.forEach((n,i)=>{if(Math.abs(n-p.total/2)<best){best=Math.abs(n-p.total/2);k=i}});return k}return 0}
function filtered(){const gs=state.county?COUNTY.counties.find(c=>c.id===state.county).groups:null;return DATA.records.filter(r=>(!gs||gs.includes(r.group))&&(!state.kind||r.kind===state.kind)&&(!state.direction||r.direction===state.direction)&&(state.collection==='all'||state.collection==='featured'&&featured.has(r.fid)||state.collection==='signature'&&r.overview_order!==null)).sort((a,b)=>a.panel-b.panel)}
function scope(){return state.county?COUNTY.counties.find(c=>c.id===state.county).name+' County':'Full Parkway · 172–0'}
function north(parent,x,y){const p=palette();text(parent,x,y-18,'N',14,p.muted,{'text-anchor':'middle'});add(parent,'path',{d:`M${x} ${y+23}V${y-2}m-5 7 5-7 5 7`,fill:'none',stroke:p.muted,'stroke-width':1.5})}
function baseSVG(){const svg=$('visual'),p=palette();svg.replaceChildren();svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('aria-label',state.mode==='overlay'?'Actual selected Parkway paths aligned at a shared original vertex':'Actual Parkway paths moving from their geographic locations into separate tiles');
 add(svg,'title',{},state.mode==='overlay'?'Shared-vertex ramp overlay':'Parkway corridor to source shapes');
 add(svg,'desc',{},'Each path is a source GIS polyline. Grid north remains up. No rotation, smoothing, synthetic loops or independently stretched axes. The default overlay preserves relative length; unfolded tiles have individual uniform scales.');
 add(svg,'rect',{x:0,y:0,width:W,height:H,fill:p.paper});
 add(svg,'rect',{x:49,y:41,width:46,height:70,rx:4,fill:'#075341'});add(svg,'rect',{x:53,y:45,width:38,height:62,rx:2,fill:'none',stroke:'#fffefa','stroke-width':.8});['G','S','P'].forEach((t,i)=>text(svg,72,63+i*18,t,16,'#fffefa',{'text-anchor':'middle'}));
 text(svg,121,77,state.mode==='overlay'?'Shared-vertex ramp overlay':'Corridor to ramp shapes',43,p.ink,{'font-family':'Georgia,serif','letter-spacing':-.5});
 text(svg,123,106,`${scope()}  ·  ${fmt(list.length)} selected paths  ·  ${fmt(list.reduce((n,r)=>n+r.source_xy.length,0))} original points`,15,p.muted);
 let lx=1514;[{kind:'Exit',word:'Exit'},{kind:'Entrance',word:'Entrance'}].forEach((r,i)=>{add(svg,'line',{x1:lx+i*150,y1:63,x2:lx+i*150+33,y2:63,stroke:r.kind==='Exit'?p.exit:p.entrance,'stroke-width':2.5});text(svg,lx+43+i*150,68,r.word,15,p.ink)});
 north(svg,1844,84);text(svg,1844,129,'Grid north',11,p.muted,{'text-anchor':'middle'});
 add(svg,'line',{x1:49,y1:139,x2:1871,y2:139,stroke:p.line,'stroke-width':1});
 add(svg,'line',{x1:49,y1:1014,x2:1871,y2:1014,stroke:p.line,'stroke-width':1});
 text(svg,50,1043,'NJDOT centerlines · August 21, 2025 · selected paths, not every physical ramp',13,p.muted);
 scene={svg,p,stage:add(svg,'g',{'data-layer':'scene'}),status:text(svg,1870,1043,'',13,p.ink,{'text-anchor':'end'})};
 return scene;
}
function polygonPath(geom,proj){const polys=geom.type==='Polygon'?[geom.coordinates]:geom.coordinates;return polys.map(poly=>poly.map(ring=>path(ring,proj)+'Z').join(' ')).join(' ')}
function createSourceNode(r,parent,strokeWidth=2){const prop=properties.get(r.fid),g=add(parent,'g',{'data-selection-id':r.fid,class:'path-interactive','aria-label':`${r.number} ${r.direction} ${r.kind.toLowerCase()}: ${r.road}`});
 add(g,'title',{},`${r.number} · ${r.direction} ${r.kind.toLowerCase()} — ${r.road} | ${r.sri}`);
 const shape=add(g,'path',{d:prop.d,fill:'none',stroke:ink(r),'stroke-width':strokeWidth,'stroke-linecap':'round','stroke-linejoin':'round','vector-effect':'non-scaling-stroke','data-source-fid':r.get_source_fid||r.source_fid||r.fid,'data-selection-fid':r.fid,'data-source-sri':r.sri,'data-source-vertices':r.source_xy.length,class:'ramp-line'});
 const hit=add(g,'path',{d:prop.d,fill:'none',stroke:'transparent','stroke-width':8,'vector-effect':'non-scaling-stroke','pointer-events':'stroke',class:'hit'});
 g.addEventListener('pointerenter',()=>{state.hover=r.fid;highlight()});g.addEventListener('pointerleave',()=>{state.hover=null;highlight()});g.addEventListener('click',()=>choose(r.fid));
 return {r,g,shape,hit,prop,pointLayer:null,transform:null,caption:null};
}
function drawOverlay(){baseSVG();const p=palette(),rel=new Map(),all=[];nodes=[];
 for(const r of list){const a=r.source_xy[anchor(r)],delta=r.source_xy.map(x=>[x[0]-a[0],x[1]-a[1]]),max=Math.max(...delta.map(x=>Math.hypot(...x))),f=state.scale==='fit'?3000/Math.max(1,max):1;rel.set(r.fid,{a,f});for(const d of delta)all.push([d[0]*f,d[1]*f])}
 if(!all.length)return;all.push([0,0]);const proj=projection(bounds(all),{x:120,y:183,w:1680,h:770}),origin=proj([0,0]);
 const cross=add(scene.stage,'g',{'aria-hidden':'true'});add(cross,'path',{d:`M${origin[0]-32} ${origin[1]}h64M${origin[0]} ${origin[1]-32}v64`,fill:'none',stroke:p.muted,'stroke-opacity':.2,'stroke-width':1});
 const layer=add(scene.stage,'g',{'data-layer':'source-paths'});
 for(const r of list){const a=rel.get(r.fid),n=createSourceNode(r,layer,1.65),target=proj([(n.prop.cx-a.a[0])*a.f,(n.prop.cy-a.a[1])*a.f]);n.transform={x:target[0],y:target[1],s:proj.s*a.f};n.anchorIndex=anchor(r);n.g.setAttribute('transform',`translate(${target[0]},${target[1]}) scale(${n.transform.s})`);n.g.setAttribute('opacity',state.opacity);n.shape.setAttribute('pathLength',1);
 if(state.points){n.pointLayer=add(n.g,'g',{'pointer-events':'none'});r.source_xy.forEach((pt,i)=>add(n.pointLayer,'circle',{cx:pt[0]-n.prop.cx,cy:n.prop.cy-pt[1],r:1.15/n.transform.s,fill:ink(r),'data-vertex-index':i}))}nodes.push(n)}
 add(scene.stage,'circle',{cx:origin[0],cy:origin[1],r:7.5,fill:p.paper,stroke:p.green,'stroke-width':2.5});add(scene.stage,'circle',{cx:origin[0],cy:origin[1],r:2.5,fill:p.green});
 const anchorNames={start:'First recorded vertex',end:'Last recorded vertex',parkway:'Parkway-side end of each selection',mid:'Existing vertex nearest half-length'};
 text(scene.stage,79,189,'Shared anchor',12,p.muted);text(scene.stage,79,216,anchorNames[state.anchor],18,p.ink);text(scene.stage,79,244,state.scale==='common'?'One common scale':'Each path scaled separately',14,p.muted);
 if(state.scale==='common'){const v=[100,250,500,1000,2000,5000].find(x=>x*proj.s>88)||5000,w=v*proj.s;add(scene.stage,'path',{d:`M79 955v7h${w}v-7`,fill:'none',stroke:p.muted,'stroke-width':1.5});text(scene.stage,79,984,`${fmt(v)} US survey feet`,12,p.muted)}
 scene.status.textContent=state.scale==='common'?'Shared vertex · common scale · no rotation':'Shared vertex · individual uniform scales · no rotation';
 $('transformNote').textContent=state.scale==='common'?'Original shapes and relative lengths preserved. Each chosen source vertex is translated to the same point; no rotation.':'Original shapes preserved, but relative sizes are normalized. Each path is uniformly scaled separately; no rotation.';
 if(state.anchor==='parkway')$('transformNote').textContent+=' Some selected ends lie on another ramp or collector, not directly on the Parkway.';
 updateDraw();highlight();
}
function gridLayout(n){let cols=n>150?24:n>70?15:n>42?12:n>24?8:n>12?6:n>6?4:3;cols=Math.min(cols,n);const rows=Math.ceil(n/cols),gap=n>150?9:14,tw=(BOX.w-(cols-1)*gap)/cols,th=Math.min(n>150?55:n>70?111:185,(BOX.h-(rows-1)*gap)/rows);const top=BOX.y+(BOX.h-(rows*th+(rows-1)*gap))/2;return {cols,rows,gap,tw,th,top}}
function drawUnfold(){baseSVG();nodes=[];const p=palette();if(!list.length)return;
 const selectedCounty=state.county?COUNTY.counties.find(c=>c.id===state.county):null;
 const sourceBounds=selectedCounty?selectedCounty.bounds:COUNTY.full_bounds;
 const proj=projection(sourceBounds,{x:210,y:178,w:1500,h:798});scene.geo=add(scene.stage,'g',{'data-layer':'geographic-context'});
 add(scene.geo,'path',{d:polygonPath(COUNTY.land,proj),fill:p.land,stroke:p.line,'stroke-width':.9,'fill-rule':'evenodd'});
 for(const c of COUNTY.counties)add(scene.geo,'path',{d:polygonPath(c.geometry,proj),fill:'none',stroke:c.id===state.county?p.green:p.county,'stroke-width':c.id===state.county?1.8:.8,'fill-rule':'evenodd'});
 for(const l of DATA.corridor_mainlines)add(scene.geo,'path',{d:path(l.xy,proj),fill:'none',stroke:p.route,'stroke-width':1.6,'stroke-linecap':'round','stroke-linejoin':'round'});
 // Geographic context is clipped to the viewport. Selected ramp lines are never clipped.
 const defs=add(scene.svg,'defs'),clip=add(defs,'clipPath',{id:'map-viewport'});add(clip,'rect',{x:BOX.x,y:BOX.y,width:BOX.w,height:BOX.h});scene.geo.setAttribute('clip-path','url(#map-viewport)');
 const uniqueGroups=DATA.group_order.filter(g=>list.some(r=>r.group===g));
 for(const g of uniqueGroups){const xy=proj(DATA.groups[g].center);add(scene.geo,'circle',{cx:xy[0],cy:xy[1],r:1.8,fill:p.green});}
 const gs=[uniqueGroups[0],uniqueGroups.at(-1)];for(const [i,g]of gs.entries()){const xy=proj(DATA.groups[g].center);text(scene.geo,xy[0]+13,xy[1]+(i?18:-10),`${g==='12'?'Access':'Exit'} ${g}`,16,p.ink,{'paint-order':'stroke',stroke:p.paper,'stroke-width':4,'stroke-linejoin':'round'});}
 if(!selectedCounty){let ci=COUNTY.counties.map(c=>({c,p:proj(c.label_point)}));ci.forEach(({c,p:q},i)=>{const left=i%2===0,tx=left?Math.max(370,q[0]-220):Math.min(1570,q[0]+190);text(scene.geo,tx,q[1],c.name,12,p.muted,{'text-anchor':left?'end':'start'});add(scene.geo,'path',{d:`M${tx+(left?9:-9)} ${q[1]-4}L${q[0]} ${q[1]-4}`,stroke:p.county,'stroke-width':.7,fill:'none'})})}
 const lay=gridLayout(list.length);scene.frames=add(scene.stage,'g',{'data-layer':'grid-labels'});scene.ramps=add(scene.stage,'g',{'data-layer':'source-paths'});
 const cellSmall=lay.th<92,captionHeight=cellSmall?17:lay.th<130?27:53;
 for(let i=0;i<list.length;i++){
  const r=list[i],pr=properties.get(r.fid),col=i%lay.cols,row=Math.floor(i/lay.cols),tx=BOX.x+col*(lay.tw+lay.gap),ty=lay.top+row*(lay.th+lay.gap),drawH=lay.th-captionHeight;
  const fitS=Math.min((lay.tw-16)/Math.max(1,pr.bounds[2]-pr.bounds[0]),(drawH-8)/Math.max(1,pr.bounds[3]-pr.bounds[1]));
  const cap=add(scene.frames,'g');add(cap,'line',{x1:tx,y1:ty+lay.th+3,x2:tx+lay.tw,y2:ty+lay.th+3,stroke:p.line,'stroke-width':.6});
  if(cellSmall){text(cap,tx+2,ty+lay.th-2,`${r.number} · ${r.direction==='Northbound'?'NB':'SB'} ${r.kind==='Exit'?'exit':'in'}`,9.6,p.ink)}
  else {text(cap,tx+4,ty+drawH+17,r.number,lay.th<130?17:22,p.ink,{'font-weight':500});text(cap,tx+lay.tw-3,ty+drawH+16,`${r.direction==='Northbound'?'NB':'SB'} ${r.kind.toLowerCase()}`,11,p.muted,{'text-anchor':'end'});if(lay.th>=130){let str=r.road.replace(/^From /,'');const lim=Math.floor(lay.tw/6.1);const words=str.split(' ');let lines=[''];for(const w of words){const ix=lines.length-1;if((lines[ix]+' '+w).trim().length>lim&&ix===0)lines.push(w);else lines[ix]+=(lines[ix]?' ':'')+w}lines.slice(0,2).forEach((s,k)=>text(cap,tx+4,ty+drawH+34+k*13,s.length>lim?s.slice(0,lim-1)+'…':s,10.8,p.muted))}}
  const node=createSourceNode(r,scene.ramps,cellSmall?1.65:2.35),q=proj([pr.cx,pr.cy]);node.map={x:q[0],y:q[1],s:proj.s};node.tile={x:tx+lay.tw/2,y:ty+drawH/2,s:fitS};node.caption=cap;node.rank=i;nodes.push(node);
 }
 $('transformNote').textContent='Each original polyline travels from its actual map position into a separate tile and back. Only position and uniform scale change; north stays up.';
 applyTime();highlight();
}
function localProgress(t,i,n){const delay=state.motion==='wave'&&n>1?.22*i/(n-1):0;return ease(clamp((t-delay)/(1-.22*(state.motion==='wave'?1:0))))}
function progress(u,i,n){if(u<.10)return 0;if(u<=.40)return localProgress((u-.10)/.30,i,n);if(u<.60)return 1;if(u<=.90)return 1-localProgress((u-.60)/.30,i,n);return 0}
function phase(u){return u<.10?'On corridor':u<.40?'Unfolding':u<.60?'Shape grid':u<.90?'Returning to corridor':'On corridor'}
function applyTime(){if(state.mode!=='unfold'||!scene)return;let sum=0;for(const n of nodes){const t=progress(state.time,n.rank,nodes.length);sum+=t;const x=lerp(n.map.x,n.tile.x,t),y=lerp(n.map.y,n.tile.y,t),s=lerp(n.map.s,n.tile.s,t);n.transform={x,y,s};n.g.setAttribute('transform',`translate(${x},${y}) scale(${s})`);n.caption.setAttribute('opacity',ease(clamp((t-.72)/.28)))}
 const avg=sum/Math.max(1,nodes.length);if(scene.geo)scene.geo.setAttribute('opacity',Math.pow(1-clamp(avg*3.5),2));
 scene.status.textContent=`${phase(state.time)} · ${state.time>=.4&&state.time<=.6?'individual uniform scales':state.time<=.1||state.time>=.9?'one geographic scale':'translation + uniform scaling'}`;
 $('phase').textContent=phase(state.time);$('scrub').value=Math.round(state.time*1000);$('scrub').setAttribute('aria-valuetext',`${phase(state.time)}, ${Math.round(state.time*100)} percent of sequence`);
}
function updateDraw(){if(state.mode!=='overlay')return;for(const n of nodes){n.shape.setAttribute('stroke-dasharray',state.drawProgress<1?'1 1':'none');n.shape.setAttribute('stroke-dashoffset',1-ease(state.drawProgress));if(n.pointLayer)n.pointLayer.setAttribute('opacity',state.drawProgress<1?0:1)}}
function render(){list=filtered();if(state.selected!==null&&!list.some(r=>r.fid===state.selected))state.selected=null;state.hover=null;$('count').textContent=`${fmt(list.length)} paths · ${new Set(list.map(r=>r.group)).size} access groups`;$('visual').hidden=!list.length;$('empty').hidden=!!list.length;
 $('inspect').innerHTML='<option value="">All paths</option>'+list.map(r=>`<option value="${Number(r.fid)}">${esc(r.number)} · ${r.direction==='Northbound'?'NB':'SB'} ${esc(r.kind.toLowerCase())} · ${esc(r.road)}</option>`).join('');$('inspect').value=state.selected===null?'':state.selected;
 if(state.mode==='overlay')drawOverlay();else drawUnfold();updatePlay();
}
function choose(fid){state.selected=fid===null||state.selected===fid?null:fid;state.hover=null;$('inspect').value=state.selected===null?'':state.selected;highlight()}
function highlight(){const active=state.hover??state.selected;for(const n of nodes){const is=n.r.fid===active,has=active!==null;n.g.setAttribute('opacity',state.mode==='overlay'?(has?(is?1:.065):state.opacity):(has?(is?1:.2):1));n.shape.setAttribute('stroke-width',is?3.8:state.mode==='overlay'?1.65:nodes.length>150?1.65:2.35);if(n.caption)n.caption.style.visibility=has&&!is&&state.mode==='unfold'?'hidden':'visible'}
 if(active===null){$('selection').textContent='Hover a line or choose a path to see its exit, connection and source identifier.';return}const r=recordMap.get(active),pr=properties.get(active);$('selection').innerHTML=`<strong>${esc(r.group==='12'?'Access':'Exit')} ${esc(r.number)} · ${esc(r.direction)} ${esc(r.kind.toLowerCase())}</strong>${esc(r.road)} · ${fmt(pr.total)} ft<small>${esc(r.sri)} · source FID ${Number(r.source_fid??r.fid)} · ${r.source_xy.length} source points${state.mode==='overlay'?' · anchor index '+Number(anchor(r)):''}</small><small>${esc(r.note)}</small>`;
}
function setMode(m){state.mode=m;state.playing=false;state.drawing=false;state.drawProgress=1;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===m));$('overlayControls').hidden=m!=='overlay';$('unfoldControls').hidden=m!=='unfold';$('scrubWrap').hidden=m!=='unfold';render()}
function updatePlay(){$('play').textContent=state.playing?'Pause':state.time>0&&state.time<1?'Resume sequence':'Play full sequence';$('play').setAttribute('aria-pressed',state.playing);$('draw').textContent=state.drawing?'Stop drawing':'Draw the paths'}
function play(){if(state.playing)state.playing=false;else{if(state.time>=1)state.time=0;state.playing=true}updatePlay()}
function reset(){['collection','county','kind','direction'].forEach(id=>{state[id]=id==='collection'?'all':'';$(id).value=state[id]});state.selected=null;state.time=0;state.playing=false;render()}
function notify(s){clearTimeout(toastTimer);$('toast').textContent=s;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,3400)}
function save(name,content,type){const u=URL.createObjectURL(content instanceof Blob?content:new Blob([content],{type:'application/octet-stream'})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1500);notify(`Saved ${name}`)}
function serializeDrawing(node){
 // Exports contain drawing primitives and escaped text, never active SVG content.
 const tags=new Map(['svg','g','path','rect','line','circle','text','title','desc','metadata','defs','clipPath'].map(t=>[t,t]));
 const attributes=['xmlns','viewBox','width','height','x','y','x1','y1','x2','y2','cx','cy','r','rx','d','fill','fill-rule','stroke','stroke-width','stroke-opacity','stroke-linecap','stroke-linejoin','stroke-dasharray','stroke-dashoffset','opacity','transform','pathLength','vector-effect','font-family','font-size','font-weight','letter-spacing','text-anchor','paint-order','id','class','role','aria-label','aria-hidden','clip-path','data-layer','data-selection-id','data-source-fid','data-selection-fid','data-source-sri','data-source-vertices','data-vertex-index'];
 function serialize(n){
  if(n.nodeType===3)return esc(n.textContent);
  if(n.nodeType!==1||n.namespaceURI!==NS)return '';
  const tag=tags.get(n.localName);if(!tag)return '';
  let attrs='';for(const name of attributes){if(!n.hasAttribute(name))continue;const value=n.getAttribute(name);
   if(['fill','stroke','clip-path'].includes(name)&&/url\s*\(/i.test(value)&&!/^url\(#[\w-]+\)$/.test(value))continue;
   attrs+=` ${name}="${esc(value)}"`;
  }
  return `<${tag}${attrs}>${Array.from(n.childNodes,serialize).join('')}</${tag}>`;
 }
 return serialize(node);
}
function svgString(){const clone=$('visual').cloneNode(true);clone.removeAttribute('hidden');clone.setAttribute('xmlns',NS);clone.setAttribute('width',W);clone.setAttribute('height',H);clone.style.width='';clone.style.minWidth='';clone.querySelectorAll('.hit').forEach(n=>n.remove());
 const md=el('metadata',{},JSON.stringify({source:DATA.visual_provenance,source_zip_sha256:DATA.provenance.official_source_zip_sha256,crs:DATA.crs,mode:state.mode,scope:scope(),anchor:state.mode==='overlay'?state.anchor:null,scale:state.mode==='overlay'?state.scale:'common geographic to individual tiles',sequence_position:state.time,records:list,display_transforms:nodes.map(n=>({selection_id:n.r.fid,local_center:[n.prop.cx,n.prop.cy],source_y_inverted_for_screen:true,anchor_index:n.anchorIndex??null,...n.transform}))}));clone.insertBefore(md,clone.firstChild);return '<?xml version="1.0" encoding="UTF-8"?>\n'+serializeDrawing(clone)}
async function pngBlob(){const str=svgString(),u=URL.createObjectURL(new Blob([str],{type:'image/svg+xml'}));try{const im=new Image();await new Promise((resolve,reject)=>{im.onload=resolve;im.onerror=reject;im.src=u});const c=document.createElement('canvas');c.width=W;c.height=H;c.getContext('2d').drawImage(im,0,0);return await new Promise(res=>c.toBlob(res,'image/png'))}finally{URL.revokeObjectURL(u)}}
function filename(){return `GSP_${state.mode==='overlay'?'Overlay_'+state.anchor+'_'+state.scale:'Unfold_'+Math.round(state.time*100)}_${list.length}_paths`}
function tick(now){const dt=last?Math.min(.1,(now-last)/1000):0;last=now;if(!document.hidden&&!forceCapture){if(state.playing&&state.mode==='unfold'){state.time+=dt*state.speed/24;if(state.time>=1){if(state.loop)state.time%=1;else{state.time=1;state.playing=false;updatePlay()}}applyTime()}if(state.drawing&&state.mode==='overlay'){state.drawProgress=clamp(state.drawProgress+dt/4);updateDraw();if(state.drawProgress===1){state.drawing=false;updatePlay()}}}requestAnimationFrame(tick)}
function init(){
 $('county').innerHTML='<option value="">Full Parkway</option>'+COUNTY.counties.map(c=>`<option value="${esc(c.id)}">${esc(c.name)} County</option>`).join('');
 document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
 ['collection','county','kind','direction','anchor','scale','motion'].forEach(id=>$(id).addEventListener('change',()=>{state[id]=$(id).value;state.playing=false;state.drawing=false;state.drawProgress=1;if(!['anchor','scale'].includes(id))state.time=0;render()}));
 $('points').addEventListener('change',()=>{state.points=$('points').checked;render()});$('opacity').addEventListener('input',()=>{state.opacity=Number($('opacity').value)/100;highlight()});
 $('play').addEventListener('click',play);$('restart').addEventListener('click',()=>{state.time=0;state.playing=false;applyTime();updatePlay()});$('corridor').addEventListener('click',()=>{state.time=0;state.playing=false;applyTime();updatePlay()});$('grid').addEventListener('click',()=>{state.time=.5;state.playing=false;applyTime();updatePlay()});$('scrub').addEventListener('input',()=>{state.time=Number($('scrub').value)/1000;state.playing=false;applyTime();updatePlay()});$('speed').addEventListener('change',()=>{state.speed=Number($('speed').value)});$('loop').addEventListener('change',()=>state.loop=$('loop').checked);
 $('draw').addEventListener('click',()=>{if(state.drawing){state.drawing=false;state.drawProgress=1;updateDraw()}else{state.drawProgress=0;state.drawing=true;updateDraw()}updatePlay()});
 $('reset').addEventListener('click',reset);$('emptyReset').addEventListener('click',reset);$('inspect').addEventListener('change',()=>{const v=$('inspect').value;state.selected=v===''?null:Number(v);state.hover=null;highlight()});$('clearSelection').addEventListener('click',()=>{state.selected=null;state.hover=null;$('inspect').value='';highlight()});
 $('theme').addEventListener('click',()=>{document.body.classList.toggle('night');const night=document.body.classList.contains('night');$('theme').textContent=night?'Light background':'Dark background';$('theme').setAttribute('aria-label',night?'Switch to light background':'Switch to dark background');render()});
 $('zoom').addEventListener('change',()=>{$('visual').style.width=`${Number($('zoom').value)*100}%`});
 $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('visualShell').requestFullscreen()}catch(e){$('visualShell').classList.toggle('expanded')}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('visualShell').classList.remove('expanded');state.playing=false;state.drawing=false;state.drawProgress=1;updatePlay();updateDraw()}if(e.code==='Space'&&e.target===document.body&&state.mode==='unfold'){e.preventDefault();play()}});
 $('saveSVG').addEventListener('click',()=>save(filename()+'.svg',svgString(),'image/svg+xml'));
 $('savePNG').addEventListener('click',async()=>{try{save(filename()+'.png',await pngBlob(),'image/png')}catch(e){console.error(e);notify('Image export failed. The SVG export remains available.')}});
 $('saveData').addEventListener('click',()=>save('GSP_original_paths.json',JSON.stringify({crs:DATA.crs,provenance:DATA.visual_provenance,source_zip_sha256:DATA.provenance.official_source_zip_sha256,records:DATA.records},null,2),'application/json'));
 reduced.addEventListener('change',e=>{if(e.matches){state.playing=false;state.drawing=false;state.drawProgress=1;updateDraw();updatePlay()}});
 const qs=new URLSearchParams(location.search);if(qs.has('capture')){document.body.classList.add('capture');forceCapture=true}
 for(const k of ['collection','county','kind','direction','anchor','scale','motion'])if(qs.has(k)){state[k]=qs.get(k);if($(k))$(k).value=state[k]}
 if(qs.get('night')==='1')document.body.classList.add('night');setMode(qs.get('mode')==='unfold'?'unfold':'overlay');if(qs.has('time')){state.time=clamp(Number(qs.get('time')));applyTime()}
 window.LAB={configure(o){state.playing=false;state.drawing=false;for(const[k,v]of Object.entries(o)){if(k in state)state[k]=v;if($(k)){if(typeof v==='boolean')$(k).checked=v;else $(k).value=v}}if(o.night!==undefined)document.body.classList.toggle('night',o.night);if(o.mode)setMode(o.mode);else render();if(o.time!==undefined){state.time=o.time;applyTime()}},seek(t){state.playing=false;state.time=clamp(t);applyTime();updatePlay()},overlayReveal(t){state.drawProgress=clamp(t);updateDraw()},svgString,async pngDataURL(){const b=await pngBlob();return await new Promise(res=>{const r=new FileReader();r.onload=()=>res(r.result);r.readAsDataURL(b)})},info(){return {mode:state.mode,count:list.length,vertices:list.reduce((n,r)=>n+r.source_xy.length,0),time:state.time,selected:state.selected,source_fids:list.map(r=>r.fid),path_count:$('visual').querySelectorAll('.ramp-line').length,transforms:nodes.map(n=>({fid:n.r.fid,center:[n.prop.cx,n.prop.cy],anchor:n.anchorIndex,transform:n.transform,map:n.map,tile:n.tile,points:n.r.source_xy})),state:{...state}}}};
 requestAnimationFrame(tick);
}
init();
