import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { PageHeader } from "../components/layout/page-header";
import { MobileNav } from "../components/layout/mobile-nav";
import { useToast } from "../hooks/use-toast";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertTriangle,
  Save,
  Camera,
  MapPin,
  Calendar,
  User,
  FileText,
  Droplets
} from "lucide-react";

export default function ChecklistDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("aufgaben");

  const checklistId = params.id;

  // Demo-Daten für eine vollständige Checkliste
  const checklist = {
    id: checklistId,
    titel: "Hochwasserereignis Juni 2025",
    typ: "hochwasser",
    status: "in_bearbeitung",
    erstellt_am: "2025-06-29T17:35:00Z",
    erstellt_von: "Lea Zimmer",
    beginn_pegelstand_cm: 245,
    beschreibung: "Starkregen-Event nach Unwetterwarnung",
    fortschritt: 45,
    aufgaben_gesamt: 11,
    aufgaben_erledigt: 5
  };

  const aufgabenBeginn = [
    {
      id: 1,
      nr: 1,
      beschreibung: "Pegelstand dokumentieren und melden",
      erledigt: true,
      erledigt_am: "2025-06-29T17:40:00Z",
      erledigt_von: "Lea Zimmer",
      datum: "2025-06-29",
      pegelstand_cm: 245,
      bemerkung: "Pegelstand steigt kontinuierlich"
    },
    {
      id: 2,
      nr: 2,
      beschreibung: "Einsatzleitung informieren",
      erledigt: true,
      erledigt_am: "2025-06-29T17:45:00Z",
      erledigt_von: "Lea Zimmer",
      datum: "2025-06-29",
      bemerkung: "Herr Müller telefonisch erreicht"
    },
    {
      id: 3,
      nr: 3,
      beschreibung: "Absperrschieber auf Funktionsfähigkeit prüfen",
      erledigt: true,
      erledigt_am: "2025-06-29T18:00:00Z",
      erledigt_von: "Lea Zimmer",
      bemerkung: "Alle 8 Schieber getestet, 1 defekt (Nr. 3)"
    },
    {
      id: 4,
      nr: 4,
      beschreibung: "Notfallausrüstung überprüfen",
      erledigt: true,
      erledigt_am: "2025-06-29T18:15:00Z",
      erledigt_von: "Lea Zimmer",
      bemerkung: "Sandsäcke und Pumpen einsatzbereit"
    },
    {
      id: 5,
      nr: 5,
      beschreibung: "Deichwachen einteilen und briefen",
      erledigt: true,
      erledigt_am: "2025-06-29T18:30:00Z",
      erledigt_von: "Lea Zimmer",
      bemerkung: "4 Teams à 2 Personen eingeteilt"
    },
    {
      id: 6,
      nr: 6,
      beschreibung: "Evakuierungspläne aktualisieren",
      erledigt: false,
      bemerkung: ""
    }
  ];

  const aufgabenEnde = [
    {
      id: 7,
      nr: 1,
      beschreibung: "Endpegelstand dokumentieren",
      erledigt: false
    },
    {
      id: 8,
      nr: 2,
      beschreibung: "Absperrschieber zurücksetzen",
      erledigt: false
    },
    {
      id: 9,
      nr: 3,
      beschreibung: "Ausrüstung reinigen und verstauen",
      erledigt: false
    },
    {
      id: 10,
      nr: 4,
      beschreibung: "Schadensdokumentation erstellen",
      erledigt: false
    },
    {
      id: 11,
      nr: 5,
      beschreibung: "Abschlussbericht verfassen",
      erledigt: false
    }
  ];

  const handleTaskToggle = async (taskId: number, checked: boolean) => {
    try {
      toast({
        title: "Aufgabe aktualisiert",
        description: checked ? "Aufgabe als erledigt markiert" : "Aufgabe als offen markiert",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Aktualisieren der Aufgabe.",
        variant: "destructive",
      });
    }
  };

  const handleSaveTask = async (taskId: number) => {
    toast({
      title: "Gespeichert",
      description: "Aufgaben-Details wurden gespeichert.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/flood-protection")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{checklist.titel}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <span>Erstellt: {new Date(checklist.erstellt_am).toLocaleDateString('de-DE')}</span>
              <Badge className="bg-blue-600 text-white">
                {checklist.typ === "hochwasser" ? "Hochwasser" : "Übung"}
              </Badge>
              <span>Pegelstand: {checklist.beginn_pegelstand_cm} cm</span>
            </div>
          </div>
        </div>
      </PageHeader>

      <div className="p-4 space-y-6">
        {/* Fortschrittsanzeige */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Gesamtfortschritt</span>
              <span className="text-sm font-medium">{checklist.aufgaben_erledigt}/{checklist.aufgaben_gesamt} Aufgaben</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${checklist.fortschritt}%` }}
              ></div>
            </div>
            <div className="text-right text-sm text-gray-500 mt-1">{checklist.fortschritt}% abgeschlossen</div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="aufgaben">Aufgaben</TabsTrigger>
            <TabsTrigger value="schieber">Schieber</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>

          <TabsContent value="aufgaben" className="space-y-6 mt-6">
            {/* Beginn des Betriebes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  Beginn des Betriebes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aufgabenBeginn.map((aufgabe) => (
                  <Card key={aufgabe.id} className="p-4 border border-gray-200">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={aufgabe.erledigt}
                          onCheckedChange={(checked) => handleTaskToggle(aufgabe.id, !!checked)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-gray-900">
                              {aufgabe.nr}. {aufgabe.beschreibung}
                            </span>
                            {aufgabe.erledigt && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          
                          {aufgabe.erledigt && (
                            <div className="text-xs text-gray-500 mt-1">
                              Erledigt: {new Date(aufgabe.erledigt_am!).toLocaleString('de-DE')} von {aufgabe.erledigt_von}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Eingabefelder für Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                        {aufgabe.nr === 1 && (
                          <>
                            <div>
                              <Label className="text-xs">Datum *</Label>
                              <Input 
                                type="date" 
                                value={aufgabe.datum || ""} 
                                className="h-8 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Pegelstand (cm) *</Label>
                              <Input 
                                type="number" 
                                value={aufgabe.pegelstand_cm || ""} 
                                placeholder="z.B. 245"
                                className="h-8 text-sm"
                              />
                            </div>
                          </>
                        )}
                        {aufgabe.nr !== 1 && (
                          <div>
                            <Label className="text-xs">Datum</Label>
                            <Input 
                              type="date" 
                              value={aufgabe.datum || ""} 
                              className="h-8 text-sm"
                            />
                          </div>
                        )}
                        <div className="md:col-span-2">
                          <Label className="text-xs">Bemerkung</Label>
                          <Textarea 
                            value={aufgabe.bemerkung || ""} 
                            placeholder="Zusätzliche Informationen..."
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 ml-6">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSaveTask(aufgabe.id)}
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Speichern
                        </Button>
                        <Button size="sm" variant="outline">
                          <Camera className="h-3 w-3 mr-1" />
                          Foto
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Ende des Betriebes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Ende des Betriebes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aufgabenEnde.map((aufgabe) => (
                  <Card key={aufgabe.id} className="p-4 border border-gray-200">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={aufgabe.erledigt}
                          onCheckedChange={(checked) => handleTaskToggle(aufgabe.id, !!checked)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-sm text-gray-900">
                            {aufgabe.nr}. {aufgabe.beschreibung}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                        <div>
                          <Label className="text-xs">Datum</Label>
                          <Input 
                            type="date" 
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-xs">Bemerkung</Label>
                          <Textarea 
                            placeholder="Zusätzliche Informationen..."
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 ml-6">
                        <Button size="sm" variant="outline">
                          <Save className="h-3 w-3 mr-1" />
                          Speichern
                        </Button>
                        <Button size="sm" variant="outline">
                          <Camera className="h-3 w-3 mr-1" />
                          Foto
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schieber" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Schieber-Prüfungen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Schieber-Prüfungen werden hier angezeigt...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Checklisten-Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Erstellt von</Label>
                    <p className="text-sm">{checklist.erstellt_von}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Erstellt am</Label>
                    <p className="text-sm">{new Date(checklist.erstellt_am).toLocaleString('de-DE')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Typ</Label>
                    <p className="text-sm">{checklist.typ === "hochwasser" ? "Hochwasserereignis" : "Übung"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <Badge className="bg-blue-600 text-white">{checklist.status}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Beschreibung</Label>
                  <p className="text-sm">{checklist.beschreibung}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <MobileNav />
    </div>
  );
}