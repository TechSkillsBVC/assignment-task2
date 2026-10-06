import { createContext } from 'react';
import { Event } from '../types/Event';

export type EventsContextObject = {
    /** Every event loaded from the API, including past ones. */
    events: Event[];
    isLoading: boolean;
    getEventById: (eventId: string) => Event | undefined;
    /** Adds the user to an event's volunteers and keeps the map and details screens in sync. */
    addVolunteer: (eventId: string, userId: string) => Promise<void>;
};

export const EventsContext = createContext<EventsContextObject | null>(null);
