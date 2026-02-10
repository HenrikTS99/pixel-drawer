let pixelContainer;
let selectedColor = 'red';
let mouseDown = false;

// top bar
let colorInput;
let rowsInput;
let columnsInput;
let rowsValue;
let columnsValue;


document.addEventListener('DOMContentLoaded', () => {
  pixelContainer = document.getElementById("pixel-container");
  colorInput = document.getElementById('color-picker');
  rowsInput = document.getElementById('rows');
  columnsInput = document.getElementById('columns');
  rowsValue = document.getElementById('rows-value');
  columnsValue = document.getElementById('columns-value');
  createEventListeners()
  generatePixelGrid(rowsInput.value, columnsInput.value);
}
)

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
}

function handleSlider(e) {
  if (e.target === columnsInput) {
    columnsValue.innerHTML = e.target.value;
  } else if (e.target === rowsInput) {
    rowsValue.innerHTML = e.target.value;
  };
  generatePixelGrid(rowsInput.value, columnsInput.value);
}

function handlePaint(e) {
  if (!mouseDown) return;
  if (!e.target.classList.contains("pixel-box")) return;
  if (e.buttons === 2) {
    e.target.style.backgroundColor = '';
  } else {
    e.target.style.backgroundColor = selectedColor;
  }
}

function generatePixelGrid(rows, columns) {
  // remove previous cells
  pixelContainer.replaceChildren();

  for (let i = 0; i < rows; i++) {
    const row = document.createElement("div");
    row.className = "row";
    pixelContainer.append(row);

    for (let j = 0; j < columns; j++) {
      const pixelBox = document.createElement("div");
      pixelBox.className = "pixel-box";

      row.append(pixelBox);
    }
  }
}
