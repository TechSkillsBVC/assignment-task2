import { VolunteerEvent } from '../types/Event';

export const eventState = (event: VolunteerEvent, userId?: string) => {
    const applied = !!userId && event.volunteersIds.includes(userId);
    const full = event.volunteersIds.length >= event.volunteersNeeded;
    return {
        applied, full,
        status: applied ? 'volunteered' : full ? 'team is full' : `${event.volunteersIds.length} of ${event.volunteersNeeded}`,
        color: applied ? '#5AA3FF' : full ? '#8FA7B3' : '#FF8700',
        canVolunteer: !applied && !full,
        canShare: applied || !full,
    };
};

export const addVolunteer = (event: VolunteerEvent, userId: string): VolunteerEvent => {
    if (!eventState(event, userId).canVolunteer) return event;
    return { ...event, volunteersIds: [...event.volunteersIds, userId] };
};

export const upcomingEvents = (events: VolunteerEvent[], now = Date.now()) =>
    events.filter(event => new Date(event.dateTime).getTime() >= now);
