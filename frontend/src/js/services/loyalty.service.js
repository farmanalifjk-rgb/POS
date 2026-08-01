/**
 * loyalty.service.js — Service layer for Loyalty, Memberships, Gift Cards, Coupons, and Promotions
 */
import apiService from "./api.service.js";

class LoyaltyService {
  async getLoyaltyProgram() {
    return apiService.get("/loyalty/");
  }

  async getMemberships() {
    return apiService.get("/loyalty/memberships/");
  }

  async getGiftCards() {
    return apiService.get("/gift-cards/");
  }

  async getCoupons() {
    return apiService.get("/loyalty/coupons/");
  }

  async getPromotions() {
    return apiService.get("/loyalty/promotions/");
  }
}

export const loyaltyService = new LoyaltyService();
export default loyaltyService;
