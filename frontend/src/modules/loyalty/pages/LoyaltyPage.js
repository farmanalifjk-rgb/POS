import { Sidebar } from '../../../components/Sidebar.js';

export function LoyaltyPage() {
    return `
        <div class="flex h-screen bg-[#f4f7f6]">
            ${Sidebar()}
            <main class="flex-1 overflow-y-auto p-8">
                <header class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-800">Loyalty Program</h1>
                        <p class="text-gray-600 mt-1">Configure program settings and view recent points transactions.</p>
                    </div>
                </header>
                
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Config Form -->
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 h-fit">
                        <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
                            <i data-lucide="settings" class="w-5 h-5 text-indigo-500"></i>
                            Program Settings
                        </h2>
                        
                        <form id="loyalty-config-form" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Points Equivalent (e.g. 1 point = $0.01)</label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span class="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input type="number" id="points-equivalent" step="0.01" class="pl-7 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors border p-2" placeholder="0.01" required>
                                </div>
                            </div>
                            
                            <div class="flex items-center justify-between py-2 border-t border-gray-100 mt-4">
                                <div>
                                    <h3 class="text-sm font-medium text-gray-900">Enable Program</h3>
                                    <p class="text-xs text-gray-500">Allow customers to earn & redeem points.</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="earn-enabled" class="sr-only peer">
                                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                            
                            <button type="submit" class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors mt-6">
                                Save Configuration
                            </button>
                        </form>
                    </div>
                    
                    <!-- Transactions Table -->
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 lg:col-span-2">
                        <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
                            <i data-lucide="history" class="w-5 h-5 text-indigo-500"></i>
                            Recent Transactions
                        </h2>
                        
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                                    </tr>
                                </thead>
                                <tbody id="loyalty-transactions-list" class="bg-white divide-y divide-gray-200">
                                    <tr>
                                        <td colspan="4" class="px-6 py-10 text-center text-gray-500">
                                            <div class="flex justify-center mb-2">
                                                <i data-lucide="loader-2" class="w-6 h-6 animate-spin text-indigo-500"></i>
                                            </div>
                                            Loading transactions...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `;
}
