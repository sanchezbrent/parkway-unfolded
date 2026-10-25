"""Browser checks for exact affine display transforms, source IDs and controls."""
import asyncio, json, math, re
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parent
async def main():
 html=(ROOT/'GSP_True_Visuals.html').read_text()
 result={'errors':[], 'overlay_anchors':[], 'unfold_poses':[], 'filters':[], 'responsive':[]}
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  page=await browser.new_page(viewport={'width':1920,'height':1080},reduced_motion='reduce')
  page.on('pageerror',lambda e:result['errors'].append(str(e)))
  await page.set_content(html,wait_until='load');await page.wait_for_function('window.LAB')
  await page.evaluate("document.body.classList.add('capture');forceCapture=true")
  for anchor in ['start','end','parkway','mid']:
   await page.evaluate('(a)=>LAB.configure({mode:"overlay",anchor:a,scale:"common"})',anchor)
   info=await page.evaluate('LAB.info()')
   positions=[];scales=[]
   for n in info['transforms']:
    a=n['points'][n['anchor']];cx,cy=n['center'];t=n['transform'];scales.append(t['s'])
    positions.append([t['x']+(a[0]-cx)*t['s'],t['y']+(cy-a[1])*t['s']])
   gap=max(math.dist(positions[0],x) for x in positions)
   assert gap<1e-7 and max(scales)-min(scales)<1e-14,(anchor,gap)
   assert info['count']==359 and info['path_count']==359 and info['vertices']==12877
   result['overlay_anchors'].append({'anchor':anchor,'paths':359,'max_common_anchor_gap_px':gap,'one_scale':True})
  await page.evaluate('LAB.configure({anchor:"start",scale:"fit"})')
  svg=await page.evaluate('LAB.svgString()');(ROOT/'GSP_Overlay_Individual_Scales.svg').write_text(svg)
  await page.screenshot(path=str(ROOT/'GSP_Overlay_Individual_Scales.png'))
  await page.evaluate('LAB.configure({anchor:"start",scale:"common"})')
  (ROOT/'GSP_Overlay_Common_Scale.svg').write_text(await page.evaluate('LAB.svgString()'))
  await page.screenshot(path=str(ROOT/'GSP_Overlay_Common_Scale.png'))
  await page.evaluate('LAB.configure({anchor:"parkway"})')
  (ROOT/'GSP_Overlay_Parkway_End.svg').write_text(await page.evaluate('LAB.svgString()'))
  await page.screenshot(path=str(ROOT/'GSP_Overlay_Parkway_End.png'))
  await page.evaluate('LAB.configure({mode:"unfold",anchor:"start",collection:"all"})')
  for phase in [0,.1,.26,.4,.5,.6,.76,.9,1]:
   await page.evaluate('(u)=>LAB.seek(u)',phase);info=await page.evaluate('LAB.info()')
   assert info['path_count']==359 and info['vertices']==12877
   max_d=0
   for n in info['transforms']:
    t=n['transform'];assert t['s']>0
    if phase in [0,.1,.4,.5,.6,.9,1]:
     target=n['tile'] if .4<=phase<=.6 else n['map']
     max_d=max(max_d,max(abs(t[k]-target[k]) for k in ['x','y','s']))
   assert max_d<1e-8,(phase,max_d)
   result['unfold_poses'].append({'time':phase,'paths':359,'maximum_endpoint_transform_error':max_d})
   if phase in [0,.26,.5]:
    name={0:'GSP_Corridor_Start',.26:'GSP_Unfold_Transition',.5:'GSP_All_359_Shapes'}[phase]
    (ROOT/(name+'.svg')).write_text(await page.evaluate('LAB.svgString()'))
    await page.screenshot(path=str(ROOT/(name+'.png')))
  # Polyline vertices stay fixed even in the middle of the animation.
  vals=await page.evaluate('Array.from(document.querySelectorAll(".ramp-line"),p=>({fid:Number(p.dataset.selectionFid),d:p.getAttribute("d"),points:Number(p.dataset.sourceVertices)}))')
  sources={r['fid']:r for r in json.loads((ROOT/'source-data.json').read_text())['records']}
  assert len(vals)==359 and len({x['fid'] for x in vals})==359
  max_coord_error=0
  for v in vals:
   r=sources[v['fid']];pts=r['source_xy'];cx=(min(p[0] for p in pts)+max(p[0] for p in pts))/2;cy=(min(p[1] for p in pts)+max(p[1] for p in pts))/2
   tokens=re.findall(r'([ML])([-+0-9.eE]+)\s+([-+0-9.eE]+)',v['d'])
   assert len(tokens)==len(pts)==v['points']
   assert tokens[0][0]=='M' and all(t[0]=='L' for t in tokens[1:])
   for (_,x,y),original in zip(tokens,pts):max_coord_error=max(max_coord_error,abs(float(x)+cx-original[0]),abs(cy-float(y)-original[1]))
  assert max_coord_error<1e-8
  result['fixed_polyline_geometry']={'paths':359,'vertices':12877,'max_inversion_error_feet':max_coord_error,'commands':'M and L only'}
  data=json.loads((ROOT/'source-data.json').read_text());county=json.loads((ROOT/'county-display.json').read_text())
  for c in county['counties']:
   for mode in ['overlay','unfold']:
    await page.evaluate('(o)=>LAB.configure(o)',{'mode':mode,'county':c['id'],'collection':'all','time':.5})
    info=await page.evaluate('LAB.info()');expected=[r for r in data['records'] if r['group'] in c['groups']]
    assert info['count']==len(expected) and info['path_count']==len(expected)
    result['filters'].append({'county':c['id'],'mode':mode,'paths':info['count']})
  await page.evaluate('LAB.configure({county:"",mode:"unfold",collection:"featured",time:.5})')
  info=await page.evaluate('LAB.info()');assert info['count']==39
  await page.screenshot(path=str(ROOT/'GSP_Featured_39_Shapes.png'))
  (ROOT/'GSP_Featured_39_Shapes.svg').write_text(await page.evaluate('LAB.svgString()'))
  await page.evaluate('LAB.configure({collection:"signature",time:.5})');assert (await page.evaluate('LAB.info().count'))==94
  await page.evaluate('LAB.configure({collection:"all",kind:"Exit",direction:"Northbound"})')
  info=await page.evaluate('LAB.info()');assert info['count']==sum(r['kind']=='Exit' and r['direction']=='Northbound' for r in data['records'])
  # Every native selector entry can highlight its exact selection.
  await page.evaluate('LAB.configure({mode:"overlay",collection:"all",kind:"",direction:"",county:""})')
  failures=await page.evaluate('''()=>{const failures=[];for(const r of DATA.records){$('inspect').value=String(r.fid);$('inspect').dispatchEvent(new Event('change'));if(state.selected!==r.fid||!$('selection').textContent.includes(r.sri))failures.push(r.fid)}$('clearSelection').click();return failures}''')
  assert not failures;result['inspectors_checked']=359
  await browser.close()
  # New documents avoid redeclaring top-level constants with set_content.
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  for width in [320,390,768,1512]:
   q=await browser.new_page(viewport={'width':width,'height':1050},reduced_motion='reduce');q.on('pageerror',lambda e:result['errors'].append(str(e)))
   await q.set_content(html,wait_until='load');await q.wait_for_function('window.LAB')
   m=await q.evaluate('({body:document.body.scrollWidth,viewport:innerWidth,playing:LAB.info().state.playing})')
   assert m['body']<=width+1,(width,m)
   assert not m['playing']
   await q.screenshot(path=str(ROOT/f'Preview_{width}.png'))
   await q.locator('[data-mode="unfold"]').click();await q.locator('#grid').click();assert await q.evaluate('LAB.info().time')==.5
   await q.select_option('#collection','featured');assert await q.evaluate('LAB.info().count')==39
   # Interaction playback and manual scrubbing work with reduced-motion (no autoplay).
   await q.locator('#play').click();await q.wait_for_timeout(160);assert await q.evaluate('LAB.info().state.playing')
   await q.locator('#play').click();assert not await q.evaluate('LAB.info().state.playing')
   await q.locator('#theme').click();assert await q.evaluate('document.body.classList.contains("night")')
   result['responsive'].append({'width':width,'body_width':m['body'],'no_autoplay':True,'controls_checked':True})
   await q.close()
  await browser.close()
 assert not result['errors'],result['errors']
 (ROOT/'browser-verification.json').write_text(json.dumps(result,indent=2))
 print(json.dumps({k:v for k,v in result.items() if k not in ['filters','unfold_poses']},indent=2))
asyncio.run(main())
