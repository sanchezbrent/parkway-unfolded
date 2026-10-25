(function(atlasState,ATLAS,changeArea,countyLookup){
'use strict';
const DATA=JSON.parse(document.getElementById('superlatives-data').textContent);
const $=id=>document.getElementById('sup-'+id);
const recById=new Map(DATA.records.map(r=>[String(r.fid),r]));
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=(v,d=0)=>Number(v).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const ICON_PATHS={
 long:'<path d="M5 24V8m22 16V8M6 16h20m-16-4-4 4 4 4m12-8 4 4-4 4"/>',
 short:'<path d="M9 25V7m14 18V7M4 16h7m-3-3 3 3-3 3m20-3h-7m3-3-3 3 3 3"/>',
 turn:'<path d="M7 27V16a9 9 0 0 1 18 0v5m-4-4 4 4 4-4"/>',
 wave:'<path d="M3 23c4 0 3-14 7-14s3 14 7 14S20 9 24 9s3 14 5 14"/>',
 bend:'<path d="M5 27V15a11 11 0 0 1 22 0v12M12 27V15a4 4 0 0 1 8 0v12"/>',
 loop:'<path d="M9 27c-8-9-5-22 7-22 14 0 15 16 6 18-9 2-10-9-5-10 5-1 7 9-3 14"/><path d="M10 27h4v-4"/>',
 wide:'<path d="M5 7v18m22-18v18M6 16h20m-16-4-4 4 4 4m12-8 4 4-4 4"/>',
 tall:'<path d="M7 5h18M7 27h18M16 6v20m-4-16 4-4 4 4m-8 12 4 4 4-4"/>',
 area:'<path d="M6 6h20v20H6zM11 6v20m5-20v20m5-20v20M6 11h20M6 16h20M6 21h20"/>',
 straight:'<path d="M8 27 24 5m-7 1 7-1 1 7M5 27h4"/>',
 branch:'<path d="M16 28V17M5 5v5c0 6 11 2 11 9m11-14v5c0 6-11 2-11 9M16 4v13"/><circle cx="5" cy="4" r="2"/><circle cx="27" cy="4" r="2"/>',
 traffic:'<path d="m6 14 3-7h14l3 7v11H6zM6 14h20M10 25v3m12-3v3"/><path d="M10 19h2m8 0h2M4 8 2 5m26 3 2-3"/>',
 list:'<path d="M10 7h17M10 16h17M10 25h17M4 7h1M4 16h1M4 25h1"/>',
 gallery:'<path d="M4 4h9v9H4zm15 0h9v9h-9zM4 19h9v9H4zm15 0h9v9h-9z"/>',
 moon:'<path d="M27 19A12 12 0 0 1 13 4a12 12 0 1 0 14 15Z"/>',
 toll:'<path d="M3 6h26v7H3zM7 13v15m18-15v15M13 28v-8m6 8v-8"/>',
 sun:'<circle cx="16" cy="16" r="6"/><path d="M16 2v3m0 22v3M2 16h3m22 0h3M6 6l2 2m16 16 2 2M6 26l2-2M24 8l2-2"/>'
};
function icon(name){return `<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]||ICON_PATHS.long}</svg>`;}
const initial=new URLSearchParams(location.hash.slice(1));
const state={category:DATA.categories.some(c=>c.id===initial.get('category'))?initial.get('category'):'longest',county:initial.get('county')||'all',kind:initial.get('kind')||'all',view:initial.get('view')==='list'?'list':'gallery',scale:initial.get('scale')==='same'?'same':'fit',selected:initial.get('selected'),theme:'light'};
let currentPool=[],currentTop=[],family='shapes';
const getCategory=()=>DATA.categories.find(c=>c.id===state.category);
function comparisonValue(item,c=getCategory()){return c.id==='straightest'?(item.value-1)*100:item.value;}
function pretty(v,c=getCategory(),parts=false){
 let n,u;
 switch(c.unit){
  case 'usd':n='$'+number(v,2);u='USD';break;
  case 'ft':n=number(v);u='ft';break;
  case 'radius':n='≈ '+number(v);u='ft radius';break;
  case 'deg':n=number(v,1);u='°';break;
  case 'density':n=number(v,1);u='° / 100 ft';break;
  case 'ratio':n=number(v,2);u='× the direct distance';break;
  case 'preciseRatio':n=number((v-1)*100,3);u='% extra distance';break;
  case 'acres':n=number(v,1);u='acres';break;
  case 'paths':n=number(v);u=v===1?'drawing':'drawings';break;
  case 'aadt':n=number(v);u='vehicles a day';break;
 }
 return parts?`${esc(n)}<span class="unit">${esc(u)}</span>`:`${n} ${u}`;
}
function compact(v,c=getCategory()){
 if(c.id==='straightest')return `${number((v-1)*100,3)}%`;
 return pretty(v,c).replace(' vehicles a day',' a day');
}
function setTheme(theme){
 state.theme=theme;$('themeBtn').innerHTML=icon(theme==='dark'?'sun':'moon');
 $('themeBtn').setAttribute('aria-label',`Switch to ${theme==='dark'?'light':'dark'} theme`);
 document.body.dataset.theme=theme;
 const c=getCategory();document.getElementById('superlatives').style.setProperty('--accent',theme==='dark'?c.night:c.color);document.getElementById('superlatives').style.setProperty('--soft',theme==='dark'?'#283e41':c.soft);
 try{localStorage.setItem('gsp-superlatives-theme',theme);}catch{}
 if(currentTop.length){renderHero(false);renderRankings();}
}
function syncHash(){
 const p=new URLSearchParams();p.set('category',state.category);
 for(const k of ['county','kind'])if(state[k]!=='all')p.set(k,state[k]);
 if(state.view!=='gallery')p.set('view',state.view);if(state.scale!=='fit')p.set('scale',state.scale);
 if(state.selected&&currentTop[0]&&state.selected!==currentTop[0].id)p.set('selected',state.selected);
 try{history.replaceState(null,'','#'+p.toString());}catch{}
}
function makePool(c=getCategory()){
 const filtered=DATA.records.filter(r=>(state.county==='all'||r.counties.includes(state.county))&&(state.kind==='all'||r.kind===state.kind));
 let items=[];
 if(c.grain==='group'){
  const groups=new Map();for(const r of filtered){if(!groups.has(r.group))groups.set(r.group,[]);groups.get(r.group).push(r);}
  items=[...groups].map(([g,rs])=>({id:'g'+g,number:g,group:g,road:DATA.group_names[g]||'Exit area',counties:rs[0].counties,movement:`${rs.length} selected ${rs.length===1?'path':'paths'}`,records:rs,value:rs.length}));
 }else{
  items=filtered.filter(r=>Number.isFinite(r.metrics[c.metric])&&(!c.minLength||r.metrics.length_ft>=c.minLength)).map(r=>({id:String(r.fid),number:r.number,group:r.group,road:publicRoad(r.road),counties:r.counties,movement:`${r.direction} ${r.kind.toLowerCase()}`,records:[r],value:r.metrics[c.metric]}));
 }
 items.sort((a,b)=>(c.ascending?a.value-b.value:b.value-a.value)||(parseFloat(b.number)-parseFloat(a.number))||a.number.localeCompare(b.number)||a.id.localeCompare(b.id,undefined,{numeric:true}));
 let prev=null,rank=0;
 items.forEach((r,i)=>{if(prev===null||Math.abs(r.value-prev)>1e-10)rank=i+1;r.rank=rank;prev=r.value;});
 return items;
}
function boundsOf(item,withBox=false){
 const points=item.records.flatMap(r=>withBox?[...r.source_xy,...r.footprint_box]:r.source_xy);
 return points.reduce((b,p)=>[Math.min(b[0],p[0]),Math.min(b[1],p[1]),Math.max(b[2],p[0]),Math.max(b[3],p[1])],[Infinity,Infinity,-Infinity,-Infinity]);
}
function fitProjection(bounds,w,h,pad,forcedScale){
 const bw=Math.max(1e-9,bounds[2]-bounds[0]),bh=Math.max(1e-9,bounds[3]-bounds[1]);
 const scale=forcedScale||Math.min((w-2*pad)/bw,(h-2*pad)/bh);
 return {scale,project:p=>[w/2+(p[0]-(bounds[0]+bounds[2])/2)*scale,h/2-(p[1]-(bounds[1]+bounds[3])/2)*scale]};
}
function pathD(xy,project,close=false){return xy.map((p,i)=>{const q=project(p);return `${i?'L':'M'}${q[0].toFixed(6)},${q[1].toFixed(6)}`;}).join(' ')+(close?' Z':'');}
function shapeSVG(item,w,h,{hero=false,forcedScale=null,animate=false,exportMode=false}={}){
 if(item.plaza)return plazaSVG(item,w,h,exportMode);
 const c=getCategory(),box=hero&&['broadest','tallest','area'].includes(c.id);
 const b=boundsOf(item,box),pad=hero?49:14,{scale,project}=fitProjection(b,w,h,pad,forcedScale);
 const accent=exportMode?c.color:(state.theme==='dark'?c.night:c.color),muted=exportMode?'#52666b':(state.theme==='dark'?'#b1c4bf':'#536b64');
 let content='';
 if(box)content+=`<path d="${pathD(item.records[0].footprint_box,project,true)}" fill="none" stroke="${muted}" stroke-width="1.2" stroke-dasharray="5 5"/>`;
 if(hero&&['indirect','straightest'].includes(c.id)){
  const xy=item.records[0].source_xy;content+=`<path d="${pathD([xy[0],xy[xy.length-1]],project)}" fill="none" stroke="${muted}" stroke-width="1.5" stroke-dasharray="5 5"/>`;
 }
 content+=item.records.map(r=>`<path class="trace${animate?' playing':''}" pathLength="1" d="${pathD(r.source_xy,project)}" fill="none" stroke="${accent}" stroke-linecap="round" stroke-linejoin="round" stroke-width="${hero?(item.records.length>1?3.5:5):2.6}" vector-effect="non-scaling-stroke"/>`).join('');
 if(hero&&item.records.length===1){const xy=item.records[0].source_xy;for(const p of [xy[0],xy[xy.length-1]]){const q=project(p);content+=`<circle cx="${q[0]}" cy="${q[1]}" r="4" fill="${exportMode?'white':'var(--stage)'}" stroke="${accent}" stroke-width="1.8"/>`;}}
 if(hero){
  const maxFt=78/scale,ten=10**Math.floor(Math.log10(maxFt)),unit=[1,2,5,10].map(x=>x*ten).filter(x=>x<=maxFt).pop()||ten/2;
  const px=unit*scale;
  content+=`<g stroke="${muted}" fill="${muted}" font-family="Arial,Helvetica,sans-serif" font-size="14"><path d="M${w-28} 47V22m-4 7 4-7 4 7" fill="none" stroke-width="1.2"/><text x="${w-28}" y="16" text-anchor="middle" stroke="none">N</text><path d="M22 ${h-24}v5h${px}v-5" fill="none" stroke-width="1.3"/><text x="22" y="${h-7}" stroke="none">${number(unit)} ft</text></g>`;
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(`Exit ${item.number}: ${item.road}. Original ${item.records.length===1?'road drawing':'road drawings'}, north up.`)}"><title>${esc(`Exit ${item.number} · ${item.road}`)}</title>${content}</svg>`;
}
function histogram(item){
 const c=getCategory(),population=c.id==='straightest'?currentTop:currentPool;
 const vals=population.map(x=>comparisonValue(x,c)),max=Math.max(...vals,1e-9),bins=Math.min(26,Math.max(10,population.length)),counts=Array(bins).fill(0);
 vals.forEach(v=>counts[Math.min(bins-1,Math.floor(v/max*bins))]++);
 const high=Math.max(...counts,1),w=340,plotW=326,step=plotW/bins,accent=state.theme==='dark'?c.night:c.color;
 const bars=counts.map((n,i)=>`<rect x="${7+i*step}" y="${47-n/high*38}" width="${Math.max(1,step-1)}" height="${n/high*38}" fill="${accent}" opacity=".38"/>`).join('');
 const x=7+comparisonValue(item,c)/max*plotW;
 const endLabel=c.unit==='usd'?'$'+number(max,2):c.id==='straightest'?number(max,3)+'%':(c.unit==='ratio'?number(max,1)+'×':c.unit==='acres'?number(max,1):number(max));
 $('distributionTitle').textContent=c.id==='straightest'?`Extra distance among these ${population.length} drawings (%)`:`Across ${number(population.length)} eligible ${c.grain==='group'?'exit areas':'drawings'}`;
 $('distributionChart').innerHTML=`<svg viewBox="0 0 ${w} 75" role="img" aria-label="${esc(`Distribution of ${population.length} drawings compared. The selected value is ${compact(item.value,c)}. Domain begins at zero and ends at ${endLabel}.`)}"><path d="M7 49H333" stroke="var(--line)"/>${bars}<path d="M${x} 3V52" stroke="${accent}" stroke-width="2.3"/><circle cx="${x}" cy="3" r="3" fill="${accent}"/><g fill="var(--muted)" font-family="Arial,Helvetica,sans-serif" font-size="14"><text x="7" y="70">${c.unit==='usd'?'$0':'0'}${c.id==='straightest'?'%':''}</text><text x="333" y="70" text-anchor="end">${esc(endLabel)}</text></g></svg>`;
}
function renderHero(animate=false){
 const c=getCategory(),item=currentTop.find(x=>x.id===state.selected)||currentTop[0];if(!item)return;state.selected=item.id;
 $('selectedRank').textContent=`Rank ${item.rank} · ${c.grain==='group'?'Exit area':'Ramp drawing'}`;
 $('heroShape').innerHTML=shapeSVG(item,Math.max(220,$('heroShape').clientWidth||520),window.innerWidth<=680?270:328,{hero:true,animate});
 $('winnerMeta').textContent=`${item.movement} · ${item.counties.join(' / ')} ${item.counties.length>1?'counties':'County'}`;
 $('winnerTitle').textContent=`Exit ${item.number}`;$('winnerRoad').textContent=item.road;
 $('winnerValue').innerHTML=pretty(item.value,c,true);
 const labels={length_ft:'Distance along the road',total_turn_deg:'Total bending along the road',turn_per_100ft:'Bending per 100 feet of road',min_radius_100ft:'Estimated size of the curve',path_to_chord_ratio:'Road length compared with a straight line',footprint_width_ft:'Width across the shape',footprint_height_ft:'Long side of the surrounding box',footprint_acres:'Area of the surrounding box',path_count:'Ramp drawings at this interchange',aadt:'Average vehicles per day · 2024'};
 $('valueLabel').textContent=labels[c.metric];
 let secondary='';
 if(c.id==='longest'||c.id==='shortest')secondary=`${number(item.value/5280,3)} miles along the road drawing.`;
 else if(c.id==='turning')secondary=`${number(item.value/360,2)} full rotations’ worth of heading change.`;
 else if(c.id==='straightest')secondary=`${number((item.value-1)*100,3)}% extra distance compared with a straight line.`;
 else if(c.id==='indirect')secondary=`Endpoints ${number(item.records[0].endpoint_chord_ft)} ft apart; path ${number(item.records[0].metrics.length_ft)} ft long.`;
 else if(c.family==='traffic')secondary='A daily average for 2024. Some drawings share the same road count.';
 else if(c.id==='branches')secondary='The drawing brings together the connections included in your filters.';
 else if(c.id==='area')secondary=`${number(item.records[0].metrics.footprint_width_ft)} × ${number(item.records[0].metrics.footprint_height_ft)} ft box.`;
 else if(c.id==='bend')secondary='A smaller estimate means a tighter bend.';
 else secondary=`Ramp drawing length: ${number(item.records[0].metrics.length_ft)} ft.`;
 $('winnerSecondary').textContent=secondary;
 $('stageCaption').textContent=`${item.records.length>1?item.records.length+' original paths':'Road shape'} · north up`;
 histogram(item);
}
function renderRankings(){
 const c=getCategory(),isGallery=state.view==='gallery',w=isGallery?190:100,h=isGallery?160:84;
 let common=null;
 if(state.scale==='same')common=Math.min(...currentTop.map(r=>{const b=boundsOf(r);return Math.min((w-28)/Math.max(1e-9,b[2]-b[0]),(h-28)/Math.max(1e-9,b[3]-b[1]));}));
 const maxBar=Math.max(...currentTop.map(r=>comparisonValue(r,c)),1e-9);
 $('rankings').className=isGallery?'rank-gallery':'rank-list';$('listHeader').hidden=isGallery;
 $('listView').setAttribute('aria-pressed',String(!isGallery));$('galleryView').setAttribute('aria-pressed',String(isGallery));
 $('barLabel').textContent=c.id==='straightest'?'Extra distance (%)':(c.id==='traffic'?'2024 vehicles/day':c.unit==='radius'?'Approx. radius (ft)':c.unit==='acres'?'Box area (acres)':c.unit==='density'?'Degrees / 100 ft':c.unit==='ratio'?'Path / chord':c.unit==='paths'?'Ramp drawings':c.unit==='deg'?'Total degrees':'Feet');
 $('rankings').innerHTML=currentTop.map(r=>{
  const value=c.id==='straightest'?`${number((r.value-1)*100,3)}<span class="row-unit">%</span>`:esc(compact(r.value,c));
  const shape=`<span class="row-shape">${shapeSVG(r,w,h,{forcedScale:common})}</span>`;
  const info=`<span class="row-info"><span class="row-number">${esc(r.number)}</span><span class="row-road">${esc(r.road)}</span><span class="row-meta">${esc(r.movement)}<br>${esc(r.counties.join(' / '))}</span></span>`;
  const metric=`<span class="row-metric"><span class="row-value">${value}</span>${!isGallery?`<span class="bar-track"><span class="bar-fill" style="display:block;width:${comparisonValue(r,c)/maxBar*100}%"></span></span>`:''}</span>`;
  return `<button class="${isGallery?'gallery-item':'rank-row'}" data-id="${esc(r.id)}" aria-pressed="${state.selected===r.id}" aria-label="${esc(`Rank ${r.rank}. Exit ${r.number}, ${r.movement}, ${r.road}, ${pretty(r.value,c)}. Inspect this result.`)}"><span class="rank-number">${r.rank}</span>${shape}${info}${metric}</button>`;
 }).join('');
 $('rankings').querySelectorAll('[data-id]').forEach(b=>b.addEventListener('click',()=>{
  state.selected=b.dataset.id;renderHero(true);renderRankings();syncHash();
  const row=$('rankings').querySelector(`[data-id="${state.selected}"]`);row?.focus({preventScroll:true});
  if(document.querySelector('#superlatives .spotlight').getBoundingClientRect().bottom<80)document.querySelector('#superlatives .spotlight').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  $('announcer').textContent=`Selected rank ${currentTop.find(x=>x.id===state.selected).rank}. Drawing updated.`;
 }));
 $('topCount').textContent=`${currentTop.length} results`;
 $('rankingFootnote').textContent=`${state.scale==='same'?'All drawings use the same scale, so their sizes can be compared.':'Drawings are fitted individually; compare values or choose Same scale to compare size.'} ${isGallery?'':'Bars start at zero. '}Equal values share a rank; ties use north-to-south interchange order, then selection ID. Ten results are shown even when a tie crosses the cutoff.`;
}
function render(resetSelection=false){
 const c=getCategory();
 document.getElementById('superlatives').style.setProperty('--accent',state.theme==='dark'?c.night:c.color);document.getElementById('superlatives').style.setProperty('--soft',state.theme==='dark'?'#283e41':c.soft);
 $('categoryTitle').textContent=c.title;$('categoryIntro').textContent=c.intro;$('categoryIcon').innerHTML=icon(c.icon);$('categoryNote').textContent=c.note;
 document.querySelectorAll('#superlatives .category-button').forEach(b=>b.setAttribute('aria-current',String(b.dataset.category===c.id)));
 currentPool=makePool(c);currentTop=currentPool.slice(0,10);
 if(resetSelection||!currentTop.some(x=>x.id===state.selected))state.selected=currentTop[0]?.id||null;
 const n=currentPool.length,grain=c.grain==='group'?'exit areas':'drawings',scope=[state.county==='all'?'All counties':state.county,state.kind==='all'?'entrances and exits':state.kind.toLowerCase()+'s'].join(' · ');
 $('scopeText').textContent=`${number(n)} ${grain} · ${scope}`;
 $('rankingDirection').textContent=c.ascending?'Lowest first':'Highest first';
 $('countyFilter').value=state.county;$('kindFilter').value=state.kind;$('scaleSelect').value=state.scale;$('resetFilters').hidden=state.county==='all'&&state.kind==='all';
 $('emptyState').hidden=!!n;$('resultsBody').hidden=!n;
 if(n){renderHero(false);renderRankings();}syncHash();
 $('announcer').textContent=`${c.title}. ${n} ${grain}. ${currentTop.length} results shown.`;
}
function save(name,contents,type){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([contents],{type}));a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
function csvCell(s){return '"'+String(s??'').replace(/"/g,'""')+'"';}
function exportCSV(){
 const c=getCategory(),unitNames={ft:'ft',radius:'ft',deg:'degrees',density:'degrees / 100 ft',ratio:'ratio',preciseRatio:'ratio',acres:'acres',paths:'road drawings',aadt:'vehicles/day'},rows=[['category','rank','interchange','selection_id','movement','road','counties','metric','value','unit','eligible_count','county_filter','movement_filter','geometry_snapshot','traffic_year']];
 currentTop.forEach(r=>rows.push([c.title,r.rank,r.number,r.id,r.movement,r.road,r.counties.join(' / '),c.metric,r.value,unitNames[c.unit],currentPool.length,state.county,state.kind,DATA.geometry_snapshot,c.id==='traffic'?2024:'']));
 save(`GSP_Top_10_${c.id}_${state.county.replace(/\s/g,'_')}.csv`,rows.map(r=>r.map(csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8');
}
function sourceDetailsPath(){
 const c=getCategory(),item=currentTop.find(x=>x.id===state.selected);if(!item)return;
 $('detailTitle').textContent=`Exit ${item.number}`;
 $('detailContent').innerHTML=`<p>${esc(item.road)} · ${esc(item.movement)}</p><dl><dt>County</dt><dd>${esc(item.counties.join(' / '))}</dd><dt>Category</dt><dd>${esc(c.title)}</dd><dt>Rank</dt><dd>${item.rank} of ${currentPool.length} drawings compared</dd><dt>Value</dt><dd>${esc(pretty(item.value,c))}</dd></dl><p>${esc(c.definition)}</p><p>${esc(c.note)}</p>`;
 $('detailDialog').showModal();
}

$('categories').innerHTML=DATA.categories.map(c=>`<button class="category-button" data-category="${c.id}" style="--category-light:${c.color};--category-day-soft:${c.soft};--category-night:${c.night}" aria-current="false"><span class="category-symbol">${icon(c.icon)}</span><span>${esc(c.short)}</span></button>`).join('');
$('categories').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{state.category=b.dataset.category;render(true);}));
const counties=[...new Set(DATA.records.flatMap(r=>r.counties))].sort();
$('countyFilter').innerHTML+=counties.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
if(state.county!=='all'&&!counties.includes(state.county))state.county='all';
if(!['all','Exit','Entrance'].includes(state.kind))state.kind='all';
$('countyFilter').addEventListener('change',e=>{state.county=e.target.value;render(true);});
$('kindFilter').addEventListener('change',e=>{state.kind=e.target.value;render(true);});
function resetFilters(){state.county='all';state.kind='all';render(true);}
$('resetFilters').addEventListener('click',resetFilters);$('emptyReset').addEventListener('click',resetFilters);
$('listView').innerHTML=icon('list');$('listView').setAttribute('aria-label','Show ranked list');
$('galleryView').innerHTML=icon('gallery');$('galleryView').setAttribute('aria-label','Show shape gallery');
for(const [id,view] of [['listView','list'],['galleryView','gallery']])$(id).addEventListener('click',()=>{state.view=view;renderRankings();syncHash();});
$('scaleSelect').addEventListener('change',e=>{state.scale=e.target.value;renderRankings();syncHash();});

$('replayBtn').addEventListener('click',()=>renderHero(true));
$('csvBtn').addEventListener('click',exportCSV);
$('svgBtn').addEventListener('click',()=>{const item=currentTop.find(x=>x.id===state.selected),c=getCategory();if(!item)return;const svg=shapeSVG(item,1000,760,{hero:true,exportMode:true}).replace('<title>',`<metadata>${esc(JSON.stringify({category:c.title,value:item.value,unit:c.unit,selection_ids:item.records.map(r=>r.fid),geometry_snapshot:DATA.geometry_snapshot,method:item.plaza?'Original corridor centerlines; approximate tariff reference marker; north up.':'Original vertices, translation and uniform scaling only; north up.'}))}</metadata><title>`);save(`GSP_${c.id}_${item.number}_${item.id}.svg`,svg,'image/svg+xml;charset=utf-8');});
$('detailBtn').addEventListener('click',sourceDetails);$('methodBtn').addEventListener('click',methods);
document.querySelectorAll('[data-super-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.superClose).close()));
for(const id of ['detailDialog','methodDialog'])$(id).addEventListener('click',e=>{const d=$(id),r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))d.close();});

function setTheme(){state.theme=document.body.classList.contains('night')?'dark':'light';}
function syncHash(){
 const p=new URLSearchParams(location.hash.slice(1));p.set('workspace',atlasState.workspace);p.set('category',state.category);
 for(const k of ['county','kind','view','scale']){const def=['county','kind'].includes(k)?'all':k==='view'?'gallery':'fit';if(state[k]!==def)p.set(k,state[k]);else p.delete(k);}
 if(atlasState.section)p.set('area',atlasState.section);else p.delete('area');
 p.set('profile',GSPTolls.profileID);p.set('basis',GSPTolls.basis);
 try{history.replaceState(null,'','#'+p.toString());}catch{}
}
function makePool(c=getCategory()){
 const filtered=DATA.records.filter(r=>(state.county==='all'||r.counties.includes(state.county))&&(state.kind==='all'||r.kind===state.kind)&&(!c.tolled_only||GSPTolls.lookup(r.fid)));
 let items=[];
 if(c.grain==='plaza'){
  items=GSPTolls.data.plazas.filter(p=>state.county==='all'||p.counties.includes(state.county)).map(p=>{
   const prices=GSPTolls.price(p),value=c.metric==='charge'?prices[GSPTolls.basis]:c.metric==='ez_savings'&&prices.cash!=null&&prices[GSPTolls.basis==='offpeak'?'offpeak':'peak']!=null?prices.cash-prices[GSPTolls.basis==='offpeak'?'offpeak':'peak']:c.metric==='offpeak_savings'&&prices.peak!=null&&prices.offpeak!=null?prices.peak-prices.offpeak:null;
   return {id:p.id,number:String(p.milepost),group:p.study_group,road:p.name,counties:p.counties,movement:p.kind==='mainline'?'Mainline barrier':'Ramp toll',records:p.matched_selection_ids.map(id=>recById.get(String(id))).filter(Boolean),value:value==null?null:Math.round(value*100)/100,plaza:p,prices};
  }).filter(p=>Number.isFinite(p.value));
 }else if(c.grain==='group'){
  const gs=new Map();for(const r of filtered){if(!gs.has(r.group))gs.set(r.group,[]);gs.get(r.group).push(r);}
  items=[...gs].map(([g,rs])=>({id:'g'+g,number:g,group:g,road:DATA.group_names[g]||'Exit area',counties:rs[0].counties,movement:`${rs.length} road drawings`,records:rs,value:rs.length}));
 }else items=filtered.filter(r=>Number.isFinite(r.metrics[c.metric])&&(!c.minLength||r.metrics.length_ft>=c.minLength)).map(r=>({id:String(r.fid),number:r.number,group:r.group,road:publicRoad(r.road),counties:r.counties,movement:`${r.direction} ${r.kind.toLowerCase()}`,records:[r],value:r.metrics[c.metric]}));
 items.sort((a,b)=>(c.ascending?a.value-b.value:b.value-a.value)||(parseFloat(b.number)-parseFloat(a.number))||a.number.localeCompare(b.number)||a.id.localeCompare(b.id,undefined,{numeric:true}));
 let prev=null,rank=0;items.forEach((r,i)=>{if(prev===null||Math.abs(r.value-prev)>1e-10)rank=i+1;r.rank=rank;prev=r.value;});return items;
}
function plazaSVG(item,w,h,exportMode=false){
 const p=item.plaza,c=getCategory(),accent=exportMode?c.color:state.theme==='dark'?c.night:c.color;
 const bounds=ATLAS.corridor_bounds,{project}=fitProjection(bounds,w,h,15),dot=project(p.anchor_xy);
 const lines=ATLAS.corridor_mainlines.map(l=>`<path d="${pathD(l.xy,project)}" fill="none" stroke="${state.theme==='dark'?'#94aaa5':'#a0b1a7'}" stroke-width="1.4" stroke-linejoin="round"/>`).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(p.name)} on the Parkway. Approximate reference location, north up."><title>${esc(p.name)} · schedule milepost ${p.milepost}</title>${lines}<circle cx="${dot[0]}" cy="${dot[1]}" r="${h>250?8:5}" fill="${accent}" stroke="${exportMode?'white':'var(--stage)'}" stroke-width="2"/><text x="${w-14}" y="22" text-anchor="end" fill="${accent}" font-family="Arial" font-size="14">N ↑</text></svg>`;
}
function renderHero(animate=false){
 const c=getCategory(),item=currentTop.find(x=>x.id===state.selected)||currentTop[0];if(!item)return;state.selected=item.id;
 $('selectedRank').textContent=`Rank ${item.rank} · ${item.plaza?'Tariff entry':c.grain==='group'?'Exit area':'Ramp drawing'}`;
 $('heroShape').innerHTML=shapeSVG(item,Math.max(220,$('heroShape').clientWidth||520),window.innerWidth<=680?270:328,{hero:true,animate});
 $('winnerMeta').textContent=`${item.movement} · ${item.counties.join(' / ')} ${item.counties.length>1?'counties':'County'}`;
 $('winnerTitle').textContent=item.plaza?item.road:`Exit ${item.number}`;$('winnerRoad').textContent=item.plaza?`Schedule milepost ${item.plaza.milepost.toFixed(1)}`:item.road;
 $('winnerValue').innerHTML=pretty(item.value,c,true);
 const labels={length_ft:'Distance along the road',total_turn_deg:'Total bending along the road',turn_per_100ft:'Bending per 100 feet of road',min_radius_100ft:'Estimated size of the curve',path_to_chord_ratio:'Road length compared with a straight line',footprint_width_ft:'Width across the shape',footprint_height_ft:'Long side of the surrounding box',footprint_acres:'Area of the surrounding box',path_count:'Ramp drawings at this interchange',aadt:'Average vehicles per day · 2024',charge:`${GSPTolls.basis==='cash'?'Cash · all times':'NJ E-ZPass · '+(GSPTolls.basis==='peak'?'peak':'off-peak')} · ${GSPTolls.profile().label}`,ez_savings:`Cash minus NJ E-ZPass ${GSPTolls.basis==='offpeak'?'off-peak':'peak'} · same entry`,offpeak_savings:`NJ E-ZPass peak minus off-peak · ${GSPTolls.profile().label}`};
 $('valueLabel').textContent=labels[c.metric];
 let secondary='';
 if(item.plaza){const pr=item.prices;secondary=`NJ E-ZPass: peak $${number(pr.peak,2)} / off-peak $${number(pr.offpeak,2)}. ${pr.cash==null?'Cash is not accepted.':'Cash: $'+number(pr.cash,2)+'.'}`;}
 else if(c.id==='longest'||c.id==='shortest')secondary=`${number(item.value/5280,3)} miles along the road drawing.`;
 else if(c.id==='turning')secondary=`${number(item.value/360,2)} full rotations’ worth of heading change.`;
 else if(c.id==='straightest')secondary=`${number((item.value-1)*100,3)}% extra distance compared with a straight line.`;
 else if(c.id==='indirect')secondary=`Endpoints ${number(item.records[0].endpoint_chord_ft)} ft apart; path ${number(item.records[0].metrics.length_ft)} ft long.`;
 else if(c.family==='traffic')secondary='A daily average for 2024. Some drawings share the same road count.';
 else if(c.id==='branches')secondary='The drawing brings together the connections included in your filters.';
 else if(c.id==='area')secondary=`${number(item.records[0].metrics.footprint_width_ft)} × ${number(item.records[0].metrics.footprint_height_ft)} ft box.`;
 else if(c.id==='bend')secondary='A smaller estimate means a tighter bend.';
 else secondary=`Ramp drawing length: ${number(item.records[0].metrics.length_ft)} ft.`;
 $('winnerSecondary').textContent=secondary;
 $('stageCaption').textContent=`${item.records.length>1?item.records.length+' road shapes':'Road shape'} · north up`;
 $('replayBtn').hidden=!!item.plaza;histogram(item);
 $('distributionTitle').textContent=c.id==='straightest'?`Extra distance among these ${currentTop.length} paths (%)`:`Across ${number(currentPool.length)} eligible ${item.plaza?'tariff entries':c.grain==='group'?'exit areas':'drawings'}`;
 $('openAtlasBtn').textContent=item.plaza?'Open toll details ↗':c.grain==='group'?'Explore this exit ↗':'Take a closer look ↗';
}
function badge(item){const p=item.plaza||item.records.map(r=>GSPTolls.lookup(r.fid)).find(Boolean);return p?`<span class="super-toll-badge" role="img" aria-label="${esc('Tolled movement: '+p.name)}" title="${esc('Tolled movement · '+p.name)}">${icon('toll')}</span>`:'';}
function renderRankings(){
 const c=getCategory(),isGallery=state.view==='gallery',w=isGallery?190:100,h=isGallery?160:84;
 let common=null;if(state.scale==='same'&&c.grain!=='plaza')common=Math.min(...currentTop.map(r=>{const b=boundsOf(r);return Math.min((w-28)/Math.max(1e-9,b[2]-b[0]),(h-28)/Math.max(1e-9,b[3]-b[1]));}));
 const maxBar=Math.max(...currentTop.map(r=>comparisonValue(r,c)),1e-9);
 $('rankings').className=isGallery?'rank-gallery':'rank-list';$('listHeader').hidden=isGallery;
 $('listView').setAttribute('aria-pressed',String(!isGallery));$('galleryView').setAttribute('aria-pressed',String(isGallery));
 $('barLabel').textContent=c.family==='tolls'?'2026 USD':c.id==='straightest'?'Extra distance (%)':c.family==='traffic'?'2024 vehicles/day':c.unit;
 $('rankings').innerHTML=currentTop.map(r=>`<button class="${isGallery?'gallery-item':'rank-row'}" data-id="${esc(r.id)}" aria-pressed="${state.selected===r.id}" aria-label="${esc(`Rank ${r.rank}. ${r.plaza?r.road:'Interchange '+r.number+', '+r.movement+', '+r.road}. ${pretty(r.value,c)}. Inspect this result.`)}"><span class="rank-number">${r.rank}</span>${badge(r)}<span class="row-shape">${shapeSVG(r,w,h,{forcedScale:common})}</span><span class="row-info"><span class="row-number">${esc(r.plaza?r.road:r.number)}</span>${!r.plaza?`<span class="row-road">${esc(r.road)}</span>`:''}<span class="row-meta">${esc(r.movement)}${r.plaza?' · MP '+r.number:''}<br>${esc(r.counties.join(' / '))}</span></span><span class="row-metric"><span class="row-value">${esc(compact(r.value,c))}</span>${!isGallery?`<span class="bar-track"><span class="bar-fill" style="width:${comparisonValue(r,c)/maxBar*100}%"></span></span>`:''}</span></button>`).join('');
 $('rankings').querySelectorAll('[data-id]').forEach(b=>b.addEventListener('click',()=>{state.selected=b.dataset.id;renderHero(true);renderRankings();syncHash();$('rankings').querySelector(`[data-id="${state.selected}"]`)?.focus({preventScroll:true});$('announcer').textContent='Selected result updated.';}));
 $('topCount').textContent=`${currentTop.length} results`;
 $('rankingFootnote').textContent=(c.grain==='plaza'?'Markers show approximate locations on the same north-up corridor. ':state.scale==='same'?'The drawings use the same scale, so you can compare their sizes. ':'Each drawing is enlarged to fit. ')+(!isGallery?'Bars start at zero. ':'')+`Matching values share a rank. ${currentTop.length} results shown.`;
}
function render(resetSelection=false){
 setTheme();state.county=countyLookup.get(atlasState.section)?.name||'all';const c=getCategory();family=c.family;
 const root=document.getElementById('superlatives');root.style.setProperty('--accent',state.theme==='dark'?c.night:c.color);root.style.setProperty('--soft',state.theme==='dark'?'#293d40':c.soft);
 $('categoryTitle').textContent=c.title;$('categoryIntro').textContent=c.intro;$('categoryIcon').innerHTML=icon(c.icon);$('categoryNote').textContent=c.note;
 root.querySelectorAll('.category-button').forEach(b=>{b.hidden=DATA.categories.find(x=>x.id===b.dataset.category).family!==family;b.setAttribute('aria-current',String(b.dataset.category===c.id));});
 root.querySelectorAll('[data-super-family]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.superFamily===family)));
 currentPool=makePool(c);currentTop=currentPool.slice(0,10);
 if(resetSelection||!currentTop.some(x=>x.id===state.selected))state.selected=currentTop[0]?.id||null;
 const n=currentPool.length,grain=c.grain==='plaza'?'tariff entries':c.grain==='group'?'exit areas':'drawings';
 $('scopeText').textContent=`${number(n)} ${grain} · ${state.county==='all'?'Full Parkway':state.county+' County'}${c.grain==='plaza'?'':' · '+(state.kind==='all'?'entrances and exits':state.kind.toLowerCase()+'s')}`;
 $('rankingDirection').textContent=c.ascending?'Lowest first':'Highest first';
 $('kindFilter').value=state.kind;$('kindFilter').closest('label').hidden=c.grain==='plaza';$('scaleSelect').value=state.scale;$('scaleSelect').closest('label').hidden=c.grain==='plaza';$('resetFilters').hidden=state.kind==='all'&&!atlasState.section;
 $('detailBtn').hidden=c.grain==='plaza';root.querySelector('.rail-note').textContent=c.grain==='plaza'?'Rates: NJTA 2026 schedules. Map locations are approximate.':'Road shapes keep their proportions. North stays up.';

 $('emptyState').hidden=!!n;$('resultsBody').hidden=!n;
 $('emptyState').querySelector('h3').textContent='No drawings compared here.';
 $('emptyState').querySelector('p').textContent='Try another stretch of road or choose entrances and exits.';
 $('emptyReset').hidden=false;
 if(n){renderHero(false);renderRankings();}else $('rankings').replaceChildren();
 syncHash();$('announcer').textContent=`${c.title}. ${n} ${grain}.`;
}
function resetFilters(){state.kind='all';changeArea('');render(true);}
function sourceDetails(){const item=currentTop.find(x=>x.id===state.selected);if(item?.plaza)GSPTolls.openPlaza(item.plaza.id);else sourceDetailsPath();}
function methods(){
 $('methodContent').innerHTML=`<p>These rankings compare the drawings included here. Some show a full ramp; others show a fork or one part of a longer connection.</p><p>Drawings are enlarged to fit. Choose “Same scale” to compare their sizes. Matching values share a rank; the first 10 results are shown.</p><p>Traffic is an average number of vehicles a day in 2024. Missing estimates are left out.</p><h3>What each category means</h3>${DATA.categories.map(c=>`<details><summary>${esc(c.title)}</summary><p>${esc(c.definition)}</p><p>${esc(c.note)}</p></details>`).join('')}`;
 $('methodDialog').showModal();
}

function exportCSV(){const c=getCategory(),q=csvCell,rows=[['category','rank','exit','road','movement','counties','value','unit','drawings_compared','stretch_of_road','year']];for(const r of currentTop)rows.push([c.title,r.rank,r.number,r.road,r.movement,r.counties.join(' / '),c.id==='straightest'?(r.value-1)*100:r.value,c.id==='straightest'?'percent extra distance':c.unit,currentPool.length,state.county,c.family==='traffic'?2024:2025]);save('GSP_Top_10_'+c.id+'.csv','\ufeff'+rows.map(r=>r.map(q).join(',')).join('\r\n'),'text/csv;charset=utf-8');}

$('openAtlasBtn').addEventListener('click',()=>{const item=currentTop.find(x=>x.id===state.selected);if(!item)return;if(item.plaza)GSPTolls.openPlaza(item.plaza.id);else if(getCategory().grain==='group')openOverviewGroup(item.group);else openDetail(Number(item.id),currentTop.map(x=>Number(x.id)));});
document.querySelectorAll('#superlatives [data-super-family]').forEach(b=>b.addEventListener('click',()=>{family=b.dataset.superFamily;state.category=DATA.categories.find(c=>c.family===family).id;render(true);}));
document.addEventListener('tollpricingchange',()=>render(true));
document.addEventListener('gspworkspace',()=>{if(atlasState.workspace==='superlatives')render();});
new MutationObserver(()=>{if(atlasState.workspace==='superlatives')render();}).observe(document.body,{attributes:true,attributeFilter:['class']});
let visualResizeFrame;window.addEventListener('resize',()=>{cancelAnimationFrame(visualResizeFrame);visualResizeFrame=requestAnimationFrame(()=>{if(atlasState.workspace==='superlatives')renderHero();});});
window.GSPSuperlatives={refresh:()=>render(),get categories(){return DATA.categories},get rows(){return currentTop},get pool(){return currentPool},get category(){return state.category},select:id=>{if(DATA.categories.some(c=>c.id===id)){state.category=id;render(true);}}};
render();

})(state,DATA,setSharedSection,countyById);