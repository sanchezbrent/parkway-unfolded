#!/usr/bin/env python3
"""Render actual browser frames of the two GIS-based unfold animations.
Requires Python playwright, Chromium, and ffmpeg. No generative images are used.
Usage: python render_movies.py [--html GSP_True_Visuals.html] [--fps 30]
"""
from __future__ import annotations
import argparse, asyncio, json, shutil, subprocess, time
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parent

async def run(args):
    if not shutil.which('ffmpeg'): raise RuntimeError('ffmpeg is required to write MP4 files.')
    chromium=args.chromium or shutil.which('chromium') or shutil.which('google-chrome')
    html=args.html.read_text(encoding='utf-8')
    audit={'method':'Chromium screenshots of the same immutable SVG polylines used by the standalone HTML. No generative frames.', 'width':1920,'height':1080,'fps':args.fps,'duration_seconds':24,'movies':[]}
    async with async_playwright() as p:
        kwargs={'headless':True,'args':['--no-sandbox','--disable-dev-shm-usage']}
        if chromium: kwargs['executable_path']=chromium
        browser=await p.chromium.launch(**kwargs)
        page=await browser.new_page(viewport={'width':1920,'height':1080},device_scale_factor=1)
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        await page.set_content(html,wait_until='load');await page.wait_for_function('window.LAB')
        await page.evaluate("document.body.classList.add('capture');forceCapture=true")
        for collection,base in [('all','GSP_Unfold_All_359'),('featured','GSP_Unfold_Featured_39')]:
            await page.evaluate('(c)=>LAB.configure({mode:"unfold",collection:c,county:"",kind:"",direction:"",motion:"wave",selected:null,time:0})',collection)
            output=ROOT/(base+'.mp4')
            log=(ROOT/(base+'.encoding.log')).open('w')
            cmd=['ffmpeg','-y','-hide_banner','-loglevel','error','-f','image2pipe','-framerate',str(args.fps),'-vcodec','png','-i','pipe:0','-an','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(output)]
            proc=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=log)
            start=time.monotonic();nframes=24*args.fps;cache={}
            try:
                for i in range(nframes):
                    u=i/(nframes-1)
                    key='map' if u<=.1 or u>=.9 else 'grid' if .4<=u<=.6 else None
                    if key in cache: png=cache[key]
                    else:
                        await page.evaluate('(u)=>LAB.seek(u)',u)
                        png=await page.screenshot(type='png',animations='disabled')
                        if key: cache[key]=png
                    proc.stdin.write(png)
                    if i%90==0: print(f'{base}: {i}/{nframes} frames ({time.monotonic()-start:.1f}s)',flush=True)
                proc.stdin.close();returncode=proc.wait(timeout=90)
                if returncode: raise RuntimeError(f'ffmpeg failed: {base}.encoding.log')
            except BaseException:
                proc.kill();raise
            finally:log.close()
            info=await page.evaluate('({paths:LAB.info().count,vertices:LAB.info().vertices})')
            movie={'file':output.name,'selected_paths':info['paths'],'vertices':info['vertices'],'frames':nframes,'render_seconds':round(time.monotonic()-start,2)}
            audit['movies'].append(movie);print('DONE',movie,flush=True)
        audit['browser_errors']=errors
        if errors: raise RuntimeError(str(errors))
        await browser.close()
    (ROOT/'movie-verification.json').write_text(json.dumps(audit,indent=2)+'\n')

if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--html',type=Path,default=ROOT/'GSP_True_Visuals.html');ap.add_argument('--fps',type=int,default=30);ap.add_argument('--chromium',default=None)
    args=ap.parse_args();asyncio.run(run(args))
