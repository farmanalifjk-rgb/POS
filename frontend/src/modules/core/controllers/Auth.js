/**
 * Auth.js — Token-based authentication layer
 *
 * Flow:
 *   1. POST /api/auth/login/ → { token } | { requires_otp: true, otp_token }
 *   2. If OTP required: POST /api/auth/verify-otp/ → { token }
 *   3. Token stored in localStorage("pos_token")
 *   4. All API calls get Authorization: Token <token>
 *
 * Exposes:
 *   Auth.getToken()          → string | null
 *   Auth.setToken(t)
 *   Auth.clearToken()
 *   Auth.isLoggedIn()        → bool
 *   Auth.getUser()           → cached user object | null
 *   Auth.login(u, p)         → { ok, requires_otp, otp_token, error }
 *   Auth.verifyOtp(tok, code)→ { ok, error }
 *   Auth.logout()            → void
 *   Auth.fetchMe()           → user object
 *   Auth.authHeader()        → { Authorization: "Token …" } | {}
 */

// Configure this at build time in .env.production (VITE_API_BASE_URL). The
// local default keeps development friction-free while deployments never need a
// source-code edit just to point at their API.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

export const API_BASE_URL = BASE_URL;

const TOKEN_KEY = "pos_token";
const USER_KEY  = "pos_user";

const Auth = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },

  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  authHeader() {
    const token = this.getToken();
    return token ? { Authorization: `Token ${token}` } : {};
  },

  async login(username, password) {
    try {
      const res = await fetch(`${BASE_URL}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { ok: false, error: data.error || data.detail || "Login failed" };
      }

      if (data.requires_otp) {
        return { ok: true, requires_otp: true, otp_token: data.otp_token };
      }

      if (data.token) {
        this.setToken(data.token);
        await this.fetchMe().catch(() => {});
        return { ok: true };
      }

      return { ok: false, error: "Unexpected server response" };
    } catch (e) {
      return { ok: false, error: "Network error — check server connection" };
    }
  },

  async verifyOtp(otpToken, code) {
    try {
      const res = await fetch(`${BASE_URL}/auth/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp_token: otpToken, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { ok: false, error: data.error || data.detail || "Invalid code" };
      }

      if (data.token) {
        this.setToken(data.token);
        await this.fetchMe().catch(() => {});
        return { ok: true };
      }

      return { ok: false, error: "Unexpected server response" };
    } catch (e) {
      return { ok: false, error: "Network error" };
    }
  },

  async resendOtp(otpToken) {
    try {
      const res = await fetch(`${BASE_URL}/auth/resend-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp_token: otpToken }),
      });
      return res.ok;
    } catch { return false; }
  },

  async logout() {
    try {
      await fetch(`${BASE_URL}/auth/logout/`, {
        method: "POST",
        headers: { ...this.authHeader() },
      });
    } catch (_) {}
    this.clearToken();
    window.location.hash = "#/login";
  },

  async fetchMe() {
    const res = await fetch(`${BASE_URL}/auth/me/`, {
      headers: { ...this.authHeader() },
    });
    if (!res.ok) throw new Error("Unauthorized");
    const user = await res.json();
    this.setUser(user);
    return user;
  },

  async changePassword(currentPassword, newPassword) {
    const res = await fetch(`${BASE_URL}/auth/change-password/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...this.authHeader() },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    const data = await res.json();
    return { ok: res.ok, data };
  },

  // Guard: redirect to login if not authenticated
  guard() {
    if (!this.isLoggedIn()) {
      window.location.hash = "#/login";
      return false;
    }
    return true;
  },
};

window.Auth = Auth;
export default Auth;
