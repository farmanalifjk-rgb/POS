/**
 * product.service.js — Service layer for Products, Categories, Brands, Variants, Bundles, and Serials
 */
import apiService from "./api.service.js";

class ProductService {
  // ── Products ───────────────────────────────────────────────────────────────
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/products/?${query}` : "/products/";
    return apiService.get(endpoint);
  }

  async getProduct(id) {
    return apiService.get(`/products/${id}/`);
  }

  async createProduct(productData) {
    return apiService.post("/products/", productData);
  }

  async updateProduct(id, productData) {
    return apiService.put(`/products/${id}/`, productData);
  }

  async patchProduct(id, productData) {
    return apiService.patch(`/products/${id}/`, productData);
  }

  async deleteProduct(id) {
    return apiService.delete(`/products/${id}/`);
  }

  async getProductByBarcode(barcode) {
    return apiService.get(`/product/barcode/${barcode}/`);
  }

  // ── Categories ─────────────────────────────────────────────────────────────
  async getCategories() {
    return apiService.get("/categories/");
  }

  async getCategory(id) {
    return apiService.get(`/categories/${id}/`);
  }

  async createCategory(categoryData) {
    return apiService.post("/categories/", categoryData);
  }

  async updateCategory(id, categoryData) {
    return apiService.put(`/categories/${id}/`, categoryData);
  }

  async deleteCategory(id) {
    return apiService.delete(`/categories/${id}/`);
  }

  // ── Brands ─────────────────────────────────────────────────────────────────
  async getBrands() {
    return apiService.get("/brands/");
  }

  async createBrand(brandData) {
    return apiService.post("/brands/", brandData);
  }

  async updateBrand(id, brandData) {
    return apiService.put(`/brands/${id}/`, brandData);
  }

  async deleteBrand(id) {
    return apiService.delete(`/brands/${id}/`);
  }

  // ── Variants ───────────────────────────────────────────────────────────────
  async getVariants(productId) {
    return apiService.get(`/catalog/products/${productId}/variants/`);
  }

  async createVariant(productId, variantData) {
    return apiService.post(`/catalog/products/${productId}/variants/`, variantData);
  }

  async deleteVariant(id) {
    return apiService.delete(`/catalog/variants/${id}/`);
  }

  // ── Bundles & Combos ───────────────────────────────────────────────────────
  async getBundles() {
    return apiService.get("/catalog/bundles/");
  }

  async createBundle(bundleData) {
    return apiService.post("/catalog/bundles/", bundleData);
  }

  // ── Serials & Batches ──────────────────────────────────────────────────────
  async getSerials() {
    return apiService.get("/catalog/serials/");
  }

  async getBatches() {
    return apiService.get("/catalog/batches/");
  }
}

export const productService = new ProductService();
export default productService;
