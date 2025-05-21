// src/services/geocodingService.ts
'use server';

import type { GeoLocation } from '@/types';

interface GeocodeResult {
  success: boolean;
  location?: GeoLocation;
  error?: string;
  formattedAddress?: string;
}

export async function geocodeAddress(addressComponents: {
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}): Promise<GeocodeResult> {
  // Prioritize the server-specific geocoding key
  const apiKey = process.env.GOOGLE_MAPS_GEOCODING_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error('Geocoding API Key is not configured. Checked GOOGLE_MAPS_GEOCODING_API_KEY and NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.');
    return { success: false, error: 'API Key for geocoding is not configured.' };
  }

  const addressParts = [
    addressComponents.address,
    addressComponents.postalCode,
    addressComponents.city,
    addressComponents.country,
  ]
    .filter(Boolean)
    .join(', ');

  if (!addressParts) {
    return { success: false, error: 'Address components are insufficient for geocoding.' };
  }

  const encodedAddress = encodeURIComponent(addressParts);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      const formattedAddress = data.results[0].formatted_address;
      return {
        success: true,
        location: {
          lat: location.lat,
          lng: location.lng,
        },
        formattedAddress: formattedAddress,
      };
    } else if (data.status === 'ZERO_RESULTS') {
      return { success: false, error: 'Address not found or too imprecise.' };
    } else {
      console.error('Geocoding API Error:', data.status, data.error_message, 'Used key ending with:', apiKey.slice(-5));
      return { success: false, error: `Geocoding failed: ${data.status} - ${data.error_message || 'Unknown error'}` };
    }
  } catch (error) {
    console.error('Network error during geocoding:', error);
    return { success: false, error: 'Network error during geocoding. Please check your connection.' };
  }
}
