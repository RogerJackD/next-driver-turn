import { useState } from 'react';

interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

interface UseGeocodingReturn {
  geocode: (address: string) => Promise<GeocodeResult>;
  isLoading: boolean;
  error: string | null;
}

export function useGeocoding(): UseGeocodingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocode = async (address: string): Promise<GeocodeResult> => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      throw new Error(
        'API Key de Google Maps no configurada. Agrega NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en tu archivo .env.local'
      );
    }

    if (!address || address.trim().length < 3) {
      throw new Error('Ingresa una dirección válida');
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${apiKey}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'ZERO_RESULTS') {
        throw new Error('No se encontraron coordenadas para esta dirección');
      }

      if (data.status === 'REQUEST_DENIED') {
        throw new Error('API Key inválida o sin permisos para Geocoding API');
      }

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        throw new Error(`Error de geocodificación: ${data.status}`);
      }

      const result = data.results[0];
      const location = result.geometry.location;

      return {
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: result.formatted_address,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al buscar coordenadas';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { geocode, isLoading, error };
}
