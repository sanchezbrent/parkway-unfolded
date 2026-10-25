#!/usr/bin/env python3
"""Stage the reader-facing application and media for GitHub Pages."""
from pathlib import Path
import shutil
ROOT=Path(__file__).resolve().parent.parent
DEST=ROOT/'_site'
if DEST.exists():
    shutil.rmtree(DEST)
DEST.mkdir()
shutil.copy2(ROOT/'index.html',DEST/'index.html')
(DEST/'.nojekyll').touch()
for name in ['assets','media']:
    shutil.copytree(ROOT/name,DEST/name,dirs_exist_ok=True)
print('Staged _site/')
