import React, { useCallback, useState, useRef } from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { Loader2 } from "lucide-react";

interface MapProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  onMapClick?: (event: google.maps.MapMouseEvent) => void;
  markers?: Array<{
    id: number;
    position: google.maps.LatLngLiteral;
    title: string;
    onClick?: () => void;
  }>;
  className?: string;
}

interface MapComponentProps extends MapProps {
  style: { [key: string]: string };
}

const MapComponent: React.FC<MapComponentProps> = ({
  center,
  zoom,
  onMapClick,
  markers = [],
  style,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [markersArray, setMarkersArray] = useState<google.maps.Marker[]>([]);

  const initMap = useCallback(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: "cooperative",
      });

      if (onMapClick) {
        newMap.addListener("click", onMapClick);
      }

      setMap(newMap);
    }
  }, [ref, map, center, zoom, onMapClick]);

  // Update map center and zoom when props change
  React.useEffect(() => {
    if (map) {
      map.setCenter(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);

  // Update markers when markers array changes
  React.useEffect(() => {
    if (map) {
      // Clear existing markers
      markersArray.forEach(marker => marker.setMap(null));
      
      // Create new markers
      const newMarkers = markers.map(markerData => {
        const marker = new google.maps.Marker({
          position: markerData.position,
          map,
          title: markerData.title,
        });

        if (markerData.onClick) {
          marker.addListener("click", markerData.onClick);
        }

        return marker;
      });

      setMarkersArray(newMarkers);
    }
  }, [map, markers]);

  React.useEffect(() => {
    initMap();
  }, [initMap]);

  return <div ref={ref} style={style} />;
};

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Karte wird geladen...</span>
          </div>
        </div>
      );
    case Status.FAILURE:
      return (
        <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg border border-red-200">
          <div className="text-center">
            <p className="text-red-600 font-medium">Fehler beim Laden der Karte</p>
            <p className="text-red-500 text-sm mt-1">
              Bitte überprüfen Sie Ihre Internetverbindung
            </p>
          </div>
        </div>
      );
    case Status.SUCCESS:
      return null;
  }
};

export const GoogleMap: React.FC<MapProps> = ({ className = "", ...props }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-64 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="text-center">
          <p className="text-yellow-600 font-medium">Google Maps API-Schlüssel fehlt</p>
          <p className="text-yellow-500 text-sm mt-1">
            Bitte konfigurieren Sie GOOGLE_MAPS_API_KEY
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <Wrapper
        apiKey={apiKey}
        render={render}
        libraries={["places", "geometry"]}
      >
        <MapComponent
          {...props}
          style={{ width: "100%", height: "100%" }}
        />
      </Wrapper>
    </div>
  );
};