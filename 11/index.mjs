export function solve(input) {
  let i = 0;
  let galaxies = {};
  let rowsWithGalaxies = {};
  let columnsWithGalaxies = {};
  const matrix = input.split("\n").map((line) => line.split(""));

  for (let x = 0; x < matrix[0].length; x++) {
    for (let y = 0; y < matrix.length; y++) {
      if (matrix[y][x] == "#") {
        galaxies[++i] = { x, y };
        columnsWithGalaxies[x] = true;
        rowsWithGalaxies[y] = true;
      }
    }
  }

  let xx = 0;
  for (let x = 0; x < matrix[0].length; x++) {
    if (!columnsWithGalaxies[x]) {
      xx += 1;
      for (const key of Object.keys(galaxies)) {
        if (galaxies[key].x > x + xx) {
          galaxies[key].x += 1;
        }
      }
    }
  }
  let yy = 0;
  for (let y = 0; y < matrix.length; y++) {
    if (!rowsWithGalaxies[y]) {
      yy += 1;
      for (const key of Object.keys(galaxies)) {
        if (galaxies[key].y > y + yy) {
          galaxies[key].y += 1;
        }
      }
    }
  }

  return galaxies;
}
