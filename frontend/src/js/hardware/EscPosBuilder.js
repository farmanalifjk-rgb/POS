/**
 * EscPosBuilder.js
 * Generates ESC/POS byte buffers for Receipt Printers, Cash Drawers, and Customer Displays.
 */
export class EscPosBuilder {
  constructor() {
    this.buffer = [];
    this.encoder = new TextEncoder();
  }

  // --- Core ---
  init() {
    this.buffer.push(0x1b, 0x40); // ESC @
    return this;
  }

  text(str) {
    const bytes = this.encoder.encode(str);
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]);
    }
    return this;
  }

  newline() {
    this.buffer.push(0x0a); // LF
    return this;
  }

  // --- Formatting ---
  bold(on = true) {
    this.buffer.push(0x1b, 0x45, on ? 1 : 0); // ESC E n
    return this;
  }

  align(alignment) {
    let n = 0; // Left
    if (alignment === "center") n = 1;
    if (alignment === "right") n = 2;
    this.buffer.push(0x1b, 0x61, n); // ESC a n
    return this;
  }

  size(widthMultiplier, heightMultiplier) {
    // GS ! n (where n is a bitwise combination of width and height 0-7)
    // 0x00 is normal size (1x1). 0x11 is double width, double height.
    let w = (widthMultiplier - 1) & 0x07;
    let h = (heightMultiplier - 1) & 0x07;
    let n = (w << 4) | h;
    this.buffer.push(0x1d, 0x21, n);
    return this;
  }

  // --- Actions ---
  cut(partial = false) {
    this.buffer.push(0x1d, 0x56, partial ? 1 : 0); // GS V m
    return this;
  }

  kickDrawer(pin = 2, t1 = 25, t2 = 250) {
    // ESC p m t1 t2
    const m = pin === 5 ? 1 : 0;
    this.buffer.push(0x1b, 0x70, m, t1, t2);
    return this;
  }

  // --- Customer Display (VFD) ---
  vfdClear() {
    this.buffer.push(0x0c); // CLR
    return this;
  }

  vfdCursor(x, y) {
    // ESC l x y (depends on model, typically EPSON DM-D uses US $ x y or similar)
    // For standard generic displays: 
    this.buffer.push(0x1f, 0x24, x, y);
    return this;
  }

  // --- Output ---
  build() {
    const result = new Uint8Array(this.buffer);
    this.buffer = []; // Reset after build
    return result;
  }
}
