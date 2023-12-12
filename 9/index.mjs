function parseReadingsFromInput(input) {
  return input.split("\n").map((line, i) => ({
    index: i,
    lines: [
      line
        .trim()
        .split(" ")
        .map((nr) => Number(nr)),
    ],
  }));
}

function addDifferencesToReading(reading) {
  let line = reading.lines[reading.lines.length - 1];
  let differences = [];
  let differencesHasOtherValueThanZero = false;
  for (let i = 0; i < line.length - 1; i++) {
    const nrA = line[i];
    const nrB = line[i + 1];
    const diff = nrB - nrA;
    if (diff != 0) {
      differencesHasOtherValueThanZero = true;
    }
    differences.push(diff);
  }

  if (differencesHasOtherValueThanZero) {
    reading.lines.push(differences);
    addDifferencesToReading(reading);
  } else {
    reading.lines.push([0, ...differences, 0]);
  }
  return reading;
}

function addPredictionsToReading(reading) {
  let lines = reading.lines;
  for (let y = lines.length - 2; y >= 0; y--) {
    const yNr = lines[y + 1][lines[y + 1].length - 1];
    const xNr = lines[y][lines[y].length - 1];
    const prediction = xNr + yNr;
    lines[y].push(prediction);
  }
  for (let y = lines.length - 2; y >= 0; y--) {
    const yNr = lines[y + 1][0];
    const xNr = lines[y][0];
    const prediction = xNr - yNr;
    lines[y] = [prediction, ...lines[y]];
  }
  return reading;
}

export function solve(input) {
  const readings = parseReadingsFromInput(input);
  let nextPrediction = 0;
  let prevPrediction = 0;
  for (const reading of readings) {
    addDifferencesToReading(reading);
    addPredictionsToReading(reading);
    console.log(reading);
    prevPrediction += reading.lines[0][0];
    nextPrediction += reading.lines[0][reading.lines[0].length - 1];
  }
  return { prevPrediction, nextPrediction };
}
