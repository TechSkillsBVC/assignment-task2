
export type RootStackParamList = {
    Login: undefined;
    EventsMap: { newEvent?: Event };
    EventDetails: { event: Event };
   
};

export interface Event {
    id: string;
    dateTime: string;
    description: string;
    name: string;
    organizerId: string;
    position: {
        latitude: number;
        longitude: number;
    };
    volunteersNeeded: number;
    volunteersIds: string[] ;
    imageUrl?: string; 
   
    
}
