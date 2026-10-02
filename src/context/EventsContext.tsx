import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import data from '../../db.json';
import { VolunteerEvent } from '../types/Event';
import { addVolunteer } from '../utils/eventState';

interface EventsStore {
    events: VolunteerEvent[];
    ready: boolean;
    volunteer: (eventId: string, userId: string) => Promise<void>;
}
const EventsContext = createContext<EventsStore | null>(null);
const storageKey = 'volunteam:events:v1';

// The assessment uses the supplied JSON fixtures; changes persist on this device.
export function EventsProvider({ children }: { children: React.ReactNode }) {
    const [events, setEvents] = useState<VolunteerEvent[]>(data.events);
    const [ready, setReady] = useState(false);
    useEffect(() => {
        AsyncStorage.getItem(storageKey).then(saved => {
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.every(event =>
                    typeof event.id === 'string' && Array.isArray(event.volunteersIds) && event.position
                )) setEvents(parsed);
            }
        }).catch(() => {}).finally(() => setReady(true));
    }, []);
    const volunteer = async (eventId: string, userId: string) => {
        const next = events.map(event => event.id === eventId ? addVolunteer(event, userId) : event);
        await AsyncStorage.setItem(storageKey, JSON.stringify(next));
        setEvents(next);
    };
    return <EventsContext.Provider value={{ events, ready, volunteer }}>{children}</EventsContext.Provider>;
}
export function useEvents() {
    const store = useContext(EventsContext);
    if (!store) throw new Error('EventsProvider is required');
    return store;
}
