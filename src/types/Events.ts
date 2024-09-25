// src/types/Event.ts

export type RootStackParamList = {
    Login: undefined; // or specific params if needed
    EventsMap: undefined; // or specific params if needed
    EventDetails: { event: Event }; // Pass the event as a parameter
};

export interface Event {
    id: string;
    dateTime: string;
    description: string;
    name: string;
    organizerId: string;
    position: {
        latitude: number;
        longitude: number;
    };
    volunteersNeeded: number;
    volunteersIds: string[];
    imageUrl?: string; // Ensure it matches the JSON
}
