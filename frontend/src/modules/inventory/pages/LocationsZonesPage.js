import { Sidebar } from '../../../components/Sidebar';

export function LocationsZonesPage() {
    return `
    <div class="flex h-screen bg-[#f8fafc]">
        ${Sidebar()}
        <main class="flex-1 overflow-y-auto p-8">
            <div class="max-w-7xl mx-auto space-y-6 flex flex-col h-full">
                <!-- Header -->
                <div class="flex justify-between items-center">
                    <div>
                        <h1 class="text-2xl font-bold text-slate-800 tracking-tight">Locations & Bin Management</h1>
                        <p class="text-slate-500 mt-1 text-sm">Manage physical storage locations within warehouses</p>
                    </div>
                </div>

                <!-- Stats Row -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center">
                        <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mr-4">
                            <i data-lucide="warehouse" class="w-6 h-6 text-blue-500"></i>
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-slate-800" id="stat-lz-warehouses">0</div>
                            <div class="text-xs font-medium text-slate-500 uppercase tracking-wide">Warehouses</div>
                        </div>
                    </div>
                    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center">
                        <div class="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mr-4">
                            <i data-lucide="map" class="w-6 h-6 text-indigo-500"></i>
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-slate-800" id="stat-lz-bins">0</div>
                            <div class="text-xs font-medium text-slate-500 uppercase tracking-wide">Assigned Bins</div>
                        </div>
                    </div>
                    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center">
                        <div class="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mr-4">
                            <i data-lucide="alert-circle" class="w-6 h-6 text-amber-500"></i>
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-slate-800" id="stat-lz-unassigned">0</div>
                            <div class="text-xs font-medium text-slate-500 uppercase tracking-wide">Needs Assignment</div>
                        </div>
                    </div>
                </div>

                <!-- Main Layout -->
                <div class="flex gap-6 flex-1 min-h-0">
                    <!-- Left Panel: Warehouses -->
                    <div class="w-80 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden shrink-0">
                        <div class="px-4 py-3 border-b border-slate-100 bg-slate-50">
                            <h2 class="font-semibold text-slate-700">Select Warehouse</h2>
                        </div>
                        <div class="overflow-y-auto flex-1 p-2 space-y-1" id="lz-warehouse-list">
                            <div class="p-4 text-center text-slate-500 text-sm">Loading warehouses...</div>
                        </div>
                    </div>

                    <!-- Right Panel: Bins -->
                    <div class="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden relative">
                        <div class="px-5 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                            <h2 class="font-semibold text-slate-700 flex items-center" id="lz-current-wh-title">
                                <i data-lucide="layout-grid" class="w-4 h-4 mr-2 text-indigo-500"></i>
                                Bin Locations
                            </h2>
                            <div class="relative">
                                <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                                <input type="text" id="lz-search" placeholder="Search product or bin..." class="pl-9 pr-4 py-1.5 text-sm border-slate-300 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-64 outline-none">
                            </div>
                        </div>
                        
                        <div class="flex-1 overflow-y-auto relative" id="lz-bins-container">
                            <!-- Empty State -->
                            <div class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-white" id="lz-empty-state">
                                <i data-lucide="arrow-left-square" class="w-12 h-12 mb-3 text-slate-300"></i>
                                <p class="text-base font-medium text-slate-500">Select a warehouse to manage bins</p>
                                <p class="text-sm mt-1">View and assign physical locations to inventory</p>
                            </div>
                            
                            <!-- Table -->
                            <table class="w-full text-left text-sm hidden" id="lz-bins-table">
                                <thead class="bg-white sticky top-0 border-b border-slate-200 shadow-sm z-10">
                                    <tr>
                                        <th class="px-5 py-3 font-medium text-slate-500 uppercase text-xs">Product</th>
                                        <th class="px-5 py-3 font-medium text-slate-500 uppercase text-xs">SKU</th>
                                        <th class="px-5 py-3 font-medium text-slate-500 uppercase text-xs">Qty</th>
                                        <th class="px-5 py-3 font-medium text-slate-500 uppercase text-xs">Bin Location</th>
                                        <th class="px-5 py-3 font-medium text-slate-500 uppercase text-xs text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100" id="lz-bins-tbody">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    `;
}
