# Bau-Structura API Documentation

## Overview

Die Bau-Structura API ist eine RESTful API, die alle Backend-Funktionen für das Projektmanagement-System bereitstellt.

## Base URL
```
https://baustructura.replit.app/api
https://www.bau-structura.de/api
```

## Authentication

Alle API-Endpunkte (außer Login/Register) erfordern eine gültige Session-Cookie:

```javascript
// Login erforderlich
POST /api/auth/login
{
  "username": "dein-username",
  "password": "dein-passwort"
}
```

## Core Endpoints

### Authentication
- `POST /api/auth/login` - Benutzer anmelden
- `POST /api/auth/logout` - Benutzer abmelden
- `GET /api/auth/user` - Aktuelle Benutzerinformationen
- `POST /api/auth/register` - Neuen Benutzer registrieren

### Projects
- `GET /api/projects` - Alle Projekte abrufen
- `POST /api/projects` - Neues Projekt erstellen
- `GET /api/projects/:id` - Einzelnes Projekt abrufen
- `PUT /api/projects/:id` - Projekt aktualisieren
- `DELETE /api/projects/:id` - Projekt löschen

### Customers
- `GET /api/customers` - Alle Kunden abrufen
- `POST /api/customers` - Neuen Kunden erstellen
- `PUT /api/customers/:id` - Kunde aktualisieren
- `DELETE /api/customers/:id` - Kunde löschen

### Companies
- `GET /api/companies` - Alle Firmen abrufen
- `POST /api/companies` - Neue Firma erstellen
- `PUT /api/companies/:id` - Firma aktualisieren
- `DELETE /api/companies/:id` - Firma löschen

### Contacts
- `GET /api/contacts` - Alle Ansprechpartner abrufen
- `POST /api/contacts` - Neuen Ansprechpartner erstellen
- `PUT /api/contacts/:id` - Ansprechpartner aktualisieren
- `DELETE /api/contacts/:id` - Ansprechpartner löschen

### Flood Protection (Hochwasserschutz)
- `GET /api/flood-checklists` - Hochwasserschutz-Checklisten
- `POST /api/flood-checklists` - Neue Checkliste erstellen
- `GET /api/flood-damage-reports` - Schadensmeldungen
- `POST /api/flood-damage-reports` - Neue Schadensmeldung
- `GET /api/flood-maintenance` - Wartungsanleitungen
- `POST /api/flood-pdf-export` - PDF-Export

### Files & Media
- `POST /api/projects/:id/photos` - Foto hochladen
- `POST /api/projects/:id/audio` - Audio-Aufnahme hochladen
- `POST /api/projects/:id/documents` - Dokument hochladen

### Admin
- `GET /api/admin/users` - Benutzerverwaltung (Admin only)
- `PUT /api/admin/users/:id` - Benutzer bearbeiten (Admin only)
- `DELETE /api/admin/users/:id` - Benutzer löschen (Admin only)
- `POST /api/admin/backup` - Datenbank-Backup erstellen

### AI Integration
- `POST /api/ai/project-description` - KI-Projektbeschreibung
- `POST /api/ai/risk-assessment` - Risikobewertung
- `POST /api/ai/document-summary` - Dokument-Zusammenfassung
- `POST /api/ai/chat` - KI-Chat für Projektberatung

## Request/Response Formats

### Standard Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Standard Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

### Project Object
```json
{
  "id": 1,
  "name": "Projekt Name",
  "description": "Projekt Beschreibung",
  "status": "active",
  "customerId": 1,
  "companyId": 1,
  "contactId": 1,
  "location": {
    "address": "Musterstraße 1",
    "city": "München",
    "postalCode": "80000",
    "country": "Deutschland",
    "coordinates": {
      "lat": 48.1351,
      "lng": 11.5820
    }
  },
  "createdAt": "2025-07-09T10:00:00Z",
  "updatedAt": "2025-07-09T10:00:00Z"
}
```

## Rate Limits

- **Standard**: 100 Requests pro 15 Minuten
- **Auth Endpoints**: 5 Requests pro 15 Minuten
- **Admin Endpoints**: 50 Requests pro 5 Minuten

## CORS Policy

Die API unterstützt Cross-Origin-Requests von:
- `https://www.bau-structura.de`
- `https://bau-structura.de`
- `https://www.bau-structura.com`
- `https://bau-structura.com`
- `https://baustructura.replit.app`

## Security

- **HTTPS Only**: Alle Anfragen müssen über HTTPS erfolgen
- **Session-based Auth**: Sichere Cookie-basierte Authentifizierung
- **Input Validation**: Alle Eingaben werden validiert
- **Rate Limiting**: Schutz vor DDoS-Attacken

## SDKs & Examples

### JavaScript/TypeScript
```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'user@example.com',
    password: 'password'
  }),
  credentials: 'include' // Wichtig für Session-Cookies
});

// Projekte abrufen
const projects = await fetch('/api/projects', {
  credentials: 'include'
}).then(res => res.json());
```

### cURL
```bash
# Login
curl -X POST https://baustructura.replit.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user@example.com","password":"password"}' \
  -c cookies.txt

# Projekte abrufen
curl https://baustructura.replit.app/api/projects \
  -b cookies.txt
```

## Support

Bei Fragen zur API wenden Sie sich an:
- **E-Mail**: support@bau-structura.de
- **GitHub**: https://github.com/baustructura/baustructura-final/issues
- **Community**: https://github.com/baustructura/baustructura-final/discussions

## Changelog

### v1.0 (Juli 2025)
- Initial API Release
- Vollständige CRUD-Operationen für alle Entitäten
- KI-Integration mit OpenAI
- Hochwasserschutz-Modul
- Admin-Funktionen
- Rate Limiting & Security Features