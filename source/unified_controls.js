(function(){
const p=new URLSearchParams((window.GSPInitialViewHash??location.hash).slice(1));
for(const [button,input] of [['trafficLayerButton','trafficToggle'],['tollLayerButton','tollToggle']]){
 const b=document.getElementById(button),i=document.getElementById(input);b.addEventListener('click',()=>{i.checked=!i.checked;i.dispatchEvent(new Event('change'));b.setAttribute('aria-pressed',String(i.checked));});i.addEventListener('change',()=>b.setAttribute('aria-pressed',String(i.checked)));
}
const oldShared=refreshSharedControls;
refreshSharedControls=function(){oldShared();if(state.workspace==='superlatives')window.GSPSuperlatives?.refresh();};
document.getElementById('rankingsShortcut').addEventListener('click',()=>switchWorkspace('superlatives',{scroll:true}));
document.querySelectorAll('.layer-data-menu button').forEach(b=>b.addEventListener('click',()=>document.querySelector('.layer-data-menu').open=false));
if(p.has('area')&&countyById.has(p.get('area')))setSharedSection(p.get('area'));
if(p.has('profile'))GSPTolls.setProfile(p.get('profile'));if(p.has('basis'))GSPTolls.setBasis(p.get('basis'));
if(p.has('workspace'))switchWorkspace(p.get('workspace'));
document.addEventListener('gspworkspace',()=>{const x=new URLSearchParams(location.hash.slice(1));x.set('workspace',state.workspace);history.replaceState(null,'','#'+x.toString());});
})();
