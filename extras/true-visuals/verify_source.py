#!/usr/bin/env python3
"""Verify atlas XY coordinates against NJDOT's source ZIP, using the standard library.

Usage:
    python verify_source.py --html GSP_Parkway_County_Refined.html --roads-zip NJ_Roads_shp.zip
Optional: --base-html 'GSP_North_172_to_154_Study (4).html' --output verification.json
This checks source geometry and preservation, not road signage or traffic permissions.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import re
import struct
import sys
import zipfile


def read_study(path: Path) -> tuple[str, dict]:
    text = path.read_text(encoding='utf-8')
    match = re.search(r'<script\b(?=[^>]*\bid=["\']study-data["\'])[^>]*>(.*?)</script>', text, re.S)
    if not match:
        raise ValueError(f'{path}: no study-data JSON script found')
    return text, json.loads(match.group(1))


def verify(html: Path, archive: Path, base: Path | None = None) -> dict:
    text, data = read_study(html)
    archive_hash = hashlib.sha256(archive.read_bytes()).hexdigest()
    expected_hash = data['provenance']['official_source_zip_sha256']
    if archive_hash != expected_hash:
        raise ValueError('Archive checksum differs from the atlas source snapshot. Use the original uploaded ZIP.')
    with zipfile.ZipFile(archive) as z:
        def member(suffix: str) -> bytes:
            names = [n for n in z.namelist() if n.lower().endswith('/nj_roads' + suffix) or n.lower() == 'nj_roads' + suffix]
            if len(names) != 1:
                raise ValueError(f'Expected one NJ_Roads{suffix}; found {names}')
            return z.read(names[0])
        shp, shx, dbf = member('.shp'), member('.shx'), member('.dbf')
    record_count = struct.unpack_from('<I', dbf, 4)[0]
    header_len, row_len = struct.unpack_from('<HH', dbf, 8)
    fields, offset = {}, 1
    for p in range(32, header_len - 1, 32):
        if dbf[p] == 13:
            break
        name = dbf[p:p+11].split(b'\x00')[0].decode('ascii')
        length = dbf[p+16]
        fields[name] = (offset, length)
        offset += length
    sri_offset, sri_length = fields['SRI']
    checked, vertices = 0, 0
    seen = set()
    for r in data['records']:
        key = int(r['fid'])
        fid = int(r.get('source_fid',key))
        if key in seen or not 0 <= fid < record_count:
            raise ValueError(f'Duplicate selection key {key} or out-of-range source FID {fid}')
        seen.add(key)
        row = header_len + fid * row_len
        sri = dbf[row+sri_offset:row+sri_offset+sri_length].decode('ascii').strip()
        if sri != r['sri']:
            raise ValueError(f'FID {fid}: SRI differs ({sri} vs {r["sri"]})')
        word_offset = struct.unpack_from('>i', shx, 100 + fid * 8)[0]
        start = word_offset * 2 + 8
        shape_type = struct.unpack_from('<i', shp, start)[0]
        if shape_type not in (3, 13, 23):
            raise ValueError(f'FID {fid}: unsupported shape type {shape_type}')
        parts, points = struct.unpack_from('<ii', shp, start+36)
        if parts != 1:
            raise ValueError(f'FID {fid}: expected a single-part source branch')
        xy_start = start + 44 + parts * 4
        xy = [list(struct.unpack_from('<dd', shp, xy_start+i*16)) for i in range(points)]
        if r.get('source_vertex_range'):
            q=r['source_vertex_range']
            if q['total_source_vertices'] != points or q['index_base'] != 0:
                raise ValueError(f'FID {fid}: inconsistent source index range')
            xy=xy[q['start']:q['end_inclusive']+1]
        if xy != r['source_xy'] or len(xy) != r['vertex_count']:
            raise ValueError(f'FID {fid}: coordinates or vertex count differ')
        checked += 1
        vertices += len(xy)
    result = {
        'records_checked': checked, 'vertices_checked': vertices, 'unique_source_fids':len(set(r.get('source_fid',r['fid']) for r in data['records'])),
        'all_xy_exact': True, 'complete_feature_count': sum(not r.get('source_vertex_range') for r in data['records']), 'contiguous_excerpt_count': sum(bool(r.get('source_vertex_range')) for r in data['records']), 'all_sri_identifiers_match': True,
        'source_zip_sha256': archive_hash,
        'scope': 'Exact source-coordinate comparison, not current-condition or sign verification.'
    }
    if base:
        base_text, base_data = read_study(base)
        by_fid = {r['fid']: r for r in data['records']}
        original_records = all(by_fid.get(r['fid']) == r for r in base_data['records'])
        original_groups = all(data['groups'].get(k) == v for k, v in base_data['groups'].items())
        contexts=all(data['context_by_fid'].get(k)==v for k,v in base_data['context_by_fid'].items())
        if not (original_records and original_groups and contexts):
            raise ValueError('Base records, branch contexts or group contexts changed.')
        result.update(original_records_preserved=len(base_data['records']),
                      original_group_contexts_preserved=len(base_data['groups']),
                      original_branch_contexts_preserved=len(base_data['context_by_fid']))
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--html', type=Path, required=True)
    parser.add_argument('--roads-zip', type=Path, required=True)
    parser.add_argument('--base-html', type=Path)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    try:
        result = verify(args.html, args.roads_zip, args.base_html)
    except (OSError, ValueError, KeyError, struct.error, zipfile.BadZipFile) as exc:
        print(f'VERIFICATION FAILED: {exc}', file=sys.stderr)
        return 1
    report = json.dumps(result, indent=2)
    print(report)
    if args.output:
        args.output.write_text(report + '\n', encoding='utf-8')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
