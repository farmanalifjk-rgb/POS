import { Sidebar } from '../../../components/Sidebar.js';

export function GiftCardsPage() {
    return `
        <div class="flex h-screen bg-[#f4f7f6]">
            ${Sidebar()}
            <main class="flex-1 overflow-y-auto p-8">
                <header class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-800">Gift Cards</h1>
                        <p class="text-gray-600 mt-1">Issue and manage digital gift cards.</p>
                    </div>
                    <button onclick="document.getElementById('issue-card-modal').classList.remove('hidden')" class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                        <i data-lucide="credit-card" class="w-5 h-5"></i>
                        Issue Card
                    </button>
                </header>
                
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 class="font-semibold text-gray-800">Active Gift Cards</h2>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="gift-cards-list" class="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td colspan="5" class="px-6 py-10 text-center text-gray-500">
                                        <div class="flex justify-center mb-2">
                                            <i data-lucide="loader-2" class="w-6 h-6 animate-spin text-indigo-500"></i>
                                        </div>
                                        Loading gift cards...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Issue Card Modal -->
                <div id="issue-card-modal" class="hidden fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-xl font-bold text-gray-800">Issue Gift Card</h2>
                            <button onclick="document.getElementById('issue-card-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600">
                                <i data-lucide="x" class="w-6 h-6"></i>
                            </button>
                        </div>
                        <form id="issue-card-form" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Code (Optional - Auto-generated if blank)</label>
                                <input type="text" id="card-code" class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5 uppercase" placeholder="e.g. GIFT-100">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Initial Balance ($)</label>
                                <input type="number" id="card-balance" step="0.01" min="1" required class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5">
                            </div>
                            
                            <div class="mt-6 flex justify-end gap-3">
                                <button type="button" onclick="document.getElementById('issue-card-modal').classList.add('hidden')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" class="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                                    Issue Card
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Redeem Modal -->
                <div id="redeem-card-modal" class="hidden fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-xl font-bold text-gray-800">Redeem Card</h2>
                            <button onclick="document.getElementById('redeem-card-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600">
                                <i data-lucide="x" class="w-6 h-6"></i>
                            </button>
                        </div>
                        <form id="redeem-card-form" class="space-y-4">
                            <input type="hidden" id="redeem-card-id">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Amount to Redeem ($)</label>
                                <input type="number" id="redeem-amount" step="0.01" min="0.01" required class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5">
                                <p id="redeem-max-info" class="text-xs text-gray-500 mt-1"></p>
                            </div>
                            <div class="mt-6 flex justify-end gap-3">
                                <button type="button" onclick="document.getElementById('redeem-card-modal').classList.add('hidden')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" class="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                                    Confirm Redemption
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    `;
}
