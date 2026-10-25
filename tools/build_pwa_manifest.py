"""Generate deployment integrity metadata. Run after changing any shipped asset."""
from pathlib import Path
import hashlib,json,re
root=Path(__file__).resolve().parents[1]
files={p.relative_to(root).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in [*root.glob('*.html'),*root.glob('*.js'),*root.glob('*.css'),*root.glob('assets/home/*.webp'),*root.glob('icons/*'),*root.glob('vendor/*.js')] if p.is_file() and p.name!='sw.js'}
files['src/western/aspectOrbs.js']=hashlib.sha256((root/'src/western/aspectOrbs.js').read_bytes()).hexdigest()
files['manifest.webmanifest']=hashlib.sha256((root/'manifest.webmanifest').read_bytes()).hexdigest()
shared=['chart-context.js','chart-profile.js','person-store.js','notes-store.js','profile-time.js','home-icons.js','home.css','mobile.css','typography.css','module-mobile.css','entry-loader.js','module-mobile.js','module-details.js','profile-store.js','pwa.js','birth-offset-loader.js']
modules={}
for page in ['bazi_web.html','destiny_book_web.html','western_web.html','vedic_web.html']:
    refs=re.findall(r'<(?:script|link)[^>]*(?:src|href)="([^"?#]+)',(root/page).read_text(encoding='utf-8'))
    modules[page]=sorted(set([page,*shared,*[ref for ref in refs if ref in files]]))
modules['destiny_book_web.html']=sorted(set(modules['destiny_book_web.html']+['numerology-mobile.js','numerology-mobile.css']))
modules['bazi_web.html']=sorted(set(modules['bazi_web.html']+['bazi-mobile.js','bazi-mobile.css']))
modules['western_web.html']=sorted(set(modules['western_web.html']+['western-mobile.js','western-mobile.css','src/western/aspectOrbs.js']))
modules['vedic_web.html']=sorted(set(modules['vedic_web.html']+['vedic-mobile.js','vedic-mobile.css','vedic_formal_app.js','vendor/astronomy-engine.min.js','vedic_themes.css','vedic_reading.css','vedic_relations.css','vedic_interpretation.css','vedic_reader.css','vedic_house_fullscreen.css']))
modules['profiles-ui.js']=['profiles-ui.js','person-editor.js','profile-birth-picker.js','profiles.css','person-store.js','profile-store.js','profile-time.js','profile-calendar-loader.js']
(root/'asset-manifest.json').write_text(json.dumps({'version':1,'files':files,'modules':modules},ensure_ascii=False,separators=(',',':')),encoding='utf-8')
