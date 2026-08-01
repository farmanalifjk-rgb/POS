/**
 * system.service.js — Service layer for System Settings, Users, Roles, Taxes, Payment Methods, and Stores
 */
import apiService from "./api.service.js";

class SystemService {
  // ── Settings ───────────────────────────────────────────────────────────────
  async getSettings() {
    return apiService.get("/settings/");
  }

  async updateSettings(data) {
    return apiService.put("/settings/", data);
  }

  // ── Users ──────────────────────────────────────────────────────────────────
  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/users/?${query}` : "/users/";
    return apiService.get(endpoint);
  }

  async createUser(userData) {
    return apiService.post("/users/", userData);
  }

  async updateUser(id, userData) {
    return apiService.put(`/users/${id}/`, userData);
  }

  async deleteUser(id) {
    return apiService.delete(`/users/${id}/`);
  }

  // ── Roles & Permissions ────────────────────────────────────────────────────
  async getRoles() {
    return apiService.get("/roles/");
  }

  async createRole(roleData) {
    return apiService.post("/roles/", roleData);
  }

  async updateRole(id, roleData) {
    return apiService.put(`/roles/${id}/`, roleData);
  }

  async deleteRole(id) {
    return apiService.delete(`/roles/${id}/`);
  }

  // ── Taxes & Payment Methods ────────────────────────────────────────────────
  async getTaxes() {
    return apiService.get("/taxes/");
  }

  async createTax(taxData) {
    return apiService.post("/taxes/", taxData);
  }

  async getPaymentMethods() {
    return apiService.get("/payment-methods/");
  }

  async createPaymentMethod(data) {
    return apiService.post("/payment-methods/", data);
  }

  // ── Enterprise Stores & Warehouses ─────────────────────────────────────────
  async getStores() {
    return apiService.get("/enterprise/stores/");
  }

  async createStore(storeData) {
    return apiService.post("/enterprise/stores/", storeData);
  }
}

export const systemService = new SystemService();
export default systemService;
