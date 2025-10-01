import { User } from '../types/User';
import { Event } from '../@types/Event';

// This mirrors the  db.json so we can run without a server. Both the map and details screen will import from here.

export const USERS: User[] = [
  { id: 'EF-BZ00', name: { first: 'Ulla', last: 'Ulriksen' },  email: 'ulla.ulriksen@example.com',  mobile: '(910) 862-3167' },
  { id: 'Q5bVHgP', name: { first: 'Yasemin', last: 'Akyüz' },  email: 'yasemin.akyuz@example.com',  mobile: '(243) 359-9759' },
  { id: 'gpFfX6e', name: { first: 'Luigi', last: 'Carluccio' }, email: 'luigi@carluccio.it',          mobile: '(171) 946-2538' },
  { id: '3UN3-2L', name: { first: 'John',  last: 'Silva' },     email: 'john@silva.com.br',          mobile: '(563) 589-2999' },
  { id: 't1aL2Xq', name: { first: 'Elif',  last: 'Akşit' },     email: 'elif.aksit@example.com',     mobile: '(636) 336-9413' },
  { id: 'tRHltUh', name: { first: 'Anne',  last: 'Van Wingerden' }, email: 'anne.vanwingerden@example.com', mobile: '(306) 805-5821' },
  { id: '3Ohd8sD', name: { first: 'Gisele',last: 'Oliveira' },  email: 'gisele.oliveira@example.com', mobile: '(905) 491-1184' },
  { id: 'Hr-40KW', name: { first: 'Sara',  last: 'Barnett' },   email: 'sara.barnett@example.com',    mobile: '(710) 271-3339' },
  { id: 'elKKrm3', name: { first: 'Azuma', last: 'Gamez' },     email: 'azuma.gamez@example.com',     mobile: '(605) 964-2338' },
  { id: 'ajY8pM2', name: { first: 'Eva',   last: 'Young' },     email: 'eva.young@example.com',       mobile: '(543) 905-5629' },
];

export const EVENTS_INITIAL: Event[] = [
  // Past (should not show on the map)
  {
    id: 'e3c95682-870f-4080-a0d7-ae8e23e2534f',
    dateTime: '2022-01-11T21:30:00.000Z',
    description: 'Past events should not be displayed in the map',
    name: '!!!Past Event!!!',
    organizerId: 'gpFfX6e',
    position: { latitude: 51.105761, longitude: -114.106943 },
    volunteersNeeded: 1,
    volunteersIds: [],
  },
  {
    id: '98301b22-2b76-44f1-a8da-8c86c56b0367',
    dateTime: '2023-01-11T23:30:00.000Z',
    description:
      'The Memorial Park Library is looking for volunteers to help setting up the stage for our talented local artists.\n\nAny previous event producing experience is greatly appreciated.',
    imageUrl:
      'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=max&w=1080&q=80',
    name: 'Downtown Vibe Live Music',
    organizerId: 'EF-BZ00',
    position: { latitude: 51.04112, longitude: -114.069325 },
    volunteersNeeded: 4,
    volunteersIds: ['3UN3-2L', 'gpFfX6e', 'tRHltUh', 'ajY8pM2'], // FULL
  },
  {
    id: 'd7b8ea73-ba2c-4fc3-9348-9814076124bd',
    dateTime: '2023-02-04T16:30:00.000Z',
    description:
      'At the Flames Community Arena, we are offering a free skating lessons day with volunteer instructors.\n\nWe expect volunteer intructors to:\n- be reliable and enthusiastic\n- take initiative and be innovative\n- commit to a minimum of 4 hours of volunteering.',
    imageUrl:
      'https://images.unsplash.com/photo-1528828465856-0ac27ee2aeb3?auto=format&fit=max&w=1080&q=80',
    name: 'Free Skating Lessons Day',
    organizerId: '3UN3-2L',
    position: { latitude: 51.01222958257112, longitude: -114.11677222698927 },
    volunteersNeeded: 10,
    volunteersIds: ['EF-BZ00', 'gpFfX6e', 'Hr-40KW', 'elKKrm3'],
  },
  {
    id: 'd1a6b9ea-877d-4711-b8d7-af8f1bce4d29',
    dateTime: '2023-01-06T15:30:00.000Z',
    description:
      'The Elboya School is looking for volunteers to teach computer programming to kids from grade 5 to 7.\n\nREQUIREMENTS:\n* Previous programming experience.\n* 4 hour commitment, from 8:30 AM to 12:30 AM.',
    imageUrl:
      'https://images.unsplash.com/photo-1584697964328-b1e7f63dca95?auto=format&fit=max&w=1080&q=80',
    name: 'Kids Programming Day',
    organizerId: 'Hr-40KW',
    position: { latitude: 51.010801915407036, longitude: -114.07823592424393 },
    volunteersNeeded: 2,
    volunteersIds: ['EF-BZ00', 'Q5bVHgP'], // FULL
  },
];
