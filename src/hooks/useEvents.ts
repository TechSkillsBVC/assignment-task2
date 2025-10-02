import { useCallback, useEffect, useState } from "react";
import { Event } from "../types/Event";
import api, { apiPatch } from "../services/api";

type RawEvent = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  dateTime?: string;
  organizerId?: string;
  position?: { latitude?: number; longitude?: number };
  volunteersNeeded: number;
  volunteersIds: string[];
};

function normalize(e: RawEvent): Event | null {
  const lat = e.position?.latitude;
  const lng = e.position?.longitude;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  return {
    id: e.id,
    title: e.name,
    description: e.description ?? "",
    latitude: lat,
    longitude: lng,
    requiredVolunteers: e.volunteersNeeded,
    volunteers: e.volunteersIds ?? [],
    imageUrl: e.imageUrl,
    dateTime: e.dateTime,
    organizerId: e.organizerId,
  };
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<RawEvent[]>("/events");
      const normalized = res.data
        .map(normalize)
        .filter((x): x is Event => x !== null);
      setEvents(normalized);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const applyToEvent = useCallback(
    async (eventId: string, userId: string) => {
      const ev = events.find((e) => e.id === eventId);
      if (!ev) return;
      if (ev.volunteers.includes(userId)) return;
      if (ev.volunteers.length >= ev.requiredVolunteers) return;
      const res = await apiPatch<RawEvent>(`/events/${eventId}`, {
        volunteersIds: [...ev.volunteers, userId],
      });
      const norm = normalize(res.data);
      if (norm)
        setEvents((prev) => prev.map((e) => (e.id === eventId ? norm : e)));
      return norm;
    },
    [events]
  );

  const unapplyFromEvent = useCallback(
    async (eventId: string, userId: string) => {
      const ev = events.find((e) => e.id === eventId);
      if (!ev) return;
      const res = await apiPatch<RawEvent>(`/events/${eventId}`, {
        volunteersIds: ev.volunteers.filter((v) => v !== userId),
      });
      const norm = normalize(res.data);
      if (norm)
        setEvents((prev) => prev.map((e) => (e.id === eventId ? norm : e)));
      return norm;
    },
    [events]
  );

  return { events, loading, error, refresh, applyToEvent, unapplyFromEvent };
}
