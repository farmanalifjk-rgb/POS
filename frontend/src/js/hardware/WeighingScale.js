/**
 * WeighingScale.js
 * Connects to a serial scale and parses weight stream continuously.
 */
import { hardwareManager } from './HardwareManager.js';

export class WeighingScale {
  constructor() {
    this.port = null;
    this.reader = null;
    this.currentWeight = 0;
    this.onWeightUpdate = null; // Callback for UI
    
    this.settings = {
      decimalPlaces: 3,
      unit: 'kg'
    };
  }

  async connect(portOverride = null) {
    if (!hardwareManager.isWebSerialSupported()) return false;

    try {
      hardwareManager.setStatus('scale', 'Connecting');
      
      this.port = portOverride || await navigator.serial.requestPort();
      // Scales usually operate at 9600 baud, 8 data bits, no parity, 1 stop bit
      await this.port.open({ baudRate: 9600 });
      
      const info = this.port.getInfo();
      localStorage.setItem('hw_scale_id', `${info.usbVendorId}-${info.usbProductId}`);

      hardwareManager.setStatus('scale', 'Connected');
      
      this.port.addEventListener('disconnect', () => {
        hardwareManager.setStatus('scale', 'Disconnected');
        this.disconnect();
      });
      
      // Start continuous read loop
      this.readStream();
      return true;

    } catch (err) {
      hardwareManager.setStatus('scale', 'Error');
      hardwareManager.log('Scale', `Connection failed: ${err.message}`, 'error');
      return false;
    }
  }

  async disconnect() {
    if (this.reader) {
      await this.reader.cancel();
      this.reader = null;
    }
    if (this.port) {
      await this.port.close();
      this.port = null;
    }
    hardwareManager.setStatus('scale', 'Disconnected');
  }

  /**
   * Reads data from the scale continuously.
   * Parses typical NCI/CAS protocols which send `[STX] 1.235 [ETX]` or just continuous numeric strings.
   */
  async readStream() {
    if (!this.port) return;

    this.reader = this.port.readable.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Split by typical line endings or ETX bytes
        if (buffer.includes('\n') || buffer.includes('\x03') || buffer.includes('\r')) {
          this.parseWeightBuffer(buffer);
          buffer = ""; // Clear after parsing
        }
      }
    } catch (error) {
      hardwareManager.log('Scale', `Read error: ${error.message}`, 'error');
    } finally {
      this.reader.releaseLock();
    }
  }

  parseWeightBuffer(dataStr) {
    // Extract anything that looks like a decimal number
    const match = dataStr.match(/(\d+\.\d+)/);
    if (match) {
      const parsed = parseFloat(match[1]);
      if (!isNaN(parsed) && this.currentWeight !== parsed) {
        this.currentWeight = parsed;
        if (this.onWeightUpdate) {
          this.onWeightUpdate(parsed.toFixed(this.settings.decimalPlaces));
        }
      }
    }
  }
}

export const weighingScale = new WeighingScale();
