export interface EventDetail {
    id: string;
    title: string;
    about: string;
    organizer: string;
    date: string;
    time: string;
    phone: string;
    requiredVolunteers: number;
    volunteers: { id: string }[];
    position: {
        latitude: number;
        longitude: number;
    };
    images: { id: string; url: string }[];
}
