import { Sidebar } from '../../../components/Sidebar.js';

export function StoreDashboardPage() {
    return `
    <div class='flex h-screen bg-[#f8fafc]'>
        ${Sidebar()}
        <main class='flex-1 overflow-y-auto p-8'>
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Enterprise Overview</h1>
                    <p class="text-sm text-gray-500 mt-1">Real-time metrics across all locations</p>
                </div>
                <div class="flex space-x-3">
                    <button class="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium text-sm flex items-center">
                        <i data-lucide="download" class="w-4 h-4 mr-2"></i> Export Report
                    </button>
                    <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md font-medium text-sm flex items-center">
                        <i data-lucide="plus" class="w-4 h-4 mr-2"></i> New Store
                    </button>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Stat Card 1 -->
                <div class="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Stores</h3>
                        <div class="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <i data-lucide="store" class="w-5 h-5"></i>
                        </div>
                    </div>
                    <div class="flex items-baseline space-x-2">
                        <span class="text-4xl font-black text-gray-900" id="statTotalStores">--</span>
                        <span class="text-sm font-medium text-green-500 flex items-center">
                            <i data-lucide="trending-up" class="w-3 h-3 mr-1"></i> +2%
                        </span>
                    </div>
                </div>

                <!-- Stat Card 2 -->
                <div class="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Terminals</h3>
                        <div class="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                            <i data-lucide="monitor-smartphone" class="w-5 h-5"></i>
                        </div>
                    </div>
                    <div class="flex items-baseline space-x-2">
                        <span class="text-4xl font-black text-gray-900" id="statActiveTerminals">--</span>
                    </div>
                </div>

                <!-- Stat Card 3 -->
                <div class="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Today's Revenue</h3>
                        <div class="p-2 bg-violet-50 rounded-lg text-violet-600">
                            <i data-lucide="dollar-sign" class="w-5 h-5"></i>
                        </div>
                    </div>
                    <div class="flex items-baseline space-x-2">
                        <span class="text-4xl font-black text-gray-900" id="statRevenue">--</span>
                        <span class="text-sm font-medium text-green-500 flex items-center">
                            <i data-lucide="trending-up" class="w-3 h-3 mr-1"></i> +14%
                        </span>
                    </div>
                </div>

                <!-- Stat Card 4 -->
                <div class="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">HQ Alerts</h3>
                        <div class="p-2 bg-rose-50 rounded-lg text-rose-600">
                            <i data-lucide="alert-triangle" class="w-5 h-5"></i>
                        </div>
                    </div>
                    <div class="flex items-baseline space-x-2">
                        <span class="text-4xl font-black text-gray-900" id="statAlerts">--</span>
                        <span class="text-sm font-medium text-rose-500">Requires attention</span>
                    </div>
                </div>
            </div>

            <!-- Recent Activity Section -->
            <div class="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-gray-100 overflow-hidden">
                <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 class="text-lg font-bold text-gray-800">Store Network Status</h3>
                    <button class="text-sm text-blue-600 font-medium hover:text-blue-800">View All Locations</button>
                </div>
                <div class="p-6">
                    <div id="storeListContainer" class="space-y-4">
                        <!-- Simulated Data -->
                        <div class="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                            <div class="flex items-center space-x-4">
                                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">NY</div>
                                <div>
                                    <h4 class="text-sm font-bold text-gray-900">Flagship - Manhattan</h4>
                                    <p class="text-xs text-gray-500">14 terminals online</p>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <span class="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center">
                                    <span class="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span> Operational
                                </span>
                            </div>
                        </div>

                        <div class="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                            <div class="flex items-center space-x-4">
                                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md">CA</div>
                                <div>
                                    <h4 class="text-sm font-bold text-gray-900">West Coast Hub - LA</h4>
                                    <p class="text-xs text-gray-500">8 terminals online</p>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <span class="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center">
                                    <span class="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span> Operational
                                </span>
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                            <div class="flex items-center space-x-4">
                                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm shadow-md">TX</div>
                                <div>
                                    <h4 class="text-sm font-bold text-gray-900">Austin Downtown</h4>
                                    <p class="text-xs text-gray-500">3/5 terminals online</p>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center">
                                    <span class="w-2 h-2 rounded-full bg-amber-500 mr-2"></span> Connectivity Issues
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    `;
}
