# BREVO E-Mail Setup für Bau-Structura

## Erfolgreiche Konfiguration ✅

Das BREVO E-Mail-System ist vollständig funktionsfähig und getestet.

### Aktuelle Konfiguration

**SMTP-Einstellungen:**
- Host: `smtp-relay.brevo.com`
- Port: `587` (TLS)
- User: `8ae20a001@smtp-brevo.com` (BREVO SMTP Login)
- Pass: `[90-Zeichen SMTP Key]` (BREVO SMTP Schlüssel)
- Absender: `support@bau-structura.de`

**Test-Ergebnis:**
- ✅ Test-E-Mail erfolgreich an lea.zimmer@gmx.net gesendet
- ✅ Message ID: f3145132-cc8b-0552-bb84-d472125aafe3@bau-structura.de
- ✅ SMTP-Verbindung funktioniert einwandfrei

### Funktionale E-Mail-Features

1. **Hochwasserschutz-Checklisten Export**
   - PDF-Berichte per E-Mail
   - Strukturierte HTML-E-Mails
   - Automatischer Versand

2. **Support-Ticket-System**
   - Ticket-Erstellung Benachrichtigungen
   - Status-Update E-Mails
   - Admin-Benachrichtigungen

3. **Willkommens-E-Mails**
   - Neue Benutzer-Begrüßung
   - Temporäre Passwort-Übermittlung
   - Rollenbezogene Inhalte

4. **Admin-Tests**
   - BREVO-Verbindung testen Button
   - Live-E-Mail-Versand-Tests
   - Debugging-Funktionen

### BREVO-Konto Setup

**Schritt 1: BREVO-Konto erstellen**
1. Registrierung auf brevo.com
2. E-Mail-Verifizierung
3. Konto-Aktivierung

**Schritt 2: SMTP-Credentials generieren**
1. Anmelden bei BREVO
2. Navigieren zu "SMTP & API"
3. SMTP-Tab auswählen
4. "Generate a new SMTP key" klicken
5. Schlüssel benennen und generieren
6. SMTP Login und SMTP Key kopieren

**Schritt 3: Replit Secrets konfigurieren**
1. SMTP_HOST: `smtp-relay.brevo.com`
2. SMTP_USER: `[BREVO SMTP Login]`
3. SMTP_PASS: `[BREVO SMTP Key]`

### Fehlerbehebung

**Häufige Probleme:**

1. **"Authentication failed"**
   - Prüfen Sie SMTP Login vs. normale E-Mail-Adresse
   - Verwenden Sie SMTP Key, nicht Master-Passwort
   - Regenerieren Sie SMTP Key bei Bedarf

2. **"Connection timeout"**
   - Prüfen Sie Firewall-Einstellungen
   - Verwenden Sie Port 587 (TLS)
   - Testen Sie alternative Ports (465, 2525)

3. **"Invalid sender"**
   - Verifizieren Sie Absender-Domain
   - Konfigurieren Sie SPF/DKIM-Records
   - Prüfen Sie Domain-Authentifizierung

### Monitoring

**Admin-Panel Überwachung:**
- E-Mail-Versand-Logs in Browser-Konsole
- BREVO-Test-Button für Live-Tests
- Fehler-Meldungen in der Anwendung

**BREVO-Dashboard:**
- Versand-Statistiken
- Bounce-Rate Überwachung
- Spam-Report Analyse
- Tägliche Limits prüfen

### Sicherheit

**Best Practices:**
- SMTP Keys regelmäßig rotieren
- Separate Keys für verschiedene Anwendungen
- Nicht verwendete Keys deaktivieren
- Logs auf verdächtige Aktivitäten überwachen

**Domain-Sicherheit:**
- SPF-Record für bau-structura.de
- DKIM-Signatur aktivieren
- DMARC-Policy implementieren

## Wartung

**Regelmäßige Aufgaben:**
- Monatliche SMTP-Verbindungstests
- Prüfung der E-Mail-Zustellbarkeit
- Überwachung der Versand-Limits
- Backup der SMTP-Konfiguration

**Bei Problemen:**
1. Admin-Panel → "BREVO-Verbindung testen"
2. Browser-Konsole auf Fehler prüfen
3. BREVO-Dashboard für Limits prüfen
4. Neue SMTP Keys generieren falls nötig

---

*Letzte Aktualisierung: 8. Juli 2025*
*Status: Produktiv und getestet*