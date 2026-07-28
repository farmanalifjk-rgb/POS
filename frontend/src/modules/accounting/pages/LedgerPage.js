import { Sidebar } from '../../../components/Sidebar.js';

export function LedgerPage() {
    return `
    <div class="flex h-screen bg-[#f4f7f6]">
        ${Sidebar()}
        <main class="flex-1 overflow-y-auto p-8">
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-3xl font-bold text-gray-800">General Ledger</h1>
                
                <div class="w-72">
                    <select id="ledger-account-select" onchange="window.LedgerController.fetchLedger(this.value)" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white shadow-sm font-medium text-gray-700">
                        <option value="">Select an Account...</option>
                    </select>
                </div>
            </div>
            
            <div id="ledger-error" class="hidden mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow-sm border border-red-200"></div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] flex flex-col">
                <div id="ledger-loading" class="hidden flex-1 p-16 flex-col items-center justify-center text-gray-500">
                    <div class="animate-spin inline-block w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                    <p class="font-medium">Loading ledger data...</p>
                </div>
                
                <div id="ledger-empty" class="flex-1 flex flex-col items-center justify-center p-16 text-gray-400">
                    <i data-lucide="book-open" class="w-16 h-16 mb-4 opacity-50"></i>
                    <p class="text-lg">Please select an account to view its ledger.</p>
                </div>
                
                <div id="ledger-content" class="hidden">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                                <th class="p-4 font-semibold">Date</th>
                                <th class="p-4 font-semibold">Reference</th>
                                <th class="p-4 font-semibold">Description</th>
                                <th class="p-4 font-semibold text-right">Debit</th>
                                <th class="p-4 font-semibold text-right">Credit</th>
                                <th class="p-4 font-semibold text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody id="ledger-list" class="divide-y divide-gray-100">
                            <!-- Populated via JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>
    `;
}
