# Automatische SFTP-Einrichtung

Das Bau-Structura System verfügt über eine vollständige automatische SFTP-Einrichtung, die nach dem Lizenz-Abschluss aktiviert wird.

## Funktionsweise

### 1. Automatische Aktivierung
- **Trigger**: Erfolgreiche Stripe-Zahlung (payment_intent.succeeded)
- **Bedingung**: Nur bei gültiger Lizenz (nicht im Testzeitraum)
- **Timing**: Sofort nach Zahlungsbestätigung

### 2. Was passiert automatisch:
1. **Credentials-Generierung**: Eindeutige SFTP-Zugangsdaten
2. **Server-Setup**: Account-Erstellung auf Hetzner Cloud Server
3. **Datenbank-Update**: Speicherung der SFTP-Informationen
4. **E-Mail-Benachrichtigung**: Automatischer Versand der Zugangsdaten

### 3. Server-Details
- **Host**: 128.140.82.20 (Hetzner Cloud, Deutschland)
- **Port**: 22 (SSH/SFTP)
- **Verschlüsselung**: SSL/TLS
- **Isolation**: Vollständige Trennung zwischen Benutzern

## Lizenz-basierte Speicher-Limits

| Lizenztyp    | Speicherplatz | Zugriffslevel |
|-------------|---------------|---------------|
| Basic       | 1GB           | Level 1       |
| Professional| 5GB           | Level 5       |
| Enterprise  | 20GB          | Level 20      |

## E-Mail-Benachrichtigung

Nach erfolgreicher Einrichtung erhalten Benutzer eine automatische E-Mail mit:
- ✅ SFTP-Zugangsdaten (Host, Username, Passwort, Pfad)
- 🔒 Sicherheitshinweise
- 🚀 Anleitungen zur Nutzung
- 📊 Lizenz-Details und Speicherlimits

## API-Endpunkte (Admin)

### SFTP manuell einrichten
```
POST /api/admin/sftp/setup/:userId
```

### SFTP-Account entfernen
```
DELETE /api/admin/sftp/remove/:userId
```

### SFTP-Status aller Benutzer
```
GET /api/admin/sftp/status
```

## Integration in Projekt

### 1. Automatische Hooks
```typescript
// Nach Lizenz-Aktivierung
onLicenseActivated(userId, licenseType);

// Bei Lizenz-Kündigung  
onLicenseCancelled(userId);
```

### 2. E-Mail-Service
```typescript
emailService.sendSftpWelcomeEmail({
  email, firstName, sftpHost, sftpPort,
  sftpUsername, sftpPassword, sftpPath,
  licenseType, storageLimit
});
```

## Sicherheitsfeatures

- **User-Isolation**: Jeder Benutzer hat einen komplett separaten Bereich
- **Sichere Passwörter**: Crypto-generierte 32-Zeichen Passwörter
- **HTTPS/SSL**: Alle Übertragungen verschlüsselt
- **Zugriffskontrolle**: Nur lizenzierte Benutzer erhalten Zugang
- **Automatische Bereinigung**: SFTP wird bei Lizenz-Kündigung entfernt

## Hetzner Cloud Setup

Der SFTP-Server läuft auf einem dedizierten Hetzner Cloud Server:
- **Multi-Tenant Architektur**: Ein Server für alle Benutzer
- **ProFTPD + PostgreSQL**: Benutzer-Authentifizierung via Datenbank
- **Kosteneffizient**: ~5€/Monat für unbegrenzte Benutzer
- **DSGVO-konform**: Server-Standort Deutschland

## Vorteile der automatischen Einrichtung

1. **Kein manueller Aufwand**: Benutzer müssen nichts konfigurieren
2. **Sofortige Verfügbarkeit**: SFTP ist direkt nach Zahlung aktiv
3. **Professionelle E-Mail**: Automatische Benachrichtigung mit allen Details
4. **Integrierte Sicherheit**: Nur lizenzierte Benutzer erhalten Zugang
5. **Skalierbar**: System wächst automatisch mit der Benutzerbasis

## Monitoring & Support

- **Automatische Logs**: Alle SFTP-Setup-Vorgänge werden protokolliert
- **Admin-Dashboard**: Übersicht über alle SFTP-Accounts
- **Support-Integration**: SFTP-Probleme können über Support-Tickets gemeldet werden
- **Backup-Integration**: SFTP-Dateien können in Azure Blob Storage gesichert werden