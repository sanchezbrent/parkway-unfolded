(function(){
'use strict';
const TL=JSON.parse(document.getElementById('toll-data').textContent);
const byPlaza=new Map(TL.plazas.map(p=>[p.id,p]));
const pathTolls=new Map(TL.matches.map(m=>[m.selection_id,m]));
const money=v=>v==null?'Not accepted':`$${Number(v).toFixed(2)}`;
const codeNames={NE:'Northbound entrance',NX:'Northbound exit',SE:'Southbound entrance',SX:'Southbound exit'};
let on=false,lastFocus=null,activePlaza=null,profileID="car",rateBasis="peak";
const tip=$('tollTooltip');
function label(p){return p.kind==='mainline'?'Parkway toll':'Ramp toll';}
function charged(p){return p.kind==='mainline'?p.mainline_directions.join(' / '):p.movement_codes.map(c=>codeNames[c]).join(' · ');}
function scopePlazas(){const c=countyById.get(state.section);return TL.plazas.filter(p=>!c||p.counties.includes(c.name));}
function refresh(){
 const ps=scopePlazas();$('tollCoverage').textContent=`${ps.filter(p=>p.kind==='mainline').length} Parkway · ${ps.filter(p=>p.kind==='ramp').length} ramp toll listings`;
 $('tollLegend').hidden=!on;if($('tollDirectoryDialog').open)renderDirectory();
}
function profile(id=profileID){return TL.pricing.profiles.find(v=>v.id===id)||TL.pricing.profiles[0];}
function price(p,id=profileID){
 const v=profile(id),blocked=v.family==='truck'&&!p.heavy_trucks_allowed;
 if(blocked)return {cash:null,peak:null,offpeak:null,blocked:true};
 const peak=p.nj_ezpass_rates[v.key],cash=p.cash_accepted?p.cash_schedule_rates[v.key]:null;
 const offpeak=['senior','green'].includes(v.family)?p.senior_green_offpeak_class1:['truck','bus'].includes(v.family)?p.nj_ezpass_offpeak_rates[v.key]:peak;
 return {cash,peak,offpeak,blocked:false};
}
function amount(v,blocked=false){return blocked?'Not allowed':v==null?'Not accepted':money(v);}
function pricingNote(){return TL.pricing.periods+' '+(profile().family==='standard'?TL.pricing.standard_car_rule:TL.pricing.eligibility);}
function profileControls(withBasis=false){return `<div class="toll-profile-controls"><label>Vehicle / plan<select data-toll-profile>${TL.pricing.profiles.map(v=>`<option value="${v.id}" ${v.id===profileID?'selected':''}>${esc(v.label)}</option>`).join('')}</select></label>${withBasis?`<label>Rank by<select data-toll-basis><option value="peak" ${rateBasis==='peak'?'selected':''}>NJ E-ZPass · peak</option><option value="offpeak" ${rateBasis==='offpeak'?'selected':''}>NJ E-ZPass · off-peak</option><option value="cash" ${rateBasis==='cash'?'selected':''}>Cash · all times</option></select></label>`:''}</div>`;}
function bindProfile(host){host.querySelectorAll('[data-toll-profile]').forEach(s=>s.addEventListener('change',()=>setProfile(s.value)));host.querySelectorAll('[data-toll-basis]').forEach(s=>s.addEventListener('change',()=>setBasis(s.value)));}
function setProfile(id){if(!TL.pricing.profiles.some(v=>v.id===id))return;profileID=id;hideTip();updateRampDetails();if($('branchDialog').open)paintDetail();if($('tollDirectoryDialog').open)renderDirectory();if($('tollPlazaDialog').open&&activePlaza)openPlaza(activePlaza);drawOverview();drawMain();document.dispatchEvent(new CustomEvent('tollpricingchange'));}
function setBasis(value){if(!['peak','offpeak','cash'].includes(value))return;rateBasis=value;document.dispatchEvent(new CustomEvent('tollpricingchange'));}
function rateHTML(p){const v=price(p);return `<div class="toll-rate-pair"><div><span>Cash · all times</span><strong>${amount(v.cash,v.blocked)}</strong></div><div><span>NJ E-ZPass · peak</span><strong>${amount(v.peak,v.blocked)}</strong></div><div><span>NJ E-ZPass · off-peak</span><strong>${amount(v.offpeak,v.blocked)}</strong></div></div>${v.blocked?'<p>Heavy trucks cannot travel north of Exit 105.</p>':''}`;}

function rampHTML(r){
 const m=pathTolls.get(r.fid),p=byPlaza.get(m?.ramp_plaza_id);
 if(!p)return '<div class="toll-ramp-heading">Ramp toll · 2026</div><p>No separate ramp toll is listed for this connection. You may still pass a toll on the Parkway.</p>';
 return `<div class="toll-ramp-heading">${esc(p.name)} ramp toll · 2026</div>${!p.cash_accepted?'<p class="toll-ez-only">E-ZPass only</p>':''}${rateHTML(p)}<p>${esc(profile().label)} · ${esc(codeNames[m.movement_code])}</p><button class="toll-text-link" data-toll-open="${p.id}">Toll prices &amp; details ↗</button>`;
}
function bindPlazaButtons(host){host.querySelectorAll('[data-toll-open]').forEach(b=>b.addEventListener('click',()=>openPlaza(b.dataset.tollOpen)));}
function updateRampDetails(){
 const r=byFID.get(state.selected);$('quickToll').hidden=!r;$('quickToll').innerHTML=r?rampHTML(r):'';bindPlazaButtons($('quickToll'));
}
const priorSelection=setSelectionDisplay;
setSelectionDisplay=function(){priorSelection();updateRampDetails();};
const priorDetail=paintDetail;
paintDetail=function(){priorDetail();const r=byFID.get(state.detailIDs[state.detailIndex]);$('detailToll').innerHTML=r?rampHTML(r):'';bindPlazaButtons($('detailToll'));};
function hideTip(){tip.hidden=true;}
function showTip(p,element){
 const pr=price(p);tip.innerHTML=`<strong>${esc(p.name)}</strong><span>${label(p)} · mile ${p.milepost.toFixed(1)}</span><span>${esc(charged(p))}</span><span>${esc(profile().label)} · NJ E-ZPass peak ${amount(pr.peak,pr.blocked)} / off-peak ${amount(pr.offpeak,pr.blocked)}</span><small>2026 rates · approximate location · see prices</small>`;
 tip.hidden=false;const box=element.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;
 tip.style.left=Math.max(8,Math.min(innerWidth-w-8,box.left+14))+'px';tip.style.top=Math.max(8,Math.min(innerHeight-h-8,box.bottom+9))+'px';
}
function drawMarkers(svg,project,bounds,darkStage=false){
 svg.querySelectorAll('[data-toll-layer]').forEach(n=>n.remove());if(!on)return;
 const layer=append(svg,'g',{'data-toll-layer':'2026','aria-label':'2026 toll schedule reference markers'});
 const ps=scopePlazas().filter(p=>p.anchor_xy[0]>=bounds[0]&&p.anchor_xy[0]<=bounds[2]&&p.anchor_xy[1]>=bounds[1]&&p.anchor_xy[1]<=bounds[3]);
 const inkMain=darkStage?'#ffd29b':token('--toll-main'),inkRamp=darkStage?'#83dbc9':token('--toll-ramp');
 for(const p of ps){
  const q=project(p.anchor_xy),main=p.kind==='mainline',ink=main?inkMain:inkRamp;
  const g=append(layer,'g',{transform:`translate(${q[0]},${q[1]})`,class:'toll-marker',role:'button',tabindex:0,'data-toll-id':p.id,'aria-label':`${p.name}. ${label(p)}. ${charged(p)}. 2026 ${profile().label}. NJ E-ZPass peak ${amount(price(p).peak,price(p).blocked)}, off-peak ${amount(price(p).offpeak,price(p).blocked)}. Approximate location. Open details.`,'aria-describedby':'tollTooltip'});
  append(g,'rect',{x:-12,y:-12,width:24,height:24,fill:'transparent'});
  if(main)append(g,'circle',{r:8.3,fill:ink,stroke:darkStage?'#233630':token('--paper'),'stroke-width':1.8});
  else append(g,'path',{d:'M0 -6.5L6.5 0 0 6.5 -6.5 0Z',fill:ink,stroke:darkStage?'#233630':token('--paper'),'stroke-width':1.4});
  if(main){append(g,'path',{d:'M-4 -2H4M-3 -2V4M3 -2V4M-5 4H5',fill:'none',stroke:darkStage?'#213730':'#fffefa','stroke-width':1.3,'stroke-linecap':'round'});}
  const open=e=>{e.stopPropagation();hideTip();openPlaza(p.id);};g.addEventListener('click',open);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(e);}});
  g.addEventListener('mouseenter',()=>showTip(p,g));g.addEventListener('mouseleave',hideTip);g.addEventListener('focus',()=>showTip(p,g));g.addEventListener('blur',hideTip);
 }
 append(layer,'metadata',{},JSON.stringify({year:2026,position_policy:TL.provenance.position_policy,cash_source:TL.provenance.cash_schedule_url,nj_ezpass_source:TL.provenance.nj_ezpass_schedule_url,visible_entries:ps.map(p=>p.id)}));
}
const priorScene=renderScene;
renderScene=function(svg,list,context,bounds,options={}){const scene=priorScene(svg,list,context,bounds,options);if((options.mode||'context')==='context')drawMarkers(svg,scene.project,bounds,true);return scene;};
const priorOverview=drawOverview;
drawOverview=function(){
 priorOverview();if(state.workspace!=='overview')return;
 const c=countyById.get(state.section),width=Math.max(280,$('overviewMap').clientWidth),small=innerWidth<681,height=small?430:665,bounds=c?padBounds(c.bounds,.12,2200):COUNTY.full_bounds;
 const p=fit(bounds,width,height,{left:small?26:65,right:small?26:65,top:35,bottom:35});drawMarkers($('overviewSVG'),p,bounds,false);
};
const priorShared=refreshSharedControls;
refreshSharedControls=function(){priorShared();refresh();};
function closeDialog(id){$(id).close();hideTip();}
function openDirectory(){lastFocus=document.activeElement;renderDirectory();$('tollDirectoryDialog').showModal();}
function directoryRows(){const q=$('tollSearch').value.trim().toLowerCase(),type=$('tollType').value;return scopePlazas().filter(p=>(type==='all'||p.kind===type)&&(!q||`${p.name} ${p.study_group||''} ${p.counties.join(' ')} ${charged(p)}`.toLowerCase().includes(q))).sort((a,b)=>b.milepost-a.milepost||a.name.localeCompare(b.name));}
function renderDirectory(){ $('tollDirectoryPricing').innerHTML=profileControls();bindProfile($('tollDirectoryPricing'));
 const ps=directoryRows();$('tollDirectoryScope').textContent=`${areaLabel()} · 2026 · ${profile().label}`;$('tollDirectoryCount').textContent=`${ps.length} toll listings`;
 $('tollDirectoryRows').innerHTML=ps.map(p=>{const pr=price(p);return `<tr><td><strong>${esc(p.name)}</strong><small>${label(p)}${p.study_group?' · exit '+esc(p.study_group):''}</small></td><td>${p.milepost.toFixed(1)}<small>${esc(charged(p))}</small></td><td>${amount(pr.cash,pr.blocked)}</td><td>${amount(pr.peak,pr.blocked)}</td><td>${amount(pr.offpeak,pr.blocked)}</td><td><button data-toll-entry="${p.id}">Details</button></td></tr>`;}).join('');
 $('tollDirectoryEmpty').hidden=!!ps.length;
 $('tollDirectoryRows').querySelectorAll('[data-toll-entry]').forEach(b=>b.addEventListener('click',()=>{closeDialog('tollDirectoryDialog');openPlaza(b.dataset.tollEntry);}));
}
function openPlaza(id){
 const p=byPlaza.get(id);if(!p)return;activePlaza=id;lastFocus=document.activeElement;hideTip();
 $('tollPlazaTitle').textContent=p.name;$('tollPlazaSubtitle').textContent=`${label(p)} · mile ${p.milepost.toFixed(1)} · ${p.counties.join(' / ')}`;
 const rs=p.matched_selection_ids.map(id=>byFID.get(id)).filter(Boolean);
 const nearest=p.kind==='mainline'?Object.entries(DATA.groups).map(([g,v])=>({g,d:Math.hypot(v.center[0]-p.anchor_xy[0],v.center[1]-p.anchor_xy[1])})).sort((a,b)=>a.d-b.d).slice(0,3):[];
 $('tollPlazaBody').innerHTML=`<div class="toll-plaza-summary">${profileControls()}${!p.cash_accepted?'<p class="toll-ez-only">E-ZPass only · cash is not accepted at this exit.</p>':''}${rateHTML(p)}<p>${esc(pricingNote())}</p><h3>Where you pay</h3><p class="toll-charged">${esc(charged(p))}</p>${p.express_bypass_listed_by_njta?'<p>Express E-ZPass bypass lanes are listed here by NJTA.</p>':''}<h3>Location on the map</h3><p>${p.kind==='mainline'?'The marker shows the general toll-plaza area.':'The marker shows the exit or entrance where this toll applies.'}</p>${p.study_group?`<p>Exit ${esc(p.study_group)} · ${esc(groupNames[p.study_group])}</p>`:''}</div><div class="toll-related"><h3>${rs.length?'Ramps shown here':'Nearby exits'}</h3><p>${rs.length?'Several drawings can show parts of the same tolled connection. They do not represent separate toll charges.':'Choose an exit to explore the roads near this toll.'}</p>${rs.length?`<div class="toll-related-list">${rs.map(r=>`<button data-toll-inspect="${r.fid}"><strong>${esc(r.number)} · ${esc(movement(r))}</strong><span>${esc(publicRoad(r.road))}</span></button>`).join('')}</div>`:`<div class="toll-related-list">${nearest.map(n=>`<button data-toll-group="${n.g}"><strong>Exit ${n.g}</strong><span>${esc(groupNames[n.g])}</span></button>`).join('')}</div>`}</div><details class="toll-source-disclosure"><summary>About these rates and locations</summary><p>Prices come from NJTA’s 2026 toll schedules. Your price depends on your vehicle, payment method and any eligible discount plan.</p><p>Map markers show approximate toll locations.</p><p><a href="${TL.provenance.cash_schedule_url}" target="_blank" rel="noopener">2026 cash schedule</a> · <a href="${TL.provenance.nj_ezpass_schedule_url}" target="_blank" rel="noopener">2026 NJ E-ZPass schedule</a> · <a href="${TL.provenance.offpeak_schedule_url}" target="_blank" rel="noopener">2026 truck / bus off-peak schedule</a> · <a href="${TL.provenance.special_schedule_url}" target="_blank" rel="noopener">Senior / Green Pass schedule</a> · <a href="${TL.provenance.authority_about_url}" target="_blank" rel="noopener">NJTA toll information</a></p></details>`;
 $('tollPlazaBody').querySelectorAll('[data-toll-inspect]').forEach(b=>b.addEventListener('click',()=>{closeDialog('tollPlazaDialog');openDetail(Number(b.dataset.tollInspect),rs.map(r=>r.fid));}));
 $('tollPlazaBody').querySelectorAll('[data-toll-group]').forEach(b=>b.addEventListener('click',()=>{closeDialog('tollPlazaDialog');openOverviewGroup(b.dataset.tollGroup);}));
 bindProfile($('tollPlazaBody'));if(!$('tollPlazaDialog').open)$('tollPlazaDialog').showModal();
}
function fileSave(filename,data,type){const url=URL.createObjectURL(new Blob([data],{type})),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function downloadTable(){const fields=['toll_location','type','mile_marker','exit','where_you_pay','vehicle_and_payment_plan','cash_accepted','cash_all_times_usd','nj_ezpass_peak_usd','nj_ezpass_offpeak_usd','heavy_trucks_allowed','year'],q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';const rows=directoryRows().map(p=>{const pr=price(p);return [p.name,label(p),p.milepost,p.study_group||'',charged(p),profile().label,p.cash_accepted,pr.cash,pr.peak,pr.offpeak,p.heavy_trucks_allowed,2026];});fileSave('GSP_Tolls_2026_'+profileID+'.csv','\ufeff'+[fields,...rows].map(r=>r.map(q).join(',')).join('\r\n'),'text/csv;charset=utf-8');}
$('tollToggle').addEventListener('change',()=>{on=$('tollToggle').checked;hideTip();refresh();drawOverview();drawMain();if($('branchDialog').open)paintDetail();});
$('tollDirectoryBtn').addEventListener('click',openDirectory);
$('tollSearch').addEventListener('input',renderDirectory);$('tollType').addEventListener('change',renderDirectory);$('tollDownloadTable').addEventListener('click',downloadTable);
document.querySelectorAll('[data-toll-close]').forEach(b=>b.addEventListener('click',()=>closeDialog(b.dataset.tollClose)));
for(const id of ['tollDirectoryDialog','tollPlazaDialog'])$(id).addEventListener('click',e=>{const d=$(id),r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))d.close();});
addEventListener('scroll',hideTip,{passive:true});addEventListener('resize',hideTip);
refresh();updateRampDetails();
window.GSPTolls={get enabled(){return on},get data(){return TL},lookup:id=>byPlaza.get(pathTolls.get(Number(id))?.ramp_plaza_id)||null,openPlaza,openDirectory,price,profile,profileControls,bindProfile,setProfile,setBasis,get basis(){return rateBasis},get profileID(){return profileID},rows:directoryRows};
})();
