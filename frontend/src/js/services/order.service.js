/**
 * order.service.js — Service layer for Order History, Order Details, Refunds, and Stats
 */
import apiService from "./api.service.js";

class OrderService {
  // ── Orders ─────────────────────────────────────────────────────────────────
  async getOrderHistory(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/order-history/?${query}` : "/order-history/";
    return apiService.get(endpoint);
  }

  async getOrderDetail(orderId) {
    return apiService.get(`/order-history/${orderId}/`);
  }

  async getOrderStats() {
    return apiService.get("/order-stats/");
  }

  // ── Refunds ────────────────────────────────────────────────────────────────
  async getRefundHistory(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/refund-history/?${query}` : "/refund-history/";
    return apiService.get(endpoint);
  }

  async getRefundDetail(id) {
    return apiService.get(`/refund-history/detail/${id}/`);
  }

  async processRefund(orderId, payload) {
    return apiService.post(`/orders/${orderId}/refund/`, payload);
  }
}

export const orderService = new OrderService();
export default orderService;
