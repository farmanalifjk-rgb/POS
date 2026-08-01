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


// ── Route Configuration ────────────────────────────────────────────────────────
const routeConfig = [
  // Core
  { path: "/dashboard", page: Dashboard, init: () => window.loadDashboard?.() },
  { path: "/pos", page: POSPage, init: () => window.initializePOS?.() },
  { path: "/orders", page: OrderHistoryPage, init: () => window.initializeOrderHistory?.() },
  { path: "/parked-orders", page: OrderHistoryPage, init: () => window.initializeOrderHistory?.() },
  { path: "/receipt-designer", page: SettingsPage, init: () => window.initializeSettings?.() },
  { path: "/cash-sessions", page: CashSessionsPage, init: () => window.initializeCashSessions?.() },

  // SaaS Admin
  { path: "/subscription", page: SettingsPage, init: () => window.initializeSettings?.() },
  { path: "/tenants", page: StoresPage, init: () => window.initializeStores?.() },

  // Catalog
  { path: "/products", page: AllProductsPage, init: () => window.initializeAllProducts?.() },
  { path: "/categories", page: CategoriesPage, init: () => window.initializeCategories?.() },
  { path: "/brands", page: BrandsPage, init: () => window.initializeBrands?.() },
  { path: "/variants", page: VariantsPage, init: () => window.initializeVariants?.() },
  { path: "/bundles", page: AllProductsPage, init: () => window.initializeAllProducts?.() },
  { path: "/serials-batches", page: AllProductsPage, init: () => window.initializeAllProducts?.() },
  { path: "/price-lists", page: AllProductsPage, init: () => window.initializeAllProducts?.() },

  // Inventory & Warehouse
  { path: "/inventory/dashboard", page: InventoryPage, init: () => window.initializeInventory?.() },
  { path: "/inventory/products", page: AllProductsPage, init: () => window.initializeAllProducts?.() },
  { path: "/inventory/movements", page: MovementHistoryPage, init: () => window.initializeMovements?.() },
  { path: "/inventory/adjustments", page: AdjustmentPage, init: () => window.initializeAdjustments?.() },
  { path: "/inventory/valuation", page: InventoryValuationPage, init: () => window.initializeValuation?.() },
  { path: "/inventory/reports", page: InventoryReportsPage, init: () => window.initializeInventoryReports?.() },
  { path: "/inventory/analytics", page: InventoryAnalyticsPage, init: () => window.initializeInventoryAnalytics?.() },
  { path: "/analytics", page: InventoryAnalyticsPage, init: () => window.initializeInventoryAnalytics?.() },
  { path: "/enterprise/warehouses", page: WarehousesPage, init: () => window.initializeWarehouses?.() },
  { path: "/enterprise/transfers", page: WarehouseTransfersPage, init: () => window.initializeWarehouseTransfers?.() },
  { path: "/stock-transfers", page: WarehouseTransfersPage, init: () => window.initializeWarehouseTransfers?.() },
  { path: "/enterprise/locations", page: LocationsZonesPage, init: () => window.initializeLocationsZones?.() },
  { path: "/put-away", page: MovementHistoryPage, init: () => window.initializeMovements?.() },
  { path: "/replenishment", page: AdjustmentPage, init: () => window.initializeAdjustments?.() },
  { path: "/cycle-count", page: AdjustmentPage, init: () => window.initializeAdjustments?.() },
  { path: "/abc-analysis", page: InventoryAnalyticsPage, init: () => window.initializeInventoryAnalytics?.() },
  { path: "/inventory-aging", page: InventoryValuationPage, init: () => window.initializeValuation?.() },
  { path: "/reorder-alerts", page: InventoryReportsPage, init: () => window.initializeInventoryReports?.() },

  // Purchasing & Suppliers
  { path: "/customers", page: CustomersPage, init: () => window.initializeCustomers?.() },
  { path: "/customer-360", page: CustomersPage, init: () => window.initializeCustomers?.() },
  { path: "/credit-limits", page: CustomersPage, init: () => window.initializeCustomers?.() },
  { path: "/suppliers", page: SuppliersPage, init: () => window.initializeSuppliers?.() },
  { path: "/purchases", page: PurchasesPage, init: () => window.initializePurchases?.() },
  { path: "/goods-receipt", page: PurchasesPage, init: () => window.initializePurchases?.() },
  { path: "/purchase-returns", page: PurchaseReturnsPage, init: () => window.initializePurchaseReturns?.() },

  // HR & Payroll
  { path: "/employees", page: EmployeesPage, init: () => window.initializeEmployees?.() },
  { path: "/hr/employees", page: EmployeesPage, init: () => window.initializeEmployees?.() },
  { path: "/hr/attendance", page: AttendancePage, init: () => window.initializeAttendance?.() },
  { path: "/shifts", page: ShiftsPage, init: () => window.initializeShifts?.() },
  { path: "/hr/shifts", page: ShiftsPage, init: () => window.initializeShifts?.() },
  { path: "/hr/leave", page: LeavePage, init: () => window.initializeLeave?.() },
  { path: "/payroll", page: PayrollPage, init: () => window.initializePayroll?.() },
  { path: "/hr/payroll", page: PayrollPage, init: () => window.initializePayroll?.() },
  { path: "/commissions", page: PayrollPage, init: () => window.initializePayroll?.() },

  // Accounting
  { path: "/accounting/accounts", page: AccountingPage, init: () => window.initializeAccounting?.() },
  { path: "/accounting/journal", page: JournalEntriesPage, init: () => window.initializeJournalEntries?.() },
  { path: "/accounting/ledger", page: LedgerPage, init: () => window.initializeLedger?.() },
  { path: "/accounting/trial-balance", page: TrialBalancePage, init: () => window.initializeTrialBalance?.() },
  { path: "/accounting/balance-sheet", page: BalanceSheetPage, init: () => window.initializeBalanceSheet?.() },
  { path: "/accounting/expenses", page: ExpensesPage, init: () => window.initializeExpenses?.() },

  // Loyalty & Payments
  { path: "/loyalty", page: LoyaltyPage, init: () => window.initializeLoyalty?.() },
  { path: "/loyalty/memberships", page: MembershipsPage, init: () => window.initializeMemberships?.() },
  { path: "/gift-cards", page: GiftCardsPage, init: () => window.initializeGiftCards?.() },
  { path: "/loyalty/gift-cards", page: GiftCardsPage, init: () => window.initializeGiftCards?.() },
  { path: "/loyalty/coupons", page: CouponsPage, init: () => window.initializeCoupons?.() },
  { path: "/loyalty/promotions", page: PromotionsPage, init: () => window.initializePromotions?.() },
  { path: "/reconciliation", page: LedgerPage, init: () => window.initializeLedger?.() },

  // Reports
  { path: "/reports/sales", page: SalesReportPage, init: () => window.initializeSalesReport?.() },
  { path: "/z-reports", page: SalesReportPage, init: () => window.initializeSalesReport?.() },
  { path: "/reports/products", page: ProductReportPage, init: () => window.initializeProductReport?.() },
  { path: "/reports/stock", page: StockReportPage, init: () => window.initializeStockReport?.() },
  { path: "/reports/tax", page: TaxReportPage, init: () => window.initializeTaxReport?.() },
  { path: "/reports/profit-loss", page: ProfitLossPage, init: () => window.initializeProfitLoss?.() },
  { path: "/reports/cash-flow", page: CashFlowPage, init: () => window.initializeCashFlow?.() },
  { path: "/reports/customer", page: CustomerReportPage, init: () => window.initializeCustomerReport?.() },
  { path: "/reports/supplier", page: SupplierReportPage, init: () => window.initializeSupplierReport?.() },
  { path: "/reports/employee", page: EmployeeReportPage, init: () => window.initializeEmployeeReport?.() },

  // Fiscal
  { path: "/fiscal-invoices", page: TaxReportPage, init: () => window.initializeTaxReport?.() },
  { path: "/fiscal-devices", page: HardwarePage, init: () => window.initializeHardware?.() },

  // System & Settings
  { path: "/settings", page: SettingsPage, init: () => window.initializeSettings?.() },
  { path: "/users", page: UsersPage, init: () => window.initializeUsers?.() },
  { path: "/roles", page: RolesPage, init: () => window.initializeRoles?.() },
  { path: "/my-permissions", page: RolesPage, init: () => window.initializeRoles?.() },
  { path: "/taxes", page: TaxesPage, init: () => window.initializeTaxes?.() },
  { path: "/tax-rates", page: TaxesPage, init: () => window.initializeTaxes?.() },
  { path: "/payments", page: PaymentMethodsPage, init: () => window.initializePaymentMethods?.() },
  { path: "/enterprise/stores", page: StoresPage, init: () => window.initializeStores?.() },
  { path: "/branches", page: StoresPage, init: () => window.initializeStores?.() },
  { path: "/locale", page: SettingsPage, init: () => window.initializeSettings?.() },
  { path: "/currencies", page: SettingsPage, init: () => window.initializeSettings?.() },

  // Operations & Security
  { path: "/workflow/approvals", page: ApprovalsPage, init: () => window.initializeApprovals?.() },
  { path: "/notifications", page: NotificationsCenterPage, init: () => window.initializeNotificationsCenter?.() },
  { path: "/alert-rules", page: NotificationsCenterPage, init: () => window.initializeNotificationsCenter?.() },
  { path: "/enterprise/dashboard", page: StoreDashboardPage, init: () => window.initializeStoreDashboard?.() },
  { path: "/audit", page: SecurityPage, init: () => window.initializeSecurity?.("audit") },
  { path: "/activity", page: SecurityPage, init: () => window.initializeSecurity?.("audit") },

  // Integrations & System
  { path: "/integrations", page: DevToolsPage, init: () => window.initializeDevTools?.() },
  { path: "/sync-logs", page: DevToolsPage, init: () => window.initializeDevTools?.() },
  { path: "/sync-queue", page: DevToolsPage, init: () => window.initializeDevTools?.() },
  { path: "/backup", page: BackupPage, init: () => window.initializeBackup?.() },
  { path: "/dev-tools", page: DevToolsPage, init: () => window.initializeDevTools?.() },
  { path: "/hardware", page: HardwarePage, init: () => window.initializeHardware?.() },

  // AI
  { path: "/assistant", page: Dashboard, init: () => window.loadDashboard?.() },
  { path: "/reorder-suggestions", page: InventoryAnalyticsPage, init: () => window.initializeInventoryAnalytics?.() }
];

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

  // ── Security Center ───────────────────────────────────────────────────────────
  if (route.startsWith("/security")) {
    const tab = route.split("/security/")[1] || "sessions";
    render(SecurityPage(), () => window.initializeSecurity?.(tab));
    return;
  }

  // Match standard routes
  const matchedRoute = routeConfig.find(r => r.path === route);
  if (matchedRoute) {
    render(matchedRoute.page(), matchedRoute.init);
    return;
  }

  // ── Default: Dashboard ───────────────────────────────────────────────────────
  render(Dashboard(), () => window.loadDashboard?.());
}

window.addEventListener("hashchange", router);
router();
