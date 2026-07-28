import { createIcons, icons as lucideIcons } from "lucide";
import {showTooltip,hideTooltip} from "./Tooltip";

let company = null;

async function loadCompany() {
  try {
    const token = localStorage.getItem("pos_token");
    const headers = token ? { Authorization: `Token ${token}` } : {};
    const response = await fetch("http://127.0.0.1:8000/api/company/", { headers });
    company = await response.json();
    refreshSidebar();
  } catch (error) {
    console.error("Failed to load company:", error);
  }
}

const icons = {
  logo: `<i data-lucide="refresh-cw" width="15" height="15" class="text-sidebar-bg" stroke-width="2.5"></i>`,
  collapse: `<i data-lucide="chevrons-left" width="16" height="16"></i>`,
  home: `<i data-lucide="home" width="18" height="18" stroke-width="1.8"></i>`,
  cart: `<i data-lucide="shopping-cart" width="18" height="18" stroke-width="1.8"></i>`,
  box: `<i data-lucide="package" width="18" height="18" stroke-width="1.8"></i>`,
  chart: `<i data-lucide="bar-chart-3" width="18" height="18" stroke-width="1.8"></i>`,
  gear: `<i data-lucide="settings" width="18" height="18" stroke-width="1.8"></i>`,
  chevron: `<i data-lucide="chevron-down" width="16" height="16"></i>`,
  dots: `<i data-lucide="more-vertical" width="18" height="18"></i>`,
  sun: `<i data-lucide="sun" width="18" height="18"></i>`,
  moon: `<i data-lucide="moon" width="18" height="18"></i>`,
  pos: `<i data-lucide="monitor-dot" width="18" height="18"></i>`,
  inventory: `<i data-lucide="boxes" width="18" height="18"></i>`,
  dashboard: `<i data-lucide="layout-dashboard" width="18" height="18"></i>`,
  products: `<i data-lucide="package" width="18" height="18"></i>`,
  movements: `<i data-lucide="arrow-right-left" width="18" height="18"></i>`,
  adjustments: `<i data-lucide="sliders-horizontal" width="18" height="18"></i>`,
  valuation: `<i data-lucide="wallet" width="18" height="18"></i>`,
  reports: `<i data-lucide="file-text" width="18" height="18"></i>`,
  analytics: `<i data-lucide="chart-column" width="18" height="18"></i>`,
  customers: `<i data-lucide="users" width="18" height="18"></i>`,
  truck: `<i data-lucide="truck" width="18" height="18"></i>`,
  purchases: `<i data-lucide="clipboard-list" width="18" height="18"></i>`,
  cash: `<i data-lucide="landmark" width="18" height="18"></i>`,
  logout: `<i data-lucide="log-out" width="16" height="16"></i>`,
  building: `<i data-lucide="building-2" width="18" height="18"></i>`,
  shield: `<i data-lucide="shield-check" width="18" height="18"></i>`,
  database: `<i data-lucide="database-backup" width="18" height="18"></i>`,
  terminal: `<i data-lucide="terminal" width="18" height="18"></i>`,
  hardware: `<i data-lucide="printer" width="18" height="18"></i>`,
  calculator: `<i data-lucide="calculator" width="18" height="18"></i>`,
  briefcase: `<i data-lucide="briefcase" width="18" height="18"></i>`,
  award: `<i data-lucide="award" width="18" height="18"></i>`,
  bell: `<i data-lucide="bell" width="18" height="18"></i>`,
  checkSquare: `<i data-lucide="check-square" width="18" height="18"></i>`,
};

const navSections = [
  // ── Orders & Transactions ──────────────────────────────────────────────────
  {
    id: "orders",
    label: "Orders",
    icon: icons.cart,
    items: [
      { id: "orders-all",       label: "All Orders",      route: "#/orders?filter=all",           icon: "list" },
      { id: "orders-completed", label: "Completed",       route: "#/orders?filter=completed",     icon: "badge-check" },
      { id: "orders-refunds",   label: "Refund History",  route: "#/orders?filter=refunds",              icon: "undo-2" },
      { id: "orders-partial",   label: "Partial Refunds", route: "#/orders?filter=partial-refunds",icon: "undo-2" },
      { id: "orders-draft",     label: "Drafts",          route: "#/orders?filter=draft",         icon: "file-text" },
      { id: "cash-sessions",    label: "Cash Sessions",   route: "#/cash-sessions",               icon: "landmark" },
    ],
  },

  // ── Inventory ──────────────────────────────────────────────────────────────
  {
    id: "inventory",
    label: "Inventory",
    icon: icons.inventory,
    items: [
      { id: "inventory-dashboard",   label: "Dashboard",    route: "#/inventory/dashboard",   icon: "layout-dashboard" },
      { id: "inventory-products",    label: "Products",     route: "#/inventory/products",    icon: "package" },
      { id: "inventory-movements",   label: "Movements",    route: "#/inventory/movements",   icon: "arrow-right-left" },
      { id: "inventory-adjustments", label: "Adjustments",  route: "#/inventory/adjustments", icon: "sliders-horizontal" },
      { id: "inventory-valuation",   label: "Valuation",    route: "#/inventory/valuation",   icon: "wallet" },
      { id: "inventory-reports",     label: "Reports",      route: "#/inventory/reports",     icon: "file-text" },
      { id: "inventory-analytics",   label: "Analytics",    route: "#/inventory/analytics",   icon: "chart-column" },
    ],
  },

  // ── Purchasing ─────────────────────────────────────────────────────────────
  {
    id: "purchasing",
    label: "Purchasing",
    icon: icons.purchases,
    items: [
      { id: "suppliers",         label: "Suppliers",         route: "#/suppliers",         icon: "truck" },
      { id: "purchase-orders",   label: "Purchase Orders",   route: "#/purchases",         icon: "clipboard-list" },
      { id: "purchase-returns",  label: "Purchase Returns",  route: "#/purchase-returns",  icon: "rotate-ccw" },
    ],
  },

  // ── Products & Catalog ─────────────────────────────────────────────────────
  {
    id: "products",
    label: "Products",
    icon: icons.box,
    items: [
      { id: "products-all",        label: "All Products", route: "#/products",    icon: "package" },
      { id: "products-categories", label: "Categories",   route: "#/categories",  icon: "folder" },
      { id: "products-brands",     label: "Brands",       route: "#/brands",      icon: "tag" },
      { id: "products-variants",   label: "Variants",     route: "#/variants",    icon: "layers" },
    ],
  },

  // ── Customers ─────────────────────────────────────────────────────────────
  {
    id: "crm",
    label: "Customers",
    icon: icons.customers,
    items: [
      { id: "customers-list", label: "Customer List", route: "#/customers", icon: "users" },
    ],
  },

  // ── Reporting ─────────────────────────────────────────────────────────────
  {
    id: "reporting",
    label: "Reporting",
    icon: icons.chart,
    items: [
      { id: "report-sales",    label: "Sales Report",    route: "#/reports/sales",       icon: "trending-up" },
      { id: "report-products", label: "Product Report",  route: "#/reports/products",    icon: "package" },
      { id: "report-stock",    label: "Stock Report",    route: "#/reports/stock",       icon: "boxes" },
      { id: "report-tax",      label: "Tax Report",      route: "#/reports/tax",         icon: "percent" },
      { id: "report-pl",       label: "Profit & Loss",   route: "#/reports/profit-loss", icon: "bar-chart-2" },
      { id: "report-cashflow", label: "Cash Flow",       route: "#/reports/cash-flow",   icon: "arrow-right-left" },
      { id: "report-customer", label: "Customer Report", route: "#/reports/customer",    icon: "users" },
      { id: "report-supplier", label: "Supplier Report", route: "#/reports/supplier",    icon: "truck" },
      { id: "report-employee", label: "Employee Report", route: "#/reports/employee",    icon: "user-check" },
    ],
  },

  // ── Enterprise (Multi-Store & Warehouses) ─────────────────────────────────
  {
    id: "enterprise",
    label: "Enterprise",
    icon: icons.building,
    items: [
      { id: "enterprise-dashboard",  label: "Store Dashboard",  route: "#/enterprise/dashboard",  icon: "layout-dashboard" },
      { id: "enterprise-stores",     label: "Stores",           route: "#/enterprise/stores",     icon: "store" },
      { id: "enterprise-warehouses", label: "Warehouses",       route: "#/enterprise/warehouses", icon: "warehouse" },
      { id: "enterprise-transfers",  label: "Stock Transfers",  route: "#/enterprise/transfers",  icon: "arrow-right-left" },
      { id: "enterprise-locations",  label: "Locations & Bins", route: "#/enterprise/locations",  icon: "map-pin" },
    ],
  },

  // ── Accounting ─────────────────────────────────────────────────────────────
  {
    id: "accounting",
    label: "Accounting",
    icon: icons.calculator,
    items: [
      { id: "accounting-accounts",   label: "Chart of Accounts",route: "#/accounting/accounts",   icon: "list" },
      { id: "accounting-journal",    label: "Journal Entries",  route: "#/accounting/journal",    icon: "book-open" },
      { id: "accounting-ledger",     label: "General Ledger",   route: "#/accounting/ledger",     icon: "book" },
      { id: "accounting-trial",      label: "Trial Balance",    route: "#/accounting/trial-balance", icon: "scale" },
      { id: "accounting-balance",    label: "Balance Sheet",    route: "#/accounting/balance-sheet", icon: "landmark" },
      { id: "accounting-expenses",   label: "Expenses",         route: "#/accounting/expenses",   icon: "receipt" },
    ],
  },

  // ── HR / Employees ─────────────────────────────────────────────────────────
  {
    id: "hr",
    label: "HR & Payroll",
    icon: icons.briefcase,
    items: [
      { id: "hr-employees",          label: "Employees",        route: "#/hr/employees",          icon: "users" },
      { id: "hr-attendance",         label: "Attendance",       route: "#/hr/attendance",         icon: "clock" },
      { id: "hr-shifts",             label: "Shifts",           route: "#/hr/shifts",             icon: "calendar-days" },
      { id: "hr-leave",              label: "Leave Requests",   route: "#/hr/leave",              icon: "calendar-off" },
      { id: "hr-payroll",            label: "Payroll",          route: "#/hr/payroll",            icon: "banknote" },
    ],
  },

  // ── Loyalty & Promotions ───────────────────────────────────────────────────
  {
    id: "loyalty",
    label: "Loyalty & Promos",
    icon: icons.award,
    items: [
      { id: "loyalty-program",       label: "Loyalty Program",  route: "#/loyalty",               icon: "award" },
      { id: "loyalty-memberships",   label: "Memberships",      route: "#/loyalty/memberships",   icon: "medal" },
      { id: "loyalty-giftcards",     label: "Gift Cards",       route: "#/loyalty/gift-cards",    icon: "gift" },
      { id: "loyalty-coupons",       label: "Coupons",          route: "#/loyalty/coupons",       icon: "ticket" },
      { id: "loyalty-promotions",    label: "Promotions",       route: "#/loyalty/promotions",    icon: "percent" },
    ],
  },

  // ── Operations & Workflow ──────────────────────────────────────────────────
  {
    id: "workflow",
    label: "Operations",
    icon: icons.checkSquare,
    items: [
      { id: "workflow-approvals",    label: "Approvals",        route: "#/workflow/approvals",    icon: "check-circle" },
      { id: "workflow-notifications",label: "Notifications",    route: "#/notifications",         icon: "bell" },
    ],
  },

  // ── Configuration ─────────────────────────────────────────────────────────
  {
    id: "configuration",
    label: "Configuration",
    icon: icons.gear,
    items: [
      { id: "settings",      label: "Settings",           route: "#/settings",  icon: "settings" },
      { id: "users",         label: "Users",              route: "#/users",     icon: "user" },
      { id: "roles",         label: "Roles & Permissions", route: "#/roles",    icon: "shield" },
      { id: "taxes",         label: "Taxes",              route: "#/taxes",     icon: "percent" },
      { id: "payments",      label: "Payment Methods",    route: "#/payments",  icon: "credit-card" },
    ],
  },

  // ── Security ──────────────────────────────────────────────────────────────
  {
    id: "security",
    label: "Security",
    icon: icons.shield,
    items: [
      { id: "security-center",   label: "Security Center",  route: "#/security",          icon: "shield-check" },
      { id: "security-sessions", label: "Active Sessions",  route: "#/security/sessions",  icon: "monitor" },
      { id: "security-audit",    label: "Audit Logs",       route: "#/security/audit",     icon: "scroll-text" },
      { id: "security-tokens",   label: "API Tokens",       route: "#/security/tokens",    icon: "key" },
      { id: "security-devices",  label: "Trusted Devices",  route: "#/security/devices",   icon: "smartphone" },
    ],
  },

  // ── System ────────────────────────────────────────────────────────────────
  {
    id: "system",
    label: "System",
    icon: icons.database,
    items: [
      { id: "hardware",  label: "Hardware Setup",   route: "#/hardware",   icon: "printer" },
      { id: "backup",    label: "Backup & Restore", route: "#/backup",     icon: "hard-drive-download" },
      { id: "dev-tools", label: "Developer Tools",  route: "#/dev-tools",  icon: "terminal" },
    ],
  },
];

const state = {
  collapsed: false,
  activeItem: "",
  openSections: {
    orders: true,
    inventory: true,
    purchasing: false,
    products: true,
    crm: false,
    enterprise: false,
    accounting: false,
    hr: false,
    loyalty: false,
    workflow: false,
    reporting: false,
    configuration: false,
    security: false,
    system: false,
  },
};

let darkMode = localStorage.getItem("pos-theme") === "dark";
let sidebarScrollTarget = null;
let sidebarScrollOffset = null;

function renderSection(section, collapsed) {
  const isOpen = state.openSections[section.id];

  const itemsHtml = section.items
    .map((item) => `
      <button
        data-nav-item="${item.id ?? item.label}"
        data-route="${item.route}"
        data-tooltip="${item.label}"
        class="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors
        ${
          state.activeItem === (item.id ?? item.label)
            ? "text-accent bg-accent/10"
            : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
        }">
        ${item.label}
      </button>
    `)
    .join("");

  return `
    <div class="mb-1">
      <button
        data-section-toggle="${section.id}"
        data-sidebar-open
        data-tooltip="${section.label}"
        ${collapsed ? `data-sidebar-open` : ""}
        class="w-full flex items-center ${
          collapsed ? "justify-center" : "justify-between"
        } px-3 py-2.5 rounded-lg text-gray-200 hover:bg-white/5 transition-colors"
      >
        <span class="flex items-center ${collapsed ? "" : "gap-3"}">
          <span class="text-gray-400 shrink-0">${section.icon}</span>
          ${
            collapsed
              ? ""
              : `<span class="text-sm font-semibold">${section.label}</span>`
          }
        </span>

        ${
          collapsed
            ? ""
            : `<span class="text-gray-500 ${isOpen ? "" : "-rotate-90"}">${icons.chevron}</span>`
        }
      </button>

      ${
        !collapsed && isOpen
          ? `
          <div class="relative mt-1 ml-[20px] pl-[26px] space-y-0.5">
            <span class="absolute left-0 top-1 bottom-1 w-px bg-gray-600"></span>
            ${itemsHtml}
          </div>
          `
          : ""
      }
    </div>
  `;
}

export function Sidebar() {
  const collapsed = state.collapsed;
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("pos_user") ?? "null"); } catch { return null; }
  })();

  return `
  <aside
    id="pos-sidebar"
    class="${collapsed ? "w-[72px]" : "w-[260px]"} h-screen bg-sidebar-bg border-r border-sidebar-border flex flex-col
    transition-all duration-200 ease-out rounded-r-3xl shrink-0"
  >

  <!-- Header -->
  <div class="flex items-center ${collapsed ? "justify-center px-0" : "justify-between px-5"} pt-6 pb-6">
    <button
      id="sidebar-logo-btn"
      class="flex items-center ${collapsed ? "justify-center w-full" : "gap-2.5 min-w-0"}"
    >
      <div class="w-8 h-8 shrink-0 rounded-full overflow-hidden flex items-center justify-center">
        ${company?.logo
          ? `<img src="${company.logo.startsWith("http") ? company.logo : `http://127.0.0.1:8000${company.logo}`}" alt="${company.name || "Company"}" class="w-full h-full object-cover">`
          : icons.logo
        }
      </div>
      ${collapsed ? "" : `<span class="text-white font-bold text-[14px] tracking-tight">${company?.name || "POS SYSTEM"}</span>`}
    </button>

    ${collapsed ? "" : `
      <button
  id="collapse-btn"
  class="relative group shrink-0 w-8 h-8 rounded-lg bg-sidebar-card border border-sidebar-border flex items-center justify-center text-gray-400 hover:text-white transition-colors"
>
  <span class="transition-transform duration-200 inline-flex">
    ${icons.collapse}
  </span>

  <span class="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gray-100 text-slate-900 text-sm font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
    Collapse Sidebar
  </span>
</button>
    `}
  </div>

  <!-- Nav -->
  <nav id="sidebar-nav" class="flex-1 overflow-y-auto overflow-visible px-3 space-y-5">

    <!-- Dashboard -->
<div>
  <button
    data-nav-item="Dashboard"
    data-route="#/dashboard"
    data-tooltip="Dashboard"
    data-sidebar-open
    class="w-full flex items-center ${
      collapsed ? "justify-center" : "gap-3"
    } px-3 py-2.5 rounded-lg transition-colors
    ${
      state.activeItem === "Dashboard"
        ? "bg-accent/10 text-accent"
        : "text-gray-200 hover:bg-white/5"
    }"
  >
    <span class="shrink-0">
      ${icons.home}
    </span>

    ${
      collapsed
        ? ""
        : `<span class="text-sm font-semibold">Dashboard</span>`
    }
  </button>
</div>

    <!-- POS -->
<div>
  <button
    data-nav-item="POS"
    data-route="#/pos"
    data-sidebar-open
    data-tooltip="Point Of Sale"
    data-sidebar-open
    class="w-full flex items-center ${
      collapsed ? "justify-center" : "gap-3"
    } px-3 py-2.5 rounded-lg transition-colors
    ${
      state.activeItem === "POS"
        ? "bg-accent/10 text-accent"
        : "text-gray-200 hover:bg-white/5"
    }"
  >
    <span class="shrink-0">
      ${icons.pos}
    </span>

    ${
      collapsed
        ? ""
        : `<span class="text-sm font-semibold">Point Of Sale</span>`
    }
  </button>
</div>

    <!-- Grouped sections -->
    <div class="space-y-4">
      ${navSections.map((section) => renderSection(section, collapsed)).join("")}
    </div>

  </nav>

  <!-- Theme toggle -->
  <div class="px-3 pb-3">
    <button
      id="theme-toggle"
      class="relative group w-full flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
    >
      <span class="shrink-0">${darkMode ? icons.sun : icons.moon}</span>
      ${collapsed
        ? `<span class="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-white text-slate-900 text-sm font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">${darkMode ? "Light Mode" : "Dark Mode"}</span>`
        : `<span class="text-sm font-semibold">${darkMode ? "Light Mode" : "Dark Mode"}</span>`
      }
    </button>
  </div>

  <!-- User footer -->
  <div class="p-3 border-t border-sidebar-border">
    <div class="flex items-center gap-3 px-2 py-2 rounded-xl bg-sidebar-card">
      <img src="https://i.pravatar.cc/64?img=13" alt="User avatar" class="w-9 h-9 rounded-full object-cover shrink-0" />

      ${collapsed ? "" : `
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-white truncate">${user?.username ?? user?.first_name ?? "Admin"}</p>
          <p class="text-xs text-gray-400 truncate">${user?.role ?? user?.email ?? "Administrator"}</p>
        </div>
        <button onclick="window.Auth?.logout()" title="Logout" class="text-gray-400 hover:text-red-400 shrink-0 transition-colors">
          ${icons.logout}
        </button>
      `}
    </div>
  </div>

  </aside>
  `;
}

function applyTheme() {
  document.documentElement.classList.toggle("dark", darkMode);
  localStorage.setItem("pos-theme", darkMode ? "dark" : "light");
}

function refreshSidebar() {
  const oldSidebar = document.getElementById("pos-sidebar");
  if (!oldSidebar) return;

  const nav = oldSidebar.querySelector("#sidebar-nav");
  const scrollTop = nav ? nav.scrollTop : 0;

  oldSidebar.outerHTML = Sidebar();

  createIcons({ icons: lucideIcons });

  const newNav = document.getElementById("sidebar-nav");

  if (sidebarScrollTarget && newNav) {
    let target =
      newNav.querySelector(`[data-section-toggle="${sidebarScrollTarget}"]`) ||
      newNav.querySelector(`[data-nav-item="${sidebarScrollTarget}"]`);

    if (target && typeof sidebarScrollOffset === 'number') {
      requestAnimationFrame(() => {
        const navRect = newNav.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const currentOffset = targetRect.top - navRect.top;
        newNav.scrollTop += (currentOffset - sidebarScrollOffset);
        sidebarScrollTarget = null;
        sidebarScrollOffset = null;
      });
    } else if (target) {
      requestAnimationFrame(() => {
        target.scrollIntoView({
          block: "nearest",
          behavior: "instant",
        });
        sidebarScrollTarget = null;
        sidebarScrollOffset = null;
      });
    } else {
      newNav.scrollTop = scrollTop;
      sidebarScrollTarget = null;
      sidebarScrollOffset = null;
    }
  } else if (newNav) {
    newNav.scrollTop = scrollTop;
  }

  wireSidebarEvents();
}

function wireSidebarEvents() {
  const collapseBtn = document.getElementById("collapse-btn");
  const logoBtn = document.getElementById("sidebar-logo-btn");

  collapseBtn?.addEventListener("click", () => {
    state.collapsed = true;
    refreshSidebar();
  });

  logoBtn?.addEventListener("click", () => {
    if (state.collapsed) { state.collapsed = false; refreshSidebar(); }
  });

  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    darkMode = !darkMode;
    applyTheme();
    refreshSidebar();
  });

  document.querySelectorAll("[data-sidebar-open]").forEach((button) => {
    button.addEventListener("click", () => {
      sidebarScrollTarget =
        button.dataset.sectionToggle ||
        button.dataset.navItem ||
        null;

      const nav = document.getElementById("sidebar-nav");
      if (nav) {
        const navRect = nav.getBoundingClientRect();
        const btnRect = button.getBoundingClientRect();
        sidebarScrollOffset = btnRect.top - navRect.top;
      }

      if (state.collapsed) {
        state.collapsed = false;
        refreshSidebar();
      }
    });
  });

  document.querySelectorAll("[data-section-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-section-toggle");
      state.openSections[id] = !state.openSections[id];
      refreshSidebar();
    });
  });

  document.querySelectorAll("[data-nav-item]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeItem = button.dataset.navItem;
      if (button.dataset.route) window.location.hash = button.dataset.route;
      refreshSidebar();
    });
  });

  document.querySelectorAll("[data-tooltip]").forEach((button) => {

    button.addEventListener("mouseenter", () => {

        if (!state.collapsed) return;

        showTooltip(
            button.dataset.tooltip,
            button
        );

    });

    button.addEventListener("mouseleave", hideTooltip);

});
}

export async function initializeSidebar() {
  createIcons({ icons: lucideIcons });
  wireSidebarEvents();
  await loadCompany();
  applyTheme();
}
