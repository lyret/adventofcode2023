function parseInput(input) {
  return input.split("\n").map((line) => {
    let [cardNr, data] = line.split(":");
    cardNr = cardNr.split(" ")[1];
    let [winningNrs, handNrs] = data.split("|");
    winningNrs = winningNrs
      .split(" ")
      .map((nr) => Number(nr))
      .map((nr) => Number(nr))
      .filter((nr) => !Number.isNaN(nr) && nr);
    handNrs = handNrs
      .split(" ")
      .map((nr) => Number(nr))
      .filter((nr) => !Number.isNaN(nr) && nr);

    let matchingNrs = handNrs.reduce((res, nr) => {
      return winningNrs.indexOf(nr) > -1 ? res + 1 : res;
    }, 0);

    let points = handNrs.reduce((res, nr) => {
      if (winningNrs.indexOf(nr) > -1) {
        res = !res ? 1 : res * 2;
      }
      return res;
    }, 0);

    return { cardNr, handNrs, winningNrs, matchingNrs, points, copies: 1 };
  });
}

function winCopiesOfCards(cards) {
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    for (let j = 0; j < card.matchingNrs; j++) {
      const wonCardIndex = i + 1 + j;
      if (wonCardIndex < cards.length) {
        cards[wonCardIndex].copies += card.copies;
      }
    }
  }
}

export function solve(input) {
  const cards = parseInput(input);
  winCopiesOfCards(cards);
  const pointsTotal = cards.reduce((res, card) => res + card.matchingNrs, 0);
  const copiesTotal = cards.reduce((res, card) => res + card.copies, 0);
  return { cards, pointsTotal, copiesTotal };
}
