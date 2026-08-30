export type GeographicCoordinates = {
  latitude: number;
  longitude: number;
};

export type ProviderWithCity = {
  location: string;
};

export type ProviderWithDistance<T extends ProviderWithCity> = T & {
  distanceKm: number | null;
};

const SAUDI_CITY_COORDINATES: Record<string, GeographicCoordinates> = {
  "الرياض": { latitude: 24.7136, longitude: 46.6753 },
  "جدة": { latitude: 21.4858, longitude: 39.1925 },
  "القصيم": { latitude: 26.326, longitude: 43.975 },
  "بريدة": { latitude: 26.326, longitude: 43.975 },
  "الدمام": { latitude: 26.4207, longitude: 50.0888 },
  "الشرقية": { latitude: 26.4207, longitude: 50.0888 },
  "الأحساء": { latitude: 25.3784, longitude: 49.5863 },
  "المدينة المنورة": { latitude: 24.5247, longitude: 39.5692 },
  "مكة المكرمة": { latitude: 21.3891, longitude: 39.8579 },
  "أبها": { latitude: 18.2164, longitude: 42.5053 },
  "تبوك": { latitude: 28.3998, longitude: 36.5715 },
  "حائل": { latitude: 27.5219, longitude: 41.6905 },
  "الطائف": { latitude: 21.2854, longitude: 40.4148 },
  "نجران": { latitude: 17.4924, longitude: 44.1277 },
  "جازان": { latitude: 16.8892, longitude: 42.5611 },
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceInKilometers(from: GeographicCoordinates, to: GeographicCoordinates) {
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function coordinatesForProviderCity(city: string) {
  return SAUDI_CITY_COORDINATES[city] ?? null;
}

export function rankProvidersByDistance<T extends ProviderWithCity>(providers: T[], userLocation: GeographicCoordinates | null): ProviderWithDistance<T>[] {
  if (!userLocation) return providers.map(provider => ({ ...provider, distanceKm: null }));

  return providers
    .map(provider => {
      const coordinates = coordinatesForProviderCity(provider.location);
      return {
        ...provider,
        distanceKm: coordinates ? distanceInKilometers(userLocation, coordinates) : null,
      };
    })
    .sort((first, second) => (first.distanceKm ?? Number.POSITIVE_INFINITY) - (second.distanceKm ?? Number.POSITIVE_INFINITY));
}

export function formatDistanceKm(distanceKm: number | null) {
  if (distanceKm === null) return null;
  if (distanceKm < 10) return `${distanceKm.toFixed(1)} كم`;
  return `${Math.round(distanceKm)} كم`;
}
