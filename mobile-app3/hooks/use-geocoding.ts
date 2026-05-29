import { useState, useCallback } from 'react';
import { calculateDistance } from '../utils/routing';

export interface SearchResult {
  placeId: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  distanceMeters?: number;
}

const GOOGLE_API_KEY = 'AIzaSyBcjPHiJqveQFzZ-qoIa_ojPgWxUZ436TE';

export function useGeocoding() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPlace = useCallback(async (query: string, searchLat?: number, searchLon?: number, userLat?: number, userLon?: number): Promise<SearchResult[]> => {
    if (!query.trim()) {
      setResults([]);
      return [];
    }
    
    setSearching(true);
    setError(null);
    
    try {
      const requestBody: any = {
        textQuery: query,
        languageCode: 'es',
      };

      if (searchLat && searchLon) {
        requestBody.locationBias = {
          circle: {
            center: {
              latitude: searchLat,
              longitude: searchLon
            },
            radius: 5000.0 // 5km
          }
        };
      }

      const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName.text,places.formattedAddress,places.location'
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await res.json();
      
      if (data.places) {
        let mapped = data.places.map((p: any) => {
          const lat = p.location?.latitude;
          const lon = p.location?.longitude;
          let dist = undefined;
          
          if (userLat && userLon && lat && lon) {
             dist = calculateDistance({latitude: userLat, longitude: userLon}, {latitude: lat, longitude: lon}) * 1000;
          }
          
          return {
            placeId: p.id,
            name: p.displayName?.text || 'Lugar desconocido',
            address: p.formattedAddress || '',
            latitude: lat,
            longitude: lon,
            distanceMeters: dist,
          };
        });
        
        mapped.sort((a: SearchResult, b: SearchResult) => (a.distanceMeters || Infinity) - (b.distanceMeters || Infinity));
        
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
