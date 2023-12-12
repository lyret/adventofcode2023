const SYMBOLS = {
  "|": { n: 1, s: 1, _: "┃" },
  "-": { w: 1, e: 1, _: "━" },
  L: { n: 1, e: 1, _: "┗" },
  J: { w: 1, n: 1, _: "┛" },
  7: { w: 1, s: 1, _: "┓" },
  F: { e: 1, s: 1, _: "┏" },
  ".": { _: " " },
  S: { w: 1, n: 1, e: 1, s: 1, _: "S" },
};

function parseInput(input) {
  let start = null;
  const matrix = input.split("\n").map((line, y) =>
    line.split("").map((s, x) => {
      if (s == "S") {
        start = { ...SYMBOLS[s], v: 0, x, y, ok: true };
        return { ...SYMBOLS[s], v: 0, x, y, ok: true };
      }
      return { ...SYMBOLS[s], v: Number.POSITIVE_INFINITY, x, y };
    })
  );
  return [matrix, start];
}

function printMatrix(matrix, onlyOk) {
  let res = "";
  for (const line of matrix) {
    for (const pos of line) {
      if (onlyOk) {
        if (pos.ok) {
          res += pos["_"];
        } else {
          res += ".";
        }
      } else {
        if (pos.v < Number.POSITIVE_INFINITY) {
          res += pos["v"];
        } else {
          res += pos["_"];
        }
      }
    }
    res += "\n";
  }
  console.log(res);
}

async function getBiggestValueInMatrix(matrix) {
  let biggest = 0;
  for (const line of matrix) {
    for (const pos of line) {
      if (pos.v < Number.POSITIVE_INFINITY && pos.v > biggest) {
        biggest = pos.v;
      }
    }
  }
  return biggest;
}

async function traveseMatrix(matrix, from, value = 1) {
  let neighbours = await getNeighbours(matrix, from);

  for (const to of neighbours) {
    if (to.v > value) {
      to.v = value;
      to.ok = true;
      await traveseMatrix(matrix, to, value + 1);
    }
  }
}

async function getNeighbours(matrix, pos) {
  let neighbours = [];
  if (pos.w) {
    neighbours.push(getSymbolFollowingLink(matrix, pos.x - 1, pos.y, "e"));
  }
  if (pos.n) {
    neighbours.push(getSymbolFollowingLink(matrix, pos.x, pos.y - 1, "s"));
  }
  if (pos.e) {
    neighbours.push(getSymbolFollowingLink(matrix, pos.x + 1, pos.y, "w"));
  }
  if (pos.s) {
    neighbours.push(getSymbolFollowingLink(matrix, pos.x, pos.y + 1, "n"));
  }
  return neighbours.filter((s) => s);
}

function getSymbolFollowingLink(matrix, x, y, link) {
  if (y >= 0 && y < matrix.length) {
    if (x >= 0 && x < matrix[y].length) {
      if (matrix[y][x][link]) {
        return matrix[y][x];
      }
    }
  }
  return null;
}

export async function solve(input) {
  let [matrix, start] = parseInput(input);
  //printMatrix(matrix);
  await traveseMatrix(matrix, start);
  printMatrix(matrix, true);
  return getBiggestValueInMatrix(matrix);
}
