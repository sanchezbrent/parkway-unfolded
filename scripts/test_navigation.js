// Exercise the real route controller against a browser-style history stack.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'source/simple_module.js'),'utf8');
const data=JSON.parse(fs.readFileSync(path.join(root,'data/study-data.json'),'utf8'));
function between(start,end){const a=source.indexOf(start),b=source.indexOf(end,a);assert(a>=0&&b>a);return source.slice(a,b);}
function harness(){
 let cursor=0,url=new URL('https://example.org/parkway/'),closed=0,rankings={category:'longest',kind:'all',view:'gallery',scale:'fit',selected:null};
 const entries=[{url:url.href,state:null}],tasks=[],frames=[],nodes=new Map();
 const history={get state(){return entries[cursor].state;},replaceState(state,_,hash){url=new URL(hash,url);entries[cursor]={url:url.href,state:structuredClone(state)};},pushState(state,_,hash){url=new URL(hash,url);entries.splice(cursor+1);entries.push({url:url.href,state:structuredClone(state)});cursor++;}};
 const node=()=>({focus(){},querySelector(){return node();}});
 const env=vm.createContext({URLSearchParams,DATA:data,byFID:new Map(data.records.map(r=>[r.fid,r])),countyById:new Map([['union',{}]]),demoGroup:'135',history,
  location:{get hash(){return url.hash;},get href(){return url.href;}},scrollX:0,scrollY:0,
  navigationReady:true,navigationRestoring:false,navigationQueued:false,navigationQuery:null,navigationRestoreToken:0,
  group:'135',unfolded:false,selected:null,hasUnfolded:false,comparisonOrigin:'explore',galleryOpened:false,
  state:{workspace:'overview',section:'',group:'135',selected:null,collection:'all',filters:{group:'',direction:'',kind:''},compare:[null,null]},
  document:{querySelectorAll:()=>[{close(){closed++;}}],body:{classList:{remove(){}}}},experience:node(),
  $:id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);},
  queueMicrotask:fn=>tasks.push(fn),requestAnimationFrame:fn=>frames.push(fn),
  refreshSharedControls:()=>env.syncHash(),
  showGroup:(group,{select=null,unfold=false}={})=>{Object.assign(env,{group,selected:select,unfolded:unfold});Object.assign(env.state,{group,selected:select,workspace:'explore'});env.syncHash();},
  switchWorkspace:view=>{env.state.workspace=view;env.syncHash();}
 });
 env.window={scrollTo:({left,top})=>{env.scrollX=left;env.scrollY=top;},GSPSuperlatives:{get navigationState(){return {...rankings};},restoreNavigation:value=>{rankings={...value};}}};
 vm.runInContext(between('function exitViewQuery(){','function exitShareData(){'),env);
 vm.runInContext(between('function navigationSnapshot(){','window.GSPNavigation='),env);
 const flush=()=>{while(tasks.length)tasks.shift()();};
 return {env,entries,flush,paint(){while(frames.length)frames.shift()();flush();},get cursor(){return cursor;},get closed(){return closed;},get rankings(){return rankings;},set rankings(value){rankings=value;},
  move(amount){cursor+=amount;assert(cursor>=0&&cursor<entries.length);url=new URL(entries[cursor].url);env.restoreNavigation(history.state.parkwayNavigation);},
  exit(group,selected=null,unfolded=true){env.rememberNavigationScroll();Object.assign(env,{group,selected,unfolded,hasUnfolded:unfolded});Object.assign(env.state,{workspace:'explore',group,selected});env.syncHash();flush();}
 };
}
const h=harness();h.env.commitNavigation(true);
h.exit('135',5707);h.env.scrollY=816;h.env.rememberNavigationScroll();
h.exit('100',5687);h.exit('82',5680);assert.equal(h.entries.length,4);
h.move(-1);h.paint();assert.equal(h.env.group,'100');assert.equal(h.env.selected,5687);assert.equal(h.entries.length,4,'Back must not push another stop');
h.move(-1);h.paint();assert.equal(h.env.group,'135');assert.equal(h.env.selected,5707);assert.equal(h.env.scrollY,816);
h.move(-1);h.paint();assert.equal(h.env.state.workspace,'overview');
h.move(1);h.paint();assert.equal(h.env.selected,5707);
h.exit('136',null,false);assert.equal(h.entries.length,3,'A new route discards the old Forward path');
h.exit('136',null,true);assert.equal(h.entries.length,3,'Folding and selecting within one exit replace the current stop');
h.move(-1);h.paint();assert.equal(h.env.group,'135');assert.equal(h.env.selected,5707);
h.move(1);h.paint();assert.equal(h.env.group,'136');assert.equal(h.env.unfolded,true);

// County scope, gallery filters and rankings survive returning to their stops.
h.env.state.workspace='overview';h.env.state.section='union';h.env.syncHash();h.flush();
h.exit('135',5707);h.env.state.section='';h.exit('100',5687);
h.move(-1);h.paint();assert.equal(h.env.state.section,'union');assert.equal(h.env.selected,5707);
h.move(-1);h.paint();assert.equal(h.env.state.workspace,'overview');assert.equal(h.env.state.section,'union');
h.env.state.workspace='atlas';h.env.state.filters.kind='Entrance';h.env.state.collection='signature';h.env.state.morph=0;h.env.syncHash();h.flush();
h.rankings={category:'curviest',kind:'Entrance',view:'list',scale:'same',selected:'5687'};
h.env.state.workspace='superlatives';h.env.syncHash(new URLSearchParams('workspace=superlatives&category=curviest&kind=Entrance&view=list&scale=same'));h.flush();
h.exit('100',5687);h.move(-1);h.paint();assert.equal(h.env.state.workspace,'superlatives');assert.equal(h.rankings.view,'list');assert.equal(h.rankings.selected,'5687');
h.move(-1);h.paint();assert.equal(h.env.state.workspace,'atlas');assert.equal(h.env.state.filters.kind,'Entrance');assert.equal(h.env.state.collection,'signature');assert.equal(h.env.state.morph,0);

// A second traversal before the first paint must win, without a history loop.
h.move(-1);h.move(-1);h.paint();assert.equal(h.env.state.workspace,'explore');assert.equal(h.env.group,'136');assert.equal(h.env.selected,null);
assert(h.closed>0);
console.log('Passed: exit Back/Forward, selected ramps, folding without extra stops, scroll and county restoration, gallery/rankings state, Forward branching and rapid traversal.');
