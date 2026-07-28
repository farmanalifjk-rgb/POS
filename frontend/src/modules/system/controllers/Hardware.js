import { hardwareManager } from '../../../js/hardware/HardwareManager.js';
import { receiptPrinter } from '../../../js/hardware/ReceiptPrinter.js';
import { cashDrawer } from '../../../js/hardware/CashDrawer.js';
import { customerDisplay } from '../../../js/hardware/CustomerDisplay.js';
import { weighingScale } from '../../../js/hardware/WeighingScale.js';

window.initializeHardware = function() {
  // Bind UI buttons
  window.hwConnectPrinter = async () => await receiptPrinter.connect();
  window.hwConnectDisplay = async () => await customerDisplay.connect();
  window.hwConnectScale   = async () => await weighingScale.connect();

  window.hwTestPrint      = async () => await receiptPrinter.testPrint();
  window.hwTestDrawer     = () => cashDrawer.open();
  window.hwTestDisplay    = () => customerDisplay.testDisplay();

  window.hwUpdateSettings = () => {
    receiptPrinter.settings.paperWidth = parseInt(document.getElementById('hw-set-paper').value);
    receiptPrinter.settings.copies = parseInt(document.getElementById('hw-set-copies').value);
    receiptPrinter.settings.autoCut = document.getElementById('hw-set-autocut').checked;
    receiptPrinter.settings.openDrawer = document.getElementById('hw-set-drawer').checked;
    
    customerDisplay.settings.welcomeMessage = document.getElementById('hw-set-welcome').value;
    weighingScale.settings.decimalPlaces = parseInt(document.getElementById('hw-set-scale-dec').value);
    
    hardwareManager.log('System', 'Settings updated');
  };

  // Listen to status changes to update UI
  hardwareManager.onStatusChange = (type, data) => {
    if (type === 'log') {
      appendLog(data);
    } else {
      updateStatusUI(type, data);
    }
  };
  
  // Connect scale UI
  weighingScale.onWeightUpdate = (weightStr) => {
    const el = document.getElementById('hw-scale-live');
    if (el) el.innerText = `${weightStr} kg`;
  };

  // Initial sync
  updateStatusUI('printer', hardwareManager.getStatus('printer'));
  updateStatusUI('scale', hardwareManager.getStatus('scale'));
  updateStatusUI('display', hardwareManager.getStatus('display'));
  
  // Populate logs
  const logContainer = document.getElementById('hw-log-container');
  if (logContainer) {
    logContainer.innerHTML = '';
    [...hardwareManager.logs].reverse().forEach(appendLog);
  }

  // Pre-fill settings
  document.getElementById('hw-set-paper').value = receiptPrinter.settings.paperWidth;
  document.getElementById('hw-set-copies').value = receiptPrinter.settings.copies;
  document.getElementById('hw-set-autocut').checked = receiptPrinter.settings.autoCut;
  document.getElementById('hw-set-drawer').checked = receiptPrinter.settings.openDrawer;
  document.getElementById('hw-set-welcome').value = customerDisplay.settings.welcomeMessage;
  document.getElementById('hw-set-scale-dec').value = weighingScale.settings.decimalPlaces;

  // Auto reconnect known devices
  if (!window.hwDidAutoConnect) {
    hardwareManager.autoReconnect(receiptPrinter, weighingScale, customerDisplay);
    window.hwDidAutoConnect = true;
  }
};

function updateStatusUI(device, status) {
  const textEl = document.getElementById(`hw-status-${device}-text`);
  const pingEl = document.getElementById(`hw-status-${device}-ping`);
  const dotEl  = document.getElementById(`hw-status-${device}-dot`);
  
  if (!textEl || !pingEl || !dotEl) return;
  
  textEl.innerText = status;
  
  if (status === 'Connected') {
    textEl.className = "text-sm font-semibold text-emerald-600";
    pingEl.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75";
    dotEl.className  = "relative inline-flex rounded-full h-3 w-3 bg-emerald-500";
  } else if (status === 'Error') {
    textEl.className = "text-sm font-semibold text-red-600";
    pingEl.className = "hidden";
    dotEl.className  = "relative inline-flex rounded-full h-3 w-3 bg-red-500";
  } else if (status === 'Connecting') {
    textEl.className = "text-sm font-semibold text-amber-600";
    pingEl.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75";
    dotEl.className  = "relative inline-flex rounded-full h-3 w-3 bg-amber-500";
  } else {
    // Disconnected
    textEl.className = "text-sm font-semibold text-slate-600";
    pingEl.className = "hidden";
    dotEl.className  = "relative inline-flex rounded-full h-3 w-3 bg-slate-500";
  }
}

function appendLog(logEntry) {
  const container = document.getElementById('hw-log-container');
  if (!container) return;
  
  const div = document.createElement('div');
  
  let color = 'text-slate-300';
  if (logEntry.level === 'error') color = 'text-red-400';
  
  div.innerHTML = `<span class="text-slate-500">[${logEntry.timestamp}]</span> <span class="text-indigo-300">${logEntry.device}:</span> <span class="${color}">${logEntry.message}</span>`;
  
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}
