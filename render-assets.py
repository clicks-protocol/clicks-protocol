#!/usr/bin/env python3
"""Render logo and OG image to PNG using Playwright."""
import os
from playwright.sync_api import sync_playwright

BASE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(BASE, "site")

LOGO_HTML = """<!DOCTYPE html>
<html><head><style>
* { margin:0; padding:0; box-sizing:border-box; }
body { width:512px; height:512px; background:transparent; }
</style></head>
<body>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" fill="none">
  <defs>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00FF9B" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#00CC7D" stop-opacity="0.7"/>
    </linearGradient>
  </defs>
  
  <circle cx="256" cy="256" r="240" fill="#0F0814"/>
  <circle cx="256" cy="256" r="240" fill="none" stroke="#2F0C48" stroke-width="2"/>
  
  <g transform="translate(256,220)">
    <rect x="-80" y="20" width="40" height="70" rx="8" fill="url(#glow)" opacity="0.55"/>
    <rect x="-24" y="-30" width="40" height="120" rx="8" fill="url(#glow)" opacity="0.75"/>
    <rect x="32" y="-90" width="40" height="180" rx="8" fill="url(#glow)"/>
    <circle cx="52" cy="-94" r="6" fill="#00FF9B"/>
  </g>
  
  <text x="256" y="358" text-anchor="middle" 
        font-family="Arial,Helvetica,sans-serif" 
        font-size="56" font-weight="bold" letter-spacing="6" fill="white">
    CLICKS
  </text>
  <text x="256" y="395" text-anchor="middle" 
        font-family="Arial,Helvetica,sans-serif" 
        font-size="20" font-weight="normal" letter-spacing="10" fill="#00FF9B" opacity="0.85">
    PROTOCOL
  </text>
</svg>
</body></html>"""

def render_og_image():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1200, "height": 630})
        page.goto(f"file://{os.path.join(SITE, 'og-image.html')}")
        page.wait_for_timeout(1000)
        page.screenshot(path=os.path.join(SITE, "og-image.png"), type="png")
        print(f"✅ OG image: {os.path.join(SITE, 'og-image.png')}")
        browser.close()

def render_logo():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        
        # Full size logo 512x512
        page = browser.new_page(viewport={"width": 512, "height": 512})
        page.set_content(LOGO_HTML)
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(SITE, "assets", "logo.png"), type="png", omit_background=True)
        print(f"✅ Logo 512px: {os.path.join(SITE, 'assets', 'logo.png')}")
        
        # White bg version for general use
        page2 = browser.new_page(viewport={"width": 512, "height": 512})
        page2.set_content(LOGO_HTML.replace("background:transparent", "background:white"))
        page2.wait_for_timeout(500)
        page2.screenshot(path=os.path.join(SITE, "assets", "logo-white-bg.png"), type="png")
        print(f"✅ Logo white bg: {os.path.join(SITE, 'assets', 'logo-white-bg.png')}")
        
        browser.close()

if __name__ == "__main__":
    render_logo()
    render_og_image()
    print("\n🎉 Done!")
