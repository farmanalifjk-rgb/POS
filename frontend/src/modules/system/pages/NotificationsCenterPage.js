import { Sidebar } from '../../../components/Sidebar.js';

export function NotificationsCenterPage() {
    return `
    <div class='flex h-screen bg-[#f4f7f6]'>
        ${Sidebar()}
        <main class='flex-1 overflow-y-auto p-8'>
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-3xl font-bold text-gray-800">Notification Center</h1>
                <button id="markAllReadBtn" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition shadow-sm hidden">
                    Mark All as Read
                </button>
            </div>
            
            <div class="mb-6 border-b border-gray-200">
                <ul class="flex flex-wrap -mb-px text-sm font-medium text-center" id="notificationTabs">
                    <li class="mr-2">
                        <button class="inline-block p-4 border-b-2 border-indigo-600 text-indigo-600 rounded-t-lg active dark:text-indigo-500 dark:border-indigo-500" data-tab="inapp">In-App</button>
                    </li>
                    <li class="mr-2">
                        <button class="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" data-tab="email">Email Queue</button>
                    </li>
                    <li class="mr-2">
                        <button class="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" data-tab="sms">SMS Queue</button>
                    </li>
                </ul>
            </div>

            <div id="notificationsLoading" class="hidden flex justify-center py-12">
                <i data-lucide="loader-2" class="w-8 h-8 animate-spin text-indigo-600"></i>
            </div>
            
            <div id="notificationsError" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span class="block sm:inline" id="notificationsErrorMessage"></span>
            </div>

            <div id="notificationsContent" class="space-y-4">
                <!-- Dynamic Content -->
            </div>
        </main>
    </div>
    `;
}
