import axios, { AxiosResponse } from 'axios';
import { Event } from '../types/Event';
import { User } from '../types/User';

const api = axios.create({
    // Set this to the host address of the machine running json-server.
    baseURL: 'http://192.168.50.178:3333',
});

export const authenticateUser = (email: string, password: string): Promise<AxiosResponse> => {
    return api.post('/login', { email, password });
};

export const getEvents = (): Promise<AxiosResponse<Event[]>> => {
    return api.get('/events');
};

export const getEvent = (eventId: string): Promise<AxiosResponse<Event>> => {
    return api.get(`/events/${eventId}`);
};

export const createEvent = (event: Event, accessToken: string): Promise<AxiosResponse<Event>> => {
    return api.post('/664/events', event, {
        headers: { Authorization: ['Bearer', accessToken].join(' ') },
    });
};

export const updateEvent = (event: Event, accessToken: string): Promise<AxiosResponse<Event>> => {
    return api.patch(`/664/events/${event.id}`, event, {
        headers: { Authorization: ['Bearer', accessToken].join(' ') },
    });
};

export const getUser = (userId: string): Promise<AxiosResponse<User>> => {
    return api.get(`/users/${userId}`);
};

export const addEventVolunteer = (
    eventId: string,
    volunteersIds: string[],
    accessToken: string
): Promise<AxiosResponse<Event>> => {
    return api.patch(
        `/664/events/${eventId}`,
        { volunteersIds },
        { headers: { Authorization: ['Bearer', accessToken].join(' ') } }
    );
};
