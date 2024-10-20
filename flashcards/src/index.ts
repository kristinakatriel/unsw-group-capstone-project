import Resolver from '@forge/resolver';
import { storage } from '@forge/api';
import { Card, Deck, Tag } from './types';
import { v4 as uuidv4 } from 'uuid';
import api, { route } from '@forge/api';


const resolver = new Resolver();

const createId = () => uuidv4();


resolver.define('getModule', async (req) => {
  const { moduleKey } = req.context;
  return { moduleKey };
});


resolver.define('createFlashcard', async (req) => {
  const { question_text, question_image, answer_text, answer_image, hint, tags } = req.payload as Omit<Card, 'id' | 'owner'>;

  if (!question_text || !answer_text || !req.context.accountId) {
    return {
      success: false,
      error: 'Invalid input: question, answer, owner required',
    };
  }

  let name = "unknown"

  if (req.context.accountId) {
    let bodyData = `{
      "accountIds": [
        "${req.context.accountId}"
      ]
    }`;

    const response = await api.asApp().requestConfluence(route`/wiki/api/v2/users-bulk`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: bodyData
    });
    if (response.status === 200) {
      let data = await response.json();
      name = data.results[0].publicName;
    } else {
      name = "unknown2"
    };
  }

  const cardId = createId();
  const card = {
    question_text,
    question_image,
    answer_text,
    answer_image,
    hint,
    tags,
    owner: req.context.accountId,
    id: cardId,
    name: name
  };

  await storage.set(cardId, card);

  return {
    success: true,
    id: cardId,
    card: card,
  };
});


resolver.define('updateFlashcard', async (req) => {
    const { id, question_text, question_image, answer_text, answer_image, hint, tags, owner } = req.payload as Card;

    const existingCard = await storage.get(id) as Card | undefined;
    if (!existingCard) {
        return {
            success: false,
            error: 'Card not found',
        };
    }

    const updatedCard: Card = {
        ...existingCard,
        question_text: question_text || existingCard.question_text,
        question_image: question_image || existingCard.question_image,
        answer_text: answer_text || existingCard.answer_text,
        answer_image: answer_image || existingCard.answer_image,
        hint: hint || existingCard.hint,
        tags: tags || existingCard.tags,
        owner: owner || existingCard.owner,
    };

    await storage.set(id, updatedCard);

    return {
        success: true,
        card: updatedCard,
    };
});


resolver.define('deleteFlashcard', async (req) => {
    const { cardId } = req.payload;
  
    const card = await storage.get(cardId);
    if (!card) {
      return {
        success: false,
        error: `No card found with id: ${cardId}`,
      };
    }
  
    await storage.delete(cardId);
  
    return {
      success: true,
      message: `Deleted card with id: ${cardId}`,
    };
});
  

resolver.define('getFlashcard', async ({ payload }) => {
  const { cardId } = payload;

  const card = await storage.get(cardId) as Card | undefined;

  if (!card) {
    return {
      success: false,
      error: `No card found with id: ${cardId}`,
    };
  }

  return {
    success: true,
    card,
  };
});


resolver.define('getAllFlashcards', async () => {
  const allFlashcards: Card[] = [];

  const result = await storage.query().limit(25).getMany();

  result.results.forEach(({ value }) => {
    allFlashcards.push(value as Card);
  });

  return {
    success: true,
    cards: allFlashcards,
  };
});


resolver.define('createDeck', async (req) => {
  const { title, description, cards: flashcards } = req.payload as Omit<Deck, 'id'>;

  if (!title || !req.context.accountId) {
    return {
      success: false,
      error: 'Invalid input: title and owner required',
    };
  }

  let name = "unknown"

  if (req.context.accountId) {
    let bodyData = `{
      "accountIds": [
        "${req.context.accountId}"
      ]
    }`;

    const response = await api.asApp().requestConfluence(route`/wiki/api/v2/users-bulk`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: bodyData
    });
    if (response.status === 200) {
      let data = await response.json();
      name = data.results[0].publicName;
    } else {
      name = "unknown2"
    };
  }

  const deckId = createId();
  const newDeck: Deck = {
    id: deckId,
    title,
    description,
    owner: req.context.accountId,
    cards: flashcards || [],
    name: name
  };

  await storage.set(deckId, newDeck);

  return {
    success: true,
    id: deckId,
    deck: newDeck,
  };
});


resolver.define('updateDeck', async (req) => {
    const { id, title, description, owner, cards } = req.payload as Deck;

    const existingDeck = await storage.get(id) as Deck | undefined;
    if (!existingDeck) {
        return {
            success: false,
            error: 'Deck not found',
        };
    }

    const updatedDeck: Deck = {
        ...existingDeck,
        title: title || existingDeck.title,
        description: description || existingDeck.description,
        owner: owner || existingDeck.owner,
        cards: cards || existingDeck.cards,
    };

    await storage.set(id, updatedDeck);

    return {
        success: true,
        deck: updatedDeck,
    };
});


resolver.define('deleteDeck', async (req) => {
    const { deckId } = req.payload;

    const deck = await storage.get(deckId);
    if (!deck) {
      return {
        success: false,
        error: `No deck found with id: ${deckId}`,
      };
    }
  
    await storage.delete(deckId);
  
    return {
      success: true,
      message: `Deleted deck with id: ${deckId}`,
    };
});


resolver.define('getDeck', async ({ payload }) => {
  const { deckId } = payload;

  const deck = await storage.get(deckId) as Deck | undefined;

  if (!deck) {
    return {
      success: false,
      error: `No deck found with id: ${deckId}`,
    };
  }

  return {
    success: true,
    deck,
  };
});


resolver.define('getAllDecks', async () => {
    const allDecks: Deck[] = [];

    const queryResult = await storage.query().limit(25).getMany();
  
    queryResult.results.forEach(({ value }) => {
      allDecks.push(value as Deck);
    });
  
    return {
      success: true,
      decks: allDecks,
    };
});


resolver.define('addCardToDeck', async (req) => {
    const { deckId, cardId } = req.payload;

    const deck = await storage.get(deckId) as Deck | undefined;
    const card = await storage.get(cardId) as Card | undefined;

    if (!deck || !card) {
        return {
            success: false,
            error: 'Item not found',
        };
    }

    deck.cards = [...(deck.cards || []), card];

    await storage.set(deckId, deck);

    return {
        success: true,
        message: 'Added card to deck',
    };
});


resolver.define('removeCardFromDeck', async (req) => {
    const { deckId, cardId } = req.payload;

    const deck = await storage.get(deckId) as Deck | undefined;
    if (!deck) {
        return {
            success: false,
            error: 'Item not found',
        };
    }

    deck.cards = deck.cards?.filter(c => c.id !== cardId) || [];

    await storage.set(deckId, deck);

    return {
        success: true,
        message: 'Removed card from deck',
    };
});


export const handler = resolver.getDefinitions();
