import axios, { AxiosResponse } from "axios";

const api = axios.create({
  baseURL: "http://10.0.2.2:3333",
});

export const registerUser = (
  email: string,
  password: string,
  name?: string
): Promise<AxiosResponse<{ accessToken: string; user: any }>> => {
  return api.post("/register", { email, password, name });
};

export const authenticateUser = (
  email: string,
  password: string
): Promise<AxiosResponse<{ accessToken: string; user: any }>> => {
  return api.post("/login", { email, password });
};

export const apiGet = <T = any>(path: string) => api.get<T>(path);
export const apiPatch = <T = any>(path: string, body: any) =>
  api.patch<T>(path, body);

export default api;
