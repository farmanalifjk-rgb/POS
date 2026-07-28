import { Sidebar } from '../../../components/Sidebar.js';

export function ApprovalsPage() {
    return `
    <div class='flex h-screen bg-[#f4f7f6]'>
        ${Sidebar()}
        <main class='flex-1 overflow-y-auto p-8'>
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-3xl font-bold text-gray-800">Approvals</h1>
                <div class="flex space-x-4">
                    <button id="refreshApprovals" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                        <i data-lucide="refresh-cw" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>
            
            <div id="approvalsLoading" class="hidden flex justify-center py-12">
                <i data-lucide="loader-2" class="w-8 h-8 animate-spin text-blue-600"></i>
            </div>
            
            <div id="approvalsError" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span class="block sm:inline" id="approvalsErrorMessage"></span>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="approvalsTableBody" class="bg-white divide-y divide-gray-200">
                        <!-- Content loaded dynamically -->
                    </tbody>
                </table>
            </div>
        </main>
    </div>
    `;
}
