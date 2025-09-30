import axios, { AxiosResponse } from "axios";

const api = axios.create({
  baseURL: "http://70.75.109.178",
});

export const authenticateUser = (
  email: string,
  password: string
): Promise<AxiosResponse> => {
  return api.post(`/login`, { email, password });
};
