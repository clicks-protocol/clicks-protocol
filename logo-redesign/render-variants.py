#!/usr/bin/env python3
"""Render 4 logo variants as PNG with dark background."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

VARIANTS = [
    ("01-perpetual-circuit", "Perpetual Circuit"),
    ("02-compound-lock", "Compound Lock"),
    ("03-autonomous-pulse", "Autonomous Pulse"),
    ("04-quantum-node", "Quantum Node"),
]

HTML_TEMPLATE = """<!DOCTYPE html>
<html><head><style>
body {{ margin: 0; background: #0F0814; display: flex; align-items: center; justify-content: center; width: 600px; height: 600px; }}
img {{ width: 400px; height: 400px; }}
</style></head>
<body><img src="variants/{filename}.svg"/></body></html>"""

async def main():
    base = Path(__file__).parent
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for fname, label in VARIANTS:
            html = HTML_TEMPLATE.format(filename=fname)
            html_path = base / f"_tmp_{fname}.html"
            html_path.write_text(html)
            page = await browser.new_page(viewport={"width": 600, "height": 600})
            await page.goto(f"file://{html_path}")
            await page.wait_for_timeout(500)
            out = base / f"variants/{fname}.png"
            await page.screenshot(path=str(out))
            await page.close()
            html_path.unlink()
            print(f"✅ {label}: {out}")
        await browser.close()

asyncio.run(main())
