import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  BookOpen, 
  Camera, 
  Map, 
  Shield, 
  MessageSquare, 
  Users, 
  Settings, 
  Star, 
  AlertCircle, 
  Mail,
  Video,
  FileText,
  ArrowRight,
  CheckCircle,
  Play,
  Smartphone,
  Monitor,
  Globe,
  Lock,
  Download,
  Upload,
  Mic,
  Phone
} from "lucide-react";

interface HelpContentProps {
  contentId: string;
  onBack: () => void;
}

const helpContentData = {
  "getting-started": {
    title: "🚀 Erste Schritte",
    subtitle: "Willkommen bei Bau-Structura! Hier lernen Sie die wichtigsten Funktionen kennen.",
    gradient: "from-blue-400 via-blue-500 to-blue-600",
    sections: [
      {
        title: "Anmeldung & Profil einrichten",
        icon: <Settings className="h-5 w-5" />,
        steps: [
          "Registrieren Sie sich mit E-Mail und Passwort",
          "Vervollständigen Sie Ihr Profil in den Einstellungen",
          "Aktivieren Sie E-Mail-Benachrichtigungen",
          "Konfigurieren Sie Ihre Zeitzone und Sprache"
        ]
      },
      {
        title: "Erstes Projekt erstellen",
        icon: <FileText className="h-5 w-5" />,
        steps: [
          "Klicken Sie auf 'Neues Projekt' im Dashboard",
          "Geben Sie Name, Beschreibung und Adresse ein",
          "Wählen Sie einen Kunden oder erstellen Sie einen neuen",
          "Speichern Sie das Projekt und beginnen Sie mit der Dokumentation"
        ]
      },
      {
        title: "Mobile App nutzen",
        icon: <Smartphone className="h-5 w-5" />,
        steps: [
          "Installieren Sie die PWA (Progressive Web App)",
          "Erlauben Sie Kamera- und GPS-Zugriff",
          "Nutzen Sie Offline-Funktionen unterwegs",
          "Synchronisieren Sie Daten bei Internetverbindung"
        ]
      }
    ]
  },
  "camera-gps-features": {
    title: "📸 Kamera & GPS Funktionen",
    subtitle: "Dokumentieren Sie Ihre Projekte mit Fotos und Standortdaten.",
    gradient: "from-green-400 via-green-500 to-green-600",
    sections: [
      {
        title: "Fotos aufnehmen",
        icon: <Camera className="h-5 w-5" />,
        steps: [
          "Öffnen Sie ein Projekt in der mobilen App",
          "Tippen Sie auf 'Kamera' in der Projekt-Detailansicht",
          "Gewähren Sie Kamera-Berechtigungen bei Aufforderung",
          "Machen Sie Fotos direkt aus der App heraus",
          "Fotos werden automatisch mit GPS-Koordinaten versehen"
        ]
      },
      {
        title: "GPS-Standort erfassen",
        icon: <Globe className="h-5 w-5" />,
        steps: [
          "Aktivieren Sie GPS/Standortdienste auf Ihrem Gerät",
          "Die App erfasst automatisch Ihren aktuellen Standort",
          "Koordinaten werden bei Fotos und Projekten gespeichert",
          "Nutzen Sie die Karten-Funktion zur Visualisierung"
        ]
      },
      {
        title: "Bilder verwalten",
        icon: <Upload className="h-5 w-5" />,
        steps: [
          "Alle Fotos werden automatisch in der Cloud gespeichert",
          "Zugriff über die Dokumente-Seite",
          "Sortierung nach Projekt und Datum",
          "Download und Teilen von Bildern möglich"
        ]
      }
    ]
  },
  "audio-recording-guide": {
    title: "🎤 Sprachnotizen aufnehmen",
    subtitle: "Erstellen Sie Audio-Aufnahmen für Ihre Projekte mit KI-Transkription.",
    gradient: "from-purple-400 via-purple-500 to-purple-600",
    sections: [
      {
        title: "Audio aufnehmen",
        icon: <Mic className="h-5 w-5" />,
        steps: [
          "Gehen Sie zu einem Projekt und wählen Sie 'Audio'",
          "Erlauben Sie Mikrofon-Zugriff im Browser",
          "Drücken Sie 'Aufnahme starten'",
          "Sprechen Sie klar und deutlich",
          "Beenden Sie die Aufnahme mit 'Stopp'"
        ]
      },
      {
        title: "Transkription nutzen",
        icon: <MessageSquare className="h-5 w-5" />,
        steps: [
          "Audio wird automatisch transkribiert (Mock-Funktion)",
          "Text kann bearbeitet und korrigiert werden",
          "Speicherung als Textnotiz zum Projekt",
          "Durchsuchbar in der Projekthistorie"
        ]
      },
      {
        title: "Audio-Dateien verwalten",
        icon: <FileText className="h-5 w-5" />,
        steps: [
          "Alle Aufnahmen in der Dokumente-Übersicht",
          "Wiedergabe direkt im Browser",
          "Download als MP3-Datei möglich",
          "Automatische Backup-Erstellung"
        ]
      }
    ]
  },
  "maps-navigation": {
    title: "🗺️ Karten & Navigation",
    subtitle: "Nutzen Sie professionelle Kartenfunktionen für Ihre Bauprojekte.",
    gradient: "from-orange-400 via-orange-500 to-orange-600",
    sections: [
      {
        title: "Google Maps Integration",
        icon: <Map className="h-5 w-5" />,
        steps: [
          "Öffnen Sie die Karten-Seite im Hauptmenü",
          "Suchen Sie Adressen über die Suchleiste",
          "Setzen Sie Marker für wichtige Punkte",
          "Messen Sie Entfernungen zwischen Punkten"
        ]
      },
      {
        title: "Projekt-Standorte verwalten",
        icon: <FileText className="h-5 w-5" />,
        steps: [
          "Projekte werden automatisch auf der Karte angezeigt",
          "Klicken Sie auf 'Karte öffnen' in Projekt-Details",
          "Automatischer Sprung zum Projekt-Standort",
          "Umkreissuche nach anderen Projekten"
        ]
      },
      {
        title: "Fachgeoportale nutzen",
        icon: <Globe className="h-5 w-5" />,
        steps: [
          "Direkte Links zu Denkmalatlas Bayern",
          "Zugang zu BGR Geoportal für Bodendaten",
          "LfU Bayern für Umweltinformationen",
          "BayernAtlas für amtliche Karten"
        ]
      }
    ]
  },
  "flood-protection-module": {
    title: "🛡️ Hochwasserschutz-Modul",
    subtitle: "Professionelle Hochwasserschutz-Verwaltung mit Checklisten und Dokumentation.",
    gradient: "from-blue-400 via-cyan-500 to-blue-600",
    sections: [
      {
        title: "Checklisten erstellen",
        icon: <CheckCircle className="h-5 w-5" />,
        steps: [
          "Gehen Sie zum Hochwasserschutz-Bereich",
          "Klicken Sie auf 'Neue Checkliste'",
          "Wählen Sie Standort und Zuständigen",
          "Füllen Sie alle Prüfpunkte aus",
          "Speichern und PDF-Export generieren"
        ]
      },
      {
        title: "Wartungsanweisungen",
        icon: <Settings className="h-5 w-5" />,
        steps: [
          "12 verschiedene Hochwasserschutz-Bauteile",
          "Detaillierte Wartungsmaßnahmen nach Wasserwirtschaftsamt",
          "Zuständigkeiten und Wartungszyklen",
          "Interaktive Bauteil-Übersicht"
        ]
      },
      {
        title: "PDF-Export & E-Mail",
        icon: <Download className="h-5 w-5" />,
        steps: [
          "Automatische PDF-Generierung der Checklisten",
          "E-Mail-Versand über BREVO-System",
          "Archivierung aller Dokumente",
          "Rechtssichere Dokumentation"
        ]
      }
    ]
  }
};

export default function ModernHelpContent({ contentId, onBack }: HelpContentProps) {
  const content = helpContentData[contentId as keyof typeof helpContentData];
  
  if (!content) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Inhalt nicht gefunden
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Der angeforderte Hilfe-Inhalt ist nicht verfügbar.
        </p>
        <Button onClick={onBack}>Zurück zur Übersicht</Button>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header mit Glasmorphismus */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white/90 to-gray-50 dark:from-gray-800 dark:via-gray-800/90 dark:to-gray-900 backdrop-blur-xl border border-white/20 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent backdrop-blur-xl"></div>
        <div className="relative p-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className={`p-3 bg-gradient-to-br ${content.gradient} rounded-xl shadow-lg`}>
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {content.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {content.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {content.sections.map((section, sectionIndex) => (
          <Card 
            key={sectionIndex}
            className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className={`p-2 bg-gradient-to-br ${content.gradient} rounded-lg`}>
                  <div className="text-white">
                    {section.icon}
                  </div>
                </div>
                <span className="text-xl text-gray-900 dark:text-white">
                  {section.title}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {section.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${content.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <span className="text-white font-semibold text-sm">{stepIndex + 1}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tipps & Tricks */}
      <Card className="backdrop-blur-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-white/20 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 bg-gradient-to-br ${content.gradient} rounded-lg`}>
              <Star className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              💡 Professionelle Tipps
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Effizienz-Tipps:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Nutzen Sie Tastenkürzel für schnellere Navigation</li>
                <li>• Verwenden Sie die Suchfunktion zum schnellen Finden</li>
                <li>• Aktivieren Sie Benachrichtigungen für Updates</li>
                <li>• Erstellen Sie Favoriten für häufig genutzte Funktionen</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Qualitäts-Standards:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Dokumentieren Sie alle wichtigen Arbeitsschritte</li>
                <li>• Verwenden Sie aussagekräftige Dateinamen</li>
                <li>• Erstellen Sie regelmäßige Backups</li>
                <li>• Halten Sie Projektinformationen aktuell</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Tutorial Hinweis */}
      <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border-white/20 shadow-xl">
        <CardContent className="p-6 text-center">
          <Video className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            🎥 Video-Tutorials verfügbar
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Für komplexere Funktionen stehen Ihnen detaillierte Video-Anleitungen zur Verfügung.
          </p>
          <Button className={`bg-gradient-to-r ${content.gradient} text-white border-none hover:opacity-90`}>
            <Play className="h-4 w-4 mr-2" />
            Videos ansehen (geplant)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}