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
    imageUrl?: string;
}

export interface EventWithOrganizer extends Event {
    organizer?: {
        name: {
            first: string;
            last: string;
        };
        mobile: string;
    };
}
