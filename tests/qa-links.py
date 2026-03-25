#!/usr/bin/env python3
"""QA Link & Button Tester for Clicks Protocol Website."""

import json
import os
import sys
import time
from datetime import datetime
from urllib.parse import urljoin, urlparse

from playwright.sync_api import sync_playwright, TimeoutError as PwTimeout

BASE_URL = "https://rough-union-c6ca.rechnung-613.workers.dev"
TIMEOUT = 10000  # 10s
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

SUBPAGES = ["/about", "/security", "/whitepaper", "/docs", "/docs/api"]

results = {
    "links": [],       # {text, url, status, result, source}
    "buttons": [],     # {text, action, result, detail}
    "mobile": [],      # {test, result, detail}
    "issues": [],
}

seen_urls = set()


def safe_name(s):
    return "".join(c if c.isalnum() or c in "-_" else "_" for c in s)[:60]


def check_link(page, context, text, href, source="page"):
    """Check a single link by navigation or request."""
    key = (text.strip(), href)
    if key in seen_urls:
        return
    seen_urls.add(key)

    resolved = urljoin(BASE_URL, href) if not href.startswith("http") else href
    parsed = urlparse(resolved)

    # Skip mailto, tel, javascript, anchors-only
    if parsed.scheme in ("mailto", "tel", "javascript", ""):
        if parsed.scheme == "" and not parsed.path and parsed.fragment:
            # anchor-only link like #section
            results["links"].append({"text": text.strip(), "url": href, "status": "-", "result": "⏭️ Anchor", "source": source})
            return
        results["links"].append({"text": text.strip(), "url": href, "status": "-", "result": f"⏭️ {parsed.scheme or 'anchor'}", "source": source})
        return

    # External links: just do a HEAD/GET request
    is_external = parsed.netloc and parsed.netloc not in urlparse(BASE_URL).netloc
    if is_external:
        try:
            resp = page.request.get(resolved, timeout=TIMEOUT)
            status = resp.status
            ok = status < 400
            results["links"].append({
                "text": text.strip(), "url": href, "status": status,
                "result": "✅ OK" if ok else f"❌ {status}",
                "source": source
            })
            if not ok:
                results["issues"].append(f"External link '{text.strip()}' → {href} returned {status}")
        except Exception as e:
            results["links"].append({"text": text.strip(), "url": href, "status": "ERR", "result": f"❌ {str(e)[:60]}", "source": source})
            results["issues"].append(f"External link '{text.strip()}' → {href} error: {str(e)[:80]}")
        return

    # Internal links: navigate
    try:
        new_page = context.new_page()
        new_page.set_default_timeout(TIMEOUT)
        resp = new_page.goto(resolved, wait_until="domcontentloaded", timeout=TIMEOUT)
        status = resp.status if resp else 0
        body = new_page.locator("body").inner_text(timeout=3000)
        empty = len(body.strip()) < 10
        ok = status < 400 and not empty

        if not ok:
            new_page.screenshot(path=os.path.join(SCREENSHOT_DIR, f"fail_{safe_name(text)}_{status}.png"))
            if empty:
                results["issues"].append(f"Internal link '{text.strip()}' → {href} has empty body")
            else:
                results["issues"].append(f"Internal link '{text.strip()}' → {href} returned {status}")

        results["links"].append({
            "text": text.strip(), "url": href, "status": status,
            "result": "✅ OK" if ok else f"❌ {'Empty' if empty else status}",
            "source": source
        })
        new_page.close()
    except Exception as e:
        results["links"].append({"text": text.strip(), "url": href, "status": "ERR", "result": f"❌ {str(e)[:60]}", "source": source})
        results["issues"].append(f"Internal link '{text.strip()}' → {href} error: {str(e)[:80]}")


def collect_and_check_links(page, context, source_label):
    """Collect all <a> tags on current page and check them."""
    links = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('a')).map(a => ({
            text: a.innerText || a.getAttribute('aria-label') || a.getAttribute('title') || '[no text]',
            href: a.getAttribute('href') || ''
        })).filter(l => l.href)
    }""")
    print(f"  Found {len(links)} links on {source_label}")
    for link in links:
        check_link(page, context, link["text"], link["href"], source_label)


def test_buttons(page):
    """Test interactive buttons on the page."""
    # Find all buttons
    buttons = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('button, [role="button"], input[type="submit"]')).map((b, i) => ({
            text: b.innerText || b.getAttribute('aria-label') || b.getAttribute('title') || `[button ${i}]`,
            tag: b.tagName,
            type: b.getAttribute('type') || '',
            id: b.id || '',
            classes: b.className || '',
            disabled: b.disabled,
            idx: i
        }))
    }""")
    print(f"  Found {len(buttons)} buttons")

    for btn in buttons:
        text = btn["text"].strip().replace("\n", " ")[:50]
        if btn["disabled"]:
            results["buttons"].append({"text": text, "action": "disabled", "result": "⏭️ Disabled", "detail": ""})
            continue

        try:
            all_btns = page.locator('button, [role="button"], input[type="submit"]')
            b = all_btns.nth(btn["idx"])
            if not b.is_visible(timeout=2000):
                results["buttons"].append({"text": text, "action": "hidden", "result": "⏭️ Hidden", "detail": ""})
                continue

            # Click and see what happens
            before_url = page.url
            b.click(timeout=3000, force=True)
            page.wait_for_timeout(500)
            after_url = page.url

            if before_url != after_url:
                action = f"navigated → {after_url}"
                page.go_back(timeout=TIMEOUT)
                page.wait_for_load_state("domcontentloaded")
            else:
                action = "click (no navigation)"

            results["buttons"].append({"text": text, "action": action, "result": "✅ OK", "detail": ""})
        except Exception as e:
            err = str(e)[:80]
            results["buttons"].append({"text": text, "action": "click", "result": f"❌ {err}", "detail": ""})
            results["issues"].append(f"Button '{text}' click error: {err}")


def test_mobile(page, context):
    """Test mobile viewport (375px) including hamburger menu."""
    print("\n📱 Mobile Test (375px)...")
    mobile_context = context.browser.new_context(viewport={"width": 375, "height": 812})
    mobile_page = mobile_context.new_page()
    mobile_page.set_default_timeout(TIMEOUT)

    try:
        mobile_page.goto(BASE_URL, wait_until="domcontentloaded", timeout=TIMEOUT)
        mobile_page.wait_for_load_state("networkidle", timeout=TIMEOUT)

        # Check if page loaded
        body = mobile_page.locator("body").inner_text(timeout=3000)
        results["mobile"].append({"test": "Page loads at 375px", "result": "✅ OK" if len(body.strip()) > 10 else "❌ Empty", "detail": ""})

        # Look for hamburger menu button
        hamburger_selectors = [
            'button[aria-label*="menu" i]',
            'button[aria-label*="Menu" i]',
            'button[aria-label*="nav" i]',
            '[class*="hamburger"]',
            '[class*="mobile-menu"]',
            '[class*="menu-toggle"]',
            '[class*="burger"]',
            'button svg',  # common pattern: button with SVG icon
            'header button',
        ]

        hamburger = None
        for sel in hamburger_selectors:
            try:
                loc = mobile_page.locator(sel).first
                if loc.is_visible(timeout=1000):
                    hamburger = loc
                    break
            except:
                continue

        if hamburger:
            results["mobile"].append({"test": "Hamburger menu visible", "result": "✅ OK", "detail": ""})
            try:
                hamburger.click(timeout=3000)
                mobile_page.wait_for_timeout(500)
                mobile_page.screenshot(path=os.path.join(SCREENSHOT_DIR, "mobile_menu_open.png"))

                # Check if menu links are now visible
                nav_links = mobile_page.evaluate("""() => {
                    return Array.from(document.querySelectorAll('nav a, [class*="mobile"] a, [class*="menu"] a')).filter(a => {
                        const rect = a.getBoundingClientRect();
                        return rect.width > 0 && rect.height > 0;
                    }).map(a => ({
                        text: a.innerText || a.getAttribute('aria-label') || '',
                        href: a.getAttribute('href') || ''
                    }))
                }""")

                results["mobile"].append({"test": "Hamburger opens menu", "result": "✅ OK" if len(nav_links) > 0 else "❌ No links visible", "detail": f"{len(nav_links)} links"})

                for link in nav_links:
                    results["mobile"].append({"test": f"Mobile nav: {link['text'][:30]}", "result": "✅ Visible", "detail": link["href"]})

            except Exception as e:
                results["mobile"].append({"test": "Hamburger opens menu", "result": f"❌ {str(e)[:60]}", "detail": ""})
                mobile_page.screenshot(path=os.path.join(SCREENSHOT_DIR, "mobile_menu_fail.png"))
        else:
            results["mobile"].append({"test": "Hamburger menu visible", "result": "❌ Not found", "detail": ""})
            mobile_page.screenshot(path=os.path.join(SCREENSHOT_DIR, "mobile_no_hamburger.png"))
            results["issues"].append("No hamburger menu found at 375px viewport")

        # Check responsive layout
        mobile_page.screenshot(path=os.path.join(SCREENSHOT_DIR, "mobile_homepage.png"), full_page=True)

    except Exception as e:
        results["mobile"].append({"test": "Mobile page load", "result": f"❌ {str(e)[:60]}", "detail": ""})
        results["issues"].append(f"Mobile test failed: {str(e)[:80]}")
    finally:
        mobile_page.close()
        mobile_context.close()


def generate_report():
    """Generate the qa-results.md report."""
    total = len(results["links"])
    passed = sum(1 for l in results["links"] if l["result"].startswith("✅"))
    failed = sum(1 for l in results["links"] if l["result"].startswith("❌"))
    skipped = sum(1 for l in results["links"] if l["result"].startswith("⏭️"))

    lines = [
        "# QA Test Results - Clicks Protocol",
        f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        f"URL: {BASE_URL}",
        "",
        "## Summary",
        f"- Total Links Tested: {total}",
        f"- Passed: {passed}",
        f"- Failed: {failed}",
        f"- Skipped (anchors/mailto/external): {skipped}",
        f"- Buttons Tested: {len(results['buttons'])}",
        f"- Mobile Tests: {len(results['mobile'])}",
        f"- Issues Found: {len(results['issues'])}",
        "",
        "## Link Details",
        "| Source | Link Text | URL | Status | Result |",
        "|--------|-----------|-----|--------|--------|",
    ]

    for l in results["links"]:
        text = l["text"][:40].replace("|", "\\|").replace("\n", " ")
        url = l["url"][:60].replace("|", "\\|")
        lines.append(f"| {l['source']} | {text} | {url} | {l['status']} | {l['result']} |")

    lines += [
        "",
        "## Buttons",
        "| Button | Action | Result |",
        "|--------|--------|--------|",
    ]
    for b in results["buttons"]:
        text = b["text"][:40].replace("|", "\\|").replace("\n", " ")
        action = b["action"][:50].replace("|", "\\|")
        lines.append(f"| {text} | {action} | {b['result']} |")

    lines += [
        "",
        "## Mobile (375px)",
        "| Test | Result | Detail |",
        "|------|--------|--------|",
    ]
    for m in results["mobile"]:
        lines.append(f"| {m['test']} | {m['result']} | {m.get('detail', '')} |")

    lines += ["", "## Issues Found"]
    if results["issues"]:
        for i, issue in enumerate(results["issues"], 1):
            lines.append(f"{i}. {issue}")
    else:
        lines.append("No issues found! 🎉")

    return "\n".join(lines)


def main():
    print(f"🔍 QA Testing: {BASE_URL}")
    print(f"⏱️  Timeout: {TIMEOUT}ms per page\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) QA-Bot/1.0"
        )
        page = context.new_page()
        page.set_default_timeout(TIMEOUT)

        # 1. Homepage
        print("🏠 Testing Homepage...")
        page.goto(BASE_URL, wait_until="domcontentloaded", timeout=TIMEOUT)
        page.wait_for_load_state("networkidle", timeout=TIMEOUT)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "homepage.png"), full_page=True)
        collect_and_check_links(page, context, "Homepage")

        # 2. Test buttons on homepage
        print("\n🔘 Testing Buttons on Homepage...")
        test_buttons(page)

        # 3. Test subpages
        for subpage in SUBPAGES:
            url = BASE_URL + subpage
            print(f"\n📄 Testing {subpage}...")
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=TIMEOUT)
                page.wait_for_load_state("networkidle", timeout=TIMEOUT)
                page.screenshot(path=os.path.join(SCREENSHOT_DIR, f"subpage_{safe_name(subpage)}.png"), full_page=True)
                collect_and_check_links(page, context, f"Subpage {subpage}")
            except Exception as e:
                results["issues"].append(f"Subpage {subpage} failed to load: {str(e)[:80]}")
                print(f"  ❌ Failed: {e}")

        # 4. Mobile tests
        test_mobile(page, context)

        browser.close()

    # Generate report
    report = generate_report()
    report_path = os.path.join(os.path.dirname(__file__), "qa-results.md")
    with open(report_path, "w") as f:
        f.write(report)
    print(f"\n📊 Report saved to: {report_path}")
    print(f"📸 Screenshots in: {SCREENSHOT_DIR}")

    # Print summary
    total = len(results["links"])
    passed = sum(1 for l in results["links"] if l["result"].startswith("✅"))
    failed = sum(1 for l in results["links"] if l["result"].startswith("❌"))
    print(f"\n{'='*50}")
    print(f"Total: {total} | ✅ {passed} | ❌ {failed} | Issues: {len(results['issues'])}")


if __name__ == "__main__":
    main()
