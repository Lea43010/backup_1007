# Hetzner Cloud SFTP Server Setup
## Server: replit-sftp (128.140.82.20)

### 1. Server-Grundkonfiguration

```bash
# Als root einloggen
ssh root@128.140.82.20

# System aktualisieren
apt update && apt upgrade -y

# Firewall konfigurieren
ufw allow 22
ufw allow 21
ufw allow 80
ufw allow 443
ufw allow 20000:21000/tcp  # Passive FTP Ports
ufw --force enable
```

### 2. PostgreSQL Installation und Konfiguration

```bash
# PostgreSQL installieren
apt install postgresql postgresql-contrib -y

# PostgreSQL konfigurieren
sudo -u postgres psql

-- In PostgreSQL:
CREATE DATABASE proftpd_db;
CREATE USER proftpd_user WITH ENCRYPTED PASSWORD 'IhrSicheresPasswort123!';
GRANT ALL PRIVILEGES ON DATABASE proftpd_db TO proftpd_user;
\q
```

```sql
-- FTP-Benutzer Tabelle erstellen
sudo -u postgres psql -d proftpd_db

CREATE TABLE ftpuser (
    id SERIAL PRIMARY KEY,
    userid VARCHAR(32) UNIQUE NOT NULL,
    passwd VARCHAR(128) NOT NULL,
    uid INTEGER NOT NULL DEFAULT 2001,
    gid INTEGER NOT NULL DEFAULT 2001,
    homedir VARCHAR(255) NOT NULL,
    shell VARCHAR(32) NOT NULL DEFAULT '/bin/false',
    count INTEGER NOT NULL DEFAULT 0,
    accessed TIMESTAMP DEFAULT NOW(),
    modified TIMESTAMP DEFAULT NOW()
);

-- Bau-Structura FTP-Benutzer anlegen
INSERT INTO ftpuser (userid, passwd, uid, gid, homedir, shell) 
VALUES ('baustructura_user', crypt('IhrFTPPasswort123!', gen_salt('md5')), 2001, 2001, '/var/ftp/uploads', '/bin/false');

\q
```

### 3. ProFTPD Installation und Konfiguration

```bash
# ProFTPD installieren
apt install proftpd-basic proftpd-mod-pgsql -y

# FTP-Benutzer und -Gruppe erstellen
groupadd -g 2001 ftpgroup
useradd -u 2001 -g 2001 -d /var/ftp -s /bin/false ftpuser

# FTP-Verzeichnisse erstellen
mkdir -p /var/ftp/uploads
chown ftpuser:ftpgroup /var/ftp/uploads
chmod 755 /var/ftp/uploads
```

### 4. ProFTPD Konfiguration (/etc/proftpd/proftpd.conf)

```bash
# Backup der Original-Konfiguration
cp /etc/proftpd/proftpd.conf /etc/proftpd/proftpd.conf.backup

# Neue Konfiguration erstellen
cat > /etc/proftpd/proftpd.conf << 'EOF'
# Bau-Structura ProFTPD Konfiguration für Hetzner Cloud
ServerName "Bau-Structura FTP Server"
ServerType standalone
DefaultServer on
Port 21

# Benutzer
User ftpuser
Group ftpgroup

# Verzeichnisse
DefaultRoot /var/ftp
RequireValidShell off

# Sicherheit
<Anonymous ~ftp>
  User ftp
  Group ftp
  UserAlias anonymous ftp
  RequireValidShell off
  MaxClients 10
  DisplayLogin welcome.msg
  DisplayFirstChdir .message
  <Directory *>
    <Limit WRITE>
      DenyAll
    </Limit>
  </Directory>
</Anonymous>

# PostgreSQL Modul
LoadModule mod_sql.c
LoadModule mod_sql_postgres.c

# PostgreSQL Verbindung
SQLBackend postgres
SQLConnectInfo proftpd_db@localhost proftpd_user IhrSicheresPasswort123!
SQLAuthTypes Crypt
SQLAuthenticate users

# Benutzer-Abfragen
SQLUserInfo ftpuser userid passwd uid gid homedir shell
SQLGroupInfo ftpgroup groupname gid members

# Logging
SQLLog PASS updatecount
SQLNamedQuery updatecount UPDATE "count=count+1, accessed=now() WHERE userid='%u'" ftpuser

# Passive Mode für Hetzner Cloud
PassivePorts 20000 21000
MasqueradeAddress 128.140.82.20

# Logging
TransferLog /var/log/proftpd/xferlog
SystemLog /var/log/proftpd/proftpd.log

# Upload-Berechtigungen
<Directory /var/ftp/uploads>
  <Limit STOR DELE RNFR RNTO MKD RMD>
    AllowAll
  </Limit>
</Directory>
EOF
```

### 5. SSL/TLS Zertifikat mit Let's Encrypt

```bash
# Certbot installieren
apt install certbot -y

# Domain für SSL (optional, ersetzen Sie mit Ihrer Domain)
# certbot certonly --standalone -d ftp.ihr-domain.de

# Oder selbstsigniertes Zertifikat erstellen
openssl req -new -x509 -days 365 -nodes -out /etc/ssl/certs/proftpd.crt -keyout /etc/ssl/private/proftpd.key -subj "/C=DE/ST=State/L=City/O=Bau-Structura/CN=128.140.82.20"

# SSL-Konfiguration zu ProFTPD hinzufügen
cat >> /etc/proftpd/proftpd.conf << 'EOF'

# SSL/TLS Konfiguration
LoadModule mod_tls.c
<IfModule mod_tls.c>
  TLSEngine on
  TLSLog /var/log/proftpd/tls.log
  TLSProtocol TLSv1.2 TLSv1.3
  TLSCipherSuite HIGH:MEDIUM:+TLSv1:!SSLv2:!SSLv3
  TLSOptions NoCertRequest EnableDiags NoSessionReuseRequired
  TLSRSACertificateFile /etc/ssl/certs/proftpd.crt
  TLSRSACertificateKeyFile /etc/ssl/private/proftpd.key
  TLSVerifyClient off
  TLSRequired on
</IfModule>
EOF
```

### 6. Services starten und testen

```bash
# ProFTPD starten und aktivieren
systemctl enable proftpd
systemctl start proftpd
systemctl status proftpd

# PostgreSQL neustarten
systemctl restart postgresql

# Log-Verzeichnisse erstellen
mkdir -p /var/log/proftpd
chown ftpuser:ftpgroup /var/log/proftpd

# Verbindung testen
netstat -tlnp | grep :21

# FTP-Verbindung testen
ftp 128.140.82.20
# Benutzer: baustructura_user
# Passwort: IhrFTPPasswort123!
```

### 7. Bau-Structura Anwendung konfigurieren

In der Bau-Structura Profilseite eingeben:
- **SFTP-Host:** 128.140.82.20
- **Port:** 21
- **Benutzername:** baustructura_user
- **Passwort:** IhrFTPPasswort123!
- **Pfad:** /var/ftp/uploads/

### 8. Weitere FTP-Benutzer hinzufügen

```sql
-- Neue Benutzer in PostgreSQL hinzufügen
sudo -u postgres psql -d proftpd_db

INSERT INTO ftpuser (userid, passwd, uid, gid, homedir, shell) 
VALUES ('neuer_benutzer', crypt('NeuesPasswort123!', gen_salt('md5')), 2001, 2001, '/var/ftp/uploads', '/bin/false');
```

### 9. Monitoring und Wartung

```bash
# Log-Dateien überwachen
tail -f /var/log/proftpd/proftpd.log

# Aktive Verbindungen anzeigen
ftpwho

# Benutzer-Statistiken aus PostgreSQL
sudo -u postgres psql -d proftpd_db -c "SELECT userid, count, accessed FROM ftpuser;"
```

### 10. Sicherheits-Checkliste

- ✅ Firewall konfiguriert (UFW)
- ✅ PostgreSQL mit sicheren Passwörtern
- ✅ SSL/TLS aktiviert
- ✅ Passive Mode für Hetzner Cloud
- ✅ Chroot-Umgebung (/var/ftp)
- ✅ Upload-Berechtigung nur in /uploads

### Troubleshooting

**Verbindungsprobleme:**
```bash
# Firewall-Status prüfen
ufw status

# ProFTPD-Status prüfen
systemctl status proftpd

# PostgreSQL-Verbindung testen
sudo -u postgres psql -d proftpd_db -c "SELECT * FROM ftpuser;"
```

**Log-Analyse:**
```bash
# FTP-Logs anzeigen
tail -50 /var/log/proftpd/proftpd.log

# PostgreSQL-Logs anzeigen
tail -50 /var/log/postgresql/postgresql-*.log
```

Ihr Hetzner Cloud SFTP-Server ist jetzt bereit für die Bau-Structura Anwendung!