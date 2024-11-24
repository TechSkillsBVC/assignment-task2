import { createContext } from 'react';
import { User } from '../types/User';

export type AuthenticationContextObject = {
    value: User | null; // Represents authenticated user or null if unauthenticated
    setValue: (newValue: User | null) => void; // Function to update user authentication state
};

export const AuthenticationContext = createContext<AuthenticationContextObject | null>(null);
