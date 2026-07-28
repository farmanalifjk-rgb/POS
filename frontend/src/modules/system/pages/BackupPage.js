import { Sidebar } from '../../../components/Sidebar.js';

export function BackupPage() {
    return `
    <div class="flex h-screen bg-[#f8fafc]">
        ${Sidebar()}
        <main class="flex-1 overflow-y-auto p-8">
            <div class="max-w-7xl mx-auto space-y-6">
                <!-- Header -->
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            Backup & Restore Center
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                <i data-lucide="alert-triangle" class="w-3 h-3 mr-1"></i> Critical System Area
                            </span>
                        </h1>
                        <p class="text-sm text-gray-500 mt-1">Manage database backups and system restoration</p>
                    </div>
                </div>

                <!-- Stats Row -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div class="flex items-center text-gray-500 mb-2">
                            <i data-lucide="clock" class="w-4 h-4 mr-2"></i>
                            <h3 class="text-sm font-medium">Last Backup</h3>
                        </div>
                        <p class="text-2xl font-bold text-gray-900" id="stat-last-backup">--</p>
                    </div>
                    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div class="flex items-center text-gray-500 mb-2">
                            <i data-lucide="database" class="w-4 h-4 mr-2"></i>
                            <h3 class="text-sm font-medium">Total Backups</h3>
                        </div>
                        <p class="text-2xl font-bold text-gray-900" id="stat-total-backups">0</p>
                    </div>
                    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div class="flex items-center text-gray-500 mb-2">
                            <i data-lucide="hard-drive" class="w-4 h-4 mr-2"></i>
                            <h3 class="text-sm font-medium">Database Size</h3>
                        </div>
                        <p class="text-2xl font-bold text-gray-900" id="stat-db-size">--</p>
                    </div>
                    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div class="flex items-center text-gray-500 mb-2">
                            <i data-lucide="calendar" class="w-4 h-4 mr-2"></i>
                            <h3 class="text-sm font-medium">Schedule Status</h3>
                        </div>
                        <p class="text-2xl font-bold text-gray-900" id="stat-schedule">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Unknown
                            </span>
                        </p>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Left Column: Manual & History -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Manual Backup -->
                        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div class="flex items-start justify-between">
                                <div>
                                    <h2 class="text-lg font-bold text-gray-900 mb-1">Manual Backup</h2>
                                    <p class="text-sm text-gray-500">Create a point-in-time snapshot of the database.</p>
                                </div>
                                <button onclick="window.createBackup()" id="btn-create-backup" class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm">
                                    <i data-lucide="plus" class="w-4 h-4 mr-2"></i>
                                    Create Backup
                                </button>
                            </div>
                            <div id="backup-success-msg" class="hidden mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                <div class="flex items-center">
                                    <i data-lucide="check-circle" class="w-5 h-5 text-green-500 mr-2"></i>
                                    <span class="text-sm text-green-800">Backup completed successfully: <span id="backup-success-name" class="font-medium"></span></span>
                                </div>
                            </div>
                        </div>

                        <!-- Backup History -->
                        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div class="px-6 py-4 border-b border-gray-100">
                                <h2 class="text-lg font-bold text-gray-900">Backup History</h2>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="w-full text-sm text-left">
                                    <thead class="text-xs text-gray-500 bg-gray-50 uppercase">
                                        <tr>
                                            <th class="px-6 py-3">#</th>
                                            <th class="px-6 py-3">File Name</th>
                                            <th class="px-6 py-3">Type</th>
                                            <th class="px-6 py-3">Size</th>
                                            <th class="px-6 py-3">Status</th>
                                            <th class="px-6 py-3">Created At</th>
                                            <th class="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="backup-table-body" class="divide-y divide-gray-100">
                                        <!-- Populated via JS -->
                                    </tbody>
                                </table>
                            </div>
                            <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between" id="backup-pagination">
                                <!-- Pagination -->
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Settings -->
                    <div class="space-y-6">
                        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <i data-lucide="settings" class="w-5 h-5 mr-2 text-gray-400"></i>
                                Schedule & Settings
                            </h2>
                            <form id="backup-settings-form" class="space-y-4" onsubmit="event.preventDefault(); window.saveBackupSettings();">
                                
                                <div class="flex items-center justify-between py-2 border-b border-gray-100">
                                    <div>
                                        <label class="text-sm font-medium text-gray-900">Auto-backup</label>
                                        <p class="text-xs text-gray-500">Run backups automatically</p>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id="setting-auto-backup" class="sr-only peer">
                                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                                    <select id="setting-frequency" class="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Retention Count</label>
                                    <p class="text-xs text-gray-500 mb-2">Keep last N backups</p>
                                    <input type="number" id="setting-retention" min="1" max="100" class="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                                </div>

                                <div class="flex items-center justify-between py-2 border-t border-gray-100">
                                    <div>
                                        <label class="text-sm font-medium text-gray-900">Email Notifications</label>
                                        <p class="text-xs text-gray-500">Send summary on completion</p>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id="setting-notify" class="sr-only peer">
                                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>

                                <button type="submit" class="w-full px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors">
                                    Save Schedule
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Restore Warning Modal -->
    <div id="restore-modal" class="hidden fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" onclick="window.closeRestoreModal()"></div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-red-100">
                <div class="bg-red-50 px-4 py-3 border-b border-red-100">
                    <div class="flex items-center">
                        <i data-lucide="alert-triangle" class="h-6 w-6 text-red-600 mr-2"></i>
                        <h3 class="text-lg leading-6 font-bold text-red-900" id="modal-title">CRITICAL: Restore Database</h3>
                    </div>
                </div>
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div class="mt-2 space-y-4">
                        <p class="text-sm text-gray-700">
                            <strong>WARNING:</strong> This action will <span class="text-red-600 font-bold">OVERWRITE</span> your current database with the selected backup. Any data created after this backup will be permanently lost.
                        </p>
                        <p class="text-sm text-gray-500">Backup to restore: <span id="restore-filename-display" class="font-mono bg-gray-100 px-1 rounded"></span></p>
                        
                        <div class="mt-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Type <strong>RESTORE</strong> to confirm</label>
                            <input type="text" id="restore-confirm-input" class="w-full rounded-lg border-red-300 border px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500" placeholder="RESTORE" oninput="window.checkRestoreConfirm(this.value)">
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100">
                    <button type="button" id="btn-confirm-restore" disabled class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors" onclick="window.confirmRestore()">
                        Confirm Restore
                    </button>
                    <button type="button" class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors" onclick="window.closeRestoreModal()">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;
}
