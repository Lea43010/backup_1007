import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, MapPin, Wrench, Clock, User, FileText, AlertTriangle } from "lucide-react";

// Wartungsdaten aus der bereitgestellten JSON
const wartungsDaten = {
  "title": "Wartungs- und Unterhaltungsanweisung für den Hochwasserschutz Lohr",
  "version": "3.1",
  "bauteile": [
    {
      "nummer": 1,
      "bauteil": "Lohr km 1.470 Nahe Kupfermühle",
      "bauteilbeschreibung": "Absperrschieber DN 300",
      "unterlagen": "Lageplan, Bauwerksplan, Arbeitsanweisung",
      "wartung": {
        "massnahme": [
          "Sichtkontrolle Schieberbauwerk, Schwimmbaken und Rechen am Einlauf; bei Bedarf Räumung",
          "Überprüfung der Gangbarkeit des Schiebers und Überprüfung der Dichtheit der Schräche",
          "Wartung der Einbauteile gemäß Herstellervorgaben",
          "Entleeren der Haltorungen des Schieberbügelbügels gemäß Herstellervorgaben"
        ],
        "turnus": "Vierteljährlich und nach Hochwasser, Jährlich im Oktober, Vierteljährlich und nach Hochwasser",
        "zuständigkeit": "auf Bauwerksverzeichnis Stadt Lohr"
      }
    },
    {
      "nummer": 2,
      "bauteil": "Lohr km 1.320",
      "bauteilbeschreibung": "Absperrschieb bei ehern. Feuerwehr",
      "unterlagen": "Lageplan, Bauwerksplan, Arbeitsanweisung",
      "wartung": {
        "massnahme": [
          "Sichtkontrolle, ggf. Wartung und Überprüfung der Gangbarkeit der Schieber und bei Bedarf Räumung",
          "Überprüfung der Gangbarkeit des Schiebers",
          "Wartung der Einbauteile gemäß Herstellervorgaben"
        ],
        "turnus": "Jährlich im Oktober, Vierteljährlich und nach Hochwasser",
        "zuständigkeit": "auf Vereinbarung von Bezirk und Stadt Lohr von 2009 Stadt Lohr"
      }
    },
    {
      "nummer": 3,
      "bauteil": "Mutterbach Parkplatz Augenthal (Grundstück Weisrock)",
      "bauteilbeschreibung": "Absperrschieber DN 1800",
      "unterlagen": "Lageplan, Bauwerksplan, Arbeitsanweisung",
      "wartung": {
        "massnahme": [
          "Sichtkontrolle Absperrbauwerk und bei Bedarf Räumung",
          "Überprüfung der Gangbarkeit des Schiebers",
          "Wartung der Einbauteile gemäß Herstellervorgaben"
        ],
        "turnus": "Vierteljährlich und nach Hochwasser",
        "zuständigkeit": "auf Vereinbarung von Bezirk und Stadt Lohr von 2009 Stadt Lohr"
      }
    },
    {
      "nummer": 4,
      "bauteil": "Mutterbach Parkplatz Augentlink am Wertstoffhof",
      "bauteilbeschreibung": "Absperrschieber DN 300",
      "unterlagen": "Lageplan, Bauwerksplan, Arbeitsanweisung",
      "wartung": {
        "massnahme": [
          "Überprüfung der Gangbarkeit des Schiebers",
          "Wartung gemäß Herstellervorgaben"
        ],
        "turnus": "Vierteljährlich",
        "zuständigkeit": "auf Vereinbarung von Bezirk und Stadt Lohr von 2009 Stadt Lohr"
      }
    },
    {
      "nummer": 5,
      "bauteil": "Am Mühlbach Parkplatz Augentlink (Grundstück Brückner)",
      "bauteilbeschreibung": "Einlauf Verrohrung mit Siebrechenvorrichtung",
      "unterlagen": "Lageplan, Arbeitsanweisung",
      "wartung": {
        "massnahme": "Sichtkontrolle, bei Bedarf Räumung",
        "turnus": "Jährlich",
        "zuständigkeit": "laut ev. Auer der Betriebsanleitung an die Stadt Lohr übertragen"
      }
    },
    {
      "nummer": 6,
      "bauteil": "Straßendamm B26",
      "bauteilbeschreibung": "Absperrschieber DN 1000",
      "unterlagen": "Lageplan, Bauwerksplan, Arbeitsanweisung",
      "wartung": {
        "massnahme": [
          "Sichtkontrolle Schieberbauwerk und Rechen am Einlauf; bei Bedarf Räumung",
          "Überprüfung der Gangbarkeit des Schiebers und Überprüfung der Dichtheit der Schräche",
          "Wartung der Einbauteile gemäß Herstellervorgaben",
          "Entleeren der Haltorungen des Schieberbügels und des Schiebengangtrages"
        ],
        "turnus": "Vierteljährlich und nach Hochwasser, Jährlich im Oktober, Vierteljährlich und nach Hochwasser",
        "zuständigkeit": "auf Vereinbarung von Bezirk und Stadt Lohr von 2009 Stadt Lohr"
      }
    },
    {
      "nummer": 7,
      "bauteil": "Straßendamm B26",
      "bauteilbeschreibung": "Absperrschieber DN 500",
      "unterlagen": "Lageplan, Bauwerksplan, Arbeitsanweisung",
      "wartung": {
        "massnahme": [
          "Sichtkontrolle Schieberbauwerk und Rechen am Einlauf; bei Bedarf Räumung",
          "Überprüfung der Gangbarkeit des Schiebers und Überprüfung der Dichtheit der Schräche",
          "Wartung der Einbauteile gemäß Herstellervorgaben",
          "Entleeren der Haltorungen des Schieberbügels und des Schiebengangtrages"
        ],
        "turnus": "Vierteljährlich und nach Hochwasser, Jährlich im Oktober",
        "zuständigkeit": "auf Vereinbarung von Bezirk und Stadt Lohr von 2009 Stadt Lohr"
      }
    },
    {
      "nummer": 8,
      "bauteil": "Linker Lohrdeilch Lohr km 0.750 (landsetitig bei Autohaus Brass)",
      "bauteilbeschreibung": "Absperrschieber DN 600",
      "unterlagen": "Lageplan, Arbeitsanweisung",
      "wartung": {
        "massnahme": [
          "Sichtkontrolle Bauwerk und Rechen; bei Bedarf Räumung",
          "Überprüfung der Gangbarkeit des Schiebers",
          "Wartung der Einbauteile gemäß Herstellervorgaben"
        ],
        "turnus": "Vierteljährlich und nach Hochwasser",
        "zuständigkeit": "auf Vereinbarung zw. Bezirk und Stadt Lohr 1990: Unterhaltung Stadt Lohr"
      }
    },
    {
      "nummer": 9,
      "bauteil": "Linker Lohrdeilch Lohr km 0.750 (landsetitig bei Autohaus Brass)",
      "bauteilbeschreibung": "Pumpensumpf: Einsatz mobiler Pumpen",
      "unterlagen": "Lageplan, Arbeitsanweisung",
      "wartung": {
        "massnahme": "Sichtkontrolle, bei Bedarf Räumung",
        "turnus": "Jährlich",
        "zuständigkeit": "auf Vereinbarung zw. Bezirk und Stadt Lohr 1990: Unterhaltung Stadt Lohr"
      }
    },
    {
      "nummer": 10,
      "bauteil": "Rechter Lohrdeilch Lohr km 0.70 Gewerbgebiete Würzburg Mutterbach in Lohr",
      "bauteilbeschreibung": "elektrisch und manuell betriebener Absperrschieber 1500/1250",
      "unterlagen": "Lageplan, Bauwerksplan, Arbeitsanweisung",
      "wartung": {
        "massnahme": "In Absprache mit Firma Rexroth durchführen (Betrieb durch Firma Rexroth)",
        "turnus": "",
        "zuständigkeit": "auf Vereinbarung zw. Bezirk und Stadt Lohr 1990: Unterhaltung Stadt Lohr"
      }
    },
    {
      "nummer": 11,
      "bauteil": "Deiche entlang der Lohr (linkes Flusshufer) Lohr km 0.750 bis 1.610. Deich entlang der B26 Lohr km 0.000. HWS-Mauer entlang der Lohr km Bereich der Kupfermühle. Deichdämme Parkplätze Park Parkplatz Widerich",
      "bauteilbeschreibung": "Deichbauwerk HWS-Mauer",
      "unterlagen": "Lageplan, Arbeitsanweisung",
      "wartung": {
        "massnahme": [
          "Deiche allgemein: Deichböschungen wasserseitig und landseitig kontrollieren; Schäden markieren und sofort den Betriebsbeauftragten informieren.",
          "Deiche abrufen",
          "Deiche nähen: Möhgut sofort beseitigen",
          "Sichtkontrolle HWS-Mauer"
        ],
        "turnus": "Jährlich, 2 x jährlich (Frühjahr, Herbst), Jährlich",
        "zuständigkeit": "nach der Rexroth-Vereinbarung 1990: Bezirk (WG Stadt Lohr Unterhaltung ihrer nicht)"
      }
    },
    {
      "nummer": 12,
      "bauteil": "Deichdämme mit Parkplatz Widerich",
      "bauteilbeschreibung": "Deichbauwerk",
      "unterlagen": "Lageplan, Arbeitsanweisung",
      "wartung": {
        "massnahme": [
          "Deiche allgemein: Deichböschungen wasserseitig und landseitig kontrollieren; Schäden markieren und sofort den Betriebsbeauftragten informieren.",
          "Deiche abrufen",
          "Deiche nähen: Möhgut sofort beseitigen"
        ],
        "turnus": "Jährlich, 2 x jährlich (Frühjahr, Herbst)",
        "zuständigkeit": "auf Planfeststellung Anlage 7a vom 30.10.2008 und Vereinbarung von Bezirk und Stadt Lohr vom 2010 Stadt Lohr"
      }
    }
  ],
  "sonstige_bauwerke": {
    "ohne_wartung": [
      {
        "beschreibung": "Zwischen Jakobstal und B26",
        "gewässer": "Gewässer",
        "lageplan": "Lageplan, Brückenkennzeichneh",
        "massnahme": "Die Stadt Lohr veranlasst und trägt die Kosten für die Entladegarantienahmen des Altflughafens. Eine Erstohung muss erfolgen, bevor eine Genehmigt im Bereich der Brücke wie im Plan Nr. 4.13 'Brückenkennzeichneh' dargestellt, nicht mehr eingehalten ist.",
        "turnus": "1 x jährlich und nach Hochwasser",
        "zuständigkeit": "auf Vereinbarung zw. Bezirk und Stadt Lohr 1990"
      }
    ]
  },
  "footer": {
    "title": "Hochwasserschutz Lohr",
    "subtitle": "Wartungs- und Unterhaltungsanweisung",
    "anlage": "Anlage 3.1",
    "aufgestellt": "Wasserwirtschaftsamt Aschaffenburg"
  }
};

export default function HochwasserAnleitung() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBauteil, setSelectedBauteil] = useState<number | null>(null);

  // Bauteile filtern basierend auf Suchbegriff
  const filteredBauteile = wartungsDaten.bauteile.filter(bauteil =>
    bauteil.bauteil.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bauteil.bauteilbeschreibung.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bauteil.nummer.toString().includes(searchTerm)
  );

  const getBauteilIcon = (beschreibung: string) => {
    if (beschreibung.includes("Absperrschieber") || beschreibung.includes("Absperrschütz")) {
      return <Wrench className="w-5 h-5 text-blue-600" />;
    }
    if (beschreibung.includes("Deich")) {
      return <AlertTriangle className="w-5 h-5 text-green-600" />;
    }
    if (beschreibung.includes("Pumpen")) {
      return <Clock className="w-5 h-5 text-purple-600" />;
    }
    return <MapPin className="w-5 h-5 text-gray-600" />;
  };

  const getTurnusColor = (turnus: string) => {
    if (turnus.includes("Vierteljährlich")) return "bg-red-100 text-red-800";
    if (turnus.includes("Jährlich")) return "bg-yellow-100 text-yellow-800";
    if (turnus.includes("nach Hochwasser")) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/flood-protection")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Zurück</span>
              </Button>
              <div className="border-l border-gray-300 h-6"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {wartungsDaten.title}
                </h1>
                <p className="text-sm text-gray-600">
                  Version {wartungsDaten.version} • {wartungsDaten.footer.aufgestellt}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="hidden sm:flex">
              {wartungsDaten.footer.anlage}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="bauteile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bauteile">Wartungspflichtige Bauteile</TabsTrigger>
            <TabsTrigger value="sonstige">Sonstige Bauwerke</TabsTrigger>
          </TabsList>

          <TabsContent value="bauteile" className="space-y-6">
            {/* Suchbereich */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Bauteil suchen (Nummer, Ort, Beschreibung)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="text-sm text-gray-600 flex items-center">
                  {filteredBauteile.length} von {wartungsDaten.bauteile.length} Bauteilen
                </div>
              </div>
            </div>

            {/* Bauteile-Übersicht */}
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Bauteile-Liste */}
              <div className="lg:col-span-5 space-y-4">
                {filteredBauteile.map((bauteil) => (
                  <Card 
                    key={bauteil.nummer}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedBauteil === bauteil.nummer ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedBauteil(bauteil.nummer)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {getBauteilIcon(bauteil.bauteilbeschreibung)}
                          <div>
                            <CardTitle className="text-base">
                              Bauteil {bauteil.nummer}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {bauteil.bauteilbeschreibung}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{bauteil.bauteil}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(bauteil.wartung.turnus) ? 
                            bauteil.wartung.turnus.map((turnus, idx) => (
                              <Badge 
                                key={idx} 
                                variant="outline" 
                                className={`text-xs ${getTurnusColor(turnus)}`}
                              >
                                {turnus.split(',')[0]}
                              </Badge>
                            )) :
                            bauteil.wartung.turnus.split(',').map((turnus, idx) => (
                              <Badge 
                                key={idx} 
                                variant="outline" 
                                className={`text-xs ${getTurnusColor(turnus.trim())}`}
                              >
                                {turnus.trim()}
                              </Badge>
                            ))
                          }
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Bauteil-Details */}
              <div className="lg:col-span-7">
                {selectedBauteil ? (
                  (() => {
                    const bauteil = wartungsDaten.bauteile.find(b => b.nummer === selectedBauteil);
                    if (!bauteil) return null;
                    
                    return (
                      <Card>
                        <CardHeader>
                          <div className="flex items-center space-x-3">
                            {getBauteilIcon(bauteil.bauteilbeschreibung)}
                            <div>
                              <CardTitle>Bauteil {bauteil.nummer}</CardTitle>
                              <CardDescription>{bauteil.bauteilbeschreibung}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Standort */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              Standort
                            </h4>
                            <p className="text-sm text-gray-600">{bauteil.bauteil}</p>
                          </div>

                          {/* Unterlagen */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                              <FileText className="w-4 h-4 mr-2" />
                              Unterlagen
                            </h4>
                            <p className="text-sm text-gray-600">{bauteil.unterlagen}</p>
                          </div>

                          {/* Wartungsmaßnahmen */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                              <Wrench className="w-4 h-4 mr-2" />
                              Wartungsmaßnahmen
                            </h4>
                            <div className="space-y-2">
                              {Array.isArray(bauteil.wartung.massnahme) ? 
                                bauteil.wartung.massnahme.map((massnahme, idx) => (
                                  <div 
                                    key={idx}
                                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                                  >
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <span className="text-xs font-medium text-blue-600">{idx + 1}</span>
                                    </div>
                                    <p className="text-sm text-gray-700">{massnahme}</p>
                                  </div>
                                )) :
                                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-medium text-blue-600">1</span>
                                  </div>
                                  <p className="text-sm text-gray-700">{bauteil.wartung.massnahme}</p>
                                </div>
                              }
                            </div>
                          </div>

                          {/* Turnus */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              Wartungsturnus
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(bauteil.wartung.turnus) ? 
                                bauteil.wartung.turnus.map((turnus, idx) => (
                                  <Badge 
                                    key={idx} 
                                    className={getTurnusColor(turnus)}
                                  >
                                    {turnus}
                                  </Badge>
                                )) :
                                bauteil.wartung.turnus.split(',').map((turnus, idx) => (
                                  <Badge 
                                    key={idx} 
                                    className={getTurnusColor(turnus.trim())}
                                  >
                                    {turnus.trim()}
                                  </Badge>
                                ))
                              }
                            </div>
                          </div>

                          {/* Zuständigkeit */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              Zuständigkeit
                            </h4>
                            <p className="text-sm text-gray-600">{bauteil.wartung.zuständigkeit}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wrench className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Bauteil auswählen
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Wählen Sie ein Bauteil aus der Liste links aus, um die detaillierten 
                        Wartungsanweisungen anzuzeigen.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sonstige" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sonstige Bauwerke ohne spezielle Wartung</CardTitle>
                <CardDescription>
                  Bauwerke mit allgemeiner Unterhaltung nach Vereinbarungen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wartungsDaten.sonstige_bauwerke.ohne_wartung.map((bauwerk, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">{bauwerk.beschreibung}</h4>
                      {bauwerk.massnahme && (
                        <p className="text-sm text-gray-600 mb-2">{bauwerk.massnahme}</p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {bauwerk.turnus && (
                          <Badge variant="outline">{bauwerk.turnus}</Badge>
                        )}
                        <Badge variant="secondary">{bauwerk.zuständigkeit}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}