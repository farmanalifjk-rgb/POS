import { Sidebar } from "../../../components/Sidebar.js";

export function HardwarePage() {
  return `
    <div class="flex h-screen bg-slate-50 overflow-hidden">
      ${Sidebar()}

      <main class="flex-1 overflow-y-auto p-8 min-h-0">
        <header class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Hardware Setup & Diagnostics</h1>
          <p class="text-slate-500 mt-2">Manage your barcode scanners, ESC/POS printers, scales, and customer displays.</p>
        </header>

        <!-- Main Grid -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
          <!-- LEFT COLUMN: Devices & Settings -->
          <div class="xl:col-span-2 space-y-6">
          
            <!-- Printer & Drawer -->
            <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div class="flex items-start justify-between mb-6">
                <div class="flex gap-4">
                  <div class="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
                    <i data-lucide="printer" class="w-6 h-6"></i>
                  </div>
                  <div>
                    <h2 class="text-xl font-bold text-slate-900">Receipt Printer & Cash Drawer</h2>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="relative flex h-3 w-3">
                        <span id="hw-status-printer-ping" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                        <span id="hw-status-printer-dot" class="relative inline-flex rounded-full h-3 w-3 bg-slate-500"></span>
                      </span>
                      <span id="hw-status-printer-text" class="text-sm font-semibold text-slate-600">Disconnected</span>
                    </div>
                  </div>
                </div>
                <button onclick="window.hwConnectPrinter()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition shadow-sm">
                  Connect Printer
                </button>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Paper Width</label>
                  <select id="hw-set-paper" class="w-full border-slate-200 rounded-lg text-sm bg-white" onchange="window.hwUpdateSettings()">
                    <option value="80">80mm</option>
                    <option value="58">58mm</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Copies</label>
                  <select id="hw-set-copies" class="w-full border-slate-200 rounded-lg text-sm bg-white" onchange="window.hwUpdateSettings()">
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                </div>
                <div class="flex items-center gap-3 pt-6">
                  <input type="checkbox" id="hw-set-autocut" class="w-5 h-5 rounded text-indigo-600 border-gray-300" checked onchange="window.hwUpdateSettings()">
                  <label for="hw-set-autocut" class="text-sm font-medium text-slate-700">Auto Cut</label>
                </div>
                <div class="flex items-center gap-3 pt-6">
                  <input type="checkbox" id="hw-set-drawer" class="w-5 h-5 rounded text-indigo-600 border-gray-300" checked onchange="window.hwUpdateSettings()">
                  <label for="hw-set-drawer" class="text-sm font-medium text-slate-700">Open Drawer</label>
                </div>
              </div>
            </div>

            <!-- Customer Display -->
            <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div class="flex items-start justify-between mb-6">
                <div class="flex gap-4">
                  <div class="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                    <i data-lucide="monitor" class="w-6 h-6"></i>
                  </div>
                  <div>
                    <h2 class="text-xl font-bold text-slate-900">Customer Pole Display (VFD)</h2>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="relative flex h-3 w-3">
                        <span id="hw-status-display-ping" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                        <span id="hw-status-display-dot" class="relative inline-flex rounded-full h-3 w-3 bg-slate-500"></span>
                      </span>
                      <span id="hw-status-display-text" class="text-sm font-semibold text-slate-600">Disconnected</span>
                    </div>
                  </div>
                </div>
                <button onclick="window.hwConnectDisplay()" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition shadow-sm">
                  Connect Display
                </button>
              </div>

              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Welcome Message</label>
                <input type="text" id="hw-set-welcome" value="Welcome to POS!" class="w-full border-slate-200 rounded-lg text-sm bg-white p-2" onchange="window.hwUpdateSettings()" maxlength="40">
              </div>
            </div>

            <!-- Weighing Scale -->
            <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div class="flex items-start justify-between mb-6">
                <div class="flex gap-4">
                  <div class="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                    <i data-lucide="scale" class="w-6 h-6"></i>
                  </div>
                  <div>
                    <h2 class="text-xl font-bold text-slate-900">Weighing Scale</h2>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="relative flex h-3 w-3">
                        <span id="hw-status-scale-ping" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                        <span id="hw-status-scale-dot" class="relative inline-flex rounded-full h-3 w-3 bg-slate-500"></span>
                      </span>
                      <span id="hw-status-scale-text" class="text-sm font-semibold text-slate-600">Disconnected</span>
                    </div>
                  </div>
                </div>
                <button onclick="window.hwConnectScale()" class="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition shadow-sm">
                  Connect Scale
                </button>
              </div>

              <div class="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 items-center">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Decimal Places</label>
                  <select id="hw-set-scale-dec" class="w-full border-slate-200 rounded-lg text-sm bg-white" onchange="window.hwUpdateSettings()">
                    <option value="2">2 (0.00)</option>
                    <option value="3" selected>3 (0.000)</option>
                  </select>
                </div>
                <div class="flex justify-end pr-4">
                  <div class="text-center">
                    <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Live Reading</div>
                    <div class="text-3xl font-bold text-slate-900 font-mono" id="hw-scale-live">0.000 kg</div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>

          <!-- RIGHT COLUMN: Diagnostics & Logs -->
          <div class="space-y-6">
            
            <!-- Diagnostics -->
            <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <i data-lucide="activity" class="w-5 h-5 text-indigo-500"></i>
                Hardware Diagnostics
              </h2>
              
              <div class="space-y-3">
                <button onclick="window.hwTestPrint()" class="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                  <span class="font-medium text-slate-700 flex items-center gap-2"><i data-lucide="printer" class="w-4 h-4 text-slate-400"></i> Test Print & Cut</span>
                  <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i>
                </button>
                <button onclick="window.hwTestDrawer()" class="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                  <span class="font-medium text-slate-700 flex items-center gap-2"><i data-lucide="unlock" class="w-4 h-4 text-slate-400"></i> Open Cash Drawer</span>
                  <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i>
                </button>
                <button onclick="window.hwTestDisplay()" class="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                  <span class="font-medium text-slate-700 flex items-center gap-2"><i data-lucide="monitor" class="w-4 h-4 text-slate-400"></i> Test Customer Display</span>
                  <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i>
                </button>
              </div>
            </div>

            <!-- Hardware Logs -->
            <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-[400px]">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <i data-lucide="scroll-text" class="w-5 h-5 text-indigo-500"></i>
                  System Logs
                </h2>
                <span class="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Live</span>
              </div>
              
              <div id="hw-log-container" class="flex-1 overflow-y-auto bg-slate-900 rounded-xl p-4 font-mono text-xs space-y-2">
                <!-- Logs will be injected here -->
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  `;
}
