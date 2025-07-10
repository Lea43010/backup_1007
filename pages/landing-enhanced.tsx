import { Button } from "../components/ui/button";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ContactForm } from "../components/ContactForm";
import { 
  MapPin, 
  Camera, 
  Brain, 
  Smartphone, 
  Users, 
  TrendingUp, 
  Hammer, 
  Rocket, 
  Play,
  Network,
  FileText,
  Search,
  Shield,
  Clock,
  BarChart3,
  Wrench,
  Building,
  ArrowRight,
  CheckCircle,
  Star,
  Truck,
  HardHat,
  Zap,
  Check,
  Crown,
  Mail,
  MessageSquare
} from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const features = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "GPS & Kartierung",
      description: "Präzise Standorterfassung mit Google Maps Integration, automatisches Geo-Tagging und Offline-Kartierung für alle Projektdaten.",
      color: "bg-blue-500",
      demo: "München Hauptbahnhof: 48.1402°N, 11.5583°O"
    },
    {
      icon: <Camera className="h-6 w-6" />,
      title: "Foto & Audio Dokumentation",
      description: "Baufortschritt dokumentieren mit Kamera, HD-Videoaufnahmen, Sprachnotizen und automatischer KI-Transkription.",
      color: "bg-orange-500",
      demo: "23 Fotos • 8 Audio-Notizen • 4 Videos heute"
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "KI-Analyse (EU AI Act konform)",
      description: "Automatische Risikobewertung, intelligente Projektbeschreibungen und Dokumentzusammenfassungen mit OpenAI.",
      color: "bg-green-500",
      demo: "Risiko-Score: Niedrig (2/10) • 5 KI-Empfehlungen"
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Mobile-First PWA",
      description: "Vollständig responsive für Smartphone, Tablet und Desktop. Offline-Funktionalität als Progressive Web App.",
      color: "bg-purple-500",
      demo: "Offline verfügbar • < 3s Ladezeit • Touch-optimiert"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Rollen & Berechtigungen",
      description: "3-stufiges System: Administrator, Manager und Benutzer mit individuellen Dashboards und Zugriffskontrollen.",
      color: "bg-red-500",
      demo: "Administrator: Vollzugriff • Manager: 8 Projekte • User: 3 Projekte"
    },
    {
      icon: <Network className="h-6 w-6" />,
      title: "SFTP Integration",
      description: "Automatisches Backup aller Projektdokumente auf eigene SFTP-Server mit Versionierung und Synchronisation.",
      color: "bg-cyan-500",
      demo: "Letztes Backup: vor 2 Stunden • 1.2 GB synchronisiert"
    }
  ];



  const demoProjects = [
    {
      id: "P001",
      name: "Straßensanierung B12 München",
      status: "Aktiv",
      progress: 68,
      location: "München, Bayern",
      budget: "€ 2.4M",
      deadline: "15. Aug 2025",
      manager: "Thomas Müller",
      risk: "Niedrig",
      photos: 45,
      documents: 12
    },
    {
      id: "P002", 
      name: "Kanalneubau Augsburg Innenstadt",
      status: "Planung",
      progress: 23,
      location: "Augsburg, Bayern", 
      budget: "€ 1.8M",
      deadline: "30. Sep 2025",
      manager: "Sarah Weber",
      risk: "Mittel",
      photos: 8,
      documents: 24
    },
    {
      id: "P003",
      name: "Hochwasserschutz Donau",
      status: "Abgeschlossen",
      progress: 100,
      location: "Regensburg, Bayern",
      budget: "€ 5.2M", 
      deadline: "Abgeschlossen",
      manager: "Michael Bach",
      risk: "Niedrig",
      photos: 156,
      documents: 67
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aktiv": return "bg-green-500";
      case "Planung": return "bg-orange-500";
      case "Abgeschlossen": return "bg-gray-500";
      default: return "bg-gray-400";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Niedrig": return "text-green-600 bg-green-100";
      case "Mittel": return "text-orange-600 bg-orange-100";
      case "Hoch": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const pricingPlans = [
    {
      name: "Basic",
      price: "21€",
      period: "/Monat",
      icon: <Check className="h-6 w-6" />,
      color: "border-blue-200 bg-blue-50",
      buttonColor: "bg-blue-500 hover:bg-blue-600",
      features: [
        "Grundlegende Projektverwaltung",
        "Kundenverwaltung",
        "Dokumenten-Upload",
        "Mobile App",
        "Email-Support"
      ]
    },
    {
      name: "Professional",
      price: "39€",
      period: "/Monat",
      icon: <Star className="h-6 w-6" />,
      color: "border-green-200 bg-green-50",
      buttonColor: "bg-green-500 hover:bg-green-600",
      popular: true,
      features: [
        "Alle Basic Features",
        "GPS & Kartierung",
        "Foto & Audio Dokumentation",
        "KI-Risikobewertung",
        "Erweiterte Berichte",
        "Priority Support"
      ]
    },
    {
      name: "Enterprise",
      price: "Auf Anfrage",
      period: "",
      icon: <Crown className="h-6 w-6" />,
      color: "border-purple-200 bg-purple-50",
      buttonColor: "bg-purple-500 hover:bg-purple-600",
      features: [
        "Alle Professional Features",
        "Unbegrenzte Benutzer",
        "Custom Integrationen",
        "Dedicated Support",
        "On-Premise Deployment",
        "SLA Garantie"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation Header */}
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full overflow-hidden p-1 flex-shrink-0">
                <img 
                  src="/logo.png" 
                  alt="Sachverständigenbüro Logo" 
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    console.log('Landing Logo loading failed, using fallback');
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-full rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">BS</div>';
                    }
                  }}
                />
              </div>
              <span className="text-white font-semibold text-base sm:text-lg truncate">Bau-Structura</span>
            </div>
            <div className="flex items-center flex-shrink-0">
              <Button 
                size="sm"
                className="bg-green-500 text-black border-green-500 hover:bg-green-600 hover:text-black px-4 py-2 text-sm font-medium min-w-[80px]"
                onClick={() => setLocation('/auth')}
              >
                Anmelden
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              ✨ Neu: KI-gestützte Projektanalyse
            </Badge>
            <h1 className="text-5xl font-bold mb-6">
              Bau-Structura
              <span className="block text-2xl font-normal mt-2 text-green-200">
                Digitales Bauprojekt-Management
              </span>
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Die moderne Lösung für alle Arten von Bauprojekten und Infrastrukturvorhaben. 
              Mit GPS-Tracking, KI-Analyse und mobiler Dokumentation für maximale Effizienz auf der Baustelle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-green-600 hover:bg-gray-100"
                onClick={() => setLocation('/auth')}
              >
                <Play className="h-5 w-5 mr-2" />
                Demo starten
              </Button>
              <Button 
                size="lg" 
                className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-green-600 transition-colors"
                onClick={() => setLocation('/auth')}
              >
                <Rocket className="h-5 w-5 mr-2" />
                Kostenlos testen
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Alles was Sie für digitales Projektmanagement brauchen
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Von der Planung bis zur Fertigstellung - verwalten Sie Ihre Bauprojekte 
            professionell und effizient
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow border-l-4" style={{borderLeftColor: feature.color.replace('bg-', '#')}}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg text-white ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                  📊 {feature.demo}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Demo Dashboard */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Live Dashboard Vorschau
            </h2>
            <p className="text-xl text-gray-600">
              Sehen Sie wie Ihre Projekte in Echtzeit verwaltet werden
            </p>
          </div>

          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="projects">Aktuelle Projekte</TabsTrigger>
              <TabsTrigger value="analytics">Analysen</TabsTrigger>
              <TabsTrigger value="documentation">Dokumentation</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {demoProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <p className="text-sm text-gray-500">ID: {project.id}</p>
                        </div>
                        <Badge className={`${getStatusColor(project.status)} text-white`}>
                          {project.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Fortschritt</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Standort</p>
                            <p className="font-medium">{project.location}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Budget</p>
                            <p className="font-medium">{project.budget}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Manager</p>
                            <p className="font-medium">{project.manager}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Risiko</p>
                            <Badge className={`${getRiskColor(project.risk)} text-xs`}>
                              {project.risk}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                          <span>📸 {project.photos} Fotos</span>
                          <span>📄 {project.documents} Dokumente</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-2xl font-bold">65</p>
                        <p className="text-sm text-gray-500">Aktive Projekte</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold">78%</p>
                        <p className="text-sm text-gray-500">Pünktlich</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-8 w-8 text-orange-500" />
                      <div>
                        <p className="text-2xl font-bold">€15.8M</p>
                        <p className="text-sm text-gray-500">Gesamtbudget</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Users className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="text-2xl font-bold">28</p>
                        <p className="text-sm text-gray-500">Team-Mitglieder</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>


            </TabsContent>

            <TabsContent value="documentation" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Camera className="h-5 w-5" />
                      <span>Foto-Dokumentation</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Heute aufgenommen</span>
                        <Badge>23 Fotos</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>GPS-Tagged</span>
                        <Badge variant="outline">100%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>KI-Analysiert</span>
                        <Badge variant="outline">18 von 23</Badge>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">
                          Letzte Aufnahme: Betonmischer vor Ort 
                          <br />
                          📍 München, Hauptbahnhof
                          <br />
                          🤖 KI-Analyse: "Ausrüstung einsatzbereit"
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Dokumente</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>PDF Berichte</span>
                        <Badge>45</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Excel Tabellen</span>
                        <Badge variant="outline">12</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>SFTP Backup</span>
                        <Badge variant="outline" className="text-green-600">Synchronisiert</Badge>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">
                          Neueste Dokumente:
                          <br />
                          • Baustellenbericht_P001_29-06.pdf
                          <br />
                          • Materialbestellung_Juni.xlsx
                          <br />
                          • Genehmigung_Stadtwerke.pdf
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">
            Bereit für digitales Projektmanagement?
          </h2>
          <p className="text-xl mb-8">
            Starten Sie noch heute mit Ihrer kostenlosen 30-Tage-Testversion
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100" onClick={() => window.location.href = '/api/login'}>
              <ArrowRight className="h-5 w-5 mr-2" />
              Jetzt anmelden
            </Button>
            <Button size="lg" className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-green-600 transition-colors">
              Mehr erfahren
            </Button>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Flexible Preismodelle
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Wählen Sie das passende Paket für Ihr Unternehmen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative p-8 ${plan.color} border-2 hover:shadow-lg transition-all`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white px-4 py-1">
                      Beliebteste Wahl
                    </Badge>
                  </div>
                )}
                <CardContent className="p-0">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
                      <div className="text-gray-600">
                        {plan.icon}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${plan.buttonColor} text-white`}
                    onClick={() => {
                      if (plan.name === 'Enterprise') {
                        window.location.href = '/api/login';
                      } else {
                        const licenseType = plan.name.toLowerCase() === 'basic' ? 'basic' : 'professional';
                        window.location.href = `/checkout?license=${licenseType}`;
                      }
                    }}
                  >
                    {plan.name === 'Enterprise' ? 'Kontakt aufnehmen' : 'Jetzt kaufen'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Haben Sie Fragen? Wir helfen gerne!
            </h2>
            <p className="text-xl text-gray-600">
              Unser Support-Team steht Ihnen bei allen Fragen rund um Bau-Structura zur Verfügung
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Kontaktinformationen</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">support@bau-structura.de</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">Mo-Fr, 8:00-18:00 Uhr</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">24h Response-Zeit</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Häufige Anfragen</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Technischer Support und Fehlerbehebung</li>
                  <li>• Fragen zur Lizenzierung</li>
                  <li>• Custom Integrationen</li>
                  <li>• Schulungen und Onboarding</li>
                  <li>• API-Dokumentation</li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <ContactForm />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Bau-Structura</h3>
              <p className="text-gray-400">
                Die moderne Lösung für digitales Bauprojekt-Management
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>GPS & Kartierung</li>
                <li>KI-Analyse</li>
                <li>Mobile App</li>
                <li>SFTP Integration</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="https://github.com/baustructura/baustructura-final" target="_blank" rel="noopener noreferrer" 
                     className="hover:text-white transition-colors">
                    Dokumentation
                  </a>
                </li>
                <li>
                  <a href="https://github.com/baustructura/baustructura-final/blob/main/docs/api/API_DOCUMENTATION.md" target="_blank" rel="noopener noreferrer"
                     className="hover:text-white transition-colors">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="https://github.com/baustructura/baustructura-final/discussions" target="_blank" rel="noopener noreferrer"
                     className="hover:text-white transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#contact" onClick={(e) => {
                    e.preventDefault();
                    const contactSection = document.querySelector('#contact');
                    if (contactSection) {
                      contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }} className="hover:text-white transition-colors cursor-pointer">
                    Kontakt
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Bau-Structura. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}