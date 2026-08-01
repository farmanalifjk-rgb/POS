/**
 * customer.service.js — Service layer for Customers, Customer 360°, and Credit Limits
 */
import apiService from "./api.service.js";

class CustomerService {
  async getCustomers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/customers/?${query}` : "/customers/";
    return apiService.get(endpoint);
  }

  async getCustomer(id) {
    return apiService.get(`/customers/${id}/`);
  }

  async createCustomer(customerData) {
    return apiService.post("/customers/", customerData);
  }

  async updateCustomer(id, customerData) {
    return apiService.put(`/customers/${id}/`, customerData);
  }

  async deleteCustomer(id) {
    return apiService.delete(`/customers/${id}/`);
  }

  async getCustomer360(id) {
    return apiService.get(`/customers2/customers/${id}/detail/`);
  }

  async getCreditLimits() {
    return apiService.get("/customers2/credit-limits/");
  }
}

export const customerService = new CustomerService();
export default customerService;
