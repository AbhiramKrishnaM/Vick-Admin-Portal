import { apiFetch, setToken } from "@/lib/api";

export async function login(email: string, password: string) {
  const { token } = await apiFetch<{ token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(token);
}
