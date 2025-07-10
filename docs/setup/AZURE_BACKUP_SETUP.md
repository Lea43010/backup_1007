# Azure Blob Storage Backup - Setup Anleitung

## Status: Bereit für Konfiguration

Das Azure Blob Storage Backup-System ist vollständig implementiert und wartet auf die Azure-Zugangsdaten.

## Azure Storage Account erstellen

### 1. Azure Portal anmelden
1. Gehen Sie zu [portal.azure.com](https://portal.azure.com)
2. Melden Sie sich mit Ihrem Azure-Konto an

### 2. Storage Account erstellen
1. Klicken Sie auf **"Create a resource"**
2. Suchen Sie nach **"Storage account"**
3. Klicken Sie auf **"Create"**

**Konfiguration:**
- **Subscription**: Ihre Azure-Subscription auswählen
- **Resource Group**: Neue erstellen oder vorhandene auswählen
- **Storage account name**: `baustructurabackups` (muss eindeutig sein)
- **Region**: Europa (Deutschland) für bessere Performance
- **Performance**: Standard (ausreichend für Backups)
- **Redundancy**: LRS (Locally Redundant Storage) oder GRS (Geo-Redundant)

### 3. Container erstellen
Nach der Erstellung des Storage Accounts:
1. Gehen Sie zum erstellten Storage Account
2. Klicken Sie auf **"Containers"** im linken Menü
3. Klicken Sie auf **"+ Container"**
4. Name: `bau-structura-backups`
5. Access level: **Private** (wichtig für Sicherheit)

### 4. Connection String abrufen
1. Im Storage Account gehen Sie zu **"Access keys"**
2. Kopieren Sie die **"Connection string"** von Key1 oder Key2

## Replit Environment Variables konfigurieren

### Erforderliche Secrets
Setzen Sie diese Environment Variables in Replit:

```
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=baustructurabackups;AccountKey=HIER_IHR_KEY;EndpointSuffix=core.windows.net
AZURE_BACKUP_CONTAINER=bau-structura-backups
```

### So setzen Sie die Secrets in Replit:
1. Klicken Sie auf **"Secrets"** im Replit-Seitenmenü (Schloss-Symbol)
2. Klicken Sie **"New Secret"**
3. Fügen Sie beide Environment Variables hinzu

## Implementierte Features

### Automatisches Backup-System
✅ **Vollständige Datenextraktion:**
- Alle Benutzer-Daten
- Alle Projekte, Kunden, Firmen
- Support-Tickets und System-Daten
- Metadaten und Statistiken

✅ **Azure Blob Storage Integration:**
- Automatischer Container-Upload
- Verschlüsselte Übertragung (HTTPS)
- Metadaten-Tagging für bessere Organisation
- 30-Tage Retention-Management

✅ **Admin-Interface:**
- "Backup erstellen" Button (sofortiger Upload)
- Backup-Liste anzeigen
- Download-Funktionalität
- Azure-Verbindungstest

### Backup-Speicherung in Azure
**Backup-Format**: SQL-Dump-Dateien
**Dateinamen**: `backup_2025-07-03T13-45-12_abc123.sql`
**Speicherort**: Azure Container `bau-structura-backups`
**Metadaten**: Automatische Tagging mit Datum, System, Version

### Sicherheitsfeatures
- **Private Container**: Nur mit Storage Account Key zugänglich
- **HTTPS-Übertragung**: Verschlüsselte Datenübertragung
- **Access Control**: Nur Admin-Benutzer können Backups erstellen/verwalten
- **Retention Management**: Automatische Löschung alter Backups

## Testing nach Setup

### 1. Azure-Verbindungstest
**Admin-Seite** → **"Azure-Test"** (wird hinzugefügt)
- Testet Storage Account Verbindung
- Prüft Container-Berechtigungen
- Validiert Upload/Download-Funktionalität

### 2. Backup erstellen
**Admin-Seite** → **"Backup erstellen"**
- Erstellt sofort einen vollständigen Datenbank-Export
- Lädt automatisch zu Azure Blob Storage hoch
- Zeigt Backup-ID und Azure-URL

### 3. Backup-Verwaltung
- **Backup-Liste**: Alle verfügbaren Backups in Azure anzeigen
- **Download**: Backup als SQL-Datei herunterladen
- **Cleanup**: Alte Backups automatisch löschen

## Kosten-Optimierung

**Azure Storage Kosten (ca. Schätzung):**
- **Storage**: ~€0.02 pro GB/Monat
- **Transactions**: ~€0.0004 pro 10.000 Operationen
- **Data Transfer**: Kostenlos (eingehend)

**Beispiel für monatliche Kosten:**
- 30 Backups à 2 MB = 60 MB = ~€0.001/Monat
- 90 Upload-Operationen = ~€0.000036/Monat
- **Gesamt**: < €0.01/Monat

## Troubleshooting

### Häufige Probleme
1. **"Connection string not found"**: AZURE_STORAGE_CONNECTION_STRING nicht gesetzt
2. **"Container access denied"**: Container-Berechtigungen prüfen
3. **"Upload failed"**: Netzwerkverbindung oder Azure-Service-Status prüfen

### Logs prüfen
Alle Azure-Operationen werden in der Server-Konsole protokolliert:
```
Backup backup_2025-07-03_abc123 erfolgreich zu Azure Blob Storage hochgeladen
```

## Next Steps nach Setup

1. **Secrets setzen** (siehe oben)
2. **Azure-Verbindungstest** auf Admin-Seite
3. **Erstes Backup erstellen** und Azure-Upload verifizieren
4. **Automatische tägliche Backups** konfigurieren (optional)

---

**Erstellt**: Juli 2025  
**Azure SDK**: @azure/storage-blob  
**Status**: Bereit für Produktion nach Konfiguration