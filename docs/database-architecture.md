# Bau-Structura Datenarchitektur

## Überblick

Die Bau-Structura App verwendet eine **PostgreSQL**-Datenbank mit **Drizzle ORM** für typsichere Datenbankoperationen. Die Architektur ist auf Skalierbarkeit und Performance optimiert.

## Datenbank-Konfiguration

- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Drizzle ORM mit TypeScript
- **Migrations**: Drizzle Kit (`npm run db:push`)
- **Connection**: Pool-basierte Verbindungen über `@neondatabase/serverless`
- **Schema Location**: `shared/schema.ts`

## Haupttabellen

### 1. Authentifizierung & Benutzer

#### `sessions`
```sql
sid VARCHAR PRIMARY KEY,
sess JSONB NOT NULL,
expire TIMESTAMP NOT NULL
```
**Zweck**: Express-Session-Storage für Authentifizierung

#### `users`
```sql
id VARCHAR PRIMARY KEY,
email VARCHAR UNIQUE,
first_name VARCHAR,
last_name VARCHAR,
profile_image_url VARCHAR,
role user_role DEFAULT 'user',
privacy_consent BOOLEAN DEFAULT false,
-- SFTP Konfiguration
sftp_host VARCHAR,
sftp_port INTEGER DEFAULT 22,
sftp_username VARCHAR,
sftp_password VARCHAR,
sftp_path VARCHAR DEFAULT '/',
sftp_access_level INTEGER DEFAULT 0,
-- E-Mail & Benachrichtigungen
email_notifications_enabled BOOLEAN DEFAULT true,
flood_protection_certified BOOLEAN DEFAULT false,
password VARCHAR, -- Für lokale Authentifizierung
-- Stripe & Lizenz-Management
stripe_customer_id VARCHAR,
license_type license_type DEFAULT 'basic',
license_expires_at TIMESTAMP,
payment_status VARCHAR DEFAULT 'unpaid',
last_payment_date TIMESTAMP,
stripe_subscription_id VARCHAR,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
```

**Enums**:
- `user_role`: `admin`, `manager`, `user`
- `license_type`: `basic`, `professional`, `enterprise`

### 2. Projekt-Management

#### `projects`
```sql
id SERIAL PRIMARY KEY,
name VARCHAR(255) NOT NULL,
description TEXT,
status project_status DEFAULT 'planning',
start_date TIMESTAMP,
end_date TIMESTAMP,
budget DECIMAL(12,2),
customer_id INTEGER REFERENCES customers(id),
manager_id VARCHAR REFERENCES users(id),
customer_contact_id INTEGER REFERENCES customer_contacts(id),
company_contact_id INTEGER REFERENCES company_contacts(id),
-- GPS & Kartendaten
latitude DECIMAL(10,8),
longitude DECIMAL(11,8),
address TEXT,
map_zoom_level INTEGER DEFAULT 15,
boundary_polygon JSONB,
-- Projekt-Status
completion_percentage INTEGER DEFAULT 0,
flood_risk_level INTEGER DEFAULT 0,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
```

**Enum**: `project_status`: `planning`, `active`, `completed`, `cancelled`

#### `project_locations`
```sql
id SERIAL PRIMARY KEY,
project_id INTEGER REFERENCES projects(id) NOT NULL,
name VARCHAR(255),
description TEXT,
latitude DECIMAL(10,8) NOT NULL,
longitude DECIMAL(11,8) NOT NULL,
address TEXT,
map_data JSONB,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
```

### 3. Kunden & Kontakte

#### `customers`
```sql
id SERIAL PRIMARY KEY,
name VARCHAR(255) NOT NULL,
email VARCHAR(255),
phone VARCHAR(50),
-- Adresse (separierte Felder)
street VARCHAR(255),
house_number VARCHAR(20),
postal_code VARCHAR(10),
city VARCHAR(100),
contact_person_id INTEGER REFERENCES persons(id),
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
```

#### `companies`
```sql
id SERIAL PRIMARY KEY,
name VARCHAR(255) NOT NULL,
email VARCHAR(255),
phone VARCHAR(50),
-- Adresse (separierte Felder)
street VARCHAR(255),
house_number VARCHAR(20),
postal_code VARCHAR(10),
city VARCHAR(100),
website VARCHAR(255),
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
```

#### `persons`
```sql
id SERIAL PRIMARY KEY,
first_name VARCHAR(100) NOT NULL,
last_name VARCHAR(100) NOT NULL,
email VARCHAR(255),
phone VARCHAR(50),
position VARCHAR(100),
company_id INTEGER REFERENCES companies(id),
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
```

#### `customer_contacts`
```sql
id SERIAL PRIMARY KEY,
customer_id INTEGER REFERENCES customers(id) NOT NULL,
name VARCHAR(255) NOT NULL,
email VARCHAR(255),
phone VARCHAR(50),
position VARCHAR(100),
created_at TIMESTAMP DEFAULT NOW()
```

#### `company_contacts`
```sql
id SERIAL PRIMARY KEY,
company_id INTEGER REFERENCES companies(id) NOT NULL,
name VARCHAR(255) NOT NULL,
email VARCHAR(255),
phone VARCHAR(50),
position VARCHAR(100),
department VARCHAR(100),
created_at TIMESTAMP DEFAULT NOW()
```

### 4. Medien & Dokumentation

#### `attachments`
```sql
id SERIAL PRIMARY KEY,
file_name VARCHAR(255) NOT NULL,
file_path TEXT NOT NULL,
file_size INTEGER,
mime_type VARCHAR(100),
project_id INTEGER REFERENCES projects(id),
uploaded_by VARCHAR REFERENCES users(id),
-- GPS-Tagging
gps_latitude DECIMAL(10,8),
gps_longitude DECIMAL(11,8),
-- SFTP Backup
sftp_path TEXT,
sftp_backup_status VARCHAR(50) DEFAULT 'pending',
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
```

#### `photos`
```sql
id SERIAL PRIMARY KEY,
file_name VARCHAR(255) NOT NULL,
file_path TEXT NOT NULL,
project_id INTEGER REFERENCES projects(id),
taken_by VARCHAR REFERENCES users(id),
-- GPS-Tagging
gps_latitude DECIMAL(10,8),
gps_longitude DECIMAL(11,8),
metadata JSONB,
description TEXT,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
```

#### `audio_records`
```sql
id SERIAL PRIMARY KEY,
file_name VARCHAR(255) NOT NULL,
file_path TEXT NOT NULL,
duration INTEGER,
description TEXT,
transcription TEXT,
project_id INTEGER REFERENCES projects(id),
recorded_by VARCHAR REFERENCES users(id),
-- GPS-Tagging
gps_latitude DECIMAL(10,8),
gps_longitude DECIMAL(11,8),
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
```

### 5. Support & Kommunikation

#### `support_tickets`
```sql
id SERIAL PRIMARY KEY,
subject VARCHAR(255) NOT NULL,
description TEXT,
status VARCHAR(50) DEFAULT 'open',
priority VARCHAR(50) DEFAULT 'medium',
created_by VARCHAR REFERENCES users(id),
assigned_to VARCHAR REFERENCES users(id),
email_history JSONB,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
```

### 6. System & Analytics

#### `login_log`
```sql
id SERIAL PRIMARY KEY,
user_id VARCHAR REFERENCES users(id),
ip_address VARCHAR(45),
user_agent TEXT,
login_time TIMESTAMP DEFAULT NOW(),
logout_time TIMESTAMP,
session_duration INTEGER
```

#### `ai_log`
```sql
id SERIAL PRIMARY KEY,
user_id VARCHAR REFERENCES users(id) NOT NULL,
action VARCHAR(100) NOT NULL,
prompt TEXT NOT NULL,
response TEXT NOT NULL,
model VARCHAR(100) NOT NULL,
tokens_used INTEGER NOT NULL,
project_id INTEGER REFERENCES projects(id),
created_at TIMESTAMP DEFAULT NOW()
```

#### `data_quality`
```sql
id SERIAL PRIMARY KEY,
entity_type VARCHAR(100) NOT NULL,
entity_id INTEGER NOT NULL,
field_name VARCHAR(100),
completion_rate DECIMAL(5,2),
quality_score DECIMAL(5,2),
issues JSONB,
last_checked TIMESTAMP DEFAULT NOW(),
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
```

### 7. Lizenz-Management

#### `license_plans`
```sql
id SERIAL PRIMARY KEY,
type license_type NOT NULL UNIQUE,
name VARCHAR(100) NOT NULL,
price DECIMAL(10,2),
price_text VARCHAR(50),
features JSONB,
max_projects INTEGER,
max_users INTEGER,
storage_limit_gb INTEGER,
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
```

### 8. Hochwasserschutz-Modul

#### `hochwasser_checklisten`
```sql
id SERIAL PRIMARY KEY,
title VARCHAR(255) NOT NULL,
description TEXT,
standort VARCHAR(255),
created_by VARCHAR REFERENCES users(id),
status VARCHAR(50) DEFAULT 'offen',
priority VARCHAR(50) DEFAULT 'normal',
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
```

#### `hochwasser_checkpoints`
```sql
id SERIAL PRIMARY KEY,
checkliste_id INTEGER REFERENCES hochwasser_checklisten(id),
item_name VARCHAR(255) NOT NULL,
description TEXT,
is_checked BOOLEAN DEFAULT false,
checked_by VARCHAR REFERENCES users(id),
checked_at TIMESTAMP,
notes TEXT,
photo_path TEXT,
gps_latitude DECIMAL(10,8),
gps_longitude DECIMAL(11,8),
created_at TIMESTAMP DEFAULT NOW()
```

#### `absperrschieber`
```sql
id SERIAL PRIMARY KEY,
bezeichnung VARCHAR(255) NOT NULL,
standort TEXT,
gps_latitude DECIMAL(10,8),
gps_longitude DECIMAL(11,8),
status VARCHAR(50) DEFAULT 'unbekannt',
letzter_check TIMESTAMP,
verantwortlicher VARCHAR REFERENCES users(id),
bemerkungen TEXT,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
```

#### `schadensmeldungen`
```sql
id SERIAL PRIMARY KEY,
titel VARCHAR(255) NOT NULL,
beschreibung TEXT,
schweregrad VARCHAR(50) DEFAULT 'niedrig',
standort TEXT,
gps_latitude DECIMAL(10,8),
gps_longitude DECIMAL(11,8),
gemeldet_von VARCHAR REFERENCES users(id),
bearbeitet_von VARCHAR REFERENCES users(id),
status VARCHAR(50) DEFAULT 'neu',
fotos JSONB,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
```

#### `deichwachen`
```sql
id SERIAL PRIMARY KEY,
standort VARCHAR(255) NOT NULL,
name VARCHAR(255),
gps_latitude DECIMAL(10,8),
gps_longitude DECIMAL(11,8),
verantwortlicher VARCHAR REFERENCES users(id),
telefon VARCHAR(50),
ausrüstung JSONB,
status VARCHAR(50) DEFAULT 'aktiv',
letzte_inspektion TIMESTAMP,
notizen TEXT,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
```

## Beziehungsdiagramm

```
users
├── projects (1:many) - manager_id
├── attachments (1:many) - uploaded_by
├── photos (1:many) - taken_by
├── audio_records (1:many) - recorded_by
├── support_tickets (1:many) - created_by, assigned_to
├── login_log (1:many) - user_id
├── ai_log (1:many) - user_id
└── hochwasser_* (1:many) - created_by, verantwortlicher

projects
├── customer (many:1) - customer_id → customers.id
├── manager (many:1) - manager_id → users.id
├── customer_contact (many:1) - customer_contact_id → customer_contacts.id
├── company_contact (many:1) - company_contact_id → company_contacts.id
├── attachments (1:many) - project_id
├── photos (1:many) - project_id
├── audio_records (1:many) - project_id
└── project_locations (1:many) - project_id

customers
├── projects (1:many) - customer_id
├── contact_person (many:1) - contact_person_id → persons.id
└── customer_contacts (1:many) - customer_id

companies
├── persons (1:many) - company_id
└── company_contacts (1:many) - company_id

customer_contacts
└── customer (many:1) - customer_id → customers.id

company_contacts
└── company (many:1) - company_id → companies.id
```

## Indizes

- **sessions**: `IDX_session_expire` auf `expire`
- **users**: Unique auf `email`
- **projects**: Foreign Keys auf `customer_id`, `manager_id`
- **GPS-Felder**: Für performante Geo-Queries (latitude, longitude)

## Sicherheit

1. **Row Level Security**: Benutzer sehen nur ihre eigenen Daten
2. **Encrypted Fields**: SFTP-Passwörter verschlüsselt
3. **Audit Trail**: `created_at`, `updated_at` in allen Tabellen
4. **Session Management**: Sichere Session-Speicherung
5. **Rate Limiting**: Schutz vor API-Missbrauch

## Performance-Optimierung

1. **Connection Pooling**: Neon Serverless Pool
2. **Query Optimization**: Drizzle ORM mit typsicheren Queries
3. **Lazy Loading**: Relations werden nur bei Bedarf geladen
4. **JSONB**: Flexible Metadata-Speicherung mit Indizierung
5. **Pagination**: Große Datasets mit Cursor-basierter Paginierung

## Backup & Disaster Recovery

1. **Automatische Backups**: Tägliche PostgreSQL-Dumps
2. **Azure Blob Storage**: Cloud-Backup-Speicherung
3. **Point-in-Time Recovery**: Neon Serverless Features
4. **Data Retention**: 30-Tage-Aufbewahrung
5. **SFTP Backup**: Optionale externe Datensicherung

## Migration Strategy

```bash
# Schema-Änderungen pushen
npm run db:push

# Development
npm run db:studio  # Drizzle Studio GUI

# Production
# Automatische Migrations über Drizzle Kit
```

## Typsicherheit

Alle Tabellen haben entsprechende TypeScript-Typen:

```typescript
// Insert-Typen (ohne auto-generierte Felder)
type InsertUser = z.infer<typeof insertUserSchema>;
type InsertProject = z.infer<typeof insertProjectSchema>;

// Select-Typen (komplette Tabellendaten)
type User = typeof users.$inferSelect;
type Project = typeof projects.$inferSelect;

// Relations mit Drizzle
const projectWithCustomer = await db.query.projects.findFirst({
  with: {
    customer: true,
    manager: true,
    attachments: true
  }
});
```

## Monitoring

- **Error Learning System**: Automatische Fehlererkennung und -prävention
- **Query Performance**: Slow-Query-Logging
- **Connection Health**: Pool-Status-Monitoring
- **Data Quality**: Automatische Datenqualitäts-Checks