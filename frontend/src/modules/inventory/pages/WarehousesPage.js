import { Sidebar } from '../../../components/Sidebar.js';

export default function WarehousesPage() {
    return `
    <div class='flex h-screen bg-[#f8fafc]'>
        ${Sidebar()}
        <main class='flex-1 overflow-y-auto p-8'>
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">Warehouses</h1>
                    <p class="text-slate-500 mt-1">Manage warehouse locations and inventory stock</p>
                </div>
                <div class="flex items-center gap-4">
                    <div class="relative w-64">
                        <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                        <input type="text" id="warehouse-search" placeholder="Search..." class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    </div>
                    <button onclick="window.openWarehouseModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2">
                        <i data-lucide="plus" class="w-5 h-5"></i>
                        Add Warehouse
                    </button>
                </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-sm font-medium text-slate-500">Total Warehouses</p>
                            <h3 class="text-2xl font-bold text-slate-800 mt-1" id="total-warehouses">0</h3>
                        </div>
                        <div class="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <i data-lucide="warehouse" class="w-6 h-6"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-sm font-medium text-slate-500">Active Warehouses</p>
                            <h3 class="text-2xl font-bold text-slate-800 mt-1" id="active-warehouses">0</h3>
                        </div>
                        <div class="p-3 bg-green-50 text-green-600 rounded-lg">
                            <i data-lucide="check-circle" class="w-6 h-6"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-sm font-medium text-slate-500">Total Products</p>
                            <h3 class="text-2xl font-bold text-slate-800 mt-1" id="total-products">0</h3>
                        </div>
                        <div class="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <i data-lucide="package" class="w-6 h-6"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-sm font-medium text-slate-500">Low Stock Items</p>
                            <h3 class="text-2xl font-bold text-red-600 mt-1" id="low-stock-items">0</h3>
                        </div>
                        <div class="p-3 bg-red-50 text-red-600 rounded-lg">
                            <i data-lucide="alert-triangle" class="w-6 h-6"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Two Panel Layout -->
            <div class="flex flex-col lg:flex-row gap-6 h-[calc(100vh-280px)] min-h-[500px]">
                
                <!-- Left Panel: Warehouse List -->
                <div class="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                    <div class="p-4 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700">
                        Locations
                    </div>
                    <div class="flex-1 overflow-y-auto p-4 space-y-3" id="warehouse-list">
                        <!-- Warehouses rendered here -->
                        <div class="animate-pulse flex space-x-4">
                            <div class="flex-1 space-y-4 py-1">
                                <div class="h-4 bg-slate-200 rounded w-3/4"></div>
                                <div class="space-y-2">
                                    <div class="h-4 bg-slate-200 rounded"></div>
                                    <div class="h-4 bg-slate-200 rounded w-5/6"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Panel: Stock Details -->
                <div class="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                    <div class="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 class="font-semibold text-slate-700" id="selected-warehouse-title">Inventory Stock</h3>
                        <div id="stock-actions" class="hidden">
                            <button class="text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 font-medium hover:bg-indigo-100 transition-colors">
                                Export CSV
                            </button>
                        </div>
                    </div>
                    <div class="flex-1 overflow-y-auto p-0" id="warehouse-stock-panel">
                        <div class="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                            <i data-lucide="inbox" class="w-16 h-16 mb-4 text-slate-200"></i>
                            <p class="text-lg font-medium text-slate-600 mb-1">Select a warehouse</p>
                            <p class="text-sm">Click on a warehouse from the list to view its inventory stock.</p>
                        </div>
                    </div>
                </div>

            </div>

        </main>

        <!-- Warehouse Modal -->
        <div id="warehouse-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 hidden flex items-center justify-center">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden m-4 animate-in fade-in zoom-in-95 duration-200">
                <div class="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                    <h2 id="warehouse-modal-title" class="text-xl font-bold text-slate-800">Add Warehouse</h2>
                    <button onclick="window.closeWarehouseModal()" class="text-slate-400 hover:text-slate-600 transition-colors">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                <form id="warehouse-form" class="p-6 space-y-4">
                    <input type="hidden" id="warehouse-id">
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Warehouse Code *</label>
                        <input type="text" id="warehouse-code" required class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="e.g. WH-001">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Warehouse Name *</label>
                        <input type="text" id="warehouse-name" required class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Linked Store</label>
                        <select id="warehouse-store" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            <option value="">Select a store...</option>
                            <!-- Populated via JS from /api/stores/ -->
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <textarea id="warehouse-address" rows="3" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"></textarea>
                    </div>
                    
                    <div class="pt-2">
                        <label class="flex items-center gap-3 cursor-pointer">
                            <div class="relative">
                                <input type="checkbox" id="warehouse-active" class="sr-only peer" checked>
                                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </div>
                            <span class="text-sm font-medium text-slate-700">Is Active</span>
                        </label>
                    </div>

                    <div class="flex justify-end gap-3 pt-6 mt-2 border-t border-slate-100">
                        <button type="button" onclick="window.closeWarehouseModal()" class="px-5 py-2.5 text-slate-700 hover:bg-slate-100 font-medium rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button type="submit" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm">
                            Save Warehouse
                        </button>
                    </div>
                </form>
            </div>
        </div>

    </div>
    `;
}
