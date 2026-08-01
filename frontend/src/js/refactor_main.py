import re

with open('e:/CODING/POS/Base44/POS/frontend/src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Separate imports/setup from the router function
parts = content.split('function router() {')
pre_router = parts[0]
post_router = 'function router() {' + parts[1]

# We want to replace the body of the `router()` function with a loop over a config array.
# First, let's extract the `render` function from `pre_router`... wait, `render` is in `post_router`.

# Let's write a new router body
new_router = """
// ── Route Configuration ────────────────────────────────────────────────────────
const routeConfig = [
  { path: "/dashboard", page: Dashboard, init: () => window.loadDashboard?.() },
  { path: "/pos", page: POSPage, init: () => window.initializePOS?.() },
  { path: "/orders", page: OrderHistoryPage, init: () => window.initializeOrderHistory?.() },
  { path: "/cash-sessions", page: CashSessionsPage, init: () => window.initializeCashSessions?.() },
  { path: "/inventory/dashboard", page: InventoryPage, init: () => window.initializeInventory?.() },
  { path: "/inventory/products", page: AllProductsPage, init: () => window.initializeAllProducts?.() },
  { path: "/inventory/movements", page: MovementHistoryPage, init: () => window.initializeMovements?.() },
  { path: "/inventory/adjustments", page: AdjustmentPage, init: () => window.initializeAdjustments?.() },
  { path: "/inventory/valuation", page: InventoryValuationPage, init: () => window.initializeValuation?.() },
  { path: "/inventory/reports", page: InventoryReportsPage, init: () => window.initializeInventoryReports?.() },
  { path: "/inventory/analytics", page: InventoryAnalyticsPage, init: () => window.initializeInventoryAnalytics?.() },
  { path: "/products", page: AllProductsPage, init: () => window.initializeAllProducts?.() },
  { path: "/categories", page: CategoriesPage, init: () => window.initializeCategories?.() },
  { path: "/brands", page: BrandsPage, init: () => window.initializeBrands?.() },
  { path: "/variants", page: VariantsPage, init: () => window.initializeVariants?.() },
  { path: "/customers", page: CustomersPage, init: () => window.initializeCustomers?.() },
  { path: "/suppliers", page: SuppliersPage, init: () => window.initializeSuppliers?.() },
  { path: "/purchases", page: PurchasesPage, init: () => window.initializePurchases?.() },
  { path: "/purchase-returns", page: PurchaseReturnsPage, init: () => window.initializePurchaseReturns?.() },
  { path: "/reports/sales", page: SalesReportPage, init: () => window.initializeSalesReport?.() },
  { path: "/reports/products", page: ProductReportPage, init: () => window.initializeProductReport?.() },
  { path: "/reports/stock", page: StockReportPage, init: () => window.initializeStockReport?.() },
  { path: "/reports/tax", page: TaxReportPage, init: () => window.initializeTaxReport?.() },
  { path: "/settings", page: SettingsPage, init: () => window.initializeSettings?.() },
  { path: "/users", page: UsersPage, init: () => window.initializeUsers?.() },
  { path: "/roles", page: RolesPage, init: () => window.initializeRoles?.() },
  { path: "/taxes", page: TaxesPage, init: () => window.initializeTaxes?.() },
  { path: "/payments", page: PaymentMethodsPage, init: () => window.initializePaymentMethods?.() },
  { path: "/enterprise/stores", page: StoresPage, init: () => window.initializeStores?.() },
  { path: "/enterprise/warehouses", page: WarehousesPage, init: () => window.initializeWarehouses?.() },
  { path: "/enterprise/transfers", page: WarehouseTransfersPage, init: () => window.initializeWarehouseTransfers?.() },
  { path: "/enterprise/locations", page: LocationsZonesPage, init: () => window.initializeLocationsZones?.() },
  { path: "/backup", page: BackupPage, init: () => window.initializeBackup?.() },
  { path: "/dev-tools", page: DevToolsPage, init: () => window.initializeDevTools?.() },
  { path: "/hardware", page: HardwarePage, init: () => window.initializeHardware?.() },
  { path: "/reports/profit-loss", page: ProfitLossPage, init: () => window.initializeProfitLoss?.() },
  { path: "/reports/cash-flow", page: CashFlowPage, init: () => window.initializeCashFlow?.() },
  { path: "/reports/customer", page: CustomerReportPage, init: () => window.initializeCustomerReport?.() },
  { path: "/reports/supplier", page: SupplierReportPage, init: () => window.initializeSupplierReport?.() },
  { path: "/reports/employee", page: EmployeeReportPage, init: () => window.initializeEmployeeReport?.() },
  { path: "/accounting/accounts", page: AccountingPage, init: () => window.initializeAccounting?.() },
  { path: "/accounting/journal", page: JournalEntriesPage, init: () => window.initializeJournalEntries?.() },
  { path: "/accounting/ledger", page: LedgerPage, init: () => window.initializeLedger?.() },
  { path: "/accounting/trial-balance", page: TrialBalancePage, init: () => window.initializeTrialBalance?.() },
  { path: "/accounting/balance-sheet", page: BalanceSheetPage, init: () => window.initializeBalanceSheet?.() },
  { path: "/accounting/expenses", page: ExpensesPage, init: () => window.initializeExpenses?.() },
  { path: "/hr/employees", page: EmployeesPage, init: () => window.initializeEmployees?.() },
  { path: "/hr/attendance", page: AttendancePage, init: () => window.initializeAttendance?.() },
  { path: "/hr/leave", page: LeavePage, init: () => window.initializeLeave?.() },
  { path: "/hr/payroll", page: PayrollPage, init: () => window.initializePayroll?.() },
  { path: "/hr/shifts", page: ShiftsPage, init: () => window.initializeShifts?.() },
  { path: "/loyalty", page: LoyaltyPage, init: () => window.initializeLoyalty?.() },
  { path: "/loyalty/memberships", page: MembershipsPage, init: () => window.initializeMemberships?.() },
  { path: "/loyalty/gift-cards", page: GiftCardsPage, init: () => window.initializeGiftCards?.() },
  { path: "/loyalty/coupons", page: CouponsPage, init: () => window.initializeCoupons?.() },
  { path: "/loyalty/promotions", page: PromotionsPage, init: () => window.initializePromotions?.() },
  { path: "/workflow/approvals", page: ApprovalsPage, init: () => window.initializeApprovals?.() },
  { path: "/notifications", page: NotificationsCenterPage, init: () => window.initializeNotificationsCenter?.() },
  { path: "/enterprise/dashboard", page: StoreDashboardPage, init: () => window.initializeStoreDashboard?.() }
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
"""

new_content = pre_router + new_router

with open('e:/CODING/POS/Base44/POS/frontend/src/main.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully refactored main.js")
