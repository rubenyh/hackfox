import { useState, useCallback } from 'react';
import * as Location from 'expo-location';

export interface SearchResult {
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
}

export function useGeocoding() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPlace = useCallback(async (query: string): Promise<SearchResult[]> => {
    if (!query.trim()) {
      setResults([]);
      return [];
    }

    setSearching(true);
    setError(null);

    try {
      const geocodeResults = await Location.geocodeAsync(query);

      if (geocodeResults.length > 0) {
        const mapped = geocodeResults.map((result, index) => {
          const parts = [];
          if ((result as any).name) parts.push((result as any).name);
          if ((result as any).street) parts.push((result as any).street);
          if ((result as any).city) parts.push((result as any).city);

          const address = parts.length > 0 ? parts.join(', ') : query;

          return {
            name: (result as any).name || query,
            latitude: result.latitude,
            longitude: result.longitude,
            address: address,
          };
        });
        setResults(mapped);
        return mapped;
      } else {
        setResults([]);
        setError('No se encontraron resultados');
        return [];
      }
    } catch (err) {
      setError('Error en la búsqueda');
      setResults([]);
      return [];
    } finally {
      setSearching(false);
    }
  }, []);

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
  };
}
