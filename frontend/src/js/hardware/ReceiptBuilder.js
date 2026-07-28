/**
 * ReceiptBuilder.js
 * Translates application business objects (Orders, Carts) into ESC/POS bytes.
 */
import { EscPosBuilder } from './EscPosBuilder.js';
import { receiptPrinter } from './ReceiptPrinter.js';

export class ReceiptBuilder {
  constructor(company, order) {
    this.company = company;
    this.order = order;
    this.builder = new EscPosBuilder();
    // Receipt settings
    this.width = receiptPrinter.settings.paperWidth; // 80 or 58
    this.cols = this.width === 80 ? 48 : 32;
  }

  pad(left, right) {
    const spaceCount = this.cols - left.length - right.length;
    if (spaceCount <= 0) return left + " " + right;
    return left + " ".repeat(spaceCount) + right;
  }

  buildStandardReceipt() {
    this.builder.init();
    
    // Header
    this.builder.align('center')
                .bold(true).size(2, 2).text(this.company?.name || "ENTERPRISE POS").newline()
                .bold(false).size(1, 1).text(this.company?.address || "123 Main St, City").newline()
                .text(this.company?.phone || "Tel: 555-0199").newline()
                .newline();
                
    // Order Info
    this.builder.align('left')
                .text(`Order: ${this.order.id || "DRAFT"}`).newline()
                .text(`Date: ${new Date().toLocaleString()}`).newline()
                .text(`Cashier: ${this.order.cashier || "Admin"}`).newline()
                .text("-".repeat(this.cols)).newline();
                
    // Items
    let subtotal = 0;
    this.order.items.forEach(item => {
      const lineTotal = (item.price * item.quantity).toFixed(2);
      // Main line: Item name
      this.builder.text(item.name.substring(0, this.cols)).newline();
      
      // Sub line: Qty x Price          Total
      const sub = `  ${item.quantity} x Rs ${item.price.toFixed(2)}`;
      this.builder.text(this.pad(sub, `Rs ${lineTotal}`)).newline();
      subtotal += (item.price * item.quantity);
    });
    
    this.builder.text("-".repeat(this.cols)).newline();
    
    // Totals
    const tax = subtotal * 0.05; // 5% mock tax
    const total = subtotal + tax;
    
    this.builder.text(this.pad("Subtotal:", `Rs ${subtotal.toFixed(2)}`)).newline()
                .text(this.pad("Tax (5%):", `Rs ${tax.toFixed(2)}`)).newline()
                .bold(true).size(1,2).text(this.pad("TOTAL:", `Rs ${total.toFixed(2)}`)).newline()
                .bold(false).size(1,1)
                .text("-".repeat(this.cols)).newline();
                
    // Payment
    if (this.order.paymentAmount) {
      this.builder.text(this.pad(`Paid (${this.order.paymentMethod || 'Cash'}):`, `Rs ${this.order.paymentAmount.toFixed(2)}`)).newline();
      if (this.order.change > 0) {
        this.builder.text(this.pad("Change:", `Rs ${this.order.change.toFixed(2)}`)).newline();
      }
    }
    
    // Footer
    this.builder.newline()
                .align('center')
                .bold(true).text("THANK YOU FOR YOUR BUSINESS!").newline()
                .bold(false).text("Please retain receipt for returns").newline()
                .newline().newline().newline();
                
    if (receiptPrinter.settings.autoCut) {
      this.builder.cut();
    }
    
    if (receiptPrinter.settings.openDrawer) {
      this.builder.kickDrawer();
    }
    
    return this.builder.build();
  }
}
