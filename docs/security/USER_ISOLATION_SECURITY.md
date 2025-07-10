# User Isolation Security System

## Overview

Das Bau-Structura System implementiert ein umfassendes User-Isolation-System, das sicherstellt, dass jeder Benutzer nur seine eigenen Daten sehen und bearbeiten kann. Administratoren haben Vollzugriff auf alle Daten.

## Sicherheitsprinzipien

### 1. Kern-Sicherheitsregeln

- **JEDE Datenbankabfrage MUSS user_id Filter haben**
- **JEDER API-Endpoint MUSS User-Zugriff validieren**
- **NIEMALS dürfen User fremde Daten sehen**

### 2. Generische Fehlermeldungen

Das System zeigt bei unauthorisierten Zugriffen generische "Resource not found" Meldungen an (statt "Access denied"), um keine Informationen über die Existenz fremder Daten zu verraten.

## Implementierte Sicherheitsebenen

### 1. Database Schema Security

Alle kritischen Tabellen haben `user_id` Spalten:

```sql
-- Projects table
projects.user_id VARCHAR REFERENCES users.id NOT NULL

-- Customers table  
customers.user_id VARCHAR REFERENCES users.id NOT NULL

-- Companies table
companies.user_id VARCHAR REFERENCES users.id NOT NULL

-- Persons table
persons.user_id VARCHAR REFERENCES users.id NOT NULL
```

### 2. Security Middleware

#### `enforceUserIsolation()`
- Validiert dass jeder Request einen authentifizierten User hat
- Stellt sicher dass der User in der Datenbank existiert
- Erstellt Security Context für nachfolgende Middleware

#### `validateResourceOwnership(resourceType)`
- Prüft ob User Zugriff auf spezifische Ressource hat
- Administratoren erhalten Vollzugriff
- Normale User nur Zugriff auf eigene Ressourcen

#### `requireAdmin()` / `requireManagerOrAdmin()`
- Rollenbasierte Zugriffskontrolle für privilegierte Endpunkte

#### `sanitizeResponse()`
- Entfernt sensitive Datenfelder aus API-Antworten
- Schutz vor Datenleckage

### 3. Storage Layer Security

Alle Storage-Methoden sind mit optionalen `userId` Parametern erweitert:

```typescript
// Admin Context - sieht alles
getProjects(undefined) // undefined = admin access

// User Context - nur eigene Daten
getProjects(userId) // filtered by user_id
```

### 4. API Route Security

Beispiel sichere Route-Implementierung:

```typescript
app.get("/api/projects", isAuthenticated, async (req: SecurityRequest, res) => {
  try {
    const { userId, isAdmin } = req.securityContext || {};
    const projects = await storage.getProjects(isAdmin ? undefined : userId);
    res.json(projects);
  } catch (error) {
    res.status(404).json({ message: "Resource not found" });
  }
});
```

## Sicherheitsfeatures

### 1. Audit Logging

```typescript
logSecurityEvent('SUSPICIOUS_PROXY_ACTIVITY', {
  requestId,
  userId,
  ip,
  endpoint: req.path
});
```

### 2. Verdächtige Aktivitäten Erkennung

- Monitoring von Proxy-Aktivitäten
- Erkennung von Bot-ähnlichen Zugriffsmustern
- Automatische Sicherheitswarnungen

### 3. Data Sanitization

Automatische Entfernung sensitiver Felder:
- `password`
- `sftpPassword` 
- `stripeCustomerId`
- `stripeSubscriptionId`

## Benutzerrollen und Berechtigungen

### Admin (`role: 'admin'`)
- ✅ Vollzugriff auf alle Daten
- ✅ Benutzerverwaltung
- ✅ System-Administration
- ✅ Backup-Funktionen

### Manager (`role: 'manager'`)
- ✅ Eigene Projekte verwalten
- ✅ Kunden/Firmen verwalten
- ✅ SFTP-Zugriff
- ❌ Andere User-Daten einsehen

### User (`role: 'user'`)
- ✅ Eigene Projekte einsehen
- ✅ Basis-Funktionen nutzen
- ❌ Projekte erstellen/bearbeiten
- ❌ Administrative Funktionen

## Security Headers

```typescript
// CORS für Produktions-Domains
origin: ['https://bau-structura.de', 'https://bau-structura.com']

// Rate Limiting
- Auth: 5 requests/15min
- Admin: 50 requests/5min  
- Standard: 100 requests/15min

// Security Headers via Helmet
- XSS Protection
- Content Type Validation
- Frame Options
```

## Deployment Security Checklist

### ✅ Database Security
- [x] user_id Spalten in allen Tabellen
- [x] Foreign Key Constraints
- [x] Index auf user_id Feldern

### ✅ API Security  
- [x] Security Middleware auf allen Routen
- [x] Resource Ownership Validation
- [x] Generic Error Messages
- [x] Rate Limiting konfiguriert

### ✅ Authentication Security
- [x] Session-based Authentication
- [x] Secure Cookie Settings
- [x] Password Hashing (bcrypt)
- [x] Session Timeout

### ✅ Monitoring & Logging
- [x] Security Event Logging
- [x] Suspicious Activity Detection
- [x] Request ID Tracking
- [x] Error Pattern Recognition

## Sicherheitstests

### Unit Tests
```bash
npm test -- security
```

### Integration Tests
```bash
npm test -- integration
```

### E2E Security Tests
```bash
npm run test:e2e -- security
```

## Notfall-Procedures

### Sicherheitslücke entdeckt
1. Sofortiger Stopp des betroffenen Services
2. Sicherheits-Log-Analyse
3. Patch-Entwicklung und -Test
4. Koordiniertes Update-Deployment

### Verdächtige Aktivität
1. User-Account sperren
2. Session invalidieren
3. Sicherheits-Team benachrichtigen
4. Forensische Analyse

## Compliance

### EU AI Act
- KI-Funktionen mit Transparenz-Logging
- User-Consent für KI-Features
- Bias-Monitoring in KI-Entscheidungen

### DSGVO
- Right to be Forgotten
- Data Portability
- Privacy by Design
- Consent Management

### IT-Sicherheitsgesetz
- Logging-Retention (6 Monate)
- Incident Response Process
- Regular Security Audits

## Continuous Security

### Automated Security Scans
- Dependency Vulnerability Scanning
- Code Security Analysis
- Configuration Validation

### Regular Security Reviews
- Monatliche Access Reviews
- Quarterly Penetration Tests
- Jährliche Compliance Audits

## Kontakt

Bei Sicherheitsfragen oder -vorfällen:
- **E-Mail:** security@bau-structura.de
- **Notfall:** +49 XXX XXXXXXX
- **PGP Key:** [Link zur Public Key]

---

**Letzte Aktualisierung:** 09. Juli 2025  
**Version:** 1.0  
**Verantwortlich:** System Administrator