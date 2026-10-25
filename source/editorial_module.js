(function(){
const discoveries=document.getElementById('editorialDiscoveries');
const priorOverview=drawOverview;
drawOverview=function(){priorOverview();discoveries.hidden=!!state.section;};
document.querySelector('[data-editorial-unfold]').addEventListener('click',()=>{state.collection='featured';state.filters={group:'',direction:'',kind:''};state.morph=0;switchWorkspace('atlas',{scroll:true});drawAtlas();document.getElementById('unfoldButton').click();});
document.querySelector('[data-editorial-longest]').addEventListener('click',()=>openDetail(3962));
document.querySelector('[data-editorial-loop]').addEventListener('click',()=>{GSPSuperlatives.select('indirect');switchWorkspace('superlatives',{scroll:true});});
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const target=document.getElementById(a.getAttribute('href').slice(1));if(!target)return;let p=target;while(p){if(p.tagName==='DETAILS')p.open=true;p=p.parentElement;}});
drawOverview();
})();
