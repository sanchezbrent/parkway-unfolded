#!/usr/bin/env python3
"""Rebuild the offline application from source modules and immutable JSON blocks."""
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parent.parent
DATA={'traffic-data':'traffic-data.json','study-data':'study-data.json','county-data':'county-data.json','toll-data':'GSP_Tolls_2026.json','superlatives-data':'GSP_Superlatives_Data.json'}
MODULES={'toll-module':'toll_module.js','superlatives-module':'superlatives_module.js','unified-controls':'unified_controls.js','editorial-module':'editorial_module.js','toll-styles':'toll_styles.css','unified-styles':'unified_styles.css','editorial-styles':'editorial_styles.css','visual-styles':'visual_styles.css','visual-module':'visual_module.js','adoption-styles':'adoption_styles.css','adoption-module':'adoption_module.js'}

def build():
    html=(ROOT/'source/template.html').read_text(encoding='utf-8')
    for key,name in DATA.items():html=html.replace('@@'+key+'@@',(ROOT/'data'/name).read_text(encoding='utf-8'))
    for key,name in MODULES.items():html=html.replace('@@'+key+'@@',(ROOT/'source'/name).read_text(encoding='utf-8'))
    if re.search(r'@@[\w-]+@@',html):raise ValueError('Unresolved template placeholder')
    (ROOT/'index.html').write_text(html,encoding='utf-8')
    print('Built index.html')

if __name__=='__main__':build()
