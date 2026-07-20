# Landing Footer Patch — add Claude Skill link

File: `landing-v3/components/footer.tsx`

## Change

In the **Developers** column, insert a new `<li>` between "API Reference" and "GitHub":

```tsx
              <li>
                <a
                  href="https://github.com/clicks-protocol/clicks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Claude Skill
                </a>
              </li>
```

## Exact diff

```diff
               <li>
                 <a
                   href="/docs/api"
                   className="hover:text-foreground transition-colors"
                 >
                   API Reference
                 </a>
               </li>
+              <li>
+                <a
+                  href="https://github.com/clicks-protocol/clicks"
+                  target="_blank"
+                  rel="noopener noreferrer"
+                  className="hover:text-foreground transition-colors"
+                >
+                  Claude Skill
+                </a>
+              </li>
               <li>
                 <a
                   href="https://github.com/clicks-protocol"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="hover:text-foreground transition-colors"
                 >
                   GitHub
                 </a>
               </li>
```

## Irreversibility

- Edit itself: reversible (git).
- Cloudflare deploy: publishes to clicksprotocol.xyz — Hard Rule #6 gating.

## Deploy path (after go)

```bash
cd /Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/landing-v3
npm run build
# then the existing deploy command from DEPLOY.md — confirm with David before running
```
