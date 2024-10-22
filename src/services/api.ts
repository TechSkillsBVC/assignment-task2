import axios, { AxiosResponse } from 'axios';

// Set the base URL with your old IP address
const api = axios.create({
    baseURL: 'http://172.26.128.206:3333',  // Old IP address
});

export const authenticateUser = (email: string, password: string): Promise<AxiosResponse> => {
    return api.post(`/login`, { email, password });
};

export const getEvents = (): Promise<AxiosResponse> => {
    return api.get('/events');
};

export const getEvent = (eventId: string): Promise<AxiosResponse> => {
    return api.get(`/events/${eventId}`);
};

export const applyForEvent = (eventId: string, userId: string): Promise<AxiosResponse> => {
    return api.post(`/events/${eventId}/apply`, { userId });
};

export const createEvent = (eventData: {
    name: string;
    description: string;
    date: string;
    volunteersNeeded: number;
}): Promise<AxiosResponse> => {
    return api.post('/events', eventData);
};

export default api;
