/**
 * PrinterQueue.js
 * Manages offline printing queues so receipts are not lost during disconnection.
 */
import { hardwareManager } from './HardwareManager.js';

export class PrinterQueue {
  constructor(printer) {
    this.printer = printer;
    this.queue = [];
    this.isProcessing = false;
  }

  enqueue(bufferBytes, metadata = {}) {
    this.queue.push({ bufferBytes, metadata, timestamp: new Date() });
    hardwareManager.log('Printer', `Added document to print queue. Queue size: ${this.queue.length}`);
    this.processQueue();
  }

  async processQueue() {
    if (this.isProcessing) return;
    if (this.queue.length === 0) return;
    
    // Check if printer is connected and not busy
    if (hardwareManager.getStatus('printer') !== 'Connected') {
      return; // Will process when reconnect happens
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      if (hardwareManager.getStatus('printer') !== 'Connected') {
        break; // Connection lost during processing
      }
      
      const job = this.queue[0];
      try {
        await this.printer.sendDirect(job.bufferBytes);
        this.queue.shift(); // Remove job after successful print
        hardwareManager.log('Printer', `Successfully printed document from queue.`);
      } catch (error) {
        hardwareManager.log('Printer', `Failed to print queued document: ${error.message}`, 'error');
        // Stop processing, keep in queue
        break; 
      }
    }

    this.isProcessing = false;
  }
}
