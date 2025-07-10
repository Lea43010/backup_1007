# Sicherheitsrichtlinien - Bau-Structura

## Übersicht

Bau-Structura implementiert umfassende Sicherheitsmaßnahmen zum Schutz von Benutzerdaten, Projektinformationen und Systemintegrität.

## Content Security Policy (CSP)

### Implementierung
Die CSP wird serverseitig über Express-Middleware implementiert und verhindert XSS-Angriffe durch restriktive Richtlinien.

### Richtlinien
```javascript
'default-src': ["'self'"],
'script-src': ["'self'", "'nonce-based'", "'strict-dynamic'"],
'style-src': ["'self'", "'unsafe-inline'"], // Für Tailwind CSS
'img-src': ["'self'", "data:", "blob:", "https:"],
'connect-src': ["'self'", "https://api.stripe.com", "https://maps.googleapis.com"],
'object-src': ["'none'"],
'base-uri': ["'self'"],
'form-action': ["'self'"],
'frame-ancestors': ["'none'"]
```

### Nonce-System
- Dynamische Nonce-Generierung für jeden Request
- Kryptographisch sichere Zufallswerte
- Automatic Integration in React-Komponenten

## CORS-Konfiguration

### Erlaubte Origins
**Produktion:**
- `https://www.bau-structura.de`
- `https://bau-structura.de`
- `*.replit.app` (für Deployment)

**Entwicklung:**
- `http://localhost:*`
- `http://127.0.0.1:*`

### Einstellungen
```javascript
credentials: true,
methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cookie'],
maxAge: 86400 // 24 Stunden
```

## Rate Limiting

### Globale Limits
- **Standard**: 100 Requests pro 15 Minuten pro IP
- **Auth-Routen**: 5 Login-Versuche pro 15 Minuten
- **Admin-Routen**: 50 Requests pro 5 Minuten

### Implementierung
```javascript
// Standard Rate Limiting
windowMs: 15 * 60 * 1000, // 15 Minuten
max: 100,

// Auth Rate Limiting (strenger)
windowMs: 15 * 60 * 1000,
max: 5,
skipSuccessfulRequests: true
```

## Sicherheits-Headers

### Serverseitige Headers
```javascript
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(self), microphone=(self), camera=(self)
```

### Client-seitige Meta-Tags
```html
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="X-XSS-Protection" content="1; mode=block">
<meta name="referrer" content="strict-origin-when-cross-origin">
```

## Authentifizierung & Sessions

### Session-Sicherheit
```javascript
name: 'bau-structura-session',
secret: process.env.SESSION_SECRET,
cookie: {
  secure: true, // HTTPS only in production
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Tage
  sameSite: 'lax'
},
rolling: true // Session-Verlängerung bei Aktivität
```

### Passwort-Sicherheit
- **Hashing**: bcryptjs mit Salt
- **Mindestanforderungen**: 8+ Zeichen, Groß-/Kleinbuchstaben, Zahlen
- **Reset-Mechanismus**: Secure Token mit Zeitlimit

## Input-Validierung

### Server-seitige Validierung
```javascript
// Zod-Schema für alle API-Eingaben
const projectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  // ... weitere Validierungen
});
```

### Sanitisierung
- Entfernung von Null-Bytes
- HTML-Escape für Ausgaben
- SQL-Injection-Schutz durch ORM (Drizzle)

## Client-seitige Sicherheit

### Content Protection
```javascript
// Kontextmenü deaktivieren (Produktion)
document.addEventListener('contextmenu', e => e.preventDefault());

// Entwicklertools blockieren
document.addEventListener('keydown', function(e) {
  if (e.keyCode === 123) e.preventDefault(); // F12
  if (e.ctrlKey && e.shiftKey && e.keyCode === 73) e.preventDefault(); // Ctrl+Shift+I
});
```

### Session-Überwachung
- Automatische Timeout-Warnung (30 Min vor Ablauf)
- Aktivitäts-Tracking
- Automatische Abmeldung bei Inaktivität

### Secure Storage
```javascript
window.SecureStorage = {
  set: (key, value, encrypt = false) => { /* verschlüsselter localStorage */ },
  get: (key, decrypt = false) => { /* sichere Datenabfrage */ },
  clear: () => { /* Bereinigung sensibler Daten */ }
};
```

## Datenbank-Sicherheit

### Zugriffskontrolle
- Rollenbasierte Berechtigungen (Admin, Manager, User)
- Prepared Statements (Drizzle ORM)
- Connection Pooling mit Limits

### Verschlüsselung
- **Transport**: TLS 1.3 für alle DB-Verbindungen
- **At Rest**: PostgreSQL-Verschlüsselung
- **Sensible Daten**: Passwörter mit bcrypt gehashed

## API-Sicherheit

### Endpunkt-Schutz
```javascript
// Middleware-Stack
app.use(helmet()); // Basis-Sicherheitsheader
app.use(cors(corsOptions)); // CORS-Konfiguration
app.use(rateLimit(rateLimitConfig)); // Rate Limiting
app.use(contentSecurityPolicy); // CSP
app.use(validateInput); // Input-Validierung
```

### Fehlerbehandlung
- Sichere Fehlerausgaben (keine Stack Traces in Produktion)
- Logging von Sicherheitsereignissen
- Automatische CSP-Violation-Reports

## E-Mail-Sicherheit

### BREVO SMTP
- **Verschlüsselung**: TLS/SSL
- **Authentifizierung**: API-Key basiert
- **Rate Limiting**: Separate Limits für E-Mail-Versand

### Content-Schutz
```javascript
// Sichere E-Mail-Templates
const emailTemplate = {
  from: 'support@bau-structura.de',
  subject: escapeHtml(subject),
  html: sanitizeHtml(htmlContent)
};
```

## Monitoring & Logging

### Sicherheits-Events
- Failed Login-Versuche
- CSP-Violations
- Rate Limit-Überschreitungen
- Admin-Aktivitäten

### Compliance
- **DSGVO**: Datenminimierung, Benutzerrechte
- **EU AI Act**: KI-Interaktions-Logging
- **Session-Protokollierung**: Admin-Aktionen

## Deployment-Sicherheit

### Produktions-Environment
```bash
NODE_ENV=production
SESSION_SECRET=<starkes-geheimes-passwort>
DATABASE_URL=<ssl-verschlüsselte-verbindung>
STRIPE_SECRET_KEY=<live-api-key>
```

### SSL/TLS
- **Domain**: www.bau-structura.de mit Let's Encrypt
- **HSTS**: Preload-Liste Eintragung
- **Certificate Pinning**: Geplant für mobile Apps

## Incident Response

### Sicherheitsvorfälle
1. **Erkennung**: Monitoring-Alerts
2. **Eindämmung**: Automatische IP-Blockierung
3. **Untersuchung**: Log-Analyse
4. **Behebung**: Patch-Deployment
5. **Nachbereitung**: Security-Review

### Kontakte
- **Sicherheitsteam**: security@bau-structura.de
- **Notfall**: +49 (0) 123 456789
- **Backup-Admin**: admin@bau-structura.de

## Wartung & Updates

### Regelmäßige Tasks
- **Wöchentlich**: Dependency-Updates
- **Monatlich**: Security-Scans
- **Quartalsweise**: Penetration-Tests
- **Jährlich**: Vollständige Security-Audits

### Update-Prozess
1. Security-Patches: Sofortige Anwendung
2. Dependencies: Wöchentliche Prüfung
3. Framework-Updates: Monatliche Evaluierung
4. Major-Releases: Geplante Rollouts

---

**Erstellt**: Juli 2025  
**Verantwortlich**: Security Team  
**Review**: Monatlich  
**Status**: Aktiv ✅