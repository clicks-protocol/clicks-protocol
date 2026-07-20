# Referrer V2 Spec

**Datum:** 2026-07-13
**Status:** Draft
**Ziel:** Das urspruengliche Referrer-Konzept technisch sauber, auditierbar und ehrlich wieder in den Produktkern holen.

---

## Kurzfassung

Der Referrer war nie nur ein Affiliate-Link.

Der Clou von Clicks war:
- Treasury-Setup ist der Eintrittspunkt in den Geldfluss
- Attribution wird genau an diesem Eintrittspunkt gesetzt
- daraus wird ein langfristiger Fee-Stream statt einmaliger Distribution

`Referrer v2` soll genau diesen Mechanismus retten, aber ohne implizite Magie und ohne falsche Claims.

Die neue Regel lautet:

1. `quickStart()` macht Treasury-Setup
2. `registerReferral...()` macht Attribution
3. `quickStartWithReferral()` ist nur ein ehrlicher Wrapper ueber beide Schritte

---

## Warum V2 noetig ist

## Aktueller Bruch

Heute gibt es drei Probleme:

1. `sdk.quickStart(..., referrer)` nimmt zwar einen Referrer an, nutzt ihn aber nicht fuer echte Onchain-Attribution
2. `ClicksReferral.registerReferral()` existiert zwar, ist aber aktuell nicht im SDK- oder MCP-Onboarding sauber als eigener Flow modelliert
3. Der Contract-Kommentar sagt, die Funktion koenne direkt vom Agenten aufgerufen werden, technisch verhindert `onlyAuthorized` das aktuell

Das macht den bestehenden Zustand kommunikativ und produktseitig instabil.

---

## Design-Ziele

`Referrer v2` muss:

- die Growth-Logik erhalten
- explizit statt versteckt sein
- Onchain sauber auditierbar sein
- Missbrauch begrenzen
- fuer SDK, MCP und ACP dieselbe Wahrheit sprechen
- Treasury und Attribution klar trennen

Nicht-Ziele:

- kein MLM-Framing nach außen
- kein stillschweigendes Setzen eines Referrers ohne Zustimmung
- kein Umschreiben von Attribution nachtraeglich

---

## Produktmodell

## Kernobjekte

- **Agent**: die Wallet oder registrierte Agent-Identitaet, deren Treasury ueber Clicks laeuft
- **Operator**: die Wallet, die den Agenten onchain steuert
- **Referrer**: die Adresse, die fuer das Onboarding attribuiert werden soll
- **Facilitator**: ACP-Service, Partner oder anderes Frontend, das einen Agenten durch den Flow fuehrt

## Oekonomischer Kern

- der Agent zahlt keinen Extra-Aufpreis fuer Referral
- die Ausschüttung kommt aus der bestehenden Yield-Fee
- Distribution wird zu einem Fee-Stream
- der Wert sitzt am Setup-Moment, nicht an einem Referral-Link

---

## Gewuenschter User Flow

## Variante A: Self-Serve

1. Operator ruft `quickStart(amount, agentAddress)` auf
2. Operator oder Agent entscheidet bewusst, ob ein Referrer gesetzt werden soll
3. Danach `registerReferral...(...)`

Gut fuer:
- SDK
- Dev Docs
- power users

## Variante B: Facilitated Onboarding

1. ACP-Service oder Partner fuehrt Treasury-Setup aus
2. Agent stimmt der Attribution explizit zu
3. Service ruft `registerReferral...(...)` mit sauberem Nachweis

Gut fuer:
- Partner-Integrationen
- agent onboarding as a service
- distribution funnels

## Variante C: Combined Convenience Flow

1. Nutzer waehlt bewusst einen kombinierten Setup-plus-Attribution-Flow
2. Wrapper ruft intern `quickStart()`
3. Danach `registerReferral...()`
4. Nur wenn beide Schritte erfolgreich sind, gilt der Flow als erfolgreich

Gut fuer:
- UX-Vereinfachung
- MCP tools
- guided onboarding

---

## Gewuenschte API-Oberflaeche

## SDK

### 1. Treasury-only

```ts
quickStart(amount, agentAddress, options?)
```

Semantik:
- registriert Agent falls noetig
- macht Approval falls noetig
- fuehrt ersten Payment-Split aus
- **setzt keinen Referrer**

### 2. Attribution-only

```ts
registerReferral(agentAddress, referrerAddress)
```

oder bevorzugt:

```ts
registerReferralWithSig(agentAddress, referrerAddress, deadline, signature)
```

Semantik:
- setzt einmalig die Attribution
- keine Treasury-Aktion
- eigener tx-hash, eigener Erfolgspfad

### 3. Combined wrapper

```ts
quickStartWithReferral(amount, agentAddress, referrerAddress, proofOrSig, options?)
```

Semantik:
- ruft `quickStart()`
- danach `registerReferral...()`
- liefert beide Teilergebnisse getrennt zurück

Beispiel:

```ts
type QuickStartWithReferralResult = {
  treasury: QuickStartResult;
  referralRegistered: boolean;
  referralTxHash?: string;
};
```

## MCP

Neue Write-Tools:

- `clicks_register_referral`
- optional `clicks_quick_start_with_referral`

Wichtig:
- `clicks_quick_start` darf keinen aktiven Referral-Claim mehr tragen
- Referral muss als separater Schritt oder expliziter Combined Flow auftauchen

## ACP

ACP-Service soll zwei Modusse kennen:

- `treasury_setup`
- `treasury_setup_with_referral`

Der zweite darf nur laufen, wenn der Agent die Attribution explizit akzeptiert.

---

## Contract-Surface

## Was heute schon existiert

In `ClicksReferral.sol` gibt es bereits:

```solidity
function registerReferral(address newAgent, address referrer) external onlyAuthorized
```

und:
- self-referral block
- one-time attribution block (`Already referred`)
- zirkelschutz ueber bis zu 3 Ebenen

Das ist ein guter Kern, aber noch kein sauberer Produktflow.

## Wichtiger Ist-Befund

Der Contract-Kommentar sagt aktuell sinngemaess:
- direkt von Registry oder authorized contract aufrufbar
- auch direkt vom Agenten aufrufbar

Technisch ist das **heute falsch**, weil `onlyAuthorized` gilt.

Das ist zentral fuer `v2`.

## V2-Optionen

### Option 1: Authorized-only beibehalten

Dann braucht ihr:
- Service/SDK/MCP als registrierte autorisierte Caller
- plus Agent-Zustimmung per Signatur

Empfehlung fuer diese Route:

```solidity
function registerReferralWithSig(
    address newAgent,
    address referrer,
    uint256 deadline,
    bytes calldata signature
) external onlyAuthorized
```

Vorteile:
- klare Kontrolle
- gute ACP- und partnerfreundliche Architektur
- kein Wildwuchs

### Option 2: Self-call erlauben

Dann braucht ihr:
- eine direkte self-service Funktion fuer Agent oder Operator

Beispiel:

```solidity
function selfRegisterReferral(address referrer) external
```

oder:

```solidity
function selfRegisterReferral(address agent, address referrer) external
```

mit enger Bindung an Registry/Operator-Regeln.

Vorteile:
- einfacher mentaler Modell fuer Entwickler

Nachteil:
- mehr Oberflaeche fuer Fehler und Spam

## Meine klare Empfehlung

**Option 1.**

Also:
- `onlyAuthorized` beibehalten
- aber einen signaturbasierten Referral-Registrierungsflow einbauen

Das passt am besten zum urspruenglichen Clicks-Clou:
- Setup kann ueber Facilitators laufen
- Attribution bleibt zustimmungspflichtig
- Onchain-Truth bleibt klar

---

## Zustandsregeln

Ein Referrer darf nur gesetzt werden, wenn:

- Agent existiert oder ist mindestens registriert
- Referrer ist nicht `address(0)`, falls ein echter Referrer gesetzt werden soll
- `agent != referrer`
- Agent hat noch keinen Referrer
- kein Kreis im Baum entsteht
- optional: Agent liegt innerhalb eines Setup-Fensters
- optional: Referrer ist selbst registrierter Agent oder erlaubte Referrer-Rolle

## Einmaligkeit

Referrer soll **write-once** sein.

Kein:
- Ueberschreiben
- Rotieren
- stilles Ersetzen

Wenn spaeter mal Migration noetig ist, dann nur ueber gesonderte Admin-/Recovery-Mechanik, nicht ueber den normalen Flow.

---

## Missbrauchsschutz

Mindestens diese Regeln:

1. **No self-referral**
2. **No circular graphs**
3. **Write once**
4. **Explizite Zustimmung**
5. **Optionales Zeitfenster** nach Erstregistrierung oder erstem Treasury-Setup
6. **Keine stillen facilitator-side registrations**

## Zustimmung

Die sauberste Form ist:

- Agent signiert eine Referral-Absicht
- Authorized caller reicht sie ein

Beispielinhalt fuer die Signatur:

- chainId
- referral contract address
- agent address
- referrer address
- deadline
- nonce

Damit vermeidet ihr:
- Replay ueber Chains
- Replay ueber alte Sessions
- stilles Einbrennen fremder Attribution

---

## Empfohlener Minimal-V2

Wenn ihr schnell und sauber wieder ins Laufen kommen wollt:

### Phase 1

- `quickStart()` bleibt treasury-only
- neuen SDK-Call `registerReferral(...)` oder `registerReferralWithSig(...)`
- neue MCP-Funktion `clicks_register_referral`
- ACP-Service trennt `treasury_setup` und `referral_registration`

### Phase 2

- `quickStartWithReferral()` als ehrlicher Wrapper
- neue Docs und neue Combined UX

### Phase 3

- optional invite links / signed onboarding payloads
- Partner-Facilitator Flows

---

## Migration von heute zu V2

## Sofort

- keine falschen `quickStart(..., referrer)` Claims mehr
- Surface-Bereinigung weiterziehen

## Danach

- Contract-Entscheidung treffen:
  - authorized plus signature
  - oder self-call path

## Danach

- SDK-API bauen
- MCP erweitern
- ACP-Service wieder auf Growth-Use-Case trimmen

---

## Offene Designfragen

1. Muss ein Referrer selbst registrierter Agent sein?
2. Duerfen auch Operator-Wallets oder Safe-Adressen Referrer sein?
3. Wollt ihr ein Setup-Fenster, z.B. 24h oder 7 Tage?
4. Soll `quickStartWithReferral()` Teil des Haupt-SDK werden oder nur Helper bleiben?
5. Soll Attribution vor oder nach erstem Deposit gesetzt werden duerfen?

## Meine Antworten Stand heute

1. Ja, bevorzugt registrierter Agent oder erlaubte Referrer-Rolle
2. Ja, aber nur bewusst erlaubte Adressen. Keine implizite Beliebigkeit
3. Ja, ein Fenster ist sinnvoll
4. Ja, aber erst nach sauberem `registerReferral...()`
5. Beides moeglich, aber ideal direkt im Setup-Fenster

---

## Harte Empfehlung

Wenn ihr das wieder stark machen wollt, dann nicht mit noch mehr implizitem Verhalten.

Die richtige Reihenfolge ist:

1. **Referral wieder explizit machen**
2. **Zustimmung beweisbar machen**
3. **Wrapper nur als UX-Sugar bauen**

Dann bleibt der urspruengliche Clou komplett erhalten:

- Distribution sitzt am Treasury-Eintrittspunkt
- Attribution ist onchain
- Fee-Streams sind langfristig
- das Ganze ist technisch und kommunikativ wieder belastbar
