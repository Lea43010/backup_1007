# Deployment Guide für www.bau-structura.de

## Aktueller Status

**Domain**: www.bau-structura.de (bei Strato registriert)
**Problem**: Domain zeigt noch Standard-Strato-Seite
**Lösung**: Replit-Deployment aktivieren

## Deployment-Schritte

### 1. Replit Deployment aktivieren

1. **Deploy Button** in Replit klicken
2. **Autoscale Deployment** auswählen
3. **Custom Domain** konfigurieren: `www.bau-structura.de`
4. **DNS-Verifikation** abwarten

### 2. DNS-Konfiguration prüfen

**Aktuelle DNS-Einstellungen bei Strato:**
- A-Record: `34.111.179.208` (Replit IP)
- TXT-Record: `replit-verify` (Domain-Verifikation)

**Überprüfung:**
```bash
nslookup www.bau-structura.de
# Sollte 34.111.179.208 zurückgeben
```

### 3. Deployment-Konfiguration

**Datei**: `.replit`
```
[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["npm", "run", "start"]
```

**Port-Konfiguration:**
- Internal Port: 5000
- External Port: 80 (HTTP) / 443 (HTTPS)

### 4. Produktions-Build

**Build-Kommando:**
```bash
npm run build
```

**Start-Kommando:**
```bash
npm run start
```

## Warum die Domain noch nicht funktioniert

**Mögliche Gründe:**

1. **DNS-Propagation**: Kann bis zu 48 Stunden dauern
2. **Replit-Deployment**: Noch nicht aktiviert
3. **Domain-Verknüpfung**: Replit hat die Domain noch nicht erkannt
4. **SSL-Zertifikat**: Wird automatisch erstellt, braucht Zeit

## Nächste Schritte

### Sofort:
1. **Deploy Button** in Replit Interface klicken
2. **Custom Domain** `www.bau-structura.de` hinzufügen
3. **Deployment-Status** überwachen

### Warten auf:
- DNS-Propagation (bis zu 48h)
- SSL-Zertifikat-Erstellung
- Replit-Domain-Verifikation

### Nach erfolgreichem Deployment:
- App verfügbar unter https://www.bau-structura.de
- Eigenständiges Login-System aktiv
- Keine Replit-Anmeldung erforderlich
- Admin kann Benutzer erstellen

## System-Bereitschaft

**Features vollständig implementiert:**
- ✅ Eigenständiges Authentifizierungssystem
- ✅ BREVO E-Mail-Integration (support@bau-structura.de)
- ✅ PostgreSQL-Datenbank
- ✅ Hochwasserschutz-Module
- ✅ Admin-Panel mit Benutzerverwaltung
- ✅ Projekt-Management-System
- ✅ Mobile-optimierte PWA

**Produktions-bereit:**
- ✅ Verschlüsselte Passwörter
- ✅ Session-Management
- ✅ Error-Handling
- ✅ E-Mail-Benachrichtigungen
- ✅ Backup-System

## Fehlerbehebung

**Problem**: "This domain is now reserved" (Strato-Seite)
**Lösung**: Replit-Deployment aktivieren

**Problem**: DNS zeigt falsche IP
**Lösung**: DNS-Einstellungen bei Strato prüfen

**Problem**: SSL-Zertifikat fehlt
**Lösung**: Automatisch nach Domain-Verifikation

**Problem**: App lädt nicht
**Lösung**: Build-Prozess prüfen, Logs analysieren

## Kontakt nach Deployment

**Admin-Zugang**: Über lokales Admin-Konto
**Neue Benutzer**: Über Admin-Panel erstellen
**E-Mail-Versand**: Automatisch über BREVO
**Support**: support@bau-structura.de

---

*Stand: 8. Juli 2025*
*System bereit für Produktions-Deployment*