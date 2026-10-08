import { LatLng } from 'react-native-maps';

export interface Event {
    id: string;
    name: string;
    description: string;
    dateTime: string;
    imageUrl?: string;
    organizerId: string;
    position: LatLng;
    volunteersNeeded: number;
    volunteersIds: string[];
}

export enum EventStatus {
    Volunteered = 'volunteered',
    Open = 'open',
    Full = 'full',
}
