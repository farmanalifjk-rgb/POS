/**
 * auth.service.js — Token-based authentication layer using ApiService
 */
import apiService from "./api.service.js";

const TOKEN_KEY = "pos_token";
const USER_KEY  = "pos_user";

class AuthService {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  isLoggedIn() {
    return !!this.getToken();
  }

  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  authHeader() {
    const token = this.getToken();
    return token ? { Authorization: `Token ${token}` } : {};
  }

  async login(username, password) {
    const res = await apiService.post("/auth/login/", { username, password });
    
    if (!res.ok) {
      return { ok: false, error: res.error };
    }

    if (res.data.requires_otp) {
      return { ok: true, requires_otp: true, otp_token: res.data.otp_token };
    }

    if (res.data.token) {
      this.setToken(res.data.token);
      await this.fetchMe().catch(() => {});
      return { ok: true };
    }

    return { ok: false, error: "Unexpected server response" };
  }

  async verifyOtp(otpToken, code) {
    const res = await apiService.post("/auth/verify-otp/", { otp_token: otpToken, code });

    if (!res.ok) {
      return { ok: false, error: res.error || "Invalid code" };
    }

    if (res.data.token) {
      this.setToken(res.data.token);
      await this.fetchMe().catch(() => {});
      return { ok: true };
    }

    return { ok: false, error: "Unexpected server response" };
  }

  async resendOtp(otpToken) {
    const res = await apiService.post("/auth/resend-otp/", { otp_token: otpToken });
    return res.ok;
  }

  async logout() {
    await apiService.post("/auth/logout/", {}).catch(() => {});
    this.clearToken();
    window.location.hash = "#/login";
  }

  async fetchMe() {
    const res = await apiService.get("/auth/me/");
    if (!res.ok) throw new Error("Unauthorized");
    this.setUser(res.data);
    return res.data;
  }

  async changePassword(currentPassword, newPassword) {
    const res = await apiService.post("/auth/change-password/", { 
        current_password: currentPassword, 
        new_password: newPassword 
    });
    return res;
  }

  // Guard: redirect to login if not authenticated
  guard() {
    if (!this.isLoggedIn()) {
      window.location.hash = "#/login";
      return false;
    }
    return true;
  }
}

export const authService = new AuthService();
export default authService;
