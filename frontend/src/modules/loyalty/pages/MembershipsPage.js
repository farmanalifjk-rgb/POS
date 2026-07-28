import { Sidebar } from '../../../components/Sidebar.js';

export function MembershipsPage() {
    return `
        <div class="flex h-screen bg-[#f4f7f6]">
            ${Sidebar()}
            <main class="flex-1 overflow-y-auto p-8 relative">
                <header class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-800">Membership Tiers</h1>
                        <p class="text-gray-600 mt-1">Manage loyalty program tiers and benefits.</p>
                    </div>
                    <button onclick="document.getElementById('add-tier-modal').classList.remove('hidden')" class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                        <i data-lucide="plus" class="w-5 h-5"></i>
                        Add Tier
                    </button>
                </header>
                
                <!-- Tiers List -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="tiers-list">
                    <div class="col-span-full py-12 flex justify-center items-center text-gray-500">
                        <i data-lucide="loader-2" class="w-8 h-8 animate-spin text-indigo-500 mr-3"></i>
                        Loading tiers...
                    </div>
                </div>

                <!-- Add Tier Modal -->
                <div id="add-tier-modal" class="hidden fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-xl font-bold text-gray-800">Create New Tier</h2>
                            <button onclick="document.getElementById('add-tier-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600">
                                <i data-lucide="x" class="w-6 h-6"></i>
                            </button>
                        </div>
                        <form id="add-tier-form" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Tier Name</label>
                                <input type="text" id="tier-name" required class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Points Multiplier</label>
                                <input type="number" id="tier-multiplier" step="0.1" min="1" value="1.0" required class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5">
                                <p class="text-xs text-gray-500 mt-1">E.g., 1.5 means users earn 1.5x points.</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Minimum Points Required</label>
                                <input type="number" id="tier-min-points" min="0" value="0" required class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5">
                            </div>
                            
                            <div class="mt-6 flex justify-end gap-3">
                                <button type="button" onclick="document.getElementById('add-tier-modal').classList.add('hidden')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" class="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                                    Save Tier
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    `;
}
