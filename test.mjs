import * as Path from "node:path";
import * as FS from "node:fs";

// Test the given solution when executed
(async () => {
  const solution = process.argv[2];
  const fileNameFilter = process.argv[3]
    ? process.argv[3].toLowerCase()
    : undefined;

  // Determine the given solution to test
  if (!solution) {
    throw new Error(
      "Please specify what solution to test, i.e. by running 'npm test 24'"
    );
  }

  const folder = Path.resolve(".", solution);
  const file = Path.resolve(".", solution, "index.mjs");

  // Import solve function
  if (!FS.existsSync(folder)) {
    throw new Error(
      `There is no solution folder (${solution}) for given the solution'`
    );
  }
  if (!FS.existsSync(file)) {
    throw new Error(
      `There is no solution file (${solution}/index.mjs) for given the solution'`
    );
  }

  const { solve } = await import(file);

  if (!solve) {
    throw new Error(
      `There is no exported function named 'solve' in the solution file (${solution}/index.mjs)'`
    );
  }

  // Find all inputs in the given solution folder
  const inputs = FS.readdirSync(folder)
    .filter((file) => file.toLowerCase().indexOf(".txt") > -1)
    .filter(
      (file) =>
        fileNameFilter && file.toLowerCase().indexOf(fileNameFilter) > -1
    )
    .reverse()
    .map((file) => ({
      name: file.split(".")[0].toUpperCase(),
      input: FS.readFileSync(Path.resolve(folder, file), "utf-8"),
    }));

  console.log("SOLUTIONS:");
  for (const { name, input } of inputs) {
    console.log(name);
    console.log(await solve(input));
  }
})();
