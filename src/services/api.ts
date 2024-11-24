import axios, { AxiosResponse } from 'axios';
import { getFromNetworkFirst, setInCache } from './caching';

const api = axios.create({
    // Your original IP address for the server
    baseURL: 'http://192.168.1.68:3333', 
    headers: { 'Content-Type': 'application/json' },
});

// Simulate user login by querying the users endpoint
export const authenticateUser = async (email: string, password: string): Promise<any> => {
    try {
        console.log(`Authenticating user with email: ${email}`);

        const response = await api.get('/users', {
            params: { email, password },
        });

        // Check if a user exists with the provided credentials
        if (response.data.length > 0) {
            const user = response.data[0];
            console.log("User authenticated successfully:", user);

            // Cache user info
            await setInCache('userInfo', user);
            return user;
        } else {
            console.warn("No matching user found for provided credentials.");
            return null;
        }
    } catch (error) {
        console.error("Error authenticating user:", error);
        throw error; // Re-throw the error for the caller to handle
    }
};

// Get all events (cache-aware)
export const getEvents = async (): Promise<any> => {
    const key = 'events';
    try {
        console.log("Fetching events...");
        return await getFromNetworkFirst(key, api.get('/events').then((res) => res.data));
    } catch (error) {
        console.error("Error fetching events:", error);
        throw error;
    }
};

// Get a single event by ID (cache-aware)
export const getEvent = async (eventId: string): Promise<any> => {
    const key = `event-${eventId}`;
    try {
        console.log(`Fetching event with ID: ${eventId}`);
        return await getFromNetworkFirst(key, api.get(`/events/${eventId}`).then((res) => res.data));
    } catch (error) {
        console.error(`Error fetching event with ID ${eventId}:`, error);
        throw error;
    }
};

// Apply for an event
export const applyForEvent = async (eventId: string, userId: string): Promise<any> => {
    try {
        console.log(`User ${userId} applying for event ${eventId}`);
        const response = await api.post(`/events/${eventId}/apply`, { userId });
        console.log("Application successful:", response.data);
        return response.data;
    } catch (error) {
        console.error(`Error applying for event ${eventId}:`, error);
        throw error;
    }
};

// Create a new event
export const createEvent = async (eventData: {
    name: string;
    description: string;
    dateTime: string;
    volunteersNeeded: number;
    position: { latitude: number; longitude: number };
}): Promise<any> => {
    try {
        console.log("Creating a new event:", eventData);
        const response = await api.post('/events', eventData);
        console.log("Event created successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating event:", error);
        throw error;
    }
};

// Example usage for testing
const email = "ulla.ulriksen@example.com";
const password = "$2a$10$hd96yCeGW794sN8OL7SeMeOGPVEY.wiQDcsHbf5p.Ngtjx93iqjIG"; // Replace with plain text if db.json uses unhashed passwords

authenticateUser(email, password).then((user) => {
    if (user) {
        console.log("User authenticated:", user);
    } else {
        console.log("Authentication failed. Invalid credentials.");
    }
});

