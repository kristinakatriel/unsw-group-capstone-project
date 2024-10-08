import Resolver from '@forge/resolver';
// import { storage } from forge deploy —environment development;

const resolver = new Resolver();

const cards = {};
const decks = {}

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
    tags, 
    owner 
  } = req.payload;

  if (!question_text || !answer_text || !owner) {
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

// TODO: use for . um. deck and groups
resolver.define('createDeck', async (req) => {
  const { 
    title,
    description,
    owner
    // flashcards (later)
  } = req.payload;

  if (!title || !description || !owner) {
    return {
      success: false,
      error: 'invalid input: title and description needed',
    };
  }

  const deckId = generateId();
  const deck = {
    title,
    description,
    owner,
    id: deckId,
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
      error: `no card found with id: ${cardId}`,
    };
  }

  return {
    success: true,
    card: cards[cardId],
  };
});

resolver.define('getAllDecks', async () => {
  const allDecks = Object.values(decks);
  return {
    success: true,
    cards: allDecks,
  };
});

export const handler = resolver.getDefinitions();

