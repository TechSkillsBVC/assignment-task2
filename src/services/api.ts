import axios, { AxiosResponse } from 'axios';
import { EventDetails } from '../types/Event';

const api = axios.create({
    // Before running your 'json-server', get your computer's IP address and
    // update your baseURL to `http://your_ip_address_here:3333` and then run:
    // `npx json-server --watch db.json --port 3333 --host 192.168.0.25`
    //
    // To access your server online without running json-server locally,
    // you can set your baseURL to:
    // `https://my-json-server.typicode.com/<your-github-username>/<your-github-repo>`
    //
    // To use `my-json-server`, make sure your `db.json` is located at the repo root.

    baseURL: 'http://192.168.0.25:3333',
});

export const authenticateUser = (email: string, password: string): Promise<AxiosResponse> => {
    return api.get(`/users`, { params: { email, password } });
};

export const fetchEvent = (eventId: string): Promise<AxiosResponse<EventDetails>> => {
    return api.get(`/events/${eventId}`);
};

export const fetchEvents = (): Promise<AxiosResponse<EventDetails[]>> => {
    return api.get('/events');
};

export const fetchUser = (userId: string): Promise<AxiosResponse> => {
    return api.get(`/users/${userId}`);
};

export const createEvent = (newEvent: EventDetails): Promise<AxiosResponse<EventDetails>> => {
    return api.post('/events', newEvent);
};

export const updateEvent = (eventId: string, updatedEvent: EventDetails): Promise<AxiosResponse<EventDetails>> => {
    return api.put(`/events/${eventId}`, updatedEvent);
};

export const fetchUsers = async (): Promise<{ id: string; name: string }[]> => {
    try {
        const response: AxiosResponse<{ id: string; name: { first: string; last: string } }[]> = await api.get('/users');
        
        // Map the response to combine the nested first and last names
        return response.data.map((user) => ({
            id: user.id,
            name: `${user.name.first} ${user.name.last}`, // Accessing nested first and last names
        }));
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error; // Throw error so it can be caught by the calling component
    }
};