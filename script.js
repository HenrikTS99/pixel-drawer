let pixelContainer;
let selectedColor = '#ff0000';
let mouseDown = false;
let currRows;
let currColumns;
let currPixelSize;

// 2d array of pixels
let pixels = [];

// top bar
let colorInput;
let rowsInput;
let columnsInput;
let rowsValue;
let columnsValue;
let pixelSizeInput;
let pixelSizeValue;
let pixelBorderToggle;

let brushSizeInput;
let brushSize
let brushSizeValue;

document.addEventListener('DOMContentLoaded', () => {
  pixelContainer = document.getElementById("pixel-container");

  colorInput = document.getElementById('color-picker');
  colorInput.value = selectedColor;

  rowsInput = document.getElementById('rows');
  rowsValue = document.getElementById('rows-value');
  rowsValue.innerHTML = rowsInput.value;

  columnsInput = document.getElementById('columns');
  columnsValue = document.getElementById('columns-value');
  columnsValue.innerHTML = columnsInput.value;

  pixelSizeInput = document.getElementById('pixel-size');
  currPixelSize = pixelSizeInput.value;
  pixelSizeValue = document.getElementById('pixel-size-value');
  pixelSizeValue.innerHTML = currPixelSize;

  brushSizeInput = document.getElementById('brush-size');
  brushSize = parseInt(brushSizeInput.value);
  brushSizeValue = document.getElementById('brush-size-value');

  pixelBorderToggle = document.getElementById('pixel-border-toggle');

  createEventListeners();
  generatePixelGrid(Number(rowsInput.value), Number(columnsInput.value));
});

function createEventListeners() {
  document.addEventListener('mouseup', () => mouseDown = false);
  document.addEventListener('mousedown', () => mouseDown = true);

  pixelContainer.addEventListener('mousedown', (e) => {
    mouseDown = true;
    handlePaint(e);
  });

  pixelContainer.addEventListener('mousemove', handlePaint);
  pixelContainer.addEventListener('contextmenu', e => e.preventDefault()); // prevent right-click menu

  // color picker
  colorInput.addEventListener('input', (e) => {
    selectedColor = e.target.value;
  })

  // size sliders
  rowsInput.oninput = handleSlider;
  columnsInput.oninput = handleSlider;

  pixelSizeInput.oninput = (e) => {
    changePixelsSize(e.target.value);
    pixelSizeValue.innerHTML = e.target.value;
  }

  brushSizeInput.oninput = (e) => {
    brushSize = parseInt(e.target.value);
    brushSizeValue.innerHTML = brushSize;
  }
  // toggle pixel border
  pixelBorderToggle.addEventListener('change', (e) => togglePixelBorders(e.target.checked));

}

function handleSlider(e) {
  if (e.target === columnsInput) {
    columnsValue.innerHTML = e.target.value;
  } else if (e.target === rowsInput) {
    rowsValue.innerHTML = e.target.value;
  };
  updatePixelGrid(rowsInput.value, columnsInput.value);
}

function changePixelsSize(size) {
  const pixelDivs = Array.from(document.getElementsByClassName('pixel-box'));
  pixelDivs.forEach(pixel => {
    pixel.style.width = size + 'px';
    pixel.style.height = size + 'px';
  });
  currPixelSize = size;
}

function togglePixelBorders(show) {
  if (!pixelContainer) return;
  if (show) {
    pixelContainer.classList.remove('hide-borders')
  } else {
    pixelContainer.classList.add('hide-borders');
  }
}

function getPixelFromEvent(e) {
  let row = Number(e.target.dataset.row);
  let col = Number(e.target.dataset.col);
  return [row, col];
}


function handlePaint(e) {
  if (!mouseDown) return;
  if (!e.target.classList.contains("pixel-box")) return;
  let [row, col] = getPixelFromEvent(e)
  if (e.buttons === 2) {

  }
  let erase = (e.buttons === 2) ? true : false;
  paint(row, col, erase);
}

function paint(row, col, erase) {
  let rowsDivs = Array.from(document.getElementsByClassName('row'));

  // handle paint brush size
  let offset = Math.floor((brushSize - 1) / 2);

  // loop trough rows, with offset from paintbrush
  for (let r = row - offset; r < row - offset + brushSize; r++) {
    if (r >= currRows || r < 0) continue; // out of bounds
    let columnPixels = Array.from(rowsDivs[r].children);

    // loop trough columns, with offset from paintbrush
    for (let c = col - offset; c < col - offset + brushSize; c++) {
      if (c >= currColumns || c < 0) continue; // out of bounds

      let pixel = columnPixels[c];
      // color or erase
      if (erase) {
        pixel.style.backgroundColor = '';
      } else {
        pixel.style.backgroundColor = selectedColor;
      }
    }
  }
}

function generatePixelGrid(rows, columns) {
  // remove previous cells
  pixelContainer.replaceChildren();

  // create rows
  for (let r = 0; r < rows; r++) {
    pixels[r] = []
    const row = document.createElement("div");
    row.className = "row";
    pixelContainer.append(row);

    // add pixels to row
    let pixelBox = createPixel();
    for (let c = 0; c < columns; c++) {
      let pixel = pixelBox.cloneNode();
      // add coordinate data to each pixels
      pixel.dataset.row = r;
      pixel.dataset.col = c;
      row.append(pixel);

      pixels[r][c] = pixelBox;
    }
  }
  currRows = rows;
  currColumns = columns;
}

// TODO: only update pixels with a color? have a list of painted pixels?
function resetCanvas() {
  const pixels = Array.from(document.getElementsByClassName('pixel-box'))
  pixels.forEach(pixel => {
    pixel.style.backgroundColor = "";
  });
}

// always minimum 2 to remove or add if any. Therefore can add or remove from both sides the same amount.
function updatePixelGrid(newRows, newColumns) {
  // the amounts to add or remove
  let rowsDifference = newRows - currRows;
  let columnsDifference = newColumns - currColumns;

  updateRows(rowsDifference);
  currRows = newRows;
  updateColumns(columnsDifference)
  currColumns = newColumns;
  // update pixels array to represent the new pixel grid
  // TODO: pixel array should be source of truth?
  updatePixelsArray();
}

function updateRows(rowsDifference) {
  // add 1 row to top and bottom, and fill the colums with the necessary pixels
  while (rowsDifference > 0) {
    const row = document.createElement("div");
    row.className = "row";

    // add pixels to row
    let pixelBox = createPixel();
    for (let i = 0; i < currColumns; i++) {
      row.append(pixelBox.cloneNode());
    }

    pixelContainer.append(row);
    pixelContainer.prepend(row.cloneNode(true)); // deep clone row
    rowsDifference -= 2;
  }

  // remove 1 row top and bottom, until no more to remove
  while (rowsDifference < 0) {
    pixelContainer.lastChild.remove();
    pixelContainer.firstChild.remove();
    rowsDifference += 2;
  }
}

function updateColumns(columnsDifference) {
  const rowsDivs = Array.from(document.getElementsByClassName('row'));
  let pixelBox = createPixel();
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
}

// due to shifting of pixel grid, pixels array has to be updated to represent the new pixel grid
function updatePixelsArray() {
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
  pixels = newPixels;
}

// TODO: also add pixel coordinate datasets here?
function createPixel() {
  const pixelBox = document.createElement("div");
  pixelBox.className = "pixel-box";
  pixelBox.style.width = currPixelSize + 'px';
  pixelBox.style.height = currPixelSize + 'px';
  return pixelBox;
}
