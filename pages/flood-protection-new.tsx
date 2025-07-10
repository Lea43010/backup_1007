import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { useToast } from "../hooks/use-toast";
import { PageHeader } from "../components/layout/page-header";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Shield,
  Users,
  AlertCircle,
  Settings,
  FileText,
  ArrowLeft,
  Edit,
  Download,
  Mail,
  Eye,
  MoreVertical
} from "lucide-react";
import { useLocation } from "wouter";

export default function FloodProtectionNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedChecklist, setSelectedChecklist] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedChecklist, setEditedChecklist] = useState<any>(null);

  // Demo-Daten
  const stats = {
    activeChecklists: 2,
    totalSchieber: 3,
    openSchaeden: 1,
    activeDeichwachen: 2
  };

  const recentChecklists = [
    {
      id: "1",
      titel: "Hochwasserereignis Mai 2025 (Beispielprojekt)",
      status: "in_bearbeitung",
      fortschritt: 68,
      erstellt_von: "Thomas Müller",
      erstellt_am: "2025-05-15T08:00:00Z",
      aufgaben_erledigt: 7,
      aufgaben_gesamt: 11,
      pegelstand: 245
    },
    {
      id: "2",
      titel: "Routineübung Frühjahr (Beispielprojekt)",
      status: "abgeschlossen",
      fortschritt: 100,
      erstellt_von: "Sarah Weber",
      erstellt_am: "2025-03-20T08:00:00Z",
      aufgaben_erledigt: 11,
      aufgaben_gesamt: 11
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "abgeschlossen": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in_bearbeitung": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "offen": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "abgeschlossen": return <CheckCircle className="h-4 w-4" />;
      case "in_bearbeitung": return <Clock className="h-4 w-4" />;
      case "offen": return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handlePDFExport = async (checklist: any) => {
    try {
      const demoSchieber = [
        { nummer: 1, bezeichnung: "Absperrschieber DN 300", lage: "Lohr km 1,470", funktionsfaehig: true, letzte_pruefung: "2025-06-25T00:00:00Z" },
        { nummer: 2, bezeichnung: "Absperrschütz bei ehem. Grundwehr", lage: "Lohr km 1,320", funktionsfaehig: false, letzte_pruefung: "2025-06-20T00:00:00Z" }
      ];

      const response = await fetch('/api/flood-protection/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklist,
          schieber: demoSchieber,
          schaeden: [],
          wachen: [],
          exportedAt: new Date().toLocaleString('de-DE'),
          exportedBy: 'Benutzer'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Hochwasserschutz-${checklist.titel}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "PDF exportiert",
          description: "Die Checkliste wurde als PDF heruntergeladen.",
        });
      } else {
        throw new Error('PDF-Export fehlgeschlagen');
      }
    } catch (error) {
      toast({
        title: "Fehler beim PDF-Export",
        description: "PDF konnte nicht erstellt werden.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (checklist: any) => {
    setSelectedChecklist(checklist);
    setEditedChecklist({ ...checklist });
    setIsEditMode(false);
    setIsDetailDialogOpen(true);
  };

  const handleEditMode = () => {
    setIsEditMode(true);
  };

  const handleSaveChanges = () => {
    // Hier würde normalerweise ein API-Call stehen
    setSelectedChecklist(editedChecklist);
    setIsEditMode(false);
    toast({
      title: "Änderungen gespeichert",
      description: "Die Checkliste wurde erfolgreich aktualisiert.",
    });
  };

  const handleCancelEdit = () => {
    setEditedChecklist({ ...selectedChecklist });
    setIsEditMode(false);
  };

  const updateChecklistItem = (field: string, value: any) => {
    setEditedChecklist((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation("/")}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              🏗️ Hochwasserschutz
            </h1>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setLocation("/flood-protection/maintenance")}
              variant="outline"
              size="sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              Wartungsanleitung
            </Button>
          </div>
        </div>
      </PageHeader>
      
      <div className="container mx-auto px-4 py-6 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="checklists">Checklisten</TabsTrigger>
            <TabsTrigger value="equipment">Ausrüstung</TabsTrigger>
            <TabsTrigger value="management">Verwaltung</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Aktive Checklisten</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.activeChecklists}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">Absperrschieber</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.totalSchieber}</p>
                    </div>
                    <Settings className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Offene Schäden</p>
                      <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.openSchaeden}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Deichwachen</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.activeDeichwachen}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Aktuelle Checklisten */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Aktuelle Checklisten
                  </CardTitle>
                  <Button size="sm" onClick={() => setActiveTab("checklists")}>
                    Alle anzeigen
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentChecklists.slice(0, 3).map((checklist) => (
                    <div key={checklist.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">{checklist.titel}</h3>
                          <Badge className={getStatusColor(checklist.status)}>
                            {getStatusIcon(checklist.status)}
                            <span className="ml-1 capitalize">{checklist.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>Von: {checklist.erstellt_von}</span>
                          <span>Fortschritt: {checklist.aufgaben_erledigt}/{checklist.aufgaben_gesamt} ({checklist.fortschritt}%)</span>
                          {checklist.pegelstand && <span>Pegel: {checklist.pegelstand} cm</span>}
                        </div>
                        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${checklist.fortschritt}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button size="sm" variant="outline" onClick={() => handlePDFExport(checklist)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(checklist)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checklists" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Alle Checklisten</h2>
              <div className="flex gap-2">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Checkliste
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  PDF Export
                </Button>
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  E-Mail senden
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {recentChecklists.map((checklist) => (
                <Card key={checklist.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{checklist.titel}</h3>
                          <Badge className={getStatusColor(checklist.status)}>
                            {getStatusIcon(checklist.status)}
                            <span className="ml-1 capitalize">{checklist.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Erstellt von:</span>
                            <p className="font-medium">{checklist.erstellt_von}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Erstellt am:</span>
                            <p className="font-medium">{new Date(checklist.erstellt_am).toLocaleDateString('de-DE')}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Fortschritt:</span>
                            <p className="font-medium">{checklist.aufgaben_erledigt}/{checklist.aufgaben_gesamt} Aufgaben</p>
                          </div>
                          {checklist.pegelstand && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Pegelstand:</span>
                              <p className="font-medium">{checklist.pegelstand} cm</p>
                            </div>
                          )}
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Fortschritt</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{checklist.fortschritt}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div 
                              className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                              style={{ width: `${checklist.fortschritt}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-6">
                        <Button size="sm" variant="outline" onClick={() => handlePDFExport(checklist)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(checklist)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ausrüstung & Infrastruktur</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Absperrschieber
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">Verwaltung und Überwachung der Absperrschieber</p>
                  <Button className="mt-4" variant="outline">Details anzeigen</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Schadensmeldungen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">Erfassung und Verfolgung von Schäden</p>
                  <Button className="mt-4" variant="outline">Details anzeigen</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Verwaltung</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Deichwachen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">Verwaltung der Deichwachen und Schichtpläne</p>
                  <Button 
                    className="mt-4" 
                    variant="outline"
                    onClick={() => setLocation("/flood-protection")}
                  >
                    Verwalten
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Berichte & Export
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">Berichte erstellen und Daten exportieren</p>
                  <Button 
                    className="mt-4" 
                    variant="outline"
                    onClick={() => setLocation("/documents")}
                  >
                    Export-Center
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Checklisten-Details: {selectedChecklist?.titel}
              </div>
              {!isEditMode && (
                <Button variant="outline" size="sm" onClick={handleEditMode}>
                  <Edit className="h-4 w-4 mr-2" />
                  Bearbeiten
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedChecklist && (
            <div className="space-y-6">
              {/* Grundinformationen */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Grundinformationen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Status:</span>
                      <div className="mt-1">
                        {isEditMode ? (
                          <select 
                            value={editedChecklist?.status || selectedChecklist.status}
                            onChange={(e) => updateChecklistItem('status', e.target.value)}
                            className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                          >
                            <option value="aktiv">Aktiv</option>
                            <option value="abgeschlossen">Abgeschlossen</option>
                            <option value="in_bearbeitung">In Bearbeitung</option>
                            <option value="pausiert">Pausiert</option>
                          </select>
                        ) : (
                          <Badge className={getStatusColor(selectedChecklist.status)}>
                            {getStatusIcon(selectedChecklist.status)}
                            <span className="ml-1 capitalize">{selectedChecklist.status.replace('_', ' ')}</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Erstellt von:</span>
                      <p className="font-medium mt-1">{selectedChecklist.erstellt_von}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Erstellt am:</span>
                      <p className="font-medium mt-1">{new Date(selectedChecklist.erstellt_am).toLocaleDateString('de-DE')}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Pegelstand:</span>
                      {isEditMode ? (
                        <input
                          type="number"
                          value={editedChecklist?.pegelstand || selectedChecklist.pegelstand || ''}
                          onChange={(e) => updateChecklistItem('pegelstand', parseInt(e.target.value))}
                          className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 mt-1"
                          placeholder="Pegelstand in cm"
                        />
                      ) : (
                        <p className="font-medium mt-1">{selectedChecklist.pegelstand || 'Nicht angegeben'} cm</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fortschritt */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fortschritt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">Aufgaben erledigt:</label>
                        {isEditMode ? (
                          <input
                            type="number"
                            min="0"
                            max={editedChecklist?.aufgaben_gesamt || selectedChecklist.aufgaben_gesamt}
                            value={editedChecklist?.aufgaben_erledigt || selectedChecklist.aufgaben_erledigt}
                            onChange={(e) => updateChecklistItem('aufgaben_erledigt', parseInt(e.target.value))}
                            className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 mt-1"
                          />
                        ) : (
                          <p className="font-medium mt-1">{selectedChecklist.aufgaben_erledigt}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">Aufgaben gesamt:</label>
                        {isEditMode ? (
                          <input
                            type="number"
                            min="1"
                            value={editedChecklist?.aufgaben_gesamt || selectedChecklist.aufgaben_gesamt}
                            onChange={(e) => updateChecklistItem('aufgaben_gesamt', parseInt(e.target.value))}
                            className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 mt-1"
                          />
                        ) : (
                          <p className="font-medium mt-1">{selectedChecklist.aufgaben_gesamt}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Fortschritt:</span>
                        <span className="text-sm font-medium">
                          {Math.round(((editedChecklist?.aufgaben_erledigt || selectedChecklist.aufgaben_erledigt) / 
                            (editedChecklist?.aufgaben_gesamt || selectedChecklist.aufgaben_gesamt)) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div 
                          className="bg-blue-600 h-4 rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${Math.round(((editedChecklist?.aufgaben_erledigt || selectedChecklist.aufgaben_erledigt) / 
                              (editedChecklist?.aufgaben_gesamt || selectedChecklist.aufgaben_gesamt)) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bewertung/Notizen */}
              {isEditMode && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bewertung und Notizen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400 block mb-2">Priorität:</label>
                        <select 
                          value={editedChecklist?.prioritaet || 'mittel'}
                          onChange={(e) => updateChecklistItem('prioritaet', e.target.value)}
                          className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                        >
                          <option value="niedrig">Niedrig</option>
                          <option value="mittel">Mittel</option>
                          <option value="hoch">Hoch</option>
                          <option value="kritisch">Kritisch</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400 block mb-2">Notizen:</label>
                        <textarea
                          value={editedChecklist?.notizen || ''}
                          onChange={(e) => updateChecklistItem('notizen', e.target.value)}
                          className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 h-24 resize-none"
                          placeholder="Zusätzliche Bemerkungen und Notizen..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Absperrschieber Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Zugehörige Absperrschieber</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Absperrschieber DN 300</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Lohr km 1,470, Nähe Kupfermühle</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Funktionsfähig
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Absperrschütz bei ehem. Grundwehr</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Lohr km 1,320</p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Wartung erforderlich
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Aktionen */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                {isEditMode ? (
                  <>
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Abbrechen
                    </Button>
                    <Button onClick={handleSaveChanges}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Änderungen speichern
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                      Schließen
                    </Button>
                    <Button onClick={() => handlePDFExport(selectedChecklist)}>
                      <Download className="h-4 w-4 mr-2" />
                      PDF exportieren
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}