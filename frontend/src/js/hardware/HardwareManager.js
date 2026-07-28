/**
 * HardwareManager.js
 * Central hub for managing hardware states, logs, and auto-reconnection.
 */
export class HardwareManager {
  constructor() {
    this.status = {
      printer: 'Disconnected',
      scale: 'Disconnected',
      display: 'Disconnected',
    };
    
    this.logs = [];
    this.onStatusChange = null; // Callback for UI updates
  }

  log(device, message, level = 'info') {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logEntry = { timestamp, device, message, level };
    this.logs.unshift(logEntry); // Add to beginning
    if (this.logs.length > 100) this.logs.pop(); // Keep last 100
    
    console.log(`[Hardware] ${timestamp} | ${device} | ${message}`);
    
    // Auto-update UI if registered
    if (this.onStatusChange) {
      this.onStatusChange('log', logEntry);
    }
  }

  setStatus(device, status) {
    this.status[device] = status;
    this.log(device, `Status changed to: ${status}`);
    
    if (this.onStatusChange) {
      this.onStatusChange(device, status);
    }
  }

  getStatus(device) {
    return this.status[device];
  }

  /**
   * Browser check for Web Serial API.
   */
  isWebSerialSupported() {
    return 'serial' in navigator;
  }

  /**
   * Auto-reconnect previously authorized devices.
   */
  async autoReconnect(printerInstance, scaleInstance, displayInstance) {
    if (!this.isWebSerialSupported()) {
      this.log('System', 'Web Serial API is not supported in this browser.', 'error');
      return;
    }

    try {
      // Get all ports the user has previously granted access to
      const ports = await navigator.serial.getPorts();
      
      // In a real scenario, we would match saved vendorId/productId from localStorage
      // to identify which port belongs to which device.
      // For this implementation, we attempt to reconnect known configs if they exist.
      const savedPrinterId = localStorage.getItem('hw_printer_id');
      const savedScaleId = localStorage.getItem('hw_scale_id');
      const savedDisplayId = localStorage.getItem('hw_display_id');

      for (const port of ports) {
        const info = port.getInfo();
        const id = `${info.usbVendorId}-${info.usbProductId}`;
        
        if (id === savedPrinterId && printerInstance) {
          await printerInstance.connect(port);
        } else if (id === savedScaleId && scaleInstance) {
          await scaleInstance.connect(port);
        } else if (id === savedDisplayId && displayInstance) {
          await displayInstance.connect(port);
        }
      }
    } catch (error) {
      this.log('System', `Auto-reconnect failed: ${error.message}`, 'error');
    }
  }
}

// Global Singleton
export const hardwareManager = new HardwareManager();
