import { useState, useCallback } from 'react';

export interface SearchResult {
  placeId: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

const GOOGLE_API_KEY = 'AIzaSyBcjPHiJqveQFzZ-qoIa_ojPgWxUZ436TE';

export function useGeocoding() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPlace = useCallback(async (query: string, userLat?: number, userLon?: number): Promise<SearchResult[]> => {
    if (!query.trim()) {
      setResults([]);
      return [];
    }
    
    setSearching(true);
    setError(null);
    
    try {
      const requestBody: any = {
        input: query,
        includedRegionCodes: ['mx'],
      };

      if (userLat && userLon) {
        requestBody.locationRestriction = {
          circle: {
            center: {
              latitude: userLat,
              longitude: userLon
            },
            radius: 15000.0 // 15km
          }
        };
      }

      const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await res.json();
      
      if (data.suggestions) {
        const mapped = data.suggestions.map((s: any) => {
          const prediction = s.placePrediction;
          return {
            placeId: prediction.placeId,
            name: prediction.structuredFormat?.mainText?.text || prediction.text?.text || 'Lugar desconocido',
            address: prediction.structuredFormat?.secondaryText?.text || '',
          };
        });
        setResults(mapped);
        return mapped;
      } else {
        setResults([]);
        return [];
      }
    } catch (err) {
      console.error(err);
      setError('Error en la búsqueda con Google Places');
      setResults([]);
      return [];
    } finally {
      setSearching(false);
    }
  }, []);

  const getPlaceDetails = async (placeId: string): Promise<{latitude: number, longitude: number} | null> => {
    try {
      const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'id,location'
        }
      });
      const data = await res.json();
      
      if (data.location) {
        return {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        };
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    searching,
    error,
    searchPlace,
    clearResults,
    getPlaceDetails,
  };
}
