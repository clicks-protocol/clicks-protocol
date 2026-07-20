# Referrer V2 Implementation Plan

**Datum:** 2026-07-13
**Status:** Build Plan
**Ziel:** Die Referrer-v2-Spec in eine konkrete Umsetzungsreihenfolge fuer Contracts, SDK, MCP und ACP uebersetzen.

---

## Kurzfassung

Referrer v2 wird **nicht** als stiller Parameter in `quickStart()` gebaut.

Die Reihenfolge ist:

1. Contract-Surface fuer explizite Attribution finalisieren
2. SDK um echten Referral-Write-Flow erweitern
3. MCP auf denselben Flow ziehen
4. ACP-Service nur auf den echten Flow heben
5. Erst danach Combined Wrapper `quickStartWithReferral()` freigeben

---

## Ist-Befund

### Stimmt

- `contracts/ClicksReferral.sol` hat bereits einen Referral-Kern:
  - one-time attribution
  - self-referral block
  - circular guard bis 3 Ebenen
- `sdk/src/client.ts` trennt Treasury-Setup technisch bereits implizit vom Referral, weil `quickStart()` nur Register, Approve und Payment-Split macht
- `mcp-server/src/index.ts` hat bereits Referral-Read-Surface mit `clicks_get_referral_stats`

### Stimmt nicht

- `sdk.quickStart(..., referrer)` setzt **keine** Onchain-Attribution
- `ClicksReferral.registerReferral()` ist wegen `onlyAuthorized` **nicht** self-serve, obwohl der Kommentar das andeutet
- MCP `clicks_quick_start` nimmt `referrer` noch an, nutzt ihn aber nicht
- SDK exportiert noch keinen Referral-ABI und keinen dedizierten Referral-Write-Flow

### Gefaehrlich

- Wenn wir jetzt wieder aggressiv Referral pitchen, bevor Write-Flow und Zustimmung sauber sitzen, bauen wir denselben Drift erneut
- Ein stiller Service-Call ohne belegbare Agent-Zustimmung macht das Modell spaeter schwer auditierbar

---

## Build-Reihenfolge

## Phase 1. Contract Truth

### Ziel

Expliziter, auditierbarer Attribution-Write-Flow mit nachweisbarer Zustimmung.

### Dateien

- `projects/clicks-protocol/contracts/ClicksReferral.sol`
- optional Tests unter `projects/clicks-protocol/test/` oder bestehendem Contract-Testpfad

### Konkrete Aenderungen

1. Kommentar von `registerReferral(address newAgent, address referrer)` auf Realitaet ziehen
2. Signaturbasierten Flow hinzufuegen:
   - bevorzugt `registerReferralWithSig(address newAgent, address referrer, uint256 deadline, bytes signature)`
3. Signatur-Regeln definieren:
   - signer = Agent oder Operator
   - domain separator / typed data festlegen
   - deadline erzwingen
   - nonce oder one-time gate gegen Replay
4. Optionales Setup-Fenster entscheiden:
   - keine Frist
   - oder z.B. nur innerhalb von X Stunden/Tagen nach Registrierung
5. Events pruefen:
   - vorhandenes `AgentReferred` reicht evtl.
   - optional Event fuer signaturbasierten Pfad

### Offene Produktentscheidung

- Wer signiert?
  - **Agent selbst** = staerkste Attribution
  - **Operator** = praktischer fuer heutiges Setup

### Definition of Done

- Referral kann einmalig gesetzt werden
- Self-referral und Kreise bleiben blockiert
- Replay ueber dieselbe Signatur funktioniert nicht
- Autorisierter Caller kann Attribution nur mit gueltiger Zustimmung setzen

---

## Phase 2. SDK Surface

### Ziel

Der SDK-Write-Flow spricht dieselbe Wahrheit wie der Contract.

### Dateien

- `projects/clicks-protocol/sdk/src/abis.ts`
- `projects/clicks-protocol/sdk/src/types.ts`
- `projects/clicks-protocol/sdk/src/client.ts`
- `projects/clicks-protocol/sdk/src/index.ts`

### Konkrete Aenderungen

1. `REFERRAL_ABI` in `sdk/src/abis.ts` aufnehmen
2. Referral-Contract in `ClicksClient` instanziieren
3. Neue SDK-Methoden einfuehren:
   - `registerReferral(agentAddress, referrerAddress)`
   - bevorzugt `registerReferralWithSig(agentAddress, referrerAddress, deadline, signature)`
   - spaeter `quickStartWithReferral(...)`
4. Ergebnis-Typen ergaenzen:
   - `ReferralRegistrationResult`
   - `QuickStartWithReferralResult`
5. `quickStart()` Signatur bereinigen:
   - `referrer?` entfernen **oder** deprecated markieren und intern ignoriert lassen bis Major Release

### Empfohlene Route

- kurzfristig: `referrer?` als deprecated markieren, um keine harten Consumer-Breaks zu erzwingen
- mittelfristig: in naechstem sauberen Release aus `quickStart()` entfernen

### Definition of Done

- SDK hat einen echten Referral-Write-Pfad
- `quickStart()` bleibt treasury-only
- Combined Wrapper liefert Treasury- und Referral-Ergebnis getrennt zurueck

---

## Phase 3. MCP Surface

### Ziel

MCP darf Referral nicht laenger implizit ueber `clicks_quick_start` andeuten.

### Dateien

- `projects/clicks-protocol/mcp-server/src/index.ts`

### Konkrete Aenderungen

1. `clicks_quick_start` Input bereinigen:
   - `referrer` entfernen oder klar als reserved/deprecated behandeln
2. Neues Write-Tool einfuehren:
   - `clicks_register_referral`
   - spaeter optional `clicks_quick_start_with_referral`
3. Tool-Descriptions auf ehrlichen Stand ziehen
4. `clicks_explain` Beispiele und Tool-Liste aktualisieren
5. Falls MCP signaturbasierten Flow ausloest:
   - Signatur als Input akzeptieren
   - oder Signatur-Vorbereitung in eigenen Helper auslagern

### Definition of Done

- MCP-User koennen Treasury und Attribution getrennt ausfuehren
- Keine Tool-Beschreibung behauptet stillen Referral-Setup mehr

---

## Phase 4. ACP Service

### Ziel

Der ACP-Service wird erst dann wieder Growth-Onboarding, wenn der Referral-Flow echt ist.

### Dateien

- `projects/clicks-protocol/acp-service/service.ts`

### Konkrete Aenderungen

1. Neuen Modus einfuehren:
   - `treasury_setup`
   - `treasury_setup_with_referral`
2. Im Referral-Modus:
   - Zustimmung explizit einholen
   - danach SDK-Referral-Methode aufrufen
3. Deliverable-Text differenzieren:
   - Treasury erfolgreich
   - Referral erfolgreich
   - beide tx hashes getrennt
4. Kein Referral-Claim im Erfolgstext, wenn nur Treasury lief

### Definition of Done

- ACP kann facilitated onboarding ehrlich abbilden
- Erfolgstexte sind trennscharf zwischen Treasury und Attribution

---

## Phase 5. Public Surface und Release

### Ziel

Erst wenn Contract, SDK, MCP und ACP sitzen, wird die Story wieder offensiv.

### Dateien

- `projects/clicks-protocol/README.md`
- `projects/clicks-protocol/docs/x402-integration/README.md`
- `projects/clicks-protocol/clawhub-skill/SKILL.md`
- `projects/clicks-protocol/skills/clicks-protocol/SKILL.md`
- `projects/clicks-protocol/agent-skill/SKILL.md`
- relevante Landing-Docs unter `projects/clicks-protocol/landing-v3/`

### Konkrete Aenderungen

1. Referral-Claims wieder aktivieren, aber nur entlang des echten Flows
2. Beispielcode auf `registerReferral...()` oder `quickStartWithReferral()` umstellen
3. MCP- und ACP-Beispiele angleichen
4. Falls ClawHub live aktualisiert wird: Version und Claim-Surface gemeinsam ziehen

### Definition of Done

- Oeffentliche Story und technische Surface sind deckungsgleich

---

## Datei-Reihenfolge fuer die Umsetzung

1. `contracts/ClicksReferral.sol`
2. Contract-Tests fuer Referral-v2-Pfad
3. `sdk/src/abis.ts`
4. `sdk/src/types.ts`
5. `sdk/src/client.ts`
6. `sdk/src/index.ts`
7. SDK-Tests oder Beispiel-Integration
8. `mcp-server/src/index.ts`
9. `acp-service/service.ts`
10. Public Docs und Skills

---

## Was ich zuerst bauen wuerde

Wenn wir morgen direkt implementieren, ist meine empfohlene Reihenfolge:

1. `registerReferralWithSig(...)` im Contract
2. SDK `registerReferralWithSig(...)`
3. MCP `clicks_register_referral`
4. erst danach `quickStartWithReferral(...)`

Der Grund:
- Das ist die kleinste ehrliche Scheibe
- Sie traegt den echten Growth-Kern
- Sie loest die aktuelle Produktluecke ohne erneut Magie vorzutäuschen

---

## Nicht jetzt bauen

- kein automatisches Umschreiben bestehender Attribution
- kein stiller Fallback auf `referrer` in `quickStart()`
- kein MLM-Framing in Public Copy
- keine neue aggressive Referral-Kommunikation vor funktionierendem Write-Flow

---

## Entscheidungspunkte fuer David

1. Soll **Agent** oder **Operator** die Zustimmung signieren?
2. Wollt ihr ein hartes Setup-Fenster fuer Attribution?
3. Soll `quickStart(referrer?)` kurzfristig deprecated bleiben oder direkt API-clean gebrochen werden?

Meine Meinung:
- **Operator-Signatur zuerst**, weil sie zur heutigen Registry-Realitaet passt
- **kein hartes Setup-Fenster in V1 der Reparatur**, um Adoption nicht zu blockieren
- **`referrer?` deprecated lassen**, nicht sofort brechen
