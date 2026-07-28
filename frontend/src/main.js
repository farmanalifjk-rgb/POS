import "./style.css";

import { createIcons, icons } from "lucide";

// ── Auth (must be first) ──────────────────────────────────────────────────────
import Auth, { API_BASE_URL } from "./modules/core/controllers/Auth.js";
import "./modules/core/controllers/Login.js";
import { LoginPage } from "./modules/core/pages/LoginPage.js";

// Keep authenticated API requests consistent across every legacy screen.
// Modules may use fetch directly; this wrapper supplies the current token only
// to this application's API and returns the user to login on an expired session.
const nativeFetch = window.fetch.bind(window);
window.fetch = async (input, init = {}) => {
  const url = typeof input === "string" ? input : input?.url || "";
  const isApiRequest = url.startsWith(API_BASE_URL) || url.startsWith("/api/");
  const isAuthenticationRequest = /\/api\/auth\/(login|verify-otp|resend-otp|expired-password-change)\/?$/.test(url);

  if (!isApiRequest || isAuthenticationRequest) return nativeFetch(input, init);

  const headers = new Headers(init.headers || (typeof input !== "string" ? input.headers : undefined));
  const token = Auth.getToken();
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Token ${token}`);

  const response = await nativeFetch(input, { ...init, headers });
  if (response.status === 401 && !url.includes("/api/auth/")) {
    Auth.clearToken();
    if (window.location.hash !== "#/login") window.location.hash = "#/login";
  }
  return response;
};

import { Dashboard } from "./modules/core/pages/Dashboard.js";
import { POSPage } from "./modules/core/pages/POSPage.js";
import { OrderHistoryPage } from "./modules/sales/pages/OrderHistoryPage.js";
import { InventoryPage } from "./modules/inventory/pages/InventoryPage.js";
import { MovementHistoryPage } from "./modules/inventory/pages/MovementHistoryPage.js";
import { AdjustmentPage } from "./modules/inventory/pages/AdjustmentPage.js";

// ── Inventory sub-pages ───────────────────────────────────────────────────────
import { InventoryValuationPage } from "./modules/reports/pages/InventoryValuationPage.js";
import { InventoryAnalyticsPage } from "./modules/reports/pages/InventoryAnalyticsPage.js";
import { InventoryReportsPage }   from "./modules/reports/pages/InventoryReportsPage.js";

// ── Catalog pages ─────────────────────────────────────────────────────────────
import { AllProductsPage } from "./modules/inventory/pages/AllProductsPage.js";
import { CategoriesPage } from "./modules/inventory/pages/CategoriesPage.js";
import { BrandsPage } from "./modules/inventory/pages/BrandsPage.js";
import { VariantsPage } from "./modules/inventory/pages/VariantsPage.js";

// ── Report pages ──────────────────────────────────────────────────────────────
import { SalesReportPage } from "./modules/reports/pages/SalesReportPage.js";
import { ProductReportPage } from "./modules/reports/pages/ProductReportPage.js";
import { StockReportPage } from "./modules/reports/pages/StockReportPage.js";
import { TaxReportPage } from "./modules/reports/pages/TaxReportPage.js";

// ── Phase 2: New report pages ──────────────────────────────────────────────────────
import { ProfitLossPage }     from "./modules/reports/pages/ProfitLossPage.js";
import { CashFlowPage }       from "./modules/accounting/pages/CashFlowPage.js";
import { CustomerReportPage } from "./modules/reports/pages/CustomerReportPage.js";
import { SupplierReportPage } from "./modules/reports/pages/SupplierReportPage.js";
import { EmployeeReportPage } from "./modules/reports/pages/EmployeeReportPage.js";

// ── Configuration pages ───────────────────────────────────────────────────────
import { SettingsPage } from "./modules/core/pages/SettingsPage.js";
import { UsersPage } from "./modules/system/pages/UsersPage.js";
import { RolesPage } from "./modules/system/pages/RolesPage.js";
import { TaxesPage } from "./modules/system/pages/TaxesPage.js";
import { PaymentMethodsPage } from "./modules/system/pages/PaymentMethodsPage.js";

// ── New pages ─────────────────────────────────────────────────────────────────
import { CustomersPage }      from "./modules/sales/pages/CustomersPage.js";
import { SuppliersPage }      from "./modules/purchases/pages/SuppliersPage.js";
import { PurchasesPage }      from "./modules/purchases/pages/PurchasesPage.js";
import { PurchaseReturnsPage } from "./modules/purchases/pages/PurchaseReturnsPage.js";
import { CashSessionsPage }   from "./modules/sales/pages/CashSessionsPage.js";

// ── Phase 1: Enterprise pages ─────────────────────────────────────────────────────
import StoresPage from "./modules/system/pages/StoresPage.js";
import WarehousesPage         from "./modules/inventory/pages/WarehousesPage.js";
import { WarehouseTransfersPage } from "./modules/inventory/pages/WarehouseTransfersPage.js";
import { LocationsZonesPage }     from "./modules/inventory/pages/LocationsZonesPage.js";

// ── Phase 1: Security, Backup, DevTools pages ──────────────────────────────────
import { SecurityPage } from "./modules/system/pages/SecurityPage.js";
import { BackupPage }   from "./modules/system/pages/BackupPage.js";
import { DevToolsPage } from "./modules/system/pages/DevToolsPage.js";
import { HardwarePage } from "./modules/system/pages/HardwarePage.js";

// ── Phase 4: New Module Pages ────────────────────────────────────────────────
import { AccountingPage }       from "./modules/accounting/pages/AccountingPage.js";
import { JournalEntriesPage }   from "./modules/accounting/pages/JournalEntriesPage.js";
import { LedgerPage }           from "./modules/accounting/pages/LedgerPage.js";
import { TrialBalancePage }     from "./modules/accounting/pages/TrialBalancePage.js";
import { BalanceSheetPage }     from "./modules/accounting/pages/BalanceSheetPage.js";
import { ExpensesPage }         from "./modules/accounting/pages/ExpensesPage.js";

import { EmployeesPage }        from "./modules/hr/pages/EmployeesPage.js";
import { AttendancePage }       from "./modules/hr/pages/AttendancePage.js";
import { LeavePage }            from "./modules/hr/pages/LeavePage.js";
import { PayrollPage }          from "./modules/hr/pages/PayrollPage.js";
import { ShiftsPage }           from "./modules/hr/pages/ShiftsPage.js";

import { LoyaltyPage }          from "./modules/loyalty/pages/LoyaltyPage.js";
import { MembershipsPage }      from "./modules/loyalty/pages/MembershipsPage.js";
import { GiftCardsPage }        from "./modules/loyalty/pages/GiftCardsPage.js";
import { CouponsPage }          from "./modules/loyalty/pages/CouponsPage.js";
import { PromotionsPage }       from "./modules/loyalty/pages/PromotionsPage.js";

import { ApprovalsPage }        from "./modules/system/pages/ApprovalsPage.js";
import { NotificationsCenterPage } from "./modules/system/pages/NotificationsCenterPage.js";
import { StoreDashboardPage }   from "./modules/system/pages/StoreDashboardPage.js";

import { initializeSidebar } from "./components/Sidebar.js";

// ── Existing controllers ──────────────────────────────────────────────────────
import "./modules/core/controllers/pos.js";
import "./modules/sales/controllers/order-history.js";
import "./modules/inventory/controllers/Inventory.js";
import "./modules/inventory/controllers/Movements.js";
import "./modules/inventory/controllers/Adjustment.js";
import "./modules/inventory/controllers/AllProducts.js";
import "./modules/inventory/controllers/Categories.js";
import "./modules/inventory/controllers/Brands.js";
import "./modules/inventory/controllers/Variants.js";
import "./modules/reports/controllers/SalesReport.js";
import "./modules/reports/controllers/ProductReport.js";
import "./modules/reports/controllers/StockReport.js";
import "./modules/reports/controllers/TaxReport.js";
import "./modules/core/controllers/Settings.js";
import "./modules/system/controllers/Users.js";
import "./modules/system/controllers/Roles.js";
import "./modules/system/controllers/Taxes.js";
import "./modules/system/controllers/PaymentMethods.js";

// ── New controllers ──────────────────────────────────────────────────────────────────
import "./modules/core/controllers/Dashboard.js";
import "./modules/sales/controllers/Customers.js";
import "./modules/purchases/controllers/Suppliers.js";
import "./modules/purchases/controllers/Purchases.js";
import "./modules/purchases/controllers/PurchaseReturns.js";
import "./modules/sales/controllers/CashSessions.js";
import "./modules/reports/controllers/InventoryValuation.js";
import "./modules/reports/controllers/InventoryAnalytics.js";
import "./modules/reports/controllers/InventoryReports.js";

// ── Phase 1 controllers ──────────────────────────────────────────────────────────────
import "./modules/system/controllers/Stores.js";
import "./modules/inventory/controllers/Warehouses.js";
import "./modules/inventory/controllers/WarehouseTransfers.js";
import "./modules/system/controllers/Security.js";
import "./modules/system/controllers/Backup.js";
import "./modules/system/controllers/DevTools.js";
import "./modules/system/controllers/Hardware.js";

// ── Phase 2 controllers ──────────────────────────────────────────────────────────────
import "./modules/reports/controllers/ProfitLoss.js";
import "./modules/accounting/controllers/CashFlow.js";
import "./modules/reports/controllers/ReportsExtra.js";

// ── Phase 4 controllers ──────────────────────────────────────────────────────────────
import "./modules/accounting/controllers/Accounting.js";
import "./modules/accounting/controllers/JournalEntries.js";
import "./modules/accounting/controllers/Ledger.js";
import "./modules/accounting/controllers/TrialBalance.js";
import "./modules/accounting/controllers/BalanceSheet.js";
import "./modules/accounting/controllers/Expenses.js";

import "./modules/hr/controllers/Employees.js";
import "./modules/hr/controllers/Attendance.js";
import "./modules/hr/controllers/Leave.js";
import "./modules/hr/controllers/Payroll.js";
import "./modules/hr/controllers/Shifts.js";

import "./modules/loyalty/controllers/Loyalty.js";
import "./modules/loyalty/controllers/Memberships.js";
import "./modules/loyalty/controllers/GiftCards.js";
import "./modules/loyalty/controllers/Coupons.js";
import "./modules/loyalty/controllers/Promotions.js";

import "./modules/system/controllers/Approvals.js";
import "./modules/system/controllers/NotificationsCenter.js";
import "./modules/system/controllers/StoreDashboard.js";

// ── Router ────────────────────────────────────────────────────────────────────

function render(html, init) {
  const app = document.getElementById("app");
  
  // Preserve sidebar scroll position
  const oldNav = document.getElementById("sidebar-nav");
  const scrollTop = oldNav ? oldNav.scrollTop : 0;

  app.innerHTML = html;
  createIcons({ icons });
  initializeSidebar();
  
  // Restore sidebar scroll position
  const newNav = document.getElementById("sidebar-nav");
  if (newNav) newNav.scrollTop = scrollTop;

  init?.();
}

function router() {
  const route = window.location.hash.slice(1).split("?")[0];

  // ── Login (no auth required) ────────────────────────────────────────────────
  if (route === "/login" || route === "") {
    if (Auth.isLoggedIn()) {
      window.location.hash = "#/dashboard";
      return;
    }
    const app = document.getElementById("app");
    app.innerHTML = LoginPage();
    createIcons({ icons });
    window.initializeLogin?.();
    return;
  }

  // ── Auth guard ───────────────────────────────────────────────────────────────
  if (!Auth.guard()) return;

  // ── Dashboard ───────────────────────────────────────────────────────────────
  if (route === "/dashboard") {
    render(Dashboard(), () => window.loadDashboard?.());
    return;
  }

  // ── POS ─────────────────────────────────────────────────────────────────────
  if (route === "/pos") {
    render(POSPage(), () => window.initializePOS?.());
    return;
  }

  // ── Orders ──────────────────────────────────────────────────────────────────
  if (route === "/orders") {
    render(OrderHistoryPage(), () => window.initializeOrderHistory?.());
    return;
  }



  // ── Cash Sessions ───────────────────────────────────────────────────────────
  if (route === "/cash-sessions") {
    render(CashSessionsPage(), () => window.initializeCashSessions?.());
    return;
  }

  // ── Inventory Dashboard ─────────────────────────────────────────────────────
  if (route === "/inventory/dashboard") {
    render(InventoryPage(), () => window.initializeInventory?.());
    return;
  }

  // ── Inventory Products ──────────────────────────────────────────────────────
  if (route === "/inventory/products") {
    render(AllProductsPage(), () => window.initializeAllProducts?.());
    return;
  }

  // ── Stock Movements ─────────────────────────────────────────────────────────
  if (route === "/inventory/movements") {
    render(MovementHistoryPage(), () => window.initializeMovements?.());
    return;
  }

  // ── Stock Adjustments ───────────────────────────────────────────────────────
  if (route === "/inventory/adjustments") {
    render(AdjustmentPage(), () => window.initializeAdjustments?.());
    return;
  }

  // ── Inventory Valuation ─────────────────────────────────────────────────────
  if (route === "/inventory/valuation") {
    render(InventoryValuationPage(), () => window.initializeValuation?.());
    return;
  }

  // ── Inventory Reports ───────────────────────────────────────────────────────
  if (route === "/inventory/reports") {
    render(InventoryReportsPage(), () => window.initializeInventoryReports?.());
    return;
  }

  // ── Inventory Analytics ─────────────────────────────────────────────────────
  if (route === "/inventory/analytics") {
    render(InventoryAnalyticsPage(), () => window.initializeInventoryAnalytics?.());
    return;
  }

  // ── All Products ─────────────────────────────────────────────────────────────
  if (route === "/products") {
    render(AllProductsPage(), () => window.initializeAllProducts?.());
    return;
  }

  // ── Categories ───────────────────────────────────────────────────────────────
  if (route === "/categories") {
    render(CategoriesPage(), () => window.initializeCategories?.());
    return;
  }

  // ── Brands ───────────────────────────────────────────────────────────────────
  if (route === "/brands") {
    render(BrandsPage(), () => window.initializeBrands?.());
    return;
  }

  // ── Variants ─────────────────────────────────────────────────────────────────
  if (route === "/variants") {
    render(VariantsPage(), () => window.initializeVariants?.());
    return;
  }

  // ── Customers ────────────────────────────────────────────────────────────────
  if (route === "/customers") {
    render(CustomersPage(), () => window.initializeCustomers?.());
    return;
  }

  // ── Suppliers ────────────────────────────────────────────────────────────────
  if (route === "/suppliers") {
    render(SuppliersPage(), () => window.initializeSuppliers?.());
    return;
  }

  // ── Purchase Orders ──────────────────────────────────────────────────────────
  if (route === "/purchases") {
    render(PurchasesPage(), () => window.initializePurchases?.());
    return;
  }

  // ── Purchase Returns ─────────────────────────────────────────────────────────
  if (route === "/purchase-returns") {
    render(PurchaseReturnsPage(), () => window.initializePurchaseReturns?.());
    return;
  }

  // ── Sales Report ─────────────────────────────────────────────────────────────
  if (route === "/reports/sales") {
    render(SalesReportPage(), () => window.initializeSalesReport?.());
    return;
  }

  // ── Product Report ───────────────────────────────────────────────────────────
  if (route === "/reports/products") {
    render(ProductReportPage(), () => window.initializeProductReport?.());
    return;
  }

  // ── Stock Report ─────────────────────────────────────────────────────────────
  if (route === "/reports/stock") {
    render(StockReportPage(), () => window.initializeStockReport?.());
    return;
  }

  // ── Tax Report ───────────────────────────────────────────────────────────────
  if (route === "/reports/tax") {
    render(TaxReportPage(), () => window.initializeTaxReport?.());
    return;
  }

  // ── Settings ─────────────────────────────────────────────────────────────────
  if (route === "/settings") {
    render(SettingsPage(), () => window.initializeSettings?.());
    return;
  }

  // ── Users ────────────────────────────────────────────────────────────────────
  if (route === "/users") {
    render(UsersPage(), () => window.initializeUsers?.());
    return;
  }

  // ── Roles & Permissions ──────────────────────────────────────────────────────
  if (route === "/roles") {
    render(RolesPage(), () => window.initializeRoles?.());
    return;
  }

  // ── Taxes ────────────────────────────────────────────────────────────────────
  if (route === "/taxes") {
    render(TaxesPage(), () => window.initializeTaxes?.());
    return;
  }

  // ── Payment Methods ──────────────────────────────────────────────────────────
  if (route === "/payments") {
    render(PaymentMethodsPage(), () => window.initializePaymentMethods?.());
    return;
  }

  // ── Enterprise: Stores ───────────────────────────────────────────────────────
  if (route === "/enterprise/stores") {
    render(StoresPage(), () => window.initializeStores?.());
    return;
  }

  // ── Enterprise: Warehouses ───────────────────────────────────────────────────
  if (route === "/enterprise/warehouses") {
    render(WarehousesPage(), () => window.initializeWarehouses?.());
    return;
  }

  // ── Enterprise: Stock Transfers ──────────────────────────────────────────────
  if (route === "/enterprise/transfers") {
    render(WarehouseTransfersPage(), () => window.initializeWarehouseTransfers?.());
    return;
  }

  // ── Enterprise: Locations & Bins ─────────────────────────────────────────────
  if (route === "/enterprise/locations") {
    render(LocationsZonesPage(), () => window.initializeLocationsZones?.());
    return;
  }

  // ── Security Center ───────────────────────────────────────────────────────────
  if (route === "/security" || route === "/security/sessions" || route === "/security/audit" || route === "/security/tokens" || route === "/security/devices") {
    const tab = route.split("/security/")[1] || "sessions";
    render(SecurityPage(), () => window.initializeSecurity?.(tab));
    return;
  }

  // ── Backup & Restore ──────────────────────────────────────────────────────────
  if (route === "/backup") {
    render(BackupPage(), () => window.initializeBackup?.());
    return;
  }

  // ── Developer Tools ───────────────────────────────────────────────────────────
  if (route === "/dev-tools") {
    render(DevToolsPage(), () => window.initializeDevTools?.());
    return;
  }

  // ── Hardware Setup ────────────────────────────────────────────────────────────
  if (route === "/hardware") {
    render(HardwarePage(), () => window.initializeHardware?.());
    return;
  }

  // ── New Reports ──────────────────────────────────────────────────────────────
  if (route === "/reports/profit-loss") {
    render(ProfitLossPage(), () => window.initializeProfitLoss?.());
    return;
  }
  if (route === "/reports/cash-flow") {
    render(CashFlowPage(), () => window.initializeCashFlow?.());
    return;
  }
  if (route === "/reports/customer") {
    render(CustomerReportPage(), () => window.initializeCustomerReport?.());
    return;
  }
  if (route === "/reports/supplier") {
    render(SupplierReportPage(), () => window.initializeSupplierReport?.());
    return;
  }
  if (route === "/reports/employee") {
    render(EmployeeReportPage(), () => window.initializeEmployeeReport?.());
    return;
  }

  // ── Phase 4 Routes ─────────────────────────────────────────────────────────
  // Accounting
  if (route === "/accounting/accounts") {
    render(AccountingPage(), () => window.initializeAccounting?.());
    return;
  }
  if (route === "/accounting/journal") {
    render(JournalEntriesPage(), () => window.initializeJournalEntries?.());
    return;
  }
  if (route === "/accounting/ledger") {
    render(LedgerPage(), () => window.initializeLedger?.());
    return;
  }
  if (route === "/accounting/trial-balance") {
    render(TrialBalancePage(), () => window.initializeTrialBalance?.());
    return;
  }
  if (route === "/accounting/balance-sheet") {
    render(BalanceSheetPage(), () => window.initializeBalanceSheet?.());
    return;
  }
  if (route === "/accounting/expenses") {
    render(ExpensesPage(), () => window.initializeExpenses?.());
    return;
  }

  // HR
  if (route === "/hr/employees") {
    render(EmployeesPage(), () => window.initializeEmployees?.());
    return;
  }
  if (route === "/hr/attendance") {
    render(AttendancePage(), () => window.initializeAttendance?.());
    return;
  }
  if (route === "/hr/leave") {
    render(LeavePage(), () => window.initializeLeave?.());
    return;
  }
  if (route === "/hr/payroll") {
    render(PayrollPage(), () => window.initializePayroll?.());
    return;
  }
  if (route === "/hr/shifts") {
    render(ShiftsPage(), () => window.initializeShifts?.());
    return;
  }

  // Loyalty
  if (route === "/loyalty") {
    render(LoyaltyPage(), () => window.initializeLoyalty?.());
    return;
  }
  if (route === "/loyalty/memberships") {
    render(MembershipsPage(), () => window.initializeMemberships?.());
    return;
  }
  if (route === "/loyalty/gift-cards") {
    render(GiftCardsPage(), () => window.initializeGiftCards?.());
    return;
  }
  if (route === "/loyalty/coupons") {
    render(CouponsPage(), () => window.initializeCoupons?.());
    return;
  }
  if (route === "/loyalty/promotions") {
    render(PromotionsPage(), () => window.initializePromotions?.());
    return;
  }

  // Operations
  if (route === "/workflow/approvals") {
    render(ApprovalsPage(), () => window.initializeApprovals?.());
    return;
  }
  if (route === "/notifications") {
    render(NotificationsCenterPage(), () => window.initializeNotificationsCenter?.());
    return;
  }
  if (route === "/enterprise/dashboard") {
    render(StoreDashboardPage(), () => window.initializeStoreDashboard?.());
    return;
  }

  // ── Default: Dashboard ───────────────────────────────────────────────────────
  render(Dashboard(), () => window.loadDashboard?.());
}

window.addEventListener("hashchange", router);
router();
