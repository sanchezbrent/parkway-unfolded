(function(){
 const select=document.getElementById('themeSelect');
 const system=matchMedia('(prefers-color-scheme: dark)');
 let mode='system';
 try{mode=localStorage.getItem('parkway-theme')||'system';}catch(e){}
 if(!['system','light','dark'].includes(mode))mode='system';
 select.value=mode;
 function apply(redraw=true){
  const night=mode==='dark'||mode==='system'&&system.matches;
  const changed=document.body.classList.contains('night')!==night;
  document.body.classList.toggle('night',night);
  document.documentElement.style.colorScheme=night?'dark':'light';
  if(redraw&&changed){
   relatedGroup=null;renderRelated();drawLocator();
   setGroup(state.group,{drawAtlas:false,preserveSelection:true});
   drawCollectionLocator();drawMain();drawAtlas();drawComparison();drawOverview();
   if(document.getElementById('branchDialog').open)paintDetail();
  }
 }
 select.addEventListener('change',()=>{mode=select.value;try{localStorage.setItem('parkway-theme',mode);}catch(e){}apply();});
 system.addEventListener('change',()=>{if(mode==='system')apply();});
 apply(false);
})();
