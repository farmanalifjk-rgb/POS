/**
 * ReceiptPrinter.js
 * Handles Web Serial connection and data writing for the ESC/POS printer.
 */
import { hardwareManager } from './HardwareManager.js';
import { PrinterQueue } from './PrinterQueue.js';
import { EscPosBuilder } from './EscPosBuilder.js';

export class ReceiptPrinter {
  constructor() {
    this.port = null;
    this.writer = null;
    this.queue = new PrinterQueue(this);
    
    // Default settings that can be updated via UI
    this.settings = {
      paperWidth: 80,
      autoCut: true,
      openDrawer: true,
      copies: 1
    };
  }

  async connect(portOverride = null) {
    if (!hardwareManager.isWebSerialSupported()) return false;

    try {
      hardwareManager.setStatus('printer', 'Connecting');
      
      this.port = portOverride || await navigator.serial.requestPort();
      
      // Standard ESC/POS printers use 9600 or 115200 baud
      await this.port.open({ baudRate: 9600 });
      this.writer = this.port.writable.getWriter();
      
      const info = this.port.getInfo();
      const id = `${info.usbVendorId}-${info.usbProductId}`;
      localStorage.setItem('hw_printer_id', id);

      hardwareManager.setStatus('printer', 'Connected');
      
      // Setup disconnect listener for this specific port
      this.port.addEventListener('disconnect', () => {
        hardwareManager.setStatus('printer', 'Disconnected');
        this.port = null;
        if (this.writer) {
          this.writer.releaseLock();
          this.writer = null;
        }
      });
      
      // Process anything that was queued while offline
      this.queue.processQueue();
      return true;

    } catch (err) {
      hardwareManager.setStatus('printer', 'Error');
      hardwareManager.log('Printer', `Connection failed: ${err.message}`, 'error');
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
    hardwareManager.setStatus('printer', 'Disconnected');
  }

  /**
   * Internal method used by Queue to send raw bytes.
   */
  async sendDirect(bufferBytes) {
    if (!this.writer) throw new Error("Printer not connected");
    await this.writer.write(bufferBytes);
  }

  /**
   * Main entry point for printing ESC/POS byte buffers.
   * Hands off to the Queue which handles offline states safely.
   */
  print(bufferBytes) {
    this.queue.enqueue(bufferBytes);
  }

  // Quick diagnostic method
  async testPrint() {
    const builder = new EscPosBuilder();
    builder.init()
           .align('center')
           .bold(true).size(2, 2).text("PRINTER TEST").newline()
           .bold(false).size(1, 1).text("If you can read this, your Web Serial").newline()
           .text("connection is working perfectly!").newline().newline()
           .align('left').text("Date: " + new Date().toLocaleString()).newline()
           .text("Paper Config: " + this.settings.paperWidth + "mm").newline().newline()
           .align('center').text("--- END OF TEST ---").newline().newline().newline();
           
    if (this.settings.autoCut) {
      builder.cut();
    }
    
    this.print(builder.build());
  }
}

export const receiptPrinter = new ReceiptPrinter();
