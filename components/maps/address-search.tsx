import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

interface AddressSearchProps {
  onLocationSelect: (location: {
    address: string;
    lat: number;
    lng: number;
  }) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
}

interface PlacePrediction {
  description: string;
  place_id: string;
}

export const AddressSearch: React.FC<AddressSearchProps> = ({
  onLocationSelect,
  placeholder = "Adresse oder Standort suchen...",
  className = "",
  initialValue = "",
}) => {
  const [query, setQuery] = useState(initialValue);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Initialize Google Places services
  useEffect(() => {
    const initializeServices = () => {
      if (window.google?.maps?.places) {
        autocompleteService.current = new google.maps.places.AutocompleteService();
        
        // Create a hidden map for PlacesService
        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current);
          placesService.current = new google.maps.places.PlacesService(map);
        }
      }
    };

    if (window.google?.maps?.places) {
      initializeServices();
    } else {
      // Wait for Google Maps to load
      const checkGoogle = setInterval(() => {
        if (window.google?.maps?.places) {
          initializeServices();
          clearInterval(checkGoogle);
        }
      }, 100);

      return () => clearInterval(checkGoogle);
    }
  }, []);

  // Search for address predictions
  const searchPredictions = async (input: string) => {
    if (!autocompleteService.current || input.length < 3) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    
    try {
      const request = {
        input,
        componentRestrictions: { country: "de" }, // Focus on Germany
        types: ["geocode", "establishment"],
      };

      autocompleteService.current.getPlacePredictions(
        request,
        (predictions, status) => {
          setIsLoading(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setPredictions(predictions);
            setShowSuggestions(true);
          } else {
            setPredictions([]);
          }
        }
      );
    } catch (error) {
      console.error("Error searching predictions:", error);
      setIsLoading(false);
      setPredictions([]);
    }
  };

  // Get place details and coordinates
  const getPlaceDetails = async (placeId: string) => {
    if (!placesService.current) return;

    setIsLoading(true);
    
    const request = {
      placeId,
      fields: ["geometry", "formatted_address"],
    };

    placesService.current.getDetails(request, (place, status) => {
      setIsLoading(false);
      if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
        const location = place.geometry.location;
        onLocationSelect({
          address: place.formatted_address || query,
          lat: location.lat(),
          lng: location.lng(),
        });
        setQuery(place.formatted_address || query);
        setShowSuggestions(false);
      }
    });
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    
    if (value.length >= 3) {
      searchPredictions(value);
    } else {
      setPredictions([]);
      setShowSuggestions(false);
    }
  };

  const handlePredictionClick = (prediction: PlacePrediction) => {
    setQuery(prediction.description);
    getPlaceDetails(prediction.place_id);
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation wird von Ihrem Browser nicht unterstützt");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding to get address
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat: latitude, lng: longitude } },
          (results, status) => {
            setIsLoading(false);
            if (status === "OK" && results?.[0]) {
              const address = results[0].formatted_address;
              setQuery(address);
              onLocationSelect({
                address,
                lat: latitude,
                lng: longitude,
              });
            } else {
              // Use coordinates as fallback
              const coordsAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
              setQuery(coordsAddress);
              onLocationSelect({
                address: coordsAddress,
                lat: latitude,
                lng: longitude,
              });
            }
          }
        );
      },
      (error) => {
        setIsLoading(false);
        console.error("Error getting location:", error);
        alert("Standort konnte nicht ermittelt werden");
      }
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Hidden map element for PlacesService */}
      <div ref={mapRef} style={{ display: "none" }} />
      
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if (predictions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              // Delay hiding suggestions to allow clicks
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            className="pl-10"
            disabled={isLoading}
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
          )}
          
          {/* Suggestions dropdown */}
          {showSuggestions && predictions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {predictions.map((prediction) => (
                <div
                  key={prediction.place_id}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handlePredictionClick(prediction)}
                >
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm">{prediction.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Button
          type="button"
          variant="outline"
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="flex-shrink-0"
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};