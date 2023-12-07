function parseInput(input) {
  const lines = input.split("\n");
  const times = lines[0]
    .split(":")[1]
    .trim()
    .split(" ")
    .filter((nr) => !!nr)
    .map((nr) => Number(nr));
  const records = lines[1]
    .split(":")[1]
    .trim()
    .split(" ")
    .filter((nr) => !!nr)
    .map((nr) => Number(nr));

  return times.map((time, i) => ({
    allowedTime: time,
    distanceToBeat: records[i],
  }));
}

function findNrOfSolutionsToRace({ allowedTime, distanceToBeat }) {
  const waysToWin = [];
  for (
    let buttonPressedTime = 0;
    buttonPressedTime <= allowedTime;
    buttonPressedTime++
  ) {
    let distancePerRemaingTime = buttonPressedTime;
    let timeForTheBoatToMove = allowedTime - buttonPressedTime;
    let distanceTheBoatWillTravel =
      distancePerRemaingTime * timeForTheBoatToMove;

    if (distanceTheBoatWillTravel > distanceToBeat) {
      waysToWin.push(buttonPressedTime);
    }
  }
  return waysToWin.length;
}

export function solve(input) {
  const races = parseInput(input);
  console.log(races);
  const marginOfError = races
    .map((race) => findNrOfSolutionsToRace(race))
    .reduce((acc, solutions) => acc * solutions, 1);
  return { marginOfError };
}
