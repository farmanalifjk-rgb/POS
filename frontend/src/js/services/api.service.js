/**
 * api.service.js — Centralized API Client
 * 
 * Handles all fetch requests, token injection, error standardization,
 * and base URL configurations.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

class ApiService {
  constructor() {
    this.baseURL = BASE_URL;
  }

  get token() {
    return localStorage.getItem("pos_token");
  }

  get defaultHeaders() {
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    if (this.token) {
      headers["Authorization"] = `Token ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith("http") ? endpoint : `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // Remove Content-Type if FormData (browser sets it automatically with boundary)
    if (options.body instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized globally
      if (response.status === 401 && !url.includes("/auth/login") && !url.includes("/auth/verify-otp")) {
        this.handleUnauthorized();
        throw new Error("Unauthorized. Please log in again.");
      }

      // 204 No Content has no body to parse
      if (response.status === 204) {
        return { ok: true, data: null };
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          ok: false,
          error: data?.error || data?.detail || `HTTP error ${response.status}`,
          status: response.status,
          data
        };
      }

      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error.message || "Network Error" };
    }
  }

  handleUnauthorized() {
    localStorage.removeItem("pos_token");
    localStorage.removeItem("pos_user");
    if (window.location.hash !== "#/login") {
        window.location.hash = "#/login";
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiService = new ApiService();
export default apiService;
