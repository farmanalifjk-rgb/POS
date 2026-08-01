import apiService from "../../services/api.service.js";
import productService from "../../services/product.service.js";
import inventoryService from "../../services/inventory.service.js";

const BASE_URL = apiService.baseURL;

async function request(url) {
  const endpoint = url.replace(BASE_URL, "");
  const res = await apiService.get(endpoint);
  if (!res.ok) {
    throw new Error(res.error || `HTTP ${res.status}`);
  }
  return res.data;
}

async function mutate(url, method, data) {
  const endpoint = url.replace(BASE_URL, "");
  let res;
  if (method === "POST") res = await apiService.post(endpoint, data);
  else if (method === "PUT") res = await apiService.put(endpoint, data);
  else if (method === "PATCH") res = await apiService.patch(endpoint, data);
  else if (method === "DELETE") res = await apiService.delete(endpoint);
  
  if (!res.ok) {
    throw Object.assign(new Error(res.error || `HTTP ${res.status}`), { data: res.data });
  }
  return res.data;
}

async function mutateForm(url, method, formData) {
  const endpoint = url.replace(BASE_URL, "");
  let res;
  if (method === "POST") res = await apiService.post(endpoint, formData);
  else if (method === "PUT") res = await apiService.put(endpoint, formData);
  else if (method === "PATCH") res = await apiService.patch(endpoint, formData);

  if (!res.ok) {
    throw Object.assign(new Error(res.error || `HTTP ${res.status}`), { data: res.data });
  }
  return res.data;
}

function buildParams(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.append(key, value);
    }
  });
  return params.toString();
}


// ═══════════════════════════════════════════════════════════════════════════════
// INVENTORY
// ═══════════════════════════════════════════════════════════════════════════════

export function getDashboard() {
    return request(`${BASE_URL}/inventory/dashboard/`);
}

export function getInventory(query = "") {
    return request(`${BASE_URL}/inventory/${query}`);
}

export function getSummary() {
    return request(`${BASE_URL}/inventory/summary/`);
}

export function getLowStock() {
    return request(`${BASE_URL}/inventory/low-stock/`);
}

export function getProduct(id) {
    return request(`${BASE_URL}/inventory/products/${id}/`);
}

export function getAdjustments(filters = {}) {
    const params = buildParams(filters);
    return request(`${BASE_URL}/inventory/stock-adjustments/history/?${params}`);
}

export function getAdjustment(number) {
    return request(`${BASE_URL}/inventory/stock-adjustments/${number}/`);
}

export async function createAdjustment(data) {
    return mutate(`${BASE_URL}/inventory/stock-adjustments/`, "POST", data);
}

export function getValuation() {
    return request(`${BASE_URL}/inventory/valuation/`);
}

export function getValuationProducts() {
    return request(`${BASE_URL}/inventory/valuation/products/`);
}

export function getReports() {
    return request(`${BASE_URL}/inventory/reports/`);
}

export function getAnalytics() {
    return request(`${BASE_URL}/inventory/analytics/`);
}

export function getTopSelling() {
    return request(`${BASE_URL}/inventory/analytics/top-selling/`);
}

export function getSlowMoving() {
    return request(`${BASE_URL}/inventory/analytics/slow-moving/`);
}

export function getMostReturned() {
    return request(`${BASE_URL}/inventory/analytics/most-returned/`);
}

export async function updateProduct(id, data) {
    return mutate(`${BASE_URL}/inventory/products/${id}/update/`, "PUT", data);
}

export function getMovements(filters = {}) {
    const params = buildParams(filters);
    return request(`${BASE_URL}/inventory/movements/?${params}`);
}

export function getMovement(id) {
    return request(`${BASE_URL}/inventory/movements/${id}/`);
}

export function getMovementSummary() {
    return request(`${BASE_URL}/inventory/movements/summary/`);
}

export function exportMovementsCSV()   { window.open(`${BASE_URL}/inventory/movements/export/csv/`, "_blank"); }
export function exportMovementsExcel() { window.open(`${BASE_URL}/inventory/movements/export/excel/`, "_blank"); }
export function exportMovementsPDF()   { window.open(`${BASE_URL}/inventory/movements/export/pdf/`, "_blank"); }

export function exportAdjustmentsCSV()   { window.open(`${BASE_URL}/inventory/stock-adjustments/export/csv/`, "_blank"); }
export function exportAdjustmentsExcel() { window.open(`${BASE_URL}/inventory/stock-adjustments/export/excel/`, "_blank"); }
export function exportAdjustmentsPDF()   { window.open(`${BASE_URL}/inventory/stock-adjustments/export/pdf/`, "_blank"); }


// ═══════════════════════════════════════════════════════════════════════════════
// ALL PRODUCTS MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export function getProducts(filters = {}) {
    const params = buildParams(filters);
    return request(`${BASE_URL}/products-manage/?${params}`);
}

export function getProductStats() {
    return request(`${BASE_URL}/products-manage/stats/`);
}

export async function createProduct(formData) {
    return mutateForm(`${BASE_URL}/products-manage/`, "POST", formData);
}

export async function updateProduct2(id, formData) {
    return mutateForm(`${BASE_URL}/products-manage/${id}/`, "PUT", formData);
}

export async function deleteProduct(id) {
    return mutate(`${BASE_URL}/products-manage/${id}/`, "DELETE");
}

export function exportProducts(format) {
    window.open(`${BASE_URL}/products-manage/export/${format}/`, "_blank");
}


// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════

export function getCategories(filters = {}) {
    const params = buildParams(filters);
    return request(`${BASE_URL}/categories-manage/?${params}`);
}

export function getCategoryStats() {
    return request(`${BASE_URL}/categories-manage/stats/`);
}

export async function createCategory(data) {
    return mutate(`${BASE_URL}/categories-manage/`, "POST", data);
}

export async function updateCategory(id, data) {
    return mutate(`${BASE_URL}/categories-manage/${id}/`, "PUT", data);
}

export async function deleteCategory(id) {
    return mutate(`${BASE_URL}/categories-manage/${id}/`, "DELETE");
}

export function exportCategories(format) {
    window.open(`${BASE_URL}/categories-manage/export/${format}/`, "_blank");
}


// ═══════════════════════════════════════════════════════════════════════════════
// BRANDS
// ═══════════════════════════════════════════════════════════════════════════════

export function getBrands(filters = {}) {
    const params = buildParams(filters);
    return request(`${BASE_URL}/brands/?${params}`);
}

export function getBrandStats() {
    return request(`${BASE_URL}/brands/stats/`);
}

export async function createBrand(data) {
    return mutate(`${BASE_URL}/brands/`, "POST", data);
}

export async function updateBrand(id, data) {
    return mutate(`${BASE_URL}/brands/${id}/`, "PUT", data);
}

export async function deleteBrand(id) {
    return mutate(`${BASE_URL}/brands/${id}/`, "DELETE");
}


// ═══════════════════════════════════════════════════════════════════════════════
// VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════

export function getVariants(filters = {}) {
    const params = buildParams(filters);
    return request(`${BASE_URL}/variants/?${params}`);
}

export function getVariantStats() {
    return request(`${BASE_URL}/variants/stats/`);
}

export async function createVariant(data) {
    return mutate(`${BASE_URL}/variants/`, "POST", data);
}

export async function updateVariant(id, data) {
    return mutate(`${BASE_URL}/variants/${id}/`, "PUT", data);
}

export async function deleteVariant(id) {
    return mutate(`${BASE_URL}/variants/${id}/`, "DELETE");
}

export async function addVariantValue(variantId, data) {
    return mutate(`${BASE_URL}/variants/${variantId}/values/`, "POST", data);
}

export async function deleteVariantValue(variantId, valueId) {
    return mutate(`${BASE_URL}/variants/${variantId}/values/${valueId}/`, "DELETE");
}


// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export function getSalesReport(filters = {}) {
    const params = buildParams(filters);
    return request(`${BASE_URL}/reports/sales/?${params}`);
}
export function exportSalesReport(format) { window.open(`${BASE_URL}/reports/sales/export/${format}/`, "_blank"); }

export function getProductReport(filters = {}) {
    const params = buildParams(filters);
    return request(`${BASE_URL}/reports/products/?${params}`);
}
export function exportProductReport(format) { window.open(`${BASE_URL}/reports/products/export/${format}/`, "_blank"); }

export function getStockReport(filters = {}) {
    const params = buildParams(filters);
    return request(`${BASE_URL}/reports/stock/?${params}`);
}
export function exportStockReport(format) { window.open(`${BASE_URL}/reports/stock/export/${format}/`, "_blank"); }

export function getTaxReport(filters = {}) {
    const params = buildParams(filters);
    return request(`${BASE_URL}/reports/tax/?${params}`);
}
export function exportTaxReport(format) { window.open(`${BASE_URL}/reports/tax/export/${format}/`, "_blank"); }


// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════

export function getSettings() {
    return request(`${BASE_URL}/settings/`);
}

export async function updateSettings(formData) {
    return mutateForm(`${BASE_URL}/settings/`, "PUT", formData);
}


// ═══════════════════════════════════════════════════════════════════════════════
// USERS & ROLES
// ═══════════════════════════════════════════════════════════════════════════════

export function getUsers(filters = {}) {
    const params = buildParams(filters);
    return request(`${BASE_URL}/users/?${params}`);
}
export async function createUser(data) { return mutate(`${BASE_URL}/users/`, "POST", data); }
export async function updateUser(id, data) { return mutate(`${BASE_URL}/users/${id}/`, "PUT", data); }
export async function deleteUser2(id) { return mutate(`${BASE_URL}/users/${id}/`, "DELETE"); }

export function getRoles(filters = {}) {
    const params = buildParams(filters);
    return request(`${BASE_URL}/roles/?${params}`);
}
export async function createRole(data) { return mutate(`${BASE_URL}/roles/`, "POST", data); }
export async function updateRole(id, data) { return mutate(`${BASE_URL}/roles/${id}/`, "PUT", data); }
export async function deleteRole(id) { return mutate(`${BASE_URL}/roles/${id}/`, "DELETE"); }


// ═══════════════════════════════════════════════════════════════════════════════
// TAXES & PAYMENT METHODS
// ═══════════════════════════════════════════════════════════════════════════════

export function getTaxes(filters = {}) {
    const params = buildParams(filters);
    return request(`${BASE_URL}/taxes/?${params}`);
}
export async function createTax(data) { return mutate(`${BASE_URL}/taxes/`, "POST", data); }
export async function updateTax(id, data) { return mutate(`${BASE_URL}/taxes/${id}/`, "PUT", data); }
export async function deleteTax(id) { return mutate(`${BASE_URL}/taxes/${id}/`, "DELETE"); }

export function getPaymentMethods(filters = {}) {
    const params = buildParams(filters);
    return request(`${BASE_URL}/payment-methods/?${params}`);
}
export async function createPaymentMethod(data) { return mutate(`${BASE_URL}/payment-methods/`, "POST", data); }
export async function updatePaymentMethod(id, data) { return mutate(`${BASE_URL}/payment-methods/${id}/`, "PUT", data); }
export async function deletePaymentMethod(id) { return mutate(`${BASE_URL}/payment-methods/${id}/`, "DELETE"); }


// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOMERS
// ═══════════════════════════════════════════════════════════════════════════════

export function getCustomers(filters = {}) {
    const params = buildParams(filters);
    return request(`${BASE_URL}/customers/?${params}`);
}
export async function createCustomer(data) { return mutate(`${BASE_URL}/customers/`, "POST", data); }
export async function updateCustomer(id, data) { return mutate(`${BASE_URL}/customers/${id}/`, "PUT", data); }
export async function deleteCustomer(id) { return mutate(`${BASE_URL}/customers/${id}/`, "DELETE"); }


// ═══════════════════════════════════════════════════════════════════════════════
// SUPPLIERS
// ═══════════════════════════════════════════════════════════════════════════════

export function getSuppliers() { return request(`${BASE_URL}/inventory/suppliers/`); }
export async function createSupplier(data) { return mutate(`${BASE_URL}/inventory/suppliers/`, "POST", data); }
export async function updateSupplier(id, data) { return mutate(`${BASE_URL}/inventory/suppliers/${id}/`, "PUT", data); }
export async function deleteSupplier(id) { return mutate(`${BASE_URL}/inventory/suppliers/${id}/`, "DELETE"); }


// ═══════════════════════════════════════════════════════════════════════════════
// PURCHASE ORDERS
// ═══════════════════════════════════════════════════════════════════════════════

export function getPurchaseOrders(filters = {}) {
    const params = buildParams(filters);
    return request(`${BASE_URL}/inventory/purchase-orders/?${params}`);
}
export function getPurchaseOrder(orderNo) { return request(`${BASE_URL}/inventory/purchase-orders/${orderNo}/`); }
export async function createPurchaseOrder(data) { return mutate(`${BASE_URL}/inventory/purchase-order/0/`, "POST", data); }
export async function receivePurchaseOrder(orderNo, data) { return mutate(`${BASE_URL}/inventory/purchase-orders/${orderNo}/receive/`, "POST", data); }
export async function cancelPurchaseOrder(orderNo) { return mutate(`${BASE_URL}/inventory/purchase-orders/${orderNo}/cancel/`, "POST"); }
export async function returnPurchaseOrder(orderNo, data) { return mutate(`${BASE_URL}/inventory/purchase-orders/${orderNo}/return/`, "POST", data); }

export function getPurchaseReturns() { return request(`${BASE_URL}/inventory/purchase-returns/`); }
export function getPurchaseReturn(id) { return request(`${BASE_URL}/inventory/purchase-returns/${id}/`); }
export function getPurchaseReturnDashboard() { return request(`${BASE_URL}/inventory/purchase-returns/dashboard/`); }


// ═══════════════════════════════════════════════════════════════════════════════
// CASH SESSIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function getCashSessions(filters = {}) {
    const params = buildParams(filters);
    return request(`${BASE_URL}/cash-sessions/?${params}`);
}


// ═══════════════════════════════════════════════════════════════════════════════
// ORDERS & REFUNDS
// ═══════════════════════════════════════════════════════════════════════════════

export function getOrderHistory(filters = {}) {
    const params = buildParams(filters);
    return request(`${BASE_URL}/order-history/?${params}`);
}
export function getOrderDetail(id) { return request(`${BASE_URL}/order-history/${id}/`); }
export function exportOrders(format) { window.open(`${BASE_URL}/order-history/export/${format}/`, "_blank"); }
export function getOrderStats() { return request(`${BASE_URL}/order-stats/`); }

export function getRefundHistory(filters = {}) {
    const params = buildParams(filters);
    return request(`${BASE_URL}/refund-history/?${params}`);
}
export function getRefundDetail(id) { return request(`${BASE_URL}/refund-history/detail/${id}/`); }
export function exportRefunds(format) { window.open(`${BASE_URL}/refund-history/export/${format}/`, "_blank"); }
