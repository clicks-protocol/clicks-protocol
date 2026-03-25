# awesome-x402 PR Instructions

## Schritte für David (Copy-Paste Ready)

### 1. Fork erstellen
Geh auf: https://github.com/xpaysh/awesome-x402

Klick oben rechts auf den **Fork** Button.

### 2. README.md editieren
In deinem Fork:
- Geh auf `README.md`
- Klick auf den Stift-Icon (Edit)

### 3. Zeile einfügen
Füge diese Zeile in die **Payment Protocols / Services** Section ein (alphabetisch nach "BitAgent.AI"):

```markdown
- [**Clicks Protocol**](https://clicksprotocol.xyz) — On-chain yield layer for AI agents on Base. Split deposits: 80% liquid, 20% auto-routed to Morpho/Aave. Auto-APY optimization + protocol fee on yield only.
```

**Position:**
Nach der Zeile mit "BitAgent.AI" und vor "CDP by Coinbase".

### 4. Commit Message
```
Add Clicks Protocol to Payment Protocols
```

### 5. PR erstellen
- Klick auf **Commit changes** → **Propose changes**
- GitHub leitet dich automatisch zur PR-Erstellung weiter

### 6. PR Title & Description

**Title:**
```
Add Clicks Protocol (on-chain yield for AI agents)
```

**Description:**
```markdown
## Adding Clicks Protocol

**What it is:**
Clicks Protocol is an on-chain yield layer for AI agents on Base. When an agent deposits USDC, the protocol automatically splits it: 80% stays liquid for instant spending, 20% earns yield through Morpho/Aave.

**Why it belongs in awesome-x402:**
- **Base-first** — Clicks runs on Base (eip155:8453), one of the 3 production mainnet chains in the CDP Facilitator
- **x402-compatible** — Uses USDC via EIP-3009 (gasless authorization) with the `exact` payment scheme
- **CDP Facilitator native** — No custom facilitator needed, leverages the official CDP infrastructure
- **Agent-native payment rail** — `receivePayment()` and `quickStart()` work seamlessly with x402 payment flows

**Category:** Payment Protocols / Services (alphabetically placed after BitAgent.AI)

**Links:**
- Website: https://clicksprotocol.xyz
- Docs: https://clicksprotocol.xyz/docs
- SDK: https://www.npmjs.com/package/@clicks-protocol/sdk
- GitHub: https://github.com/clicks-protocol

**Verification:**
All contracts verified on Basescan (Base Mainnet).
```

### 7. Submit
Klick auf **Create pull request**.

---

## Double-Check vor Submit

- [ ] Zeile ist alphabetisch korrekt platziert (nach BitAgent.AI, vor CDP)
- [ ] Markdown-Syntax stimmt (Link + Bold + Description)
- [ ] PR Title + Description sind copy-pastet wie oben
- [ ] Fork ist aktuell (falls nicht: Sync Fork Button klicken)

---

Fertig. PR wird dann von xpaysh reviewed.
