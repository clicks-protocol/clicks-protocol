# Clicks Fix Priority Plan

**Datum:** 2026-07-13
**Basis:** [2026-07-13-core-path-audit.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/reviews/2026-07-13-core-path-audit.md)
**Ziel:** Eine klare Reihenfolge festlegen, welche Widersprueche sofort bereinigt werden muessen, welche danach folgen und was nur Messaging- oder Wording-Arbeit ist.

---

## Kurzurteil

Clicks braucht gerade **keinen Produkt-Pivot**, sondern eine **Truth-Surface-Bereinigung**.

Die Reihenfolge ist:

1. **Falsche technische Claims stoppen**
2. **Docs und Skills auf echten Code ziehen**
3. **Public Positionierung vereinheitlichen**
4. **Erst danach wieder offensiver pushen**

Wenn wir das nicht so machen, bauen wir Reichweite auf Aussagen, die technisch nicht sauber gedeckt sind.

---

## Fix Zuerst

### 1. Referral-Wahrheit geradeziehen

**Warum zuerst:**
- Das ist aktuell der haerteste Bruch zwischen Code und Claim.
- Es betrifft SDK, ACP-Service, Skills, Clawhub und potenziell jede externe Integration.

**Ist-Zustand:**
- `sdk.quickStart(..., referrer)` nimmt einen Referrer an
- der Referrer wird aber nicht fuer echte Referral-Registrierung genutzt

**Betroffene Dateien:**
- [sdk/src/client.ts](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/sdk/src/client.ts)
- [acp-service/service.ts](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/acp-service/service.ts)
- [README.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/README.md)
- [clawhub-skill/SKILL.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/clawhub-skill/SKILL.md)
- [skills/clicks-protocol/SKILL.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/skills/clicks-protocol/SKILL.md)
- [agent-skill/SKILL.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/agent-skill/SKILL.md)

**Empfehlung:**
- **Kurzfristig:** Claim entfernen oder hart abschwaechen, bis die Funktion real ist
- **Nicht zuerst tun:** stillschweigend weiter so lassen

**Prioritaet:** `P0`

### 2. x402-Integrationsdoku auf echten SDK zurueckziehen

**Warum sofort danach:**
- Diese Doku verkauft gerade eine API, die so nicht existiert
- das ist fuer technische Partner direkt schaedlich

**Ist-Zustand:**
- falscher Constructor-Shape
- Methoden dokumentiert, die im aktuellen SDK nicht sichtbar existieren
- teils ueberzogene Aussagen ueber automatische Integration

**Betroffene Datei:**
- [docs/x402-integration/README.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/docs/x402-integration/README.md)

**Empfehlung:**
- Doku auf minimal ehrlichen Stand bringen
- lieber weniger versprechen als eine Wunsch-API dokumentieren

**Prioritaet:** `P0`

### 3. ACP-Service auf Wahrheit statt Story trimmen

**Warum noch in derselben Welle:**
- Der ACP-Service wiederholt den Referral-Claim nicht nur, er baut sein Narrativ darauf

**Ist-Zustand:**
- Referral-Onboarding wird als funktionierender Flow dargestellt
- Kommentar `The Trojan Horse` ist tonal und strategisch unnoetig

**Betroffene Datei:**
- [acp-service/service.ts](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/acp-service/service.ts)

**Empfehlung:**
- Kommentar entfernen
- Service-Description auf echten Leistungsumfang zurueckfuehren

**Prioritaet:** `P0`

---

## Danach Fixen

### 4. README, Skill und Clawhub auf einen gemeinsamen Claim-Stand bringen

**Warum nicht vor den P0-Fixes:**
- Erst muss feststehen, was technisch wahr ist
- dann kann die Public Surface synchronisiert werden

**Zielbild:**
- Clicks = `Agent Commerce Settlement Router`
- Yield = Teilfunktion, nicht Produktidentitaet
- keine Referral-Claims, die im Code nicht gedeckt sind

**Betroffene Flaechen:**
- [README.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/README.md)
- [clawhub-skill/SKILL.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/clawhub-skill/SKILL.md)
- [skills/clicks-protocol/SKILL.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/skills/clicks-protocol/SKILL.md)
- [agent-skill/SKILL.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/agent-skill/SKILL.md)

**Prioritaet:** `P1`

### 5. Testzahlen und Security-Claims zentralisieren

**Warum danach:**
- wichtig fuer Glaubwuerdigkeit
- aber weniger akut als funktional falsche Integrations-Claims

**Aktuelle Drift:**
- `227 tests`
- `58/58 tests`
- `32 dedicated tests`
- verschiedene Security-Formulierungen

**Empfehlung:**
- eine zentrale Verifikationsdatei
- andere Surfaces verweisen nur noch auf diese Datei

**Prioritaet:** `P1`

### 6. Landing und Whitepaper auf die neue Truth Surface feinjustieren

**Warum spaeter:**
- Landing ist schon naeher an der neuen Positionierung als README und Skill
- dort geht es eher um Konsistenz als um akute Falschdarstellung

**Prioritaet:** `P1`

---

## Nur Wording

### 7. Formulierungen schaerfen, aber erst nach Wahrheitsreparatur

Das hier ist wichtig, aber nicht zuerst:
- `post-payment operating system` sauber gegen `settlement router` abgrenzen
- `yield` ueberall als Teil des Treasury-Flows rahmen
- `x402` als Upstream-Ingress und nicht als Rivalen-Spielfeld formulieren

**Prioritaet:** `P2`

### 8. Tonalitaet bereinigen

Darunter faellt:
- interne flapsige Kommentare
- alte DeFi-Marketing-Formulierungen
- zu harte APY- oder automation-first Formulierungen

**Prioritaet:** `P2`

---

## Nicht Jetzt

### 9. Kein neuer Feature-Scope, bevor die Truth Surface sauber ist

Nicht jetzt anfangen mit:
- neuer x402 settlement mode spec im grossen Stil
- weiteren Partner-Pitches
- aggressiverem Clawhub- oder X-Push

**Begruendung:**
- Erst die bestehende Wahrheit stabilisieren
- dann neue Reichweite oder neue Integrationsflaechen oeffnen

---

## Empfohlene Reihenfolge

### Welle 1

- Referral-Claim entschraerfen oder technisch implementieren
- x402-Doku auf echten SDK-Stand ziehen
- ACP-Service-Kommentare und Description bereinigen

### Welle 2

- README aktualisieren
- Skill-Surfaces aktualisieren
- Clawhub-Text angleichen
- Discord-Link im Root-README korrigieren

### Welle 3

- Test- und Security-Claims zentralisieren
- Landing und Whitepaper feinjustieren
- danach erst wieder offensiveres Messaging

---

## Meine harte Empfehlung

**Nicht erst Wording machen.**

Der erste echte Eingriff sollte einer von zwei sein:

1. **ehrlich machen:** Referral-Claim sofort aus allen Surfaces rausziehen
2. **real machen:** Referral-Flow in `quickStart` technisch wirklich einbauen

Wenn wir heute noch nichts implementieren wollen, ist Option 1 die richtige.

Wenn wir kurzfristig Produktsubstanz vor Story priorisieren wollen, ist Option 2 die staerkere, aber aufwendigere Route.
