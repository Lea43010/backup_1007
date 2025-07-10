# Deployment-Problem: Domain zeigt Strato-Placeholder

## Aktueller Status
- `www.bau-structura.de` zeigt Strato-Placeholder ("Domain wurde soeben freigeschaltet")
- `bau-structura.com` wird von Microsoft Defender blockiert
- Replit-Deployment läuft auf `baustructura.replit.app`

## Problem-Diagnose
Die Domain `www.bau-structura.de` ist bei Strato registriert, aber:
1. **DNS-Einstellungen** zeigen noch auf Strato-Server statt Replit
2. **Replit Custom Domain** ist möglicherweise nicht korrekt verknüpft
3. **DNS-Propagation** ist noch nicht abgeschlossen

## Sofortige Lösung

### 1. Replit-URL verwenden (Funktioniert sofort)
```
https://baustructura.replit.app
```
- Vollständige Bau-Structura-Anwendung
- Alle Sicherheitsfeatures aktiv
- Sofortiger Zugriff ohne Domain-Probleme

### 2. DNS-Einstellungen bei Strato korrigieren

**Strato-Dashboard Konfiguration:**
```
Domain: www.bau-structura.de
A-Record: 34.111.179.208 (Replit IP)
CNAME: www → bau-structura.de
TXT: replit-verify=<verification-token>
```

**TTL-Einstellungen:**
- A-Record TTL: 300 (5 Minuten)
- CNAME TTL: 300 (5 Minuten)

### 3. Replit Custom Domain Verifikation

**Replit Deployments → Custom Domains:**
1. Domain hinzufügen: `www.bau-structura.de`
2. DNS-Verifikation abwarten
3. SSL-Zertifikat automatisch erstellen lassen

## Deployment-Status Übersicht

| Domain | Status | Problem | Lösung |
|--------|---------|---------|---------|
| `baustructura.replit.app` | ✅ Funktioniert | Keine | Standard-URL |
| `www.bau-structura.de` | ❌ Strato-Placeholder | DNS | Strato-DNS korrigieren |
| `bau-structura.com` | ❌ SmartScreen-Block | Microsoft | Whitelist-Antrag |

## Technische Details

### Korrekte DNS-Konfiguration
```bash
# A-Record (IPv4)
www.bau-structura.de. 300 IN A 34.111.179.208
bau-structura.de. 300 IN A 34.111.179.208

# TXT-Record (Verification)
_replit-verify.bau-structura.de. 300 IN TXT "replit-verify=<token>"

# Optional: Redirect
bau-structura.de. 300 IN CNAME www.bau-structura.de.
```

### SSL/TLS Status
- Replit generiert automatisch Let's Encrypt-Zertifikate
- Nach DNS-Verifikation verfügbar
- HSTS-Header bereits konfiguriert

## Workaround für sofortigen Zugriff

### Option 1: Replit-URL (Empfohlen)
```
https://baustructura.replit.app
```

### Option 2: Hosts-Datei (Entwicklung)
```bash
# Windows: C:\Windows\System32\drivers\etc\hosts
# Linux/Mac: /etc/hosts
34.111.179.208 www.bau-structura.de
34.111.179.208 bau-structura.de
```

## Zeitplan für Lösung

| Schritt | Zeitrahmen | Aktion |
|---------|------------|---------|
| Sofort | 0 min | Replit-URL nutzen |
| DNS-Fix | 1-24h | Strato-Einstellungen korrigieren |
| Propagation | 24-48h | DNS weltweit verfügbar |
| SSL-Cert | Nach DNS | Automatisch durch Replit |

## Status-Updates
- **2025-07-09 08:00**: Problem identifiziert
- **Nächste Schritte**: Strato-DNS-Einstellungen überprüfen
- **Empfehlung**: Replit-URL für sofortigen Zugriff nutzen

---
**Wichtig**: Die Anwendung läuft perfekt auf Replit - nur die Domain-Verknüpfung muss korrigiert werden.