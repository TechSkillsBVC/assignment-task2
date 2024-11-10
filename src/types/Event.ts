export interface EventDetails {
    id: string;
    name: string;
    dateTime: string;
    description: string;
    imageUrl: string;
    organizerId: string;
    volunteersNeeded: number;
    volunteersIds: string[];
    position: {
        latitude: number;
        longitude: number;
    };
}