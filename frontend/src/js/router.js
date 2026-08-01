export const routes = [
  { paths: [""/login", """) {
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
  if ("/dashboard"], page: Dashboard, init: () => window.loadDashboard?.() },
  { paths: [""/pos"], page: POSPage, init: () => window.initializePOS?.() },
  { paths: [""/orders"], page: OrderHistoryPage, init: () => window.initializeOrderHistory?.() },
  { paths: [""/cash-sessions"], page: CashSessionsPage, init: () => window.initializeCashSessions?.() },
  { paths: [""/inventory/dashboard"], page: InventoryPage, init: () => window.initializeInventory?.() },
  { paths: [""/inventory/products"], page: AllProductsPage, init: () => window.initializeAllProducts?.() },
  { paths: [""/inventory/movements"], page: MovementHistoryPage, init: () => window.initializeMovements?.() },
  { paths: [""/inventory/adjustments"], page: AdjustmentPage, init: () => window.initializeAdjustments?.() },
  { paths: [""/inventory/valuation"], page: InventoryValuationPage, init: () => window.initializeValuation?.() },
  { paths: [""/inventory/reports"], page: InventoryReportsPage, init: () => window.initializeInventoryReports?.() },
  { paths: [""/inventory/analytics"], page: InventoryAnalyticsPage, init: () => window.initializeInventoryAnalytics?.() },
  { paths: [""/products"], page: AllProductsPage, init: () => window.initializeAllProducts?.() },
  { paths: [""/categories"], page: CategoriesPage, init: () => window.initializeCategories?.() },
  { paths: [""/brands"], page: BrandsPage, init: () => window.initializeBrands?.() },
  { paths: [""/variants"], page: VariantsPage, init: () => window.initializeVariants?.() },
  { paths: [""/customers"], page: CustomersPage, init: () => window.initializeCustomers?.() },
  { paths: [""/suppliers"], page: SuppliersPage, init: () => window.initializeSuppliers?.() },
  { paths: [""/purchases"], page: PurchasesPage, init: () => window.initializePurchases?.() },
  { paths: [""/purchase-returns"], page: PurchaseReturnsPage, init: () => window.initializePurchaseReturns?.() },
  { paths: [""/reports/sales"], page: SalesReportPage, init: () => window.initializeSalesReport?.() },
  { paths: [""/reports/products"], page: ProductReportPage, init: () => window.initializeProductReport?.() },
  { paths: [""/reports/stock"], page: StockReportPage, init: () => window.initializeStockReport?.() },
  { paths: [""/reports/tax"], page: TaxReportPage, init: () => window.initializeTaxReport?.() },
  { paths: [""/settings"], page: SettingsPage, init: () => window.initializeSettings?.() },
  { paths: [""/users"], page: UsersPage, init: () => window.initializeUsers?.() },
  { paths: [""/roles"], page: RolesPage, init: () => window.initializeRoles?.() },
  { paths: [""/taxes"], page: TaxesPage, init: () => window.initializeTaxes?.() },
  { paths: [""/payments"], page: PaymentMethodsPage, init: () => window.initializePaymentMethods?.() },
  { paths: [""/enterprise/stores"], page: StoresPage, init: () => window.initializeStores?.() },
  { paths: [""/enterprise/warehouses"], page: WarehousesPage, init: () => window.initializeWarehouses?.() },
  { paths: [""/enterprise/transfers"], page: WarehouseTransfersPage, init: () => window.initializeWarehouseTransfers?.() },
  { paths: [""/enterprise/locations"], page: LocationsZonesPage, init: () => window.initializeLocationsZones?.() },
  { paths: [""/security", ""/security/sessions", ""/security/audit", ""/security/tokens", ""/security/devices") {
    const tab = route.split("/security/")[1]", "sessions";
    render(SecurityPage(), () => window.initializeSecurity?.(tab));
    return;
  }

  // ── Backup & Restore ──────────────────────────────────────────────────────────
  if ("/backup"], page: BackupPage, init: () => window.initializeBackup?.() },
  { paths: [""/dev-tools"], page: DevToolsPage, init: () => window.initializeDevTools?.() },
  { paths: [""/hardware"], page: HardwarePage, init: () => window.initializeHardware?.() },
  { paths: [""/reports/profit-loss"], page: ProfitLossPage, init: () => window.initializeProfitLoss?.() },
  { paths: [""/reports/cash-flow"], page: CashFlowPage, init: () => window.initializeCashFlow?.() },
  { paths: [""/reports/customer"], page: CustomerReportPage, init: () => window.initializeCustomerReport?.() },
  { paths: [""/reports/supplier"], page: SupplierReportPage, init: () => window.initializeSupplierReport?.() },
  { paths: [""/reports/employee"], page: EmployeeReportPage, init: () => window.initializeEmployeeReport?.() },
  { paths: [""/accounting/accounts"], page: AccountingPage, init: () => window.initializeAccounting?.() },
  { paths: [""/accounting/journal"], page: JournalEntriesPage, init: () => window.initializeJournalEntries?.() },
  { paths: [""/accounting/ledger"], page: LedgerPage, init: () => window.initializeLedger?.() },
  { paths: [""/accounting/trial-balance"], page: TrialBalancePage, init: () => window.initializeTrialBalance?.() },
  { paths: [""/accounting/balance-sheet"], page: BalanceSheetPage, init: () => window.initializeBalanceSheet?.() },
  { paths: [""/accounting/expenses"], page: ExpensesPage, init: () => window.initializeExpenses?.() },
  { paths: [""/hr/employees"], page: EmployeesPage, init: () => window.initializeEmployees?.() },
  { paths: [""/hr/attendance"], page: AttendancePage, init: () => window.initializeAttendance?.() },
  { paths: [""/hr/leave"], page: LeavePage, init: () => window.initializeLeave?.() },
  { paths: [""/hr/payroll"], page: PayrollPage, init: () => window.initializePayroll?.() },
  { paths: [""/hr/shifts"], page: ShiftsPage, init: () => window.initializeShifts?.() },
  { paths: [""/loyalty"], page: LoyaltyPage, init: () => window.initializeLoyalty?.() },
  { paths: [""/loyalty/memberships"], page: MembershipsPage, init: () => window.initializeMemberships?.() },
  { paths: [""/loyalty/gift-cards"], page: GiftCardsPage, init: () => window.initializeGiftCards?.() },
  { paths: [""/loyalty/coupons"], page: CouponsPage, init: () => window.initializeCoupons?.() },
  { paths: [""/loyalty/promotions"], page: PromotionsPage, init: () => window.initializePromotions?.() },
  { paths: [""/workflow/approvals"], page: ApprovalsPage, init: () => window.initializeApprovals?.() },
  { paths: [""/notifications"], page: NotificationsCenterPage, init: () => window.initializeNotificationsCenter?.() },
  { paths: [""/enterprise/dashboard"], page: StoreDashboardPage, init: () => window.initializeStoreDashboard?.() },
];
