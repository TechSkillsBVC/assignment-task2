import database from '../../db.json';
import { Event } from '../types/Event';
import { User } from '../types/User';

/**
 * db.json is bundled with the app so the screens still render when json-server
 * is not running. The API is always tried first; this is only the fallback.
 */
export const localEvents = database.events as unknown as Event[];

export const findLocalUser = (userId: string): User | undefined =>
    (database.users as unknown as User[]).find((user) => user.id === userId);
