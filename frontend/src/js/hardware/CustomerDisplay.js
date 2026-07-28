/**
 * CustomerDisplay.js
 * Interfaces with VFD Pole Displays via Web Serial.
 */
import { hardwareManager } from './HardwareManager.js';
import { EscPosBuilder } from './EscPosBuilder.js';

export class CustomerDisplay {
  constructor() {
    this.port = null;
    this.writer = null;
    
    this.settings = {
      columns: 20,
      rows: 2,
      welcomeMessage: "Welcome to POS!     \n                    "
    };
  }

  async connect(portOverride = null) {
    if (!hardwareManager.isWebSerialSupported()) return false;

    try {
      hardwareManager.setStatus('display', 'Connecting');
      
      this.port = portOverride || await navigator.serial.requestPort();
      await this.port.open({ baudRate: 9600 });
      this.writer = this.port.writable.getWriter();
      
      const info = this.port.getInfo();
      localStorage.setItem('hw_display_id', `${info.usbVendorId}-${info.usbProductId}`);

      hardwareManager.setStatus('display', 'Connected');
      
      this.port.addEventListener('disconnect', () => {
        hardwareManager.setStatus('display', 'Disconnected');
        this.port = null;
        if (this.writer) {
          this.writer.releaseLock();
          this.writer = null;
        }
      });
      
      this.showWelcome();
      return true;

    } catch (err) {
      hardwareManager.setStatus('display', 'Error');
      hardwareManager.log('Customer Display', `Connection failed: ${err.message}`, 'error');
      return false;
    }
  }

  async disconnect() {
    if (this.writer) {
      this.writer.releaseLock();
      this.writer = null;
    }
    if (this.port) {
      await this.port.close();
      this.port = null;
    }
    hardwareManager.setStatus('display', 'Disconnected');
  }

  /**
   * Updates the display with two lines of text (padded to 20 chars each).
   */
  async updateDisplay(line1 = "", line2 = "") {
    if (!this.writer) return;

    try {
      const padLine = (str) => str.padEnd(this.settings.columns, " ").substring(0, this.settings.columns);
      
      const builder = new EscPosBuilder();
      builder.init()
             .vfdClear()
             .text(padLine(line1))
             .text(padLine(line2));
             
      await this.writer.write(builder.build());
    } catch (err) {
      hardwareManager.log('Customer Display', `Failed to write: ${err.message}`, 'error');
    }
  }

  showWelcome() {
    // Split welcome message into two lines
    const msg = this.settings.welcomeMessage.padEnd(40, " ");
    this.updateDisplay(msg.substring(0, 20), msg.substring(20, 40));
  }
  
  showCartUpdate(itemName, totalAmount) {
    this.updateDisplay(
      itemName.substring(0, 20),
      `Total: Rs ${totalAmount}`.padStart(20, " ")
    );
  }
  
  testDisplay() {
    this.updateDisplay("CUSTOMER DISPLAY    ", ">> SYSTEM ONLINE << ");
  }
}

export const customerDisplay = new CustomerDisplay();
