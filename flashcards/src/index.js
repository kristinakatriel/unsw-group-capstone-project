import Resolver from '@forge/resolver';
// import { storage } from forge resolver

const resolver = new Resolver();

const cards = {};
const decks = {};
const groups = {};

const generateId = () => {
  return new Date().getTime().toString();
};

resolver.define('getModule', (req) => {
  const { moduleKey } = req.context;
  return { moduleKey };
});

resolver.define('createFlashcard', async (req) => {
  const {
    question_text,
    question_image,
    answer_text,
    answer_image,
    hint,
    tags
  } = req.payload;

  let owner = "@@";

  if(!req.context.accountId) {
    console.log("No account Id found :(");
  } else {
    owner = req.context.accountId;
  }

  if (!question_text || !answer_text) {
    return {
      success: false,
      error: 'invalid input: owner, question, answer',
    };
  }

  const cardId = generateId();
  const card = {
    question_text,
    question_image,
    answer_text,
    answer_image,
    hint,
    tags,
    owner,
    id: cardId,
  };
  cards[cardId] = card;

  return {
    success: true,
    id: card.id,
    card,
  };
});

resolver.define('getFlashcard', async ({ payload }) => {
  const { cardId } = payload;

  if (!cards[cardId]) {
    return {
      success: false,
      error: `no card found with id: ${cardId}`,
    };
  }

  return {
    success: true,
    card: cards[cardId],
  };
});

resolver.define('getAllFlashcards', async () => {
  const allFlashcards = Object.values(cards);
  return {
    success: true,
    cards: allFlashcards,
  };
});

// TODO: DECK
resolver.define('createDeck', async (req) => {
  const {
    title,
    description,
    flashcards // now: (NOT later)
  } = req.payload;

  let owner = "@@";

  if (!title) {
    return {
      success: false,
      error: 'invalid input: title and owner needed',
    };
  }

  if(!req.context.accountId) {
    console.log("No account Id found :(");
  } else {
    owner = req.context.accountId;
  }

  const deckId = generateId();
  const deck = {
    title,
    description,
    owner,
    id: deckId,
    flashcards: flashcards || [], // No flashcards means empty
  };
  decks[deckId] = deck;

  return {
    success: true,
    id: deck.id,
    deck,
  };
});

resolver.define('getDeck', async ({ payload }) => {
  const { deckId } = payload;

  if (!decks[deckId]) {
    return {
      success: false,
      error: `no deck found with id: ${deckId}`,
    };
  }

  return {
    success: true,
    deck: decks[deckId],
  };
});

resolver.define('getAllDecks', async () => {
  const allDecks = Object.values(decks);
  return {
    success: true,
    decks: allDecks,
  };
});

// TODO: GROUPS
resolver.define('createGroup', async (req) => {
  const {
    title,
    description,
    decks
  } = req.payload;

  if (!title) {
    return {
      success: false,
      error: 'invalid input: title and owner needed',
    };
  }

  let owner = "@@";
  
  if(!req.context.accountId) {
    console.log("No account Id found :(");
  } else {
    owner = req.context.accountId;
  }

  const groupId = generateId();
  const group = {
    title,
    description,
    owner,
    id: groupId,
    decks: decks || [] // if it is empty (FOR NOW)
  };
  groups[groupId] = group;

  return {
    success: true,
    id: group.id,
    group,
  };
});

resolver.define('getGroup', async ({ payload }) => {
  const { groupId } = payload;

  if (!groups[groupId]) {
    return {
      success: false,
      error: `no group found with id: ${groupId}`,
    };
  }

  return {
    success: true,
    group: groups[groupId],
  };
});

resolver.define('getAllGroups', async () => {
  const allGroups = Object.values(groups);
  return {
    success: true,
    groups: allGroups,
  };
});


resolver.define('deleteFlashcard', async ({ payload }) => {
  const { cardId } = payload;

  if (!cards[cardId]) {
    return {
      success: false,
      error: `no card found with id: ${cardId}`,
    };
  }

  // Delete the flashcard
  delete cards[cardId];

  return {
    success: true,
    message: `Flashcard with id: ${cardId} deleted successfully`,
  };
});

resolver.define('deleteDeck', async ({ payload }) => {
  const { deckId } = payload;

  if (!decks[deckId]) {
    return {
      success: false,
      error: `no deck found with id: ${deckId}`,
    };
  }

  // Delete the deck
  delete decks[deckId];

  return {
    success: true,
    message: `Deck with id: ${deckId} deleted successfully`,
  };
});

export const handler = resolver.getDefinitions();

