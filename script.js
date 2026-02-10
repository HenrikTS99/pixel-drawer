let pixelContainer;
let selectedColor = '#ff0000';
let mouseDown = false;

// top bar
let colorInput;
let rowsInput;
let columnsInput;
let rowsValue;
let columnsValue;
let pixelSizeInput;
let pixelSizeValue;
let pixelBorderToggle;


document.addEventListener('DOMContentLoaded', () => {
  pixelContainer = document.getElementById("pixel-container");
  colorInput = document.getElementById('color-picker');
  colorInput.value = selectedColor;
  rowsInput = document.getElementById('rows');
  columnsInput = document.getElementById('columns');
  rowsValue = document.getElementById('rows-value');
  columnsValue = document.getElementById('columns-value');
  pixelSizeInput = document.getElementById('pixel-size');
  pixelSizeValue = document.getElementById('pixel-size-value');
  pixelBorderToggle = document.getElementById('pixel-border-toggle');
  createEventListeners();
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
  pixelSizeInput.oninput = (e) => {
    changePixelsSize(e.target.value);
    pixelSizeValue.innerHTML = e.target.value;
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
  generatePixelGrid(rowsInput.value, columnsInput.value);
}

function changePixelsSize(size) {
  const pixelDivs = Array.from(document.getElementsByClassName('pixel-box'));
  pixelDivs.forEach(pixel => {
    pixel.style.width = size + 'px';
    pixel.style.height = size + 'px';
  });
}

function togglePixelBorders(boolValue) {
  const pixelDivs = Array.from(document.getElementsByClassName('pixel-box'));
  console.log(boolValue);
  pixelDivs.forEach(pixel => {
    if (boolValue) {
      pixel.style.border = '1px solid rgba(0,0,0,0.1)';
    } else if (!boolValue) {
      pixel.style.border = 'none';
    }
  });
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
