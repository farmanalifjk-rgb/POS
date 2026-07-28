import { Sidebar } from '../../../components/Sidebar';

export function WarehouseTransfersPage() {
    return `
    <div class="flex h-screen bg-[#f8fafc]">
        ${Sidebar()}
        <main class="flex-1 overflow-y-auto p-8">
            <div class="max-w-7xl mx-auto space-y-6">
                <!-- Header -->
                <div class="flex justify-between items-center">
                    <div>
                        <h1 class="text-2xl font-bold text-slate-800 tracking-tight">Warehouse Transfers</h1>
                        <p class="text-slate-500 mt-1 text-sm">Manage inventory movement between locations</p>
                    </div>
                    <button onclick="window.openTransferModal()" class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
                        <i data-lucide="plus" class="w-4 h-4 mr-2"></i>
                        New Transfer
                    </button>
                </div>

                <!-- Stats Row -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div class="flex items-center justify-between pb-2">
                            <h3 class="text-sm font-medium text-slate-500">Total Transfers</h3>
                            <i data-lucide="arrow-left-right" class="w-5 h-5 text-indigo-500"></i>
                        </div>
                        <div class="text-2xl font-bold text-slate-800" id="stat-total">0</div>
                    </div>
                    <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div class="flex items-center justify-between pb-2">
                            <h3 class="text-sm font-medium text-slate-500">Pending</h3>
                            <i data-lucide="clock" class="w-5 h-5 text-amber-500"></i>
                        </div>
                        <div class="text-2xl font-bold text-slate-800" id="stat-pending">0</div>
                    </div>
                    <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div class="flex items-center justify-between pb-2">
                            <h3 class="text-sm font-medium text-slate-500">Received Today</h3>
                            <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-500"></i>
                        </div>
                        <div class="text-2xl font-bold text-slate-800" id="stat-received">0</div>
                    </div>
                    <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div class="flex items-center justify-between pb-2">
                            <h3 class="text-sm font-medium text-slate-500">Cancelled</h3>
                            <i data-lucide="x-circle" class="w-5 h-5 text-red-500"></i>
                        </div>
                        <div class="text-2xl font-bold text-slate-800" id="stat-cancelled">0</div>
                    </div>
                </div>

                <!-- Filter Tabs -->
                <div class="border-b border-slate-200">
                    <nav class="-mb-px flex space-x-8" aria-label="Tabs" id="transfer-tabs">
                        <button onclick="window.filterByStatus('all')" class="status-tab border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" data-status="all">All</button>
                        <button onclick="window.filterByStatus('draft')" class="status-tab border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" data-status="draft">Draft</button>
                        <button onclick="window.filterByStatus('in_transit')" class="status-tab border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" data-status="in_transit">In Transit</button>
                        <button onclick="window.filterByStatus('received')" class="status-tab border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" data-status="received">Received</button>
                        <button onclick="window.filterByStatus('cancelled')" class="status-tab border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" data-status="cancelled">Cancelled</button>
                    </nav>
                </div>

                <!-- Transfers Table -->
                <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-sm text-slate-600">
                            <thead class="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                                <tr>
                                    <th class="px-6 py-4">Transfer #</th>
                                    <th class="px-6 py-4">From</th>
                                    <th class="px-6 py-4">To</th>
                                    <th class="px-6 py-4">Items</th>
                                    <th class="px-6 py-4">Status</th>
                                    <th class="px-6 py-4">Requested By</th>
                                    <th class="px-6 py-4">Date</th>
                                    <th class="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="transfers-tbody" class="divide-y divide-slate-100">
                                <!-- Loading State -->
                                <tr><td colspan="8" class="px-6 py-8 text-center text-slate-500">Loading transfers...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- New Transfer Modal -->
    <div id="transfer-modal" class="fixed inset-0 bg-slate-900/50 hidden z-50 flex items-center justify-center backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 class="text-lg font-bold text-slate-800">New Warehouse Transfer</h2>
                <button type="button" onclick="window.closeTransferModal()" class="text-slate-400 hover:text-slate-600 transition-colors">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            
            <form id="transfer-form" class="flex-1 overflow-y-auto p-6 space-y-6" onsubmit="window.submitTransfer(event)">
                <div class="grid grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Source Warehouse</label>
                        <select id="source_warehouse" required class="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3 border outline-none">
                            <option value="">Select source...</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Destination Warehouse</label>
                        <select id="destination_warehouse" required class="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3 border outline-none">
                            <option value="">Select destination...</option>
                        </select>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Note (Optional)</label>
                    <textarea id="transfer_note" rows="2" class="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3 border outline-none resize-none" placeholder="Reason for transfer..."></textarea>
                </div>

                <div class="border-t border-slate-200 pt-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-sm font-bold text-slate-800">Line Items</h3>
                        <button type="button" onclick="window.addTransferLine()" class="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center bg-indigo-50 px-2 py-1 rounded">
                            <i data-lucide="plus" class="w-3 h-3 mr-1"></i> Add Item
                        </button>
                    </div>
                    
                    <div class="space-y-3" id="transfer-lines">
                        <!-- Dynamic lines go here -->
                    </div>
                </div>
                
                <div class="pt-4 flex justify-end gap-3 border-t border-slate-100">
                    <button type="button" onclick="window.closeTransferModal()" class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                    <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Create Transfer</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Receive Transfer Modal -->
    <div id="receive-modal" class="fixed inset-0 bg-slate-900/50 hidden z-50 flex items-center justify-center backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                    <h2 class="text-lg font-bold text-slate-800">Receive Transfer <span id="receive-transfer-id" class="text-indigo-600"></span></h2>
                    <p class="text-xs text-slate-500 mt-1" id="receive-route"></p>
                </div>
                <button type="button" onclick="window.closeReceiveModal()" class="text-slate-400 hover:text-slate-600 transition-colors">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            
            <form id="receive-form" class="flex-1 overflow-y-auto p-6 space-y-6" onsubmit="window.submitReceive(event)">
                <input type="hidden" id="receive_transfer_pk">
                
                <div class="border border-slate-200 rounded-lg overflow-hidden">
                    <table class="w-full text-left text-sm text-slate-600">
                        <thead class="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th class="px-4 py-3 font-medium text-slate-700">Product</th>
                                <th class="px-4 py-3 font-medium text-slate-700 w-24">Requested</th>
                                <th class="px-4 py-3 font-medium text-slate-700 w-32">Received</th>
                            </tr>
                        </thead>
                        <tbody id="receive-items-tbody" class="divide-y divide-slate-100">
                        </tbody>
                    </table>
                </div>
                
                <div class="pt-4 flex justify-end gap-3 border-t border-slate-100">
                    <button type="button" onclick="window.closeReceiveModal()" class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                    <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">Confirm Receipt</button>
                </div>
            </form>
        </div>
    </div>
    `;
}
