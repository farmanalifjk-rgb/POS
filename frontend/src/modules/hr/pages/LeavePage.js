import { Sidebar } from '../../../components/Sidebar.js';

export function LeavePage() {
    return `
    <div class="flex h-screen bg-[#f4f7f6]">
        ${Sidebar()}
        <main class="flex-1 overflow-y-auto p-8">
            <div class="max-w-7xl mx-auto">
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">Leave Requests</h1>
                        <p class="text-gray-500 mt-1">Manage employee time-off requests</p>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                                    <th class="p-4 font-medium">Employee</th>
                                    <th class="p-4 font-medium">Type</th>
                                    <th class="p-4 font-medium">Start Date</th>
                                    <th class="p-4 font-medium">End Date</th>
                                    <th class="p-4 font-medium">Status</th>
                                    <th class="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="leaveList" class="divide-y divide-gray-100">
                                <tr><td colspan="6" class="p-8 text-center text-gray-500"><i data-lucide="loader-2" class="w-8 h-8 animate-spin mx-auto mb-2"></i>Loading requests...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>
    `;
}
