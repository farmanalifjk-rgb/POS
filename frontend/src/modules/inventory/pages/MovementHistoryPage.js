import { Sidebar } from "../../../components/Sidebar";
import { MovementCards } from "../../../js/movements/components/MovementCards";
import { MovementToolbar } from "../../../js/Movements/components/MovementToolbar";
import { createIcons, icons } from "lucide";
import { Pagination } from "../../../shared/Pagination";


export function MovementHistoryPage() {
    return `

<div class="flex h-screen bg-[#f4f7f6]">

    ${Sidebar()}

    <main class="flex-1 p-8 overflow-y-auto">

        <div class="flex items-center justify-between">

            <div>

                <h1 class="text-3xl font-bold">
                    Inventory Movements
                </h1>

                <p class="text-gray-500 mt-1">
                    Complete stock movement history
                </p>

            </div>

            <div class="relative" id="export-menu-container">

                            <button onclick="toggleExportMenu(event)"
                                class="h-10 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition">

                                <i data-lucide="download" class="w-4 h-4">
                                </i>

                                Export Inventory

                                <i data-lucide="chevron-down" class="w-4 h-4 text-gray-400">
                                </i>

                            </button>

                            <div id="export-menu"
                                class="hidden absolute right-0 top-12 w-60 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-50">

                                <!-- CSV -->
                                <button onclick="exportMovementCSV(); closeExportMenu()"
                                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition text-left">

                                    <div class="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">

                                        <i data-lucide="file-spreadsheet" class="w-4 h-4 text-emerald-600">
                                        </i>

                                    </div>

                                    <div>

                                        <p class="font-medium text-gray-800">
                                            Export Inventory (CSV)
                                        </p>

                                        <p class="text-xs text-gray-400">
                                            Filtered inventory data (.csv)
                                        </p>

                                    </div>

                                </button>

                                <!-- Excel -->
                                <button onclick="exportMovementExcel(); closeExportMenu()"
                                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition text-left">

                                    <div class="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">

                                        <i data-lucide="sheet" class="w-4 h-4 text-green-600">
                                        </i>

                                    </div>

                                    <div>

                                        <p class="font-medium text-gray-800">
                                            Export Inventory (Excel)
                                        </p>

                                        <p class="text-xs text-gray-400">
                                            Microsoft Excel (.xlsx)
                                        </p>

                                    </div>

                                </button>

                                <!-- PDF -->
                                <button onclick="exportMovementPdf(); closeExportMenu()"
                                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition text-left">

                                    <div class="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">

                                        <i data-lucide="file-text" class="w-4 h-4 text-red-600">
                                        </i>

                                    </div>

                                    <div>

                                        <p class="font-medium text-gray-800">
                                            Export Inventory (PDF)
                                        </p>

                                        <p class="text-xs text-gray-400">
                                            Printable filtered inventory report
                                        </p>

                                    </div>

                                </button>

                            </div>

                        </div>

        </div>

        ${MovementCards()}

        <div class="premium-surface rounded-3xl p-6">

            ${MovementToolbar()}

            <div id="movement-table"></div>

        </div>

        <!-- ============================================================================
     PAGINATION
     Requires: Lucide icons (createIcons), Pagination.js module
============================================================================ -->
<div class="flex items-center justify-between px-6 py-4 border-t border-gray-100">

  <!-- Optional: results summary (static text, update manually if needed) -->
  <p
    id="pagination-info"
    class="text-sm text-gray-500">
</p>

  <!-- Prev / Page X of Y / Next -->
  <div class="flex items-center gap-2">

    <button
      id="prev-page"
      class="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition"
      disabled
    >
      <i data-lucide="chevron-left" class="w-4 h-4"></i>
    </button>

    <!-- Pagination.js injects "Page X of Y" here -->
    <div id="pagination-numbers" class="text-sm text-gray-600 font-medium">
      <span class="px-3 py-1 bg-gray-50 rounded-lg border border-gray-200">Page 1 of 1</span>
    </div>

    <button
      id="next-page"
      class="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition"
      disabled
    >
      <i data-lucide="chevron-right" class="w-4 h-4"></i>
    </button>

  </div>

</div>

<div
    id="movement-detail-modal"
    class="hidden fixed inset-0 bg-black/50 z-50 items-center justify-center p-8">

    <div id="movement-detail-body"></div>

</div>

    </main>

</div>

`;
}