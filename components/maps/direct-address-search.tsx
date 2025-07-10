import React, { useState } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

interface AddressSearchProps {
  onLocationSelect: (location: {
    address: string;
    lat: number;
    lng: number;
  }) => void;
  placeholder?: string;
}

export const DirectAddressSearch: React.FC<AddressSearchProps> = ({
  onLocationSelect,
  placeholder = "Adresse, PLZ oder Hausnummer suchen (z.B. 80331 München, Maximilianstraße 15)...",
}) => {
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Optimierte Adresssuche mit verbesserter Hausnummer- und PLZ-Unterstützung
  const searchWithOptimizedAPI = async (searchQuery: string) => {
    if (searchQuery.length < 3) return;
    
    setIsLoading(true);
    try {
      // Eingabe analysieren für bessere API-Parameter
      const hasNumbers = /\d/.test(searchQuery);
      const hasPostcode = /^\d{5}/.test(searchQuery.trim());
      const hasHouseNumber = /\d+[a-zA-Z]?\s*$/.test(searchQuery);
      
      console.log('🔍 Search analysis:', { hasNumbers, hasPostcode, hasHouseNumber, query: searchQuery });
      
      let searchPromises = [];
      
      // Haupt-Suche mit optimierten Parametern
      if (hasPostcode) {
        // PLZ-spezifische Suche
        searchPromises.push(
          fetch(
            `https://nominatim.openstreetmap.org/search?format=json&postalcode=${encodeURIComponent(searchQuery.trim())}&countrycodes=de&limit=10&addressdetails=1&dedupe=1`
          ).then(res => res.json()).then(data => ({ source: 'PLZ-Suche', data }))
        );
      } else if (hasHouseNumber) {
        // Hausnummer-spezifische Suche
        searchPromises.push(
          fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=de&limit=15&addressdetails=1&dedupe=1&layer=address`
          ).then(res => res.json()).then(data => ({ source: 'Adress-Suche', data }))
        );
      } else {
        // Standard-Ortssuche für Städte/Straßen (nur Deutschland)
        searchPromises.push(
          fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=de&limit=12&addressdetails=1&dedupe=1&layer=address,locality&bounded=1&viewbox=5.866,47.270,15.042,55.058`
          ).then(res => res.json()).then(data => ({ source: 'Standard-Suche', data }))
        );
      }
      
      // Nominatim Fallback für bessere Deutschland-Abdeckung
      if (!hasPostcode) {
        searchPromises.push(
          fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=de&limit=8&addressdetails=1&dedupe=1&bounded=1&viewbox=5.866,47.270,15.042,55.058`
          ).then(res => res.json()).then(data => ({ source: 'Deutschland-Suche', data }))
        );
      }

      const results = await Promise.allSettled(searchPromises);

      let allResults: any[] = [];

      // Ergebnisse verarbeiten
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const { source, data } = result.value;
          
          if (source === 'Photon' && data.features) {
            // Photon-Ergebnisse (nur Deutschland)
            const formatted = data.features
              .filter((item: any) => {
                const props = item.properties;
                return props.country === 'Deutschland' || props.country === 'Germany' || 
                       props.countrycode === 'DE' || props.state?.includes('Deutschland');
              })
              .map((item: any, idx: number) => {
              const props = item.properties;
              const coords = item.geometry.coordinates;
              
              let mainText = props.name || props.street || searchQuery;
              let secondaryText = '';
              
              if (props.housenumber) {
                mainText = `${props.street || props.name} ${props.housenumber}`;
              }
              
              const addressParts = [];
              if (props.postcode) addressParts.push(props.postcode);
              if (props.city) addressParts.push(props.city);
              if (props.state && props.state !== props.city) addressParts.push(props.state);
              if (addressParts.length === 0) addressParts.push('Deutschland');
              secondaryText = addressParts.join(', ');
              
              return {
                place_id: `photon_${idx}`,
                description: `${mainText}, ${secondaryText}`,
                structured_formatting: {
                  main_text: mainText,
                  secondary_text: secondaryText
                },
                geometry: {
                  location: {
                    lat: coords[1],
                    lng: coords[0]
                  }
                },
                source: source,
                priority: props.housenumber ? 3 : (props.postcode ? 2 : 1)
              };
            });
            allResults = [...allResults, ...formatted];
          } else if (Array.isArray(data)) {
            // Nominatim-Ergebnisse
            const formatted = data.map((item: any, idx: number) => {
              const address = item.address || {};
              let mainText = item.name || item.display_name.split(',')[0];
              
              // Verbesserte Adressformatierung
              if (address.house_number && address.road) {
                mainText = `${address.road} ${address.house_number}`;
              } else if (address.road) {
                mainText = address.road;
              }
              
              const addressParts = [];
              if (address.postcode) addressParts.push(address.postcode);
              if (address.city || address.town || address.village) {
                addressParts.push(address.city || address.town || address.village);
              }
              if (address.state && address.state !== (address.city || address.town)) {
                addressParts.push(address.state);
              }
              const secondaryText = addressParts.length > 0 ? addressParts.join(', ') : item.display_name.split(',').slice(1).join(',').trim();
              
              return {
                place_id: `nominatim_${idx}`,
                description: `${mainText}, ${secondaryText}`,
                structured_formatting: {
                  main_text: mainText,
                  secondary_text: secondaryText
                },
                geometry: {
                  location: {
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon)
                  }
                },
                source: source,
                priority: address.house_number ? 3 : (address.postcode ? 2 : 1)
              };
            });
            allResults = [...allResults, ...formatted];
          }
        }
      });



      // Duplikate entfernen und nach Priorität sortieren
      const uniqueResults = allResults
        .filter((result, index, self) => 
          index === self.findIndex(r => 
            Math.abs(r.geometry.location.lat - result.geometry.location.lat) < 0.0001 &&
            Math.abs(r.geometry.location.lng - result.geometry.location.lng) < 0.0001
          )
        )
        .sort((a, b) => (b.priority || 0) - (a.priority || 0)) // Hausnummern zuerst
        .slice(0, 12); // Max 12 Ergebnisse für bessere Performance
      
      console.log('🎯 Optimized search results:', uniqueResults.length, 'found for:', searchQuery);
      setPredictions(uniqueResults);
      setShowSuggestions(uniqueResults.length > 0);
    } catch (error) {
      console.error('🚨 Address search error:', error);
      setPredictions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Debouncing für bessere Performance
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleInputChange = (value: string) => {
    setQuery(value);
    console.log('Direct search input:', value);
    
    // Vorherige Suche abbrechen
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (value.length >= 3) {
      // Neue Suche mit 400ms Verzögerung für stabilere Ergebnisse
      const timeout = setTimeout(() => {
        searchWithOptimizedAPI(value);
      }, 400);
      setSearchTimeout(timeout);
    } else {
      setPredictions([]);
      setShowSuggestions(false);
    }
  };

  const handlePredictionClick = (prediction: any) => {
    console.log('🎯 Selected prediction:', prediction);
    setQuery(prediction.description);
    setShowSuggestions(false);
    
    // Detaillierte Ausgabe für Debugging
    console.log('📍 Selected location data:', {
      address: prediction.description,
      lat: prediction.geometry.location.lat,
      lng: prediction.geometry.location.lng
    });
    
    onLocationSelect({
      address: prediction.description,
      lat: prediction.geometry.location.lat,
      lng: prediction.geometry.location.lng,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && predictions.length > 0) {
      e.preventDefault();
      handlePredictionClick(predictions[0]);
    }
  };

  return (
    <div className="relative">
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
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            className="pl-10"
            disabled={isLoading}
          />
          
          {isLoading && (
            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
          )}
          
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
                      {prediction.source && (
                        <p className="text-xs text-blue-500 mt-1">
                          {prediction.source}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* No results message */}
          {showSuggestions && predictions.length === 0 && query.length >= 3 && !isLoading && (
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