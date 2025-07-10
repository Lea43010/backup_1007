import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

interface AddressAutocompleteProps {
  onLocationSelect: (location: {
    address: string;
    lat: number;
    lng: number;
  }) => void;
  placeholder?: string;
  className?: string;
}

interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onLocationSelect,
  placeholder = "Adresse suchen...",
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Initialize Google Places services
  useEffect(() => {
    const initializeServices = () => {
      try {
        if ((window as any).google?.maps?.places) {
          console.log('Initializing Google Places services...');
          autocompleteService.current = new (window as any).google.maps.places.AutocompleteService();
          
          // Create a hidden map for PlacesService
          if (mapRef.current) {
            const map = new (window as any).google.maps.Map(mapRef.current, {
              center: { lat: 48.1351, lng: 11.5820 }, // Munich
              zoom: 10,
            });
            placesService.current = new (window as any).google.maps.places.PlacesService(map);
            console.log('Google Places services initialized successfully');
          }
        }
      } catch (error) {
        console.error('Error initializing Google Places services:', error);
      }
    };

    if ((window as any).google?.maps?.places) {
      initializeServices();
    } else {
      console.log('Waiting for Google Maps to load...');
      // Wait for Google Maps to load
      const checkGoogle = setInterval(() => {
        if ((window as any).google?.maps?.places) {
          initializeServices();
          clearInterval(checkGoogle);
        }
      }, 100);

      // Timeout after 10 seconds
      const timeout = setTimeout(() => {
        console.error('Google Maps failed to load within 10 seconds');
        clearInterval(checkGoogle);
      }, 10000);

      return () => {
        clearInterval(checkGoogle);
        clearTimeout(timeout);
      };
    }
  }, []);

  // Search for address predictions
  const searchPredictions = async (input: string) => {
    if (!autocompleteService.current || input.length < 2) {
      setPredictions([]);
      setShowSuggestions(false);
      return;
    }

    console.log('Searching predictions for:', input);
    setIsLoading(true);
    
    try {
      const request = {
        input,
        componentRestrictions: { country: "de" }, // Focus on Germany
        types: ["geocode", "establishment"],
      };

      autocompleteService.current.getPlacePredictions(
        request,
        (predictions: PlacePrediction[] | null, status: any) => {
          console.log('Autocomplete status:', status, 'Predictions:', predictions);
          setIsLoading(false);
          if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && predictions) {
            console.log('Found', predictions.length, 'predictions');
            setPredictions(predictions);
            setShowSuggestions(true);
          } else {
            console.log('No predictions found or error:', status);
            setPredictions([]);
            setShowSuggestions(false);
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
  const getPlaceDetails = async (placeId: string, description: string) => {
    if (!placesService.current) return;

    setIsLoading(true);
    setShowSuggestions(false);
    
    const request = {
      placeId,
      fields: ["geometry", "formatted_address"],
    };

    placesService.current.getDetails(request, (place: any, status: any) => {
      setIsLoading(false);
      if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
        const location = place.geometry.location;
        onLocationSelect({
          address: place.formatted_address || description,
          lat: location.lat(),
          lng: location.lng(),
        });
        setQuery(place.formatted_address || description);
      }
    });
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    console.log('Input changed to:', value);
    
    if (value.length >= 2) {
      console.log('Triggering search for:', value);
      searchPredictions(value);
    } else {
      setPredictions([]);
      setShowSuggestions(false);
    }
  };

  const handlePredictionClick = (prediction: PlacePrediction) => {
    setQuery(prediction.description);
    getPlaceDetails(prediction.place_id, prediction.description);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && predictions.length > 0) {
      e.preventDefault();
      handlePredictionClick(predictions[0]);
    }
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
            onKeyPress={handleKeyPress}
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
          
          {/* Debug info */}
          {console.log('Render state:', { showSuggestions, predictionsLength: predictions.length, query, isLoading })}
          
          {/* Suggestions dropdown */}
          {showSuggestions && predictions.length > 0 && (
            <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {predictions.map((prediction) => (
                <div
                  key={prediction.place_id}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handlePredictionClick(prediction)}
                >
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {prediction.structured_formatting.main_text}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {prediction.structured_formatting.secondary_text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* No results message */}
          {showSuggestions && predictions.length === 0 && query.length >= 2 && !isLoading && (
            <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Keine Vorschläge gefunden
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};