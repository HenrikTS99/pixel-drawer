let pixelContainer;


document.addEventListener('DOMContentLoaded', function () {
  pixelContainer = document.getElementById("pixel-container")

  generatePixelGrid(5, 10);

}
)



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
