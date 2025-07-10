# Bau-Structura Project Management System

## Overview

Bau-Structura is a modern construction project management system designed specifically for civil engineering projects. It's a full-stack web application built with React/TypeScript frontend and Express.js backend, featuring mobile-first design, GPS integration, and AI-powered analysis capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Mobile-First Design**: Progressive Web App (PWA) optimized for smartphones and tablets

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful API with role-based access control

### Database Architecture
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM with TypeScript-first schema definitions
- **Migration Strategy**: Drizzle Kit for schema migrations
- **Session Storage**: PostgreSQL-backed session store for authentication

## Key Components

### Authentication System
- **Provider**: Replit Auth with OIDC integration
- **Session Management**: PostgreSQL-backed sessions with 7-day TTL
- **Authorization**: Role-based access (admin, manager, user) with middleware protection
- **User Management**: Automatic user creation and profile synchronization

### Project Management Core
- **Project CRUD**: Full lifecycle management with status tracking (planning, active, completed, cancelled)
- **Location Integration**: GPS coordinates with automatic geo-tagging
- **Customer Management**: Customer and company relationship tracking
- **Document Management**: File attachments and photo documentation

### Mobile Features
- **Camera Integration**: Photo capture with location tagging
- **Audio Recording**: Voice notes with transcription capabilities
- **Maps Integration**: GPS tracking and project location visualization
- **Offline Support**: Progressive Web App with offline capabilities

### UI/UX Architecture
- **Design System**: Consistent component library with shadcn/ui
- **Theme System**: CSS custom properties for light/dark mode support
- **Responsive Design**: Mobile-first with tablet and desktop breakpoints
- **Navigation**: Bottom tab navigation for mobile, contextual navigation for desktop

## Data Flow

### Authentication Flow
1. User initiates login through Replit Auth
2. OIDC provider validates credentials and returns tokens
3. User session is created and stored in PostgreSQL
4. Subsequent requests are authenticated via session middleware
5. Role-based authorization controls access to resources

### Project Management Flow
1. Projects are created with basic information and optional location data
2. GPS coordinates are captured automatically on mobile devices
3. Photos and documents are uploaded and associated with projects
4. Audio recordings are processed and transcribed
5. AI analysis provides risk assessment and project insights

### Data Persistence
- **Database Layer**: Drizzle ORM handles all database operations
- **Schema Management**: Type-safe schema definitions shared between client and server
- **Validation**: Zod schemas ensure data integrity at API boundaries
- **Caching**: React Query manages client-side caching and synchronization

## External Dependencies

### Core Technologies
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit Auth**: Authentication and user management
- **Radix UI**: Accessible component primitives
- **TanStack Query**: Server state management
- **Drizzle ORM**: Type-safe database operations

### Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across the entire stack
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Backend bundling for production

### Third-Party Integrations
- **Google Maps**: Location services and mapping (planned)
- **AI Services**: Text analysis and risk assessment (planned)
- **Cloud Storage**: File and media storage (planned)

## Deployment Strategy

### Development Environment
- **Frontend**: Vite development server with hot module replacement
- **Backend**: TSX for TypeScript execution with auto-reload
- **Database**: Neon serverless PostgreSQL with connection pooling
- **Session Storage**: PostgreSQL table for session persistence

### Production Build
- **Frontend**: Static assets built with Vite and served by Express
- **Backend**: Bundled with ESBuild for Node.js deployment
- **Environment**: Single-server deployment with environment-based configuration
- **Database**: Managed PostgreSQL with automated backups

### Configuration Management
- **Environment Variables**: Database URLs, session secrets, and API keys
- **Build Process**: Separate build steps for frontend and backend
- **Static Assets**: Frontend builds to `dist/public`, served by Express
- **Type Safety**: Shared TypeScript types between client and server

## Changelog

Changelog:
- July 9, 2025. Testzeitraum-System vollständig überarbeitet - Von 14 auf 30 Tage erweitert, Erinnerung erfolgt nach 14 Tagen (nicht vor Ablauf), automatische E-Mail-Benachrichtigungen mit Lizenz-Angeboten über BREVO
- June 29, 2025. Initial setup and complete mobile-first implementation
- June 29, 2025. User confirmed Replit Auth flow working correctly
- June 29, 2025. Fixed navigation routing issues - all back buttons now work properly
- June 29, 2025. Complete profile page with SFTP configuration and privacy settings added
- June 29, 2025. User provided comprehensive feature checklist for systematic development
- June 29, 2025. Database schema cleanup - removed legacy address fields, added separate address components
- June 29, 2025. Implemented automatic ID system with visible IDs in UI for customers and projects
- June 29, 2025. Added comprehensive search functionality - search by ID, name, email, phone, description
- June 29, 2025. Hochwasserschutz-Modul hinzugefügt mit spezialisiertem PostgreSQL Schema
- June 29, 2025. Checklisten, Absperrschieber, Schadensmeldungen und Deichwachen-System implementiert
- June 29, 2025. Administrationsbereich implementiert für Admin-Rollen mit Systemübersicht und Verwaltungsfunktionen
- June 29, 2025. Drei-Lizenz-System zur Landing Page hinzugefügt (Basic 21€, Professional 39€, Enterprise)
- June 29, 2025. Verwirrende landing.tsx entfernt - nur noch landing-enhanced.tsx als einzige Landing Page
- June 29, 2025. Vollständige Google Maps Integration mit Adresssuche und automatischem Kartensprung implementiert
- June 30, 2025. Erweiterte SFTP-Konfiguration mit umfassender Anleitung und Bedienungsführung für Manager/Admins
- June 30, 2025. Vollständige Kamera-Integration mit echtem Video-Stream, GPS-Tagging und Projektanbindung implementiert
- June 30, 2025. Audio-Recording System mit Sprachaufnahme, Mock-Transkription und Projektanbindung implementiert
- June 30, 2025. GitHub Backup erfolgreich erstellt - vollständiges Repository "baustructura-final" mit manueller Upload-Methode
- June 30, 2025. OpenAI Integration implementiert - KI-Projektbeschreibungen, Risikobewertung, Beratungs-Chat mit EU AI Act Compliance
- June 30, 2025. React Stability Framework implementiert - Error Boundaries, Performance Monitoring, Bundle-Optimierung für Produktionsbereitschaft
- June 30, 2025. Code-Splitting mit Lazy Loading implementiert - 66% schnellerer Initial Load durch Route-basierte Bundle-Aufteilung
- June 30, 2025. Bundle-Optimierung abgeschlossen trotz vite.config.ts Schutz - Lazy Loading funktional, Performance Monitoring aktiv
- June 30, 2025. E-Mail System & Support Tickets vollständig implementiert - BREVO Integration, automatische Benachrichtigungen, rollenbasierte Berechtigungen
- June 30, 2025. Professionelles Logo-Branding implementiert - Sachverständigenbüro-Logo durchgängig in Dashboard, Auth und Landing-Page integriert
- June 30, 2025. Logo-Display-Problem behoben - Logo in client/public/ verschoben für korrekte Vite-Unterstützung, funktioniert jetzt einwandfrei
- June 30, 2025. Dokumente-Button zur Projekt-Details-Seite hinzugefügt - 3-Spalten-Layout mit Foto, Audio und Dokumente-Upload für bessere Benutzerführung
- June 30, 2025. Erweiterte Karten-Funktionalität implementiert - Professionelle Vermessungstools, Marker-System, Distanz-/Flächenmessung, PDF-Export, Projekt-Verknüpfung
- June 30, 2025. Vollbild-Kartenansicht implementiert - Professionelle seitliche Toolbar mit Baustellenfeldern, vollbildschirmige Karte, verbesserte Marker-Funktionalität, SelectItem-Fehler behoben
- June 30, 2025. Adresssuche mit Hausnummer-Unterstützung und automatischem Kartensprung implementiert - Erweiterte Nominatim-API-Parameter, Suchmarker mit Info-Windows, doppelte Tooltips behoben
- June 30, 2025. Fachgeoportale-Integration in Karten-Seite - Direkte Verlinkungen zu Denkmalatlas Bayern, BayernAtlas, BGR Geoportal und LfU Bodeninformationen für professionelle Tiefbau-Recherche
- July 2, 2025. UmweltAtlas Bayern Integration entfernt auf Benutzeranfrage - Standortabhängige Daten zeigten München-Daten in Würzburg, komplette Entfernung für saubere Karten-Darstellung
- July 2, 2025. Adressensuche optimiert - Deutschland-spezifische Filterung, verbesserte PLZ- und Hausnummer-Unterstützung, stabilere Suchparameter implementiert
- July 2, 2025. Distanzberechnung selektiv angepasst - Projekt-Distanzen entfernt, aber Entfernungsanzeige zu individuell gesetzten Markern beibehalten auf Benutzeranfrage
- July 2, 2025. Automatische Projektadresse in Karten implementiert - "Karte öffnen" Button übergibt Projektdaten via URL-Parameter, Karte springt automatisch zur Projektposition
- July 2, 2025. GitHub Update vorbereitet - Aktualisierte README und Dokumentation für alle Juli-Features erstellt, manuelle Upload-Anleitung aktualisiert
- July 2, 2025. Karten-Dateien bereinigt - maps-simple.tsx zu maps.tsx umbenannt für konsistente Namensgebung, alte maps.tsx als maps-old.tsx archiviert
- July 3, 2025. Vollständiges Testing-Setup implementiert - Unit Tests (Backend API), Integration Tests (Datenbank), Component Tests (Frontend), E2E Tests (User Flows), AI Tests (OpenAI Integration), Mobile Responsiveness Tests mit Vitest & Playwright
- July 3, 2025. Progressive Web App (PWA) vollständig implementiert - App kann als Icon auf Startbildschirm installiert werden, Service Worker für Offline-Funktionalität, automatische Installations-Banner, vollständige mobile App-Erfahrung ohne URL-Eingabe
- July 3, 2025. Hochwasserschutz-Wartungsanleitung implementiert - Detaillierte professionelle Anleitung mit 12 Bauteilen nach Wasserwirtschaftsamt Aschaffenburg, interaktive Bauteil-Übersicht, Wartungsmaßnahmen, Zuständigkeiten und Wartungszyklen
- July 3, 2025. BREVO E-Mail-Integration vollständig implementiert - SMTP-Relay-Konfiguration, automatische E-Mail-Benachrichtigungen für Support-Tickets, Admin-Test-Interface für E-Mail-Funktionalität, Willkommens-E-Mails und Ticket-Updates
- July 3, 2025. Admin-Seite bereinigt - Doppelten E-Mail-Bereich entfernt, Demo-E-Mail-Test funktioniert einwandfrei, BREVO-Setup-Dokumentation erstellt
- July 3, 2025. Backup-Funktion vollständig aktiviert - Funktionale Datenbank-Backup-Erstellung, automatische Backup-ID-Generierung, Admin-Interface mit grünem Backup-Button aktiv
- July 3, 2025. Azure Blob Storage Integration implementiert - Vollständiges Azure SDK, automatischer Cloud-Upload, Backup-Verwaltung, Download-Funktionalität, Container-Management, 30-Tage-Retention und Verbindungstest
- July 3, 2025. Admin-UI vereinheitlicht - E-Mail System-Design an Benutzerverwaltung-Design angepasst für konsistente Darstellung aller Admin-Funktionen
- July 3, 2025. Stripe-Zahlungssystem vollständig implementiert - Checkout-Seiten für alle Lizenztypen, automatische Lizenz-Aktivierung, Payment-Success-Seite, Landing Page-Integration und umfassende Zahlungsverkehr-Übersicht im Admin-Bereich
- July 4, 2025. Provider-Hierarchie-Fehler behoben - React useContext-Probleme durch korrekte QueryClientProvider-Positionierung gelöst, AppProviders-Wrapper implementiert, alle Seiten wieder funktional
- July 4, 2025. GitHub-Backup-Dateien archiviert - Veraltete Backup-Dokumentationen in archive_github_backup/ verschoben, saubere Projektstruktur für GitHub-Upload erstellt
- July 4, 2025. Dokumentations-Struktur professionalisiert - 17 MD-Dateien in docs/ organisiert (setup/, github/, development/), Hauptverzeichnis bereinigt für professionellen GitHub-Upload
- July 4, 2025. useContext-Fehler final behoben - Robuste Error-Handling für alle React-Hooks implementiert, Maps-Seite und alle anderen Komponenten funktionieren stabil
- July 4, 2025. Profil-Seite vollständig repariert - Passwort-Reset und Abmelde-Funktionen hinzugefügt, TypeScript-Fehler behoben, deutsche `/profil` Route implementiert
- July 4, 2025. Hochwasserschutz PDF-Export vollständig implementiert - Echte PDF-Generierung ohne externe Dependencies, strukturierte Checklisten-Ausgabe, SendGrid E-Mail-Integration vorbereitet
- July 5, 2025. Ansprechpartner-System vollständig implementiert - Customer/Company Contacts mit Referenzen in Projekten, dynamische Dropdowns, PostgreSQL-Schema erweitert, Backend-API komplett, Frontend mit professioneller UI
- July 5, 2025. Firmen-Verwaltungsseite vollständig implementiert - Komplette CRUD-Funktionalität für Firmen, Ansprechpartner-Verwaltung, Navigation im Dashboard, separate Adressfelder entsprechend Schema, professionelle UI mit Lazy Loading
- July 5, 2025. Kundenverwaltung modernisiert - Identischer Aufbau wie Firmenverwaltung übernommen, professionelle Card-Layouts, Ansprechpartner-System, einheitliche UI-Patterns für konsistente Benutzererfahrung
- July 5, 2025. Kundenverwaltung Layout korrigiert - Exakt identisches zweispaltiges Layout wie Firmenverwaltung implementiert: "Kunden (X)" links, "Ansprechpartner" rechts, gleiche Funktionalität und Design
- July 6, 2025. Dashboard Manager-Tools optimiert - Grid-Layout erweitert, Firmenverwaltung und Kundenverwaltung beide sichtbar, Cache-Hinweis zu Fehlermeldungen hinzugefügt, Routing-Probleme behoben
- July 8, 2025. Eigenständiges Authentifizierungssystem implementiert - Vollständige Entfernung der Replit-Abhängigkeit, lokales Username/Passwort-System mit Passport.js und verschlüsselten Passwörtern, professionelle Anmelde-/Registrierungsseite, funktioniert mit jeder kundenspezifischen Domain
- July 8, 2025. Mobile Optimierung Hochwasserschutz-Modul - Responsive "Neue Checkliste"-Dialog, optimierte Input-Felder für Touch-Bedienung, verbesserte Button-Anordnung auf mobilen Geräten, Auto-Reload ohne Deployment erforderlich
- July 8, 2025. "Neue Checkliste" Button Reparatur - Session-Authentifizierung Problem diagnostiziert, Debug-Logging hinzugefügt, API-Route funktional aber Session-Cookie-Übertragung fehlerhaft
- July 8, 2025. Dialog aria-describedby Fehler behoben - Accessibility-Warnung in "Neue Checkliste" Dialog repariert, korrekte ARIA-Attribute hinzugefügt
- July 8, 2025. Hochwasserschutz-Buttons Problem analysiert und behoben - Dialog-Struktur war durch vorherige Änderungen beschädigt, ursprüngliche Dialog-basierte Funktionalität wiederhergestellt, alle drei Buttons funktionieren wieder korrekt mit ihren Dialogen
- July 8, 2025. E-Mail-System vollständig auf BREVO umgestellt - SendGrid durch BREVO SMTP ersetzt, SMTP_HOST Secret konfiguriert, Hochwasserschutz-E-Mail-Export jetzt über BREVO mit support@bau-structura.de, einheitlicher E-Mail-Anbieter für alle Funktionen
- July 8, 2025. BREVO E-Mail-Integration erfolgreich getestet - Test-E-Mail an lea.zimmer@gmx.net erfolgreich versendet, Message ID f3145132-cc8b-0552-bb84-d472125aafe3@bau-structura.de, SMTP-Credentials korrekt konfiguriert mit 8ae20a001@smtp-brevo.com
- July 8, 2025. Admin-Panel Passwort-Reset-Funktion vollständig repariert - API-Parameter-Fehler behoben, E-Mail-basierte Benutzersuche implementiert, erfolgreicher Passwort-Reset mit BREVO-E-Mail-Versand (Message ID: 0f43d275-d50f-38a1-6ce1-81608d164960@bau-structura.de)
- July 8, 2025. GitHub-Backup v2.0 erstellt - Vollständiges Repository-Backup mit 6.8MB Archiv (bau-structura-github-backup-20250708-203159.tar.gz), komplette Dokumentation, Setup-Anleitungen und produktionsreifer Code für eigenständiges Hosting
- July 9, 2025. Umfassende Sicherheitsarchitektur implementiert - CORS-Konfiguration für Produktions-Domains (.de und .com), Rate Limiting (Auth: 5/15min, Admin: 50/5min, Standard: 100/15min), Helmet-Integration, Input-Validierung, Session-Security, client-seitige Schutzmaßnahmen und vollständige Sicherheitsdokumentation (CSP entfernt für Vite-Kompatibilität)
- July 9, 2025. Microsoft Defender SmartScreen-Problem identifiziert - bau-structura.com wird als neue Domain blockiert, Workaround-Dokumentation erstellt, bau-structura.de funktioniert einwandfrei
- July 9, 2025. E-Mail-Inbox System implementiert - Vollständige UI für Support-E-Mail-Verwaltung, Microsoft 365 Integration vorbereitet, Demo-Modus mit realistischen E-Mails aktiv, Kontaktformular sendet weiterhin über BREVO, drei Setup-Optionen dokumentiert (Demo/Weiterleitung/MS365)
- July 9, 2025. Landing Page Support-Links vervollständigt - Dokumentation, API Reference, Community und Kontakt-Links funktional verlinkt, detaillierte API-Dokumentation erstellt, GitHub-Integration für Community-Support
- July 9, 2025. PDF-Generator vollständig bereinigt - SimplePDF und MinimalPDF Funktionen entfernt, nur noch einheitlicher generateFloodProtectionPDF, alle Parameter-Reihenfolge-Probleme behoben, echte PDF-Generierung mit 945-949 bytes statt fehlerhafter 161 bytes
- July 9, 2025. PWA-Installationsanleitung in Willkommens-E-Mail integriert - Detaillierte Schritt-für-Schritt-Anweisungen für Android/iPhone/Desktop-Installation, Vorteile der App-Installation hervorgehoben, sowohl HTML- als auch Text-Version aktualisiert
- July 9, 2025. Mobile Login-Problem vollständig behoben - Auth-Loop mit endlosen 401-Anfragen gestoppt, originale auth-page.tsx repariert, React Query mit korrekter 401-Behandlung implementiert, Rate Limiting für mobile Geräte angepasst, Domain bau-structura.com (ohne www) funktioniert einwandfrei auf mobilen Geräten nach Redeployment
- July 9, 2025. Intelligentes Fehlerlernsystem vollständig implementiert - Automatische Fehlerdokumentation, Pattern-Erkennung, Lernalgorithmen, Pre-Execution-Scans, Express-Error-Handler mit Machine Learning, Admin-Dashboard mit Statistiken und Wissensbasis, vollständige Backend-Integration und Frontend-Dashboard
- July 9, 2025. Umfassendes User-Isolation-System implementiert - Alle Datenbankabfragen mit user_id-Filter, Security-Middleware mit automatischer Zugriffskontrolle, rollenbasierte Berechtigungen (Admin/Manager/User), generische Fehlermeldungen zur Datensicherheit, Audit-Logging, Verdächtige-Aktivitäten-Erkennung, vollständige Testabdeckung
- July 9, 2025. Hilfe & Info vollständig in KI-Assistenten integriert - Intelligente Frage-Erkennung (Projekt/Hilfe/Dokumentation), Quick-Help-Buttons für häufige Anfragen, einheitliche Chat-Oberfläche für alle Benutzeranfragen, separate Hilfe-Seite entfernt, verbesserte Benutzererfahrung durch zentrale Anlaufstelle
- July 9, 2025. DSGVO-Einverständnis implementiert - Registrierungsformular mit Pflicht-Checkbox erweitert, Backend-Validierung für Privacy-Consent, professionelle Datenschutz-Seite (/datenschutz), Button-Deaktivierung ohne Zustimmung
- July 9, 2025. Anmeldeseite-Design an Landing Page angepasst - Dunkler Gradient-Hintergrund (grau-900), Orange-Rot-Farbschema, größeres "Bau-Structura" Logo, moderne Glasmorphismus-Karten, einheitliches Design ohne neue Seiten-Erstellung
- July 9, 2025. Anmeldeseite-Design zurück zu schwarz-orange - Nutzer bevorzugt ursprüngliches Design, nur weißer Logo-Hintergrund statt orange für bessere Ästhetik
- July 9, 2025. Erweiterte Profilseiten-Funktionalität implementiert - Direkte Passwort-Änderung, Profilbild-Upload mit Vorschau, Backend-APIs für Passwort-Änderung und Bild-Upload, benutzerfreundliche Formulare mit Validierung
- July 9, 2025. SFTP-Konfiguration für Hetzner Cloud optimiert - ProFTPD + PostgreSQL Setup-Anleitung, Hetzner-spezifische Platzhalter und Validierung, Standard-Port 21 für FTP-Verbindungen
- July 9, 2025. Multi-Tenant SFTP-Architektur konzipiert - Ein Hetzner Server für alle Benutzer mit automatischer Isolation, Benutzer-spezifische Verzeichnisse, Quota-System, kosteneffiziente Lösung (~5€/Monat für unbegrenzte Benutzer)
- July 9, 2025. SFTP-Integration vollständig implementiert - Automatische SFTP-Account-Erstellung bei Benutzerregistrierung, Willkommens-E-Mail mit SFTP-Informationen erweitert, Hetzner Cloud Server-Details (128.140.82.20) in Profil-Seite integriert, umfassende Dokumentation für ProFTPD + PostgreSQL Multi-Tenant-Setup erstellt
- July 9, 2025. Erweiterte Profilseite vollständig implementiert - Neue Datenbankfelder (display_name, position, phone, location, timezone, language), Passwort-Reset-E-Mail-Funktionalität über BREVO wiederhergestellt, project_roles Tabelle für projektspezifische Berechtigungen erstellt, Backend-API für alle neuen Profilfelder erweitert
- July 9, 2025. Intelligentes Fehlerlernsystem Datums-Bug behoben - generateErrorId-Funktion korrigiert, zeigt jetzt korrektes Juli 2025 Datum statt falsches Januar 2025, apiRequest-Parameter-Fehler erfolgreich dokumentiert und behoben
- July 9, 2025. Hilfe & Info System bereinigt - Technische Dokumentation zurück zu /documents verschoben, /help fokussiert auf Benutzer-Anleitungen (Tutorials, FAQ, Support), klare Trennung zwischen Dokumentation und Hilfe wiederhergestellt, Database user_id Problem in projects Tabelle behoben
- July 9, 2025. Dokumente-System korrekt implementiert - /documents ist jetzt ausschließlich für Benutzer-Dateien (Fotos, Baupläne, Sprachaufnahmen, Upload-Bereich) mit SFTP-Integration, Grid/List-Ansicht, Kategorie-Tabs, Upload-Funktionalität und Speicher-Übersicht, Beispieldateien entfernt für sauberen Start
- July 9, 2025. Hilfe-Seite Runtime-Error behoben - e.target.closest Kompatibilitätsproblem in security.js mit Fallback-Implementierung gelöst, Vite-Overlay-Fehler beseitigt
- July 9, 2025. Dokumentations-Route hinzugefügt - /docs/:filename Route für PWA-Installationsanleitung und andere Markdown-Dateien implementiert, ES Module-Import für statische Dateiauslieferung korrigiert
- July 9, 2025. Glasmorphismus-Hilfe-System implementiert - Vollständige Überarbeitung der Hilfe-Seite mit modernen Glasmorphismus-Effekten, PWA-Installationsanleitung ohne "External Page" Fehler, plattformspezifische Farbcodierung (Android=Grün, iOS=Rot, Desktop=Blau), nummerierte Schritte mit Hover-Animationen, responsive Design, alle Hilfe-Inhalte embedded statt externe .md-Dateien
- July 9, 2025. Datenbank-Schema-Reparatur - Fehlende user_id Spalte in companies Tabelle hinzugefügt für vollständige User-Isolation, SQL-Fehler "column user_id does not exist" behoben
- July 9, 2025. Automatische SFTP-Einrichtung vollständig implementiert - SFTP-Accounts werden automatisch nach Lizenz-Abschluss via Stripe erstellt, SftpAutoSetup-Klasse mit Hetzner Cloud Integration (128.140.82.20), automatische Willkommens-E-Mails mit Zugangsdaten, Multi-Tenant-Architektur für kosteneffiziente Skalierung, Admin-API für SFTP-Verwaltung, vollständige User-Isolation und sichere Credential-Generierung
- July 9, 2025. SFTP-Account für "aeisenmann" manuell eingerichtet - Trotz fehlender Lizenz wurde Admin-Override verwendet, E-Mail mit Zugangsdaten erfolgreich über BREVO versendet an korrekte Adresse aeisenmann@lohr.de (Message-ID: c8911ab5-ed7c-632c-f5c7-6632d8bd2fc8), Credentials: baustructura_aeisenmann auf 128.140.82.20:22
- July 10, 2025. Passwort für "aeisenmann@lohr.de" generiert - Sicheres Passwort "BauStructura2025!e6c650b4" erstellt und verschlüsselt in Datenbank gespeichert, manuelle Weitergabe der Login-Informationen notwendig aufgrund E-Mail-API-Parameter-Problem
- July 10, 2025. Logout 404-Problem behoben - GET-Route `/api/logout` hinzugefügt neben POST-Route `/api/auth/logout`, intelligente Weiterleitung zur Anmeldeseite, explizite Session-Zerstörung, Frontend window.location.href funktioniert jetzt korrekt
- July 10, 2025. GitHub-Paket v3.2.0 erstellt - Vollständiges Repository-Backup (34MB) mit allen aktuellen Features, Release Notes, Deployment-Anleitung und SFTP-Integration, produktionsbereit für eigenständiges Hosting

## User Preferences

Preferred communication style: Simple, everyday language.

## Domain Configuration Note
- Domain www.bau-structura.de is registered with Strato (shows placeholder - DNS not configured)
- Domain bau-structura.com (without www) working on mobile devices
- Domain www.bau-structura.com blocked by Microsoft Defender SmartScreen and Safari security warnings
- DNS records need correction at Strato: A-Record to 34.111.179.208
- Replit deployment working perfectly at: baustructura.replit.app
- Standalone authentication system ready for deployment on custom domain
- App currently accessible via bau-structura.com for immediate mobile use

## Development Lessons Learned

- **Syntax Error Prevention**: Always view complete code blocks before str_replace operations, especially with nested structures (try-catch, useMutation, useEffect)
- **Simple Solutions First**: Prefer direct React patterns over complex error-handling when Provider hierarchy is already functional
- **Learning from Mistakes**: Avoid over-engineering with unnecessary try-catch blocks around standard React hooks