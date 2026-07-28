import { Sidebar } from '../../../components/Sidebar.js';

export function JournalEntriesPage() {
    return `
    <div class="flex h-screen bg-[#f4f7f6]">
        ${Sidebar()}
        <main class="flex-1 overflow-y-auto p-8">
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-3xl font-bold text-gray-800">Journal Entries</h1>
                <button onclick="window.JournalController.showAddModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow transition-colors flex items-center gap-2">
                    <i data-lucide="plus" class="w-5 h-5"></i>
                    New Entry
                </button>
            </div>
            
            <div id="journal-error" class="hidden mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow-sm border border-red-200"></div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div id="journal-loading" class="p-8 text-center text-gray-500">
                    <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                    <p>Loading journal entries...</p>
                </div>
                
                <div id="journal-content" class="hidden">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                                <th class="p-4 font-semibold">Date</th>
                                <th class="p-4 font-semibold">Reference</th>
                                <th class="p-4 font-semibold">Description</th>
                                <th class="p-4 font-semibold">Status</th>
                                <th class="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="journal-list" class="divide-y divide-gray-100">
                            <!-- Populated via JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>

    <!-- Add Journal Entry Modal -->
    <div id="add-journal-modal" class="hidden fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all">
            <div class="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 class="text-xl font-bold text-gray-800">New Journal Entry</h3>
                <button onclick="window.JournalController.hideAddModal()" class="text-gray-400 hover:text-gray-600 transition-colors">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>
            <form id="add-journal-form" onsubmit="window.JournalController.handleAddEntry(event)" class="p-6 space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input type="date" id="je-date" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                        <input type="text" id="je-ref" placeholder="e.g. JE-001" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input type="text" id="je-desc" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                    </div>
                </div>
                
                <div class="border border-gray-200 rounded-lg overflow-hidden">
                    <table class="w-full text-left">
                        <thead class="bg-gray-50 text-gray-600 text-sm">
                            <tr>
                                <th class="p-3 font-medium w-1/2">Account</th>
                                <th class="p-3 font-medium">Debit</th>
                                <th class="p-3 font-medium">Credit</th>
                                <th class="p-3 font-medium w-12 text-center"></th>
                            </tr>
                        </thead>
                        <tbody id="je-lines" class="divide-y divide-gray-100">
                            <!-- Dynamic lines go here -->
                        </tbody>
                        <tfoot class="bg-gray-50 border-t border-gray-200 font-semibold text-gray-800">
                            <tr>
                                <td class="p-3 text-right">Totals:</td>
                                <td class="p-3" id="je-total-debit">0.00</td>
                                <td class="p-3" id="je-total-credit">0.00</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                <button type="button" onclick="window.JournalController.addLine()" class="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1">
                    <i data-lucide="plus-circle" class="w-4 h-4"></i> Add Line
                </button>

                <div class="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                    <button type="button" onclick="window.JournalController.hideAddModal()" class="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">Cancel</button>
                    <button type="submit" id="add-journal-btn" class="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition-colors font-medium flex items-center justify-center">Save Entry</button>
                </div>
            </form>
        </div>
    </div>
    `;
}
