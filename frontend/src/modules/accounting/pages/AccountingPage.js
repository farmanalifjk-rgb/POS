import { Sidebar } from '../../../components/Sidebar.js';

export function AccountingPage() {
    return `
    <div class="flex h-screen bg-[#f4f7f6]">
        ${Sidebar()}
        <main class="flex-1 overflow-y-auto p-8">
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-3xl font-bold text-gray-800">Chart of Accounts</h1>
                <button onclick="window.AccountingController.showAddModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow transition-colors flex items-center gap-2">
                    <i data-lucide="plus" class="w-5 h-5"></i>
                    Add Account
                </button>
            </div>
            
            <div id="accounting-error" class="hidden mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow-sm border border-red-200"></div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div id="accounts-loading" class="p-8 text-center text-gray-500">
                    <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                    <p>Loading accounts...</p>
                </div>
                
                <div id="accounts-content" class="hidden">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                                <th class="p-4 font-semibold">Code</th>
                                <th class="p-4 font-semibold">Name</th>
                                <th class="p-4 font-semibold">Type</th>
                                <th class="p-4 font-semibold text-right">Current Balance</th>
                            </tr>
                        </thead>
                        <tbody id="accounts-list" class="divide-y divide-gray-100">
                            <!-- Populated via JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>

    <!-- Add Account Modal -->
    <div id="add-account-modal" class="hidden fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div class="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 class="text-xl font-bold text-gray-800">Add Account</h3>
                <button onclick="window.AccountingController.hideAddModal()" class="text-gray-400 hover:text-gray-600 transition-colors">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>
            <form id="add-account-form" onsubmit="window.AccountingController.handleAddAccount(event)" class="p-6 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Account Code</label>
                    <input type="text" id="acc-code" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                    <input type="text" id="acc-name" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                    <select id="acc-type" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white">
                        <option value="asset">Asset</option>
                        <option value="liability">Liability</option>
                        <option value="equity">Equity</option>
                        <option value="revenue">Revenue</option>
                        <option value="expense">Expense</option>
                    </select>
                </div>
                <div class="pt-4 flex justify-end gap-3">
                    <button type="button" onclick="window.AccountingController.hideAddModal()" class="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">Cancel</button>
                    <button type="submit" id="add-account-btn" class="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition-colors font-medium flex items-center justify-center">Save Account</button>
                </div>
            </form>
        </div>
    </div>
    `;
}
