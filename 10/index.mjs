const MATRIX_SYMBOLS = {
  "|": { n: true, s: true, _: "┃" },
  "-": { w: true, e: true, _: "━" },
  L: { n: true, e: true, _: "┗" },
  J: { w: true, n: true, _: "┛" },
  7: { w: true, s: true, _: "┓" },
  F: { e: true, s: true, _: "┏" },
  ".": { _: "." },
  O: { _: "." },
  I: { _: "." },
  S: { w: true, n: true, e: true, s: true, _: "S" },
};
const VISUAL_SYMBOLS = {
  FREE: { _: ".", free: true },
  CLEAR: { _: " ", free: true },
  FILLED: { _: "X", free: true },
  BLOCK: { _: "█", free: false },
};
const FILLING_SYMBOLS = ["O", "I", "A", "X", "=", "§"];

// INPUT

function createMatrixFromInput(input) {
  let start = null;
  const matrix = input.split("\n").map((line, y) =>
    line.split("").map((s, x) => {
      if (s == "S") {
        start = { ...MATRIX_SYMBOLS[s], v: 0, x, y, ok: true };
        return { ...MATRIX_SYMBOLS[s], v: 0, x, y, ok: true };
      }
      return { ...MATRIX_SYMBOLS[s], v: Number.POSITIVE_INFINITY, x, y };
    })
  );
  return [matrix, start];
}

// MATRIX

async function analyzeMatrixForExistingLoopAndDistancesFromStart(
  matrix,
  from,
  value = 1
) {
  let neighbours = await getLinkedNeighbours(matrix, from);

  for (const to of neighbours) {
    if (to.v > value) {
      to.v = value;
      to.ok = true;
      await analyzeMatrixForExistingLoopAndDistancesFromStart(
        matrix,
        to,
        value + 1
      );
    }
  }
}

async function getLinkedNeighbours(matrix, pos, onlyLinkToOk) {
  let neighbours = [];
  if (pos.w) {
    neighbours.push(
      getSymbolFollowingLink(matrix, pos.x - 1, pos.y, "e", onlyLinkToOk)
    );
  }
  if (pos.n) {
    neighbours.push(
      getSymbolFollowingLink(matrix, pos.x, pos.y - 1, "s", onlyLinkToOk)
    );
  }
  if (pos.e) {
    neighbours.push(
      getSymbolFollowingLink(matrix, pos.x + 1, pos.y, "w", onlyLinkToOk)
    );
  }
  if (pos.s) {
    neighbours.push(
      getSymbolFollowingLink(matrix, pos.x, pos.y + 1, "n", onlyLinkToOk)
    );
  }
  return neighbours.filter((s) => s);
}

function getSymbolFollowingLink(matrix, x, y, link, onlyLinkToOk) {
  if (y >= 0 && y < matrix.length) {
    if (x >= 0 && x < matrix[y].length) {
      if (matrix[y][x][link]) {
        if (!onlyLinkToOk || matrix[y][x].ok) {
          return matrix[y][x];
        }
      }
    }
  }
  return null;
}

async function analyzeMatrixForSqueezableSpaces(matrix, from) {
  await addSqueezeInformationToPositionInMatrix(matrix, from);
  let neighbours = await getLinkedNeighbours(matrix, from, true);
  for (const to of neighbours) {
    if (!to.squeezedChecked) {
      await analyzeMatrixForSqueezableSpaces(matrix, to);
    }
  }
}

async function addSqueezeInformationToPositionInMatrix(matrix, pos) {
  pos.squeezedChecked = true;
  pos.freeW =
    !pos.w && !getSymbolFollowingLink(matrix, pos.x - 1, pos.y, "e", true);
  pos.freeN =
    !pos.n && !getSymbolFollowingLink(matrix, pos.x, pos.y - 1, "s", true);
  pos.freeE =
    !pos.e && !getSymbolFollowingLink(matrix, pos.x + 1, pos.y, "w", true);
  pos.freeS =
    !pos.s && !getSymbolFollowingLink(matrix, pos.x, pos.y + 1, "n", true);
}

async function convertStartToSymbol(matrix, start) {
  const w = !!getSymbolFollowingLink(matrix, start.x - 1, start.y, "e", true);
  const n = !!getSymbolFollowingLink(matrix, start.x, start.y - 1, "s", true);
  const e = !!getSymbolFollowingLink(matrix, start.x + 1, start.y, "w", true);
  const s = !!getSymbolFollowingLink(matrix, start.x, start.y + 1, "n", true);

  let symbol = ".";
  if (n && s) {
    symbol = "|";
  } else if (w && e) {
    symbol = "-";
  } else if (n && e) {
    symbol = "L";
  } else if (w && n) {
    symbol = "J";
  } else if (w && s) {
    symbol = "7";
  } else if (e && s) {
    symbol = "F";
  }

  matrix[start.y][start.x] = {
    ...MATRIX_SYMBOLS[symbol],
    v: 0,
    ok: true,
    x: start.x,
    y: start.y,
  };
}

function getBiggestDistanceInAnalyzedMatrix(matrix) {
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

// RENDERING

function createRenderFromMatrix(matrix) {
  let visualMatrix = [];
  for (let y = 0; y < matrix.length; y++) {
    let out1 = [];
    let out2 = [];
    let out3 = [];
    for (let x = 0; x < matrix[y].length; x++) {
      const pos = matrix[y][x];
      if (!pos.ok) {
        out1.push({ ...VISUAL_SYMBOLS.CLEAR });
        out1.push({ ...VISUAL_SYMBOLS.CLEAR });
        out1.push({ ...VISUAL_SYMBOLS.CLEAR });
        out2.push({ ...VISUAL_SYMBOLS.CLEAR });
        out2.push({ ...VISUAL_SYMBOLS.FREE, v: 1 });
        out2.push({ ...VISUAL_SYMBOLS.CLEAR });
        out3.push({ ...VISUAL_SYMBOLS.CLEAR });
        out3.push({ ...VISUAL_SYMBOLS.CLEAR });
        out3.push({ ...VISUAL_SYMBOLS.CLEAR });
      } else {
        // Top
        if (pos.freeN || pos.freeW) {
          out1.push({ ...VISUAL_SYMBOLS.CLEAR });
        } else {
          out1.push({ ...VISUAL_SYMBOLS.BLOCK });
        }
        if (pos.freeN) {
          out1.push({ ...VISUAL_SYMBOLS.CLEAR });
        } else {
          out1.push({ ...VISUAL_SYMBOLS.BLOCK });
        }
        if (pos.freeN || pos.freeE) {
          out1.push({ ...VISUAL_SYMBOLS.CLEAR });
        } else {
          out1.push({ ...VISUAL_SYMBOLS.BLOCK });
        }
        // Middle
        if (pos.freeW) {
          out2.push({ ...VISUAL_SYMBOLS.CLEAR });
        } else {
          out2.push({ ...VISUAL_SYMBOLS.BLOCK });
        }
        out2.push({ ...VISUAL_SYMBOLS.BLOCK });
        if (pos.freeE) {
          out2.push({ ...VISUAL_SYMBOLS.CLEAR });
        } else {
          out2.push({ ...VISUAL_SYMBOLS.BLOCK });
        }
        // Bottom
        if (pos.freeS || pos.freeW) {
          out3.push({ ...VISUAL_SYMBOLS.CLEAR });
        } else {
          out3.push({ ...VISUAL_SYMBOLS.BLOCK });
        }
        if (pos.freeS) {
          out3.push({ ...VISUAL_SYMBOLS.CLEAR });
        } else {
          out3.push({ ...VISUAL_SYMBOLS.BLOCK });
        }
        if (pos.freeS || pos.freeE) {
          out3.push({ ...VISUAL_SYMBOLS.CLEAR });
        } else {
          out3.push({ ...VISUAL_SYMBOLS.BLOCK });
        }
      }
    }
    visualMatrix.push(out1);
    visualMatrix.push(out2);
    visualMatrix.push(out3);
  }
  return visualMatrix.map((line, y) =>
    line.map((pos, x) => ({ ...pos, x, y }))
  );
}

function getFirstValuedPositionInRendering(rendering) {
  for (const line of rendering) {
    for (const pos of line) {
      if (pos.v && !pos.ok) {
        return pos;
      }
    }
  }
  return null;
}

async function getFreeNeighboursFromPosInRendering(rendering, pos) {
  const neighbours = [
    getSymbolAtPosOfRendering(rendering, pos.x - 1, pos.y),
    getSymbolAtPosOfRendering(rendering, pos.x, pos.y - 1),
    getSymbolAtPosOfRendering(rendering, pos.x + 1, pos.y),
    getSymbolAtPosOfRendering(rendering, pos.x, pos.y + 1),
  ];
  return neighbours.filter((s) => s.free && !s.ok);
}

function getSymbolAtPosOfRendering(rendering, x, y) {
  if (y >= 0 && y < rendering.length) {
    if (x >= 0 && x < rendering[y].length) {
      return rendering[y][x];
    }
  }
  return { ...VISUAL_SYMBOLS.FILLED, ok: true, free: true };
}

function countAreasInRendering(rendering) {
  let counts = {};
  for (const line of rendering) {
    for (const pos of line) {
      if (pos.v) {
        counts[pos["_"]] ||= 0;
        counts[pos["_"]] += 1;
      }
    }
  }
  return counts;
}

async function fillAreasInRendering(rendering) {
  let i = 0;
  while (true) {
    const pos = getFirstValuedPositionInRendering(rendering);
    if (!pos) {
      break;
    }
    const symbol = FILLING_SYMBOLS[i % FILLING_SYMBOLS.length];
    await fillSingleAreaInRendering(rendering, pos, symbol);
    i++;
  }
}

async function fillSingleAreaInRendering(rendering, pos, symbol, sum = 0) {
  pos = {
    ...pos,
    ...VISUAL_SYMBOLS.FILLED,
    _: symbol,
    ok: true,
  };
  rendering[pos.y][pos.x] = pos;

  let neighbours = await getFreeNeighboursFromPosInRendering(rendering, pos);
  for (const next of neighbours) {
    sum += await fillSingleAreaInRendering(rendering, next, symbol, pos.v || 0);
  }
  return sum;
}

// PRINTING

function printMatrix(matrix) {
  let res = "";
  for (const line of matrix) {
    for (const pos of line) {
      if (pos.v < Number.POSITIVE_INFINITY) {
        res += pos["_"];
      } else {
        if (!pos["_"]) {
          console.log(pos);
        }
        res += pos["_"];
      }
    }
    res += "\n";
  }
  console.log(res);
}

function printRendering(rendering) {
  let counts = {};
  let res = "";
  for (const line of rendering) {
    for (const pos of line) {
      if (pos.v || !pos.free) {
        res += pos["_"];
        counts[pos["_"]] ||= 0;
        counts[pos["_"]] += 1;
      } else {
        res += " ";
      }
    }
    res += "\n";
  }
  console.log(res);
  return counts;
}

// MAIN

export async function solve(input) {
  let [matrix, start] = createMatrixFromInput(input);
  await analyzeMatrixForExistingLoopAndDistancesFromStart(matrix, start);
  const biggestDistance = getBiggestDistanceInAnalyzedMatrix(matrix);

  await convertStartToSymbol(matrix, start);
  await analyzeMatrixForSqueezableSpaces(matrix, start);

  const rendering = createRenderFromMatrix(matrix);
  await fillAreasInRendering(rendering);
  printRendering(rendering);

  const counts = countAreasInRendering(rendering);

  return { biggestDistance, counts };
}
