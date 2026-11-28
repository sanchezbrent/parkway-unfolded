/* Shareable portraits made from the original, north-up road vertices. */
(function(){
'use strict';
let portraitRecord=null,portraitNickname='',portraitReturnFocus=null,portraitSaving=false;
const portraitDialog=document.createElement('dialog');
portraitDialog.id='rampPortraitDialog';portraitDialog.className='simple-dialog ramp-portrait-dialog';portraitDialog.setAttribute('aria-labelledby','rampPortraitTitle');
portraitDialog.innerHTML='<header class="simple-dialog-head"><h2 id="rampPortraitTitle">Save your ramp</h2><button class="icon-button" id="rampPortraitClose" type="button" aria-label="Close image preview">✕</button></header><div class="ramp-portrait-layout"><div class="ramp-portrait-preview" id="rampPortraitPreview"></div><div class="ramp-portrait-options"><p>A little road to keep or share.</p><label class="ramp-portrait-nickname" id="rampPortraitNicknameOption" hidden><input type="checkbox" id="rampPortraitNickname" checked>Include nickname and eyes</label><button class="simple-primary" id="rampPortraitSave" type="button">Save image</button><p class="ramp-portrait-status" id="rampPortraitStatus" role="status">PNG image · 1080 × 1350</p></div></div>';
document.body.append(portraitDialog);

function portraitGeometry(r){
 const local=fit(sourceBounds(r),830,580,50),project=point=>{const xy=local(point);return [xy[0]+125,xy[1]+255];};
 project.s=local.s;
 const face=project(sample(r,.53).xy);
 return {d:xyPath(r.source_xy,project),x:clamp(face[0],170,910),y:clamp(face[1]-12,310,790),project};
}
function portraitLines(text,width,size,weight='400'){
 textMeasure.font=`${weight} ${size}px Arial`;
 const lines=[];let line='';
 for(const word of String(text).trim().split(/\s+/)){
  if(line&&textMeasure.measureText(line+' '+word).width<=width){line+=' '+word;continue;}
  if(line){lines.push(line);line='';}
  for(const char of Array.from(word)){
   if(line&&textMeasure.measureText(line+char).width>width){lines.push(line);line='';}
   line+=char;
  }
 }
 if(line)lines.push(line);
 return lines;
}
function portraitText(text,{size=56,maxLines=3,weight='400'}={}){
 let lines=portraitLines(text,880,size,weight);
 while(lines.length>maxLines&&size>20){size-=2;lines=portraitLines(text,880,size,weight);}
 return {lines,size,weight,lineHeight:Math.ceil(size*1.18)};
}
function portraitWordmark(){
 // The same looped P / hairpin U paths as assets/branding/Parkway_Unfolded_Wordmark.svg.
 return '<svg aria-hidden="true" x="70" y="48" width="456" height="80" viewBox="0 0 570 100"><g fill="none" stroke="#9b5100" stroke-width="4.3" stroke-linecap="round" stroke-linejoin="round" transform="translate(12 20.2) scale(1.21333)"><path d="M6 42V15C6 8 11 5 20 5C30 5 36 10 36 18C36 26 29 30 21 28L6 22"/><circle cx="6" cy="42" r="2.1" fill="#fffdf7" stroke-width="1.8"/></g><text x="65.7" y="75" fill="#302337" font-family="Arial,Helvetica,sans-serif" font-size="64" font-weight="700" letter-spacing="-2.08">arkway</text><g fill="none" stroke="#006b5a" stroke-width="4.3" stroke-linecap="round" stroke-linejoin="round" transform="translate(285.7 20.2) scale(1.21333)"><path d="M6 6V26C6 37 12 42 21 42C30 42 36 35 36 25L39 6"/><circle cx="6" cy="6" r="2.1" fill="#fffdf7" stroke-width="1.8"/><circle cx="39" cy="6" r="2.1" fill="#fffdf7" stroke-width="1.8"/></g><text x="338.8" y="75" fill="#302337" font-family="Arial,Helvetica,sans-serif" font-size="64" font-weight="700" letter-spacing="-2.08">nfolded</text></svg>';
}
function portraitMarkup(r,nickname=''){
 const g=portraitGeometry(r),road=publicRoad(r.road),exit=numberTitle(r);
 const title=portraitText(nickname||road,{size:nickname?68:56,maxLines:nickname?2:3,weight:'700'});
 const subtitle=nickname?portraitText(road,{size:34,maxLines:3}):null;
 const blocks=[title,...(subtitle?[subtitle]:[]),portraitText(movement(r),{size:30,maxLines:1}),portraitText(groupCounties(r.group).join(' / ')+(groupCounties(r.group).length>1?' counties':' County'),{size:26,maxLines:1})];
 const height=blocks.reduce((sum,block)=>sum+block.lines.length*block.lineHeight,0)+18*(blocks.length-1);
 let y=865+(340-height)/2;
 const text=blocks.map((block,i)=>{let markup='';for(const line of block.lines){y+=block.lineHeight;markup+=`<text x="540" y="${y}" text-anchor="middle" font-size="${block.size}" font-weight="${block.weight}" fill="${i===0?'#4e2a63':'#665d68'}">${esc(line)}</text>`;}y+=18;return markup;}).join('');
 const eyes=nickname?`<g transform="translate(${g.x.toFixed(3)} ${g.y.toFixed(3)})" fill="#fffef9" stroke="#4e2a63" stroke-width="3"><ellipse cx="-22" cy="0" rx="19" ry="24"/><ellipse cx="22" cy="0" rx="19" ry="24"/><g fill="#4e2a63" stroke="none"><circle cx="-20" cy="2" r="7"/><circle cx="24" cy="2" r="7"/></g></g>`:'';
 const metadata=esc(JSON.stringify({title:'Parkway Unfolded ramp portrait',source:DATA.provenance.official_source_url,snapshot:'2025-08-21',source_fid:sourceFID(r),selection_key:r.fid,source_xy:r.source_xy,nickname:nickname||null,method:'All source vertices. Translation and uniform scaling only. North up. Nicknames and eyes are decorative.'}));
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350" role="img" aria-label="${esc(nickname?nickname+' · '+exit:exit)} · ${esc(road)}. North up." font-family="Arial,Helvetica,sans-serif"><metadata>${metadata}</metadata><rect width="1080" height="1350" fill="#fffdf7"/>${portraitWordmark()}<text x="75" y="164" font-size="25" fill="#665d68">Garden State Parkway</text><rect x="785" y="76" width="225" height="76" rx="9" fill="#12523f"/><rect x="792" y="83" width="211" height="62" rx="4" fill="none" stroke="#fff9e7" stroke-width="2"/><text x="897.5" y="124" text-anchor="middle" fill="#fff9e7" font-size="29" font-weight="700">${esc(exit)}</text><path d="M70 204H1010" stroke="#d4ccce" stroke-width="2"/><text x="977" y="264" text-anchor="end" font-size="25" fill="#665d68">N ↑</text><path class="portrait-road" d="${g.d}" data-source-fid="${Number(sourceFID(r))}" data-source-vertices="${r.source_xy.length}" fill="none" stroke="#4e2a63" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>${eyes}${text}<path d="M70 1237H1010" stroke="#d4ccce" stroke-width="2"/><text x="540" y="1280" text-anchor="middle" font-size="24" fill="#665d68">Road geometry: NJDOT, August 2025</text><text x="540" y="1318" text-anchor="middle" font-size="22" fill="#665d68">${nickname?'Nickname and eyes are just for fun.':'North up · Each road enlarged to fit'}</text></svg>`;
}
function portraitFilename(r,nickname='',extension='png'){
 const label=(nickname||publicRoad(r.road)).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60);
 return `parkway-${r.group==='12'?'access':'exit'}-${String(r.number).toLowerCase().replace(/[^a-z0-9]/g,'')}-${movement(r).toLowerCase().replace(/\s+/g,'-')}${label?'-'+label:''}.${extension}`;
}
function paintPortrait(){
 const nickname=$('rampPortraitNickname').checked?portraitNickname:'';
 $('rampPortraitPreview').innerHTML=portraitMarkup(portraitRecord,nickname);
 $('rampPortraitStatus').textContent='PNG image · 1080 × 1350';
}
function openPortrait(fid,{nickname=window.GSPAdoption?.nicknameFor(fid)||''}={}){
 const r=byFID.get(Number(fid));if(!r)return;
 if(portraitSaving){toast('Your image is being prepared.');return;}
 portraitReturnFocus=document.activeElement;portraitRecord=r;portraitNickname=nickname;
 $('rampPortraitNicknameOption').hidden=!nickname;$('rampPortraitNickname').checked=!!nickname;
 $('rampPortraitStatus').textContent='PNG image · 1080 × 1350';paintPortrait();
 document.body.classList.add('modal-open');portraitDialog.showModal();$('rampPortraitClose').focus({preventScroll:true});
}
function closePortrait(){
 portraitDialog.close();if(!document.querySelector('dialog[open]'))document.body.classList.remove('modal-open');
 if(portraitReturnFocus?.isConnected&&portraitReturnFocus.getClientRects().length)portraitReturnFocus.focus({preventScroll:true});
}
async function portraitPNG(markup){
 const url=URL.createObjectURL(new Blob([markup],{type:'image/svg+xml;charset=utf-8'})),image=new Image();
 let timer;
 try{
  await new Promise((resolve,reject)=>{timer=setTimeout(()=>reject(new Error('Image preparation timed out')),10000);image.onload=resolve;image.onerror=()=>reject(new Error('Image unavailable'));image.src=url;});
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
  const context=canvas.getContext('2d');if(!context)throw new Error('Image export unavailable');
  context.drawImage(image,0,0);
  return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Image export unavailable')),'image/png'));
 }finally{clearTimeout(timer);image.onload=image.onerror=null;URL.revokeObjectURL(url);}
}
function savePortraitBlob(blob,filename){
 const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=filename;
 document.body.append(link);try{link.click();}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
}
async function downloadPortrait(){
 if(portraitSaving||!portraitRecord)return;
 const r=portraitRecord,nickname=$('rampPortraitNickname').checked?portraitNickname:'',markup=portraitMarkup(r,nickname),button=$('rampPortraitSave');
 portraitSaving=true;button.disabled=true;button.setAttribute('aria-busy','true');button.textContent='Preparing image…';$('rampPortraitNickname').disabled=true;
 $('rampPortraitStatus').textContent='Preparing your image…';
 try{
  let blob,extension='png';
  try{blob=await portraitPNG(markup);}catch(error){blob=new Blob([markup],{type:'image/svg+xml;charset=utf-8'});extension='svg';}
  savePortraitBlob(blob,portraitFilename(r,nickname,extension));
  $('rampPortraitStatus').textContent=extension==='png'?'Your image is ready. If it opens in a new tab, use Save Image.':'PNG is unavailable in this browser. Your SVG image is ready instead.';
 }catch(error){$('rampPortraitStatus').textContent='The image couldn’t be saved. Please try again.';}
 finally{portraitSaving=false;button.disabled=false;button.removeAttribute('aria-busy');button.textContent='Save image';$('rampPortraitNickname').disabled=false;}
}
$('rampPortraitClose').addEventListener('click',closePortrait);
portraitDialog.addEventListener('cancel',event=>{event.preventDefault();closePortrait();});
portraitDialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.classList.remove('modal-open');});
$('rampPortraitNickname').addEventListener('change',paintPortrait);
$('rampPortraitSave').addEventListener('click',downloadPortrait);
document.addEventListener('click',event=>{const button=event.target.closest('[data-portrait-fid]');if(button)openPortrait(button.dataset.portraitFid);});
window.GSPPortrait={open:openPortrait};
})();
