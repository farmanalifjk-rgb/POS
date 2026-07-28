import { Sidebar } from '../../../components/Sidebar.js';

export function ExpensesPage() {
    return `
    <div class='flex h-screen bg-[#f4f7f6]'>
        ${Sidebar()}
        <main class='flex-1 overflow-y-auto p-8 relative'>
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-3xl font-bold text-gray-800">Expenses</h1>
                <button id="addExpenseBtn" class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition shadow-sm flex items-center">
                    <i data-lucide="plus" class="w-4 h-4 mr-2"></i> Add Expense
                </button>
            </div>
            
            <div id="expensesLoading" class="hidden flex justify-center py-12">
                <i data-lucide="loader-2" class="w-8 h-8 animate-spin text-emerald-600"></i>
            </div>
            
            <div id="expensesError" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"></div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody id="expensesTableBody" class="bg-white divide-y divide-gray-200">
                    </tbody>
                </table>
            </div>

            <!-- Modal -->
            <div id="expenseModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-xl bg-white">
                    <div class="mt-3">
                        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Add New Expense</h3>
                        <form id="expenseForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Category</label>
                                <select id="expenseCategory" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border"></select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Amount</label>
                                <input type="number" step="0.01" id="expenseAmount" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Date</label>
                                <input type="date" id="expenseDate" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Description</label>
                                <input type="text" id="expenseDescription" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border">
                            </div>
                            <div class="flex justify-end space-x-3 mt-6">
                                <button type="button" id="closeExpenseModal" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                                <button type="submit" class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    </div>
    `;
}
