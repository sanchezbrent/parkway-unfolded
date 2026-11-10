/* A browser-local adoption desk. Real road records stay unchanged. */
(function(){
'use strict';
const STORAGE_KEY='parkway-fun-family-v1';
// A deliberately smaller mix of road jokes, characters, creatures and oddities.
const nicknameOriginals=[
 // Roads, bends and questionable navigation
 "Professor Loop",
 "Little Detour",
 "Wiggles",
 "Sir Bends-a-Lot",
 "Bendy Wendy",
 "Missed My Exit",
 "Jughandle Judy",
 "Tollbooth Tony",
 "Merge Simpson",
 "Bendjamin Franklin",
 "Claudia Curves",
 "Rampenstein",
 "Count Rampula",
 "The Great Bendini",
 "Bend Solo",
 "Loop Skywalker",
 "Rampunzel",
 "Curvature Carl",
 "Marge the Merge",
 "Exitential Crisis",
 "Almost There",
 "One More Exit",
 "Oops All Curves",
 "Mildly Lost",
 "Scenic Route",
 "Wrong Way Walter",
 "Benny the Bend",
 "Greetings from Bend",
 "Yielda",
 "Curvy Irving",
 "Loop There It Is",
 "Licensed to Wiggle",
 "Certified Good Bend",
 "Professional Detour",
 "Very Important Bend",
 "Uncle U-Turn",
 "Cousin Curb",
 "Auntie Asphalt",
 "Curbside Carl",
 "Shoulder Shrug",
 "Soft Shoulder Sammy",
 "Lane Change Larry",
 "Blinker Belle",
 "Traffic Cone Joan",
 "Pocket Parkway",
 "Teeny Turn",
 "Itsy Bitsy Interchange",
 "Small Road Big Dreams",
 "Wiggle Room",
 "Oopsie Loop",
 "Happy Little Offramp",
 "Loop de Lou",
 "Rumble Strip Rita",
 "Merging Margot",
 "Swerve Irving",
 "Exit Stage Left",
 "Interchangeable Dave",
 "Gentle Curve Gerald",
 "Merge of Honor",
 "Lane Austen",
 "Edgar Allan Toll",
 "The Turn Identity",
 "Lord of the Ramps",
 "No Sudden Moves",
 "Probably This Way",
 "Blink and You Miss It",
 "A Slight Diversion",
 "The Long Goodbye",
 "Just One More Turn",
 "Left on Read",
 // A few familiar New Jersey faces
 "Turnpike Tina",
 "Garden State Gary",
 "See You in Secaucus",
 "Down the Shore",
 "Shore Thing",
 "Boardwalk Betty",
 "Pine Barrens Pat",
 "Asbury Swerve",
 "Hoboken Hokey Pokey",
 "Greetings from Exit 9",
 "Bruce Springbend",
 "Jersey Swerve",
 "Shore Leave",
 "The Local Legend",
 "Cape May I",
 "Paramus Maximus",
 "Bend It Like Bergen",
 "Morris the Merge",
 "Essex Appeal",
 "Union Jackknife",
 "The Parkway Pal",
 "Ocean Motion",
 "Atlantic Attitude",
 "Local Lanes Larry",
 "Monmouth Moxie",
 "Burlington Bert",
 "Just Jersey Things",
 "Northbound Nancy",
 "Southbound Sal",
 "Shorely You Jest",
 // Tiny officials and office personalities
 "Assistant to the Ramp",
 "Deputy Wigglepants",
 "The Bend Department",
 "Regional Ramp Manager",
 "Employee of the Merge",
 "Grandma GPS",
 "Acting Road Director",
 "Chief of Small Turns",
 "The Interim Wizard",
 "Mayor of Over There",
 "Deputy Daydream",
 "Inspector Maybe",
 "Detective Sidequest",
 "Captain Eventually",
 "Admiral Sideways",
 "Professor Fidget",
 "Doctor Meander",
 "Sir Taps-a-Lot",
 "Baron Von Bother",
 "Count Fluster",
 "Duchess Dawdle",
 "Lady Loiter",
 "Madam Miscellaneous",
 "Judge Wobble",
 "Agent Detour",
 "Ranger Whimsy",
 "Coach Chaos",
 "Intern of the Month",
 "Senior Junior",
 "Vice President of Huh",
 "The Committee",
 "Pending Approval",
 "Per My Last Blinker",
 "Out of Office",
 "Team Building Exercise",
 "A Quick Follow-Up",
 "Unfinished Business",
 "The Loose Agenda",
 "Meeting Adjourned",
 "Municipal Mystery",
 // Creatures with places to be
 "Doodlebug",
 "Worm With a Job",
 "Long Little Guy",
 "A Respectable Worm",
 "Disco Pigeon",
 "Seagull Supervisor",
 "Goose With a Permit",
 "Moth in a Tiny Hat",
 "The Opossum Diplomat",
 "Raccoon in Charge",
 "Turtle With Ambition",
 "A Very Busy Newt",
 "Frog About Town",
 "The Scenic Snail",
 "Mildly Famous Mantis",
 "Wren With a Plan",
 "Cricket at Large",
 "The Patient Heron",
 "Owl Be Right Back",
 "A Dignified Beetle",
 "Fancy Little Ferret",
 "Professor Possum",
 "Deputy Dragonfly",
 "Dame Firefly",
 "Captain Cormorant",
 "Otter Nonsense",
 "An Unhurried Egret",
 "Wobbly Wombat",
 "Mister Moth",
 "Bureaucratic Badger",
 "The Pigeon Principal",
 "Sparrow in a Hurry",
 "Local Cryptid",
 "The Jersey Daydream",
 "Mothman Takes Exit 8",
 "The Toll Troll",
 "Pocket Gargoyle",
 "Duchess Dragon",
 "The Friendly Phantom",
 "Ghost With a Commute",
 // Objects, weather and other small mysteries
 "Bubbles",
 "Squiggle",
 "Tangles",
 "Scribbles",
 "Shoelace",
 "Pocket Lint",
 "Spare Button",
 "Lucky Paperclip",
 "The Bent Staple",
 "Tiny Umbrella",
 "Sir Thimble",
 "Madam Marble",
 "The Lost Mitten",
 "Wandering Sock",
 "Mismatched Slippers",
 "A Loose Thread",
 "The Spare Key",
 "Pocket Watch",
 "Old Reliable",
 "The Rubber Stamp",
 "Captain Kettle",
 "Little Lantern",
 "The Wobbly Wheel",
 "A Small Contraption",
 "Disco Ball Dave",
 "Velvet Tracksuit",
 "The Crooked Bookmark",
 "Ribbon With Ambition",
 "The Fancy Doorknob",
 "Captain Cardigan",
 "Pebble With Plans",
 "Pinecone Prime",
 "Acorn of Interest",
 "The Little Fern",
 "Moss Boss",
 "Puddle Jumper",
 "Cloud Nine-ish",
 "A Passing Cloud",
 "Mister Mist",
 "Drizzle Dazzle",
 "Breezy Beatrice",
 "Captain Static",
 "Thunder on Tiptoes",
 "Comet With Errands",
 "Satellite Sid",
 "Orbiting Oliver",
 "Little Dipper",
 "Moonbeam Maurice",
 "The Minor Planet",
 "Asteroid on Vacation",
 // Moods, mishaps and grand entrances
 "A Small Plot Twist",
 "Main Character Energy",
 "A Brief Interruption",
 "Slightly Dramatic",
 "Mostly Harmless",
 "Remarkably Average",
 "Suspiciously Polite",
 "Quietly Spectacular",
 "Unexpected Guest",
 "Unscheduled Whimsy",
 "The Scenic Pause",
 "A Gentle Nuisance",
 "The Other Way Around",
 "Here for the Scenery",
 "Just Browsing",
 "Leisurely Larry",
 "The Slow Reveal",
 "Small but Complicated",
 "A Work in Progress",
 "The Grand Entrance",
 "Not in a Hurry",
 "Fashionably Delayed",
 "The Little Flourish",
 "A Minor Inconvenience",
 "Wiggle by Appointment",
 "The Dashing Dash",
 "An Interesting Choice",
 "Cautiously Optimistic",
 "A Curious Development",
 "The Serendipity Dept.",
 "Fancy Footwork",
 "A Reasonable Detour",
 "A Modest Adventure",
 "Some Assembly Required",
 "Wait Where Was I",
 "The Unexpected Encore",
 "Officially Unofficial",
 "The Accidental Tourist",
 "A Very Small Epic",
 "One for the Road",
 // A small helping of food jokes
 "Noodle",
 "Pretzel Pete",
 "Pork Roll Polly",
 "Taylor Ham Sam",
 "Duchess Ravioli",
];
const nicknames=[...new Set(nicknameOriginals)];
let nicknameDeck=[],lastNickname='';
const compliments=['Your angles are impeccable.','New Jersey is lucky to have you.','You’re going places. Eventually.','What a fine little detour.','No notes. Perfect bend.','You make a very good point. Several, actually.'];
let storageAvailable=true,family=loadFamily(),current=null,returnFocus=null,snoozing=false,zoomFrame=null;
const desk=$('adoptionDialog');

function nicknameText(value){
 if(typeof value!=='string')return '';
 return Array.from(value.replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim()).slice(0,24).join('');
}
function normalizeFamily(value){
 const unique=new Map();
 if(!Array.isArray(value))return [];
 for(const item of value.slice(-records.length*2)){
  if(!item||!Number.isSafeInteger(item.fid)||!byFID.has(item.fid))continue;
  const name=nicknameText(item.name);if(name)unique.set(item.fid,{fid:item.fid,name});
 }
 return [...unique.values()];
}
function loadFamily(){
 try{return normalizeFamily(JSON.parse(localStorage.getItem(STORAGE_KEY)));}
 catch(e){storageAvailable=false;return [];}
}
function saveFamily(){
 try{localStorage.setItem(STORAGE_KEY,JSON.stringify(family));storageAvailable=true;}
 catch(e){storageAvailable=false;toast('Your browser couldn’t save this. Keep an adoption paper, and your ramp can stay for this visit.');}
 refreshAll();
}
function memberFor(fid){return family.find(item=>item.fid===fid);}
function randomNickname(previous){
 const blocked=new Set(family.map(member=>member.name));
 blocked.add(nicknameText(previous));
 blocked.add(lastNickname);
 while(nicknameDeck.length){
  const name=nicknameDeck.pop();
  if(!blocked.has(name)){lastNickname=name;return name;}
 }
 nicknameDeck=nicknames.filter(name=>!blocked.has(name));
 // Deal the full shuffled deck before refilling, across both rerolls and new ramps.
 for(let i=nicknameDeck.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));
  [nicknameDeck[i],nicknameDeck[j]]=[nicknameDeck[j],nicknameDeck[i]];
 }
 lastNickname=nicknameDeck.pop()||nicknameText(previous)||nicknames[0];
 return lastNickname;
}
function characterGeometry(r){
 const project=fit(sourceBounds(r),320,260,{left:30,right:30,top:40,bottom:25});
 const face=project(sample(r,.53).xy);
 return {d:xyPath(r.source_xy,project),x:clamp(face[0],36,284),y:clamp(face[1]-7,50,221),project};
}
function characterMarkup(r,{decorative=false,eyes=true}={}){
 const g=characterGeometry(r),seed=Math.abs(Number(r.fid));
 const eyeTiming=`--eye-blink-cycle:${(4.4+seed%23/10).toFixed(1)}s;--eye-blink-phase:${(-(seed*17%67)/10).toFixed(1)}s;--eye-gaze-cycle:${(13+seed%29/5).toFixed(1)}s;--eye-gaze-phase:${(-(seed*31%180)/10).toFixed(1)}s`;
 return `<svg viewBox="0 0 320 260" class="adoption-character" ${decorative?'aria-hidden="true"':`role="img" aria-label="Real shape of exit ${esc(r.number)}, ${esc(movement(r))}, with decorative eyes. North up."`} data-adoption-fid="${Number(r.fid)}"><path class="adoption-road" d="${g.d}" data-source-vertices="${r.source_xy.length}" data-source-fid="${Number(sourceFID(r))}"/>${eyes?`<g class="adoption-eyes" style="${eyeTiming}" transform="translate(${g.x.toFixed(3)} ${g.y.toFixed(3)})" aria-hidden="true"><g class="adoption-eye-open"><g class="adoption-blink"><ellipse cx="-13" cy="0" rx="11" ry="14"/><ellipse cx="13" cy="0" rx="11" ry="14"/><g class="adoption-gaze"><circle class="adoption-pupil" cx="-13" cy="1" r="4"/><circle class="adoption-pupil" cx="13" cy="1" r="4"/></g></g></g><path class="adoption-eye-closed" d="M-22 1h17M5 1h17"/></g>`:''}<text x="295" y="23" class="adoption-north">N ↑</text></svg>`;
}
function refreshSelection(){
 const r=byFID.get(state.selected),button=$('adoptSelected');
 button.disabled=!r;button.textContent=r&&memberFor(r.fid)?`Visit ${memberFor(r.fid).name} ♡`:'Adopt this ramp ♡';
}
function refreshDetail(r){
 const member=memberFor(r.fid);
 $('adoptionDetailName').textContent=member?`${member.name} lives here.`:'What a fine little road.';
 $('adoptDetail').textContent=member?'Say hello ♡':'Adopt this ramp ♡';
}
function refreshAll(){
 $('adoptionNavCount').textContent=String(family.length);
 $('viewMyRamps').setAttribute('aria-label',`My ramps, ${family.length} adopted ${family.length===1?'ramp':'ramps'}`);
 $('adoptionStorageNote').textContent=storageAvailable?'Saved only in this browser. Extremely unofficial, obviously.':'Browser storage is unavailable. This family lasts for this visit; save an adoption paper to keep a copy.';
 $('adoptionFamilyStorageNote').textContent=storageAvailable?'Your ramps live in this browser. Adoption papers make excellent fridge material.':'Browser storage is unavailable. Your ramps are here for this visit; adoption papers let you keep a copy.';
 refreshSelection();
 if($('branchDialog').open){const r=byFID.get(state.detailIDs[state.detailIndex]);if(r)refreshDetail(r);}
 renderFamily();
}
function renderFamily(){
 const content=$('adoptionFamilyContent');
 if(!family.length){
  content.innerHTML=`<div class="adoption-empty"><div class="adoption-empty-character">${characterMarkup(byFID.get(5745)||records[0],{decorative:true})}</div><div><h3>A family of zero. For now.</h3><p>Find a ramp you like, give it a name, and bring it home. It has absolutely no idea what a mortgage is.</p><button class="adoption-button" data-adoption-random>Find my first little road <span aria-hidden="true">↝</span></button></div></div>`;
  return;
 }
 content.innerHTML=`<div class="adoption-family-grid${family.length===1?' adoption-family-single':''}">${family.map(member=>{
  const r=byFID.get(member.fid);
  return `<article class="adoption-family-card"><button class="adoption-card-portrait" data-adoption-visit="${r.fid}" aria-label="Say hello to ${esc(member.name)}, exit ${esc(r.number)}">${characterMarkup(r,{decorative:true})}</button><div class="adoption-card-copy"><span class="adoption-eyebrow">Very good little road</span><h3>${esc(member.name)}</h3><p class="adoption-card-road"><strong>Exit ${esc(r.number)} · ${esc(movement(r))}</strong><br>${esc(publicRoad(r.road))}</p><div class="adoption-card-actions"><button class="adoption-button" data-adoption-visit="${r.fid}">Say hello ♡</button><button class="text-button" data-adoption-map="${r.fid}">Find on map ↗</button></div></div></article>`;
 }).join('')}</div>`;
}
function stopZoom(){if(zoomFrame!==null)cancelAnimationFrame(zoomFrame);zoomFrame=null;$('adoptionShape').querySelector('.adoption-runner')?.remove();}
function paintDesk(){
 stopZoom();snoozing=false;
 const member=memberFor(current.fid),name=member?.name||randomNickname();
 $('adoptionNickname').value=name;$('adoptionNickname').setCustomValidity('');$('adoptionLiveName').textContent=name;
 $('adoptionShape').innerHTML=characterMarkup(current);
 $('adoptionStage').classList.remove('is-snoozing');$('adoptionSnooze').setAttribute('aria-pressed','false');$('adoptionSnooze').textContent='Snooze ☾';
 $('adoptionBubble').hidden=true;$('adoptionFeedback').hidden=true;
 $('adoptionExit').textContent=`Exit ${current.number}`;
 $('adoptionRoad').textContent=publicRoad(current.road);
 $('adoptionLocation').textContent=`${movement(current)} · ${groupCounties(current.group).join(' / ')} · ${fmt(current.length_ft)} ft of road`;
 updateAdoptedStatus();
}
function updateAdoptedStatus(){
 const member=memberFor(current.fid);
 $('adoptionStatus').textContent=member?'Happily at home':'Available for adoration';
 $('adoptionSavedActions').hidden=!member;
 $('adoptionSave').textContent=member?'Save its nickname ♡':'Adopt this ramp ♡';
}
function openDesk(fid){
 const r=byFID.get(fid);if(!r)return;
 if(!desk.open)returnFocus=document.activeElement;
 if(state.tour)toggleTour(false);
 current=r;paintDesk();
 document.body.classList.add('modal-open');if(!desk.open)desk.showModal();
}
function closeDesk(restoreFocus=true){
 stopZoom();desk.close();
 if(!document.querySelector('dialog[open]'))document.body.classList.remove('modal-open');
 if(restoreFocus&&returnFocus?.isConnected&&returnFocus.getClientRects().length)returnFocus.focus({preventScroll:true});
}
function randomRamp(pool,previous){
 let available=pool.filter(r=>r.number!==previous?.number&&!memberFor(r.fid));
 if(!available.length)available=pool.filter(r=>r.number!==previous?.number);
 if(!available.length)available=pool.filter(r=>r.fid!==previous?.fid&&!memberFor(r.fid));
 if(!available.length)available=pool.filter(r=>r.fid!==previous?.fid);
 if(!available.length)available=pool;
 return available[Math.floor(Math.random()*available.length)];
}
function meetRandom(){
 const pool=state.workspace==='family'?records:records.filter(r=>sectionGroups(state.section).includes(r.group));
 const r=randomRamp(pool,current),wasOpen=desk.open;
 if(r){
  openDesk(r.fid);
  if(wasOpen){$('adoptionFeedback').textContent=`Now meeting exit ${r.number}.`;$('adoptionFeedback').hidden=false;}
 }
}
function findOnMap(fid){
 const r=byFID.get(fid);if(!r)return;
 if(desk.open)closeDesk(false);if($('branchDialog').open)closeDetail();
 if(state.section&&!sectionGroups(state.section).includes(r.group)){state.section='';state.filters.group='';}
 setGroup(r.group,{drawAtlas:false});state.selected=r.fid;state.focus=false;
 switchWorkspace('explore',{scroll:true});setSelectionDisplay();updateHighlight();
 requestAnimationFrame(()=>$('branchList').querySelector(`[data-fid="${r.fid}"]`)?.focus({preventScroll:true}));
}
function certificateMarkup(r,name){
 const g=characterGeometry(r),road=publicRoad(r.road);
 const metadata=esc(JSON.stringify({title:'Parkway Unfolded adoption paper',nickname:name,source:DATA.provenance.official_source_url,snapshot:'2025-08-21',source_fid:sourceFID(r),selection_key:r.fid,source_xy:r.source_xy,method:'Translation and uniform scaling only. North up. Adoption is fictional.'}));
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="800" viewBox="0 0 1000 800"><metadata>${metadata}</metadata><rect width="1000" height="800" fill="#fff9e8"/><rect x="25" y="25" width="950" height="750" rx="25" fill="none" stroke="#4e2a63" stroke-width="3"/><text x="500" y="80" text-anchor="middle" fill="#4e2a63" font-family="Arial" font-size="15" letter-spacing="3">PARKWAY UNFOLDED · EXTREMELY UNOFFICIAL</text><text x="500" y="142" text-anchor="middle" fill="#4e2a63" font-family="Georgia" font-size="47">Certificate of Ramp Adoption</text><svg x="340" y="165" width="320" height="260" viewBox="0 0 320 260"><path d="${g.d}" fill="none" stroke="#4e2a63" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><text x="290" y="20" font-family="Arial" font-size="12" fill="#4e2a63">N ↑</text></svg><text x="500" y="481" text-anchor="middle" fill="#4e2a63" font-family="Georgia" font-size="${Array.from(name).length>18?42:52}">${esc(name)}</text><text x="500" y="525" text-anchor="middle" fill="#4e2a63" font-family="Arial" font-size="18">A very good little road, warmly welcomed into your tiny road family.</text><text x="500" y="578" text-anchor="middle" fill="#4e2a63" font-family="Arial" font-size="20">Garden State Parkway · Exit ${esc(r.number)} · ${esc(movement(r))}</text><text x="500" y="613" text-anchor="middle" fill="#4e2a63" font-family="Arial" font-size="${road.length>75?12:16}">${esc(road)}</text><text x="500" y="676" text-anchor="middle" fill="#4e2a63" font-family="Arial" font-size="13">Real NJDOT road geometry, August 2025 · North up</text><text x="500" y="710" text-anchor="middle" fill="#4e2a63" font-family="Arial" font-size="12">Just for fun. No actual ownership or official road naming rights. sanchezbrent.github.io/parkway-unfolded/</text></svg>`;
}
function downloadCertificate(){
 const member=memberFor(current.fid);if(!member)return;
 const url=URL.createObjectURL(new Blob([certificateMarkup(current,member.name)],{type:'image/svg+xml'}));
 const a=document.createElement('a');a.href=url;a.download=`Parkway-adoption-${current.fid}.svg`;a.click();setTimeout(()=>URL.revokeObjectURL(url),4000);
 $('adoptionFeedback').hidden=false;$('adoptionFeedback').textContent='One extremely unofficial adoption paper, coming up.';
}
function zoom(){
 if(zoomFrame!==null)return;
 const svg=$('adoptionShape').querySelector('svg'),path=svg.querySelector('.adoption-road');
 const runner=append(svg,'circle',{r:6,class:'adoption-runner','aria-hidden':'true'});
 const start=performance.now(),length=path.getTotalLength(),duration=reduced.matches?1:1800;
 function tick(now){
  const t=clamp((now-start)/duration),p=path.getPointAtLength(length*t);runner.setAttribute('cx',p.x);runner.setAttribute('cy',p.y);
  if(t<1)zoomFrame=requestAnimationFrame(tick);else{runner.remove();zoomFrame=null;$('adoptionAnnouncement').textContent='One tiny journey, completed.';}
 }
 zoomFrame=requestAnimationFrame(tick);
}

$('adoptionWelcomeCharacter').innerHTML=characterMarkup(byFID.get(5745)||records[0],{decorative:true});
$('adoptSelected').addEventListener('click',()=>openDesk(state.selected));
$('adoptDetail').addEventListener('click',()=>openDesk(state.detailIDs[state.detailIndex]));
$('adoptionClose').addEventListener('click',()=>closeDesk());
desk.addEventListener('cancel',event=>{event.preventDefault();closeDesk();});
desk.addEventListener('close',()=>{stopZoom();if(!document.querySelector('dialog[open]'))document.body.classList.remove('modal-open');});
desk.addEventListener('click',event=>{if(event.target!==desk)return;const b=desk.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)closeDesk();});
$('adoptionNickname').addEventListener('input',event=>{event.target.setCustomValidity('');$('adoptionLiveName').textContent=nicknameText(event.target.value)||'A little ramp';});
$('adoptionRerollName').addEventListener('click',()=>{
 const input=$('adoptionNickname'),name=randomNickname(input.value);
 input.value=name;input.setCustomValidity('');$('adoptionLiveName').textContent=name;
 $('adoptionFeedback').textContent=`How about ${name}?`;$('adoptionFeedback').hidden=false;
});
$('adoptionForm').addEventListener('submit',event=>{
 event.preventDefault();const input=$('adoptionNickname'),name=nicknameText(input.value);
 if(!name){input.setCustomValidity('Every little road needs a name.');input.reportValidity();return;}
 input.value=name;const member=memberFor(current.fid);if(member)member.name=name;else family.push({fid:current.fid,name});
 saveFamily();updateAdoptedStatus();$('adoptionLiveName').textContent=name;$('adoptionFeedback').hidden=false;$('adoptionFeedback').textContent=`${name} is home. It’s taking this very well.`;
});
$('adoptionCertificate').addEventListener('click',downloadCertificate);
$('adoptionRelease').addEventListener('click',()=>{const name=memberFor(current.fid)?.name;family=family.filter(item=>item.fid!==current.fid);saveFamily();updateAdoptedStatus();$('adoptionSave').focus();$('adoptionFeedback').hidden=false;$('adoptionFeedback').textContent=`${name} is back on the Parkway. You can adopt it again any time.`;});
$('adoptionOnMap').addEventListener('click',()=>findOnMap(current.fid));
$('adoptionCompliment').addEventListener('click',()=>{
 snoozing=false;$('adoptionStage').classList.remove('is-snoozing');$('adoptionSnooze').setAttribute('aria-pressed','false');$('adoptionSnooze').textContent='Snooze ☾';
 const message=compliments[Math.floor(Math.random()*compliments.length)];$('adoptionBubble').textContent=message;$('adoptionBubble').hidden=false;$('adoptionAnnouncement').textContent=message;
});
$('adoptionSnooze').addEventListener('click',()=>{
 snoozing=!snoozing;$('adoptionStage').classList.toggle('is-snoozing',snoozing);$('adoptionSnooze').setAttribute('aria-pressed',String(snoozing));$('adoptionSnooze').textContent=snoozing?'Wake up ☀':'Snooze ☾';
 $('adoptionBubble').hidden=!snoozing;$('adoptionBubble').textContent='Zzz. Dreaming of toll-free roads.';$('adoptionAnnouncement').textContent=snoozing?'A very small nap.':'Wide awake and still a road.';
});
$('adoptionZoom').addEventListener('click',zoom);
document.addEventListener('click',event=>{
 const random=event.target.closest('[data-adoption-random]'),visit=event.target.closest('[data-adoption-visit]'),map=event.target.closest('[data-adoption-map]'),familyButton=event.target.closest('[data-adoption-family]');
 if(random)meetRandom();if(visit)openDesk(Number(visit.dataset.adoptionVisit));if(map)findOnMap(Number(map.dataset.adoptionMap));
 if(familyButton){closeDesk(false);if($('branchDialog').open)closeDetail();switchWorkspace('family',{scroll:true});$('adoptionFamilyTitle').setAttribute('tabindex','-1');$('adoptionFamilyTitle').focus({preventScroll:true});}
});
window.addEventListener('storage',event=>{if(event.key!==STORAGE_KEY)return;family=loadFamily();refreshAll();if(desk.open)updateAdoptedStatus();});
function pauseHiddenEyes(){document.documentElement.classList.toggle('adoption-eyes-paused',document.hidden);}
document.addEventListener('visibilitychange',pauseHiddenEyes);
pauseHiddenEyes();
window.GSPAdoption={renderFamily,refreshSelection,refreshDetail};
refreshAll();
})();
