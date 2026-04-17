import * as fs from "fs";
import * as path from "path";

/**
 * Publish a markdown file to Dev.to via the v1 Articles API.
 *
 * Usage:
 *   DEVTO_API_KEY=... npx tsx scripts/publish-devto.ts \
 *     --file content/x402-treasury-gap.md \
 *     --title "X402 Solved Payments. Who Solves Treasury?" \
 *     --tags "ai,defi,web3,agents" \
 *     --canonical https://clicksprotocol.xyz/... \
 *     [--draft]
 *
 * Default mode: published. Pass --draft to keep it private.
 */

type Args = {
  file: string;
  title: string;
  tags: string[];
  canonical?: string;
  description?: string;
  draft: boolean;
};

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const file = get("--file") || "";
  const title = get("--title") || "";
  const tagsRaw = get("--tags") || "";
  const canonical = get("--canonical");
  const description = get("--description");
  const draft = argv.includes("--draft");

  if (!file || !title) {
    console.error("Usage: publish-devto.ts --file <md> --title <str> [--tags a,b,c] [--canonical url] [--description str] [--draft]");
    process.exit(1);
  }
  return {
    file,
    title,
    tags: tagsRaw.split(",").map((t) => t.trim()).filter(Boolean),
    canonical,
    description,
    draft,
  };
}

async function main() {
  const args = parseArgs();
  const apiKey = process.env.DEVTO_API_KEY;
  if (!apiKey) {
    console.error("Missing DEVTO_API_KEY");
    process.exit(1);
  }

  const bodyPath = path.resolve(args.file);
  if (!fs.existsSync(bodyPath)) {
    console.error(`File not found: ${bodyPath}`);
    process.exit(1);
  }
  const body_markdown = fs.readFileSync(bodyPath, "utf8");

  const article: Record<string, unknown> = {
    title: args.title,
    published: !args.draft,
    body_markdown,
    tags: args.tags,
  };
  if (args.canonical) article.canonical_url = args.canonical;
  if (args.description) article.description = args.description;

  console.log(`=== Publish to Dev.to ===`);
  console.log(`File:        ${args.file} (${body_markdown.length} chars)`);
  console.log(`Title:       ${args.title}`);
  console.log(`Tags:        ${args.tags.join(", ") || "(none)"}`);
  console.log(`Canonical:   ${args.canonical || "(none)"}`);
  console.log(`Mode:        ${args.draft ? "DRAFT" : "PUBLISHED"}`);
  console.log("");

  const res = await fetch("https://dev.to/api/articles", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      "User-Agent": "clicks-protocol/publish-devto (+https://clicksprotocol.xyz)",
    },
    body: JSON.stringify({ article }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`HTTP ${res.status}`);
    console.error(JSON.stringify(json, null, 2));
    process.exit(1);
  }

  console.log("OK");
  console.log(`id:          ${(json as any).id}`);
  console.log(`slug:        ${(json as any).slug}`);
  console.log(`URL:         ${(json as any).url}`);
  console.log(`canonical:   ${(json as any).canonical_url}`);
  console.log(`published:   ${(json as any).published}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
