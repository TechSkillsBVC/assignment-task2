export interface Event {
  id: string;
  name: string;
  description: string;
  dateTime: string;
  imageUrl: string;
  organizerId: string;
  position: { latitude: number; longitude: number };
  volunteersNeeded: number;
  volunteersIds: string[];
}
