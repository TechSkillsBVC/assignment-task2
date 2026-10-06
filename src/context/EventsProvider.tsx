import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import * as api from '../services/api';
import { localEvents } from '../services/localDatabase';
import { Event } from '../types/Event';
import { parseDateFieldFromJSONResponse } from '../utils';
import { EventsContext, EventsContextObject } from './EventsContext';

const withParsedDates = (events: any[]): Event[] => parseDateFieldFromJSONResponse(events as [], 'dateTime');

interface EventsProviderProps {
    children: ReactNode;
}

export default function EventsProvider({ children }: EventsProviderProps) {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const { data } = await api.getEvents();
            setEvents(withParsedDates(data));
        } catch (error) {
            // The fake API is only available while json-server is running. Falling back to the
            // bundled db.json keeps the screens usable offline and in the simulator.
            console.warn('Could not reach the events API, using the bundled db.json instead.', error);
            setEvents(withParsedDates(localEvents));
        } finally {
            setIsLoading(false);
        }
    };

    const getEventById = useCallback((eventId: string) => events.find(({ id }) => id === eventId), [events]);

    const addVolunteer = useCallback(
        async (eventId: string, userId: string) => {
            const event = events.find(({ id }) => id === eventId);
            if (!event || event.volunteersIds.includes(userId)) return;

            const volunteersIds = [...event.volunteersIds, userId];

            // Update locally first so the status box and the map marker react immediately.
            setEvents((current) =>
                current.map((item) => (item.id === eventId ? { ...item, volunteersIds } : item))
            );

            try {
                await api.updateEventVolunteers(eventId, volunteersIds);
            } catch (error) {
                console.warn('Could not save the volunteer to the API.', error);
            }
        },
        [events]
    );

    const eventsContextObj: EventsContextObject = { events, isLoading, getEventById, addVolunteer };

    return <EventsContext.Provider value={eventsContextObj}>{children}</EventsContext.Provider>;
}
