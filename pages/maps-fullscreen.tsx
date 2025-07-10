import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import { ArrowLeft, MapPin, Ruler, Layers, Download, Trash2, Plus, Save } from "lucide-react";
import { Link } from "wouter";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { DirectAddressSearch } from "../components/maps/direct-address-search";
import type { Project } from "../../shared/schema";

// Interfaces
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

interface Measurement {
  id: string;
  points: { lat: number; lng: number }[];
  distance: number;
  type: 'line' | 'area';
  title: string;
  unit: 'meters' | 'kilometers';
}

// Google Maps Component
function FullscreenGoogleMap({ 
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
}: {
  projects: Project[];
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
  markers: CustomMarker[];
  measurements: Measurement[];
  onMarkerAdd: (marker: Omit<CustomMarker, 'id' | 'createdAt'>) => void;
  onMeasurementAdd: (measurement: Omit<Measurement, 'id'>) => void;
  searchLocation: { lat: number; lng: number; address: string } | null;
  drawingMode: string;
  onDrawingModeChange: (mode: string) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [googleMarkers, setGoogleMarkers] = useState<any[]>([]);
  const [searchMarker, setSearchMarker] = useState<any>(null);
  const [drawingManager, setDrawingManager] = useState<any>(null);

  // Karte initialisieren
  useEffect(() => {
    if (mapRef.current && !map && (window as any).google?.maps) {
      const newMap = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: 48.1351, lng: 11.5820 },
        zoom: 12,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: (window as any).google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: (window as any).google.maps.ControlPosition.TOP_RIGHT
        },
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'greedy'
      });

      // Drawing Manager
      const drawingMgr = new (window as any).google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false
      });
      drawingMgr.setMap(newMap);
      setDrawingManager(drawingMgr);

      // Click-Handler für Marker mit erweiterten Debug-Logs
      const handleMapClick = (event: any) => {
        console.log('🗺️ Map clicked! Event:', event);
        console.log('📍 Event latLng:', event.latLng);
        
        // Drawing mode direkt aus dem aktuellen Zustand abrufen
        const getCurrentDrawingMode = () => {
          const toolbar = document.querySelector('[data-drawing-mode]');
          return toolbar?.getAttribute('data-drawing-mode') || '';
        };
        
        const currentMode = getCurrentDrawingMode();
        console.log('🎯 Current drawing mode from DOM:', currentMode);
        
        if (currentMode === 'marker') {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          
          console.log('✅ Creating marker at coordinates:', { lat, lng });
          
          const markerData = {
            lat: Number(lat),
            lng: Number(lng),
            title: `Marker ${new Date().toLocaleTimeString('de-DE')}`,
            description: `Position: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            type: 'marker' as const,
            projectId: selectedProject?.id,
            color: '#dc2626',
            icon: '📍'
          };
          
          console.log('📦 Marker data created:', markerData);
          onMarkerAdd(markerData);
          console.log('🔄 Resetting drawing mode');
          onDrawingModeChange('');
        } else {
          console.log('❌ Not in marker mode, ignoring click');
        }
      };
      
      newMap.addListener('click', handleMapClick);
      setMap(newMap);
    }
  }, []);

  // Separater useEffect für Drawing-Mode-Änderungen
  useEffect(() => {
    console.log('🎨 Drawing mode changed to:', drawingMode);
    if (map) {
      // Cursor-Stil ändern je nach Modus
      if (drawingMode === 'marker') {
        map.setOptions({ draggableCursor: 'crosshair' });
        console.log('🎯 Map cursor set to crosshair for marker mode');
      } else {
        map.setOptions({ draggableCursor: 'grab' });
        console.log('👋 Map cursor reset to grab');
      }
    }
  }, [drawingMode, map]);

  // Projekt-Marker rendern
  useEffect(() => {
    if (map && projects) {
      googleMarkers.forEach(marker => marker.setMap(null));
      
      const newMarkers = projects
        .filter(project => 
          project.latitude && 
          project.longitude && 
          typeof project.latitude === 'number' && 
          typeof project.longitude === 'number' &&
          !isNaN(project.latitude) &&
          !isNaN(project.longitude)
        )
        .map(project => {
          const marker = new (window as any).google.maps.Marker({
            position: { 
              lat: Number(project.latitude), 
              lng: Number(project.longitude) 
            },
            map: map,
            title: project.name,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="20" fill="#10b981" stroke="#ffffff" stroke-width="4"/>
                  <text x="24" y="30" text-anchor="middle" fill="white" font-size="16" font-weight="bold">P</text>
                </svg>
              `),
              scaledSize: new (window as any).google.maps.Size(48, 48)
            }
          });

          marker.addListener('click', () => {
            onProjectSelect(project);
          });

          return marker;
        });

      setGoogleMarkers(newMarkers);
    }
  }, [map, projects, onProjectSelect]);

  // Custom Marker rendern
  useEffect(() => {
    console.log('🎨 Custom marker rendering triggered. Map:', !!map, 'Markers count:', markers.length);
    
    if (map && markers && markers.length > 0) {
      console.log('📍 Rendering', markers.length, 'custom markers');
      
      markers.forEach((markerData, index) => {
        console.log(`🔍 Processing marker ${index + 1}:`, markerData);
        
        if (typeof markerData.lat === 'number' && 
            typeof markerData.lng === 'number' && 
            !isNaN(markerData.lat) && 
            !isNaN(markerData.lng)) {
          
          console.log(`✅ Creating Google Maps marker for: ${markerData.title}`);
          
          const marker = new (window as any).google.maps.Marker({
            position: { 
              lat: Number(markerData.lat), 
              lng: Number(markerData.lng) 
            },
            map: map,
            title: markerData.title,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="20" fill="${markerData.color}" stroke="#ffffff" stroke-width="4"/>
                  <circle cx="24" cy="24" r="8" fill="#ffffff"/>
                  <text x="24" y="30" text-anchor="middle" fill="#000000" font-size="14" font-weight="bold">M</text>
                </svg>
              `),
              scaledSize: new (window as any).google.maps.Size(48, 48)
            },
            animation: (window as any).google.maps.Animation.DROP
          });
          
          console.log(`🎯 Marker created successfully at ${markerData.lat}, ${markerData.lng}`);
          
          // Info Window hinzufügen
          const infoWindow = new (window as any).google.maps.InfoWindow({
            content: `
              <div style="padding: 8px;">
                <h4 style="margin: 0 0 4px 0; font-weight: bold;">${markerData.title}</h4>
                <p style="margin: 0 0 4px 0;">${markerData.description}</p>
                <small style="color: #666;">Erstellt: ${new Date(markerData.createdAt).toLocaleString('de-DE')}</small>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
          
        } else {
          console.log(`❌ Invalid coordinates for marker ${index + 1}:`, { lat: markerData.lat, lng: markerData.lng });
        }
      });
    } else {
      console.log('🚫 No markers to render or map not ready');
    }
  }, [map, markers]);

  // Suchmarker
  useEffect(() => {
    if (map && searchLocation && 
        typeof searchLocation.lat === 'number' && 
        typeof searchLocation.lng === 'number' &&
        !isNaN(searchLocation.lat) && 
        !isNaN(searchLocation.lng)) {
      
      if (searchMarker) {
        searchMarker.setMap(null);
      }

      const newSearchMarker = new (window as any).google.maps.Marker({
        position: { 
          lat: Number(searchLocation.lat), 
          lng: Number(searchLocation.lng) 
        },
        map: map,
        title: 'Suchergebnis: ' + searchLocation.address,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="16" fill="#dc2626" stroke="#ffffff" stroke-width="3"/>
              <circle cx="20" cy="20" r="8" fill="#ffffff"/>
            </svg>
          `),
          scaledSize: new (window as any).google.maps.Size(40, 40)
        },
        animation: (window as any).google.maps.Animation.BOUNCE
      });

      setSearchMarker(newSearchMarker);
      map.panTo({ 
        lat: Number(searchLocation.lat), 
        lng: Number(searchLocation.lng) 
      });
      map.setZoom(16);

      setTimeout(() => {
        if (newSearchMarker) {
          newSearchMarker.setAnimation(null);
        }
      }, 3000);
    }
  }, [map, searchLocation]);

  return <div ref={mapRef} className="w-full h-full" />;
}

// Hauptkomponente
export default function FullscreenMaps() {
  const { toast } = useToast();
  
  const [markers, setMarkers] = useState<CustomMarker[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [drawingMode, setDrawingMode] = useState<string>('');

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: mapsConfig } = useQuery<{ apiKey?: string }>({
    queryKey: ["/api/config/maps-key"],
  });

  const handleMarkerAdd = (marker: Omit<CustomMarker, 'id' | 'createdAt'>) => {
    console.log('📌 handleMarkerAdd called with:', marker);
    const newMarkerData: CustomMarker = {
      ...marker,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    console.log('📦 New marker data created:', newMarkerData);
    setMarkers(prev => {
      const updated = [...prev, newMarkerData];
      console.log('🗃️ Updated markers array:', updated);
      return updated;
    });
    toast({
      title: "Marker hinzugefügt",
      description: `Neuer Marker "${marker.title}" wurde erstellt.`,
    });
    console.log('✅ Toast notification sent');
  };

  const handleMeasurementAdd = (measurement: Omit<Measurement, 'id'>) => {
    const newMeasurement: Measurement = {
      ...measurement,
      id: Date.now().toString()
    };
    setMeasurements(prev => [...prev, newMeasurement]);
    toast({
      title: "Messung hinzugefügt",
      description: measurement.type === 'line' 
        ? `Distanz: ${measurement.distance}m` 
        : `Fläche: ${measurement.distance}m²`,
    });
  };

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
      <div className="h-screen flex items-center justify-center">
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
          <h1 className="text-xl font-semibold text-gray-900">Tiefbau Map</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedProject?.id.toString() || "all"} onValueChange={(value) => {
            if (value === "all") {
              setSelectedProject(null);
            } else {
              const project = projects.find(p => p.id.toString() === value);
              setSelectedProject(project || null);
            }
          }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Projekt auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Projekte</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Seitliche Toolbar */}
        <div className="w-80 bg-white border-r shadow-sm p-4 overflow-y-auto">
          {/* Baustellenstandort */}
          <div className="space-y-4 mb-6">
            <div>
              <Label className="text-sm font-medium text-gray-700">Baustellenstandort:</Label>
              <Input placeholder="Stadt/Gemeinde" className="mt-1" />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Baustellenstraße:</Label>
              <Input placeholder="Straße und Hausnummer" className="mt-1" />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Baustellenpostleitzahl:</Label>
              <Input placeholder="PLZ" className="mt-1" />
            </div>
          </div>

          {/* Adresssuche */}
          <div className="mb-6">
            <DirectAddressSearch
              onLocationSelect={(location) => setSearchLocation(location)}
              placeholder="Adresse suchen..."
            />
          </div>

          {/* Werkzeuge */}
          <div className="space-y-3 mb-6">
            <h3 className="font-medium text-gray-900">Werkzeuge</h3>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant={drawingMode === 'marker' ? 'default' : 'outline'}
                onClick={() => {
                  const newMode = drawingMode === 'marker' ? '' : 'marker';
                  console.log('🔘 Button clicked! Setting drawing mode to:', newMode);
                  setDrawingMode(newMode);
                }}
                className="w-full justify-start"
              >
                <MapPin className="h-4 w-4 mr-2" />
                {drawingMode === 'marker' ? '✅ Marker-Modus aktiv' : 'Marker setzen'}
              </Button>
              <Button
                variant={drawingMode === 'line' ? 'default' : 'outline'}
                onClick={() => setDrawingMode(drawingMode === 'line' ? '' : 'line')}
                className="w-full justify-start"
              >
                <Ruler className="h-4 w-4 mr-2" />
                Distanz messen
              </Button>
              <Button
                variant={drawingMode === 'area' ? 'default' : 'outline'}
                onClick={() => setDrawingMode(drawingMode === 'area' ? '' : 'area')}
                className="w-full justify-start"
              >
                <Layers className="h-4 w-4 mr-2" />
                Fläche messen
              </Button>
            </div>
          </div>

          {/* Route-Informationen */}
          <div className="space-y-3 mb-6">
            <h3 className="font-medium text-gray-900">Route</h3>
            <div className="bg-gray-50 border rounded-lg p-3">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Route Start:</span>
                  <div className="text-gray-600">Kein Startpunkt</div>
                </div>
                <div>
                  <span className="font-medium">Route Ende:</span>
                  <div className="text-gray-600">Kein Endpunkt</div>
                </div>
                <div>
                  <span className="font-medium">Streckenlänge:</span>
                  <div className="text-gray-600">Keine Route</div>
                </div>
              </div>
              <div className="flex gap-1 mt-3">
                <Button size="sm" variant="outline" className="flex-1 text-xs">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Route löschen
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs">
                  <Save className="h-3 w-3 mr-1" />
                  Route speichern
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs">
                  <Download className="h-3 w-3 mr-1" />
                  PDF-Bericht
                </Button>
              </div>
            </div>
          </div>

          {/* Status-Info */}
          {drawingMode && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm font-medium text-blue-800">
                {drawingMode === 'marker' && '📍 Klicken Sie auf die Karte, um einen Marker zu setzen'}
                {drawingMode === 'line' && '📏 Klicken Sie auf die Karte, um eine Distanz zu messen'}
                {drawingMode === 'area' && '📐 Klicken Sie auf die Karte, um eine Fläche zu messen'}
              </p>
            </div>
          )}

          {/* Debug Info */}
          <div className="p-2 bg-gray-50 border rounded-md">
            <p className="text-xs text-gray-600">
              Projekte: {projects.length} | Marker: {markers.length} | Messungen: {measurements.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Modus: {drawingMode || 'Kein Modus'} | 
              Mit Koordinaten: {projects.filter(p => p.latitude && p.longitude).length}
            </p>
          </div>

          {/* Test Button */}
          <div className="mt-4">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                console.log('🧪 Test Marker button clicked!');
                const testMarker = {
                  lat: 48.1351 + (Math.random() - 0.5) * 0.01,
                  lng: 11.5820 + (Math.random() - 0.5) * 0.01,
                  title: `Test Marker ${Date.now()}`,
                  description: 'Test Marker für Debugging',
                  type: 'marker' as const,
                  color: '#ef4444',
                  icon: '🔴'
                };
                console.log('📍 Creating test marker:', testMarker);
                handleMarkerAdd(testMarker);
              }}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-1" />
              Test Marker erstellen
            </Button>
          </div>
        </div>

        {/* Vollbild-Karte */}
        <div className="flex-1 relative">
          {mapsConfig && mapsConfig.apiKey ? (
            <Wrapper
              apiKey={mapsConfig.apiKey}
              libraries={['drawing', 'geometry']}
              render={(status: Status) => {
                if (status === Status.LOADING) return (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Lade Google Maps...</p>
                    </div>
                  </div>
                );
                if (status === Status.FAILURE) return (
                  <div className="w-full h-full flex items-center justify-center bg-red-50">
                    <p className="text-red-500">Fehler beim Laden der Karte</p>
                  </div>
                );
                return (
                  <FullscreenGoogleMap
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
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <p className="text-gray-500">Google Maps API-Schlüssel wird geladen...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}