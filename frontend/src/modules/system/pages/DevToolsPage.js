import { Sidebar } from '../../../components/Sidebar.js';

export function DevToolsPage() {
    return `
    <div class="flex h-screen bg-[#f8fafc]">
        ${Sidebar()}
        <main class="flex-1 overflow-y-auto p-8">
            <div class="max-w-7xl mx-auto space-y-6">
                <!-- Header -->
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            Developer Tools
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                <i data-lucide="shield-alert" class="w-3 h-3 mr-1"></i> Admin Only
                            </span>
                        </h1>
                    </div>
                    <button onclick="window.refreshHealth()" class="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-lg border border-gray-200 shadow-sm transition-colors">
                        <i data-lucide="refresh-cw" class="w-5 h-5"></i>
                    </button>
                </div>

                <!-- Warning Banner -->
                <div class="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg shadow-sm">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i data-lucide="alert-triangle" class="h-5 w-5 text-amber-400"></i>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-amber-700 font-medium">
                                These tools affect system performance and data. Use with caution.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    <!-- Card 1: Cache Management -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-bold text-gray-900 flex items-center">
                                    <i data-lucide="zap" class="w-5 h-5 mr-2 text-indigo-500"></i>
                                    Cache Management
                                </h3>
                            </div>
                            <p class="text-sm text-gray-500 mb-4">Clear Redis and application caches. This may cause temporary slowness while caches rebuild.</p>
                            <div class="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-500">Last Cleared:</span>
                                    <span class="font-medium text-gray-900" id="dt-last-cleared">Unknown</span>
                                </div>
                            </div>
                        </div>
                        <button onclick="window.clearCache()" id="btn-clear-cache" class="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm">
                            Clear Cache
                        </button>
                    </div>

                    <!-- Card 2: Database Optimization -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-bold text-gray-900 flex items-center">
                                    <i data-lucide="database" class="w-5 h-5 mr-2 text-blue-500"></i>
                                    Database Optimization
                                </h3>
                            </div>
                            <p class="text-sm text-gray-500 mb-4">Run VACUUM ANALYZE to reclaim storage and update query planner statistics.</p>
                            <div class="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-500">Last Optimized:</span>
                                    <span class="font-medium text-gray-900" id="dt-last-optimized">Unknown</span>
                                </div>
                            </div>
                        </div>
                        <button onclick="window.optimizeDatabase()" id="btn-optimize-db" class="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm">
                            Optimize Database
                        </button>
                    </div>

                    <!-- Card 3: System Health -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
                        <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <i data-lucide="activity" class="w-5 h-5 mr-2 text-green-500"></i>
                            System Health
                        </h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                                <p class="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">DB Connection</p>
                                <div class="flex items-center justify-center" id="health-db">
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Checking...</span>
                                </div>
                            </div>
                            <div class="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                                <p class="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Error Count</p>
                                <p class="text-xl font-bold text-gray-900" id="health-errors">-</p>
                            </div>
                            <div class="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                                <p class="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Active Sessions</p>
                                <p class="text-xl font-bold text-gray-900" id="health-sessions">-</p>
                            </div>
                            <div class="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                                <p class="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">DB Size</p>
                                <p class="text-xl font-bold text-gray-900" id="health-dbsize">-</p>
                            </div>
                            
                            <div class="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center col-span-2 md:col-span-2">
                                <p class="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Python Version</p>
                                <p class="text-sm font-medium text-gray-900 truncate" id="health-python">-</p>
                            </div>
                            <div class="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center col-span-2 md:col-span-2">
                                <p class="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Django Version</p>
                                <p class="text-sm font-medium text-gray-900 truncate" id="health-django">-</p>
                            </div>
                        </div>
                    </div>

                    <!-- Card 4: API Keys & Webhooks -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                        <div>
                            <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <i data-lucide="key" class="w-5 h-5 mr-2 text-yellow-500"></i>
                                API Integrations
                            </h3>
                            <div class="space-y-4">
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div class="flex items-center">
                                        <i data-lucide="key" class="w-4 h-4 text-gray-400 mr-2"></i>
                                        <span class="text-sm font-medium text-gray-900">Active API Keys</span>
                                    </div>
                                    <span class="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full" id="stat-apikeys">0</span>
                                </div>
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div class="flex items-center">
                                        <i data-lucide="webhook" class="w-4 h-4 text-gray-400 mr-2"></i>
                                        <span class="text-sm font-medium text-gray-900">Active Webhooks</span>
                                    </div>
                                    <span class="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full" id="stat-webhooks">0</span>
                                </div>
                            </div>
                        </div>
                        <div class="mt-4 grid grid-cols-2 gap-2">
                            <a href="#/api-keys" class="text-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">Manage Keys</a>
                            <a href="#/webhooks" class="text-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">Manage Hooks</a>
                        </div>
                    </div>

                    <!-- Card 6: Data Export Tools -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <i data-lucide="download-cloud" class="w-5 h-5 mr-2 text-teal-500"></i>
                            Raw Data Export
                        </h3>
                        <p class="text-sm text-gray-500 mb-4">Export system data directly to CSV format.</p>
                        <div class="grid grid-cols-2 gap-3">
                            <button onclick="window.exportData('products')" class="flex items-center justify-center px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">
                                <i data-lucide="package" class="w-4 h-4 mr-2 text-gray-400"></i> Products
                            </button>
                            <button onclick="window.exportData('customers')" class="flex items-center justify-center px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">
                                <i data-lucide="users" class="w-4 h-4 mr-2 text-gray-400"></i> Customers
                            </button>
                            <button onclick="window.exportData('inventory')" class="flex items-center justify-center px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">
                                <i data-lucide="layers" class="w-4 h-4 mr-2 text-gray-400"></i> Inventory
                            </button>
                            <!-- Simple sales export for demo, date range could be a modal -->
                            <button onclick="window.exportData('sales')" class="flex items-center justify-center px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">
                                <i data-lucide="dollar-sign" class="w-4 h-4 mr-2 text-gray-400"></i> Sales (All)
                            </button>
                        </div>
                    </div>

                    <!-- Card 5: Log Viewer -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-0 lg:col-span-2 overflow-hidden flex flex-col">
                        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 class="text-lg font-bold text-gray-900 flex items-center">
                                <i data-lucide="terminal" class="w-5 h-5 mr-2 text-gray-600"></i>
                                Error Log Viewer
                            </h3>
                            <div class="flex items-center space-x-4">
                                <label class="flex items-center text-sm text-gray-600 cursor-pointer">
                                    <input type="checkbox" id="log-filter-unresolved" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 mr-2" onchange="window.loadLogs(1)" checked>
                                    Unresolved Only
                                </label>
                            </div>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm text-left">
                                <thead class="text-xs text-gray-500 bg-gray-50 uppercase">
                                    <tr>
                                        <th class="px-6 py-3 w-32">Level</th>
                                        <th class="px-6 py-3">Message</th>
                                        <th class="px-6 py-3 w-48">Timestamp</th>
                                        <th class="px-6 py-3 w-24">Status</th>
                                        <th class="px-6 py-3 w-32 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="logs-table-body" class="divide-y divide-gray-100">
                                    <!-- Populated via JS -->
                                </tbody>
                            </table>
                        </div>
                        <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50" id="logs-pagination">
                            <!-- Pagination -->
                        </div>
                    </div>

                </div>
            </div>
        </main>
    </div>
    <!-- Success Toast (reusable) -->
    <div id="toast-success" class="hidden fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center z-50">
        <i data-lucide="check-circle" class="w-5 h-5 text-green-400 mr-2"></i>
        <span id="toast-msg">Action completed</span>
    </div>
    `;
}
