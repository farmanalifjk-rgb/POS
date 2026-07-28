import { Sidebar } from '../../../components/Sidebar.js';

export function PayrollPage() {
    return `
    <div class="flex h-screen bg-[#f4f7f6]">
        ${Sidebar()}
        <main class="flex-1 overflow-y-auto p-8 relative">
            <div class="max-w-7xl mx-auto">
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">Payroll Runs</h1>
                        <p class="text-gray-500 mt-1">Manage monthly payroll cycles</p>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                                    <th class="p-4 font-medium">Month</th>
                                    <th class="p-4 font-medium">Year</th>
                                    <th class="p-4 font-medium">Total Net</th>
                                    <th class="p-4 font-medium">Status</th>
                                    <th class="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="payrollList" class="divide-y divide-gray-100">
                                <tr><td colspan="5" class="p-8 text-center text-gray-500"><i data-lucide="loader-2" class="w-8 h-8 animate-spin mx-auto mb-2"></i>Loading payroll runs...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Entries Modal -->
            <div id="entriesModal" class="hidden absolute inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl transform transition-transform z-50 flex flex-col">
                <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 class="text-xl font-bold text-gray-900">Payroll Entries</h2>
                        <p class="text-sm text-gray-500 mt-1" id="entriesSubtitle">Viewing details</p>
                    </div>
                    <button onclick="document.getElementById('entriesModal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 p-2">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                <div class="flex-1 overflow-y-auto p-6">
                    <div class="overflow-hidden rounded-xl border border-gray-100">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                                    <th class="p-3 font-medium">Employee</th>
                                    <th class="p-3 font-medium">Basic</th>
                                    <th class="p-3 font-medium">Allowances</th>
                                    <th class="p-3 font-medium">Deductions</th>
                                    <th class="p-3 font-medium">Net Pay</th>
                                </tr>
                            </thead>
                            <tbody id="entriesList" class="divide-y divide-gray-100 text-sm">
                                <tr><td colspan="5" class="p-6 text-center text-gray-500">Loading entries...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div id="modalOverlay" onclick="document.getElementById('entriesModal').classList.add('hidden')" class="hidden fixed inset-0 bg-black/20 z-40"></div>
        </main>
    </div>
    `;
}
