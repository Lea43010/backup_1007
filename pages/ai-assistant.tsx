import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Button } from "../components/ui/button";
import { AIAssistant } from "../components/ai/ai-assistant";

export default function AIAssistantPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  KI-Assistent
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Introduction */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              KI-Assistent & Hilfe-Center
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Ihr intelligenter Begleiter für Projektmanagement, technische Hilfe und Dokumentation. 
              Stellen Sie Fragen zu Projekten, fordern Sie Hilfe an oder lassen Sie sich Funktionen erklären.
            </p>
          </div>

          {/* AI Assistant Component */}
          <AIAssistant />

          {/* Features Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Projektberatung
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatische Beschreibungen, Risikobewertungen und Projektoptimierung
              </p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">📚</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Dokumentation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Zugang zu API-Docs, Setup-Anleitungen und technischer Dokumentation
              </p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-xl">🎓</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Tutorials
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Schritt-für-Schritt Anleitungen für alle Funktionen der Plattform
              </p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 font-bold text-xl">💬</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Live-Hilfe
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Direkte Antworten auf Ihre Fragen - einfach im Chat nachfragen
              </p>
            </div>
          </div>

          {/* Quick Help Examples */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-4">
              💡 Beispiele: Was Sie fragen können
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800 dark:text-green-200">
              <div className="space-y-2">
                <p><strong>Projekthilfe:</strong></p>
                <p>• "Analysiere mein Projekt #123"</p>
                <p>• "Erstelle eine Risikobewertung"</p>
                <p>• "Generiere eine Projektbeschreibung"</p>
              </div>
              <div className="space-y-2">
                <p><strong>Technische Hilfe:</strong></p>
                <p>• "Wie funktioniert die Kamera-Integration?"</p>
                <p>• "Zeige mir die API-Dokumentation"</p>
                <p>• "Erkläre das Hochwasserschutz-Modul"</p>
              </div>
              <div className="space-y-2">
                <p><strong>Setup & Konfiguration:</strong></p>
                <p>• "Wie richte ich SFTP ein?"</p>
                <p>• "Deployment-Anleitung anzeigen"</p>
                <p>• "Datenschutz-Einstellungen erklären"</p>
              </div>
              <div className="space-y-2">
                <p><strong>Allgemeine Fragen:</strong></p>
                <p>• "Alle verfügbaren Funktionen"</p>
                <p>• "Neuerungen in der letzten Version"</p>
                <p>• "PWA-Installation auf Mobile"</p>
              </div>
            </div>
          </div>

          {/* EU AI Act Compliance Info */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🛡️ EU AI Act Konformität & Datenschutz
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <p>• Alle KI-generierten Inhalte sind klar als solche gekennzeichnet</p>
              <p>• Vollständige Transparenz über verwendete Modelle (OpenAI GPT-4o)</p>
              <p>• Umfassendes Logging aller KI-Interaktionen für Audit-Zwecke</p>
              <p>• Keine Verarbeitung personenbezogener Daten durch die KI</p>
              <p>• Nutzer behalten die Kontrolle über alle generierten Inhalte</p>
              <p>• Hilfe-Inhalte werden dynamisch aus lokaler Dokumentation bereitgestellt</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}