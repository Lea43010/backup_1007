import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import { ArrowLeft, MapPin, Ruler, Layers, Download, Trash2, Plus, Save, ExternalLink } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { DirectAddressSearch } from "../components/maps/direct-address-search";

import type { Project } from "../../shared/schema";

// Globale Variable für Drawing Mode
let currentDrawingMode = '';

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

// Google Maps Component
function SimpleGoogleMap({ 
  projects, 
  selectedProject, 
  onProjectSelect, 
  markers,
  onMarkerAdd,
  onMarkersCleared,
  searchLocation,
  drawingMode,
  onDrawingModeChange,
  onMapReady
}: {
  projects: Project[];
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
  markers: CustomMarker[];
  onMarkerAdd: (marker: Omit<CustomMarker, 'id' | 'createdAt'>) => void;
  onMarkersCleared?: () => void;
  searchLocation: { lat: number; lng: number; address: string } | null;
  drawingMode: string;
  onDrawingModeChange: (mode: string) => void;
  onMapReady?: (map: any) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [googleMarkers, setGoogleMarkers] = useState<any[]>([]);
  const [customMarkers, setCustomMarkers] = useState<any[]>([]);
  const [searchMarker, setSearchMarker] = useState<any>(null);
  const [measurementMarkers, setMeasurementMarkers] = useState<any[]>([]);
  const [measurementLine, setMeasurementLine] = useState<any>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isMeasurementMode, setIsMeasurementMode] = useState(false);

  // Suchmarker-Funktionalität - automatisches Kartensprung
  useEffect(() => {
    console.log('🔍 Search location effect triggered:', searchLocation);
    
    if (map && searchLocation && 
        typeof searchLocation.lat === 'number' && 
        typeof searchLocation.lng === 'number' &&
        !isNaN(searchLocation.lat) && 
        !isNaN(searchLocation.lng)) {
      
      console.log('📍 Creating search marker and jumping to location');
      
      // Alte Suchmarker entfernen
      if (searchMarker) {
        searchMarker.setMap(null);
        console.log('🗑️ Previous search marker removed');
      }
      
      const newSearchMarker = new (window as any).google.maps.Marker({
        position: { 
          lat: Number(searchLocation.lat), 
          lng: Number(searchLocation.lng) 
        },
        map: map,
        title: `Suchergebnis: ${searchLocation.address}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="16" fill="#dc2626" stroke="#ffffff" stroke-width="4"/>
              <circle cx="20" cy="20" r="8" fill="#ffffff"/>
              <text x="20" y="26" text-anchor="middle" fill="#dc2626" font-size="12" font-weight="bold">📍</text>
            </svg>
          `),
          scaledSize: new (window as any).google.maps.Size(40, 40),
          anchor: new (window as any).google.maps.Point(20, 20)
        },
        animation: (window as any).google.maps.Animation.DROP,
        zIndex: 1000
      });

      // Info Window für Suchergebnis
      const searchInfoWindow = new (window as any).google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 250px;">
            <h4 style="margin: 0 0 8px 0; font-weight: bold; color: #dc2626;">🔍 Suchergebnis</h4>
            <p style="margin: 0 0 4px 0; font-size: 14px;">${searchLocation.address}</p>
            <small style="color: #666;">Koordinaten: ${searchLocation.lat.toFixed(6)}, ${searchLocation.lng.toFixed(6)}</small>
          </div>
        `
      });

      newSearchMarker.addListener('click', () => {
        searchInfoWindow.open(map, newSearchMarker);
      });

      // Info Window nur bei Klick öffnen (automatisches Öffnen entfernt)
      // setTimeout(() => {
      //   searchInfoWindow.open(map, newSearchMarker);
      // }, 1000);

      // Karte zu Suchergebnis bewegen mit Animation
      map.panTo({ 
        lat: Number(searchLocation.lat), 
        lng: Number(searchLocation.lng) 
      });
      map.setZoom(17); // Näher zoomen für Straßenansicht mit Hausnummern

      setSearchMarker(newSearchMarker);

      // Animation nach 2 Sekunden sanft beenden
      setTimeout(() => {
        if (newSearchMarker && newSearchMarker.getMap()) {
          newSearchMarker.setAnimation(null);
          console.log('🔻 Search marker animation stopped');
        }
      }, 2000);

      console.log('✅ Search marker created and map jumped to location');
    }
  }, [map, searchLocation]);

  // Global functions für Marker-Management
  useEffect(() => {
    (window as any).clearSearchMarker = () => {
      if (searchMarker) {
        searchMarker.setMap(null);
        setSearchMarker(null);
        console.log('🧹 Search marker cleared via global function');
      }
    };

    (window as any).clearAllMapMarkers = () => {
      console.log('🧹 Clearing all map markers via global function');
      
      // Custom Marker entfernen
      customMarkers.forEach((marker: any) => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      });
      setCustomMarkers([]);
      
      // Suchmarker entfernen
      if (searchMarker) {
        searchMarker.setMap(null);
        setSearchMarker(null);
      }
      
      // Messungen entfernen
      measurementMarkers.forEach((marker: any) => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      });
      setMeasurementMarkers([]);
      
      if (measurementLine) {
        measurementLine.setMap(null);
        setMeasurementLine(null);
      }
      
      console.log('✅ All map markers cleared');
    };

    return () => {
      delete (window as any).clearSearchMarker;
      delete (window as any).clearAllMapMarkers;
    };
  }, [searchMarker, customMarkers, measurementMarkers, measurementLine]);

  // Cleanup für Suchmarker beim Unmounting
  useEffect(() => {
    return () => {
      if (searchMarker) {
        searchMarker.setMap(null);
        console.log('🧹 Search marker cleaned up on unmount');
      }
    };
  }, [searchMarker]);

  // Distanzmessung - Klick-Handler für Kartenklicks
  useEffect(() => {
    if (map && isMeasurementMode) {
      const clickListener = map.addListener('click', (event: any) => {
        const clickedPosition = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
        
        console.log('📏 Measurement click:', clickedPosition);
        addMeasurementMarker(clickedPosition);
      });

      return () => {
        if (clickListener) {
          window.google.maps.event.removeListener(clickListener);
        }
      };
    }
  }, [map, isMeasurementMode]);

  // Messung-Marker hinzufügen
  const addMeasurementMarker = (position: { lat: number; lng: number }) => {
    if (measurementMarkers.length >= 2) {
      // Reset wenn bereits 2 Marker vorhanden
      clearMeasurement();
    }

    const markerNumber = measurementMarkers.length + 1;
    const marker = new (window as any).google.maps.Marker({
      position: position,
      map: map,
      title: `Messpunkt ${markerNumber}`,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#2563eb" stroke="#ffffff" stroke-width="3"/>
            <circle cx="16" cy="16" r="6" fill="#ffffff"/>
            <text x="16" y="21" text-anchor="middle" fill="#2563eb" font-size="10" font-weight="bold">${markerNumber}</text>
          </svg>
        `),
        scaledSize: new (window as any).google.maps.Size(32, 32),
        anchor: new (window as any).google.maps.Point(16, 16)
      },
      animation: (window as any).google.maps.Animation.DROP,
      zIndex: 900
    });

    const newMarkers = [...measurementMarkers, marker];
    setMeasurementMarkers(newMarkers);

    // Info Window für Messpunkt
    const infoWindow = new (window as any).google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; max-width: 200px;">
          <h4 style="margin: 0 0 4px 0; color: #2563eb;">📏 Messpunkt ${markerNumber}</h4>
          <small style="color: #666;">Lat: ${position.lat.toFixed(6)}<br>Lng: ${position.lng.toFixed(6)}</small>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    // Wenn 2 Marker vorhanden sind, Distanz berechnen und Linie zeichnen
    if (newMarkers.length === 2) {
      calculateAndDisplayDistance(newMarkers);
    }
  };

  // Distanz berechnen und anzeigen
  const calculateAndDisplayDistance = (markers: any[]) => {
    if (markers.length !== 2) return;

    const pos1 = markers[0].getPosition();
    const pos2 = markers[1].getPosition();

    // Luftlinie berechnen (Haversine-Formel)
    const distance = calculateHaversineDistance(
      pos1.lat(), pos1.lng(),
      pos2.lat(), pos2.lng()
    );

    setDistance(distance);

    // Linie zwischen den Markern zeichnen
    const line = new (window as any).google.maps.Polyline({
      path: [pos1, pos2],
      geodesic: true,
      strokeColor: '#2563eb',
      strokeOpacity: 1.0,
      strokeWeight: 3,
      map: map
    });

    setMeasurementLine(line);

    // Mittelpunkt für Distanz-Label berechnen
    const midpoint = {
      lat: (pos1.lat() + pos2.lat()) / 2,
      lng: (pos1.lng() + pos2.lng()) / 2
    };

    // Distanz-Info-Window in der Mitte der Linie
    const distanceInfoWindow = new (window as any).google.maps.InfoWindow({
      position: midpoint,
      content: `
        <div style="padding: 10px; text-align: center;">
          <h4 style="margin: 0 0 4px 0; color: #2563eb;">📏 Distanz</h4>
          <strong style="font-size: 16px; color: #1f2937;">${formatDistance(distance)}</strong>
          <br><small style="color: #666;">Luftlinie</small>
        </div>
      `,
      map: map
    });

    console.log(`📏 Distance calculated: ${distance}m (${formatDistance(distance)})`);
  };

  // Haversine-Distanz-Berechnung
  const calculateHaversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371000; // Erdradius in Metern
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distanz in Metern
  };

  // Distanz formatieren
  const formatDistance = (distanceInMeters: number) => {
    if (distanceInMeters < 1000) {
      return `${distanceInMeters.toFixed(1)}m`;
    } else {
      return `${(distanceInMeters / 1000).toFixed(2)}km`;
    }
  };

  // Messung löschen
  const clearMeasurement = () => {
    // Marker entfernen
    measurementMarkers.forEach(marker => {
      marker.setMap(null);
    });
    setMeasurementMarkers([]);

    // Linie entfernen
    if (measurementLine) {
      measurementLine.setMap(null);
      setMeasurementLine(null);
    }

    setDistance(null);
    console.log('🧹 Measurement cleared');
  };

  // Update global drawing mode
  useEffect(() => {
    currentDrawingMode = drawingMode;
    console.log('🎨 Drawing mode updated to:', currentDrawingMode);
  }, [drawingMode]);

  // Karte initialisieren
  useEffect(() => {
    if (mapRef.current && !map && (window as any).google?.maps) {
      console.log('🗺️ Initializing map...');
      
      const newMap = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: 48.1351, lng: 11.5820 },
        zoom: 12,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'greedy'
      });

      // Click-Handler für verschiedene Modi
      newMap.addListener('click', (event: any) => {
        const clickPosition = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
        
        console.log('🗺️ Map clicked! Drawing mode:', currentDrawingMode);
        
        if (currentDrawingMode === 'marker') {
          console.log('✅ Creating marker at:', clickPosition);
          
          onMarkerAdd({
            lat: Number(clickPosition.lat),
            lng: Number(clickPosition.lng),
            title: `Marker ${new Date().toLocaleTimeString('de-DE')}`,
            description: `Position: ${clickPosition.lat.toFixed(6)}, ${clickPosition.lng.toFixed(6)}`,
            type: 'marker',
            projectId: selectedProject?.id,
            color: '#dc2626',
            icon: '📍'
          });
          
          onDrawingModeChange('');
          console.log('🔄 Drawing mode reset');
        } else {
          console.log('❌ Not in marker mode, ignoring click');
        }
      });

      setMap(newMap);
      
      // Map an Parent-Komponente weitergeben
      if (onMapReady) {
        onMapReady(newMap);
      }
      
      console.log('✅ Map initialized successfully');
    }
  }, []);

  // Projekt-Marker rendern
  useEffect(() => {
    if (map && projects) {
      // Vorherige Marker entfernen
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
          console.log('📍 Creating project marker for:', project.name);
          
          const marker = new (window as any).google.maps.Marker({
            position: { 
              lat: Number(project.latitude), 
              lng: Number(project.longitude) 
            },
            map: map,
            title: project.name,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
                  <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">P</text>
                </svg>
              `),
              scaledSize: new (window as any).google.maps.Size(32, 32)
            }
          });

          // Erweiterte Info für Projekt-Marker mit Distanz zum Suchmarker
          const infoWindow = new (window as any).google.maps.InfoWindow({
            content: ''
          });

          marker.addListener('click', () => {
            let distanceInfo = '';
            if (searchLocation) {
              const distance = calculateHaversineDistance(
                Number(project.latitude!), Number(project.longitude!),
                Number(searchLocation.lat), Number(searchLocation.lng)
              );
              distanceInfo = `
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
                  <small style="color: #2563eb; font-weight: bold;">📏 Entfernung zum Suchmarker: ${formatDistance(distance)}</small>
                </div>
              `;
            }

            infoWindow.setContent(`
              <div style="padding: 10px; max-width: 250px;">
                <h4 style="margin: 0 0 8px 0; font-weight: bold; color: #10b981;">🏗️ ${project.name}</h4>
                <p style="margin: 0 0 4px 0; font-size: 14px;">${project.description || 'Kein Beschreibung verfügbar'}</p>
                <div style="margin: 4px 0; font-size: 12px; color: #666;">
                  <div>📍 ${project.latitude || 0}, ${project.longitude || 0}</div>
                  <div>📅 Status: ${project.status}</div>
                </div>
                ${distanceInfo}
              </div>
            `);
            infoWindow.open(map, marker);
            onProjectSelect(project);
          });

          return marker;
        });

      setGoogleMarkers(newMarkers);
    }
  }, [map, projects, onProjectSelect]);

  // Custom Marker rendern
  useEffect(() => {
    console.log('🎨 Rendering custom markers. Count:', markers.length);
    
    // Alte Custom Marker entfernen
    customMarkers.forEach((marker: any) => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });
    setCustomMarkers([]);
    
    if (map && markers && markers.length > 0) {
      const newMarkers: any[] = [];
      
      markers.forEach((markerData, index) => {
        console.log(`📍 Creating custom marker ${index + 1}:`, markerData);
        
        if (typeof markerData.lat === 'number' && 
            typeof markerData.lng === 'number' && 
            !isNaN(markerData.lat) && 
            !isNaN(markerData.lng)) {
          
          const marker = new (window as any).google.maps.Marker({
            position: { 
              lat: Number(markerData.lat), 
              lng: Number(markerData.lng) 
            },
            map: map,
            title: markerData.title,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="${markerData.color}" stroke="#ffffff" stroke-width="2"/>
                  <circle cx="16" cy="16" r="4" fill="#ffffff"/>
                  <text x="16" y="20" text-anchor="middle" fill="#000000" font-size="10" font-weight="bold">M</text>
                </svg>
              `),
              scaledSize: new (window as any).google.maps.Size(32, 32)
            },
            animation: (window as any).google.maps.Animation.DROP
          });
          
          console.log(`✅ Custom marker created at ${markerData.lat}, ${markerData.lng}`);
          
          // Distanz zum Suchmarker berechnen (falls vorhanden)
          let distanceToSearch = '';
          if (searchLocation) {
            const distance = calculateHaversineDistance(
              markerData.lat, markerData.lng,
              searchLocation.lat, searchLocation.lng
            );
            distanceToSearch = `
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
                <small style="color: #2563eb; font-weight: bold;">📏 Entfernung zum Suchmarker: ${formatDistance(distance)}</small>
              </div>
            `;
          }

          // Info Window
          const infoWindow = new (window as any).google.maps.InfoWindow({
            content: `
              <div style="padding: 8px;">
                <h4 style="margin: 0 0 4px 0; font-weight: bold;">${markerData.title}</h4>
                <p style="margin: 0 0 4px 0;">${markerData.description}</p>
                <small style="color: #666;">Erstellt: ${new Date(markerData.createdAt).toLocaleString('de-DE')}</small>
                ${distanceToSearch}
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          // Marker zur lokalen Liste hinzufügen
          newMarkers.push(marker);
        }
      });
      
      // Neue Marker-Liste setzen
      setCustomMarkers(newMarkers);
    }
  }, [map, markers]);

  // Marker-Clear-Funktion für externe Aufrufe
  useEffect(() => {
    // Clear function registrieren
    (window as any).clearMapMarkers = () => {
      console.log('🗑️ Clearing all custom markers from map');
      customMarkers.forEach(marker => {
        marker.setMap(null);
      });
      setCustomMarkers([]);
      if (onMarkersCleared) {
        onMarkersCleared();
      }
    };
  }, [customMarkers, onMarkersCleared]);

  return <div ref={mapRef} className="w-full h-full" />;
}

// Hauptkomponente
export default function SimpleMaps() {
  const { toast } = useToast();
  const [location] = useLocation();
  
  const [markers, setMarkers] = useState<CustomMarker[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [drawingMode, setDrawingMode] = useState<string>('');
  const [currentMap, setCurrentMap] = useState<any>(null);
  
  // Distanzmessung-States
  const [measurementMarkers, setMeasurementMarkers] = useState<any[]>([]);
  const [measurementLine, setMeasurementLine] = useState<any>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isMeasurementMode, setIsMeasurementMode] = useState(false);
  
  // Automatisches Löschen aller Test-Marker beim Laden der Komponente
  useEffect(() => {
    if (markers.length > 0) {
      setMarkers([]);
    }
  }, []);

  // URL-Parameter für automatisches Laden der Projektadresse
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectAddress = urlParams.get('address');
    const lat = urlParams.get('lat');
    const lng = urlParams.get('lng');
    
    if (projectAddress && lat && lng) {
      console.log('🎯 Auto-loading project location from URL:', projectAddress);
      
      const projectLocation = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        address: decodeURIComponent(projectAddress)
      };
      
      // Validierung der Koordinaten
      if (!isNaN(projectLocation.lat) && !isNaN(projectLocation.lng) &&
          projectLocation.lat >= -90 && projectLocation.lat <= 90 &&
          projectLocation.lng >= -180 && projectLocation.lng <= 180) {
        
        setSearchLocation(projectLocation);
        
        toast({
          title: "Projektstandort geladen",
          description: `Karte springt automatisch zur Projektadresse: ${projectLocation.address}`,
        });
      } else {
        console.error('❌ Invalid coordinates from URL parameters');
      }
    }
  }, [location, toast]);

  // Distanzmessung: Haversine-Distanz-Berechnung
  const calculateHaversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371000; // Erdradius in Metern
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distanz in Metern
  };

  // Distanz formatieren
  const formatDistance = (distanceInMeters: number) => {
    if (distanceInMeters < 1000) {
      return `${distanceInMeters.toFixed(1)}m`;
    } else {
      return `${(distanceInMeters / 1000).toFixed(2)}km`;
    }
  };

  // Messung löschen
  const clearMeasurement = () => {
    // Marker entfernen
    measurementMarkers.forEach(marker => {
      marker.setMap(null);
    });
    setMeasurementMarkers([]);

    // Linie entfernen
    if (measurementLine) {
      measurementLine.setMap(null);
      setMeasurementLine(null);
    }

    setDistance(null);
    console.log('🧹 Measurement cleared');
  };

  // Safe query with error handling
  let projects: Project[] = [];
  let isLoading = false;
  let mapsConfig: { apiKey?: string } = {};

  try {
    const projectsQuery = useQuery<Project[]>({
      queryKey: ["/api/projects"],
    });
    projects = projectsQuery.data || [];
    isLoading = projectsQuery.isLoading;

    const configQuery = useQuery<{ apiKey?: string }>({
      queryKey: ["/api/config/maps-key"],
    });
    mapsConfig = configQuery.data || {};
  } catch (error) {
    console.warn("Query context not available:", error);
    // Fallback values already set above
  }

  const handleMarkerAdd = (marker: Omit<CustomMarker, 'id' | 'createdAt'>) => {
    console.log('📌 Adding new marker:', marker);
    const newMarkerData: CustomMarker = {
      ...marker,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setMarkers(prev => {
      const updated = [...prev, newMarkerData];
      console.log('🗃️ Updated markers array:', updated);
      return updated;
    });
    toast({
      title: "Marker hinzugefügt",
      description: `Neuer Marker "${marker.title}" wurde erstellt.`,
    });
  };

  const handleMarkersCleared = () => {
    console.log('🧹 Clearing all markers from map component');
    
    // Custom Marker aus State entfernen
    setMarkers([]);
    setSearchLocation(null);
    
    // Global cleanup function für Map-Marker aufrufen
    if ((window as any).clearAllMapMarkers) {
      (window as any).clearAllMapMarkers();
    }
    
    toast({
      title: "Karte bereinigt",
      description: "Alle Marker und Messungen wurden entfernt.",
    });
    
    console.log('✅ All markers and measurements cleared successfully');
  };

  const clearAllMarkers = () => {
    handleMarkersCleared();
  };

  const clearSearchMarker = () => {
    setSearchLocation(null);
    // Signal an die Google Maps Komponente, den Suchmarker zu löschen
    if (currentMap && (window as any).clearSearchMarker) {
      (window as any).clearSearchMarker();
    }
    console.log('🧹 Search location and marker cleared from main component');
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
      {/* Header */}
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
              setSearchLocation(null);
            } else {
              const project = projects.find(p => p.id.toString() === value);
              setSelectedProject(project || null);
              
              // Automatisch zur Projektadresse springen und Marker setzen
              if (project?.latitude && project?.longitude) {
                const projectLocation = {
                  lat: parseFloat(project.latitude as string),
                  lng: parseFloat(project.longitude as string),
                  address: project.name
                };
                
                setSearchLocation(projectLocation);
                
                toast({
                  title: "Projekt ausgewählt",
                  description: `Karte springt zu: ${project.name}`,
                });
              }
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
        {/* Sidebar */}
        <div className="w-80 bg-white border-r shadow-sm p-4 overflow-y-auto">
          {/* Baustellenfelder */}
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
            <h3 className="font-medium text-gray-900 mb-2">Adresssuche</h3>
            <DirectAddressSearch
              onLocationSelect={(location) => {
                console.log('📍 Address selected from component:', location);
                setSearchLocation(location);
              }}
              placeholder="Vollständige Adresse mit Hausnummer (z.B. Hauptstraße 5, München)"
            />
            {/* Marker-Reset Button */}
            {searchLocation && (
              <Button
                size="sm"
                variant="outline"
                onClick={clearSearchMarker}
                className="w-full mt-2"
              >
                <MapPin className="h-4 w-4 mr-1" />
                Suchmarker löschen
              </Button>
            )}
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
              
              {/* Distanzmessung */}
              <Button
                variant={isMeasurementMode ? 'default' : 'outline'}
                onClick={() => {
                  setIsMeasurementMode(!isMeasurementMode);
                  if (isMeasurementMode) {
                    clearMeasurement();
                  }
                  console.log('📏 Measurement mode:', !isMeasurementMode);
                }}
                className="w-full justify-start"
              >
                <Ruler className="h-4 w-4 mr-2" />
                {isMeasurementMode ? '✅ Messung aktiv' : 'Distanz messen'}
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
            
            {/* Messung-Status */}
            {isMeasurementMode && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-700 mb-2">
                  <strong>📏 Messmodus aktiv</strong>
                </p>
                <p className="text-xs text-blue-600">
                  Klicken Sie auf die Karte, um 2 Punkte zu setzen.
                </p>
                {measurementMarkers.length > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    Punkt {measurementMarkers.length}/2 gesetzt
                  </p>
                )}
                {distance && (
                  <div className="mt-2 p-2 bg-white border border-blue-300 rounded">
                    <p className="text-sm font-medium text-blue-900">
                      Distanz: <strong>{formatDistance(distance)}</strong>
                    </p>
                    <p className="text-xs text-blue-600">Luftlinie</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Messung löschen */}
            {(measurementMarkers.length > 0 || distance) && (
              <Button
                variant="outline"
                onClick={clearMeasurement}
                size="sm"
                className="w-full justify-start text-red-600 hover:text-red-700 mt-2"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Messung löschen
              </Button>
            )}
          </div>

          {/* Suchposition Info */}
          {searchLocation && (
            <div className="space-y-3 mb-6">
              <h3 className="font-medium text-gray-900">🎯 Suchposition</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-700">{searchLocation.address}</p>
                <small className="text-blue-600">
                  📍 {searchLocation.lat.toFixed(6)}, {searchLocation.lng.toFixed(6)}
                </small>
              </div>
              
              {/* Distanz zu Custom Markern */}
              {markers.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <h4 className="font-medium text-red-800 mb-2">📍 Entfernung zu Markern</h4>
                  {markers
                    .map(marker => {
                      const distance = calculateHaversineDistance(
                        searchLocation.lat, searchLocation.lng,
                        marker.lat, marker.lng
                      );
                      return { marker, distance };
                    })
                    .sort((a, b) => a.distance - b.distance)
                    .slice(0, 3)
                    .map(({ marker, distance }, index) => (
                      <div key={marker.id} className="flex justify-between items-center text-sm mb-1">
                        <span className="text-red-700 truncate">{marker.title}</span>
                        <span className="text-red-600 font-medium ml-2">{formatDistance(distance)}</span>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          )}

          {/* Professionelle Werkzeuge */}
          <div className="space-y-3 mb-6">
            <h3 className="font-medium text-gray-900 flex items-center">
              <ExternalLink className="h-4 w-4 mr-2" />
              Professionelle Geoportale
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.open('https://geoportal.bayern.de/denkmalatlas/', '_blank')}
                  className="w-full justify-start bg-white hover:bg-blue-50"
                >
                  <ExternalLink className="h-4 w-4 mr-2 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">Denkmalatlas Bayern</div>
                    <div className="text-xs text-gray-500">Archäologische Fundstellen</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.open('https://atlas.bayern.de/', '_blank')}
                  className="w-full justify-start bg-white hover:bg-blue-50"
                >
                  <ExternalLink className="h-4 w-4 mr-2 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium">BayernAtlas</div>
                    <div className="text-xs text-gray-500">Topografische Karten</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.open('https://geoportal.bgr.de/mapapps/resources/apps/geoportal/index.html?lang=de', '_blank')}
                  className="w-full justify-start bg-white hover:bg-blue-50"
                >
                  <ExternalLink className="h-4 w-4 mr-2 text-orange-600" />
                  <div className="text-left">
                    <div className="font-medium">BGR Geoportal</div>
                    <div className="text-xs text-gray-500">Geologische Daten</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.open('https://www.lfu.bayern.de/boden/index.htm', '_blank')}
                  className="w-full justify-start bg-white hover:bg-blue-50"
                >
                  <ExternalLink className="h-4 w-4 mr-2 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium">LfU Bodeninformationen</div>
                    <div className="text-xs text-gray-500">Spezielle Bodendaten</div>
                  </div>
                </Button>
              </div>
              
              <div className="mt-3 p-2 bg-white/60 border border-blue-300 rounded-md">
                <p className="text-xs text-blue-700">
                  <strong>💡 Hinweis:</strong> Alle Geoportale öffnen in neuen Tabs für parallele Recherche
                </p>
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
          <div className="p-2 bg-gray-50 border rounded-md mb-4">
            <p className="text-xs text-gray-600">
              Projekte: {projects.length} | Marker: {markers.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Modus: {drawingMode || 'Kein Modus'} | 
              Mit Koordinaten: {projects.filter(p => p.latitude && p.longitude).length}
            </p>
          </div>

          {/* Marker-Verwaltung */}
          <div className="space-y-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={clearAllMarkers}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Alle Marker löschen
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
                  <SimpleGoogleMap
                    projects={projects}
                    selectedProject={selectedProject}
                    onProjectSelect={setSelectedProject}
                    markers={markers}
                    onMarkerAdd={handleMarkerAdd}
                    onMarkersCleared={handleMarkersCleared}
                    searchLocation={searchLocation}
                    drawingMode={drawingMode}
                    onDrawingModeChange={setDrawingMode}
                    onMapReady={setCurrentMap}
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