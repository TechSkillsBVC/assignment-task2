import React, { createContext, useState, ReactNode } from "react";

export interface Volunteer {
  id: string;
  name: string;
  phone: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  organizer: string;
  requiredVolunteers: number;
  volunteers: Volunteer[];
  contactPhone: string;
  date: string;
  time: string;
  imageUrl: string;
  position: { latitude: number; longitude: number };
}

interface EventsContextType {
  events: Event[];
  addVolunteer: (eventId: string, volunteer: Volunteer) => void;
  removeVolunteer: (eventId: string, volunteerId: string) => void;
  getEventById: (id: string) => Event | undefined;
}

export const EventsContext = createContext<EventsContextType>({
  events: [],
  addVolunteer: () => {},
  removeVolunteer: () => {},
  getEventById: () => undefined,
});

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Food Distribution",
      description: "Help distribute food to those in need.",
      organizer: "Robert Last",
      requiredVolunteers: 10,
      volunteers: [],
      contactPhone: "+1234567890",
      date: "Oct 20, 2023",
      time: "11:00 AM",
      imageUrl:
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=60",
      position: { latitude: 51.0447, longitude: -114.0719 },
    },
    {
      id: "2",
      title: "Clothing Drive",
      description: "Collect and sort clothes for donation.",
      organizer: "Sarah Lee",
      requiredVolunteers: 5,
      volunteers: [],
      contactPhone: "+1987654321",
      date: "Oct 25, 2023",
      time: "2:00 PM",
      imageUrl:
        "https://cdn.hourdetroit.com/wp-content/uploads/sites/20/2021/11/clothing-donations.jpg",
      position: { latitude: 51.0501, longitude: -114.0853 },
    },
    {
      id: "3",
      title: "Park Cleanup",
      description: "Help clean up the local park.",
      organizer: "Alex Johnson",
      requiredVolunteers: 8,
      volunteers: [],
      contactPhone: "+1098765432",
      date: "Oct 28, 2023",
      time: "10:00 AM",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/5/50/Halleyparknovember_b.jpg",
      position: { latitude: 51.0415, longitude: -114.0723 },
    },
  ]);

  const addVolunteer = (eventId: string, volunteer: Volunteer) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId && e.volunteers.length < e.requiredVolunteers
          ? { ...e, volunteers: [...e.volunteers, volunteer] }
          : e
      )
    );
  };

  const removeVolunteer = (eventId: string, volunteerId: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              volunteers: e.volunteers.filter((v) => v.id !== volunteerId),
            }
          : e
      )
    );
  };

  const getEventById = (id: string) => events.find((e) => e.id === id);

  return (
    <EventsContext.Provider
      value={{ events, addVolunteer, removeVolunteer, getEventById }}
    >
      {children}
    </EventsContext.Provider>
  );
};
