# Bau-Structura Deployment Instructions - July 2025

## Quick Start Deployment

### 1. System Requirements
```bash
- Node.js 18+ or 20+
- PostgreSQL 12+ or Neon Database
- 1GB+ RAM, 10GB+ Storage
- Ubuntu 20.04+ or similar Linux distribution
```

### 2. Environment Setup
Create `.env` file in project root:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
PGHOST=your-postgres-host
PGPORT=5432
PGUSER=your-postgres-user
PGPASSWORD=your-postgres-password
PGDATABASE=your-database-name

# Session Security
SESSION_SECRET=your-very-secure-random-session-secret-min-32-chars

# Email Configuration (BREVO)
SMTP_HOST=smtp-relay.brevo.com
SMTP_USER=your-brevo-user@smtp-brevo.com
SMTP_PASS=your-brevo-api-key
SENDGRID_API_KEY=your-legacy-sendgrid-key  # Optional

# Payment Processing
STRIPE_SECRET_KEY=sk_test_or_live_your_stripe_secret_key

# Production Domains
REPLIT_DOMAINS=bau-structura.com,bau-structura.de,www.bau-structura.com,www.bau-structura.de
```

### 3. Installation Steps
```bash
# Extract the GitHub package
tar -xzf bau-structura-github-backup-YYYYMMDD-HHMMSS.tar.gz
cd bau-structura-project

# Install dependencies
npm install

# Setup database schema
npm run db:push

# Build production assets
npm run build

# Start production server
npm start
```

### 4. Production Configuration

#### A. Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name bau-structura.com www.bau-structura.com;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### B. PM2 Process Manager
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'bau-structura',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. SFTP Server Setup (Hetzner Cloud)

#### A. Server Provisioning
```bash
# Create Hetzner Cloud server
# - CPX11: 1 vCPU, 2GB RAM, 20GB SSD (~€3.29/month)
# - Ubuntu 22.04 LTS
# - Add SSH key for secure access
```

#### B. ProFTPD + PostgreSQL Configuration
```bash
# Install required packages
sudo apt update
sudo apt install proftpd-basic proftpd-mod-pgsql postgresql-client

# Configure ProFTPD with PostgreSQL authentication
sudo nano /etc/proftpd/proftpd.conf
```

```proftpd
# /etc/proftpd/proftpd.conf
ServerName "Bau-Structura SFTP Server"
ServerType standalone
DefaultServer on
Port 21
PassivePorts 49152 65534
MasqueradeAddress 128.140.82.20  # Your server IP

# Security
DefaultRoot /var/ftp/%u
RequireValidShell off
AuthUserFile /etc/proftpd/ftpd.passwd
AuthGroupFile /etc/proftpd/ftpd.group

# PostgreSQL Authentication
LoadModule mod_sql.c
LoadModule mod_sql_postgres.c

SQLBackend postgres
SQLConnectInfo baustructura@your-postgres-host:5432 your-pg-user your-pg-password
SQLAuthTypes bcrypt
SQLUserInfo users id password NULL sftpPath NULL NULL NULL
SQLGroupInfo groups groupname gid members
SQLMinUserUID 500
SQLDefaultUID 1000
SQLDefaultGID 1000

# Logging
ExtendedLog /var/log/proftpd/access.log WRITE,READ write
ExtendedLog /var/log/proftpd/auth.log AUTH auth

# Security Settings
TLSEngine on
TLSRequired on
TLSProtocol TLSv1.2 TLSv1.3
```

#### C. User Directory Management
```bash
# Create base FTP directory
sudo mkdir -p /var/ftp
sudo chown proftpd:proftpd /var/ftp
sudo chmod 755 /var/ftp

# Setup automatic directory creation script
sudo nano /usr/local/bin/create-user-dir.sh
```

```bash
#!/bin/bash
# Automatic FTP directory creation
USER_DIR="/var/ftp/$1"
if [ ! -d "$USER_DIR" ]; then
    mkdir -p "$USER_DIR/uploads"
    chown -R proftpd:proftpd "$USER_DIR"
    chmod -R 750 "$USER_DIR"
    echo "Created directory for user: $1"
fi
```

### 6. Database Initialization

#### A. Required Tables
```sql
-- Ensure all required tables exist
CREATE TABLE IF NOT EXISTS sessions (
  sid varchar(255) PRIMARY KEY,
  sess jsonb NOT NULL,
  expire timestamp NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- Users table with all new fields
CREATE TABLE IF NOT EXISTS users (
  id varchar(255) PRIMARY KEY,
  email varchar(255) UNIQUE,
  first_name varchar(255),
  last_name varchar(255),
  display_name varchar(255),
  position varchar(255),
  phone varchar(50),
  location varchar(255),
  timezone varchar(100) DEFAULT 'Europe/Berlin',
  language varchar(10) DEFAULT 'de',
  profile_image_url varchar(500),
  role varchar(50) DEFAULT 'user',
  privacy_consent boolean DEFAULT false,
  sftp_host varchar(255),
  sftp_port integer DEFAULT 22,
  sftp_username varchar(255),
  sftp_password varchar(255),
  sftp_path varchar(500) DEFAULT '/',
  sftp_access_level integer DEFAULT 0,
  email_notifications_enabled boolean DEFAULT true,
  flood_protection_certified boolean DEFAULT false,
  password varchar(255),
  trial_start_date timestamp,
  trial_end_date timestamp,
  trial_reminder_sent boolean DEFAULT false,
  stripe_customer_id varchar(255),
  license_type varchar(50) DEFAULT 'trial',
  license_expires_at timestamp,
  payment_status varchar(50) DEFAULT 'trial',
  last_payment_date timestamp,
  stripe_subscription_id varchar(255),
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

-- Create admin user
INSERT INTO users (
  id, email, first_name, last_name, role, password, 
  trial_start_date, trial_end_date, payment_status
) VALUES (
  'admin_001',
  'admin@bau-structura.de',
  'Admin',
  'User',
  'admin',
  '$2b$10$hashed_password_here',  -- Replace with actual bcrypt hash
  NOW(),
  NOW() + INTERVAL '365 days',
  'active'
) ON CONFLICT (email) DO NOTHING;
```

### 7. Security Considerations

#### A. Firewall Configuration
```bash
# UFW Firewall setup
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 21/tcp    # FTP Control
sudo ufw allow 49152:65534/tcp  # FTP Passive Ports
sudo ufw enable
```

#### B. SSL/TLS Certificates
```bash
# Let's Encrypt with Certbot
sudo apt install certbot
sudo certbot certonly --standalone -d bau-structura.com -d www.bau-structura.com

# Auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### 8. Monitoring & Maintenance

#### A. Log Monitoring
```bash
# Setup log rotation
sudo nano /etc/logrotate.d/bau-structura
```

```logrotate
/var/log/bau-structura/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    postrotate
        pm2 reload bau-structura
    endscript
}
```

#### B. Health Checks
```bash
# Create health check script
cat > /usr/local/bin/health-check.sh << EOF
#!/bin/bash
# Health check for Bau-Structura
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "Application healthy"
    exit 0
else
    echo "Application unhealthy - restarting"
    pm2 restart bau-structura
    exit 1
fi
EOF

chmod +x /usr/local/bin/health-check.sh

# Add to crontab
echo "*/5 * * * * /usr/local/bin/health-check.sh" | crontab -
```

### 9. Backup Strategy

#### A. Database Backups
```bash
# Daily database backup
cat > /usr/local/bin/db-backup.sh << EOF
#!/bin/bash
BACKUP_DIR="/var/backups/bau-structura"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump $DATABASE_URL > $BACKUP_DIR/db_backup_$DATE.sql
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/db-backup.sh
echo "0 2 * * * /usr/local/bin/db-backup.sh" | crontab -
```

### 10. Performance Optimization

#### A. Node.js Production Settings
```bash
# Add to .env
NODE_ENV=production
NODE_OPTIONS="--max-old-space-size=1024"
UV_THREADPOOL_SIZE=4
```

#### B. Database Optimization
```sql
-- Add performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_expire ON sessions(expire);

-- Update statistics
ANALYZE;
```

### 11. Troubleshooting

#### Common Issues
1. **Database Connection**: Check DATABASE_URL and network connectivity
2. **Session Issues**: Verify SESSION_SECRET is set and consistent
3. **Email Delivery**: Confirm BREVO SMTP credentials are correct
4. **SFTP Access**: Check ProFTPD logs and PostgreSQL authentication
5. **Mobile Issues**: Ensure secure cookies work with HTTPS

#### Log Locations
- Application: `/var/log/bau-structura/`
- Nginx: `/var/log/nginx/`
- ProFTPD: `/var/log/proftpd/`
- PM2: `~/.pm2/logs/`

---

**Support Contact**: support@bau-structura.de  
**Documentation**: https://github.com/your-org/bau-structura  
**Last Updated**: July 10, 2025