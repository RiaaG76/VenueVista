"""
VenueVista - Development SPA Fallback HTTP Server
Serves static assets and maps arbitrary routes directly to index.html
Usage: python dev-server.py [port]
"""

import sys
import os
from http.server import SimpleHTTPRequestHandler, HTTPServer

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class SPAMapHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        # Resolve requested file path
        url_path = self.path.split('?')[0].split('#')[0]
        full_path = self.translate_path(url_path)

        # If file or directory does not exist and it's not a static asset, fallback to /index.html
        if not os.path.exists(full_path):
            ext = os.path.splitext(url_path)[1]
            if not ext or ext not in ['.css', '.js', '.svg', '.jpg', '.jpeg', '.png', '.ico', '.json']:
                self.path = '/index.html'

        return super().do_GET()

def run():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, SPAMapHandler)
    print(f"[VenueVista] SPA Development Server active on http://localhost:{PORT}")
    print(f"[VenueVista] Serving from {BASE_DIR}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[VenueVista] Server stopped.")

if __name__ == '__main__':
    run()
