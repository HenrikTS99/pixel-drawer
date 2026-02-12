
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
    brushSize: null,
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
    let inputValue = Number(e.target.value);
    if (e.target === this.elements.columnsInput) {
      this.elements.columnsValue.innerHTML = inputValue;
      this.state.columns = inputValue
    } else if (e.target === this.elements.rowsInput) {
      this.elements.rowsValue.innerHTML = inputValue;
      this.state.rows = inputValue;
    };
    this.updatePixelGrid();
  },

  // always minimum 2 to remove or add if any. Therefore can add or remove from both sides the same amount.
  updatePixelGrid() {

    let currRows = document.querySelectorAll('.row').length;
    let currColumns = this.elements.pixelContainer.firstChild.children.length;
    // the amounts to add or remove
    let rowsDifference = this.state.rows - currRows;
    let columnsDifference = this.state.columns - currColumns;
    this.updateRows(rowsDifference);
    this.updateColumns(columnsDifference)
    // update pixels array to represent the new pixel grid
    // TODO: pixel array should be source of truth?
    this.updatePixelsArray();
  },

  updateRows(rowsDifference) {
    // add 1 row to top and bottom, and fill the colums with the necessary pixels
    while (rowsDifference > 0) {
      const row = document.createElement("div");
      row.className = "row";

      // add pixels to row
      let pixelBox = this.createPixel();
      for (let i = 0; i < this.state.columns; i++) {
        row.append(pixelBox.cloneNode());
      }

      this.elements.pixelContainer.append(row);
      this.elements.pixelContainer.prepend(row.cloneNode(true)); // deep clone row
      rowsDifference -= 2;
    }

    // remove 1 row top and bottom, until no more to remove
    while (rowsDifference < 0) {
      this.elements.pixelContainer.lastChild.remove();
      this.elements.pixelContainer.firstChild.remove();
      rowsDifference += 2;
    }
  },

  updateColumns(columnsDifference) {
    const rowsDivs = Array.from(document.getElementsByClassName('row'));
    let pixelBox = this.createPixel();
    // add 1 pixel on each side until no more columns to add
    while (columnsDifference > 0) {
      rowsDivs.forEach(row => {
        row.append(pixelBox.cloneNode());
        row.prepend(pixelBox.cloneNode());
      });
      columnsDifference -= 2;
    }
    // remove 1 pixel on each side until no more columns to remove
    while (columnsDifference < 0) {
      rowsDivs.forEach(row => {
        row.lastChild.remove();
        row.firstChild.remove();
      });
      columnsDifference += 2;
    }
  },

  // due to shifting of pixel grid, pixels array has to be updated to represent the new pixel grid
  updatePixelsArray() {
    const rowsDivs = Array.from(document.getElementsByClassName('row'));

    // create new array and fill it with current pixels
    let newPixels = [];
    for (let r = 0; r < rowsDivs.length; r++) {
      newPixels[r] = [];
      const columnPixels = Array.from(rowsDivs[r].children);
      for (let c = 0; c < columnPixels.length; c++) {
        let pixel = columnPixels[c];
        // update pixel coordinate data
        pixel.dataset.row = r;
        pixel.dataset.col = c;
        newPixels[r][c] = pixel;
      }
    }
    this.state.pixels = newPixels;
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
    let rowsDivs = Array.from(document.getElementsByClassName('row'));

    // handle paint brush size
    let offset = Math.floor((this.state.brushSize - 1) / 2);

    // loop trough rows, with offset from paintbrush
    for (let r = row - offset; r < row - offset + this.state.brushSize; r++) {
      if (r >= this.state.rows || r < 0) continue; // out of bounds
      let columnPixels = Array.from(rowsDivs[r].children);

      // loop trough columns, with offset from paintbrush
      for (let c = col - offset; c < col - offset + this.state.brushSize; c++) {
        if (c >= this.state.columns || c < 0) continue; // out of bounds

        let pixel = columnPixels[c];
        // color or erase
        if (erase) {
          pixel.style.backgroundColor = '';
        } else {
          pixel.style.backgroundColor = this.state.selectedColor;
        }
      }
    }
  },

  generatePixelGrid() {
    // remove previous cells
    this.elements.pixelContainer.replaceChildren();

    // create rows
    for (let r = 0; r < this.state.rows; r++) {
      this.state.pixels[r] = []
      const row = document.createElement("div");
      row.className = "row";
      this.elements.pixelContainer.append(row);

      // add pixels to row
      let pixelBox = this.createPixel();
      for (let c = 0; c < this.state.columns; c++) {
        let pixel = pixelBox.cloneNode();
        // add coordinate data to each pixels
        pixel.dataset.row = r;
        pixel.dataset.col = c;
        row.append(pixel);

        this.state.pixels[r][c] = pixelBox;
      }
    }
  },

  // TODO: only update pixels with a color? have a list of painted pixels?
  resetCanvas() {
    const pixels = Array.from(document.getElementsByClassName('pixel-box'))
    pixels.forEach(pixel => {
      pixel.style.backgroundColor = "";
    });
  },

  // TODO: also add pixel coordinate datasets here?
  createPixel() {
    const pixelBox = document.createElement("div");
    pixelBox.className = "pixel-box";
    pixelBox.style.width = this.state.pixelSize + 'px';
    pixelBox.style.height = this.state.pixelSize + 'px';
    return pixelBox;
  }

};

document.addEventListener('DOMContentLoaded', () => {
  PixelDrawer.init();
});





