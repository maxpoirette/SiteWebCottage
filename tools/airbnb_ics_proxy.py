#!/usr/bin/env python3
"""
Small local proxy to fetch an Airbnb .ics and serve it with CORS headers.

Usage:
  python3 tools/airbnb_ics_proxy.py --port 8001

Then call from browser (example):
  http://localhost:8001/airbnb.ics?url=<ENCODED_ICS_URL>

This requires Python 3.6+. No external deps.
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.request, urllib.parse, sys
import argparse


class ProxyHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path != '/airbnb.ics':
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not found')
            return
        q = urllib.parse.parse_qs(parsed.query)
        url = q.get('url', [None])[0]
        if not url:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'Missing url parameter')
            return
        try:
            req = urllib.request.Request(url, headers={ 'User-Agent': 'airbnb-ics-proxy/1.0' })
            with urllib.request.urlopen(req, timeout=15) as res:
                data = res.read()
                self.send_response(200)
                self.send_header('Content-Type', res.headers.get_content_type() or 'text/calendar')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Cache-Control', 'max-age=300')
                self.end_headers()
                self.wfile.write(data)
        except Exception as e:
            self.send_response(502)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            msg = ('Proxy error: %s' % str(e)).encode('utf-8')
            self.wfile.write(msg)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--port', type=int, default=8001)
    args = p.parse_args()
    addr = ('', args.port)
    print('Starting Airbnb ICS proxy on port', args.port)
    HTTPServer(addr, ProxyHandler).serve_forever()


if __name__ == '__main__':
    main()
