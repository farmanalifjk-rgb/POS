/**
 * inventory.service.js — Service layer for Inventory, Stock Movements, Adjustments, Transfers, Bins & Valuation
 */
import apiService from "./api.service.js";

class InventoryService {
  // ── Inventory Dashboard & Items ───────────────────────────────────────────
  async getInventory(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/inventory/?${query}` : "/inventory/";
    return apiService.get(endpoint);
  }

  async getInventorySummary() {
    return apiService.get("/inventory/summary/");
  }

  async getLowStockProducts() {
    return apiService.get("/inventory/low-stock/");
  }

  // ── Stock Movements ────────────────────────────────────────────────────────
  async getStockMovements(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/inventory/movements/?${query}` : "/inventory/movements/";
    return apiService.get(endpoint);
  }

  async getStockMovementSummary() {
    return apiService.get("/inventory/movements/summary/");
  }

  // ── Adjustments ────────────────────────────────────────────────────────────
  async getStockAdjustments() {
    return apiService.get("/inventory/stock-adjustments/history/");
  }

  async createStockAdjustment(adjustmentData) {
    return apiService.post("/inventory/stock-adjustments/", adjustmentData);
  }

  // ── Valuation & Reports ───────────────────────────────────────────────────
  async getValuation() {
    return apiService.get("/inventory/valuation/");
  }

  async getProductValuation() {
    return apiService.get("/inventory/valuation/products/");
  }

  async getReports() {
    return apiService.get("/inventory/reports/");
  }

  async getAnalytics() {
    return apiService.get("/inventory/analytics/");
  }

  async getAbcAnalysis() {
    return apiService.get("/inventory2/abc/");
  }

  async getAging() {
    return apiService.get("/inventory2/aging/");
  }

  async getReorderAlerts() {
    return apiService.get("/inventory2/reorder-alerts/");
  }

  // ── Bins & Locations ───────────────────────────────────────────────────────
  async getBins() {
    return apiService.get("/inventory2/bins/");
  }

  async createBin(binData) {
    return apiService.post("/inventory2/bins/", binData);
  }

  // ── Cycle Counts ───────────────────────────────────────────────────────────
  async getCycleCounts() {
    return apiService.get("/inventory2/cycle-counts/");
  }

  async createCycleCount(data) {
    return apiService.post("/inventory2/cycle-counts/", data);
  }
}

export const inventoryService = new InventoryService();
export default inventoryService;
