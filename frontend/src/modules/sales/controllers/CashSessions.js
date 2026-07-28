/**
 * CashSessions.js — Enterprise Controller for /api/cash-sessions/
 */
import { createIcons, icons } from "lucide";
import Auth from "../../core/controllers/Auth.js";
import { loadDropdown, initializeDropdown } from "../../../shared/DropDown.js";

const BASE = "http://127.0.0.1:8000/api";
let _all = [];
let _activeSession = null;
let _txType = 'in'; // 'in' or 'out'
let currentPage = 1;
const PAGE_SIZE = 10;
let currentCashier = "";

async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, { 
      headers: { 
          ...Auth.authHeader(),
          'Content-Type': 'application/json' 
      },
      ...options
  });
  if (!res.ok) {
      const err = await res.json().catch(()=>({}));
      throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

window.initializeCashSessions = async function () {
  await loadDropdown({
      api: "cash-sessions/cashiers",
      containerId: "cashier-filter-options",
      valueField: "name",
      labelField: "name",
      label: "",
      icon: "user",
      firstLabel: "All Cashiers",
      dataKey: "cashier-id"
  });

initializeDropdown({
    buttonId: "cashier-filter-button",
    menuId: "cashier-filter-menu",
    optionsId: "cashier-filter-options",
    labelId: "cashier-filter-label",
    chevronId: "cashier-chevron",
    dataKey: "cashier-id",
    defaultLabel: "All Cashiers",
    onChange: (value) => {
        currentPage = 1;
        currentCashier = value;
        window.loadCashSessions();
    }
});

  document.getElementById("cs-search")?.addEventListener("input", window.loadCashSessions);
  document.getElementById("cs-status-filter")?.addEventListener("change", window.loadCashSessions);
  document.getElementById("cs-date-filter")?.addEventListener("change", window.loadCashSessions);

  await window.loadCashSessions();
};

window.loadCashSessions = async function () {
  try {
    const status = document.getElementById("cs-status-filter")?.value ?? "";
    const date = document.getElementById("cs-date-filter")?.value ?? "";
    const search = document.getElementById("cs-search")?.value ?? "";
    const cashier = currentCashier;
    
    let qs = new URLSearchParams();
    if (status) qs.append('status', status);
    if (date) qs.append('date', date);
    if (cashier) qs.append('cashier', cashier);
    if (search) qs.append('search', search);
    
    const path = `/cash-sessions/?${qs.toString()}`;
    const data = await api(path);
    _all = Array.isArray(data) ? data : (data?.results ?? []);
    
    try {
        const activeData = await api('/cash-sessions/?status=open');
        const activeList = Array.isArray(activeData) ? activeData : (activeData?.results ?? []);
        _activeSession = activeList.find(s => s.is_open) || null;
    } catch (e) {
        console.error("Failed to fetch active session", e);
    }

    currentPage = 1;
    updateStats();
    renderActiveSessionCard();
    renderTable(_all);
    renderFloatingButton();
  } catch (e) {
    const tbody = document.getElementById("cs-table-body");
    if (tbody) tbody.innerHTML = `<tr><td colspan="9" class="px-6 py-10 text-center text-red-500 text-sm">Failed to load sessions: ${e.message}</td></tr>`;
  }
};

function updateStats() {
    const total = _all.length;
    const open = _all.filter(s => s.is_open).length;
    
    // Average sale
    let totalSalesAmt = 0;
    let totalOrdersAmt = 0;
    
    // Total session duration calculation
    let totalDurationMs = 0;
    let closedCount = 0;

    _all.forEach(s => {
        totalSalesAmt += Number(s.total_sales || 0);
        totalOrdersAmt += Number(s.total_orders || 0);
        
        if (!s.is_open && s.closed_at && s.opened_at) {
            const start = new Date(s.opened_at);
            const end = new Date(s.closed_at);
            totalDurationMs += (end - start);
            closedCount++;
        }
    });

    const avgSale = totalOrdersAmt > 0 ? (totalSalesAmt / totalOrdersAmt) : 0;
    const avgDurationMs = closedCount > 0 ? (totalDurationMs / closedCount) : 0;
    
    const avgH = Math.floor(avgDurationMs / (1000 * 60 * 60));
    const avgM = Math.floor((avgDurationMs % (1000 * 60 * 60)) / (1000 * 60));

    const elTotal = document.getElementById("total-sessions-stat");
    const elOpen = document.getElementById("open-sessions-stat");
    const elAvgTime = document.getElementById("avg-session-time");
    const elAvgSale = document.getElementById("avg-sale-stat");
    
    if (elTotal) elTotal.textContent = total;
    if (elOpen) elOpen.textContent = open;
    if (elAvgTime) elAvgTime.textContent = closedCount > 0 ? `${avgH}h ${avgM}m` : '—';
    if (elAvgSale) elAvgSale.textContent = fmtMoney(avgSale);
}

function renderActiveSessionCard() {
    const container = document.getElementById("active-session-container");
    if (!container) return;
    
    if (!_activeSession) {
        container.classList.add('hidden');
        return;
    }
    
    container.classList.remove('hidden');
    
    const s = _activeSession;
    const openedAt = new Date(s.opened_at);
    const duration = getDurationStr(openedAt, new Date());
    
    container.innerHTML = `
        <div class="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white flex items-center justify-between">
            <div class="flex items-center gap-8">
                <div>
                    <p class="text-emerald-100 text-sm font-medium uppercase tracking-wider mb-1">Current Session</p>
                    <h2 class="text-3xl font-bold">Session #${s.id}</h2>
                </div>
                
                <div class="w-px h-12 bg-white/20"></div>
                
                <div class="flex gap-8">
                    <div>
                        <p class="text-emerald-100 text-xs mb-1">Cashier</p>
                        <p class="font-semibold text-lg">${esc(s.employee_name || 'Admin User')}</p>
                    </div>
                    <div>
                        <p class="text-emerald-100 text-xs mb-1">Opened</p>
                        <p class="font-semibold text-lg">${openedAt.toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'})}</p>
                    </div>
                    <div>
                        <p class="text-emerald-100 text-xs mb-1">Duration</p>
                        <p class="font-semibold text-lg">${duration}</p>
                    </div>
                </div>
                
                <div class="w-px h-12 bg-white/20"></div>
                
                <div class="flex gap-8">
                    <div>
                        <p class="text-emerald-100 text-xs mb-1">Opening Cash</p>
                        <p class="font-bold text-xl">${fmtMoney(s.opening_balance)}</p>
                    </div>
                    <div>
                        <p class="text-emerald-100 text-xs mb-1">Expected Cash</p>
                        <p class="font-bold text-xl">${fmtMoney(s.expected_cash)}</p>
                    </div>
                </div>
            </div>
            
            <div class="flex flex-col gap-2">
                <button onclick="window.location.hash='#/'" class="px-6 py-2 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-sm">
                    Go to POS
                </button>
                <button onclick="window.closeSession(${s.id}, ${s.expected_cash})" class="px-6 py-2 bg-black/20 text-white font-medium rounded-xl hover:bg-black/30 transition-colors">
                    Close Session
                </button>
            </div>
        </div>
    `;
    createIcons({ icons });
}

function renderFloatingButton() {
    const container = document.getElementById("floating-action-container");
    if (!container) return;
    
    if (_activeSession) {
        container.innerHTML = `
            <button onclick="window.location.hash='#/'" class="h-12 px-6 flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-full text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/30">
                <i data-lucide="play" class="w-5 h-5"></i> Continue Current Session
            </button>
        `;
    } else {
        container.innerHTML = `
            <button onclick="alert('Open session modal not implemented in this demo. Assume session starts on POS page.')" class="h-12 px-6 flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-full text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/30">
                <i data-lucide="plus" class="w-5 h-5"></i> Open New Session
            </button>
        `;
    }
    createIcons({ icons });
}

function getDurationStr(start, end) {
    const diff = end - start;
    if (diff < 0) return '0m';
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

function getInitials(name) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1 && parts[0]) return parts[0].substring(0, 2).toUpperCase();
    return "NA";
}

function getAvatarColor(name) {
    const colors = ["bg-[#dcfce7] text-[#10b981]", "bg-[#e0f2fe] text-[#3b82f6]", "bg-[#f3e8ff] text-[#a855f7]", "bg-[#ffedd5] text-[#f97316]", "bg-[#ccfbf1] text-[#14b8a6]", "bg-[#fce7f3] text-[#ec4899]"];
    let sum = 0; for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
}

function getProgressVisual(s) {
    const start = new Date(s.opened_at);
    const end = s.is_open ? new Date() : new Date(s.closed_at);
    const durStr = getDurationStr(start, end);
    const timeStr = start.toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'});
    
    return `
        <div class="flex items-center gap-2 w-full max-w-[180px]">
            <span class="text-xs text-slate-500 w-14 shrink-0">${timeStr}</span>
            <div class="flex-1 flex items-center">
                <div class="h-0.5 w-full ${s.is_open ? 'bg-emerald-500' : 'bg-slate-300'}"></div>
                <div class="w-2 h-2 rounded-full ${s.is_open ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-400'}"></div>
            </div>
            <span class="text-xs font-medium ${s.is_open ? 'text-emerald-700' : 'text-slate-500'} w-14 shrink-0 text-right">${durStr}</span>
        </div>
    `;
}

function getDifferenceFmt(diff) {
    if (diff === 0 || !diff) {
        return `<span class="inline-flex items-center gap-1 text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded-md text-xs"><div class="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Balanced</span>`;
    } else if (diff > 0) {
        return `<span class="inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md text-xs"><div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> +${fmtMoney(diff)}</span>`;
    } else {
        return `<span class="inline-flex items-center gap-1 text-rose-700 font-medium bg-rose-50 px-2 py-0.5 rounded-md text-xs"><div class="w-1.5 h-1.5 rounded-full bg-rose-500"></div> -${fmtMoney(Math.abs(diff))}</span>`;
    }
}

function renderTable(list) {
  const tbody = document.getElementById("cs-table-body");
  if (!tbody) return;
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="px-6 py-10 text-center text-slate-400 text-sm">No cash sessions found</td></tr>`;
    renderPagination(0);
    return;
  }
  
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedList = list.slice(startIndex, endIndex);
  
  tbody.innerHTML = paginatedList.map(s => {
    const empName = esc(s.employee_name ?? "Admin User");
    const avatarColor = getAvatarColor(empName);
    
    // Row background based on state
    let rowClass = "hover:bg-slate-50/50 transition-colors bg-white";
    if (s.is_open) rowClass = "bg-emerald-50/30 hover:bg-emerald-50/60 transition-colors";
    else if (s.difference != 0 && s.difference != null) rowClass = "bg-rose-50/30 hover:bg-rose-50/60 transition-colors";

    return `
    <tr class="${rowClass}">
      <td class="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">#${s.id}</td>
      <td class="px-6 py-4 text-slate-500 whitespace-nowrap">${new Date(s.opened_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${avatarColor}">
                ${getInitials(empName)}
            </div>
            <span class="text-[13px] font-medium text-slate-700">${empName}</span>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap w-48">
        ${getProgressVisual(s)}
      </td>
      <td class="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">${fmtMoney(s.expected_cash ?? 0)}</td>
      <td class="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">${s.is_open ? `<span class="text-slate-300">—</span>` : fmtMoney(s.actual_closing_balance ?? 0)}</td>
      <td class="px-6 py-4 whitespace-nowrap">
        ${s.is_open ? `<span class="text-slate-300">—</span>` : getDifferenceFmt(s.difference)}
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-[13px] font-medium text-slate-900">${fmtMoney(s.total_sales ?? 0)}</div>
        <div class="text-xs text-slate-400 mt-0.5">${s.total_orders ?? 0} Orders</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        ${s.is_open 
            ? `<span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase">Open</span>`
            : `<span class="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase">Closed</span>`
        }
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right">
        <div class="flex items-center justify-end gap-2">
            <button onclick="window.openCashSessionDrawer(${s.id})" title="View Details" class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                <i data-lucide="eye" class="w-4 h-4"></i>
            </button>
            <button onclick="window.printCashSessionReport(${s.id})" title="Print Report" class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                <i data-lucide="receipt" class="w-4 h-4"></i>
            </button>
            ${s.is_open ? `
                <button onclick="window.closeSession(${s.id}, ${s.expected_cash})" title="Close Session" class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-rose-600 transition-colors">
                    <i data-lucide="lock" class="w-4 h-4"></i>
                </button>
            ` : ''}
        </div>
      </td>
    </tr>
    `;
  }).join("");
  createIcons({ icons });
  renderPagination(list.length);
}

window.goToCashSessionPage = function(page) {
    currentPage = page;
    renderTable(_all);
};

function renderPagination(totalItems) {
    const textEl = document.getElementById("cs-pagination-text");
    const controlsEl = document.getElementById("cs-pagination-controls");
    if (!textEl || !controlsEl) return;
    
    if (totalItems === 0) {
        textEl.textContent = "Showing 0 to 0 of 0 sessions";
        controlsEl.innerHTML = "";
        return;
    }
    
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    const start = (currentPage - 1) * PAGE_SIZE + 1;
    const end = Math.min(currentPage * PAGE_SIZE, totalItems);
    
    textEl.textContent = `Showing ${start} to ${end} of ${totalItems} sessions`;
    
    let html = '';
    
    // Prev
    html += `
        <button onclick="window.goToCashSessionPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} 
            class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <i data-lucide="chevron-left" class="w-4 h-4"></i>
        </button>
    `;
    
    // Pages
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            if (i === currentPage) {
                html += `<button class="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-medium text-sm">${i}</button>`;
            } else {
                html += `<button onclick="window.goToCashSessionPage(${i})" class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 font-medium text-sm transition-colors">${i}</button>`;
            }
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">...</span>`;
        }
    }
    
    // Next
    html += `
        <button onclick="window.goToCashSessionPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} 
            class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
        </button>
    `;
    
    controlsEl.innerHTML = html;
    createIcons({ icons });
}

// Drawers & Modals

window.openCashSessionDrawer = async function(id) {
    const s = _all.find(x => x.id === id);
    if (!s) return;
    
    document.getElementById('cs-drawer-overlay').classList.remove('hidden');
    const drawer = document.getElementById('cs-drawer');
    drawer.classList.remove('translate-x-full');
    
    // Fetch timeline
    drawer.innerHTML = `
        <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
                <h2 class="text-xl font-bold text-slate-900">Session #${s.id}</h2>
                <p class="text-sm text-slate-500 mt-1">${s.is_open ? 'Currently Open' : 'Closed'}</p>
            </div>
            <button onclick="window.closeCashSessionDrawer()" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 transition-colors">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>
        
        <div class="p-6 space-y-6 flex-1 overflow-y-auto">
            <!-- Summary -->
            <div class="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm">
                <div class="flex justify-between items-center text-sm">
                    <span class="text-slate-500">Cashier</span>
                    <span class="font-semibold text-slate-900">${s.employee_name || 'Admin'}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-slate-500">Opening Cash</span>
                    <span class="font-medium text-slate-900">${fmtMoney(s.opening_balance)}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-slate-500">Expected Cash</span>
                    <span class="font-medium text-slate-900">${fmtMoney(s.expected_cash)}</span>
                </div>
                ${!s.is_open ? `
                    <div class="flex justify-between items-center text-sm pt-3 border-t border-slate-100">
                        <span class="text-slate-500">Actual Cash</span>
                        <span class="font-bold text-slate-900">${fmtMoney(s.actual_closing_balance)}</span>
                    </div>
                    <div class="flex justify-between items-center text-sm pt-2">
                        <span class="text-slate-500">Difference</span>
                        ${getDifferenceFmt(s.difference)}
                    </div>
                ` : ''}
            </div>
            
            <div class="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm">
                <h4 class="text-sm font-bold text-slate-900 mb-3">Payments Breakdown</h4>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-slate-500">Total Sales</span>
                    <span class="font-medium text-slate-900">${fmtMoney(s.total_sales)}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-slate-500 ml-4 border-l-2 border-slate-200 pl-2">Cash</span>
                    <span class="font-medium text-slate-700">${fmtMoney(s.cash_payments)}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-slate-500 ml-4 border-l-2 border-slate-200 pl-2">Card</span>
                    <span class="font-medium text-slate-700">${fmtMoney(s.card_payments)}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-slate-500 ml-4 border-l-2 border-slate-200 pl-2">Bank</span>
                    <span class="font-medium text-slate-700">${fmtMoney(s.bank_payments)}</span>
                </div>
            </div>
            
            ${s.notes ? `
                <div class="bg-yellow-50 rounded-xl border border-yellow-200 p-4 text-sm text-yellow-800 shadow-sm">
                    <strong class="block mb-1">Session Notes:</strong>
                    ${esc(s.notes)}
                </div>
            ` : ''}
            
            <div>
                <h4 class="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><i data-lucide="history" class="w-4 h-4"></i> Session Timeline</h4>
                <div id="cs-timeline" class="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    <div class="text-center py-4 text-slate-400 text-sm">Loading timeline...</div>
                </div>
            </div>
        </div>
        <div class="p-4 border-t border-slate-100 bg-white">
            <button onclick="window.printCashSessionReport(${s.id})" class="w-full h-12 flex justify-center items-center gap-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors">
                <i data-lucide="printer" class="w-4 h-4"></i> Print Detailed Report
            </button>
        </div>
    `;
    createIcons({ icons });
    
    try {
        const timeline = await api(`/cash-sessions/${id}/timeline/`);
        const tlContainer = document.getElementById('cs-timeline');
        
        tlContainer.innerHTML = timeline.map((ev, idx) => {
            let icon = 'circle';
            let color = 'bg-slate-100 text-slate-500';
            
            if (ev.type === 'opened') { icon = 'play'; color = 'bg-emerald-100 text-emerald-600'; }
            if (ev.type === 'closed') { icon = 'lock'; color = 'bg-slate-800 text-slate-200'; }
            if (ev.type === 'sale') { icon = 'shopping-bag'; color = 'bg-blue-100 text-blue-600'; }
            if (ev.type === 'refund') { icon = 'rotate-ccw'; color = 'bg-orange-100 text-orange-600'; }
            if (ev.type === 'cash_in') { icon = 'arrow-down-to-line'; color = 'bg-emerald-100 text-emerald-600'; }
            if (ev.type === 'cash_out') { icon = 'arrow-up-from-line'; color = 'bg-rose-100 text-rose-600'; }
            
            return `
            <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div class="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${color} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <i data-lucide="${icon}" class="w-4 h-4"></i>
                </div>
                <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                    <div class="flex items-center justify-between mb-1">
                        <div class="font-bold text-slate-900 text-[13px]">${ev.type === 'sale' ? ev.description : esc(ev.description)}</div>
                        <div class="text-xs text-slate-500">${new Date(ev.timestamp).toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'})}</div>
                    </div>
                    <div class="text-sm font-medium ${ev.type === 'cash_out' || ev.type === 'refund' ? 'text-rose-600' : 'text-emerald-600'}">
                        ${ev.type === 'cash_out' || ev.type === 'refund' ? '-' : '+'}${fmtMoney(ev.amount)}
                    </div>
                </div>
            </div>
            `;
        }).join("");
        createIcons({ icons });
    } catch (e) {
        document.getElementById('cs-timeline').innerHTML = `<div class="text-red-500 text-sm text-center py-4">Failed to load timeline</div>`;
    }
};

window.closeCashSessionDrawer = function() {
    document.getElementById('cs-drawer').classList.add('translate-x-full');
    setTimeout(() => {
        document.getElementById('cs-drawer-overlay').classList.add('hidden');
    }, 300);
};

window.openCashTransactionModal = function(type) {
    if (!_activeSession) {
        alert("There is no active cash session to perform a cash transaction.");
        return;
    }
    _txType = type;
    document.getElementById('cash-tx-modal').classList.remove('hidden');
    document.getElementById('cash-tx-title').textContent = type === 'in' ? 'Cash In' : 'Cash Out';
    document.getElementById('cash-tx-amount').value = '';
    document.getElementById('cash-tx-reason').value = '';
    document.getElementById('cash-tx-amount').focus();
};

window.closeCashTransactionModal = function() {
    document.getElementById('cash-tx-modal').classList.add('hidden');
};

window.submitCashTransaction = async function() {
    const amount = document.getElementById('cash-tx-amount').value;
    const reason = document.getElementById('cash-tx-reason').value;
    
    if (!amount || amount <= 0 || !reason) {
        alert("Please enter a valid amount and reason.");
        return;
    }
    
    const btn = document.getElementById('cash-tx-submit');
    const originalText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;
    
    try {
        await api(`/cash-sessions/${_activeSession.id}/${_txType}/`, {
            method: 'POST',
            body: JSON.stringify({ amount, reason })
        });
        window.closeCashTransactionModal();
        await window.loadCashSessions(); // Refresh UI
    } catch (e) {
        alert(`Failed: ${e.message}`);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
};

window.closeSession = async function(id, expectedCash) {
    const actualStr = prompt(`Closing Session #${id}\n\nExpected Cash: ${fmtMoney(expectedCash)}\n\nEnter Actual Cash counted in drawer:`, expectedCash);
    if (actualStr === null) return;
    
    const actual = parseFloat(actualStr);
    if (isNaN(actual) || actual < 0) {
        alert("Invalid amount entered.");
        return;
    }
    
    let notes = "";
    if (actual !== expectedCash) {
        notes = prompt(`Cash Difference detected!\nExpected: ${expectedCash}\nActual: ${actual}\nDifference: ${actual - expectedCash}\n\nPlease enter a note/reason for this discrepancy:`);
        if (notes === null) return; // cancelled
    }
    
    try {
        await api(`/cash-sessions/${id}/close/`, {
            method: 'POST',
            body: JSON.stringify({ actual_cash: actual, notes: notes })
        });
        await window.loadCashSessions();
    } catch (e) {
        alert(`Failed to close session: ${e.message}`);
    }
};

function esc(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function fmtMoney(n) { return `Rs ${Number(n).toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`; }

// --- Export Functions ---
window.toggleExportMenu = function(e) {
    e.stopPropagation();
    document.getElementById('export-menu').classList.toggle('hidden');
};

window.closeExportMenu = function() {
    document.getElementById('export-menu').classList.add('hidden');
};

document.addEventListener('click', (e) => {
    const menu = document.getElementById('export-menu');
    const container = document.getElementById('export-menu-container');
    if (menu && !menu.classList.contains('hidden') && container && !container.contains(e.target)) {
        menu.classList.add('hidden');
    }
});

function buildExportUrl(type, sessionId = null) {
    const status = document.getElementById('cs-status-filter')?.value || '';
    const date = document.getElementById("cs-date-filter")?.value ?? "";
    const search = document.getElementById("cs-search")?.value ?? "";
    const cashier = currentCashier;
    
    let qs = new URLSearchParams();
    if (status) qs.append('status', status);
    if (date) qs.append('date', date);
    if (cashier) qs.append('cashier', cashier);
    if (search) qs.append('search', search);
    if (sessionId) qs.append('id', sessionId);
    
    const qsStr = qs.toString() ? `?${qs.toString()}` : '';
    return `${BASE}/cash-sessions/export/${type}/${qsStr}`;
}

async function triggerDownload(url, filename) {
    try {
        const res = await fetch(url, { headers: Auth.authHeader() });
        if (!res.ok) throw new Error("Export failed");
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (e) {
        alert(e.message);
    }
}

window.exportCSV = () => triggerDownload(buildExportUrl("csv"), "cash_sessions.csv");
window.exportExcel = () => triggerDownload(buildExportUrl("excel"), "cash_sessions.xlsx");
window.exportPdf = () => triggerDownload(buildExportUrl("pdf"), "cash_sessions.pdf");
window.printCashSessionReport = (id) => triggerDownload(buildExportUrl("pdf", id), `cash_session_${id}.pdf`);

