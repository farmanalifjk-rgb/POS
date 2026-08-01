/**
 * accounting.service.js — Service layer for Accounts, Journal, Ledger, Trial Balance, Balance Sheet, and Expenses
 */
import apiService from "./api.service.js";

class AccountingService {
  async getAccounts() {
    return apiService.get("/accounting/accounts/");
  }

  async getJournalEntries() {
    return apiService.get("/accounting/journal/");
  }

  async getLedger() {
    return apiService.get("/accounting/ledger/");
  }

  async getTrialBalance() {
    return apiService.get("/accounting/trial-balance/");
  }

  async getBalanceSheet() {
    return apiService.get("/accounting/balance-sheet/");
  }

  async getExpenses() {
    return apiService.get("/accounting/expenses/");
  }

  async createExpense(expenseData) {
    return apiService.post("/accounting/expenses/", expenseData);
  }
}

export const accountingService = new AccountingService();
export default accountingService;
