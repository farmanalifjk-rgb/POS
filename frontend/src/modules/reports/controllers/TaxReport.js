import { createIcons, icons } from "lucide";
import { getTaxReport } from "../../../js/inventory/services/inventory-api";

let taxFilters = { start_date: "", end_date: "", payment: "", date: "" };

window.initializeTaxReport = async function() {
    initializeTaxEvents();
    await loadTaxReport();
}

async function loadTaxReport() {
    try {
        const response = await getTaxReport(taxFilters);
        renderTaxSummary(response?.summary || {});
        renderTaxTable(response?.orders || []);
        createIcons({ icons });
    } catch (e) {
        console.error("Failed to load tax report", e);
    }
}

function initializeTaxEvents() {
    const start = document.getElementById("tax-start-date");
    const end = document.getElementById("tax-end-date");
    const payment = document.getElementById("tax-payment-method");
    
    if (start) {
        start.addEventListener("change", (e) => {
            taxFilters.start_date = e.target.value;
            taxFilters.date = "";
            loadTaxReport();
        });
    }
    if (end) {
        end.addEventListener("change", (e) => {
            taxFilters.end_date = e.target.value;
            taxFilters.date = "";
            loadTaxReport();
        });
    }
    if (payment) {
        payment.addEventListener("change", (e) => {
            taxFilters.payment = e.target.value;
            loadTaxReport();
        });
    }
}

window.applyTaxDateRange = function(rangeType) {
    taxFilters.date = rangeType;
    taxFilters.start_date = "";
    taxFilters.end_date = "";
    
    const start = document.getElementById("tax-start-date");
    const end = document.getElementById("tax-end-date");
    if(start) start.value = "";
    if(end) end.value = "";
    
    loadTaxReport();
};

window.refreshTaxReport = async function() {
    taxFilters = { start_date: "", end_date: "", payment: "", date: "" };
    
    const start = document.getElementById("tax-start-date");
    const end = document.getElementById("tax-end-date");
    const payment = document.getElementById("tax-payment-method");
    
    if(start) start.value = "";
    if(end) end.value = "";
    if(payment) payment.value = "";
    
    await loadTaxReport();
};

window.exportTaxReport = function(format) {
    const qs = new URLSearchParams(taxFilters).toString();
    window.open(`/api/reports/tax/export/${format}/?${qs}`, '_blank');
};

function renderTaxSummary(summary) {
    document.getElementById("summary-total-tax").textContent = `$${parseFloat(summary.total_tax || 0).toFixed(2)}`;
    document.getElementById("summary-month-tax").textContent = `$${parseFloat(summary.this_month_tax || 0).toFixed(2)}`;
    document.getElementById("summary-week-tax").textContent = `$${parseFloat(summary.this_week_tax || 0).toFixed(2)}`;
    document.getElementById("summary-avg-tax").textContent = `$${parseFloat(summary.avg_tax || 0).toFixed(2)}`;
}

function renderTaxTable(orders) {
    if (!orders || orders.length === 0) {
        document.getElementById("tax-table").innerHTML = `<div class="text-center py-10 text-slate-500">No tax records found.</div>`;
        return;
    }

    const rows = orders.map(order => `
        <tr class="group border-b border-slate-100 hover:bg-violet-50/40 transition-all cursor-pointer">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#${order.order_number || order.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${order.date || order.created_at || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">${order.customer || 'Walk-in'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">$${parseFloat(order.subtotal || 0).toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                <span class="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-700">
                    ${order.tax_rate || 0}%
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-violet-600">$${parseFloat(order.tax || 0).toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">$${parseFloat(order.total || 0).toFixed(2)}</td>
        </tr>
    `).join("");

    document.getElementById("tax-table").innerHTML = `
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order #</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtotal</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tax Rate</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tax Amount</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-slate-200">
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}
