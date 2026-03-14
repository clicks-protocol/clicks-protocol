#!/usr/bin/env python3
"""
ADO Score Calculator — measures how discoverable Clicks Protocol is for AI agents.

Scores README.md on 5 dimensions (0-20 each, total 0-100):
1. Keyword Coverage   — contains terms agents search for
2. Code Example       — has a short, copy-pasteable integration
3. Framework Signals  — references known agent frameworks  
4. Problem Framing    — leads with the problem, not the product
5. Structure Quality  — badges, mermaid, tables, install command

Usage: python ado-test.py [path-to-readme]
"""

import sys
import re
import json
from pathlib import Path
from datetime import datetime

# === SEARCH TERMS agents would use ===
AGENT_SEARCH_TERMS = {
    # High intent (agent actively looking for yield)
    "tier1": [
        "yield", "apy", "usdc", "treasury", "idle balance",
        "passive income", "defi", "earn", "deposit", "withdraw"
    ],
    # Medium intent (agent building financial features)  
    "tier2": [
        "agent wallet", "payment split", "auto compound",
        "base chain", "aave", "morpho", "on-chain",
        "smart contract", "erc20", "protocol"
    ],
    # Discovery terms (how agents find tools)
    "tier3": [
        "sdk", "npm install", "typescript", "middleware",
        "api", "integration", "plugin", "tool", "mcp"
    ]
}

# === FRAMEWORKS agents recognize ===
KNOWN_FRAMEWORKS = [
    "x402", "langchain", "eliza", "crewai", "autogen",
    "phidata", "openclaw", "codex", "openai", "anthropic",
    "coinbase", "base", "ethereum", "solidity"
]

# === PROBLEM-FIRST phrases (good) vs PRODUCT-FIRST phrases (bad) ===
PROBLEM_PHRASES = [
    "idle", "sitting", "earning nothing", "wasted", "opportunity cost",
    "not working", "losing money", "zero yield", "no return",
    "float", "unused", "dormant"
]
PRODUCT_PHRASES = [
    "introducing", "we are", "our platform", "our protocol",
    "welcome to", "proudly", "announcing", "built by"
]


def score_keywords(readme: str) -> tuple[int, list[str]]:
    """Score 0-20: How many agent-relevant search terms appear?"""
    readme_lower = readme.lower()
    found = []
    missing = []
    
    score = 0
    for term in AGENT_SEARCH_TERMS["tier1"]:
        if term in readme_lower:
            score += 1.5
            found.append(f"✅ {term}")
        else:
            missing.append(f"❌ {term}")
    
    for term in AGENT_SEARCH_TERMS["tier2"]:
        if term in readme_lower:
            score += 0.7
            found.append(f"✅ {term}")
        else:
            missing.append(f"❌ {term}")
    
    for term in AGENT_SEARCH_TERMS["tier3"]:
        if term in readme_lower:
            score += 0.5
            found.append(f"✅ {term}")
        else:
            missing.append(f"❌ {term}")
    
    details = found + missing
    return min(20, int(score)), details


def score_code_example(readme: str) -> tuple[int, list[str]]:
    """Score 0-20: Has a short, copy-pasteable code example?"""
    details = []
    score = 0
    
    # Count code blocks
    code_blocks = re.findall(r'```(\w*)\n(.*?)```', readme, re.DOTALL)
    details.append(f"Code blocks found: {len(code_blocks)}")
    
    if not code_blocks:
        details.append("❌ No code blocks at all")
        return 0, details
    
    score += min(6, len(code_blocks) * 2)  # Up to 6 points for having code blocks
    
    # Check for short integration example (< 10 lines)
    has_short_example = False
    for lang, code in code_blocks:
        lines = [l for l in code.strip().split('\n') if l.strip()]
        if 1 <= len(lines) <= 10:
            has_short_example = True
            if lang in ('typescript', 'ts', 'javascript', 'js'):
                score += 4
                details.append(f"✅ Short {lang} example ({len(lines)} lines)")
            elif lang in ('bash', 'sh', 'shell'):
                score += 2
                details.append(f"✅ Shell command ({len(lines)} lines)")
            else:
                score += 2
                details.append(f"✅ Code example ({len(lines)} lines)")
    
    if not has_short_example:
        details.append("❌ No short (< 10 line) example found")
    
    # Check for import/require statement
    if re.search(r'import .* from|require\(', readme):
        score += 3
        details.append("✅ Has import statement")
    else:
        details.append("❌ No import statement")
    
    # Check for npm install
    if 'npm install' in readme or 'npm i ' in readme:
        score += 4
        details.append("✅ Has npm install command")
    else:
        details.append("❌ No npm install command")
    
    # Check for output/result example
    if re.search(r'//.*→|//.*returns|//.*output|# Output', readme):
        score += 3
        details.append("✅ Shows expected output")
    
    return min(20, score), details


def score_frameworks(readme: str) -> tuple[int, list[str]]:
    """Score 0-20: References known frameworks agents work with?"""
    readme_lower = readme.lower()
    details = []
    found = 0
    
    for fw in KNOWN_FRAMEWORKS:
        if fw.lower() in readme_lower:
            found += 1
            details.append(f"✅ {fw}")
        else:
            details.append(f"❌ {fw}")
    
    # Bonus for "Works With" or "Integrations" section
    if re.search(r'(?i)(works with|integrations?|compatible|supported)', readme):
        found += 2
        details.append("✅ Has integrations section")
    
    score = min(20, found * 3)
    return score, details


def score_problem_framing(readme: str) -> tuple[int, list[str]]:
    """Score 0-20: Leads with the problem, not the product?"""
    details = []
    score = 10  # Start neutral
    
    # Check first 500 chars for problem vs product framing
    first_section = readme[:500].lower()
    
    problem_count = sum(1 for p in PROBLEM_PHRASES if p in first_section)
    product_count = sum(1 for p in PRODUCT_PHRASES if p in first_section)
    
    details.append(f"Problem phrases in first 500 chars: {problem_count}")
    details.append(f"Product phrases in first 500 chars: {product_count}")
    
    score += problem_count * 3  # Reward problem framing
    score -= product_count * 4  # Penalize product framing
    
    # Check if first line is a question or problem statement
    first_line = readme.strip().split('\n')[0] if readme.strip() else ""
    if '?' in first_line or any(p in first_line.lower() for p in ['idle', 'waste', 'earn', 'losing']):
        score += 4
        details.append("✅ First line frames the problem")
    
    # Check for comparison table (before/after)
    if re.search(r'(?i)(without|before|after|vs|comparison)', readme):
        score += 3
        details.append("✅ Has comparison/before-after")
    
    # Check for concrete numbers (APY, dollar amounts)
    if re.search(r'\d+%|\$\d+|apy', readme.lower()):
        score += 3
        details.append("✅ Has concrete numbers")
    
    return max(0, min(20, score)), details


def score_structure(readme: str) -> tuple[int, list[str]]:
    """Score 0-20: Has badges, mermaid diagrams, tables, good structure?"""
    details = []
    score = 0
    
    # Badges (shields.io, img.shields.io)
    badge_count = len(re.findall(r'!\[.*?\]\(.*?(?:shields\.io|badge).*?\)', readme))
    if badge_count > 0:
        score += min(4, badge_count * 2)
        details.append(f"✅ {badge_count} badge(s)")
    else:
        details.append("❌ No badges")
    
    # Mermaid diagrams
    if '```mermaid' in readme:
        score += 4
        details.append("✅ Has Mermaid diagram")
    else:
        details.append("❌ No Mermaid diagram")
    
    # Tables
    table_count = len(re.findall(r'\|.*\|.*\|', readme))
    if table_count > 2:
        score += 3
        details.append(f"✅ Has table ({table_count} rows)")
    else:
        details.append("❌ No table")
    
    # Headers (well-structured)
    headers = re.findall(r'^#{1,3} ', readme, re.MULTILINE)
    if len(headers) >= 4:
        score += 3
        details.append(f"✅ Well-structured ({len(headers)} sections)")
    else:
        details.append(f"⚠️ Only {len(headers)} sections")
    
    # README length (not too short, not too long)
    word_count = len(readme.split())
    if 200 <= word_count <= 800:
        score += 3
        details.append(f"✅ Good length ({word_count} words)")
    elif word_count < 200:
        details.append(f"⚠️ Too short ({word_count} words)")
    else:
        details.append(f"⚠️ Too long ({word_count} words)")
    
    # Emoji (agents notice these in descriptions)
    if re.search(r'[⚡🔥💰✅🚀📊]', readme):
        score += 3
        details.append("✅ Has emoji accents")
    
    return min(20, score), details


def run_ado_test(readme_path: str = "README.md") -> dict:
    """Run full ADO test suite and return results."""
    path = Path(readme_path)
    if not path.exists():
        print(f"ERROR: {readme_path} not found")
        sys.exit(1)
    
    readme = path.read_text()
    
    results = {}
    total = 0
    
    # Run all 5 tests
    tests = [
        ("Keyword Coverage", score_keywords),
        ("Code Example", score_code_example),
        ("Framework Signals", score_frameworks),
        ("Problem Framing", score_problem_framing),
        ("Structure Quality", score_structure),
    ]
    
    print("=" * 60)
    print(f"  ADO SCORE — {readme_path}")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    for name, func in tests:
        score, details = func(readme)
        total += score
        results[name] = {"score": score, "max": 20, "details": details}
        
        grade = "🟢" if score >= 15 else "🟡" if score >= 10 else "🔴"
        print(f"\n{grade} {name}: {score}/20")
        for d in details[:5]:  # Show top 5 details
            print(f"   {d}")
        if len(details) > 5:
            print(f"   ... and {len(details) - 5} more")
    
    # Overall
    grade = "🟢" if total >= 80 else "🟡" if total >= 60 else "🔴"
    print(f"\n{'=' * 60}")
    print(f"  {grade} TOTAL ADO SCORE: {total}/100")
    print(f"{'=' * 60}")
    
    if total < 60:
        print("\n  💡 Focus areas:")
        for name, data in results.items():
            if data["score"] < 12:
                print(f"     → {name} ({data['score']}/20)")
    
    # Log to experiments.jsonl
    experiment = {
        "timestamp": datetime.now().isoformat(),
        "total_score": total,
        "scores": {name: data["score"] for name, data in results.items()},
        "readme_words": len(readme.split()),
        "readme_hash": hash(readme) % (10**8),
    }
    
    experiments_path = Path("experiments.jsonl")
    with open(experiments_path, "a") as f:
        f.write(json.dumps(experiment) + "\n")
    
    return {"total": total, "results": results}


if __name__ == "__main__":
    readme_path = sys.argv[1] if len(sys.argv) > 1 else "README.md"
    result = run_ado_test(readme_path)
    sys.exit(0 if result["total"] >= 60 else 1)
