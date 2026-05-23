import { clearSession, getSession, setSession } from "./session.js";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:4000";

async function request(path, options = {}, retry = true) {
  const session = getSession();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (response.status === 401 && retry && session?.refreshToken) {
    const refreshed = await refreshSession(session.refreshToken);
    setSession(refreshed);
    return request(path, options, false);
  }

  if (!response.ok) {
    const message = typeof payload === "string" ? payload : payload.error || "Operacion no disponible.";
    throw new Error(message);
  }

  return payload;
}

export async function refreshSession(refreshToken) {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ refreshToken })
  });

  const payload = await response.json();
  if (!response.ok) {
    clearSession();
    throw new Error(payload.error || "No fue posible renovar la sesion.");
  }

  return payload;
}

export const api = {
  async register(values) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(values)
    });
  },
  async login(values) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify(values)
    });
  },
  async logout(refreshToken) {
    try {
      return await request("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken })
      });
    } finally {
      clearSession();
    }
  },
  async getProfile() {
    return request("/me");
  },
  async getTransfers() {
    return request("/me/transfers");
  },
  async createTransfer(values) {
    return request("/transfers", {
      method: "POST",
      body: JSON.stringify(values)
    });
  },
  async getAdminUsers() {
    return request("/admin/users");
  },
  async getAdminTransfers() {
    return request("/admin/transfers");
  },
  async updateUserStatus(userId, status) {
    return request(`/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
  }
};
