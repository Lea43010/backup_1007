import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { useToast } from "../hooks/use-toast";
import { apiRequest, queryClient } from "../lib/queryClient";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Shield,
  Users,
  MapPin,
  Calendar,
  AlertCircle,
  Settings,
  FileText,
  Camera
} from "lucide-react";

interface FloodProtectionProps {
  projectId: number;
}

export function FloodProtection({ projectId }: FloodProtectionProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("checklists");
  const [searchTerm, setSearchTerm] = useState("");

  // Queries
  const { data: checklists = [], isLoading: checklistsLoading } = useQuery({
    queryKey: ["/api/flood/checklists", projectId],
  });

  const { data: absperrschieber = [], isLoading: schieberLoading } = useQuery({
    queryKey: ["/api/flood/absperrschieber"],
  });

  const { data: schadensfaelle = [], isLoading: schadenLoading } = useQuery({
    queryKey: ["/api/flood/schadensfaelle", projectId],
  });

  // Demo-Daten für die Darstellung
  const demoChecklists = [
    {
      id: "1",
      titel: "Hochwasserereignis Mai 2025 (Beispielprojekt)",
      typ: "hochwasser",
      status: "in_bearbeitung",
      erstellt_am: "2025-05-15T08:00:00Z",
      erstellt_von: "Thomas Müller",
      beginn_pegelstand_cm: 245,
      fortschritt: 68
    },
    {
      id: "2", 
      titel: "Routineübung Frühjahr (Beispielprojekt)",
      typ: "uebung",
      status: "abgeschlossen",
      erstellt_am: "2025-03-20T10:30:00Z",
      erstellt_von: "Sarah Weber",
      fortschritt: 100
    }
  ];

  const demoAbsperrschieber = [
    {
      id: 1,
      nummer: 1,
      bezeichnung: "Absperrschieber DN 300",
      lage: "Lohr km 1,470, Nähe Kupfermühle",
      status: "funktionsfähig",
      letzte_pruefung: "2025-06-25"
    },
    {
      id: 2,
      nummer: 2,
      bezeichnung: "Absperrschütz bei ehem. Grundwehr", 
      lage: "Lohr km 1,320",
      status: "wartung_erforderlich",
      letzte_pruefung: "2025-06-20"
    },
    {
      id: 3,
      nummer: 3,
      bezeichnung: "Absperrschieber DN 1800",
      lage: "Mutterbach, Überführungsbauwerk",
      status: "funktionsfähig",
      letzte_pruefung: "2025-06-26"
    }
  ];

  const demoSchadensfaelle = [
    {
      id: "1",
      problem_beschreibung: "Festsitzender Deckel bei Schieber Nr. 1",
      status: "behoben",
      prioritaet: 2,
      gemeldet_am: "2025-06-25T09:15:00Z",
      gemeldet_von: "Klaus Werner"
    },
    {
      id: "2",
      problem_beschreibung: "Kein Zulauf in Mühlgraben bei Schieber Nr. 2",
      status: "in_bearbeitung", 
      prioritaet: 1,
      gemeldet_am: "2025-06-28T11:30:00Z",
      gemeldet_von: "Anna Schmidt"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "offen": return "bg-blue-500";
      case "in_bearbeitung": return "bg-orange-500";
      case "abgeschlossen": return "bg-green-500";
      case "funktionsfähig": return "bg-green-500";
      case "wartung_erforderlich": return "bg-orange-500";
      case "defekt": return "bg-red-500";
      case "behoben": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "offen": return "Offen";
      case "in_bearbeitung": return "In Bearbeitung";
      case "abgeschlossen": return "Abgeschlossen";
      case "funktionsfähig": return "Funktionsfähig";
      case "wartung_erforderlich": return "Wartung erforderlich";
      case "defekt": return "Defekt";
      case "behoben": return "Behoben";
      default: return status;
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return "text-red-600 bg-red-100";
      case 2: return "text-orange-600 bg-orange-100";
      case 3: return "text-yellow-600 bg-yellow-100";
      case 4: return "text-blue-600 bg-blue-100";
      case 5: return "text-gray-600 bg-gray-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span>Hochwasserschutz-Module</span>
          </h2>
          <p className="text-gray-600">
            Checklisten, Absperrschieber und Schadensmeldungen verwalten
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neue Checkliste
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="checklists">Checklisten</TabsTrigger>
          <TabsTrigger value="absperrschieber">Absperrschieber</TabsTrigger>
          <TabsTrigger value="schadensfaelle">Schadensfälle</TabsTrigger>
          <TabsTrigger value="deichwachen">Deichwachen</TabsTrigger>
        </TabsList>

        <TabsContent value="checklisten" className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Checklisten durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select defaultValue="alle">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Status</SelectItem>
                <SelectItem value="offen">Offen</SelectItem>
                <SelectItem value="in_bearbeitung">In Bearbeitung</SelectItem>
                <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoChecklists.map((checklist) => (
              <Card key={checklist.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{checklist.titel}</CardTitle>
                      <p className="text-sm text-gray-500">
                        Erstellt: {new Date(checklist.erstellt_am).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(checklist.status)} text-white`}>
                      {getStatusText(checklist.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Typ</span>
                      <Badge variant="outline">
                        {checklist.typ === "hochwasser" ? "Hochwasser" : "Übung"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Erstellt von</span>
                      <span className="font-medium">{checklist.erstellt_von}</span>
                    </div>

                    {checklist.beginn_pegelstand_cm && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Pegelstand</span>
                        <span className="font-medium">{checklist.beginn_pegelstand_cm} cm</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Fortschritt</span>
                        <span className="font-medium">{checklist.fortschritt}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${checklist.fortschritt}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <FileText className="h-4 w-4 mr-1" />
                        Anzeigen
                      </Button>
                      {checklist.status !== "abgeschlossen" && (
                        <Button size="sm" className="flex-1">
                          <Settings className="h-4 w-4 mr-1" />
                          Bearbeiten
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="absperrschieber" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoAbsperrschieber.map((schieber) => (
              <Card key={schieber.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Schieber Nr. {schieber.nummer}</CardTitle>
                      <p className="text-sm text-gray-600 font-medium">{schieber.bezeichnung}</p>
                    </div>
                    <Badge className={`${getStatusColor(schieber.status)} text-white`}>
                      {getStatusText(schieber.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{schieber.lage}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Letzte Prüfung</span>
                      <span className="font-medium">
                        {new Date(schieber.letzte_pruefung).toLocaleDateString('de-DE')}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Camera className="h-4 w-4 mr-1" />
                        Prüfen
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Schaden
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schadensfaelle" className="space-y-6">
          <div className="space-y-4">
            {demoSchadensfaelle.map((schaden) => (
              <Card key={schaden.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{schaden.problem_beschreibung}</CardTitle>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(schaden.gemeldet_am).toLocaleDateString('de-DE')}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{schaden.gemeldet_von}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getPriorityColor(schaden.prioritaet)}`}>
                        Priorität {schaden.prioritaet}
                      </Badge>
                      <Badge className={`${getStatusColor(schaden.status)} text-white`}>
                        {getStatusText(schaden.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <FileText className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                    {schaden.status !== "behoben" && (
                      <Button size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Bearbeiten
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deichwachen" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Deichwachen-Einteilung</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Noch keine Deichwachen eingeteilt</p>
                <p className="text-sm mt-2">Erstellen Sie eine Checkliste, um Deichwachen zu verwalten</p>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Deichwache hinzufügen
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}