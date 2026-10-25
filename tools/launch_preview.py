"""One-click desktop convenience only; production is a client-side static app."""
from pathlib import Path
from http.server import ThreadingHTTPServer
import urllib.request,webbrowser
from serve_preview import Handler
root=Path(__file__).resolve().parents[1]
url='http://127.0.0.1:8897/index.html'
try:
    with urllib.request.urlopen(url,timeout=1) as response:existing='MagicLore' in response.read(65536).decode('utf-8',errors='ignore')
except Exception:existing=False
if existing:
    webbrowser.open(url)
    print('MagicLore is already running: '+url)
else:
    try:server=ThreadingHTTPServer(('127.0.0.1',8897),lambda *a,**kw:Handler(*a,directory=str(root),**kw))
    except OSError:raise SystemExit('Port 8897 is in use. Close the other program, or run tools/serve_preview.py --port 8898.')
    webbrowser.open(url)
    print('MagicLore: '+url+'\nKeep this window open. Press Ctrl+C to stop.')
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close()
