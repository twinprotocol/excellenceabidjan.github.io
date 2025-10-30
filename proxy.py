#!/usr/bin/env python3
"""
proxy.py

Run in the same folder as index.html, styles.css, app.js

Usage:
  python proxy.py

Open http://localhost:8000 in your browser.
The app will request /proxy?url=<encoded-url> for playlists.
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import sys
import threading
import time

PORT = 8000
TIMEOUT = 20  # seconds for remote requests

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/proxy":
            qs = urllib.parse.parse_qs(parsed.query)
            url = qs.get('url', [''])[0]
            if not url:
                self.send_response(400)
                self.send_header('Content-Type','text/plain; charset=utf-8')
                self.end_headers()
                self.wfile.write(b'Missing url parameter')
                return
            # Security: require http or https
            if not (url.startswith('http://') or url.startswith('https://')):
                self.send_response(400)
                self.send_header('Content-Type','text/plain; charset=utf-8')
                self.end_headers()
                self.wfile.write(b'Invalid url parameter')
                return
            try:
                # open remote URL with timeout
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                    # forward status
                    self.send_response(200)
                    # forward common headers (content-type if present)
                    content_type = r.headers.get('Content-Type', 'application/octet-stream')
                    self.send_header('Content-Type', content_type)
                    # allow CORS for browser fetches
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    # stream response in chunks
                    chunk_size = 64 * 1024
                    while True:
                        chunk = r.read(chunk_size)
                        if not chunk:
                            break
                        self.wfile.write(chunk)
                return
            except Exception as e:
                sys.stderr.write(f"Proxy error fetching {url}: {e}\n")
                self.send_response(502)
                self.send_header('Content-Type','text/plain; charset=utf-8')
                self.end_headers()
                self.wfile.write(b'Failed to fetch remote URL')
                return
        else:
            # serve files (index.html, styles.css, app.js)
            return http.server.SimpleHTTPRequestHandler.do_GET(self)

def run(server_class=http.server.ThreadingHTTPServer, handler_class=ProxyHandler):
    server_address = ('', PORT)
    httpd = server_class(server_address, handler_class)
    sa = httpd.socket.getsockname()
    print(f"Serving HTTP on {sa[0]} port {sa[1]} (http://localhost:{PORT}/) ...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("Shutting down...")
        httpd.shutdown()

if __name__ == '__main__':
    run()
