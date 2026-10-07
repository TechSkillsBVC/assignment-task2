import axios, { AxiosResponse } from 'axios';
import { Event } from '../types/Event';
import { User } from '../types/User';

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

    baseURL: 'http://0.0.0.0:3333',
});

export const authenticateUser = (email: string, password: string): Promise<AxiosResponse> => {
    return api.post(`/login`, { email, password });
};

export const getEvent = (eventId: string): Promise<AxiosResponse<Event>> => {
    return api.get(`/events/${eventId}`);
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
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
};
