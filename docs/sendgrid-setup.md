# SendGrid E-Mail Setup für Bau-Structura

## Problem: E-Mail-Versand schlägt fehl

Wenn Sie die Fehlermeldung "E-Mail konnte nicht gesendet werden" erhalten, liegt das meist an der SendGrid-Konfiguration.

## Lösung: Absender-E-Mail bei SendGrid verifizieren

### Schritt 1: SendGrid Single Sender Verification

1. **Loggen Sie sich in Ihr SendGrid-Konto ein** (sendgrid.com)
2. **Gehen Sie zu Settings → Sender Authentication**
3. **Klicken Sie auf "Get Started" bei Single Sender Verification**
4. **Fügen Sie Ihre E-Mail-Adresse hinzu**: `lea.zimmer@gmx.net`
5. **Füllen Sie das Formular aus**:
   - From Name: `Bau-Structura`
   - From Email Address: `lea.zimmer@gmx.net`
   - Reply To: `lea.zimmer@gmx.net`
   - Company Address: Ihre Firmenadresse
   - City, State, Country: Entsprechende Angaben
6. **Klicken Sie "Create"**

### Schritt 2: E-Mail-Verifizierung bestätigen

1. **Prüfen Sie Ihr E-Mail-Postfach** (lea.zimmer@gmx.net)
2. **Öffnen Sie die E-Mail von SendGrid** mit dem Betreff "Please Verify Your Sender Identity"
3. **Klicken Sie auf "Verify Single Sender"**
4. **Bestätigen Sie die Verifizierung**

### Schritt 3: Test in Bau-Structura

1. **Gehen Sie zur Admin-Seite** in Bau-Structura
2. **Klicken Sie auf "SendGrid-Verbindung testen"**
3. **Prüfen Sie, ob die Test-E-Mail erfolgreich gesendet wird**

## Alternative: Domain-Verifizierung (Fortgeschritten)

Falls Sie eine eigene Domain haben:

1. **Gehen Sie zu Settings → Sender Authentication**
2. **Wählen Sie "Authenticate Your Domain"**
3. **Folgen Sie den DNS-Einstellungsanweisungen**

## Häufige Probleme

### Problem: "The from address does not match a verified Sender Identity"
**Lösung**: Die Absender-E-Mail-Adresse muss bei SendGrid verifiziert sein (siehe Schritt 1-2)

### Problem: "Invalid API Key"
**Lösung**: Prüfen Sie den API-Schlüssel in den Replit Secrets

### Problem: "Daily send limit reached"
**Lösung**: SendGrid Free Plan hat ein Tageslimit von 100 E-Mails

## Aktueller Status

- API-Schlüssel: ✓ Konfiguriert
- Absender-Verifizierung: ❌ Erforderlich
- Test-Funktion: ✓ Verfügbar in Admin-Bereich

## Support

Bei weiteren Problemen:
1. Prüfen Sie die Browser-Konsole für detaillierte Fehlermeldungen
2. Nutzen Sie den SendGrid-Test-Button in der Admin-Seite
3. Kontaktieren Sie den SendGrid-Support bei Account-Problemen