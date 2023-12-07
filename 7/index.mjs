function parseInput(input) {
  return input
    .split("\n")
    .map((line) =>
      line
        .split(" ")
        .map((column) => column.trim())
        .filter((column) => column.length)
    )
    .map(([hand, bet]) => ({
      hand,
      bet: Number(bet),
    }));
}

async function addDataToHand(hand) {
  hand.data = hand.hand
    .split("")
    .map((char, i, arr) => {
      return {
        char,
        freq: arr.reduce((acc, c) => (c == char ? acc + 1 : acc), 0),
      };
    })
    .map((card) => {
      switch (card.char) {
        case "A":
          return { ...card, value: 14 };
        case "K":
          return { ...card, value: 13 };
        case "Q":
          return { ...card, value: 12 };
        case "J":
          return { ...card, value: 11 };
        case "T":
          return { ...card, value: 10 };
        default:
          return { ...card, value: Number(card.char) };
      }
    });

  const parsedCards = {};
  const freqOfCards = {};
  for (const card of hand.data) {
    if (!parsedCards[card.char]) {
      parsedCards[card.char] = 1;
      freqOfCards[card.freq] ||= 0;
      freqOfCards[card.freq] += 1;
    }
  }

  if (freqOfCards["5"] == 1) {
    hand.type = "Five of a kind";
    hand.value = 7;
  } else if (freqOfCards["4"] == 1) {
    hand.type = "Four of a kind";
    hand.value = 6;
  } else if (freqOfCards["3"] == 1 && freqOfCards["2"] == 1) {
    hand.type = "Full house";
    hand.value = 5;
  } else if (freqOfCards["3"] == 1) {
    hand.type = "Three of a kind";
    hand.value = 4;
  } else if (freqOfCards["2"] == 2) {
    hand.type = "Two pair";
    hand.value = 3;
  } else if (freqOfCards["2"] == 1) {
    hand.type = "One pair";
    hand.value = 2;
  } else if (freqOfCards["1"] == 5) {
    hand.type = "High card";
    hand.value = 1;
  }

  return hand;
}

async function nextHandIsBigger(currentHand, givenHand) {
  if (currentHand.value == givenHand.value) {
    for (let i = 0; i < givenHand.data.length; i++) {
      if (currentHand.data[i].value == givenHand.data[i].value) {
        continue;
      }
      return currentHand.data[i].value < givenHand.data[i].value;
    }
    // The cards are of the same strength
    return false;
  }
  return currentHand.value < givenHand.value;
}

async function addRawHandsToLinkedList(rawHands) {
  let prevHand = null;
  let nextHand = null;
  let root = null;

  for (const rawHand of rawHands) {
    const currentHand = await addDataToHand(rawHand);

    if (!root) {
      root = currentHand;
      nextHand = currentHand;
      continue;
    }

    while (true) {
      // No more hands to check, insert the hand and break
      if (!nextHand && prevHand) {
        prevHand.next = currentHand;
        break;
      }
      // Check if this hand is bigger then the current hand.
      // If so, move forward in the linked list
      else if (await nextHandIsBigger(nextHand, currentHand)) {
        prevHand = nextHand;
        nextHand = nextHand.next;
        continue;
      }
      // If the hand is smaller, insert the reminder of the
      // list as following this hand to the right
      else {
        currentHand.next = nextHand;
        // Insert the previous hand at the left of the next hand
        if (prevHand) {
          prevHand.next = currentHand;
        }
        // Otherwise insert this hand as the root
        else {
          root = currentHand;
        }
        break;
      }
    }
    // Reset
    nextHand = root;
    prevHand = null;
  }
  return root;
}

async function getWinningsFromLinkedListOfHands(linkedHand) {
  let rank = 1;
  let winnings = 0;
  while (true) {
    let winFromHand = rank * linkedHand.bet;
    console.log(
      `rank: ${rank} hand: ${linkedHand.hand} winnings: ${winFromHand} bet: ${linkedHand.bet} strenght: ${linkedHand.value}`
    );
    winnings += winFromHand;
    if (!linkedHand.next) {
      break;
    }
    rank++;
    linkedHand = linkedHand.next;
  }
  return winnings;
}

export async function solve(input) {
  const rawHands = parseInput(input);
  const linkedHands = await addRawHandsToLinkedList(rawHands);
  const winnings = await getWinningsFromLinkedListOfHands(linkedHands);

  //console.log(JSON.stringify(linkedHands, null, 2));
  return winnings;
}
