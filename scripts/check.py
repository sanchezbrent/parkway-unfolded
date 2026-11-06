#!/usr/bin/env python3
"""Check reproducibility, retained data, media completeness and safe repository sizes."""
from pathlib import Path
import csv,hashlib,json,re,subprocess,sys,tempfile
from png_checks import inspect_shape_png

ROOT=Path(__file__).resolve().parent.parent
subprocess.run(['node',str(ROOT/'scripts/test_rendering.js')],check=True)
subprocess.run(['node',str(ROOT/'scripts/test_adoption.js')],check=True)
subprocess.run([sys.executable,'-m','unittest','discover','-s',str(ROOT/'scripts'),'-p','test_png_checks.py'],check=True)
sha=lambda b:hashlib.sha256(b).hexdigest()
baseline=json.loads((ROOT/'verification/release-baseline.json').read_text())
before=(ROOT/'index.html').read_bytes()
subprocess.run([sys.executable,str(ROOT/'source/build.py')],check=True)
assert before==(ROOT/'index.html').read_bytes(),'Rebuild differs from committed index.html'
html=before.decode();pattern=r'<script[^>]*id="([^"]+)"[^>]*type="application/json"[^>]*>(.*?)</script>'
blocks={m[1]:m[2] for m in re.finditer(pattern,html,re.S)}
assert set(blocks)==set(baseline['data_files'])
for key,name in baseline['data_files'].items():
    assert (ROOT/'data'/name).read_bytes()==blocks[key].encode(),name
    assert sha(blocks[key].encode())==baseline['embedded_data_sha256'][key],f'Unreviewed data change: {key}'
study=json.loads(blocks['study-data']);records=study['records'];rankings=json.loads(blocks['superlatives-data'])
assert len(records)==359 and len({r['fid'] for r in records})==359
assert sum(len(r['source_xy']) for r in records)==12877
assert len(study['groups'])==84
assert len(rankings['categories'])==15
assert all(c.get('family')!='tolls' for c in rankings['categories'])
assert 'id="title" class="parkway-wordmark" aria-label="Parkway Unfolded"' in html
assert 'class="header-marker"' not in html
index=ROOT/'media/shapes/Shape_Index.csv'
with index.open(encoding='utf-8-sig',newline='') as f:rows=list(csv.DictReader(f))
assert len(rows)==359
media=json.loads((ROOT/'verification/media-integrity.json').read_text())
for r in rows:
    p=ROOT/'media/shapes'/r['filename'];assert p.is_file(),str(p)
    assert sha(p.read_bytes())==media['png_sha256'][r['filename']],str(p)
    inspect_shape_png(p,(int(r['png_width_px']),int(r['png_height_px'])))
for name in ['GSP_Unfold_All_359_Vertical_9x16.mp4','GSP_Unfold_Featured_39_Vertical_9x16.mp4']:assert (ROOT/'media/animations'/name).stat().st_size>0
for p in ROOT.rglob('*'):
    if p.is_file() and '.git' not in p.parts:assert p.stat().st_size<100*1024*1024,f'GitHub file limit: {p}'
# The main page has no external runtime scripts or stylesheets.
assert not re.search(r'<script\b[^>]*\bsrc\s*=',html,re.I)
assert not re.search(r'<link\b[^>]*rel=["\']stylesheet',html,re.I)
js='\n'.join(m[2] for m in re.finditer(r'<script([^>]*)>(.*?)</script>',html,re.S) if 'application/json' not in m[1])
with tempfile.TemporaryDirectory() as d:
    p=Path(d)/'application.js';p.write_text(js);subprocess.run(['node','--check',str(p)],check=True)
print('Passed: reproducible build, 5 preserved datasets, 359 drawings, 12,877 vertices, 15 categories, 359 decoded transparent PNGs, media and JavaScript.')
