"""Serve the local site with JavaScript MIME types suitable for service workers."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import argparse

class Handler(SimpleHTTPRequestHandler):
    mount = '/'
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map,
                      '.js': 'application/javascript', '.json': 'application/json',
                      '.webp': 'image/webp', '.css': 'text/css'}

    def do_GET(self):
        if self.mount != '/' and not self.path.split('?',1)[0].startswith(self.mount):
            self.send_error(404)
            return
        super().do_GET()

    def translate_path(self, path):
        if self.mount != '/' and path.startswith(self.mount):
            path = '/' + path[len(self.mount):]
        return super().translate_path(path)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8878)
    parser.add_argument('--mount', default='/', help='For testing GitHub Pages project subpaths')
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    Handler.mount = '/' + args.mount.strip('/') + '/' if args.mount.strip('/') else '/'
    def handler(*a, **kw):
        return Handler(*a, directory=str(root), **kw)
    ThreadingHTTPServer(('127.0.0.1', args.port), handler).serve_forever()
