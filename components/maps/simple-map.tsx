import React, { useState } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import type { Project } from "../../shared/schema";

interface SimpleMapProps {
  projects: Project[];
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
  searchLocation: { lat: number; lng: number; address: string } | null;
  onLocationSearch: (location: { lat: number; lng: number; address: string }) => void;
}

export function SimpleMap({ 
  projects, 
  selectedProject, 
  onProjectSelect, 
  searchLocation,
  onLocationSearch 
}: SimpleMapProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Geocoding function using OpenStreetMap Nominatim (free alternative)
  const searchAddress = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=de&limit=5`
      );
      const results = await response.json();
      
      if (results.length > 0) {
        const result = results[0];
        onLocationSearch({
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          address: result.display_name
        });
      } else {
        alert('Adresse nicht gefunden. Versuchen Sie eine andere Eingabe.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Fehler bei der Adresssuche.');
    } finally {
      setIsSearching(false);
    }
  };

  // Calculate center point for map display
  const getMapCenter = () => {
    if (searchLocation) {
      return { lat: searchLocation.lat, lng: searchLocation.lng };
    }
    if (selectedProject?.latitude && selectedProject?.longitude) {
      return { 
        lat: typeof selectedProject.latitude === 'string' 
          ? parseFloat(selectedProject.latitude) 
          : selectedProject.latitude,
        lng: typeof selectedProject.longitude === 'string' 
          ? parseFloat(selectedProject.longitude) 
          : selectedProject.longitude
      };
    }
    // Default to Munich
    return { lat: 48.1351, lng: 11.5820 };
  };

  const center = getMapCenter();
  const zoom = searchLocation || selectedProject ? 15 : 10;

  return (
    <div className="h-full bg-gray-100 rounded-lg overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 bg-white border-b">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Adresse suchen (z.B. Hauptstraße 5, München)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchAddress()}
              className="pl-10"
              disabled={isSearching}
            />
          </div>
          <Button 
            onClick={searchAddress} 
            disabled={!searchQuery.trim() || isSearching}
          >
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Suchen"}
          </Button>
        </div>
      </div>

      {/* Map Display */}
      <div className="relative h-96 bg-gradient-to-br from-green-100 to-blue-100">
        {/* Simple map visualization */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">Standort-Übersicht</h3>
            <p className="text-sm text-gray-500">
              Zentrum: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Zoom-Level: {zoom}x
            </p>
          </div>
        </div>

        {/* Project markers overlay */}
        <div className="absolute inset-0">
          {projects.map((project, index) => {
            if (!project.latitude || !project.longitude) return null;
            
            const lat = typeof project.latitude === 'string' ? parseFloat(project.latitude) : project.latitude;
            const lng = typeof project.longitude === 'string' ? parseFloat(project.longitude) : project.longitude;
            
            // Simple positioning relative to center
            const offsetX = (lng - center.lng) * 100 + 50;
            const offsetY = 50 - (lat - center.lat) * 100;
            
            if (offsetX < 10 || offsetX > 90 || offsetY < 10 || offsetY > 90) return null;
            
            return (
              <button
                key={project.id}
                onClick={() => onProjectSelect(project)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${offsetX}%`,
                  top: `${offsetY}%`,
                }}
              >
                <div className={`w-8 h-8 rounded-full shadow-lg border-2 border-white flex items-center justify-center text-white text-xs font-bold ${
                  project.status === 'active' ? 'bg-green-500' :
                  project.status === 'planning' ? 'bg-orange-500' :
                  project.status === 'completed' ? 'bg-gray-500' : 'bg-blue-500'
                } ${selectedProject?.id === project.id ? 'ring-4 ring-blue-300' : ''}`}>
                  {index + 1}
                </div>
              </button>
            );
          })}
          
          {/* Search location marker */}
          {searchLocation && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: '50%',
                top: '50%',
              }}
            >
              <div className="w-10 h-10 bg-red-500 rounded-full shadow-lg border-4 border-white flex items-center justify-center">
                <Search className="h-4 w-4 text-white" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Info */}
      <div className="p-4 bg-white">
        {selectedProject && (
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900">{selectedProject.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{selectedProject.description}</p>
              {selectedProject.latitude && selectedProject.longitude && (
                <p className="text-xs text-gray-500 mt-2">
                  GPS: {Number(selectedProject.latitude).toFixed(6)}, {Number(selectedProject.longitude).toFixed(6)}
                </p>
              )}
            </CardContent>
          </Card>
        )}
        
        {searchLocation && (
          <Card className="mt-2">
            <CardContent className="p-4 bg-red-50">
              <h4 className="font-semibold text-red-800">Gesuchter Standort</h4>
              <p className="text-sm text-red-600 mt-1">{searchLocation.address}</p>
              <p className="text-xs text-red-500 mt-1">
                GPS: {searchLocation.lat.toFixed(6)}, {searchLocation.lng.toFixed(6)}
              </p>
            </CardContent>
          </Card>
        )}
        
        {!selectedProject && !searchLocation && (
          <div className="text-center text-gray-500">
            <p className="text-sm">Klicken Sie auf einen Marker oder suchen Sie eine Adresse</p>
            <p className="text-xs mt-1">{projects.length} Projekte verfügbar</p>
          </div>
        )}
      </div>
    </div>
  );
}