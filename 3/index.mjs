const BG_CHAR = ".";
const GEAR_CHAR = "*";

function inputToMatrix(input) {
  return input.split("\n").map((line) => line.split(""));
}

function isDigit(char) {
  return !Number.isNaN(Number(char));
}

function hasSymbolAt(matrix, y, x) {
  if (y < 0 || y >= matrix.length || x < 0 || x >= matrix[y].length) {
    return 0;
  }
  if (matrix[y][x] == GEAR_CHAR) {
    return 2;
  }
  if (matrix[y][x] != BG_CHAR && !isDigit(matrix[y][x])) {
    return 1;
  }
  return 0;
}

function hasAdjucentSymbol(matrix, y, x) {
  return (
    hasSymbolAt(matrix, y, x - 1) ||
    hasSymbolAt(matrix, y, x + 1) ||
    hasSymbolAt(matrix, y - 1, x) ||
    hasSymbolAt(matrix, y - 1, x - 1) ||
    hasSymbolAt(matrix, y - 1, x + 1) ||
    hasSymbolAt(matrix, y + 1, x) ||
    hasSymbolAt(matrix, y + 1, x - 1) ||
    hasSymbolAt(matrix, y + 1, x + 1)
  );
}

function getAdjucentGearSymbolPosition(matrix, y, x) {
  if (hasSymbolAt(matrix, y, x - 1) == 2) {
    return [y, x - 1];
  }
  if (hasSymbolAt(matrix, y, x + 1) == 2) {
    return [y, x + 1];
  }
  if (hasSymbolAt(matrix, y - 1, x) == 2) {
    return [y - 1, x];
  }
  if (hasSymbolAt(matrix, y - 1, x - 1) == 2) {
    return [y - 1, x - 1];
  }
  if (hasSymbolAt(matrix, y - 1, x + 1) == 2) {
    return [y - 1, x + 1];
  }
  if (hasSymbolAt(matrix, y + 1, x) == 2) {
    return [y + 1, x];
  }
  if (hasSymbolAt(matrix, y + 1, x - 1) == 2) {
    return [y + 1, x - 1];
  }
  if (hasSymbolAt(matrix, y + 1, x + 1) == 2) {
    return [y + 1, x + 1];
  }
  return [];
}

function findAllNumbersAdjucentToGearIcons(matrix) {
  const gearsAndNumbers = {};
  for (let y = 0; y < matrix.length; y++) {
    const line = matrix[y];
    let nr = "";
    let ok = false;
    for (let x = 0; x < line.length; x++) {
      const char = line[x];
      if (isDigit(char)) {
        nr = nr + char;
        const gearPos = getAdjucentGearSymbolPosition(matrix, y, x);

        if (gearPos.length) {
          ok = gearPos.join(":");
        }
      } else if (nr.length) {
        if (ok) {
          gearsAndNumbers[ok] = [...(gearsAndNumbers[ok] || []), Number(nr)];
        }
        nr = "";
        ok = false;
      }
    }
    if (nr.length && ok) {
      if (ok) {
        gearsAndNumbers[ok] = [...(gearsAndNumbers[ok] || []), Number(nr)];
      }
      nr = "";
      ok = false;
    }
  }
  return gearsAndNumbers;
}

function getGearRatios(gearsAndNumbers) {
  return Object.values(gearsAndNumbers)
    .filter((values) => values.length == 2)
    .map((values) => values[0] * values[1]);
}

function findAllNumbersWithAdjucentSymbols(matrix) {
  const foundNrs = [];
  for (let y = 0; y < matrix.length; y++) {
    const line = matrix[y];
    let ok = false;
    let nr = "";
    for (let x = 0; x < line.length; x++) {
      const char = line[x];
      if (isDigit(char)) {
        nr = nr + char;
        if (hasAdjucentSymbol(matrix, y, x)) {
          ok = true;
        }
      } else if (nr.length) {
        if (ok) {
          foundNrs.push(Number(nr));
        }
        nr = "";
        ok = false;
      }
    }
    if (nr.length && ok) {
      if (ok) {
        foundNrs.push(Number(nr));
      }
      nr = "";
      ok = false;
    }
  }
  return foundNrs;
}

export function solve(input) {
  const matrix = inputToMatrix(input);
  const foundNrs = findAllNumbersWithAdjucentSymbols(matrix);
  const foundGears = findAllNumbersAdjucentToGearIcons(matrix);
  const gearRatios = getGearRatios(foundGears);
  const sumOfAllGearRatios = gearRatios.reduce((sum, nr) => sum + nr, 0);
  const sumOfAllFoundNrs = foundNrs.reduce((sum, nr) => sum + nr, 0);
  return {
    foundNrs,
    sumOfAllFoundNrs,
    foundGears,
    gearRatios,
    sumOfAllGearRatios,
  };
}
