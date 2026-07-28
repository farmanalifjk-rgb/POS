import { createIcons, icons } from "lucide";
import { getSettings, updateSettings } from "../../../js/inventory/services/inventory-api";

let selectedLogoFile = null;

window.initializeSettings = async function() {
    await loadSettings();
    createIcons({ icons });
    // Make sure we start on company tab
    window.switchTab("company");
};

async function loadSettings() {
    try {
        const response = await getSettings();
        if (response) {
            populateForm(response);
        }
    } catch (error) {
        console.error("Failed to load settings:", error);
        showToast("Error loading settings", "error");
    }
}

function populateForm(data) {

    document.querySelectorAll("[id^='setting-']").forEach(input => {

        const key = input.id.replace("setting-", "");

        if (!(key in data)) return;

        // Never set a file input programmatically
        if (input.type === "file") {
            return;
        }

        // Checkbox / Toggle
        if (input.type === "checkbox") {
            input.checked = Boolean(data[key]);
            return;
        }

        // Radio button
        if (input.type === "radio") {
            input.checked = input.value == data[key];
            return;
        }

        // Select, Text, Number, Textarea, etc.
        input.value = data[key] ?? "";

    });

}

window.previewLogo = function(event) {
    const file = event.target.files[0];
    if (file) {
        selectedLogoFile = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            showLogoPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }
};

function showLogoPreview(src) {
    const preview = document.getElementById("setting-logo-preview");
    const placeholder = document.getElementById("setting-logo-placeholder");
    
    if (preview && placeholder) {
        preview.src = src;
        preview.classList.remove("hidden");
        placeholder.classList.add("hidden");
    }
}

window.saveSettings = async function() {
    try {
        const formData = new FormData();
        
        // Dynamically append all inputs starting with 'setting-'
        const allInputs = document.querySelectorAll("[id^='setting-']");
        allInputs.forEach(el => {
            const field = el.id.replace("setting-", "");
            if (el.type === "checkbox") {
                formData.append(field, el.checked ? "true" : "false");
            } else {
                formData.append(field, el.value);
            }
        });
        
        if (selectedLogoFile) {
            formData.append("logo", selectedLogoFile);
        }
        
        const res = await updateSettings(formData);
        showToast("Settings saved successfully!", "success");
        if (res && res.settings) {
            populateForm(res.settings);
        }
    } catch (error) {
        console.error("Failed to save settings:", error);
        showToast("Error saving settings", "error");
    }
};

// ── Tab Switching Logic ──
window.switchTab = function(tabId) {
    // Hide all panels
    document.querySelectorAll(".settings-panel").forEach(p => p.classList.add("hidden"));
    
    // Show selected panel
    const panel = document.getElementById(`tab-panel-${tabId}`);
    if (panel) panel.classList.remove("hidden");
    
    // Style active tab button
    document.querySelectorAll("[id^='tab-btn-']").forEach(btn => {
        btn.className = "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition text-left";
    });
    const activeBtn = document.getElementById(`tab-btn-${tabId}`);
    if (activeBtn) {
        activeBtn.className = "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-indigo-600 bg-indigo-50/80 transition text-left";
    }
    createIcons({ icons });
};

// ── Outbound Integrations Diagnostics ──
window.testEmailConfig = async function() {
    const host = document.getElementById("setting-email_smtp_host")?.value;
    const port = document.getElementById("setting-email_smtp_port")?.value;
    const username = document.getElementById("setting-email_username")?.value;
    const password = document.getElementById("setting-email_password")?.value;
    const sender_name = document.getElementById("setting-email_sender_name")?.value;
    const sender_email = document.getElementById("setting-email_sender_email")?.value;
    
    const consoleDiv = document.getElementById("email-log-output");
    if (!consoleDiv) return;
    
    consoleDiv.classList.remove("hidden");
    consoleDiv.innerHTML = `<span class="text-indigo-400">⚡ Starting SMTP Outbound Handshake diagnostic...</span><br>`;
    
    try {
        const res = await fetch("/api/settings/test-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ host, port, username, password, sender_name, sender_email })
        });
        const data = await res.json();
        
        if (!res.ok) {
            consoleDiv.innerHTML += `<span class="text-red-500">❌ Error: ${data.error || "SMTP test failed"}</span>`;
            return;
        }
        
        let delay = 0;
        data.logs.forEach(line => {
            setTimeout(() => {
                consoleDiv.innerHTML += `<span class="text-slate-400">&gt; ${line}</span><br>`;
                consoleDiv.scrollTop = consoleDiv.scrollHeight;
            }, delay);
            delay += 250;
        });
        
        setTimeout(() => {
            consoleDiv.innerHTML += `<br><span class="text-emerald-400 font-bold">✓ Success: ${data.message}</span>`;
            consoleDiv.scrollTop = consoleDiv.scrollHeight;
            showToast("Test email sent!", "success");
        }, delay);
        
    } catch (err) {
        consoleDiv.innerHTML += `<span class="text-red-500">❌ Handshake failed: Network error connecting to SMTP relay</span>`;
    }
};

window.testSMSConfig = async function() {
    const provider = document.getElementById("setting-sms_provider")?.value;
    const api_key = document.getElementById("setting-sms_api_key")?.value;
    const sender_id = document.getElementById("setting-sms_sender_id")?.value;
    
    const consoleDiv = document.getElementById("sms-log-output");
    if (!consoleDiv) return;
    
    consoleDiv.classList.remove("hidden");
    consoleDiv.innerHTML = `<span class="text-indigo-400">⚡ Starting SMS Gateway routing test...</span><br>`;
    
    try {
        const res = await fetch("/api/settings/test-sms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provider, api_key, sender_id })
        });
        const data = await res.json();
        
        if (!res.ok) {
            consoleDiv.innerHTML += `<span class="text-red-500">❌ Error: ${data.error || "SMS test failed"}</span>`;
            return;
        }
        
        let delay = 0;
        data.logs.forEach(line => {
            setTimeout(() => {
                consoleDiv.innerHTML += `<span class="text-slate-400">&gt; ${line}</span><br>`;
                consoleDiv.scrollTop = consoleDiv.scrollHeight;
            }, delay);
            delay += 250;
        });
        
        setTimeout(() => {
            consoleDiv.innerHTML += `<br><span class="text-emerald-400 font-bold">✓ Success: ${data.message}</span>`;
            consoleDiv.scrollTop = consoleDiv.scrollHeight;
            showToast("Test SMS dispatched!", "success");
        }, delay);
        
    } catch (err) {
        consoleDiv.innerHTML += `<span class="text-red-500">❌ Gateway timeout: Connection closed by remote carrier</span>`;
    }
};

// ── Interactive Containers Maintenance operations ──
window.triggerMaintenanceAction = async function(action) {
    const consoleDiv = document.getElementById("maintenance-console");
    const contentDiv = document.getElementById("maintenance-console-content");
    if (!consoleDiv || !contentDiv) return;
    
    consoleDiv.classList.remove("hidden");
    contentDiv.innerHTML = `<p class="text-indigo-400">⚡ Initializing containers operation: ${action.toUpperCase()}...</p>`;
    
    try {
        let res;
        if (action === "storage-usage") {
            res = await fetch("/api/settings/storage-usage");
        } else {
            res = await fetch(`/api/settings/${action}`, { method: "POST" });
        }
        const data = await res.json();
        
        if (!res.ok) {
            contentDiv.innerHTML += `<p class="text-red-500">❌ Server execution failed: ${data.error || "Unknown error"}</p>`;
            return;
        }
        
        setTimeout(() => {
            contentDiv.innerHTML += `<p class="text-slate-300">&gt; Connecting to remote container process...</p>`;
            contentDiv.innerHTML += `<p class="text-slate-300">&gt; Command status: 200 OK</p>`;
            
            if (action === "storage-usage") {
                contentDiv.innerHTML += `<p class="text-indigo-300 font-bold mt-2">Container Storage Statistics:</p>`;
                contentDiv.innerHTML += `<p class="text-slate-400">· Max Allocation Limit: ${data.total_allocated}</p>`;
                contentDiv.innerHTML += `<p class="text-slate-400">· Used Space: ${data.used_space}</p>`;
                contentDiv.innerHTML += `<p class="text-slate-400">· Free Space: ${data.free_space}</p>`;
                contentDiv.innerHTML += `<p class="text-slate-400">· Database File Size: ${data.database_file}</p>`;
                contentDiv.innerHTML += `<p class="text-slate-400">· File Upload Assets: ${data.media_uploads}</p>`;
                contentDiv.innerHTML += `<p class="text-slate-400">· System Logs & Cache: ${data.logs_and_temporary}</p>`;
            } else if (action === "clear-cache") {
                contentDiv.innerHTML += `<p class="text-emerald-300 font-bold mt-2">Cache Purge Status:</p>`;
                contentDiv.innerHTML += `<p class="text-slate-400">· Cleared Size: ${data.stats.freed}</p>`;
                contentDiv.innerHTML += `<p class="text-slate-400">· Targeted: ${data.stats.cache_modules.join(', ')}</p>`;
            } else if (action === "optimize-db") {
                contentDiv.innerHTML += `<p class="text-emerald-300 font-bold mt-2">DB Index Optimization Status:</p>`;
                contentDiv.innerHTML += `<p class="text-slate-400">· Tables Defragmented: ${data.stats.tables_processed}</p>`;
                contentDiv.innerHTML += `<p class="text-slate-400">· Indexes Rebuilt: ${data.stats.indexes_rebuilt}</p>`;
                contentDiv.innerHTML += `<p class="text-slate-400">· Space Saved: ${data.stats.saved_space}</p>`;
                contentDiv.innerHTML += `<p class="text-slate-400">· Integrity Scan: ${data.stats.integrity_check}</p>`;
            } else if (action === "rebuild-index") {
                contentDiv.innerHTML += `<p class="text-emerald-300 font-bold mt-2">Hybrid Search Indexing Status:</p>`;
                contentDiv.innerHTML += `<p class="text-slate-400">· Indexed Items: ${data.stats.indexed_products} products, ${data.stats.indexed_categories} categories</p>`;
                contentDiv.innerHTML += `<p class="text-slate-400">· Engine Algorithm: ${data.stats.index_engine}</p>`;
                contentDiv.innerHTML += `<p class="text-slate-400">· Compilation Speed: ${data.stats.duration_ms}ms</p>`;
            }
            
            contentDiv.innerHTML += `<p class="text-emerald-400 font-bold mt-3">✓ Success: ${data.message}</p>`;
            showToast(data.message, "success");
        }, 600);
        
    } catch (err) {
        contentDiv.innerHTML += `<p class="text-red-500">❌ Error: Server context timed out during execution</p>`;
    }
};

function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-xl text-white font-medium z-50 transition-opacity duration-300 ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
