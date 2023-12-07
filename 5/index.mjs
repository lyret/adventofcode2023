import {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} from "node:worker_threads";
import { fileURLToPath } from "node:url";

function parseInput(input) {
  const res = { maps: [], input: [] };
  let from = "";
  let to = "";
  input
    .split("\n")
    .map((line) => line.split(":").filter((column) => column.length))
    .filter((line) => line.length)
    .forEach((line, i) => {
      if (i == 0 && line.length == 2 && line[0] == "seeds") {
        res.input = line[1]
          .trim()
          .split(" ")
          .map((nr) => Number(nr))
          // Convert to pairs of numbers
          .reduce((acc, num, index, numbers) => {
            if (index % 2 === 0) {
              acc.push([num, numbers[index + 1]]);
            }
            return acc;
          }, [])
          // Convert to input object
          .map(([start, length]) => ({
            type: "seed",
            first: start,
            last: start + length,
          }));
      } else {
        const data = line[0].split("map");
        if (data.length == 2) {
          [from, to] = data[0].trim().split("-to-");
        } else {
          const [destination, source, range] = data[0]
            .split(" ")
            .map((nr) => Number(nr));
          res.maps.push({
            from,
            to,
            destination,
            source,
            range,
            first: source,
            last: source + range - 1,
          });
        }
      }
    });
  return res;
}

function convertOriginal(almenac, target, goal) {
  const availableMaps = almenac.maps.filter((map) => map.from == target.type);

  if (!availableMaps.length) {
    throw new Error(`no available map exist for convertering "${target.type}"`);
  }

  const matchingMap = availableMaps.find((map) => {
    return target.nr >= map.source && target.nr < map.source + map.range;
  });

  const next = {
    map: { ...target.map, [target.type]: target.nr },
    type: availableMaps[0].to,
    nr: matchingMap
      ? matchingMap.destination + (target.nr - matchingMap.source)
      : target.nr,
  };

  if (next.type != goal) {
    return convert(almenac, next, goal);
  }

  return next;
}

function convertRanges(almenac, target, goal) {
  if (target.type == goal) {
    return [target];
  }

  // Find all available maps for this type
  const availableMaps = almenac.maps.filter((map) => map.from == target.type);

  if (!availableMaps.length) {
    throw new Error(`no available map exist for convertering "${target.type}"`);
  }

  // Split the target and return a array with new targets, map and convert all matching parts
  // of the target
  const newTargets = [];
  for (const map of availableMaps) {
    let completeIntersection =
      target.first >= map.first && target.last <= map.last;
    let leftIntersection = target.first < map.first && target.last >= map.first;
    let rightIntersection = target.last > map.last && target.first <= map.last;

    if (completeIntersection) {
      newTargets.push(
        mapInput(map, {
          map: target.map,
          type: target.type,
          first: target.first,
          last: target.last,
        })
      );
    } else if (leftIntersection) {
      newTargets.push({
        map: target.map,
        type: target.type,
        first: target.first,
        last: map.first - 1,
      });
      newTargets.push(
        mapInput(map, {
          map: target.map,
          type: target.type,
          first: map.first,
          last: Math.min(target.last, map.last),
        })
      );
    } else if (rightIntersection) {
      newTargets.push(
        mapInput(map, {
          map: target.map,
          type: target.type,
          first: Math.max(target.first, map.first),
          last: map.last,
        })
      );
      newTargets.push({
        map: target.map,
        type: target.type,
        first: map.last + 1,
        last: target.last,
      });
    }

    if (newTargets.length) {
      return newTargets;
    }
  }

  // If no map matches, return a default conversion in an array
  return [
    {
      map: { ...target.map, [target.type]: [target.first, target.last] },
      type: availableMaps[0].to,
      first: target.first,
      last: target.last,
    },
  ];
}

function mapInput(map, target) {
  return {
    map: { ...target.map, [target.type]: [target.first, target.last] },
    type: map.to,
    first: map.destination + (target.first - map.source),
    last: map.destination + (target.last - map.source),
  };
}

/** Convert from seeds to locations, keep only the one with the lowest value */
function convertToLowestLocation(almenac, input) {
  let inputs = [input];
  while (true) {
    inputs = inputs
      .map((input) => convertRanges(almenac, input, "location"))
      .flat();
    if (inputs.every((input) => input.type == "location")) {
      break;
    }
  }
  return findLowestLocation(inputs);
}

function findLowestLocation(inputs) {
  let seedWithLowestFirstLocation = null;

  for (const convertedInput of inputs) {
    if (
      !seedWithLowestFirstLocation ||
      convertedInput.first < seedWithLowestFirstLocation.first
    ) {
      seedWithLowestFirstLocation = convertedInput;
    }
  }

  return seedWithLowestFirstLocation;
}

export async function solve(txtInput) {
  if (!isMainThread) {
    return;
  }
  console.time("Execution Time");
  console.log("Almenac");
  const almenac = parseInput(txtInput);
  console.log(almenac);

  console.log("Start processing...");
  const promises = almenac.input.map(async (input, i) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(fileURLToPath(import.meta.url), {
        workerData: [almenac, input],
      });
      worker.on("message", resolve);
      worker.on("error", reject);
    });
    // return new Promise((resolve, reject) => {
    //   console.time("Execution time for seed " + input.first);
    //   console.log("Processing seed", input.first);
    //   const foundLowestLocation = convertToLowestLocation(almenac, input);
    //   resolve({ foundLowestLocation });
    // });
  });
  const works = await Promise.all(promises);
  console.timeEnd("Execution Time");
  console.log("Done");
  return findLowestLocation(works);
}

// Worker Thread
if (!isMainThread) {
  const [almenac, input] = workerData;
  console.time("Execution time for seed " + input.first);
  console.log("Processing seed", input.first);
  const foundLowestLocation = convertToLowestLocation(almenac, input);
  parentPort.postMessage(foundLowestLocation);
  console.timeEnd("Execution time for seed " + input.first);
}
