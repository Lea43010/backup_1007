import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { PageHeader } from "../components/layout/page-header";
import { MobileNav } from "../components/layout/mobile-nav";
import { 
  FileText, 
  Search,
  BookOpen,
  Settings,
  Shield,
  Smartphone,
  ArrowLeft,
  ExternalLink,
  Info,
  AlertCircle,
  Star,
  HelpCircle,
  Video,
  Mail,
  Camera,
  Map,
  Users,
  MessageSquare
} from "lucide-react";
import { useLocation } from "wouter";
import PWAInstallationGuide from "../components/help/PWAInstallationGuide";
import ModernHelpContent from "../components/help/ModernHelpContent";

interface HelpItem {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "tutorial" | "faq" | "video" | "contact";
  accessLevel: "all" | "manager" | "admin";
  lastUpdated: string;
  priority: "high" | "medium" | "low";
  status: "complete" | "draft" | "updated";
  downloadUrl?: string;
  externalUrl?: string;
  icon: React.ReactNode;
}

const helpLibrary: HelpItem[] = [
  // Erste Schritte
  {
    id: "getting-started",
    title: "Erste Schritte",
    description: "Schnellstart-Anleitung für neue Benutzer - Projekte erstellen, Kamera nutzen, GPS-Funktionen",
    category: "Erste Schritte",
    type: "tutorial",
    accessLevel: "all",
    lastUpdated: "2025-07-09",
    priority: "high",
    status: "complete",
    icon: <BookOpen className="h-5 w-5" />
  },
  {
    id: "mobile-app-installation",
    title: "Mobile App Installation",
    description: "PWA auf Smartphone installieren - Schritt für Schritt Anleitung für Android und iPhone",
    category: "Erste Schritte", 
    type: "tutorial",
    accessLevel: "all",
    lastUpdated: "2025-07-09",
    priority: "high",
    status: "complete",

    icon: <Smartphone className="h-5 w-5" />
  },
  {
    id: "project-management-basics",
    title: "Projekt-Verwaltung Grundlagen",
    description: "Projekte erstellen, bearbeiten, Kunden zuordnen und GPS-Koordinaten erfassen",
    category: "Erste Schritte",
    type: "tutorial", 
    accessLevel: "all",
    lastUpdated: "2025-07-09",
    priority: "high",
    status: "complete",
    icon: <FileText className="h-5 w-5" />
  },

  // Funktionen erklärt
  {
    id: "camera-gps-features",
    title: "Kamera & GPS Funktionen",
    description: "Fotos mit GPS-Tagging aufnehmen, Standort-Daten erfassen und Projekten zuordnen",
    category: "Funktionen erklärt",
    type: "tutorial",
    accessLevel: "all",
    lastUpdated: "2025-07-09",
    priority: "medium",
    status: "complete",
    icon: <Camera className="h-5 w-5" />
  },
  {
    id: "audio-recording-guide",
    title: "Sprachnotizen aufnehmen",
    description: "Audio-Aufnahmen erstellen, transkribieren lassen und Projekten hinzufügen",
    category: "Funktionen erklärt",
    type: "tutorial",
    accessLevel: "all",
    lastUpdated: "2025-07-09",
    priority: "medium",
    status: "complete",
    icon: <Video className="h-5 w-5" />
  },
  {
    id: "maps-navigation",
    title: "Karten & Navigation",
    description: "Google Maps Integration, Adresssuche, Marker setzen und Entfernungen messen",
    category: "Funktionen erklärt",
    type: "tutorial",
    accessLevel: "all",
    lastUpdated: "2025-07-09",
    priority: "medium",
    status: "complete",
    icon: <Map className="h-5 w-5" />
  },
  {
    id: "flood-protection-module",
    title: "Hochwasserschutz-Modul",
    description: "Checklisten erstellen, Wartungsanweisungen abrufen und PDF-Exporte generieren",
    category: "Funktionen erklärt",
    type: "tutorial",
    accessLevel: "all",
    lastUpdated: "2025-07-09",
    priority: "medium",
    status: "complete",
    icon: <Shield className="h-5 w-5" />
  },
  {
    id: "ai-assistant-help",
    title: "KI-Assistent verwenden", 
    description: "Projektberatung, Risikobewertung und intelligente Hilfe-Funktionen nutzen",
    category: "Funktionen erklärt",
    type: "tutorial",
    accessLevel: "all",
    lastUpdated: "2025-07-09",
    priority: "medium",
    status: "complete",
    icon: <MessageSquare className="h-5 w-5" />
  },
  {
    id: "customer-company-management",
    title: "Kunden & Firmen verwalten",
    description: "Kontakte anlegen, Ansprechpartner zuordnen und Projektbeziehungen verwalten",
    category: "Funktionen erklärt",
    type: "tutorial",
    accessLevel: "all",
    lastUpdated: "2025-07-09",
    priority: "medium",
    status: "complete",
    icon: <Users className="h-5 w-5" />
  },

  // Häufige Fragen (FAQ)
  {
    id: "account-management-faq",
    title: "Konto & Profil verwalten",
    description: "Passwort ändern, Profil-Informationen bearbeiten, SFTP-Zugang konfigurieren",
    category: "Häufige Fragen (FAQ)",
    type: "faq",
    accessLevel: "all",
    lastUpdated: "2025-07-09",
    priority: "high",
    status: "complete",
    icon: <Settings className="h-5 w-5" />
  },
  {
    id: "licensing-trial-faq",
    title: "Lizenzen & Testzeitraum",
    description: "Lizenz-Optionen verstehen, Testzeitraum verlängern, Zahlungen verwalten",
    category: "Häufige Fragen (FAQ)",
    type: "faq",
    accessLevel: "all",
    lastUpdated: "2025-07-09",
    priority: "high",
    status: "complete",
    icon: <Star className="h-5 w-5" />
  },
  {
    id: "troubleshooting-common",
    title: "Häufige Probleme lösen",
    description: "Login-Probleme, App-Installation, Kamera-Zugriff und GPS-Probleme beheben",
    category: "Häufige Fragen (FAQ)",
    type: "faq",
    accessLevel: "all",
    lastUpdated: "2025-07-09",
    priority: "medium",
    status: "complete",
    icon: <AlertCircle className="h-5 w-5" />
  },
  {
    id: "data-backup-faq",
    title: "Datensicherung & SFTP",
    description: "Wie werden meine Daten gesichert? SFTP-Server nutzen und Dateien verwalten",
    category: "Häufige Fragen (FAQ)",
    type: "faq",
    accessLevel: "all",
    lastUpdated: "2025-07-09",
    priority: "medium",
    status: "complete",
    icon: <Shield className="h-5 w-5" />
  },

  // Support & Kontakt
  {
    id: "contact-support",
    title: "Support kontaktieren",
    description: "Direkter Kontakt zum Support-Team - E-Mail, Chat und Ticket-System",
    category: "Support & Kontakt",
    type: "contact",
    accessLevel: "all",
    lastUpdated: "2025-07-09",
    priority: "high",
    status: "complete",
    externalUrl: "/support",
    icon: <Mail className="h-5 w-5" />
  },
  {
    id: "feature-requests",
    title: "Feature-Wünsche einreichen",
    description: "Neue Funktionen vorschlagen und Verbesserungsideen mitteilen",
    category: "Support & Kontakt",
    type: "contact",
    accessLevel: "all",
    lastUpdated: "2025-07-09",
    priority: "medium",
    status: "complete",
    externalUrl: "/support",
    icon: <Star className="h-5 w-5" />
  },
  {
    id: "bug-reporting",
    title: "Fehler melden",
    description: "Probleme und Bugs dem Entwicklerteam melden - mit Screenshots und Details",
    category: "Support & Kontakt",
    type: "contact",
    accessLevel: "all",
    lastUpdated: "2025-07-09",
    priority: "medium",
    status: "complete",
    externalUrl: "/support",
    icon: <AlertCircle className="h-5 w-5" />
  }
];

export default function Help() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const userRole = (user as any)?.role || "user";

  // Filter items based on access level, search term, and category
  const filteredHelp = helpLibrary.filter(item => {
    const hasAccess = item.accessLevel === "all" || 
                     (item.accessLevel === "manager" && ["manager", "admin"].includes(userRole)) ||
                     (item.accessLevel === "admin" && userRole === "admin");
    
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    
    return hasAccess && matchesSearch && matchesCategory;
  });

  const categories = ["all", ...Array.from(new Set(helpLibrary.map(item => item.category)))];

  const [selectedHelpItem, setSelectedHelpItem] = useState<string | null>(null);

  const handleItemClick = (item: HelpItem) => {
    // PWA Installation bekommt spezielle Glasmorphismus-Behandlung
    if (item.id === "mobile-app-installation") {
      setSelectedHelpItem("pwa-installation");
    }
    // Andere Tutorial-Inhalte werden über ModernHelpContent angezeigt
    else if (["getting-started", "camera-gps-features", "audio-recording-guide", "maps-navigation", "flood-protection-module"].includes(item.id)) {
      setSelectedHelpItem(item.id);
    }
    // Externe Links und Support-Seiten
    else if (item.externalUrl) {
      setLocation(item.externalUrl);
    } else if (item.downloadUrl) {
      window.open(item.downloadUrl, '_blank');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete": return "bg-green-100 text-green-800";
      case "updated": return "bg-blue-100 text-blue-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Wenn PWA-Installation ausgewählt ist, zeige die Glasmorphismus-Anleitung
  if (selectedHelpItem === "pwa-installation") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        <PageHeader 
          title="📱 PWA Installation" 
          subtitle="App-Installation mit modernen Glasmorphismus-Effekten"
          onBack={() => setSelectedHelpItem(null)}
        />
        
        <div className="container mx-auto px-4 py-6">
          <PWAInstallationGuide />
        </div>
        
        <MobileNav />
      </div>
    );
  }

  // Wenn andere Hilfe-Inhalte ausgewählt sind, zeige ModernHelpContent
  if (selectedHelpItem && selectedHelpItem !== "pwa-installation") {
    const selectedItem = helpLibrary.find(item => item.id === selectedHelpItem);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-blue-900/20">
        <PageHeader 
          title={selectedItem?.title || "Hilfe-Inhalt"} 
          subtitle="Detaillierte Anleitung mit modernen Glasmorphismus-Effekten"
          onBack={() => setSelectedHelpItem(null)}
        />
        
        <div className="container mx-auto px-4 py-6">
          <ModernHelpContent 
            contentId={selectedHelpItem} 
            onBack={() => setSelectedHelpItem(null)} 
          />
        </div>
        
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader 
        title="Hilfe & Support" 
        subtitle="Anleitungen, FAQ und Support für Bau-Structura"
        onBack={() => setLocation('/dashboard')}
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Hilfe-Themen durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-sm"
              >
                {category === "all" ? "Alle Kategorien" : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Help Items Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredHelp.map((item) => (
            <Card 
              key={item.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleItemClick(item)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      {item.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
                    </div>
                  </div>
                  {(item.downloadUrl || item.externalUrl) && (
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge 
                    variant="secondary" 
                    className={getStatusColor(item.status)}
                  >
                    {item.status === "complete" ? "Vollständig" : 
                     item.status === "updated" ? "Aktualisiert" : "Entwurf"}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={getPriorityColor(item.priority)}
                  >
                    {item.priority === "high" ? "Wichtig" : 
                     item.priority === "medium" ? "Normal" : "Optional"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{item.category}</span>
                  <span>Aktualisiert: {item.lastUpdated}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredHelp.length === 0 && (
          <Card className="p-8 text-center">
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Keine Hilfe-Themen gefunden
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Versuchen Sie andere Suchbegriffe oder wählen Sie eine andere Kategorie.
            </p>
          </Card>
        )}

        {/* Quick Help Box */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Brauchen Sie weitere Hilfe?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Unser KI-Assistent kann Ihnen bei spezifischen Fragen helfen oder kontaktieren Sie direkt unser Support-Team.
                </p>
                <div className="flex space-x-3">
                  <Button onClick={() => setLocation('/ai-assistant')} className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>KI-Assistent</span>
                  </Button>
                  <Button variant="outline" onClick={() => setLocation('/support')}>
                    <Mail className="h-4 w-4 mr-2" />
                    Support kontaktieren
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiken */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{filteredHelp.length}</p>
                <p className="text-xs text-gray-600">Verfügbar</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredHelp.filter(i => i.type === "tutorial").length}
                </p>
                <p className="text-xs text-gray-600">Anleitungen</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredHelp.filter(i => i.type === "faq").length}
                </p>
                <p className="text-xs text-gray-600">FAQ</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredHelp.filter(i => i.type === "contact").length}
                </p>
                <p className="text-xs text-gray-600">Support</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <MobileNav />
    </div>
  );
}