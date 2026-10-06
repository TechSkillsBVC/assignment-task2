import { Event, EventStatus } from '../types/Event';
import { formatAMPM } from './index';

/** Events that already happened are not shown on the map. */
export const isPastEvent = (event: Event): boolean => new Date(event.dateTime).getTime() < Date.now();

export const isEventFull = (event: Event): boolean => event.volunteersIds.length >= event.volunteersNeeded;

export const hasUserVolunteered = (event: Event, userId?: string): boolean =>
    !!userId && event.volunteersIds.includes(userId);

/**
 * Volunteering wins over "full": an event the user already joined keeps showing
 * as volunteered even once the team is complete.
 */
export const getEventStatus = (event: Event, userId?: string): EventStatus => {
    if (hasUserVolunteered(event, userId)) return 'volunteered';
    if (isEventFull(event)) return 'full';
    return 'open';
};

/** "Oct 20, 2023" */
export const formatEventDate = (dateTime: Date): string =>
    new Date(dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/** "11:00 AM" */
export const formatEventTime = (dateTime: Date): string => formatAMPM(new Date(dateTime)).toUpperCase();

/** Phone numbers are stored as "(910) 862-3167"; tel: and sms: links need digits only. */
export const toDialableNumber = (mobile: string): string => mobile.replace(/\D/g, '');
