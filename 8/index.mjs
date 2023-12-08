function parseInput(input) {
  let [directions, _, ...network] = input.split("\n");
  const pattern = /(\w\w\w) = \((\w\w\w), (\w\w\w)\)/;
  network = network.reduce((acc, line) => {
    const [_, node, left, right] = line.match(pattern);
    acc[node] = [left, right];
    return acc;
  }, {});
  directions = directions
    .trim("")
    .split("")
    .map((char) => (char == "R" ? 1 : 0));

  return {
    directions,
    network,
  };
}

function traverseNetwork({ directions, network }, start, goal) {
  let steps = 0;
  let position = start;
  let direction = directions[0];
  while (true) {
    console.log(position);
    if (position == goal) {
      return steps;
    }
    direction =
      directions[
        steps - Math.floor(steps / directions.length) * directions.length
      ];
    position = network[position][direction];
    steps++;
  }
}

export function solve(input) {
  const parsedInput = parseInput(input);
  return traverseNetwork(parsedInput, "AAA", "ZZZ");
}
