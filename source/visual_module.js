(function(){
 const select=document.getElementById('themeSelect');
 const toggle=document.getElementById('themeToggle');
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
  toggle.querySelector('.theme-toggle-label').textContent=night?'Light mode':'Dark mode';
  toggle.setAttribute('aria-label',night?'Switch to light mode':'Switch to dark mode');
  if(redraw&&changed){
   relatedGroup=null;renderRelated();drawLocator();
   setGroup(state.group,{drawAtlas:false,preserveSelection:true});
   drawCollectionLocator();drawMain();drawAtlas();drawComparison();drawOverview();
   if(document.getElementById('branchDialog').open)paintDetail();
  }
 }
 function setMode(next){mode=next;select.value=mode;try{localStorage.setItem('parkway-theme',mode);}catch(e){}apply();}
 select.addEventListener('change',()=>setMode(select.value));
 toggle.addEventListener('click',()=>setMode(document.body.classList.contains('night')?'light':'dark'));
 system.addEventListener('change',()=>{if(mode==='system')apply();});
 apply(false);
})();
