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
  let jokerBonus = 0;
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
          return { ...card, value: 13 };
        case "K":
          return { ...card, value: 12 };
        case "Q":
          return { ...card, value: 11 };
        case "T":
          return { ...card, value: 10 };
        case "J":
          jokerBonus += 1;
          return { ...card, value: 1 };
        default:
          return { ...card, value: Number(card.char) };
      }
    });

  const parsedCards = { J: jokerBonus };
  const freqOfCards = {};
  for (const card of hand.data) {
    if (!parsedCards[card.char]) {
      parsedCards[card.char] = 1;
      freqOfCards[card.freq] ||= 0;
      freqOfCards[card.freq] += 1;
    }
  }
  hand.jokerBonus = jokerBonus;
  hand.freqs = freqOfCards;

  // Natural five of a kind
  if (freqOfCards["5"] == 1) {
    hand.value = 7;
  }
  // Four of a kind
  else if (freqOfCards["4"] == 1) {
    hand.value = 6;
    // Five of a kind with a joker
    if (jokerBonus == 1) {
      hand.value = 7;
    }
  }
  // Full house
  else if (freqOfCards["3"] == 1 && freqOfCards["2"] == 1) {
    hand.value = 5;
    // No jokers here
  }
  // Three of a kind
  else if (freqOfCards["3"] == 1) {
    hand.value = 4;
    // Five of a kind with two jokers
    if (jokerBonus == 2) {
      hand.value = 7;
    }
    // Four of a kind with one joker
    else if (jokerBonus == 1) {
      hand.value = 6;
    }
  }
  // Two pair
  else if (freqOfCards["2"] == 2) {
    hand.value = 3;
    // Full House with one joker
    if (jokerBonus == 1) {
      hand.value = 5;
    }
  }
  // One pair
  else if (freqOfCards["2"] == 1) {
    hand.value = 2;
    // Five of a kind with three jokers
    if (jokerBonus == 3) {
      hand.value = 7;
    }
    // Four of a kind with two joker
    else if (jokerBonus == 2) {
      hand.value = 6;
    }
    // Three of a kind with one joker
    else if (jokerBonus == 1) {
      hand.value = 4;
    }
  }
  // High card
  else {
    hand.value = 1;
    // Five of a kind with five jokers
    if (jokerBonus == 5) {
      hand.value = 7;
    }
    // Five of a kind with four jokers
    else if (jokerBonus == 4) {
      hand.value = 7;
    }
    // Four of a kind with three joker
    else if (jokerBonus == 3) {
      hand.value = 6;
    }
    // Three of a kind with two joker
    else if (jokerBonus == 2) {
      hand.value = 4;
    }
    // One Pair with one joker
    else if (jokerBonus == 1) {
      hand.value = 2;
    }
  }

  // Add printable type
  switch (hand.value) {
    case 7:
      hand.type = "Five of a kind";
      break;
    case 6:
      hand.type = "Four of a kind";
      break;
    case 5:
      hand.type = "Full house";
      break;
    case 4:
      hand.type = "Three of a kind";
      break;
    case 3:
      hand.type = "Two pair";
      break;
    case 2:
      hand.type = "One pair";
      break;
    case 1:
      hand.type = "High card";
      break;
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
      `rank: ${rank} hand: ${linkedHand.hand} jokers: ${linkedHand.jokerBonus} type: ${linkedHand.type} `
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
  return winnings;
}
