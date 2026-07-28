import { Sidebar } from '../../../components/Sidebar.js';

export function BalanceSheetPage() {
    return `
    <div class="flex h-screen bg-[#f4f7f6]">
        ${Sidebar()}
        <main class="flex-1 overflow-y-auto p-8">
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-3xl font-bold text-gray-800">Balance Sheet</h1>
                <button onclick="window.print()" class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2 font-medium">
                    <i data-lucide="printer" class="w-5 h-5"></i>
                    Print
                </button>
            </div>
            
            <div id="bs-error" class="hidden mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow-sm border border-red-200"></div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-5xl mx-auto mb-10">
                <div id="bs-loading" class="p-16 text-center text-gray-500">
                    <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                    <p>Loading balance sheet...</p>
                </div>
                
                <div id="bs-content" class="hidden">
                    <div class="p-6 border-b border-gray-100 text-center bg-gray-50">
                        <h2 class="text-xl font-bold text-gray-800 uppercase tracking-wide">Balance Sheet</h2>
                        <p class="text-gray-500 mt-1">As of ${new Date().toLocaleDateString()}</p>
                    </div>
                    
                    <div class="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200">
                        <!-- Assets Side -->
                        <div class="flex-1 p-6">
                            <h3 class="text-lg font-bold text-blue-800 border-b border-blue-200 pb-2 mb-4">ASSETS</h3>
                            <div id="bs-assets-list" class="space-y-2 mb-6">
                                <!-- Assets populated here -->
                            </div>
                            <div class="flex justify-between items-center pt-3 border-t-2 border-gray-800 font-bold text-lg">
                                <span>Total Assets</span>
                                <span id="bs-total-assets">0.00</span>
                            </div>
                        </div>
                        
                        <!-- Liabilities & Equity Side -->
                        <div class="flex-1 p-6">
                            <h3 class="text-lg font-bold text-red-800 border-b border-red-200 pb-2 mb-4">LIABILITIES</h3>
                            <div id="bs-liabilities-list" class="space-y-2 mb-6">
                                <!-- Liabilities populated here -->
                            </div>
                            <div class="flex justify-between items-center pt-3 border-t border-gray-300 font-bold mb-8">
                                <span>Total Liabilities</span>
                                <span id="bs-total-liabilities">0.00</span>
                            </div>

                            <h3 class="text-lg font-bold text-purple-800 border-b border-purple-200 pb-2 mb-4">EQUITY</h3>
                            <div id="bs-equity-list" class="space-y-2 mb-6">
                                <!-- Equity populated here -->
                            </div>
                            <div class="flex justify-between items-center pt-3 border-t border-gray-300 font-bold mb-8">
                                <span>Total Equity</span>
                                <span id="bs-total-equity">0.00</span>
                            </div>
                            
                            <div class="flex justify-between items-center pt-3 border-t-2 border-gray-800 font-bold text-lg">
                                <span>Total Liabilities & Equity</span>
                                <span id="bs-total-liab-equity">0.00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    `;
}
