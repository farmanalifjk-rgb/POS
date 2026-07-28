/**
 * BarcodeScanner.js
 * Captures HID keyboard emulator barcode scans globally.
 */
import { hardwareManager } from './HardwareManager.js';

export class BarcodeScanner {
  constructor() {
    this.buffer = '';
    this.lastKeystrokeTime = 0;
    this.onScan = null; // Callback for UI
    
    // Most barcode scanners send characters very fast (e.g., <30ms per char)
    this.maxKeystrokeDelay = 50; 
    
    this.initListener();
  }

  initListener() {
    document.addEventListener('keydown', (e) => {
      // Ignore if user is explicitly typing into an input field, UNLESS we want global override
      // But standard enterprise POS usually listens globally and prevents default if it's a barcode
      
      const currentTime = Date.now();
      
      // If it's been too long since the last key, it's probably human typing. Reset buffer.
      if (currentTime - this.lastKeystrokeTime > this.maxKeystrokeDelay) {
        this.buffer = '';
      }
      
      this.lastKeystrokeTime = currentTime;

      if (e.key === 'Enter') {
        if (this.buffer.length > 3) {
          // It's a barcode scan!
          e.preventDefault(); 
          
          const scannedCode = this.buffer;
          hardwareManager.log('Scanner', `Scanned barcode: ${scannedCode}`);
          
          if (this.onScan) {
            this.onScan(scannedCode);
          }
          
          this.buffer = ''; // Reset
        }
      } else {
        // Only accept printable characters (length 1)
        if (e.key.length === 1) {
          this.buffer += e.key;
        }
      }
    });
  }
}

export const barcodeScanner = new BarcodeScanner();
