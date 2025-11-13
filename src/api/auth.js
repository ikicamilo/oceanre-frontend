import api from "./axiosInstance";

export async function login(email, password) {
  const res = await api.post("/auth/login", { email, password });
  return res.data; // expected { token, user }
}

export async function me() {
  const res = await api.get("/auth/me");
  return res.data;
}
