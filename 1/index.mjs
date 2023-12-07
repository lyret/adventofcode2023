const digitizedNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const textifiedNumbers = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];

function compareWithValuesArray(pos, line, valuesArray) {
  for (let nr = 1; nr <= valuesArray.length; nr++) {
    let offset = 0;
    let value = valuesArray[nr - 1];
    while (
      // We are inside the line
      pos + offset < line.length &&
      offset < value.length &&
      // The characters match
      line[pos + offset] == value[offset]
    ) {
      if (offset == value.length - 1) {
        //console.log(value, line, nr, offset);
        return nr;
      }
      offset += 1;
    }
  }
  return 0;
}

function sumOfCombinedFirstAndLastDigitsOnEachLine(input) {
  return input
    .split("\n")
    .map((line) => {
      let firstDigit = undefined;
      let lastDigit = undefined;
      for (let i = 0; i < line.length; i++) {
        firstDigit = Number(line[i]);
        if (!Number.isNaN(firstDigit)) {
          break;
        }
      }
      for (let j = line.length - 1; j >= 0; j--) {
        lastDigit = Number(line[j]);
        if (!Number.isNaN(lastDigit)) {
          break;
        }
      }
      return Number(`${firstDigit}${lastDigit}`);
    })
    .reduce((n, m) => n + m, 0);
}

export async function sumOfCombinedFirstAndLastDigitOnEachLineIncludingTextualNumebers(
  input
) {
  return input
    .split("\n")
    .map((line) => {
      // Go forward
      let firstDigit = 0;
      for (let pos = 0; pos < line.length; pos++) {
        // Check the digit and text arrays for matching characters
        const res =
          compareWithValuesArray(pos, line, textifiedNumbers) ||
          compareWithValuesArray(pos, line, digitizedNumbers);
        if (res) {
          firstDigit = res;
          break;
        }
      }
      // Go forward
      let lastDigit = 0;
      for (let pos = line.length - 1; pos >= 0; pos--) {
        // Check the digit and text arrays for matching characters
        const res =
          compareWithValuesArray(pos, line, textifiedNumbers) ||
          compareWithValuesArray(pos, line, digitizedNumbers);
        if (res) {
          lastDigit = res;
          break;
        }
      }

      return Number(`${firstDigit}${lastDigit}`);
    })
    .reduce((n, m) => n + m, 0);
}

export async function solve(input) {
  const oneStar = await sumOfCombinedFirstAndLastDigitsOnEachLine(input);
  const twoStar =
    await sumOfCombinedFirstAndLastDigitOnEachLineIncludingTextualNumebers(
      input
    );
  return { oneStar, twoStar };
}
