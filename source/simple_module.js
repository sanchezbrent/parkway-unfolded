/* A guided atlas experiment, built on the unchanged atlas records. */
(function(){
'use strict';
const demoGroup='135',picks=['135','138','82','105','100','91'];
const openingQuery=new URLSearchParams((window.GSPInitialViewHash??location.hash).slice(1));
let group=demoGroup,unfolded=false,progress=0,selected=null,hasUnfolded=false,animation=null,scene=null,activeDialogFocus=null,galleryOpened=false,comparisonOrigin='explore';
const priorSwitch=switchWorkspace;
const experience=document.createElement('section');
experience.id='simpleExperience';experience.className='wrap';experience.tabIndex=-1;
const skip=document.querySelector('.skip-link');if(skip){skip.href='#simpleLanding';skip.textContent='Skip to the Parkway';}
$('brandHome').setAttribute('aria-label','Return to the full Parkway');
experience.innerHTML=`<div class="simple-shell"><header class="simple-intro"><h2>Every exit has a shape.</h2><p id="simpleIntroCopy">These are real Garden State Parkway ramps, lifted off the map so you can see their shapes.</p></header><section class="simple-scene" aria-labelledby="simpleExitHeading"><header class="simple-scene-head"><div class="simple-location"><h3 class="simple-exit" id="simpleExitHeading"></h3><p class="simple-exit-road"><span id="simpleExitRoad"></span><span class="simple-county" id="simpleCounty"></span></p></div><button class="simple-primary" id="simpleUnfold" aria-controls="simpleMap" aria-expanded="false">Unfold this exit ↗</button></header><div class="simple-canvas" id="simpleCanvas"><span class="simple-map-note" id="simplePhase">On the map</span><span class="simple-north">N ↑</span><svg class="simple-map" id="simpleMap" role="group"></svg></div><footer class="simple-scene-foot"><p id="simpleSceneHint">The highlighted lines are the ramps.</p><span id="simpleScaleNote">North stays up.</span></footer></section><div class="simple-next" id="simpleNext" hidden><p id="simpleNextHint">Pick a shape to take a closer look.</p><button class="text-button" id="simpleAnother">Try another exit ↝</button></div><section class="simple-selected" id="simpleSelected" aria-labelledby="simpleSelectedTitle" hidden></section><details class="simple-discover" id="simpleDiscover" hidden><summary>A few other good bends</summary><div class="simple-picks" id="simplePicks"></div><button class="text-button simple-browse-all" id="simpleBrowseAll">Find any Parkway exit →</button></details><p class="sr-only" role="status" aria-live="polite" id="simpleAnnouncement"></p></div>`;
$('top').prepend(experience);
const landing=document.createElement('section');landing.id='simpleLanding';landing.className='wrap';
landing.innerHTML=`<div class="simple-landing-hero"><div class="simple-landing-copy"><span class="adoption-eyebrow">The Garden State Parkway, taken apart.</span><h2>Every exit has a shape.</h2><p>Explore the real shapes of the Parkway’s ramps. Find a familiar exit, pull its roads apart, and see what you’ve been driving past.</p><button class="simple-primary" id="simpleStart">See how it works · Exit 135 ↗</button></div><div class="simple-teasers" id="simpleTeasers" aria-label="A few real Parkway ramp shapes"></div></div><nav class="simple-view-nav" aria-label="Ways to explore"><button data-simple-workspace="overview" aria-pressed="true">Parkway map</button><button data-simple-workspace="atlas" aria-pressed="false">Ramp shapes</button><button data-simple-workspace="superlatives" aria-pressed="false" class="simple-gold">Top 10s</button></nav>`;
$('top').prepend(landing);
const tools=document.createElement('section');tools.id='simpleTools';tools.className='wrap';tools.setAttribute('aria-label','Browse and map options');
for(const selector of ['.shared-range','.integrated-layers','.layer-legends'])tools.append(document.querySelector(selector));
landing.after(tools);
const collectionCopy=$('atlas').querySelector('.atlas-copy p');collectionCopy.textContent='The roads, pulled apart. Choose a shape to meet it, or put them back on the map.';
function setSimpleNavigation(view){
 document.body.dataset.simpleView=view;
 if(skip){skip.href=view==='explore'?'#simpleExperience':['family','compare'].includes(view)?'#'+(view==='family'?'adoptionFamily':'compareDialog'):'#simpleLanding';skip.textContent=view==='explore'?'Skip to the exit':'Skip to the Parkway';}
 for(const button of landing.querySelectorAll('[data-simple-workspace]'))button.setAttribute('aria-pressed',String(button.dataset.simpleWorkspace===view));
 $('simpleBack').hidden=!['explore','family','compare'].includes(view);
 $('simpleBack').textContent=view==='explore'?'← Parkway map':view==='compare'&&comparisonOrigin==='atlas'?'← Ramp shapes':'← Back to the exit';
}

const headerNav=document.createElement('nav');headerNav.className='simple-header-nav';headerNav.setAttribute('aria-label','Explore the Parkway');
headerNav.innerHTML='<button id="simpleBack" hidden>← Back to the exit</button><button id="simpleFind">Find your exit <span aria-hidden="true">⌕</span></button><button id="simpleFamily" hidden>My ramps</button>';
document.querySelector('.header-tools').append(headerNav);
const about=document.createElement('dialog');about.id='simpleAbout';about.className='simple-dialog';about.setAttribute('aria-labelledby','simpleAboutTitle');
about.innerHTML=`<header class="simple-dialog-head"><h2 id="simpleAboutTitle">About Parkway Unfolded</h2><button class="icon-button" data-simple-close="simpleAbout" aria-label="Close About">✕</button></header><div class="simple-dialog-body"><p>Parkway Unfolded takes the Garden State Parkway’s entrance ramps, exit ramps and connecting roads off the map, so you can look closely at their shapes.</p><p>Browse the Parkway map by county, explore the ramp shapes, or visit the Top 10s. For a quick introduction, choose <strong>See how it works</strong> on the opening page. At an exit, choose <strong>Unfold this exit</strong> to pull its ramps apart. The same lines move from their real locations into separate spaces: their bends stay the same, north stays up, and each drawing is enlarged to fit. Select one to learn about it or adopt it for fun.</p><h3>The roads are real. The adoption is pretend.</h3><p>Nicknames and adoption papers are extremely unofficial. Saved ramps stay in this browser, on this device. Some drawings show only part of a longer connection.</p><h3>About the data</h3><p>All 359 drawings come from NJDOT’s August 2025 road map. Traffic figures are daily averages from 2024. Toll information uses published 2026 schedules. These are dated snapshots, rather than live driving conditions.</p><p><a href="https://www.nj.gov/transportation/refdata/gis/data.shtm" target="_blank" rel="noopener">NJDOT road maps</a> · <a href="https://www.njta.gov/document/2026-parkway-cash-rates/" target="_blank" rel="noopener">NJTA toll schedules</a></p><p>This test keeps the map, shapes and rankings in three views. The <a href="https://parkway-unfolded-adoption.sanchezbr.chatgpt.site" target="_blank" rel="noopener">original version ↗</a> remains available too.</p></div>`;
document.body.append(about);
const theme=document.querySelector('.theme-control');if(theme)about.querySelector('.simple-dialog-body').append(theme);
const finder=document.createElement('dialog');finder.id='simpleFinder';finder.className='simple-dialog';finder.setAttribute('aria-labelledby','simpleFindTitle');
finder.innerHTML=`<header class="simple-dialog-head"><h2 id="simpleFindTitle">Find your exit</h2><button class="icon-button" data-simple-close="simpleFinder" aria-label="Close exit search">✕</button></header><div class="simple-dialog-body"><label class="simple-find-label" for="simpleSearch">Exit number, connecting road or county</label><input class="simple-find-input" id="simpleSearch" type="search" autocomplete="off" placeholder="Try 135, Route 37, or Ocean…" aria-controls="simpleFindList"><p class="simple-find-count" id="simpleFindCount" role="status"></p></div><div class="simple-find-list" id="simpleFindList"></div>`;
document.body.append(finder);
const footer=document.querySelector('.site-footer');
footer.innerHTML='<p>Real road shapes · NJDOT, August 2025</p><nav aria-label="Project information"><button class="text-button" id="simpleAboutButton">About &amp; sources</button><a href="https://parkway-unfolded-adoption.sanchezbr.chatgpt.site" target="_blank" rel="noopener">Original version ↗</a></nav>';

function simpleCellProjection(r,cell){
 const local=fit(sourceBounds(r),cell.w,cell.h,{left:23,right:23,top:21,bottom:43});
 const p=xy=>{const q=local(xy);return [q[0]+cell.x,q[1]+cell.y];};p.s=local.s;return p;
}
function simpleBlendedProjection(start,end,amount){
 const p=xy=>{const a=start(xy),b=end(xy);return [mix(a[0],b[0],amount),mix(a[1],b[1],amount)];};
 p.s=mix(start.s,end.s,amount);return p;
}
function sceneLayout(count,width){
 const small=width<600,cols=small?Math.min(2,count):count>6?4:Math.min(2,count),rows=Math.ceil(count/cols);
 const height=Math.max(small?350:360,rows*(small?150:160)+50),gap=small?12:18,pad=small?16:25,top=42;
 const cellW=(width-pad*2-gap*(cols-1))/cols,cellH=(height-top-18-gap*(rows-1))/rows;
 return {width,height,mapHeight:small?350:360,cells:Array.from({length:count},(_,i)=>({x:pad+(i%cols)*(cellW+gap),y:top+Math.floor(i/cols)*(cellH+gap),w:cellW,h:cellH}))};
}
function drawScene(){
 if(animation!==null){cancelAnimationFrame(animation);animation=null;progress=unfolded?1:0;}
 const svg=$('simpleMap'),g=DATA.groups[group],rs=g.fids.map(fid=>byFID.get(fid));
 const layout=sceneLayout(rs.length,Math.max(280,$('simpleCanvas').clientWidth));
 const map=fit(padBounds(g.bounds,.12,150),layout.width,layout.mapHeight,{left:36,right:36,top:47,bottom:25});
 svg.replaceChildren();svg.setAttribute('viewBox',`0 0 ${layout.width} ${layout.height}`);svg.setAttribute('aria-label',`${groupLabel(group)}, ${groupNames[group]}. The same real ramp shapes on and off the map.`);
 append(svg,'title',{},`Garden State Parkway ${groupLabel(group).toLowerCase()}`);
 append(svg,'desc',{},'Unfold this exit to separate the highlighted ramps from nearby roads. Every ramp keeps its original bends and north-up orientation.');
 const context=append(svg,'g',{class:'simple-context','aria-hidden':'true'});
 for(const l of g.context_lines)append(context,'path',{d:xyPath(l.xy,map),class:l.role==='mainline'?'simple-mainline':''});
 scene={svg,context,rs,map,layout,ramps:[]};
 rs.forEach((r,i)=>{
  const cell=layout.cells[i],end=simpleCellProjection(r,cell),node=append(svg,'g',{class:'simple-ramp','data-simple-fid':r.fid,'aria-label':`${movement(r)}, ${publicRoad(r.road)}`});
  const rect=append(node,'rect',{x:cell.x,y:cell.y,width:cell.w,height:cell.h,rx:12,class:'simple-ramp-cell'});
  const path=append(node,'path',{class:'simple-road','data-source-fid':Number(sourceFID(r)),'data-source-vertices':r.source_xy.length});
  const label=append(node,'text',{x:cell.x+cell.w/2,y:cell.y+cell.h-17,class:'simple-ramp-label'},movement(r));
  const number=append(node,'text',{x:cell.x+17,y:cell.y+22,class:'simple-ramp-number'},String(i+1));
  const choose=()=>{if(progress===1)selectRamp(r.fid);};
  node.addEventListener('click',choose);node.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();choose();}});
  scene.ramps.push({r,node,rect,path,label,number,end});
 });
 paintScene(progress);paintSceneCopy();
}
function paintScene(amount){
 if(!scene)return;
 scene.svg.setAttribute('viewBox',`0 0 ${scene.layout.width} ${mix(scene.layout.mapHeight,scene.layout.height,amount)}`);
 scene.context.style.opacity=String(1-amount);
 for(const entry of scene.ramps){
  const {r,node,rect,path,label,number,end}=entry;
  path.setAttribute('d',xyPath(r.source_xy,simpleBlendedProjection(scene.map,end,amount)));
  rect.style.opacity=String(amount);rect.style.pointerEvents=amount===1?'all':'none';
  label.style.opacity=String(amount);number.style.opacity=String(amount);
  node.setAttribute('tabindex',amount===1?'0':'-1');node.setAttribute('aria-hidden',String(amount!==1));
  if(amount===1){node.setAttribute('role','button');node.setAttribute('aria-pressed',String(selected===r.fid));}else{node.removeAttribute('role');node.removeAttribute('aria-pressed');}
 }
}
function paintSceneCopy(){
 $('simpleExitHeading').textContent=groupLabel(group);$('simpleExitRoad').textContent=groupNames[group];$('simpleCounty').textContent=groupCounties(group).map(name=>`${name} County`).join(' / ');
 $('simpleIntroCopy').textContent=unfolded?'The same ramps, pulled apart. Their bends stay the same. Pick a shape to take a closer look.':'These are real Garden State Parkway ramps, lifted off the map so you can see their shapes.';
 $('simplePhase').textContent=unfolded?'The same roads, unfolded':'On the map';
 $('simpleUnfold').textContent=unfolded?'Back on the map ↙':'Unfold this exit ↗';$('simpleUnfold').disabled=false;$('simpleUnfold').setAttribute('aria-expanded',String(unfolded));
 $('simpleMap').removeAttribute('aria-busy');
 $('simpleSceneHint').textContent=unfolded?'Same roads. Same bends. Pick a shape to meet it.':'The highlighted lines are the ramps.';
 $('simpleScaleNote').textContent=unfolded?'North up · enlarged to fit':'North stays up.';
 $('simpleNextHint').textContent=unfolded?'Pick a shape to take a closer look.':'Unfold this exit to see its ramps separately.';
 $('simpleNext').hidden=!hasUnfolded;$('simpleDiscover').hidden=!hasUnfolded;
}
function animateUnfold(target){
 if(animation!==null)return;
 unfolded=target;if(target)hasUnfolded=true;
 selected=null;$('simpleSelected').hidden=true;
 const from=progress,to=target?1:0,start=performance.now(),duration=reduced.matches?0:1100;
 $('simpleUnfold').disabled=true;$('simpleUnfold').textContent=target?'Unfolding…':'Back to the map…';$('simpleMap').setAttribute('aria-busy','true');
 function tick(now){
  const t=duration?Math.min(1,(now-start)/duration):1,eased=t*t*(3-2*t);
  progress=mix(from,to,eased);paintScene(progress);
  if(t<1)animation=requestAnimationFrame(tick);else{animation=null;progress=to;paintScene(progress);paintSceneCopy();syncHash();$('simpleAnnouncement').textContent=target?`${scene.rs.length} real ramp shapes, unfolded. Choose one to take a closer look.`:'The ramps are back in their real locations.';}
 }
 if(duration)animation=requestAnimationFrame(tick);else tick(start);
}
function showGroup(id,{focus=false,select=null}={}){
 if(!DATA.groups[id])return;
 if(animation!==null){cancelAnimationFrame(animation);animation=null;}
 group=id;unfolded=false;progress=0;selected=null;state.group=id;state.selected=null;state.workspace='explore';
 setSimpleNavigation('explore');experience.hidden=false;for(const id of ['overview','atlas','superlatives','adoptionFamily','compareDialog'])$(id).hidden=true;
 $('simpleSelected').hidden=true;$('simpleAnnouncement').textContent='';drawScene();
 if(select&&byFID.get(select)?.group===id){unfolded=true;hasUnfolded=true;progress=1;paintScene(1);paintSceneCopy();selectRamp(select,{focus:false});}
 syncHash();
 if(focus){$('simpleExitHeading').tabIndex=-1;$('simpleExitHeading').focus({preventScroll:true});experience.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'});}
}
function selectRamp(fid,{focus=true}={}){
 const r=byFID.get(fid);if(!r)return;selected=fid;state.selected=fid;
 for(const entry of scene.ramps)entry.node.setAttribute('aria-pressed',String(entry.r.fid===fid));
 const selectedHost=$('simpleSelected'),plaza=window.GSPTolls?.lookup(fid),note=[branchScope(r),warningFor(r)].filter(Boolean).join(' ');
 selectedHost.innerHTML=`<div class="simple-selected-top"><div><span class="adoption-eyebrow">A closer look · Exit ${esc(r.number)}</span><h3 id="simpleSelectedTitle">${esc(publicRoad(r.road))}</h3><p class="simple-ramp-meta">${esc(movement(r))} · ${esc(groupCounties(r.group).join(' / '))}</p></div><button class="adoption-button" data-adoption-visit="${Number(fid)}">Adopt this ramp ♡</button></div><details class="simple-road-info"><summary>More about this road</summary><p>${fmt(r.length_ft)} feet of road. ${esc(note||'This line follows the original road map.')}</p><div class="traffic-detail">${trafficDetailHTML(r)}</div><p>${plaza?`A toll is listed for this connection at ${esc(plaza.name)}.`:'No ramp toll is listed for this drawing. Other tolls may apply along your journey.'}</p><div class="simple-road-actions">${plaza?'<button class="text-button" id="simpleToll">View 2026 toll information ↗</button>':''}<button class="text-button" id="simpleCompare">Compare with another ramp →</button></div></details>`;
 selectedHost.hidden=false;syncHash();
 $('simpleToll')?.addEventListener('click',()=>window.GSPTolls.openPlaza(plaza.id));
 $('simpleCompare').addEventListener('click',()=>{state.compare=[fid,null];updateComparisonUI();switchWorkspace('compare',{scroll:true});});
 if(focus){$('simpleSelectedTitle').tabIndex=-1;$('simpleSelectedTitle').focus({preventScroll:true});selectedHost.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'nearest'});}
}
function syncHash(){
 if(['overview','atlas','superlatives'].includes(state.workspace)){const query=new URLSearchParams(location.hash.slice(1));for(const key of ['exit','view','ramp'])query.delete(key);query.set('workspace',state.workspace);if(state.section)query.set('area',state.section);else query.delete('area');history.replaceState(null,'','#'+query.toString());return;}
 const query=new URLSearchParams({exit:group,view:unfolded?'unfolded':'map'});
 if(selected)query.set('ramp',String(selected));
 history.replaceState(null,'','#'+query.toString());
}
function refreshFamilyLink(){
 const count=Number($('adoptionNavCount').textContent)||0;
 $('simpleFamily').hidden=count===0;$('simpleFamily').textContent=`My ramps${count?' · '+count:''}`;
}
function openSimpleDialog(dialog){
 activeDialogFocus=document.activeElement;dialog.showModal();document.body.classList.add('modal-open');
}
function closeSimpleDialog(dialog){
 dialog.close();if(!document.querySelector('dialog[open]'))document.body.classList.remove('modal-open');
 if(activeDialogFocus?.isConnected)activeDialogFocus.focus({preventScroll:true});
}
function renderFind(){
 const q=$('simpleSearch').value.trim().toLowerCase();
 const matches=groupOrder.filter(id=>`${id} ${groupNames[id]} ${groupCounties(id).join(' ')}`.toLowerCase().includes(q));
 $('simpleFindCount').textContent=q?`${matches.length} ${matches.length===1?'exit area':'exit areas'} found`:'All Parkway exits, north to south.';
 $('simpleFindList').innerHTML=matches.length?matches.map(id=>`<button class="simple-find-row" data-simple-group="${esc(id)}"><strong>${esc(id)}</strong><span>${esc(groupNames[id])}<small>${esc(groupCounties(id).join(' / '))}${groupCounties(id).length>1?' counties':' County'}</small></span></button>`).join(''):'<p class="simple-find-empty">No exits found. Try another number, road or county.</p>';
}
function openFinder(){renderFind();openSimpleDialog(finder);$('simpleSearch').focus();}
function pickHTML(id){
  const rs=DATA.groups[id].fids.map(fid=>byFID.get(fid)),r=rs.find(item=>item.fid===5687)||rs.find(item=>item.kind==='Exit')||rs[0];
  const p=fit(sourceBounds(r),240,110,14);
  return `<button class="simple-pick" data-simple-group="${esc(id)}"><svg viewBox="0 0 240 110" aria-hidden="true"><path d="${xyPath(r.source_xy,p)}"/></svg><strong>Exit ${esc(id)}</strong><span>${esc(groupNames[id])}</span></button>`;
}
function renderPicks(){
 $('simplePicks').innerHTML=picks.map(pickHTML).join('');
 $('simpleTeasers').innerHTML=picks.slice(0,3).map(pickHTML).join('');
}
switchWorkspace=function(view,options={}){
 if(['overview','atlas','superlatives','family','compare'].includes(view)){
  if(view==='compare')comparisonOrigin=state.workspace==='atlas'?'atlas':'explore';
  if(animation!==null){cancelAnimationFrame(animation);animation=null;progress=unfolded?1:0;}
  setSimpleNavigation(view);experience.hidden=true;
  if(view==='atlas'){if(!galleryOpened){state.collection='featured';galleryOpened=true;}state.morph=1;}
  priorSwitch(view,{scroll:false});syncHash();
  if(options.scroll)(['family','compare'].includes(view)?$(view==='family'?'adoptionFamily':'compareDialog'):$('simpleLanding')).scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'});
 }else if(view==='explore')showGroup(state.group,{focus:!!options.scroll,select:state.selected});
 else showGroup(group,{focus:!!options.scroll});
};
$('simpleUnfold').addEventListener('click',()=>animateUnfold(!unfolded));
$('simpleAnother').addEventListener('click',()=>{const available=picks.filter(id=>id!==group);showGroup(available[Math.floor(Math.random()*available.length)],{focus:true});});
$('closeComparison').addEventListener('click',event=>{event.stopImmediatePropagation();switchWorkspace(comparisonOrigin,{scroll:true});if(comparisonOrigin==='explore')$('simpleUnfold').focus({preventScroll:true});},true);
$('simpleFind').addEventListener('click',openFinder);$('simpleBrowseAll').addEventListener('click',openFinder);
$('simpleFamily').addEventListener('click',()=>switchWorkspace('family',{scroll:true}));
$('simpleBack').addEventListener('click',()=>{if(document.body.dataset.simpleView==='compare'&&comparisonOrigin==='atlas'){switchWorkspace('atlas',{scroll:true});return;}if(document.body.dataset.simpleView==='explore'){switchWorkspace('overview',{scroll:true});return;}state.workspace='explore';state.group=group;state.selected=selected;setSimpleNavigation('explore');experience.hidden=false;for(const id of ['overview','atlas','superlatives','adoptionFamily','compareDialog'])$(id).hidden=true;drawScene();syncHash();experience.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'});});
$('simpleStart').addEventListener('click',()=>showGroup(demoGroup,{focus:true}));
landing.querySelector('.simple-view-nav').addEventListener('click',event=>{const button=event.target.closest('[data-simple-workspace]');if(button)switchWorkspace(button.dataset.simpleWorkspace,{scroll:true});});
const priorSection=setSharedSection;setSharedSection=function(id){priorSection(id);syncHash();};
$('simpleAboutButton').addEventListener('click',()=>openSimpleDialog(about));
$('simpleSearch').addEventListener('input',renderFind);
$('simpleSearch').addEventListener('keydown',event=>{if(event.key==='Enter'){const rows=$('simpleFindList').querySelectorAll('[data-simple-group]');if(rows.length===1){event.preventDefault();rows[0].click();}}});
for(const dialog of [about,finder]){
 dialog.addEventListener('cancel',event=>{event.preventDefault();closeSimpleDialog(dialog);});
 dialog.querySelector('[data-simple-close]').addEventListener('click',()=>closeSimpleDialog(dialog));
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeSimpleDialog(dialog);});
}
for(const host of [$('simplePicks'),$('simpleTeasers'),$('simpleFindList')])host.addEventListener('click',event=>{const b=event.target.closest('[data-simple-group]');if(!b)return;if(finder.open)closeSimpleDialog(finder);showGroup(b.dataset.simpleGroup,{focus:true});});
new MutationObserver(refreshFamilyLink).observe($('adoptionNavCount'),{childList:true,subtree:true,characterData:true});
let resizeFrame=null,lastCanvasWidth=$('simpleCanvas').clientWidth;new ResizeObserver(entries=>{const width=entries[0].contentRect.width;if(Math.abs(width-lastCanvasWidth)<.5)return;lastCanvasWidth=width;if(resizeFrame!==null)cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{resizeFrame=null;if(document.body.dataset.simpleView==='explore')drawScene();});}).observe($('simpleCanvas'));
refreshFamilyLink();renderPicks();
const firstGroup=DATA.groups[openingQuery.get('exit')]?openingQuery.get('exit'):demoGroup;
if(openingQuery.has('exit'))showGroup(firstGroup);else switchWorkspace(['atlas','superlatives'].includes(openingQuery.get('workspace'))?openingQuery.get('workspace'):'overview');
if(openingQuery.has('exit')&&openingQuery.get('view')==='unfolded'){unfolded=true;hasUnfolded=true;progress=1;paintScene(1);paintSceneCopy();const firstRamp=Number(openingQuery.get('ramp'));if(byFID.get(firstRamp)?.group===firstGroup)selectRamp(firstRamp,{focus:false});syncHash();}
})();
