import { LatLng } from 'react-native-maps';

export interface Event {
    id: string;
    dateTime: string;
    description: string;
    imageUrl?: string;
    name: string;
    organizerId: string;
    position: LatLng;
    volunteersNeeded: number;
    volunteersIds: string[];
}

export type EventStatus = 'volunteered' | 'full' | 'open';
