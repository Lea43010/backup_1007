import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { useToast } from "../hooks/use-toast";
import { PageHeader } from "../components/layout/page-header";
import { MobileNav } from "../components/layout/mobile-nav";
import { ArrowLeft, Search, Plus, Minus, Navigation, X, MapPin, Hammer, Wrench, Check, Ruler, Download, Trash2, Edit3, Layers, Target, Move, Save, Building2, Crosshair } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { DirectAddressSearch } from "../components/maps/direct-address-search";
import { apiRequest, queryClient } from "../lib/queryClient";
import type { Project } from "@shared/schema";

// Erweiterte Marker-Typen für Bauprojekte
interface CustomMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  type: 'project' | 'marker' | 'measurement';
  projectId?: number;
  color: string;
  icon: string;
  createdAt: string;
}

// Messung-Interface für Distanzen
interface Measurement {
  id: string;
  points: { lat: number; lng: number }[];
  distance: number;
  type: 'line' | 'area';
  title: string;
  unit: 'meters' | 'kilometers';
}

// Google Maps Komponente mit erweiterten Features
interface EnhancedMapProps {
  projects: Project[];
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
  markers: CustomMarker[];
  measurements: Measurement[];
  onMarkerAdd: (marker: CustomMarker) => void;
  onMeasurementAdd: (measurement: Measurement) => void;
  searchLocation: { lat: number; lng: number; address: string } | null;
  drawingMode: string | null;
  onDrawingModeChange: (mode: string | null) => void;
}

function EnhancedGoogleMap({
  projects,
  selectedProject,
  onProjectSelect,
  markers,
  measurements,
  onMarkerAdd,
  onMeasurementAdd,
  searchLocation,
  drawingMode,
  onDrawingModeChange
}: EnhancedMapProps) {
  const mapRef = useRef<google.maps.Map>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);

  // Map-Initialisierung
  const initMap = (map: google.maps.Map) => {
    mapRef.current = map;
    setIsLoaded(true);

    // Drawing Manager für Messungen initialisieren
    const manager = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      polygonOptions: {
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        strokeWeight: 2,
        clickable: false,
        editable: true,
        zIndex: 1
      },
      polylineOptions: {
        strokeColor: '#FF0000',
        strokeWeight: 3,
        clickable: false,
        editable: true,
        zIndex: 1
      }
    });

    manager.setMap(map);
    setDrawingManager(manager);

    // Event-Listener für gezeichnete Elemente
    google.maps.event.addListener(manager, 'overlaycomplete', (event: any) => {
      const overlay = event.overlay;
      const type = event.type;

      if (type === 'polyline') {
        const path = overlay.getPath();
        const points = path.getArray().map((point: google.maps.LatLng) => ({
          lat: point.lat(),
          lng: point.lng()
        }));

        let distance = 0;
        for (let i = 0; i < points.length - 1; i++) {
          distance += google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(points[i].lat, points[i].lng),
            new google.maps.LatLng(points[i + 1].lat, points[i + 1].lng)
          );
        }

        const measurement: Measurement = {
          id: Date.now().toString(),
          points,
          distance: Math.round(distance),
          type: 'line',
          title: `Distanz ${Math.round(distance)}m`,
          unit: 'meters'
        };

        onMeasurementAdd(measurement);
      }

      if (type === 'polygon') {
        const path = overlay.getPath();
        const points = path.getArray().map((point: google.maps.LatLng) => ({
          lat: point.lat(),
          lng: point.lng()
        }));

        const area = google.maps.geometry.spherical.computeArea(path);

        const measurement: Measurement = {
          id: Date.now().toString(),
          points,
          distance: Math.round(area),
          type: 'area',
          title: `Fläche ${Math.round(area)}m²`,
          unit: 'meters'
        };

        onMeasurementAdd(measurement);
      }

      // Drawing Mode nach dem Zeichnen deaktivieren
      manager.setDrawingMode(null);
      onDrawingModeChange(null);
    });
  };

  // Drawing Mode ändern
  useEffect(() => {
    if (drawingManager) {
      if (drawingMode === 'distance') {
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
      } else if (drawingMode === 'area') {
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
      } else {
        drawingManager.setDrawingMode(null);
      }
    }
  }, [drawingMode, drawingManager]);

  // Projekt-Marker erstellen
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    // Alle bestehenden Marker entfernen
    projects.forEach(project => {
      if (project.latitude && project.longitude) {
        const marker = new google.maps.Marker({
          position: { lat: parseFloat(project.latitude as string), lng: parseFloat(project.longitude as string) },
          map: mapRef.current,
          title: project.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#2563eb" stroke="white" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">P</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32)
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${project.name}</h3>
              <p style="margin: 0 0 8px 0; color: #666;">${project.description || 'Keine Beschreibung'}</p>
              <p style="margin: 0; font-size: 12px; color: #888;">ID: ${project.id}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapRef.current, marker);
          onProjectSelect(project);
        });
      }
    });
  }, [projects, isLoaded, onProjectSelect]);

  // Custom Marker erstellen
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    markers.forEach(customMarker => {
      const marker = new google.maps.Marker({
        position: { lat: customMarker.lat, lng: customMarker.lng },
        map: mapRef.current,
        title: customMarker.title,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="10" fill="${customMarker.color}" stroke="white" stroke-width="2"/>
              <text x="14" y="18" text-anchor="middle" fill="white" font-size="10" font-weight="bold">M</text>
            </svg>
          `),
          scaledSize: new google.maps.Size(28, 28)
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="min-width: 180px;">
            <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: bold;">${customMarker.title}</h4>
            <p style="margin: 0; color: #666; font-size: 12px;">${customMarker.description}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapRef.current, marker);
      });
    });
  }, [markers, isLoaded]);

  // Zur Suchposition springen
  useEffect(() => {
    if (!mapRef.current || !searchLocation) return;

    mapRef.current.setCenter({ lat: searchLocation.lat, lng: searchLocation.lng });
    mapRef.current.setZoom(17);

    // Temporären Marker für Suchposition setzen
    const searchMarker = new google.maps.Marker({
      position: { lat: searchLocation.lat, lng: searchLocation.lng },
      map: mapRef.current,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="14" fill="#ef4444" stroke="white" stroke-width="3"/>
            <text x="18" y="22" text-anchor="middle" fill="white" font-size="14" font-weight="bold">📍</text>
          </svg>
        `),
        scaledSize: new google.maps.Size(36, 36)
      },
      animation: google.maps.Animation.BOUNCE
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="min-width: 200px;">
          <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: bold;">Gefundene Adresse</h4>
          <p style="margin: 0; color: #666; font-size: 12px;">${searchLocation.address}</p>
        </div>
      `
    });

    infoWindow.open(mapRef.current, searchMarker);

    // Marker nach 10 Sekunden entfernen
    setTimeout(() => {
      searchMarker.setMap(null);
      infoWindow.close();
    }, 10000);
  }, [searchLocation]);

  return (
    <div
      style={{ height: '100%', width: '100%' }}
      ref={(node) => {
        if (node && !mapRef.current) {
          const map = new google.maps.Map(node, {
            center: { lat: 49.7913, lng: 9.9534 }, // Würzburg
            zoom: 13,
            mapTypeId: 'hybrid',
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: false,
            zoomControl: true,
            gestureHandling: 'greedy'
          });
          initMap(map);
        }
      }}
    />
  );
}

export default function MapsEnhanced() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [markers, setMarkers] = useState<CustomMarker[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [drawingMode, setDrawingMode] = useState<string | null>(null);

  // Maps-Konfiguration laden
  const { data: mapsConfig } = useQuery({
    queryKey: ['/api/config/maps'],
  });

  // Projekte laden
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // URL-Parameter für Projektauswahl prüfen
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('project');
    const address = urlParams.get('address');
    const lat = urlParams.get('lat');
    const lng = urlParams.get('lng');

    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.id === parseInt(projectId));
      if (project) {
        setSelectedProject(project);
        if (project.latitude && project.longitude) {
          setSearchLocation({
            lat: parseFloat(project.latitude as string),
            lng: parseFloat(project.longitude as string),
            address: `${project.name} - ${address || 'Projektstandort'}`
          });
        }
      }
    } else if (lat && lng && address) {
      setSearchLocation({
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        address: decodeURIComponent(address)
      });
    }
  }, [projects]);

  // Marker hinzufügen
  const handleMarkerAdd = (marker: CustomMarker) => {
    setMarkers(prev => [...prev, marker]);
    toast({
      title: "Marker hinzugefügt",
      description: `${marker.title} wurde zur Karte hinzugefügt.`,
    });
  };

  // Messung hinzufügen
  const handleMeasurementAdd = (measurement: Measurement) => {
    setMeasurements(prev => [...prev, measurement]);
    toast({
      title: "Messung hinzugefügt",
      description: `${measurement.title} wurde zur Karte hinzugefügt.`,
    });
  };

  // Test-Marker hinzufügen
  const addTestMarker = () => {
    const testMarker: CustomMarker = {
      id: Date.now().toString(),
      lat: 49.7913 + (Math.random() - 0.5) * 0.01,
      lng: 9.9534 + (Math.random() - 0.5) * 0.01,
      title: `Test Marker ${markers.length + 1}`,
      description: 'Automatisch generierter Test-Marker',
      type: 'marker',
      color: '#10b981',
      icon: 'marker',
      createdAt: new Date().toISOString()
    };
    handleMarkerAdd(testMarker);
  };

  // Alle Marker löschen
  const clearAllMarkers = () => {
    setMarkers([]);
    setMeasurements([]);
    toast({
      title: "Karte bereinigt",
      description: "Alle Marker und Messungen wurden entfernt.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Kartendaten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Kompakte Header-Zeile */}
      <div className="bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Projektstandorte</h1>
        </div>

        {/* Kompakte Toolbar */}
        <div className="flex items-center space-x-2">
          <Button
            variant={drawingMode === 'distance' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDrawingMode(drawingMode === 'distance' ? null : 'distance')}
          >
            <Ruler className="h-4 w-4 mr-1" />
            Distanz
          </Button>

          <Button
            variant={drawingMode === 'area' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDrawingMode(drawingMode === 'area' ? null : 'area')}
          >
            <Layers className="h-4 w-4 mr-1" />
            Fläche
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={addTestMarker}
          >
            <Plus className="h-4 w-4 mr-1" />
            Test Marker
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={clearAllMarkers}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Löschen
          </Button>
        </div>
      </div>

      {/* Hauptbereich mit Seitenleiste und Karte */}
      <div className="flex-1 flex">
        {/* Kompakte Seitenleiste */}
        <Card className="w-80 m-4 mr-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Kartentools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Adresssuche */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Adresse suchen</Label>
              <DirectAddressSearch onLocationSelect={setSearchLocation} />
            </div>

            {/* Projekt-Auswahl */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Projekt auswählen</Label>
              <Select
                value={selectedProject?.id.toString() || ''}
                onValueChange={(value) => {
                  const project = projects.find(p => p.id === parseInt(value));
                  setSelectedProject(project || null);
                  if (project?.latitude && project?.longitude) {
                    setSearchLocation({
                      lat: parseFloat(project.latitude as string),
                      lng: parseFloat(project.longitude as string),
                      address: project.name
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Projekt wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.filter(p => p.latitude && p.longitude).map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fachgeoportale */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Fachgeoportale</Label>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => window.open('https://geoportal.bayern.de/bayernatlas/', '_blank')}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  BayernAtlas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => window.open('https://www.lfu.bayern.de/boden/bodenkundliche_karte_bayern/index.htm', '_blank')}
                >
                  <Layers className="h-4 w-4 mr-2" />
                  LfU Bodeninformationen
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => window.open('https://www.bgr.bund.de/DE/Themen/GG_Geoportal/geoportal_node.html', '_blank')}
                >
                  <Target className="h-4 w-4 mr-2" />
                  BGR Geoportal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Karte */}
        <div className="flex-1 mx-4 mb-4">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              {mapsConfig && (mapsConfig as any).apiKey ? (
                <Wrapper
                  apiKey={(mapsConfig as any).apiKey}
                  libraries={['drawing', 'geometry']}
                  render={(status: Status) => {
                    if (status === Status.LOADING) return <div className="h-full flex items-center justify-center">Lade Google Maps...</div>;
                    if (status === Status.FAILURE) return <div className="h-full flex items-center justify-center text-red-500">Fehler beim Laden der Karte</div>;
                    return (
                      <EnhancedGoogleMap
                        projects={projects}
                        selectedProject={selectedProject}
                        onProjectSelect={setSelectedProject}
                        markers={markers}
                        measurements={measurements}
                        onMarkerAdd={handleMarkerAdd}
                        onMeasurementAdd={handleMeasurementAdd}
                        searchLocation={searchLocation}
                        drawingMode={drawingMode}
                        onDrawingModeChange={setDrawingMode}
                      />
                    );
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">Google Maps API-Schlüssel nicht verfügbar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statistiken */}
      <div className="mx-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{projects.filter(p => p.latitude && p.longitude).length}</div>
              <div className="text-sm text-gray-600">Projekte auf Karte</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{markers.length}</div>
              <div className="text-sm text-gray-600">Custom Marker</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{measurements.filter(m => m.type === 'line').length}</div>
              <div className="text-sm text-gray-600">Distanzmessungen</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{measurements.filter(m => m.type === 'area').length}</div>
              <div className="text-sm text-gray-600">Flächenmessungen</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}