//  {
//             "id": "d7b8ea73-ba2c-4fc3-9348-9814076124bd",
//             "dateTime": "2023-02-04T16:30:00.000Z",
//             "description": "At the Flames Community Arena, we are offering a free skating lessons day with volunteer instructors.\n\nWe expect volunteer intructors to:\n- be reliable and enthusiastic\n- take initiative and be innovative\n- commit to a minimum of 4 hours of volunteering.",
//             "imageUrl": "https://images.unsplash.com/photo-1528828465856-0ac27ee2aeb3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=max&w=1080&q=80",
//             "name": "Free Skating Lessons Day",
//             "organizerId": "3UN3-2L",
//             "position": {
//                 "latitude": 51.01222958257112,
//                 "longitude": -114.11677222698927
//             },
//             "volunteersNeeded": 10,
//             "volunteersIds": ["EF-BZ00", "gpFfX6e", "Hr-40KW", "elKKrm3"]
//         },

export interface Event {
    id: string;
    dateTime: string;
    description: string;
    imageUrl: string;
    name: string;
    organizerId: string;
    position: {
        latitude: number;
        longitude: number;
    };
    volunteersNeeded: number;
    volunteersIds: string[];
}