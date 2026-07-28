import { createIcons, icons } from "lucide";

import {getAdjustments,getAdjustment,createAdjustment,} from "../../../js/inventory/services/inventory-api";
import { AdjustmentDetailModal } from "../../../js/Adjustments/components/AdjustmentDetailModal.js";
import { Pagination } from "../../../shared/Pagination";


let filters = {

    search: "",

    reason: "",

    date: "",

    start_date: "",

    end_date: "",

    page: 1,

    page_size: 20,

    ordering: "-created_at",

};

// ============================================================================
// PAGINATION
// ============================================================================
const pagination = new Pagination({

    prevButtonId: "prev-page",

    nextButtonId: "next-page",

    containerId: "pagination-numbers",

    pageSize: filters.page_size,

    onPageChange: async (page) => {

        filters.page = page;

        await loadAdjustments();

    }

});


window.initializeAdjustments = async function () {

    pagination.initialize();

    await loadAdjustments();

    initializeAdjustmentEvents();

}

async function loadAdjustments() {

    const response = await getAdjustments(filters);

    console.log(response);

    renderAdjustmentTable(response.results);

    pagination.updateFromResponse(response);

    updateAdjustmentCards(response);

    createIcons({ icons });

}


function initializeAdjustmentEvents() {

    const search = document.getElementById("adjustment-search");

    if (search) {

        search.addEventListener("input", debounce(async (e) => {

            filters.search = e.target.value;

            filters.page = 1;

            pagination.reset();

            await loadAdjustments();

        }, 400));

    }

    const reasonFilter = document.getElementById("adjustment-reason-filter");

    if (reasonFilter) {

        reasonFilter.addEventListener("change", async (e) => {

            filters.reason = e.target.value;

            filters.page = 1;

            pagination.reset();

            await loadAdjustments();

        });

    }

    const dateFilter = document.getElementById("adjustment-date-filter");

    if (dateFilter) {

        dateFilter.addEventListener("change", async (e) => {

            filters.date = e.target.value;

            filters.page = 1;

            pagination.reset();

            await loadAdjustments();

        });

    }

}

window.refreshAdjustments = async function () {

    filters = {

        search: "",

        reason: "",

        date: "",

        start_date: "",

        end_date: "",

        page: 1,

        page_size: 20,

        ordering: "-created_at",

    };

    document.getElementById("adjustment-search").value = "";
    document.getElementById("adjustment-reason-filter").value = "";
    document.getElementById("adjustment-date-filter").value = "";

    pagination.reset();

    await loadAdjustments();

};


function debounce(callback, delay = 300) {

    let timer;

    return (...args) => {

        clearTimeout(timer);

        timer = setTimeout(() => {

            callback(...args);

        }, delay);

    };

}


function renderAdjustmentTable(rows) {

document.getElementById("adjustment-table").innerHTML = `

<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">

<table class="w-full">

<thead class="bg-slate-50 border-b border-slate-200">

<tr>

<th class="px-6 py-4 text-left">

<div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">

<i data-lucide="hash" class="w-4 h-4 text-slate-400"></i>

<span>Adjustment #</span>

</div>

</th>

<th class="px-4 py-4 text-center">

<div class="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">

<i data-lucide="layers" class="w-4 h-4 text-slate-400"></i>

<span>Items</span>

</div>

</th>

<th class="px-4 py-4 text-center">

<div class="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">

<i data-lucide="activity" class="w-4 h-4 text-slate-400"></i>

Net Change

</div>

</th>

<th class="px-4 py-4 text-left">

<div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">

<i data-lucide="file-text" class="w-4 h-4 text-slate-400"></i>

Note

</div>

</th>

<th class="px-6 py-4 text-left">

<div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">

<i data-lucide="calendar-days" class="w-4 h-4 text-slate-400"></i>

Date

</div>

</th>

<th class="w-12"></th>

</tr>

</thead>

<tbody>

${rows.map(row => `

<tr

onclick="viewAdjustmentDetail('${row.adjustment_number}')"

class="group border-b border-slate-100 hover:bg-violet-50/40 transition-all cursor-pointer">

<td class="px-6 py-5">

<span class="font-semibold text-slate-800">
    ${row.adjustment_number}
</span>

</td>

<td class="px-4 py-5 text-center">

<span class="inline-flex px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold">

${row.items_count ?? (row.items ? row.items.length : "-")}

</span>

</td>

<td class="px-4 py-5 text-center">

${netChangeBadge(row)}

</td>

<td class="px-4 py-5">

<span class="text-slate-600 text-sm line-clamp-2 max-w-xs">

${row.note || "-"}

</span>

</td>

<td class="px-6 py-5">

<div class="flex items-center gap-2 text-slate-600">

<i data-lucide="clock-3"

class="w-4 h-4 text-slate-400">

</i>

${new Date(row.created_at).toLocaleString()}

</div>

</td>

<td>

<i

data-lucide="chevron-right"

class="w-5 h-5 text-slate-300 group-hover:text-violet-500 transition">

</i>

</td>

</tr>

`).join("")}

</tbody>

</table>

</div>

`;

createIcons({ icons });

}


function netChangeBadge(row) {

    const net = row.net_change ?? 0;

    if (net > 0) {

        return `<span class="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">+${net}</span>`;

    }

    if (net < 0) {

        return `<span class="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">${net}</span>`;

    }

    return `<span class="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">0</span>`;

}


function updateAdjustmentCards(response) {

    animateCounter("total-adjustments", response.count ?? 0);

    const results = response.results ?? [];

    const totalItems = results.reduce((sum, r) => {
        return sum + (r.items_count ?? (r.items ? r.items.length : 0));
    }, 0);

    animateCounter("items-adjusted", totalItems);

    const increased = results.filter(r => (r.net_change ?? 0) > 0).length;
    const decreased = results.filter(r => (r.net_change ?? 0) < 0).length;

    animateCounter("stock-increased", increased);
    animateCounter("stock-decreased", decreased);

}


function animateCounter(id, endValue, duration = 800) {

    const element = document.getElementById(id);

    if (!element) return;

    const startValue = parseInt(element.textContent.replace(/,/g, "")) || 0;

    const startTime = performance.now();

    function update(currentTime) {

        const progress = Math.min(
            (currentTime - startTime) / duration,
            1
        );

        const value = Math.floor(
            startValue + (endValue - startValue) * progress
        );

        element.textContent = value.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }

    }

    requestAnimationFrame(update);

}


window.viewAdjustmentDetail = async function (adjustmentNumber) {

    const adjustment = await getAdjustment(adjustmentNumber);

    document.getElementById("adjustment-detail-body").innerHTML =
        AdjustmentDetailModal(adjustment);

    createIcons({ icons });

    openAdjustmentDetailModal();

};

window.openAdjustmentDetailModal = function () {

    const modal = document.getElementById("adjustment-detail-modal");

    modal.classList.remove("hidden");
    modal.classList.add("flex");

};

window.closeAdjustmentDetailModal = function () {

    const modal = document.getElementById("adjustment-detail-modal");

    modal.classList.add("hidden");
    modal.classList.remove("flex");

};


// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================
function toggleAdjustmentExportMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById("adjustment-export-menu");
    menu?.classList.toggle("hidden");
}

function closeAdjustmentExportMenu() {
    document.getElementById("adjustment-export-menu")?.classList.add("hidden");
}


function buildAdjustmentExportUrl(format) {

    const params = new URLSearchParams();

    if (filters.search)
        params.append("search", filters.search);

    if (filters.reason)
        params.append("reason", filters.reason);

    if (filters.start_date)
        params.append("start_date", filters.start_date);

    if (filters.end_date)
        params.append("end_date", filters.end_date);

    return `http://127.0.0.1:8000/api/inventory/stock-adjustments/export/${format}/?${params.toString()}`;
}


function exportAdjustmentCSV() {

    window.open(
        buildAdjustmentExportUrl("csv"),
        "_blank"
    );

}


function exportAdjustmentExcel() {

    window.open(
        buildAdjustmentExportUrl("excel"),
        "_blank"
    );

}


function exportAdjustmentPdf() {

    window.open(
        buildAdjustmentExportUrl("pdf"),
        "_blank"
    );

}


// ============================================================================
// WINDOW BINDINGS
// ============================================================================
window.toggleAdjustmentExportMenu = toggleAdjustmentExportMenu;
window.closeAdjustmentExportMenu = closeAdjustmentExportMenu;
window.exportAdjustmentCSV = exportAdjustmentCSV;
window.exportAdjustmentExcel = exportAdjustmentExcel;
window.exportAdjustmentPdf = exportAdjustmentPdf;