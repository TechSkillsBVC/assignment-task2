import { Region } from "react-native-maps";

type P = { latitude: number; longitude: number };

export function regionFromPoints(
  points: P[],
  expand: number = 1.5
): Region | null {
  if (!points.length) return null;
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latitude = (minLat + maxLat) / 2;
  const longitude = (minLng + maxLng) / 2;
  const latitudeDelta = Math.max(0.01, (maxLat - minLat) * expand);
  const longitudeDelta = Math.max(0.01, (maxLng - minLng) * expand);
  return { latitude, longitude, latitudeDelta, longitudeDelta };
}
