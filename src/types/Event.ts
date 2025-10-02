export type Event = {
  id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  requiredVolunteers: number;
  volunteers: string[];
  imageUrl?: string;
  dateTime?: string;
  organizerId?: string;
};
