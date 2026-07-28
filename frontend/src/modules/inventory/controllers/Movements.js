import { createIcons, icons } from "lucide";

import {
    getMovements,
    getMovement,
    getMovementSummary
} from "../../../js/inventory/services/inventory-api";
import { MovementDetailModal } from "../../../js/Movements/components/MovementDetailModal.js";
import { Pagination } from "../../../shared/Pagination";


let filters = {

    search: "",

    movement_type: "",

    product: "",

    category: "",

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

        await loadMovements();

    }

});


window.initializeMovements = async function () {

    pagination.initialize();

    await loadMovements();

    initializeMovementEvents();

}

async function loadMovements() {

    const response = await getMovements(filters);

    renderMovementTable(response.results);

    pagination.updateFromResponse(response);

    console.log(response.results.length);

    const summary = await getMovementSummary();

    updateMovementCards(summary);

    createIcons({ icons });

}


function initializeMovementEvents() {

    const search = document.getElementById("movement-search");

    if (search) {

        search.addEventListener("input", debounce(async (e) => {

            filters.search = e.target.value;

            filters.page = 1;

            pagination.reset();

            await loadMovements();

        }, 400));

    }

    const movementFilter = document.getElementById("movement-filter");

    if (movementFilter) {
    
        movementFilter.addEventListener("change", async (e) => {
        
            filters.movement_type = e.target.value;
        
            filters.page = 1;

            pagination.reset();
        
            await loadMovements();
        
        });
    
    }

    const dateFilter = document.getElementById("date-filter");

    if (dateFilter) {

        dateFilter.addEventListener("change", async (e) => {

            filters.date = e.target.value;

            filters.page = 1;

            pagination.reset();

            await loadMovements();

        });

    }

}

window.refreshMovements = async function () {

    filters = {

        search: "",

        movement_type: "",

        product: "",

        category: "",

        date: "",

        start_date: "",

        end_date: "",

        page: 1,

        page_size: 20,

        ordering: "-created_at",

    };

    document.getElementById("movement-search").value = "";
    document.getElementById("movement-filter").value = "";
    document.getElementById("date-filter").value = "";

    pagination.reset();

    await loadMovements();

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


function renderMovementTable(rows) {

document.getElementById("movement-table").innerHTML = `

<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">

<table class="w-full">

<thead class="bg-slate-50 border-b border-slate-200">

<tr>

<th class="px-6 py-4 text-left">

<div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">

<i data-lucide="package" class="w-4 h-4 text-slate-400"></i>

<span>Product</span>

</div>

</th>

<th class="px-4 py-4 text-left">

<div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">

<i data-lucide="repeat" class="w-4 h-4 text-slate-400"></i>

<span>Movement</span>

</div>

</th>

<th class="px-4 py-4 text-center">

<div class="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">

<i data-lucide="activity" class="w-4 h-4 text-slate-400"></i>

Qty

</div>

</th>

<th class="px-4 py-4 text-center">

<div class="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">

<i data-lucide="archive" class="w-4 h-4 text-slate-400"></i>

Previous

</div>

</th>

<th class="px-4 py-4 text-center">

<div class="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">

<i data-lucide="circle-check-big" class="w-4 h-4 text-emerald-500"></i>

New

</div>

</th>

<th class="px-4 py-4 text-left">

<div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">

<i data-lucide="tag" class="w-4 h-4 text-slate-400"></i>

Reference

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

${rows.map(row=>`

<tr

onclick="viewMovementDetail(${row.id})"

class="group border-b border-slate-100 hover:bg-sky-50/40 transition-all cursor-pointer">

<td class="px-6 py-5">

<div class="flex items-center gap-3">

<div class="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm">

${row.image ? `

<img
    src="http://127.0.0.1:8000/${row.image}"
    alt="${row.product}"
    class="w-full h-full object-cover"
/>

` : `

<i
    data-lucide="package-2"
    class="w-5 h-5 text-slate-400">
</i>

`}

</div>

<div>

<p class="font-semibold text-slate-800">

${row.product}

</p>

<p class="text-xs text-slate-400">

Inventory Product

</p>

</div>

</div>

</td>

<td class="px-4">

${movementBadge(row)}

</td>

<td class="px-4 text-center">

${quantity(row)}

</td>

<td class="px-4 text-center">

<span class="inline-flex px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold">

${row.previous_stock ?? "-"}

</span>

</td>

<td class="px-4 text-center">

<span class="inline-flex px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-semibold">

${row.new_stock ?? "-"}

</span>

</td>

<td class="px-4">

<span class="font-medium text-slate-700">

${row.reference || "-"}

</span>

</td>

<td class="px-6">

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

class="w-5 h-5 text-slate-300 group-hover:text-sky-500 transition">

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


function movementBadge(row){

const colors={

sale:"bg-red-100 text-red-700",

purchase:"bg-emerald-100 text-emerald-700",

refund:"bg-blue-100 text-blue-700",

adjustment:"bg-amber-100 text-amber-700",

damage:"bg-orange-100 text-orange-700"

};

return `

<span class="px-3 py-1 rounded-full text-xs font-semibold ${colors[row.movement_type] || "bg-gray-100"}">

${row.movement}

</span>

`;

}


function quantity(row){

if(row.quantity>0){

return `<span class="text-emerald-600 font-bold">+${row.quantity}</span>`;

}

return `<span class="text-red-600 font-bold">${row.quantity}</span>`;

}


function updateMovementCards(summary) {

    animateCounter(
        "today-movements",
        summary.total_movements
    );

    animateCounter(
        "stock-in",
        summary.stock_added
    );

    animateCounter(
        "stock-out",
        summary.stock_removed
    );

    animateCounter(
        "adjustments",
        summary.net_change
    );

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


window.viewMovementDetail = async function(id) {

    const movement = await getMovement(id);

    document.getElementById("movement-detail-body").innerHTML =
        MovementDetailModal(movement);

    createIcons({ icons });

    openMovementDetailModal();

};

window.openMovementDetailModal = function () {

    const modal = document.getElementById("movement-detail-modal");

    modal.classList.remove("hidden");
    modal.classList.add("flex");

};

window.closeMovementDetailModal = function () {

    const modal = document.getElementById("movement-detail-modal");

    modal.classList.add("hidden");
    modal.classList.remove("flex");

};


// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================
function toggleExportMenu(event) {
  event.stopPropagation();
  const menu = document.getElementById("export-menu");
  menu?.classList.toggle("hidden");
}

function closeExportMenu() {
  document.getElementById("export-menu")?.classList.add("hidden");
}


function buildExportUrl(format) {

    const params = new URLSearchParams();

    if (filters.search)
        params.append("search", filters.search);

    if (filters.movement_type)
        params.append("movement_type", filters.movement_type);

    if (filters.product)
        params.append("product", filters.product);

    if (filters.category)
        params.append("category", filters.category);

    if (filters.start_date)
        params.append("start_date", filters.start_date);

    if (filters.end_date)
        params.append("end_date", filters.end_date);

    return `http://127.0.0.1:8000/api/inventory/movements/export/${format}/?${params.toString()}`;
}


function exportMovementCSV() {

    window.open(
        buildExportUrl("csv"),
        "_blank"
    );

}


function exportMovementExcel() {

    window.open(
        buildExportUrl("excel"),
        "_blank"
    );

}


function exportMovementPdf() {

    window.open(
        buildExportUrl("pdf"),
        "_blank"
    );

}



// ============================================================================
// WINDOW BINDINGS
// ============================================================================
window.toggleExportMenu = toggleExportMenu;
window.closeExportMenu = closeExportMenu;
window.exportMovementCSV = exportMovementCSV;
window.exportMovementExcel = exportMovementExcel;
window.exportMovementPdf = exportMovementPdf;