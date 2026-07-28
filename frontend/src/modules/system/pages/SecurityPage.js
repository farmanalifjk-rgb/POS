import { Sidebar } from '../../../components/Sidebar.js';

export function SecurityPage() {
    return `
    <div class="flex h-screen bg-[#f8fafc]">
        ${Sidebar()}
        <main class="flex-1 overflow-y-auto p-8">
            <div class="max-w-7xl mx-auto space-y-6">
                <!-- Header -->
                <div>
                    <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Security Center</h1>
                    <p class="text-sm text-slate-500 mt-1">Manage access, monitor activity, and secure your POS system.</p>
                </div>

                <!-- Warning Banner -->
                <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                    <i data-lucide="shield-alert" class="w-5 h-5 text-amber-600 mt-0.5"></i>
                    <div>
                        <h4 class="text-sm font-medium text-amber-800">Security Best Practices</h4>
                        <p class="text-sm text-amber-700 mt-1">Regularly review active sessions and revoke any unrecognized devices. Use API tokens with the minimum required scopes.</p>
                    </div>
                </div>

                <!-- Main Content Layout: Vertical Tabs -->
                <div class="flex flex-col lg:flex-row gap-8 mt-6">
                    <!-- Left Tab Navigation -->
                    <div class="w-full lg:w-64 flex-shrink-0">
                        <nav class="space-y-1 flex flex-col">
                            <button onclick="window.switchTab('sessions')" id="nav-sessions" class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 transition-colors w-full text-left">
                                <i data-lucide="laptop" class="w-4 h-4"></i> Active Sessions
                            </button>
                            <button onclick="window.switchTab('login-history')" id="nav-login-history" class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 transition-colors w-full text-left">
                                <i data-lucide="history" class="w-4 h-4"></i> Login History
                            </button>
                            <button onclick="window.switchTab('audit-logs')" id="nav-audit-logs" class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 transition-colors w-full text-left">
                                <i data-lucide="file-search" class="w-4 h-4"></i> Audit Logs
                            </button>
                            <button onclick="window.switchTab('api-tokens')" id="nav-api-tokens" class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 transition-colors w-full text-left">
                                <i data-lucide="key" class="w-4 h-4"></i> API Tokens
                            </button>
                            <button onclick="window.switchTab('devices')" id="nav-devices" class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 transition-colors w-full text-left">
                                <i data-lucide="smartphone" class="w-4 h-4"></i> Trusted Devices
                            </button>
                        </nav>
                    </div>

                    <!-- Right Content Panel -->
                    <div class="flex-1 min-w-0">
                        <!-- TAB: Active Sessions -->
                        <div id="tab-sessions" class="space-y-6 block">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                    <div class="text-sm font-medium text-slate-500">Total Active Sessions</div>
                                    <div class="mt-2 text-2xl font-bold text-slate-900" id="stat-total-sessions">-</div>
                                </div>
                                <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                    <div class="text-sm font-medium text-slate-500">Sessions Today</div>
                                    <div class="mt-2 text-2xl font-bold text-slate-900" id="stat-sessions-today">-</div>
                                </div>
                                <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                    <div class="text-sm font-medium text-slate-500">Devices Authorized</div>
                                    <div class="mt-2 text-2xl font-bold text-slate-900" id="stat-authorized-devices">-</div>
                                </div>
                            </div>
                            
                            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div class="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                                    <h3 class="font-semibold text-slate-800">Active Sessions</h3>
                                    <button onclick="window.loadSessions()" class="text-sm text-slate-500 hover:text-slate-700"><i data-lucide="refresh-cw" class="w-4 h-4"></i></button>
                                </div>
                                <div class="overflow-x-auto">
                                    <table class="w-full text-left text-sm text-slate-600">
                                        <thead class="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                                            <tr>
                                                <th class="px-6 py-3 font-medium">Session ID</th>
                                                <th class="px-6 py-3 font-medium">Device & IP</th>
                                                <th class="px-6 py-3 font-medium">Created / Last Used</th>
                                                <th class="px-6 py-3 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="sessions-table-body" class="divide-y divide-slate-100">
                                            <!-- Rows populated by JS -->
                                        </tbody>
                                    </table>
                                </div>
                                <div id="sessions-loading" class="hidden p-8 text-center text-slate-500">
                                    <i data-lucide="loader-2" class="w-6 h-6 animate-spin mx-auto mb-2"></i>
                                    <p>Loading sessions...</p>
                                </div>
                            </div>
                        </div>

                        <!-- TAB: Login History -->
                        <div id="tab-login-history" class="space-y-6 hidden">
                            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div class="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                                    <h3 class="font-semibold text-slate-800">Login History</h3>
                                    <div class="flex items-center gap-3">
                                        <select id="login-filter-status" class="text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-1.5" onchange="window.loadLoginHistory()">
                                            <option value="">All Status</option>
                                            <option value="success">Success</option>
                                            <option value="failed">Failed</option>
                                        </select>
                                        <input type="date" id="login-filter-start" class="text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-1.5" onchange="window.loadLoginHistory()">
                                        <span class="text-slate-400">-</span>
                                        <input type="date" id="login-filter-end" class="text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-1.5" onchange="window.loadLoginHistory()">
                                    </div>
                                </div>
                                <div class="overflow-x-auto">
                                    <table class="w-full text-left text-sm text-slate-600">
                                        <thead class="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                                            <tr>
                                                <th class="px-6 py-3 font-medium">Status</th>
                                                <th class="px-6 py-3 font-medium">User / IP Address</th>
                                                <th class="px-6 py-3 font-medium">User Agent</th>
                                                <th class="px-6 py-3 font-medium">Timestamp</th>
                                            </tr>
                                        </thead>
                                        <tbody id="login-history-table-body" class="divide-y divide-slate-100">
                                            <!-- Rows -->
                                        </tbody>
                                    </table>
                                </div>
                                <div class="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                                    <span class="text-sm text-slate-500" id="login-pagination-info">Showing page 1</span>
                                    <div class="flex gap-2">
                                        <button onclick="window.loadLoginHistory(window.loginHistoryPage - 1)" id="login-prev-btn" class="px-3 py-1 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50">Previous</button>
                                        <button onclick="window.loadLoginHistory(window.loginHistoryPage + 1)" id="login-next-btn" class="px-3 py-1 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50">Next</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- TAB: Audit Logs -->
                        <div id="tab-audit-logs" class="space-y-6 hidden">
                            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div class="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                                    <h3 class="font-semibold text-slate-800">Audit Logs</h3>
                                    <div class="flex items-center gap-3">
                                        <select id="audit-filter-action" class="text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-1.5" onchange="window.loadAuditLogs()">
                                            <option value="">All Actions</option>
                                            <option value="create">Create</option>
                                            <option value="update">Update</option>
                                            <option value="delete">Delete</option>
                                        </select>
                                        <button onclick="window.exportAuditLogs()" class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
                                            <i data-lucide="download" class="w-4 h-4"></i> Export CSV
                                        </button>
                                    </div>
                                </div>
                                <div class="overflow-x-auto">
                                    <table class="w-full text-left text-sm text-slate-600">
                                        <thead class="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                                            <tr>
                                                <th class="px-6 py-3 font-medium">Action</th>
                                                <th class="px-6 py-3 font-medium">Entity & ID</th>
                                                <th class="px-6 py-3 font-medium">Description</th>
                                                <th class="px-6 py-3 font-medium">User & IP</th>
                                                <th class="px-6 py-3 font-medium">Timestamp</th>
                                            </tr>
                                        </thead>
                                        <tbody id="audit-logs-table-body" class="divide-y divide-slate-100">
                                            <!-- Rows -->
                                        </tbody>
                                    </table>
                                </div>
                                <div class="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                                    <span class="text-sm text-slate-500" id="audit-pagination-info">Showing page 1</span>
                                    <div class="flex gap-2">
                                        <button onclick="window.loadAuditLogs(window.auditPage - 1)" id="audit-prev-btn" class="px-3 py-1 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50">Previous</button>
                                        <button onclick="window.loadAuditLogs(window.auditPage + 1)" id="audit-next-btn" class="px-3 py-1 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50">Next</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- TAB: API Tokens -->
                        <div id="tab-api-tokens" class="space-y-6 hidden">
                            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div class="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                                    <h3 class="font-semibold text-slate-800">API Tokens</h3>
                                    <button onclick="window.openApiTokenModal()" class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        <i data-lucide="plus" class="w-4 h-4"></i> Create Token
                                    </button>
                                </div>
                                <div class="overflow-x-auto">
                                    <table class="w-full text-left text-sm text-slate-600">
                                        <thead class="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                                            <tr>
                                                <th class="px-6 py-3 font-medium">Token Name</th>
                                                <th class="px-6 py-3 font-medium">Key</th>
                                                <th class="px-6 py-3 font-medium">Scopes</th>
                                                <th class="px-6 py-3 font-medium">Created / Last Used</th>
                                                <th class="px-6 py-3 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="api-tokens-table-body" class="divide-y divide-slate-100">
                                            <!-- Rows -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <!-- TAB: Trusted Devices -->
                        <div id="tab-devices" class="space-y-6 hidden">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                    <div class="text-sm font-medium text-slate-500">Total Devices</div>
                                    <div class="mt-2 text-2xl font-bold text-slate-900" id="stat-total-devices">-</div>
                                </div>
                                <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                    <div class="text-sm font-medium text-slate-500">Authorized</div>
                                    <div class="mt-2 text-2xl font-bold text-green-600" id="stat-auth-devices">-</div>
                                </div>
                                <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                    <div class="text-sm font-medium text-slate-500">Pending</div>
                                    <div class="mt-2 text-2xl font-bold text-amber-600" id="stat-pending-devices">-</div>
                                </div>
                            </div>

                            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div class="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                                    <h3 class="font-semibold text-slate-800">Trusted Devices</h3>
                                </div>
                                <div class="overflow-x-auto">
                                    <table class="w-full text-left text-sm text-slate-600">
                                        <thead class="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                                            <tr>
                                                <th class="px-6 py-3 font-medium">Device Info</th>
                                                <th class="px-6 py-3 font-medium">Status</th>
                                                <th class="px-6 py-3 font-medium">Last Seen</th>
                                                <th class="px-6 py-3 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="devices-table-body" class="divide-y divide-slate-100">
                                            <!-- Rows -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Modals -->

    <!-- Create API Token Modal -->
    <div id="modal-api-token" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onclick="window.closeApiTokenModal()"></div>
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative z-10">
            <div class="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h3 class="font-semibold text-slate-800 text-lg">Create API Token</h3>
                <button onclick="window.closeApiTokenModal()" class="text-slate-400 hover:text-slate-600">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="p-6 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Token Name</label>
                    <input type="text" id="token-name" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Integration Server">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Scopes</label>
                    <div class="space-y-2">
                        <label class="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" name="token-scope" value="read" class="rounded text-blue-600 focus:ring-blue-500"> Read</label>
                        <label class="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" name="token-scope" value="write" class="rounded text-blue-600 focus:ring-blue-500"> Write</label>
                        <label class="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" name="token-scope" value="admin" class="rounded text-blue-600 focus:ring-blue-500"> Admin</label>
                    </div>
                </div>
            </div>
            <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                <button onclick="window.closeApiTokenModal()" class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button onclick="window.createApiToken()" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Create Token</button>
            </div>
        </div>
    </div>

    <!-- Token Success Modal -->
    <div id="modal-token-success" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"></div>
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative z-10">
            <div class="p-6 text-center">
                <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-green-600">
                    <i data-lucide="check" class="w-6 h-6"></i>
                </div>
                <h3 class="font-semibold text-slate-800 text-lg mb-2">Token Created Successfully</h3>
                <p class="text-sm text-slate-500 mb-6">Please copy your new API token. For your security, it will not be shown again.</p>
                
                <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-lg mb-6">
                    <input type="text" id="new-token-value" readonly class="w-full bg-transparent border-none text-sm font-mono text-slate-700 focus:ring-0">
                    <button onclick="window.copyToClipboard('new-token-value')" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded">
                        <i data-lucide="copy" class="w-4 h-4"></i>
                    </button>
                </div>

                <button onclick="document.getElementById('modal-token-success').classList.add('hidden')" class="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Done</button>
            </div>
        </div>
    </div>
    `;
}
