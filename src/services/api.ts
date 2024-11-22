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

/**
 * Authenticates a user by email and password.
 * 
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<AxiosResponse>} A promise resolving to the Axios response object.
 */

export const authenticateUser = (email: string, password: string): Promise<AxiosResponse> => {
    return api.get(`/users`, { params: { email, password } });
};

/**
 * Input object for creating a new event.
 * Fetches event details by ID from the API.
 * 
 * @param {string} eventId - The unique identifier of the event to retrieve.
 * @returns {Promise<EventDetails>} A promise resolving to the event details object.
 */
export const fetchEvent = (eventId: string): Promise<AxiosResponse<EventDetails>> => {
    return api.get(`/events/${eventId}`);
};

/**
 * Output object for fetching all events.
 * @returns {Promise<EventDetails>} Resolves with the event details object:
 * {
 *   id: string;
 *   name: string;
 *   dateTime: string;
 *   description: string;
 *   imageUrl: string;
 *   organizerId: string;
 *   volunteersNeeded: number;
 *   volunteersIds: string[];
 *   position: { latitude: number; longitude: number; };
 * }
 * @throws {Error} Throws if the event ID is invalid or the API request fails.
 */

export const fetchEvents = (): Promise<AxiosResponse<EventDetails[]>> => {
    return api.get('/events');
};

/**
 *  Fetches user details by ID from the API.   
 *  
 * @param userId 
 * @returns 
 */

export const fetchUser = (userId: string): Promise<AxiosResponse> => {
    return api.get(`/users/${userId}`);
};

/**
 * Creates a new event.
 * 
 * @param newEvent 
 * @returns 
 */

export const createEvent = (newEvent: EventDetails): Promise<AxiosResponse<EventDetails>> => {
    return api.post('/events', newEvent);
};

/**
 * Updates an existing event.
 * @param eventId  
 * @param updatedEvent 
 * @returns 
 */

export const updateEvent = (eventId: string, updatedEvent: EventDetails): Promise<AxiosResponse<EventDetails>> => {
    return api.put(`/events/${eventId}`, updatedEvent);
};

/**
 * Fetches all users from the API.
 * @returns
 * @throws {Error} Throws if the API request fails.
 */

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