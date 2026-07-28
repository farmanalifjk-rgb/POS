import { Sidebar } from "../../../components/Sidebar.js";

export function CustomersPage() {
  return `
<div class="flex h-screen bg-[#f1f2f0] overflow-hidden">
  ${Sidebar()}
  <main class="flex-1 h-screen min-h-0 overflow-hidden p-6">
    <div class="bg-white h-full rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">

      <!-- Toolbar -->
      <div class="shrink-0 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-bold text-slate-900 flex items-center gap-2">
            <i data-lucide="users" class="w-5 h-5 text-indigo-600"></i> Customers
          </h1>
          <p class="text-sm text-slate-400 mt-0.5" id="customer-count">Loading...</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
            <input id="customer-search" type="text" placeholder="Search customers..."
              class="h-10 pl-9 pr-4 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 w-60"
              oninput="window.filterCustomers()" />
          </div>
          <button onclick="window.openAddCustomer()"
            class="h-10 px-4 bg-indigo-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition">
            <i data-lucide="plus" class="w-4 h-4"></i> Add Customer
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="flex-1 overflow-y-auto">
        <table class="w-full text-sm">
          <thead class="sticky top-0 bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Credit Limit</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Balance</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <span class="flex items-center gap-1"><i data-lucide="star" class="w-3 h-3 text-amber-500"></i> Points</span>
              </th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody id="customer-table-body" class="divide-y divide-slate-50">
            <tr><td colspan="7" class="px-6 py-12 text-center text-slate-400">
              <div class="inline-block w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-2"></div>
              <p>Loading customers...</p>
            </td></tr>
          </tbody>
        </table>
      </div>

    </div>
  </main>
</div>

<!-- Add/Edit Customer Modal -->
<div id="customer-modal" class="hidden fixed inset-0 bg-black/50 items-center justify-center z-50 p-4">
  <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
    <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
      <h2 id="customer-modal-title" class="font-semibold text-slate-900">Add Customer</h2>
      <button onclick="window.closeCustomerModal()" class="text-slate-400 hover:text-slate-700 transition">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
    </div>
    <div class="p-6 space-y-4">
      <input type="hidden" id="customer-modal-id" />
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2">
          <label class="block text-sm font-medium text-slate-700 mb-1">Name *</label>
          <input id="cm-name" type="text" placeholder="Full name"
            class="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Phone</label>
          <input id="cm-phone" type="text" placeholder="03xxxxxxxxx"
            class="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input id="cm-email" type="email" placeholder="email@example.com"
            class="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Credit Limit</label>
          <input id="cm-credit-limit" type="number" min="0" placeholder="0"
            class="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Address</label>
          <input id="cm-address" type="text" placeholder="City, Country"
            class="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
      </div>
    </div>
    <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
      <button onclick="window.closeCustomerModal()" class="h-10 px-5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition">Cancel</button>
      <button onclick="window.saveCustomer()" class="h-10 px-5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition">Save</button>
    </div>
  </div>
</div>

<!-- Customer Statement Slide-over -->
<div id="customer-statement-panel" class="hidden fixed inset-0 bg-black/50 z-50 justify-end">
  <div class="bg-white w-full max-w-xl h-full flex flex-col shadow-2xl">
    <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
      <div>
        <h2 id="statement-customer-name" class="text-lg font-bold text-slate-900">Customer Statement</h2>
        <p id="statement-customer-phone" class="text-sm text-slate-500"></p>
      </div>
      <button onclick="window.closeCustomerStatement()" class="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
    </div>
    <!-- Summary cards -->
    <div class="grid grid-cols-3 gap-3 p-5 border-b border-slate-100 bg-slate-50">
      <div class="bg-white rounded-xl p-3 shadow-sm border border-slate-100 text-center">
        <p class="text-xs text-slate-500 font-medium">Total Spent</p>
        <p id="stmt-total-spent" class="text-lg font-bold text-slate-800 mt-1">-</p>
      </div>
      <div class="bg-white rounded-xl p-3 shadow-sm border border-slate-100 text-center">
        <p class="text-xs text-slate-500 font-medium">Balance Due</p>
        <p id="stmt-balance" class="text-lg font-bold text-red-600 mt-1">-</p>
      </div>
      <div class="bg-amber-50 rounded-xl p-3 shadow-sm border border-amber-100 text-center">
        <p class="text-xs text-amber-600 font-medium">Loyalty Points</p>
        <p id="stmt-points" class="text-lg font-bold text-amber-700 mt-1">-</p>
      </div>
    </div>
    <!-- Orders table -->
    <div class="flex-1 overflow-y-auto p-5">
      <h3 class="text-sm font-semibold text-slate-700 mb-3">Purchase History</h3>
      <div id="statement-orders" class="space-y-2">
        <div class="text-center py-8 text-slate-400 text-sm">Loading...</div>
      </div>
    </div>
    <!-- Adjust Points button -->
    <div class="px-5 py-4 border-t border-slate-100">
      <button onclick="window.openAdjustPoints()" class="w-full h-10 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition flex items-center justify-center gap-2">
        <i data-lucide="star" class="w-4 h-4"></i> Adjust Loyalty Points
      </button>
    </div>
  </div>
</div>

<!-- Adjust Points Modal -->
<div id="adjust-points-modal" class="hidden fixed inset-0 bg-black/60 items-center justify-center z-[60] p-4">
  <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
    <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
      <h2 class="font-semibold text-slate-900">Adjust Loyalty Points</h2>
      <button onclick="window.closeAdjustPoints()" class="text-slate-400 hover:text-slate-700">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
    </div>
    <div class="p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Points Change <span class="text-slate-400 text-xs">(negative to deduct)</span></label>
        <input id="adj-points-value" type="number" placeholder="e.g. 50 or -20"
          class="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-400" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Reason</label>
        <input id="adj-points-reason" type="text" placeholder="e.g. Promotional bonus"
          class="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-400" />
      </div>
    </div>
    <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
      <button onclick="window.closeAdjustPoints()" class="h-10 px-5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
      <button onclick="window.submitAdjustPoints()" class="h-10 px-5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600">Apply</button>
    </div>
  </div>
</div>
`;
}
