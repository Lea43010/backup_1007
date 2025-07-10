# Bau-Structura - Tiefbau Projektmanagement App

Eine moderne, mobile-optimierte Projektmanagement-Anwendung für Tiefbau-Projekte mit spezialisierten Funktionen für Hochwasserschutz und Notfallmanagement.

## 🚀 Features

### Kernfunktionen
- **Projektmanagement**: Vollständige Projektverwaltung mit Status-Tracking
- **Kunden- und Firmenverwaltung**: Umfassende Kontaktverwaltung
- **GPS-Integration**: Automatische Standorterfassung für Projekte
- **Dokumentenmanagement**: Upload und Verwaltung von Projektdokumenten
- **Mobile-First Design**: Optimiert für Smartphones und Tablets

### Hochwasserschutz-Modul
- **Checklisten-System**: Detaillierte Aufgabenverwaltung für Hochwasserereignisse
- **Absperrschieber-Verwaltung**: Überwachung und Wartung von Hochwasserschutzanlagen
- **Schadensmeldungen**: Erfassung und Tracking von Schäden
- **Deichwachen**: Verwaltung von Überwachungsschichten

### Technische Features
- **Benutzerrollenmanagement**: Admin, Manager, Benutzer-Rollen
- **SFTP-Integration**: Automatischer Dokumenten-Upload
- **Offline-Support**: Progressive Web App (PWA)
- **Real-time Updates**: Live-Synchronisation von Daten

## 🛠 Technologie-Stack

### Frontend
- **React 18** mit TypeScript
- **Vite** als Build-Tool
- **Tailwind CSS** für Styling
- **shadcn/ui** Komponenten-Bibliothek
- **TanStack Query** für State Management
- **Wouter** für Client-seitiges Routing

### Backend
- **Node.js** mit Express.js
- **TypeScript** für Typsicherheit
- **PostgreSQL** mit Neon Serverless
- **Drizzle ORM** für Datenbankoperationen
- **Replit Auth** für Authentifizierung

### Development Tools
- **ESBuild** für Backend-Bundling
- **Drizzle Kit** für Datenbank-Migrationen
- **Zod** für Schema-Validierung

## 🚦 Installation & Setup

```bash
# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev

# Datenbank-Schema aktualisieren
npm run db:push
```

## 📱 Mobile-First Design

Die Anwendung wurde speziell für den mobilen Einsatz auf Baustellen entwickelt:

- Touch-optimierte Benutzeroberfläche
- Kamera-Integration für Foto-Dokumentation
- GPS-Tracking für Standortdaten
- Offline-Funktionalität für Bereiche ohne Internetverbindung
- Bottom-Navigation für einhändige Bedienung

## 🔐 Sicherheit & Authentifizierung

- **OAuth 2.0** über Replit Auth
- **Session-basierte Authentifizierung** mit PostgreSQL-Speicherung
- **Rollenbasierte Zugriffskontrolle** (RBAC)
- **HTTPS-Verschlüsselung** für alle Datenübertragungen

## 📊 Projektstruktur

```
bau-structura/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Wiederverwendbare Komponenten
│   │   ├── pages/         # Seiten-Komponenten
│   │   ├── hooks/         # Custom React Hooks
│   │   └── lib/           # Utility-Funktionen
├── server/                # Express Backend
│   ├── db.ts             # Datenbankverbindung
│   ├── routes.ts         # API-Routen
│   ├── storage.ts        # Datenbank-Operationen
│   └── replitAuth.ts     # Authentifizierung
├── shared/               # Geteilte TypeScript-Typen
│   └── schema.ts         # Datenbank-Schema & Validierung
└── replit.md            # Projekt-Dokumentation
```

## 🌊 Hochwasserschutz-Features

Das spezialisierte Hochwasserschutz-Modul bietet:

### Checklisten-Management
- 11 detaillierte Aufgaben pro Checkliste
- Pegelstand-Erfassung und -Tracking
- Fortschritts-Monitoring
- Foto-Dokumentation für jeden Arbeitsschritt

### Anlagen-Überwachung
- Absperrschieber-Inventar mit Standorten
- Wartungshistorie und Status-Tracking
- Schadensfall-Dokumentation mit Prioritäten
- Maßnahmen-Verfolgung

### Notfall-Management
- Deichwachen-Schichtplanung
- Real-time Status-Updates
- Koordination zwischen Einsatzkräften

## 📈 Development Roadmap

- [ ] Google Maps Integration
- [ ] KI-gestützte Risikoanalyse
- [ ] Cloud-Storage Integration
- [ ] Push-Benachrichtigungen
- [ ] Export-Funktionen (PDF, Excel)
- [ ] Multi-Language Support

## 👥 Team & Support

Entwickelt für moderne Tiefbau-Unternehmen mit Fokus auf Effizienz, Sicherheit und Benutzerfreundlichkeit.

---

**Status**: ✅ Aktive Entwicklung  
**Version**: 1.0.0  
**Letztes Update**: Juni 2025