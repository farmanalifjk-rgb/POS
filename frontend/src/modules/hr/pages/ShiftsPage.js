import { Sidebar } from '../../../components/Sidebar.js';

export function ShiftsPage() {
    return `
    <div class="flex h-screen bg-[#f4f7f6]">
        ${Sidebar()}
        <main class="flex-1 overflow-y-auto p-8">
            <div class="max-w-7xl mx-auto">
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">Shift Schedule</h1>
                        <p class="text-gray-500 mt-1">Manage employee working shifts</p>
                    </div>
                    <button onclick="document.getElementById('addShiftModal').classList.remove('hidden')" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                        <i data-lucide="plus" class="w-5 h-5"></i>
                        Add Shift
                    </button>
                </div>
                
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                                    <th class="p-4 font-medium">Employee</th>
                                    <th class="p-4 font-medium">Date</th>
                                    <th class="p-4 font-medium">Start Time</th>
                                    <th class="p-4 font-medium">End Time</th>
                                    <th class="p-4 font-medium">Notes</th>
                                </tr>
                            </thead>
                            <tbody id="shiftsList" class="divide-y divide-gray-100">
                                <tr><td colspan="5" class="p-8 text-center text-gray-500"><i data-lucide="loader-2" class="w-8 h-8 animate-spin mx-auto mb-2"></i>Loading shifts...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Add Shift Modal -->
            <div id="addShiftModal" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                    <div class="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 class="text-xl font-semibold">Schedule New Shift</h2>
                        <button onclick="document.getElementById('addShiftModal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    </div>
                    <form id="addShiftForm" class="p-6 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                            <input type="number" name="employee" required class="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input type="date" name="date" required class="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <input type="time" name="start_time" required class="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                <input type="time" name="end_time" required class="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea name="notes" rows="2" class="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
                        </div>
                        <div class="pt-4 flex justify-end gap-3">
                            <button type="button" onclick="document.getElementById('addShiftModal').classList.add('hidden')" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                            <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2">
                                <span class="btn-text">Save Shift</span>
                                <i data-lucide="loader-2" class="w-4 h-4 animate-spin hidden spinner"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    </div>
    `;
}
