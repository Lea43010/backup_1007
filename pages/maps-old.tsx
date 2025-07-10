import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { PageHeader } from "../components/layout/page-header";
import { MobileNav } from "../components/layout/mobile-nav";
import { ArrowLeft, Search, Plus, Minus, Navigation, X, MapPin, Hammer, Wrench, Check, Ruler, Download, Trash2, Edit3, Layers, Target, Move, Save } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { DirectAddressSearch } from "../components/maps/direct-address-search";
import type { Project } from "../../shared/schema";

// Google Maps Component
interface GoogleMapComponentProps {
  projects: Project[];
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
  onLocationSearch: (location: { lat: number; lng: number; address: string }) => void;
  searchLocation: { lat: number; lng: number; address: string } | null;
}

function GoogleMapComponent({ projects, selectedProject, onProjectSelect, onLocationSearch, searchLocation }: GoogleMapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [searchMarker, setSearchMarker] = useState<any>(null);

  useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: 48.1351, lng: 11.5820 }, // Munich
        zoom: 10,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });
      
      // Add click listener for marking locations
      newMap.addListener('click', (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        // Reverse geocode to get address
        const geocoder = new (window as any).google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat, lng } },
          (results: any, status: any) => {
            const address = status === 'OK' && results?.[0] 
              ? results[0].formatted_address 
              : `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            
            onLocationSearch({ lat, lng, address });
            
            // Remove previous search marker
            if (searchMarker) {
              searchMarker.setMap(null);
            }
            
            // Add new search marker
            const newSearchMarker = new (window as any).google.maps.Marker({
              position: { lat, lng },
              map: newMap,
              title: 'Gesuchter Standort',
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="12" fill="#ff4444" stroke="#ffffff" stroke-width="3"/>
                    <circle cx="16" cy="16" r="6" fill="#ffffff"/>
                  </svg>
                `),
                scaledSize: new (window as any).google.maps.Size(32, 32),
                anchor: new (window as any).google.maps.Point(16, 16),
              },
            });
            
            setSearchMarker(newSearchMarker);
          }
        );
      });
      
      setMap(newMap);
    }
  }, [map, onLocationSearch, searchMarker]);

  // Handle search location changes - move map to selected address
  useEffect(() => {
    if (map && searchLocation) {
      // Pan to the search location with smooth animation
      map.panTo({ lat: searchLocation.lat, lng: searchLocation.lng });
      map.setZoom(15); // Zoom in to street level
      
      // Remove previous search marker
      if (searchMarker) {
        searchMarker.setMap(null);
      }
      
      // Add new search marker
      const newSearchMarker = new (window as any).google.maps.Marker({
        position: { lat: searchLocation.lat, lng: searchLocation.lng },
        map: map,
        title: searchLocation.address,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#22c55e" stroke="#ffffff" stroke-width="3"/>
              <circle cx="16" cy="16" r="6" fill="#ffffff"/>
            </svg>
          `),
          scaledSize: new (window as any).google.maps.Size(32, 32),
          anchor: new (window as any).google.maps.Point(16, 16),
        },
      });
      
      setSearchMarker(newSearchMarker);
      
      // Optional: Show info window with address
      const infoWindow = new (window as any).google.maps.InfoWindow({
        content: `<div class="p-2 text-sm"><strong>Gefundene Adresse:</strong><br/>${searchLocation.address}</div>`
      });
      
      newSearchMarker.addListener('click', () => {
        infoWindow.open(map, newSearchMarker);
      });
    }
  }, [map, searchLocation, searchMarker]);

  useEffect(() => {
    if (map && projects.length > 0) {
      // Clear existing project markers
      markers.forEach(marker => marker.setMap(null));
      
      // Create new project markers
      const newMarkers = projects.map(project => {
        if (!project.latitude || !project.longitude) return null;
        
        const lat = typeof project.latitude === 'string' ? parseFloat(project.latitude) : project.latitude;
        const lng = typeof project.longitude === 'string' ? parseFloat(project.longitude) : project.longitude;
        
        const marker = new (window as any).google.maps.Marker({
          position: { lat, lng },
          map,
          title: project.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="${getMarkerColor(project.status)}" stroke="#ffffff" stroke-width="2"/>
                <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${project.id}</text>
              </svg>
            `),
            scaledSize: new (window as any).google.maps.Size(24, 24),
            anchor: new (window as any).google.maps.Point(12, 12),
          },
        });

        marker.addListener('click', () => {
          onProjectSelect(project);
        });

        return marker;
      }).filter(Boolean);

      setMarkers(newMarkers);
    }
  }, [map, projects, onProjectSelect]);

  const getMarkerColor = (status: string) => {
    switch (status) {
      case "active": return "#22c55e";
      case "planning": return "#f97316";
      case "completed": return "#6b7280";
      default: return "#3b82f6";
    }
  };

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}

// Maps Status Render
const renderMapsStatus = (status: Status): React.ReactElement => {
  switch (status) {
    case Status.LOADING:
      return <div className="flex items-center justify-center h-full bg-gray-100">Karte wird geladen...</div>;
    case Status.FAILURE:
      return <div className="flex items-center justify-center h-full bg-red-50">Fehler beim Laden der Karte</div>;
    case Status.SUCCESS:
      return <></>;
    default:
      return <div></div>;
  }
};

export default function Maps() {
  const [, setLocation] = useLocation();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchLocation, setSearchLocation] = useState<{lat: number; lng: number; address: string} | null>(null);

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: mapsConfig, isLoading: mapsConfigLoading } = useQuery<{apiKey: string}>({
    queryKey: ["/api/config/maps-key"],
  });

  const projectsWithLocation = projects.filter(p => p.latitude && p.longitude);

  // Don't render map until API key is loaded
  if (mapsConfigLoading || !mapsConfig?.apiKey) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <PageHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              <Link to="/" className="sm:hidden">
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Projektstandorte</h1>
                <p className="text-sm text-gray-500">GPS-Übersicht & Standortsuche</p>
              </div>
            </div>
          </div>
        </PageHeader>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Karte wird geladen...</p>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  const handleLocationSearch = (location: { lat: number; lng: number; address: string }) => {
    setSearchLocation(location);
    setSelectedProject(null); // Clear project selection when searching
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setSearchLocation(null); // Clear search when selecting project
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <PageHeader>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <Link to="/" className="sm:hidden">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Projektstandorte</h1>
              <p className="text-sm text-gray-500">GPS-Übersicht & Standortsuche</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <Link to="/">
              <div className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Zurück
              </div>
            </Link>
          </div>
        </div>
      </PageHeader>

      {/* Search Bar with Autocomplete */}
      <div className="px-4 py-2 bg-white border-b border-gray-200">
        <DirectAddressSearch
          onLocationSelect={handleLocationSearch}
          placeholder="Adresse suchen (z.B. Hauptstraße 5, München)..."
        />
        
        {/* Search Result Display */}
        {searchLocation && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Gefundener Standort:</p>
                <p className="text-xs text-red-600">{searchLocation.address}</p>
                <p className="text-xs text-red-500">
                  {searchLocation.lat.toFixed(6)}, {searchLocation.lng.toFixed(6)}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSearchLocation(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <div className="mt-2 text-xs text-gray-500">
          💡 Tipp: Geben Sie eine beliebige Adresse in Deutschland ein und wählen Sie aus den Vorschlägen
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[60vh] bg-gray-300">
        {/* Google Maps Integration */}
        <Wrapper
          apiKey={mapsConfig.apiKey}
          render={renderMapsStatus}
          libraries={["places"]}
        >
          <GoogleMapComponent
            projects={projectsWithLocation}
            selectedProject={selectedProject}
            onProjectSelect={handleProjectSelect}
            onLocationSearch={handleLocationSearch}
            searchLocation={searchLocation}
          />
        </Wrapper>

        {/* Floating Project Info */}
        {selectedProject && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:w-80">
            <Card className="shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedProject.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedProject.status === 'planning' ? 'bg-orange-100 text-orange-800' :
                    selectedProject.status === 'completed' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedProject.status === 'active' ? <><Check className="h-3 w-3 inline mr-1" />Aktiv</> :
                     selectedProject.status === 'planning' ? <><Hammer className="h-3 w-3 inline mr-1" />Planung</> :
                     selectedProject.status === 'completed' ? <><Wrench className="h-3 w-3 inline mr-1" />Fertig</> : 'Unbekannt'}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedProject(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  #{selectedProject.id}: {selectedProject.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{selectedProject.description}</p>
                {selectedProject.latitude && selectedProject.longitude && (
                  <p className="text-xs text-gray-500">
                    GPS: {Number(selectedProject.latitude).toFixed(6)}, {Number(selectedProject.longitude).toFixed(6)}
                  </p>
                )}
                <div className="mt-3 flex space-x-2">
                  <Link to={`/projects/${selectedProject.id}`}>
                    <Button size="sm" className="flex-1">
                      Details ansehen
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Debug Info Panel */}
      <div className="p-4 bg-white border-t">
        <div className="text-sm">
          <h3 className="font-semibold mb-2">Debug-Information:</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Projekte gesamt: {projects.length}</div>
            <div>Mit GPS: {projectsWithLocation.length}</div>
            <div>Suchstatus: Bereit</div>
            <div>API: Verbunden</div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Die Suche verwendet drei APIs parallel für vollständige Abdeckung aller deutschen Adressen.
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}