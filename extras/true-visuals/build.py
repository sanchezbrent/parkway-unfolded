#!/usr/bin/env python3
"""Build the self-contained visual studies from the completed Parkway atlas.
Usage: python build.py --atlas /path/GSP_Parkway_County_Refined.html
No geometry is simplified, rotated, mirrored, smoothed, or replaced.
"""
from __future__ import annotations
import argparse, hashlib, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--atlas', type=Path, required=True)
    args = parser.parse_args()
    text = args.atlas.read_text(encoding='utf-8')
    def block(id):
        m = re.search(r'<script\b(?=[^>]*\bid=["\']'+re.escape(id)+r'["\'])[^>]*>(.*?)</script>', text, re.S)
        if not m: raise ValueError(f'Missing {id} JSON')
        return json.loads(m.group(1))
    d, c = block('study-data'), block('county-data')
    featured = list(dict.fromkeys([5527,5524,5951,5725,5499,5497,5938,5490,5488,3789,3962,5600,5918,5689,5481]+d.get('new_featured_fids',[])))
    # Records and source coordinate arrays are kept in full, unchanged.
    subset = {
        'schema_version':1, 'crs':d['crs'], 'provenance':d['provenance'],
        'records':d['records'], 'group_order':d['group_order'],
        'groups':{g:{'id':g,'fids':v['fids'],'center':v['center'],'bounds':v['bounds']} for g,v in d['groups'].items()},
        'corridor_mainlines':d['corridor_mainlines'], 'corridor_bounds':d['corridor_bounds'],
        'featured_fids':featured,
        'visual_provenance':{'input_filename':args.atlas.name,'input_sha256':hashlib.sha256(args.atlas.read_bytes()).hexdigest(),
        'record_count':len(d['records']),'vertices':sum(len(r['source_xy']) for r in d['records']),
        'snapshot':'2025-08-21', 'method':'Every original polyline vertex is retained. Only translation and uniform scaling are used. Grid north stays up. First recorded vertex is the default overlay anchor; no tangent alignment or rotation.'},
    }
    counties={'provenance':c['provenance'],'counties':[{k:v for k,v in x.items() if k in ['id','name','groups','primary_groups','bounds','geometry','label_point']} for x in c['counties']], 'by_group':c['by_group'],'land':c['land'],'full_bounds':c['full_bounds']}
    assert subset['records']==d['records']
    assert len({r['fid'] for r in d['records']})==len(d['records'])
    (ROOT/'source-data.json').write_text(json.dumps(subset,separators=(',',':')),encoding='utf-8')
    (ROOT/'county-display.json').write_text(json.dumps(counties,separators=(',',':')),encoding='utf-8')
    html=(ROOT/'template.html').read_text()
    html=html.replace('/*__CSS__*/',(ROOT/'styles.css').read_text()).replace('/*__JS__*/',(ROOT/'app.js').read_text())
    html=html.replace('__STUDY_DATA__',json.dumps(subset,separators=(',',':')).replace('</','<\\/'))
    html=html.replace('__COUNTY_DATA__',json.dumps(counties,separators=(',',':')).replace('</','<\\/'))
    (ROOT/'GSP_True_Visuals.html').write_text(html,encoding='utf-8')
    print(json.dumps(subset['visual_provenance'],indent=2))

if __name__=='__main__': main()
