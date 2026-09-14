import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const setAuthToken = (token) => {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }
};

export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const clearAuthToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("subdomain");
    localStorage.removeItem("businessId");
    localStorage.removeItem("clientId");
  }
};

export const ensureDemoLogin = async () => {
  if (typeof window === "undefined") return null;
  let token = localStorage.getItem("token");
  if (token) return token;

  try {
    const sub = "demo" + Math.floor(Math.random() * 1000);
    await api.post("/business/register", {
      name: "Demo Enterprise",
      subdomain: sub,
      ownerEmail: `owner_${sub}@demo.com`,
      password: "password123",
    });

    const res = await api.post("/business/login", {
      subdomain: sub,
      ownerEmail: `owner_${sub}@demo.com`,
      password: "password123",
    });

    if (res.data.token) {
      setAuthToken(res.data.token);
      localStorage.setItem("userRole", "business");
      localStorage.setItem("subdomain", sub);
      localStorage.setItem("businessId", res.data.businessId);
      return res.data.token;
    }
  } catch (err) {
    console.warn("Auto demo login failed:", err.message);
  }
  return null;
};

export default api;
