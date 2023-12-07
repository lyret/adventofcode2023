function parseInput(input, bag) {
  const games = input.split("\n");
  return games.reduce((result, game) => {
    const [gameName, games] = game.split(":");
    const gameId = Number(gameName.trim().split(" ")[1]);
    const minReqBlocks = Object.keys(bag).reduce((res, key) => {
      res[key] = 0;
      return res;
    }, {});
    const subsets = games.split(";");
    const blocks = subsets.map((subset) =>
      subset.split(",").reduce((a, b) => {
        const [nr, color] = b.trim().split(" ");
        if (Number(nr) > minReqBlocks[color]) {
          minReqBlocks[color] = Number(nr);
        }
        a[color] = Number(nr);
        return a;
      }, {})
    );
    const power = Object.values(minReqBlocks).reduce(
      (res, value) => value * res,
      1
    );
    return [
      ...result,
      { shows: blocks, id: gameId, min: minReqBlocks, minPower: power },
    ];
  }, []);
}

function gameIsPossible(game, bag) {
  for (const show of game.shows) {
    for (const color of Object.keys(bag)) {
      if (show[color] > bag[color]) {
        return false;
      }
    }
  }
  return true;
}

const BAG = {
  red: 12,
  green: 13,
  blue: 14,
};

function sumOfPossibleGameIds(input, bag) {
  const games = parseInput(input, bag);
  return games.reduce((result, game) => {
    if (gameIsPossible(game, bag)) {
      return result + game.id;
    } else {
      return result;
    }
  }, 0);
}

function sumOfAllPossiblePowers(input, bag) {
  const games = parseInput(input, bag);
  return games.reduce((result, game) => {
    return game.minPower + result;
  }, 0);
}

export function solve(input) {
  return {
    sumOfPowers: sumOfAllPossiblePowers(input, BAG),
    sumOfAllPlayableGameIds: sumOfPossibleGameIds(input, BAG),
  };
}
