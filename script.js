
const PixelDrawer = {
  state: {
    selectedColor: 'ff0000',
    mouseDown: false,
    rows: 16,
    columns: 16,
    pixelSize: 10,
    brushSize: 1,
    pixels: [],
  },
  elements: {
    pixelContainer: null,
    colorInput: null,

    rowsInput: null,
    rowsValue: null,
    columnsInput: null,
    columnsValue: null,

    pixelSizeInput: null,
    pixelSizeValue: null,
    pixelBorderToggle: null,

    brushSizeInput: null,
    brushSizeValue: null,

    resetButton: null,
  },

  init() {
    // Get DOM elements and store them
    this.elements.pixelContainer = document.getElementById("pixel-container");

    this.elements.colorInput = document.getElementById('color-picker');

    this.elements.rowsInput = document.getElementById('rows');
    this.elements.rowsValue = document.getElementById('rows-value');

    this.elements.columnsInput = document.getElementById('columns');
    this.elements.columnsValue = document.getElementById('columns-value');

    this.elements.pixelSizeInput = document.getElementById('pixel-size');
    this.elements.pixelSizeValue = document.getElementById('pixel-size-value');

    this.elements.brushSizeInput = document.getElementById('brush-size');
    this.elements.brushSizeValue = document.getElementById('brush-size-value');

    this.elements.pixelBorderToggle = document.getElementById('pixel-border-toggle');
    this.elements.resetButton = document.getElementById('reset-button');

    // Set initial display values
    this.elements.rowsValue.innerHTML = this.elements.rowsInput.value;
    this.elements.columnsValue.innerHTML = this.elements.columnsInput.value;
    this.elements.pixelSizeValue.innerHTML = this.state.pixelSize;

    // Initialize state based on DOM values
    this.state.rows = Number(this.elements.rowsInput.value)
    this.state.columns = Number(this.elements.columnsInput.value)
    this.state.pixelSize = Number(this.elements.pixelSizeInput.value);
    this.state.brushSize = Number(this.elements.brushSizeInput.value);
    this.state.selectedColor = this.elements.colorInput.value;

    this.createEventListeners();
    this.createPixelArray();
    this.generatePixelGrid();
  },

  createEventListeners() {
    document.addEventListener('mouseup', () => this.state.mouseDown = false);
    document.addEventListener('mousedown', () => this.state.mouseDown = true);

    this.elements.pixelContainer.addEventListener('mousedown', (e) => {
      this.state.mouseDown = true;
      this.handlePaint(e);
    });

    this.elements.pixelContainer.addEventListener('mousemove', (e) => this.handlePaint(e));
    this.elements.pixelContainer.addEventListener('contextmenu', e => e.preventDefault()); // prevent right-click menu

    // color picker
    this.elements.colorInput.addEventListener('input', (e) => {
      this.state.selectedColor = e.target.value;
    })

    // size sliders
    this.elements.rowsInput.oninput = (e) => this.handleSlider(e);
    this.elements.columnsInput.oninput = (e) => this.handleSlider(e);

    this.elements.pixelSizeInput.oninput = (e) => {
      this.changePixelsSize(e.target.value);
      this.elements.pixelSizeValue.innerHTML = e.target.value;
    }

    this.elements.brushSizeInput.oninput = (e) => {
      this.state.brushSize = parseInt(e.target.value);
      this.elements.brushSizeValue.innerHTML = this.state.brushSize;
    }
    // toggle pixel border
    this.elements.pixelBorderToggle.addEventListener('change', (e) => this.togglePixelBorders(e.target.checked));

    this.elements.resetButton.addEventListener('click', () => this.resetCanvas())
  },

  handleSlider(e) {
    let oldRows = this.state.rows;
    let oldColumns = this.state.columns;

    let inputValue = Number(e.target.value);
    if (e.target === this.elements.columnsInput) {
      this.elements.columnsValue.innerHTML = inputValue;
      this.state.columns = inputValue
    } else if (e.target === this.elements.rowsInput) {
      this.elements.rowsValue.innerHTML = inputValue;
      this.state.rows = inputValue;
    };
    this.updatePixelGrid(oldRows, oldColumns);
  },

  updatePixelGrid(oldRows, oldColumns) {
    let rowsDiff = this.state.rows - oldRows;
    let columnsDiff = this.state.columns - oldColumns;

    this.resizePixelArray(rowsDiff, columnsDiff);
    this.resizeDisplayGrid(rowsDiff, columnsDiff);
  },

  resizePixelArray(rowsDiff, columnsDiff) {
    const rowOffset = rowsDiff / 2;
    const columnOffset = columnsDiff / 2;
    const newPixelsArray = [];

    for (let r = 0; r < this.state.rows; r++) {
      let newRow = [];
      for (let c = 0; c < this.state.columns; c++) {
        // use of optional chaining, evaluates to undefined instead of error if not exists: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
        // Nullish coalescing operator (??): Returns right side when left side is undefined
        // Shift index by the new difference
        newRow[c] = this.state.pixels?.[r - rowOffset]?.[c - columnOffset] ?? ''
      }
      newPixelsArray.push(newRow);
    }
    this.state.pixels = newPixelsArray
  },

  resizeDisplayGrid(rowsDiff, columnsDiff) {
    this.updateRows(rowsDiff);
    this.updateColumns(columnsDiff);
    this.updatePixelDatasets();
  },

  updateRows(rowsDiff) {
    while (rowsDiff > 0) {
      let rowIndex = this.state.rows - 1;
      const row = document.createElement("div");
      row.className = "row";
      this.elements.pixelContainer.append(row);

      const firstRow = document.createElement("div");
      firstRow.className = 'row';
      this.elements.pixelContainer.prepend(firstRow);

      // add pixels to row
      for (let c = 0; c < this.state.columns; c++) {
        // First index is wrong, but will be updated in 'updatePixelDatasets'
        let lastPixelBox = this.createPixel(rowIndex, c, this.state.pixels[rowIndex][c]);
        row.append(lastPixelBox);
        let firstPixelBox = this.createPixel(0, c, this.state.pixels[0][c]);
        firstRow.append(firstPixelBox);
      }

      rowsDiff -= 2;
    }
    while (rowsDiff < 0) {
      this.elements.pixelContainer.lastChild.remove();
      this.elements.pixelContainer.firstChild.remove();
      rowsDiff += 2;
    }
  },

  updateColumns(columnsDiff) {
    const rowsDivs = Array.from(document.getElementsByClassName('row'));
    while (columnsDiff > 0) {
      let columnIndex = this.state.columns - 1;
      rowsDivs.forEach((row, index) => {
        // Second index is wrong, but will be updated in 'updatePixelDatasets'
        let lastPixelBox = this.createPixel(index, columnIndex, this.state.pixels[index][columnIndex]);
        let firstPixelBox = this.createPixel(index, columnsDiff, this.state.pixels[index][0]);
        row.append(lastPixelBox);
        row.prepend(firstPixelBox);
      });
      columnsDiff -= 2;
    }
    while (columnsDiff < 0) {
      rowsDivs.forEach(row => {
        row.lastChild.remove();
        row.firstChild.remove();
      });
      columnsDiff += 2;
    }
  },

  updatePixelDatasets() {
    // update row data 
    const rowsDivs = document.getElementsByClassName('row');
    for (let r = 0; r < rowsDivs.length; r++) {
      const pixels = rowsDivs[r].children;
      for (let c = 0; c < pixels.length; c++) {
        const pixel = pixels[c];
        if (pixel.dataset.row != r) pixel.dataset.row = r;
        if (pixel.dataset.col != c) pixel.dataset.col = c;
      }
    }
  },

  generatePixelGrid() {
    // Get current DOM pixel array size

    // remove previous cells
    this.elements.pixelContainer.replaceChildren();

    // create rows
    for (let r = 0; r < this.state.rows; r++) {
      const row = document.createElement("div");
      row.className = "row";
      this.elements.pixelContainer.append(row);

      // add pixels to row
      for (let c = 0; c < this.state.columns; c++) {
        let pixelBox = this.createPixel(r, c, this.state.pixels[r][c])
        row.append(pixelBox);
      }
    }
  },

  changePixelsSize(size) {
    const pixelDivs = Array.from(document.getElementsByClassName('pixel-box'));
    pixelDivs.forEach(pixel => {
      pixel.style.width = size + 'px';
      pixel.style.height = size + 'px';
    });
    this.state.pixelSize = size;
  },

  togglePixelBorders(show) {
    if (!this.elements.pixelContainer) return;
    if (show) {
      this.elements.pixelContainer.classList.remove('hide-borders')
    } else {
      this.elements.pixelContainer.classList.add('hide-borders');
    }
  },

  getPixelFromEvent(e) {
    let row = Number(e.target.dataset.row);
    let col = Number(e.target.dataset.col);
    return [row, col];
  },

  handlePaint(e) {
    if (!this.state.mouseDown) return;
    if (!e.target.classList.contains("pixel-box")) return;
    let [row, col] = this.getPixelFromEvent(e)
    let erase = (e.buttons === 2) ? true : false;
    this.paint(row, col, erase);
  },

  paint(row, col, erase) {
    // handle paint brush size
    let offset = Math.floor((this.state.brushSize - 1) / 2);

    // loop trough rows, with offset from paintbrush
    for (let r = row - offset; r < row - offset + this.state.brushSize; r++) {
      if (r >= this.state.rows || r < 0) continue; // out of bounds

      // loop trough columns, with offset from paintbrush
      for (let c = col - offset; c < col - offset + this.state.brushSize; c++) {
        if (c >= this.state.columns || c < 0) continue; // out of bounds

        if (erase) {
          this.state.pixels[r][c] = '';
        } else {
          this.state.pixels[r][c] = this.state.selectedColor;
        }
        this.renderPixel(r, c)
      }
    }
  },

  renderPixel(row, col) {
    let pixelDiv = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!pixelDiv) console.log("PIXEL NOT FOUND")
    pixelDiv.style.backgroundColor = this.state.pixels[row][col]
  },

  createPixelArray() {
    for (let r = 0; r < this.state.rows; r++) {
      this.state.pixels[r] = [];
      for (let c = 0; c < this.state.columns; c++) {
        this.state.pixels[r][c] = '';
      }
    }
  },

  resetPixelsColors() {
    this.state.pixels.forEach(row => {
      row.fill('');
    });
  },

  resetCanvas() {
    this.resetPixelsColors();
    this.redrawCanvas();
  },

  redrawCanvas() {
    for (r = 0; r < this.state.rows; r++) {
      const rowsDivs = Array.from(document.getElementsByClassName('row'));
      const rowPixels = rowsDivs[r].children;
      for (c = 0; c < this.state.columns; c++) {
        rowPixels[c].style.backgroundColor = this.state.pixels[r][c]
      }
    }
  },

  createPixel(row, col, color) {
    const pixelBox = document.createElement("div");
    pixelBox.className = "pixel-box";
    pixelBox.style.width = this.state.pixelSize + 'px';
    pixelBox.style.height = this.state.pixelSize + 'px';
    pixelBox.dataset.row = row;
    pixelBox.dataset.col = col;
    pixelBox.style.backgroundColor = color;
    return pixelBox;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  PixelDrawer.init();
});
