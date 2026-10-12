import { Event, EventStatus } from '../types/Event';

export const getEventStatus = (event: Event, userId?: string): EventStatus => {
    if (userId && event.volunteersIds.includes(userId)) return 'volunteered';
    if (event.volunteersIds.length >= event.volunteersNeeded) return 'full';
    return 'open';
};
