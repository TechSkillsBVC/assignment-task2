import { createContext } from "react";
import { User } from "../types/User";

export interface AuthenticationContextObject {
  value: User | undefined;
  setValue: React.Dispatch<React.SetStateAction<User | undefined>>;
}

export const AuthenticationContext =
  createContext<AuthenticationContextObject | null>(null);
