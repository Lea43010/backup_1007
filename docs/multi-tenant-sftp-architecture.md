# Multi-Tenant SFTP Architektur für Bau-Structura
## Ein Server - Viele Benutzer - Sichere Trennung

### Architektur-Optionen

## Option 1: Ein Hetzner Server - Benutzer-spezifische Verzeichnisse (EMPFOHLEN)

### Vorteile:
- ✅ Nur EINE Hetzner Lizenz benötigt (~3-5€/Monat)
- ✅ Automatische Benutzer-Isolation durch ProFTPD
- ✅ Zentrale Verwaltung und Backup
- ✅ Kosteneffizient für unbegrenzte Bau-Structura Benutzer

### Struktur:
```
/var/ftp/
├── user_12345/          # Bau-Structura User ID 12345
│   ├── uploads/
│   ├── projects/
│   └── backups/
├── user_67890/          # Bau-Structura User ID 67890
│   ├── uploads/
│   ├── projects/
│   └── backups/
└── shared/              # Gemeinsame Dateien (optional)
    └── templates/
```

### PostgreSQL Schema-Erweiterung:
```sql
-- FTP-Benutzer Tabelle erweitert
CREATE TABLE ftpuser (
    id SERIAL PRIMARY KEY,
    userid VARCHAR(32) UNIQUE NOT NULL,           -- baustructura_user_12345
    passwd VARCHAR(128) NOT NULL,
    uid INTEGER NOT NULL DEFAULT 2001,
    gid INTEGER NOT NULL DEFAULT 2001,
    homedir VARCHAR(255) NOT NULL,                -- /var/ftp/user_12345
    shell VARCHAR(32) NOT NULL DEFAULT '/bin/false',
    baustructura_user_id VARCHAR(32),             -- Verknüpfung zu Bau-Structura
    quota_mb INTEGER DEFAULT 1000,                -- 1GB pro Benutzer
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);
```

---

## Option 2: Separate Hetzner Server pro Benutzer

### Nachteile:
- ❌ Hohe Kosten: 3-5€ × Anzahl Benutzer pro Monat
- ❌ Komplexe Verwaltung vieler Server
- ❌ Mehr Wartungsaufwand
- ❌ Nicht skalierbar für viele Benutzer

---

## EMPFOHLENE LÖSUNG: Multi-Tenant auf einem Server

### 1. ProFTPD Konfiguration für Benutzer-Isolation

```apache
# /etc/proftpd/proftpd.conf
ServerName "Bau-Structura Multi-Tenant FTP"

# Automatische Verzeichnis-Erstellung
CreateHome on 755 dirmode 755

# Benutzer-spezifische Roots
<Directory />
  <Limit ALL>
    AllowUser baustructura_*
  </Limit>
</Directory>

# Pro-Benutzer Quota (1GB Standard)
LoadModule mod_quotatab.c
LoadModule mod_quotatab_sql.c
QuotaEngine on
QuotaShowQuotas on
QuotaDisplayUnits Mb

# PostgreSQL Quota-Tabelle
SQLNamedQuery get-quota-limit SELECT "name, quota_type, per_session, limit_type, bytes_in_avail, bytes_out_avail, bytes_xfer_avail, files_in_avail, files_out_avail, files_xfer_avail FROM ftpquotalimits WHERE name = '%{0}' AND quota_type = '%{1}'"

SQLNamedQuery get-quota-tally SELECT "name, quota_type, bytes_in_used, bytes_out_used, bytes_xfer_used, files_in_used, files_out_used, files_xfer_used FROM ftpquotatallies WHERE name = '%{0}' AND quota_type = '%{1}'"

SQLNamedQuery update-quota-tally UPDATE "bytes_in_used = bytes_in_used + %{0}, bytes_out_used = bytes_out_used + %{1}, bytes_xfer_used = bytes_xfer_used + %{2}, files_in_used = files_in_used + %{3}, files_out_used = files_out_used + %{4}, files_xfer_used = files_xfer_used + %{5} WHERE name = '%{6}' AND quota_type = '%{7}'" ftpquotatallies

SQLNamedQuery insert-quota-tally INSERT "%{0}, %{1}, %{2}, %{3}, %{4}, %{5}, %{6}, %{7}" ftpquotatallies
```

### 2. Automatische Benutzer-Erstellung in Bau-Structura

```typescript
// server/routes.ts - Automatische SFTP-Account-Erstellung
app.post('/api/profile/create-sftp-account', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // SFTP-Benutzer automatisch erstellen
    const sftpUsername = `baustructura_user_${userId}`;
    const sftpPassword = generateSecurePassword();
    const homeDir = `/var/ftp/user_${userId}`;
    
    // PostgreSQL: FTP-Benutzer anlegen
    await db.execute(sql`
      INSERT INTO ftpuser (userid, passwd, homedir, baustructura_user_id, quota_mb) 
      VALUES (${sftpUsername}, crypt(${sftpPassword}, gen_salt('md5')), ${homeDir}, ${userId}, 1000)
      ON CONFLICT (userid) DO NOTHING
    `);
    
    // Bau-Structura User aktualisieren
    await storage.updateUser(userId, {
      sftpHost: "128.140.82.20",
      sftpPort: 21,
      sftpUsername: sftpUsername,
      sftpPassword: sftpPassword,
      sftpPath: `${homeDir}/uploads/`
    });
    
    res.json({
      message: "SFTP-Account automatisch erstellt",
      sftpDetails: {
        host: "128.140.82.20",
        port: 21,
        username: sftpUsername,
        path: `${homeDir}/uploads/`,
        quota: "1GB"
      }
    });
    
  } catch (error) {
    console.error("Error creating SFTP account:", error);
    res.status(500).json({ message: "Failed to create SFTP account" });
  }
});
```

### 3. Verzeichnis-Struktur automatisch erstellen

```bash
#!/bin/bash
# create-user-directory.sh
USER_ID=$1
BASE_DIR="/var/ftp/user_${USER_ID}"

# Benutzer-Verzeichnisse erstellen
mkdir -p ${BASE_DIR}/{uploads,projects,backups,temp}

# Berechtigungen setzen
chown -R ftpuser:ftpgroup ${BASE_DIR}
chmod -R 755 ${BASE_DIR}

# Quota setzen (1GB)
setquota -u ftpuser 1048576 1048576 0 0 /var/ftp

echo "✅ Verzeichnis für Benutzer ${USER_ID} erstellt: ${BASE_DIR}"
```

### 4. Bau-Structura Frontend: Auto-Setup Button

```typescript
// client/src/pages/profile.tsx - Auto-Setup Button hinzufügen
const createSftpAccountMutation = useMutation({
  mutationFn: async () => {
    return await apiRequest(`/api/profile/create-sftp-account`, "POST", {});
  },
  onSuccess: (data) => {
    toast({
      title: "SFTP-Account erstellt",
      description: `Ihr persönlicher SFTP-Bereich ist bereit: ${data.sftpDetails.username}`,
    });
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  },
  onError: (error) => {
    toast({
      title: "Auto-Setup fehlgeschlagen", 
      description: error.message,
      variant: "destructive",
    });
  },
});

// Button in der SFTP-Konfiguration
<Button 
  onClick={() => createSftpAccountMutation.mutate()}
  disabled={createSftpAccountMutation.isPending}
  className="w-full mb-4"
>
  {createSftpAccountMutation.isPending ? "Erstelle Account..." : "🚀 Automatischen SFTP-Account erstellen"}
</Button>
```

### 5. Kosten-Vergleich

| Lösung | Kosten pro Monat | Max. Benutzer | Verwaltung |
|--------|------------------|---------------|------------|
| **Ein Hetzner Server** | 3-5€ | Unbegrenzt* | Einfach |
| Separate Server | 3-5€ × Benutzer | 1 pro Server | Komplex |

*Mit vernünftigen Quota-Limits (1GB pro Benutzer)

### 6. Sicherheits-Features

```apache
# Benutzer-Isolation
<Directory ~>
  <Limit ALL>
    AllowUser %u
    DenyAll
  </Limit>
</Directory>

# Kein Zugriff auf andere Benutzer-Verzeichnisse
<Directory /var/ftp/user_*>
  <Limit ALL>
    AllowUser baustructura_user_%{env:USER_ID}
    DenyAll
  </Limit>
</Directory>
```

## Fazit: EINE Hetzner Lizenz reicht!

Mit der Multi-Tenant-Architektur benötigen Sie nur **EINEN** Hetzner Cloud Server für alle Ihre Bau-Structura Benutzer. Jeder erhält automatisch:

- ✅ Separaten, sicheren SFTP-Bereich  
- ✅ 1GB Speicherplatz (erweiterbar)
- ✅ Automatische Account-Erstellung
- ✅ Vollständige Datenisolation
- ✅ Kosteneffizienz: ~5€/Monat für unbegrenzte Benutzer

Die Lösung skaliert perfekt mit Ihrem Bau-Structura Geschäft!