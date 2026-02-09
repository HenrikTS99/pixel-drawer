let pixelContainer;
let selectedColor = 'red';
let mouseDown = false;


document.addEventListener('DOMContentLoaded', () => {
  pixelContainer = document.getElementById("pixel-container")

  generatePixelGrid(25, 10);
  createEventListeners()
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
}

function handlePaint(e) {
  if (!mouseDown) return;
  if (!e.target.classList.contains("pixel-box")) return;
  e.target.style.backgroundColor = selectedColor;
}

function generatePixelGrid(rows, columns) {
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
