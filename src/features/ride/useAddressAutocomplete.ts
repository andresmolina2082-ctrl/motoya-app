import { useEffect, useRef, useState } from 'react';

export type AddressSuggestion = {
  placeId: string;
  text: string;
};

const DEBOUNCE_MS = 500;
const MIN_QUERY_LENGTH = 3;

// Departamento de La Guajira — sesgo de búsqueda (no restrictivo) para priorizar
// resultados cercanos sin excluir el resto de Colombia
const VIEWBOX = '-73.7,12.6,-71.0,10.3';

export function useAddressAutocomplete(query: string, enabled: boolean) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const currentRequestId = ++requestIdRef.current;

    const timeoutId = setTimeout(() => {
      if (!enabled || query.trim().length < MIN_QUERY_LENGTH) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const url =
        'https://nominatim.openstreetmap.org/search' +
        `?format=jsonv2&addressdetails=0&limit=5&countrycodes=co` +
        `&accept-language=es&viewbox=${VIEWBOX}` +
        `&q=${encodeURIComponent(query)}`;

      fetch(url, {
        headers: {
          'Accept-Language': 'es',
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (requestIdRef.current !== currentRequestId) return;
          const results: AddressSuggestion[] = (Array.isArray(data) ? data : []).map(
            (item: any) => ({
              placeId: String(item.place_id),
              text: item.display_name as string,
            }),
          );
          setSuggestions(results);
        })
        .catch(() => {
          if (requestIdRef.current === currentRequestId) setSuggestions([]);
        })
        .finally(() => {
          if (requestIdRef.current === currentRequestId) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [query, enabled]);

  return { suggestions, loading };
}
