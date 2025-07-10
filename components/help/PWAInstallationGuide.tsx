import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  Smartphone, 
  Monitor, 
  Chrome, 
  Download,
  Plus,
  MoreVertical,
  Share,
  Home,
  Settings,
  CheckCircle,
  ArrowRight,
  Apple,
  ExternalLink
} from "lucide-react";

interface InstallStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
}

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  steps: InstallStep[];
}

const platforms: Platform[] = [
  {
    id: "android",
    name: "Android (Chrome/Edge)",
    icon: <Smartphone className="h-6 w-6" />,
    color: "text-green-600",
    gradient: "from-green-400 via-green-500 to-green-600",
    steps: [
      {
        id: 1,
        title: "Website öffnen",
        description: "Rufen Sie bau-structura.com in Chrome oder Edge auf",
        icon: <Chrome className="h-5 w-5" />,
        details: [
          "Öffnen Sie Chrome oder Microsoft Edge",
          "Gehen Sie zu bau-structura.com",
          "Warten Sie, bis die Seite vollständig geladen ist"
        ]
      },
      {
        id: 2,
        title: "Installations-Banner",
        description: "Tippen Sie auf 'App installieren' wenn das Banner erscheint",
        icon: <Download className="h-5 w-5" />,
        details: [
          "Ein Banner erscheint automatisch am unteren Bildschirmrand",
          "Falls nicht sichtbar: Menü (⋮) → 'App installieren'",
          "Tippen Sie auf 'Installieren' im Popup"
        ]
      },
      {
        id: 3,
        title: "App auf Homescreen",
        description: "Die App wird automatisch zum Startbildschirm hinzugefügt",
        icon: <Home className="h-5 w-5" />,
        details: [
          "Das Bau-Structura Icon erscheint auf Ihrem Homescreen",
          "Die App startet ohne Browser-Leiste",
          "Funktioniert wie eine normale Android-App"
        ]
      }
    ]
  },
  {
    id: "ios",
    name: "iPhone/iPad (Safari)",
    icon: <Apple className="h-6 w-6" />,
    color: "text-red-600",
    gradient: "from-red-400 via-red-500 to-red-600",
    steps: [
      {
        id: 1,
        title: "Safari öffnen",
        description: "Öffnen Sie bau-structura.com in Safari (wichtig!)",
        icon: <Smartphone className="h-5 w-5" />,
        details: [
          "Verwenden Sie ausschließlich Safari Browser",
          "Chrome oder andere Browser unterstützen PWA nicht",
          "Navigieren Sie zu bau-structura.com"
        ]
      },
      {
        id: 2,
        title: "Teilen-Button",
        description: "Tippen Sie auf das Teilen-Symbol in der unteren Leiste",
        icon: <Share className="h-5 w-5" />,
        details: [
          "Suchen Sie das Teilen-Symbol (Pfeil nach oben)",
          "Befindet sich in der unteren Browser-Leiste",
          "Tippen Sie darauf um das Teilen-Menü zu öffnen"
        ]
      },
      {
        id: 3,
        title: "Zum Home-Bildschirm",
        description: "Wählen Sie 'Zum Home-Bildschirm' aus der Liste",
        icon: <Plus className="h-5 w-5" />,
        details: [
          "Scrollen Sie im Teilen-Menü nach unten",
          "Tippen Sie auf 'Zum Home-Bildschirm hinzufügen'",
          "Bestätigen Sie mit 'Hinzufügen' oben rechts"
        ]
      },
      {
        id: 4,
        title: "App verwenden",
        description: "Die App ist jetzt wie eine normale iPhone-App verfügbar",
        icon: <CheckCircle className="h-5 w-5" />,
        details: [
          "Das Icon erscheint auf Ihrem Home-Bildschirm",
          "Öffnet sich im Vollbild ohne Safari-Leiste",
          "Offline-Funktionen sind verfügbar"
        ]
      }
    ]
  },
  {
    id: "desktop",
    name: "Desktop (Chrome/Edge)",
    icon: <Monitor className="h-6 w-6" />,
    color: "text-blue-600", 
    gradient: "from-blue-400 via-blue-500 to-blue-600",
    steps: [
      {
        id: 1,
        title: "Browser öffnen",
        description: "Starten Sie Chrome oder Edge auf Ihrem Computer",
        icon: <Monitor className="h-5 w-5" />,
        details: [
          "Verwenden Sie Google Chrome oder Microsoft Edge",
          "Firefox unterstützt PWA-Installation noch nicht vollständig",
          "Gehen Sie zu bau-structura.com"
        ]
      },
      {
        id: 2,
        title: "Install-Icon",
        description: "Klicken Sie auf das Plus-Symbol in der Adressleiste",
        icon: <Plus className="h-5 w-5" />,
        details: [
          "Suchen Sie das Plus-Symbol (⊕) rechts in der Adressleiste",
          "Alternativ: Menü (⋮) → 'Bau-Structura installieren'",
          "Klicken Sie darauf um den Dialog zu öffnen"
        ]
      },
      {
        id: 3,
        title: "Installation bestätigen",
        description: "Bestätigen Sie die Installation im Popup-Dialog",
        icon: <Download className="h-5 w-5" />,
        details: [
          "Ein Dialog erscheint mit App-Informationen",
          "Klicken Sie auf 'Installieren'",
          "Die App wird in Ihrer Taskleiste hinzugefügt"
        ]
      },
      {
        id: 4,
        title: "Desktop-App nutzen",
        description: "Die App startet als eigenständige Anwendung",
        icon: <ExternalLink className="h-5 w-5" />,
        details: [
          "Ein Icon wird zu Ihrem Desktop/Startmenü hinzugefügt",
          "Startet in einem eigenen Fenster ohne Browser-Leiste",
          "Funktioniert wie eine normale Desktop-Anwendung"
        ]
      }
    ]
  }
];

export default function PWAInstallationGuide() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("android");
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const currentPlatform = platforms.find(p => p.id === selectedPlatform);

  const toggleStepCompletion = (stepId: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const getCompletionPercentage = () => {
    if (!currentPlatform) return 0;
    return Math.round((completedSteps.length / currentPlatform.steps.length) * 100);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header mit Glasmorphismus */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-800 dark:via-gray-900 dark:to-blue-900/20 backdrop-blur-xl border border-white/20 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent backdrop-blur-xl"></div>
        <div className="relative p-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                📱 PWA Installation
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Installieren Sie Bau-Structura als App auf Ihrem Gerät für die beste Erfahrung
              </p>
            </div>
          </div>
          
          {/* Fortschritts-Balken */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Fortschritt</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {getCompletionPercentage()}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full bg-gradient-to-r ${currentPlatform?.gradient} transition-all duration-500`}
                style={{ width: `${getCompletionPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Selector mit Glasmorphismus */}
      <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Wählen Sie Ihr Gerät</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {platforms.map((platform) => (
              <Button
                key={platform.id}
                variant={selectedPlatform === platform.id ? "default" : "outline"}
                onClick={() => {
                  setSelectedPlatform(platform.id);
                  setCompletedSteps([]);
                }}
                className={`h-auto p-4 justify-start space-x-3 ${
                  selectedPlatform === platform.id 
                    ? `bg-gradient-to-r ${platform.gradient} text-white border-none hover:opacity-90` 
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <div className={selectedPlatform === platform.id ? "text-white" : platform.color}>
                  {platform.icon}
                </div>
                <div className="text-left">
                  <div className="font-medium">{platform.name}</div>
                  <div className={`text-xs ${selectedPlatform === platform.id ? "text-white/80" : "text-gray-500"}`}>
                    {platform.steps.length} Schritte
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Installation Steps mit Glasmorphismus */}
      {currentPlatform && (
        <div className="space-y-4">
          {currentPlatform.steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isActive = index === 0 || completedSteps.includes(currentPlatform.steps[index - 1].id);
            
            return (
              <Card 
                key={step.id}
                className={`backdrop-blur-xl border-white/20 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer ${
                  isCompleted 
                    ? `bg-gradient-to-r ${currentPlatform.gradient} text-white border-none` 
                    : isActive
                    ? "bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-blue-700"
                    : "bg-white/60 dark:bg-gray-800/60 opacity-75"
                }`}
                onClick={() => toggleStepCompletion(step.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Step Number Circle */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                      isCompleted 
                        ? "bg-white/20 text-white" 
                        : isActive
                        ? `bg-gradient-to-r ${currentPlatform.gradient} text-white`
                        : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        step.id
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={isCompleted ? "text-white/80" : currentPlatform.color}>
                          {step.icon}
                        </div>
                        <h3 className={`text-xl font-semibold ${
                          isCompleted ? "text-white" : "text-gray-900 dark:text-white"
                        }`}>
                          {step.title}
                        </h3>
                      </div>
                      
                      <p className={`text-lg mb-4 ${
                        isCompleted ? "text-white/90" : "text-gray-600 dark:text-gray-300"
                      }`}>
                        {step.description}
                      </p>

                      {/* Detailed Steps */}
                      <div className="space-y-2">
                        {step.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="flex items-start space-x-3">
                            <ArrowRight className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                              isCompleted ? "text-white/70" : "text-gray-400"
                            }`} />
                            <span className={`text-sm ${
                              isCompleted ? "text-white/90" : "text-gray-600 dark:text-gray-400"
                            }`}>
                              {detail}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Completion Badge */}
                      {isCompleted && (
                        <Badge className="mt-3 bg-white/20 text-white border-white/30">
                          ✓ Abgeschlossen
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Success Message mit Glasmorphismus */}
      {currentPlatform && completedSteps.length === currentPlatform.steps.length && (
        <Card className="backdrop-blur-xl bg-gradient-to-r from-green-50 via-green-100 to-emerald-50 dark:from-green-900/20 dark:via-green-800/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <h2 className="text-2xl font-bold text-green-800 dark:text-green-300">
                🎉 Installation erfolgreich!
              </h2>
            </div>
            <p className="text-green-700 dark:text-green-400 text-lg mb-6">
              Bau-Structura ist jetzt als App auf Ihrem {currentPlatform.name.split('(')[0]} installiert.
            </p>
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                🚀 Vorteile der App-Installation:
              </h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Schnellerer Zugriff vom Startbildschirm</li>
                <li>• Funktioniert auch ohne Internetverbindung</li>
                <li>• Keine Browser-Leiste für mehr Platz</li>
                <li>• Push-Benachrichtigungen (falls aktiviert)</li>
                <li>• Native App-Erfahrung</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Troubleshooting mit Glasmorphismus */}
      <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Settings className="h-5 w-5" />
            <span>🔧 Probleme bei der Installation?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">Android Tipps:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Chrome oder Edge verwenden</li>
                <li>• Browser auf neuste Version updaten</li>
                <li>• Cookies und JavaScript aktivieren</li>
                <li>• Im Inkognito-Modus funktioniert es nicht</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">iPhone/iPad Tipps:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Nur Safari Browser verwenden</li>
                <li>• iOS 14.3 oder neuer erforderlich</li>
                <li>• Private Browsing deaktivieren</li>
                <li>• Safari neu starten bei Problemen</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>💡 Wichtiger Hinweis:</strong> Falls das Installations-Banner nicht erscheint, 
              versuchen Sie die Seite neu zu laden oder besuchen Sie bau-structura.com direkt über die Adressleiste.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}