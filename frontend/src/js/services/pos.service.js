/**
 * pos.service.js — Service layer for POS Checkout, Receipt, Cash Sessions, and Drafts
 */
import apiService from "./api.service.js";

class PosService {
  // ── Checkout ───────────────────────────────────────────────────────────────
  async checkout(payload) {
    return apiService.post("/checkout/", payload);
  }

  async getReceipt(orderId) {
    return apiService.get(`/receipt/${orderId}/`);
  }

  // ── Cash Sessions ──────────────────────────────────────────────────────────
  async getCashSessions(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/cash-sessions/?${query}` : "/cash-sessions/";
    return apiService.get(endpoint);
  }

  async closeCashSession(sessionId, payload = {}) {
    return apiService.post(`/cash-sessions/${sessionId}/close/`, payload);
  }

  async getSessionTimeline(sessionId) {
    return apiService.get(`/cash-sessions/${sessionId}/timeline/`);
  }

  async cashTransaction(sessionId, action, data) {
    return apiService.post(`/cash-sessions/${sessionId}/${action}/`, data);
  }

  async getCashiers() {
    return apiService.get("/cash-sessions/cashiers/");
  }

  // ── Draft Orders ───────────────────────────────────────────────────────────
  async getDrafts() {
    return apiService.get("/pos/drafts/");
  }

  async saveDraft(draftData) {
    return apiService.post("/pos/drafts/", draftData);
  }

  async deleteDraft(id) {
    return apiService.delete(`/pos/drafts/${id}/`);
  }
}

export const posService = new PosService();
export default posService;
