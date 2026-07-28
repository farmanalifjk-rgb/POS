/**
 * CashDrawer.js
 * Controls the cash drawer via the receipt printer's kick port.
 */
import { hardwareManager } from './HardwareManager.js';
import { receiptPrinter } from './ReceiptPrinter.js';
import { EscPosBuilder } from './EscPosBuilder.js';

export class CashDrawer {
  constructor() {
    this.printer = receiptPrinter;
  }

  /**
   * Status is derived from the printer since the drawer connects through it.
   */
  getStatus() {
    return hardwareManager.getStatus('printer');
  }

  open() {
    if (this.getStatus() !== 'Connected') {
      hardwareManager.log('Cash Drawer', 'Cannot open drawer: Printer disconnected', 'error');
      return;
    }

    try {
      hardwareManager.log('Cash Drawer', 'Opening cash drawer...');
      
      const builder = new EscPosBuilder();
      // Send pulse to pin 2 (and 5 just in case depending on printer config)
      builder.kickDrawer(2).kickDrawer(5); 
      
      // We bypass the queue for drawer kicks so they happen instantly
      // even if receipts are queued up (or we can just put it in queue)
      this.printer.sendDirect(builder.build());
      
    } catch (error) {
      hardwareManager.log('Cash Drawer', `Failed to open: ${error.message}`, 'error');
    }
  }
}

export const cashDrawer = new CashDrawer();
