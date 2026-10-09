import { createContext, Dispatch, SetStateAction } from 'react';
import { EventDetail } from '../types/Event';

export type EventsContextObject = {
    events: EventDetail[];
    setEvents: Dispatch<SetStateAction<EventDetail[]>>;
};

export const EventsContext = createContext<EventsContextObject | null>(null);
