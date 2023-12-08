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

async function traverseNetwork({ directions, network }) {
  let positions = Object.keys(network)
    .filter((node) => node[2] == "A")
    .map((node) => ({ steps: 0, node }));
  let maxFoundNrOfSteps = 1;

  while (true) {
    positions = await Promise.all(
      positions.map(({ steps, node, loop }) => {
        return new Promise((res) => {
          if (steps == maxFoundNrOfSteps) {
            return res({ steps, node, loop });
          }
          let prevSteps = steps;
          let prevNode = node;

          if (loop) {
            return res({ steps: steps + loop, node, loop });
          }

          let direction = directions[steps];
          while (steps < maxFoundNrOfSteps || node[2] != "Z") {
            direction =
              directions[
                steps -
                  Math.floor(steps / directions.length) * directions.length
              ];
            node = network[node][direction];
            steps++;
          }

          if (node == prevNode) {
            loop = steps - prevSteps;
          }

          return res({ steps, node, loop });
        });
      })
    );
    maxFoundNrOfSteps = Math.max(...positions.map(({ steps }) => steps));

    if (positions.every(({ steps }) => steps == maxFoundNrOfSteps)) {
      break;
    }
    if (!positions.every(({ loop }) => loop)) {
      console.log("Every position is looping, solving with lcm");
      maxFoundNrOfSteps = positions.reduce(
        (acc, { steps }) => lcm(acc, steps),
        1
      );
      break;
    }
  }
  console.log(JSON.stringify(positions), maxFoundNrOfSteps);
  return maxFoundNrOfSteps;
}

function gcd(a, b) {
  return a === 0 ? b : gcd(b % a, a);
}

function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

export function solve(input) {
  const parsedInput = parseInput(input);
  return traverseNetwork(parsedInput);
}
