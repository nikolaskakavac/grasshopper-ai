#!/usr/bin/env python3
"""
Custom HTTP Server za Grasshopper AI
Omogućava serviranje .env.local fajla za security konfiguraciju
"""

import http.server
import socketserver
import os
from pathlib import Path

PORT = 8000

class CustomHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Dozvoli .env fajlove da se servira
        if self.path.endswith('.env.local') or self.path.endswith('.env'):
            self.send_header('Content-Type', 'text/plain')
        super().end_headers()
    
    def do_GET(self):
        # Dozvoli .env fajlove
        if self.path == '/.env.local' or self.path == '.env.local':
            self.path = '/.env.local'
        super().do_GET()

if __name__ == '__main__':
    os.chdir(os.path.dirname(__file__))
    with socketserver.TCPServer(("", PORT), CustomHTTPHandler) as httpd:
        print(f"✅ Server je pokrenut na http://localhost:{PORT}")
        print(f"📁 Serviraj sa foldera: {os.getcwd()}")
        httpd.serve_forever()
