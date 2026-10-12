import axios, { AxiosResponse } from 'axios';

const api = axios.create({
    baseURL: 'http://10.0.2.2:3333',
});

export const authenticateUser = (
    email: string,
    password: string
): Promise<AxiosResponse> => {
    return api.post('/login', { email, password });
};

export const getEvents = (): Promise<AxiosResponse> => {
    return api.get('/events');
};

export const volunteerForEvent = (
    eventId: string,
    userId: string
): Promise<AxiosResponse> => {
    return api.get(`/events/${eventId}`).then(async (response) => {
        const event = response.data;

        if (event.volunteersIds.includes(userId)) {
            throw new Error('You have already volunteered for this event.');
        }

        if (event.volunteersIds.length >= event.volunteersNeeded) {
            throw new Error('This event is full.');
        }

        return api.patch(`/events/${eventId}`, {
            volunteersIds: [...event.volunteersIds, userId],
        });
    });
};