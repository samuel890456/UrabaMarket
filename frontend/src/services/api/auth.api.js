import { httpClient } from "../httpClient";

export async function login(body) {
  const { data } = await httpClient.post("/auth/login", body);
  return data.data;
}

export async function register(body) {
  const { data } = await httpClient.post("/auth/register", body);
  return data.data;
}
