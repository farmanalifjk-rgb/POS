import { Sidebar } from '../../../components/Sidebar.js';

export function TrialBalancePage() {
    return `
    <div class="flex h-screen bg-[#f4f7f6]">
        ${Sidebar()}
        <main class="flex-1 overflow-y-auto p-8">
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-3xl font-bold text-gray-800">Trial Balance</h1>
                <button onclick="window.print()" class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2 font-medium">
                    <i data-lucide="printer" class="w-5 h-5"></i>
                    Print
                </button>
            </div>
            
            <div id="tb-error" class="hidden mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow-sm border border-red-200"></div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl mx-auto">
                <div id="tb-loading" class="p-16 text-center text-gray-500">
                    <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                    <p>Loading trial balance...</p>
                </div>
                
                <div id="tb-content" class="hidden">
                    <div class="p-6 border-b border-gray-100 text-center">
                        <h2 class="text-xl font-bold text-gray-800 uppercase tracking-wide">Trial Balance</h2>
                        <p class="text-gray-500 mt-1" id="tb-date">As of ${new Date().toLocaleDateString()}</p>
                    </div>
                    
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-gray-50 text-gray-700 text-sm border-b border-gray-200">
                                <th class="p-4 font-semibold w-24">Code</th>
                                <th class="p-4 font-semibold">Account Name</th>
                                <th class="p-4 font-semibold text-right w-40">Debit</th>
                                <th class="p-4 font-semibold text-right w-40">Credit</th>
                            </tr>
                        </thead>
                        <tbody id="tb-list" class="divide-y divide-gray-100">
                            <!-- Populated via JS -->
                        </tbody>
                        <tfoot class="bg-gray-50 border-t border-gray-300 font-bold text-gray-900">
                            <tr>
                                <td colspan="2" class="p-4 text-right">Totals:</td>
                                <td class="p-4 text-right" id="tb-total-debit">0.00</td>
                                <td class="p-4 text-right" id="tb-total-credit">0.00</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </main>
    </div>
    `;
}
