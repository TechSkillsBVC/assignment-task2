import axios, { AxiosResponse } from 'axios';
import { EventDetails } from '../types/Event';

const api = axios.create({
    // Before running your 'json-server', get your computer's IP address and
    // update your baseURL to `http://your_ip_address_here:3333` and then run:
    // `npx json-server --watch db.json --port 3333 --host your_ip_address_here`
    //
    // To access your server online without running json-server locally,
    // you can set your baseURL to:
    // `https://my-json-server.typicode.com/<your-github-username>/<your-github-repo>`
    //
    // To use `my-json-server`, make sure your `db.json` is located at the repo root.

    baseURL: 'http://192.168.0.20:3333',
});

export const authenticateUser = (email: string, password: string): Promise<AxiosResponse> => {
    return api.post(`/users`, { email, password });
};

export const fetchEvent = (eventId: string): Promise<AxiosResponse<EventDetails>> => {
    return api.get(`/events/${eventId}`);
};

export const fetchEvents = (): Promise<AxiosResponse<EventDetails[]>> => {
    return api.get('/events');
};

export const createEvent = (newEvent: EventDetails): Promise<AxiosResponse<EventDetails>> => {
    return api.post('/events', newEvent);
};

export const updateEvent = (eventId: string, updatedEvent: EventDetails): Promise<AxiosResponse<EventDetails>> => {
    return api.put(`/events/${eventId}`, updatedEvent);
};