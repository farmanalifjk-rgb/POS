import { Sidebar } from '../../../components/Sidebar.js';

export function AttendancePage() {
    return `
    <div class="flex h-screen bg-[#f4f7f6]">
        ${Sidebar()}
        <main class="flex-1 overflow-y-auto p-8">
            <div class="max-w-7xl mx-auto">
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">Attendance Log</h1>
                        <p class="text-gray-500 mt-1">Track employee clock-ins and clock-outs</p>
                    </div>
                    <div class="flex gap-4">
                        <input type="date" id="attendanceDateFilter" class="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                        <button onclick="window.loadAttendance()" class="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                            <i data-lucide="filter" class="w-4 h-4"></i> Filter
                        </button>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                                    <th class="p-4 font-medium">Employee</th>
                                    <th class="p-4 font-medium">Date</th>
                                    <th class="p-4 font-medium">Clock In</th>
                                    <th class="p-4 font-medium">Clock Out</th>
                                    <th class="p-4 font-medium">Status</th>
                                    <th class="p-4 font-medium">Hours Worked</th>
                                </tr>
                            </thead>
                            <tbody id="attendanceList" class="divide-y divide-gray-100">
                                <tr><td colspan="6" class="p-8 text-center text-gray-500"><i data-lucide="loader-2" class="w-8 h-8 animate-spin mx-auto mb-2"></i>Loading records...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>
    `;
}
