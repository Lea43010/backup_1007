# Hetzner Cloud SFTP-Server Konfiguration für Bau-Structura

## Server-Details

**Hetzner Cloud Server: "replit-sftp"**
- **IP-Adresse:** 128.140.82.20
- **Standort:** Falkenstein, Deutschland
- **Betriebssystem:** Ubuntu 22.04 LTS
- **Monatliche Kosten:** ~5€ (CX11 oder ähnlich)

## Multi-Tenant SFTP-Architektur

### Konzept
Ein einziger Hetzner Server hostet alle Bau-Structura SFTP-Accounts mit vollständiger Isolation zwischen den Benutzern.

### Benutzer-Isolation
- **Benutzerformat:** `baustructura_user_<USER_ID>`
- **Home-Verzeichnis:** `/var/ftp/user_<USER_ID>/`
- **Upload-Bereich:** `/var/ftp/user_<USER_ID>/uploads/`
- **Speicher-Quota:** 1GB pro Benutzer (erweiterbar)

## Technische Implementierung

### 1. ProFTPD Installation und Konfiguration

```bash
# System Update
sudo apt update && sudo apt upgrade -y

# ProFTPD Installation
sudo apt install proftpd-basic proftpd-mod-pgsql postgresql-client -y

# ProFTPD als Standalone-Service konfigurieren
sudo dpkg-reconfigure proftpd-basic
# Wählen Sie: "standalone"
```

### 2. PostgreSQL Backend-Konfiguration

```bash
# PostgreSQL Installation (lokal auf dem Server)
sudo apt install postgresql postgresql-contrib -y

# PostgreSQL-Benutzer für ProFTPD erstellen
sudo -u postgres createuser -P proftpd_user
# Passwort: [SICHERES_PASSWORT]

# Datenbank erstellen
sudo -u postgres createdb proftpd_db -O proftpd_user
```

### 3. ProFTPD-Tabellen erstellen

```sql
-- Als postgres-Benutzer ausführen
\c proftpd_db;

CREATE TABLE ftpuser (
  id serial PRIMARY KEY,
  userid varchar(32) NOT NULL UNIQUE,
  passwd varchar(32) NOT NULL,
  uid smallint NOT NULL,
  gid smallint NOT NULL,
  homedir varchar(255) NOT NULL,
  shell varchar(16) NOT NULL DEFAULT '/sbin/nologin',
  count int NOT NULL DEFAULT 0,
  accessed timestamp NOT NULL DEFAULT now(),
  modified timestamp NOT NULL DEFAULT now()
);

CREATE TABLE ftpgroup (
  groupname varchar(16) NOT NULL,
  gid smallint NOT NULL,
  members varchar(16) NOT NULL
);

-- FTP-Gruppe für alle Bau-Structura-Benutzer
INSERT INTO ftpgroup VALUES ('baustructura', 2001, '');

-- Index für bessere Performance
CREATE INDEX userid_idx ON ftpuser(userid);
```

### 4. ProFTPD-Konfiguration (/etc/proftpd/proftpd.conf)

```apache
# Grundkonfiguration
ServerName "Bau-Structura SFTP Server"
ServerType standalone
DefaultServer on
Port 21
Umask 022
MaxInstances 30
User proftpd
Group nogroup

# Verzeichnis-Struktur
DefaultRoot ~ !wheel
RequireValidShell off

# PostgreSQL-Authentifizierung
AuthOrder mod_sql.c
SQLBackend postgres
SQLConnectInfo proftpd_db@localhost proftpd_user [PASSWORT]
SQLUserInfo ftpuser userid passwd uid gid homedir shell
SQLGroupInfo ftpgroup groupname gid members
SQLMinUserUID 2000
SQLMinUserGID 2000

# SFTP/SSH-Konfiguration
LoadModule mod_sftp.c
SFTPEngine on
SFTPLog /var/log/proftpd/sftp.log
SFTPHostKey /etc/proftpd/ssh_host_rsa_key
SFTPHostKey /etc/proftpd/ssh_host_dsa_key

# Quota-System
LoadModule mod_quotatab.c
LoadModule mod_quotatab_sql.c
QuotaEngine on
QuotaDirectoryTally on
QuotaDisplayUnits Mb
QuotaShowQuotas on

# Logging
TransferLog /var/log/proftpd/xferlog
SystemLog /var/log/proftpd/proftpd.log

# Sicherheit
<Limit LOGIN>
  AllowUser baustructura_user_*
  DenyAll
</Limit>

# SSL/TLS (Let's Encrypt)
LoadModule mod_tls.c
TLSEngine on
TLSRequired on
TLSRSACertificateFile /etc/letsencrypt/live/bau-structura-sftp.de/cert.pem
TLSRSACertificateKeyFile /etc/letsencrypt/live/bau-structura-sftp.de/privkey.pem
TLSCACertificateFile /etc/letsencrypt/live/bau-structura-sftp.de/chain.pem
```

### 5. SSL-Zertifikat mit Let's Encrypt

```bash
# Certbot Installation
sudo apt install snapd -y
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot

# Subdomain für SFTP-Server erstellen (optional)
# DNS A-Record: bau-structura-sftp.de -> 128.140.82.20

# SSL-Zertifikat generieren
sudo certbot certonly --standalone -d bau-structura-sftp.de

# Auto-Renewal einrichten
sudo crontab -e
# Hinzufügen: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 6. Firewall-Konfiguration

```bash
# UFW Firewall aktivieren
sudo ufw enable

# SFTP/FTP-Ports öffnen
sudo ufw allow 21/tcp   # FTP Control
sudo ufw allow 22/tcp   # SSH/SFTP
sudo ufw allow 990/tcp  # FTPS
sudo ufw allow 40000:50000/tcp  # Passive FTP Range

# ProFTPD Passive Port Range konfigurieren
echo "PassivePorts 40000 50000" >> /etc/proftpd/proftpd.conf
```

### 7. Automatisierte Account-Erstellung

```bash
#!/bin/bash
# /usr/local/bin/create_sftp_user.sh

USER_ID="$1"
PASSWORD="$2"

if [ -z "$USER_ID" ] || [ -z "$PASSWORD" ]; then
    echo "Usage: $0 <user_id> <password>"
    exit 1
fi

USERNAME="baustructura_user_$USER_ID"
HOMEDIR="/var/ftp/user_$USER_ID"
UID=2001
GID=2001

# Benutzer-Verzeichnis erstellen
sudo mkdir -p "$HOMEDIR/uploads"
sudo chown -R $UID:$GID "$HOMEDIR"
sudo chmod 755 "$HOMEDIR"
sudo chmod 775 "$HOMEDIR/uploads"

# Quota setzen (1GB = 1048576 KB)
sudo setquota -u $UID 1048576 1048576 0 0 /var/ftp

# PostgreSQL-Eintrag erstellen
HASHED_PASSWORD=$(echo -n "$PASSWORD" | md5sum | cut -d' ' -f1)

sudo -u postgres psql proftpd_db << EOF
INSERT INTO ftpuser (userid, passwd, uid, gid, homedir, shell)
VALUES ('$USERNAME', '$HASHED_PASSWORD', $UID, $GID, '$HOMEDIR', '/sbin/nologin')
ON CONFLICT (userid) DO UPDATE SET
passwd = EXCLUDED.passwd,
modified = now();
EOF

echo "✅ SFTP-Account erstellt: $USERNAME"
echo "📁 Home-Verzeichnis: $HOMEDIR"
echo "💾 Quota: 1GB"
```

### 8. Monitoring und Wartung

```bash
# ProFTPD-Status prüfen
sudo systemctl status proftpd

# Aktive Verbindungen anzeigen
sudo ftpwho

# Log-Dateien überwachen
sudo tail -f /var/log/proftpd/proftpd.log

# Quota-Status prüfen
sudo repquota -a

# PostgreSQL-Verbindung testen
sudo -u postgres psql proftpd_db -c "SELECT userid, accessed FROM ftpuser ORDER BY accessed DESC LIMIT 10;"
```

## Bau-Structura Integration

### Automatische Account-Erstellung bei Registrierung

1. **Benutzer registriert sich** in Bau-Structura
2. **SFTP-Account wird automatisch erstellt:**
   - Benutzername: `baustructura_user_<USER_ID>`
   - Sicheres 12-stelliges Passwort generiert
   - Home-Verzeichnis: `/var/ftp/user_<USER_ID>/uploads/`
   - 1GB Quota zugewiesen
3. **SFTP-Daten in Bau-Structura gespeichert:**
   - `sftpHost`: "128.140.82.20"
   - `sftpPort`: 21
   - `sftpUsername`: Generated username
   - `sftpPassword`: Generated password
   - `sftpPath`: Home directory path
4. **Willkommens-E-Mail** mit SFTP-Informationen versendet

### Profil-Seite Integration

In der Bau-Structura Profil-Seite (SFTP-Konfiguration):
- **Server:** 128.140.82.20
- **Port:** 21 (Standard FTP) oder 22 (SFTP)
- **Automatische Konfiguration** per Knopfdruck
- **Test-Verbindung** verfügbar
- **Datei-Upload-Interface** in der App

## Kostenübersicht

| Komponente | Monatliche Kosten |
|------------|-------------------|
| Hetzner CX11 Server | ~4.15€ |
| Zusätzlicher Speicher (bei Bedarf) | ~0.40€/10GB |
| Let's Encrypt SSL | Kostenlos |
| **Gesamt für unbegrenzte Benutzer** | **~5€/Monat** |

## Vorteile dieser Lösung

✅ **Kosteneffizient:** Ein Server für alle Benutzer  
✅ **Skalierbar:** Automatische Account-Erstellung  
✅ **Sicher:** Vollständige Benutzer-Isolation  
✅ **Wartungsarm:** PostgreSQL-Backend für einfache Verwaltung  
✅ **SSL-verschlüsselt:** Let's Encrypt-Zertifikate  
✅ **Quota-System:** Speicher-Limits pro Benutzer  
✅ **Monitoring:** Umfassende Logging-Funktionen  

## Support und Wartung

### Backup-Strategie
- **PostgreSQL-Datenbank:** Tägliche automatische Backups
- **Benutzer-Dateien:** Wöchentliche Snapshots aller `/var/ftp/user_*` Verzeichnisse
- **Konfiguration:** Versionskontrolle für alle Konfigurationsdateien

### Troubleshooting
- **ProFTPD-Logs:** `/var/log/proftpd/`
- **PostgreSQL-Status:** `systemctl status postgresql`
- **Firewall-Regeln:** `sudo ufw status verbose`
- **SSL-Zertifikat:** `sudo certbot certificates`

Für technischen Support oder Konfigurationshilfe wenden Sie sich an das Bau-Structura Support-Team.