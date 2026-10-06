import { LatLng } from 'react-native-maps';

export interface Event {
    id: string;
    name: string;
    description: string;
    dateTime: Date;
    organizerId: string;
    imageUrl?: string;
    position: LatLng;
    volunteersNeeded: number;
    volunteersIds: string[];
}

/**
 * How an event relates to the user currently logged in. This drives the marker
 * colour on the map, the status box and which action buttons are shown.
 */
export type EventStatus = 'volunteered' | 'full' | 'open';
