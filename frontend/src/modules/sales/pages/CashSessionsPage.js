import { Sidebar } from "../../../components/Sidebar.js";
import {ViewOptions} from "../../../shared/ViewOptions.js";

export function CashSessionsPage() {
  return `
<div class="flex h-screen bg-[#f8fafc] overflow-hidden relative">
    ${Sidebar()}
    <main class="flex-1 h-screen min-h-0 overflow-y-auto pb-24 relative">
        <div class="max-w-[1400px] mx-auto p-6 space-y-6">

            <!-- =======================================================
     HEADER
======================================================= -->

            <div class="flex flex-wrap items-start justify-between gap-5">

                <!-- Left -->
                <div>

                    <div class="flex items-center gap-3">

                        <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">

                            <i data-lucide="wallet" class="w-6 h-6 text-emerald-600"></i>

                        </div>

                        <div>

                            <h1 class="text-2xl font-bold text-slate-900">
                                Cash Sessions
                            </h1>

                            <p class="text-sm text-slate-500 mt-1">
                                Manage and monitor every cash register session.
                            </p>

                        </div>

                    </div>

                </div>


                <!-- Right -->

                <div class="flex items-center gap-3">

                    <!-- Export -->

                    <div class="relative" id="export-menu-container">

                        <button onclick="window.toggleExportMenu(event)"
                            class="h-11 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center gap-2 shadow-sm">

                            <i data-lucide="download" class="w-4 h-4 text-slate-500"></i>

                            <span class="text-sm font-medium">
                                Export
                            </span>

                            <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400"></i>

                        </button>


                        <div id="export-menu"
                            class="hidden absolute right-0 top-12 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50">

                            <button onclick="window.exportCSV(); window.closeExportMenu();"
                                class="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition">

                                <div class="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">

                                    <i data-lucide="file-spreadsheet" class="w-4 h-4 text-emerald-600"></i>

                                </div>

                                <div class="text-left">

                                    <p class="text-sm font-medium text-slate-800">
                                        Export CSV
                                    </p>

                                    <p class="text-xs text-slate-400">
                                        Comma separated values
                                    </p>

                                </div>

                            </button>


                            <button onclick="window.exportExcel(); window.closeExportMenu();"
                                class="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition">

                                <div class="w-9 h-9 rounded-xl bg-lime-50 flex items-center justify-center">

                                    <i data-lucide="sheet" class="w-4 h-4 text-lime-600"></i>

                                </div>

                                <div class="text-left">

                                    <p class="text-sm font-medium text-slate-800">
                                        Export Excel
                                    </p>

                                    <p class="text-xs text-slate-400">
                                        Microsoft Excel
                                    </p>

                                </div>

                            </button>


                            <button onclick="window.exportPdf(); window.closeExportMenu();"
                                class="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition">

                                <div class="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">

                                    <i data-lucide="file-text" class="w-4 h-4 text-rose-600"></i>

                                </div>

                                <div class="text-left">

                                    <p class="text-sm font-medium text-slate-800">
                                        Export PDF
                                    </p>

                                    <p class="text-xs text-slate-400">
                                        Printable document
                                    </p>

                                </div>

                            </button>

                        </div>

                    </div>


                    <!-- Refresh -->

                    <button onclick="window.loadCashSessions()"
                        class="h-11 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition shadow-sm flex items-center gap-2">

                        <i data-lucide="refresh-cw" class="w-4 h-4"></i>

                        <span class="text-sm font-medium">
                            Refresh
                        </span>

                    </button>

                </div>

            </div>

            <!-- =======================================================
     ACTIVE SESSION CARD
======================================================= -->

            <div id="active-session-container" class="hidden"></div>

            <!-- =======================================================
     STATISTICS
======================================================= -->

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

                <!-- Total Sessions -->

                <div
                    class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition">

                    <div class="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-violet-100 opacity-40 blur-3xl">
                    </div>

                    <div class="relative flex items-center justify-between">

                        <div>

                            <p class="text-sm font-medium text-slate-500">
                                Total Sessions
                            </p>

                            <h2 id="total-sessions-stat" class="mt-4 text-4xl font-bold text-slate-900">
                                0
                            </h2>

                            <p class="mt-3 text-xs text-slate-400">
                                Lifetime sessions
                            </p>

                        </div>

                        <div class="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center">

                            <i data-lucide="calendar-range" class="w-7 h-7 text-violet-600"></i>

                        </div>

                    </div>

                </div>


                <!-- Open Sessions -->

                <div
                    class="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-emerald-100/40 p-6 shadow-sm hover:shadow-lg transition">

                    <div class="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-emerald-200 opacity-40 blur-3xl">
                    </div>

                    <div class="relative flex items-center justify-between">

                        <div>

                            <p class="text-sm font-medium text-slate-500">
                                Open Sessions
                            </p>

                            <h2 id="open-sessions-stat" class="mt-4 text-4xl font-bold text-slate-900">
                                0
                            </h2>

                            <p class="mt-3 text-xs text-emerald-600 font-medium">
                                Currently active
                            </p>

                        </div>

                        <div class="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">

                            <i data-lucide="circle-play" class="w-7 h-7 text-emerald-600"></i>

                        </div>

                    </div>

                </div>


                <!-- Average Session -->

                <div
                    class="relative overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-white via-amber-50 to-amber-100/40 p-6 shadow-sm hover:shadow-lg transition">

                    <div class="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-amber-200 opacity-40 blur-3xl">
                    </div>

                    <div class="relative flex items-center justify-between">

                        <div>

                            <p class="text-sm font-medium text-slate-500">
                                Avg Session Time
                            </p>

                            <h2 id="avg-session-time" class="mt-4 text-4xl font-bold text-slate-900">
                                0h
                            </h2>

                            <p class="mt-3 text-xs text-slate-400">
                                Average duration
                            </p>

                        </div>

                        <div class="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">

                            <i data-lucide="clock-3" class="w-7 h-7 text-amber-600"></i>

                        </div>

                    </div>

                </div>


                <!-- Average Sale -->

                <div
                    class="relative overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-white via-cyan-50 to-cyan-100/40 p-6 shadow-sm hover:shadow-lg transition">

                    <div class="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-cyan-200 opacity-40 blur-3xl">
                    </div>

                    <div class="relative flex items-center justify-between">

                        <div>

                            <p class="text-sm font-medium text-slate-500">
                                Average Sale
                            </p>

                            <h2 id="avg-sale-stat" class="mt-4 text-3xl font-bold text-slate-900">
                                Rs 0.00
                            </h2>

                            <p class="mt-3 text-xs text-slate-400">
                                Per session
                            </p>

                        </div>

                        <div class="w-14 h-14 rounded-2xl bg-cyan-100 flex items-center justify-center">

                            <i data-lucide="badge-dollar-sign" class="w-7 h-7 text-cyan-600"></i>

                        </div>

                    </div>

                </div>

            </div>

<!-- =======================================================
     TOOLBAR
======================================================= -->

            <div class="px-6 py-5 border-b border-slate-100">

                <div class="flex flex-wrap items-center justify-between gap-4">

                    <!-- LEFT SIDE -->
                    <div class="flex flex-wrap items-center gap-3">

                        <!-- Search -->

                                     <div class="relative w-64">
                <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></i>
                <input type="text" id="cs-search" placeholder="Search by ID..." class="w-full h-10 pl-10 pr-4 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#10b981] transition-shadow">
             </div>


                        <!-- Cashier -->

                        <div class="relative" data-toolbar-filter="cashier">

                            <div id="cashier-filter-wrapper" class="relative w-56">

                                <button id="cashier-filter-button" data-cashier-id="" type="button"
                                    class="w-full h-11 px-4 rounded-xl border border-cyan-100 bg-gradient-to-r from-white to-cyan-50 flex items-center justify-between shadow-sm hover:border-cyan-300 transition">

                                    <span class="flex items-center gap-3">

                                        <span class="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">

                                            <i data-lucide="user" class="w-4 h-4 text-cyan-600"></i>

                                        </span>

                                        <span id="cashier-filter-label" class="text-sm">
                                            All Cashiers
                                        </span>

                                    </span>

                                    <i id="cashier-chevron" data-lucide="chevron-down"
                                        class="w-4 h-4 text-slate-400"></i>

                                </button>


                                <div id="cashier-filter-menu"
                                    class="hidden absolute left-0 top-full mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-2xl z-[9999] max-h-72 overflow-y-auto">

                                    <div id="cashier-filter-options" class="p-2 space-y-1"></div>

                                </div>

                            </div>

                        </div>


                        <!-- Date -->

                        <div class="relative">

                            <i data-lucide="calendar-days"
                                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 pointer-events-none"></i>

                            <input id="cs-date-filter" type="date"
                                class="h-11 pl-10 pr-4 rounded-xl border border-amber-100 bg-white text-sm outline-none focus:ring-2 focus:ring-amber-300">

                        </div>


                        <!-- Status -->

                        <div class="relative">

                            <i data-lucide="circle-dot"
                                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none"></i>

                            <select id="cs-status-filter"
                                class="h-11 pl-10 pr-10 rounded-xl border border-emerald-100 bg-white appearance-none text-sm outline-none focus:ring-2 focus:ring-emerald-300">

                                <option value="">
                                    All Status
                                </option>

                                <option value="open">
                                    Open
                                </option>

                                <option value="closed">
                                    Closed
                                </option>

                            </select>

                            <i data-lucide="chevron-down"
                                class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"></i>

                        </div>

                    </div>


                    <!-- RIGHT SIDE -->

                    <div class="flex items-center gap-3">

                        <!-- Sort -->

                        <button
                            class="group w-11 h-11 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:border-indigo-300 hover:shadow-md transition"
                            title="Sort">

                            <i data-lucide="arrow-up-down" class="w-4 h-4 text-indigo-500"></i>

                        </button>


                        <!-- View Options -->

                        <div id="view-options-container" class="relative">

                            <button id="view-options-button"
                                class="group w-11 h-11 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:border-slate-300 hover:shadow-md transition">

                                <i data-lucide="ellipsis" class="w-4 h-4"></i>

                            </button>

                            ${ViewOptions()}

                        </div>


                        <!-- Cash In -->

                        <button onclick="window.openCashTransactionModal('in')"
                            class="h-11 px-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium flex items-center gap-2 hover:bg-emerald-100 transition">

                            <i data-lucide="plus" class="w-4 h-4"></i>

                            Cash In

                        </button>


                        <!-- Cash Out -->

                        <button onclick="window.openCashTransactionModal('out')"
                            class="h-11 px-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium flex items-center gap-2 hover:bg-rose-100 transition">

                            <i data-lucide="minus" class="w-4 h-4"></i>

                            Cash Out

                        </button>

                    </div>

                </div>

            </div>


            <!-- =======================================================
     TABLE
======================================================= -->

            <div class="flex-1 min-h-0 overflow-hidden">

                <div class="w-full overflow-x-auto">

                    <table class="w-full text-sm">

                        <!-- Header -->

                        <thead class="sticky top-0 bg-white border-b border-slate-200 z-10">

                            <tr>

                                <th class="px-5 py-4 text-left font-semibold text-slate-500">
                                    Session
                                </th>

                                <th class="px-5 py-4 text-left font-semibold text-slate-500">
                                    Date
                                </th>

                                <th class="px-5 py-4 text-left font-semibold text-slate-500">
                                    Cashier
                                </th>

                                <th class="px-5 py-4 text-left font-semibold text-slate-500">
                                    Opened
                                </th>

                                <th class="px-5 py-4 text-left font-semibold text-slate-500">
                                    Duration
                                </th>

                                <th class="px-5 py-4 text-left font-semibold text-slate-500">
                                    Opening Cash
                                </th>

                                <th class="px-5 py-4 text-left font-semibold text-slate-500">
                                    Closing Cash
                                </th>

                                <th class="px-5 py-4 text-left font-semibold text-slate-500">
                                    Sales
                                </th>

                                <th class="px-5 py-4 text-left font-semibold text-slate-500">
                                    Status
                                </th>

                                <th class="px-5 py-4 text-right font-semibold text-slate-500">
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <!-- Body -->

                        <tbody id="cs-table-body" class="divide-y divide-slate-100">

                            <tr>

                                <td colspan="10" class="py-20 text-center text-slate-400">

                                    <div
                                        class="inline-block w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin">
                                    </div>

                                    <p class="mt-4">
                                        Loading cash sessions...
                                    </p>

                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>


            <!-- Pagination -->
            <div class="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
                <p class="text-sm text-slate-500" id="cs-pagination-text">Showing 0 to 0 of 0 sessions</p>
                <div class="flex items-center gap-2" id="cs-pagination-controls">
                    <!-- Filled by JS -->
                </div>
            </div>
        </div>
</div>
</main>

<!-- Floating New Session Button -->
<div class="absolute bottom-8 right-8 z-20" id="floating-action-container">
    <button
        class="h-12 px-6 flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-full text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/30">
        <i data-lucide="plus" class="w-5 h-5"></i> Open New Session
    </button>
</div>

<!-- Summary Drawer Overlay -->
<div id="cs-drawer-overlay" class="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 hidden transition-opacity"
    onclick="window.closeCashSessionDrawer()"></div>

<!-- Summary Drawer -->
<div id="cs-drawer"
    class="fixed top-0 right-0 h-full w-[450px] bg-white shadow-2xl z-50 transform translate-x-full transition-transform duration-300 flex flex-col">
    <!-- Filled by JS -->
</div>

<!-- Cash In/Out Modal -->
<div id="cash-tx-modal" class="fixed inset-0 z-50 items-center justify-center bg-slate-900/50 backdrop-blur-sm hidden">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900" id="cash-tx-title">Cash In</h3>
            <button onclick="window.closeCashTransactionModal()" class="text-slate-400 hover:text-slate-600"><i
                    data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <div class="p-6 space-y-4">
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Amount (Rs)</label>
                <input type="number" id="cash-tx-amount"
                    class="w-full h-11 px-4 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                <input type="text" id="cash-tx-reason" placeholder="e.g. Bank Deposit, Petty Cash"
                    class="w-full h-11 px-4 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
            </div>
        </div>
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button onclick="window.closeCashTransactionModal()"
                class="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
            <button onclick="window.submitCashTransaction()" id="cash-tx-submit"
                class="px-6 py-2 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">Confirm</button>
        </div>
    </div>
</div>

</div>
  `;
}
