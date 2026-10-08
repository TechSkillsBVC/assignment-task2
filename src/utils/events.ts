import { Event, EventStatus } from '../types/Event';

export const getEventStatus = (event: Event, userId?: string): EventStatus => {
    if (userId && event.volunteersIds.includes(userId)) return EventStatus.Volunteered;
    if (event.volunteersIds.length >= event.volunteersNeeded) return EventStatus.Full;
    return EventStatus.Open;
};

export const isUpcomingEvent = (event: Event): boolean => {
    return new Date(event.dateTime).getTime() > Date.now();
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

//format date safely
export const formatShortDate = (dateTime: string | Date): string => {
    const date = new Date(dateTime);
    return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};
