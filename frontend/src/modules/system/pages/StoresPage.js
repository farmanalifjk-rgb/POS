import { Sidebar } from "../../../components/Sidebar";

export default function StoresPage() {
    return `
    <div class='flex h-screen bg-[#f8fafc]'>
        ${Sidebar()}
        <main class='flex-1 overflow-y-auto p-8'>
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">Stores Management</h1>
                    <p class="text-slate-500 mt-1">Manage your retail locations and store settings</p>
                </div>
                <button onclick="window.openStoreModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2">
                    <i data-lucide="plus" class="w-5 h-5"></i>
                    Add Store
                </button>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-sm font-medium text-slate-500">Total Stores</p>
                            <h3 class="text-2xl font-bold text-slate-800 mt-1" id="total-stores">0</h3>
                        </div>
                        <div class="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <i data-lucide="store" class="w-6 h-6"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-sm font-medium text-slate-500">Active Stores</p>
                            <h3 class="text-2xl font-bold text-slate-800 mt-1" id="active-stores">0</h3>
                        </div>
                        <div class="p-3 bg-green-50 text-green-600 rounded-lg">
                            <i data-lucide="check-circle" class="w-6 h-6"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-sm font-medium text-slate-500">Default Store</p>
                            <h3 class="text-xl font-bold text-slate-800 mt-1 truncate" id="default-store-name">-</h3>
                        </div>
                        <div class="p-3 bg-amber-50 text-amber-600 rounded-lg">
                            <i data-lucide="star" class="w-6 h-6"></i>
                        </div>
                    </div>
                </div>
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
            </div>

            <!-- Controls -->
            <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div class="relative w-full sm:w-96">
                    <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                    <input type="text" id="store-search" placeholder="Search stores by name or code..." class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                </div>
            </div>

            <!-- Grid -->
            <div id="stores-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Stores rendered here -->
            </div>
            
            <div id="empty-stores-state" class="hidden  flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-slate-100 text-center">
                <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <i data-lucide="store" class="w-8 h-8 text-slate-400"></i>
                </div>
                <h3 class="text-lg font-bold text-slate-800 mb-2">No Stores Found</h3>
                <p class="text-slate-500 max-w-md mb-6">You haven't added any stores yet, or none match your search criteria. Add a store to get started.</p>
                <button onclick="window.openStoreModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    Add First Store
                </button>
            </div>

        </main>

        <!-- Store Modal -->
        <div id="store-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 hidden items-center justify-center">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4 animate-in fade-in zoom-in-95 duration-200">
                <div class="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <h2 id="store-modal-title" class="text-xl font-bold text-slate-800">Add Store</h2>
                    <button onclick="window.closeStoreModal()" class="text-slate-400 hover:text-slate-600 transition-colors">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                <form id="store-form" class="p-6 space-y-6">
                    <input type="hidden" id="store-id">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Basic Info -->
                        <div class="space-y-4 col-span-2 md:col-span-1">
                            <h3 class="font-semibold text-slate-700 border-b pb-2">Basic Information</h3>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Store Name *</label>
                                <input type="text" id="store-name" required class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Store Code *</label>
                                <input type="text" id="store-code" required class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Manager Name</label>
                                <input type="text" id="store-manager" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            </div>
                        </div>

                        <!-- Settings -->
                        <div class="space-y-4 col-span-2 md:col-span-1">
                            <h3 class="font-semibold text-slate-700 border-b pb-2">Localization</h3>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                                <select id="store-currency" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                    <option value="PKR">PKR (Pakistani Rupee)</option>
                                    <option value="USD">USD (US Dollar)</option>
                                    <option value="EUR">EUR (Euro)</option>
                                    <option value="GBP">GBP (British Pound)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Language</label>
                                <select id="store-language" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                    <option value="en">English (en)</option>
                                    <option value="ur">Urdu (ur)</option>
                                    <option value="ar">Arabic (ar)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
                                <input type="text" id="store-timezone" placeholder="e.g. Asia/Karachi" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            </div>
                        </div>

                        <!-- Formatting -->
                        <div class="space-y-4 col-span-2 md:col-span-1">
                            <h3 class="font-semibold text-slate-700 border-b pb-2">Formatting</h3>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 mb-1">Date Format</label>
                                    <select id="store-date-format" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 mb-1">Time Format</label>
                                    <select id="store-time-format" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option value="12h">12-hour</option>
                                        <option value="24h">24-hour</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 mb-1">Weight Unit</label>
                                    <select id="store-weight-unit" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option value="kg">kg</option>
                                        <option value="g">g</option>
                                        <option value="lb">lb</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 mb-1">Dimension Unit</label>
                                    <select id="store-dimension-unit" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option value="cm">cm</option>
                                        <option value="m">m</option>
                                        <option value="in">in</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Contact Info -->
                        <div class="space-y-4 col-span-2 md:col-span-1">
                            <h3 class="font-semibold text-slate-700 border-b pb-2">Contact Details</h3>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                <input type="text" id="store-phone" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                <textarea id="store-address" rows="3" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"></textarea>
                            </div>
                        </div>

                        <!-- Toggles -->
                        <div class="col-span-2 flex flex-col sm:flex-row gap-6 pt-4 border-t border-slate-100">
                            <label class="flex items-center gap-3 cursor-pointer">
                                <div class="relative">
                                    <input type="checkbox" id="store-active" class="sr-only peer" checked>
                                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </div>
                                <span class="text-sm font-medium text-slate-700">Is Active</span>
                            </label>
                            
                            <label class="flex items-center gap-3 cursor-pointer">
                                <div class="relative">
                                    <input type="checkbox" id="store-default" class="sr-only peer">
                                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                </div>
                                <span class="text-sm font-medium text-slate-700">Set as Default Store</span>
                            </label>
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100 sticky bottom-0 bg-white">
                        <button type="button" onclick="window.closeStoreModal()" class="px-5 py-2.5 text-slate-700 hover:bg-slate-100 font-medium rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button type="submit" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm">
                            Save Store
                        </button>
                    </div>
                </form>
            </div>
        </div>

    </div>
    `;
}
