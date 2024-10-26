import Resolver from '@forge/resolver';
import api, { route, storage } from '@forge/api';
import { Card, Deck, GenFlashcardsPair, Tag } from './types';
import { v4 as uuidv4 } from 'uuid';
import { basename } from 'path';
import { create } from 'domain';

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
      error: 'Invalid Input: Please enter Question and Answer.',
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
    const { id, question_text, question_image, answer_text, answer_image, hint, tags } = req.payload as Card;

    const existingCard = await storage.get(id) as Card | undefined;
    if (!existingCard) {
        return {
            success: false,
            error: 'Card not found',
        };
    }

    if (req.context.accountId && req.context.accountId != existingCard.owner) {
      return {
        success: false,
        error: "Permission Denied: Only owner can edit this flashcard."
      }
    }

    const updatedCard: Card = {
        ...existingCard,
        question_text: question_text || existingCard.question_text,
        question_image: question_image || existingCard.question_image,
        answer_text: answer_text || existingCard.answer_text,
        answer_image: answer_image || existingCard.answer_image,
        hint: hint || existingCard.hint,
        tags: tags || existingCard.tags,
        owner: existingCard.owner,
    };

    await storage.set(id, updatedCard);

    // setting the deck with the updated flashcard
    // Update the flashcard in storage
    await storage.set(id, updatedCard);

    // Update any decks containing this card
    const decksResult = await storage.query().limit(25).getMany();
    if (!decksResult) {
      return {
        success: true,
        card: updatedCard,
      };
    }

    for (const { value } of decksResult.results) {
        const deck = value as Deck;

        // Check if the deck contains the updated card
        const cardIndex = deck.cards?.findIndex(c => c.id === id);
        // if it does contain the card + the deck has cards (redundant btw might need to delete later)
        if (cardIndex !== undefined && cardIndex >= 0 && deck.cards) {
          // Replace the card in the deck with current card
            deck.cards[cardIndex] = updatedCard;

            // Save the updated deck
            await storage.set(deck.id, deck);
        }
    }

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

    if (req.context.accountId && req.context.accountId != card.owner) {
      return {
        success: false,
        error: "Permission Denied: Only owner can delete this flashcard"
      }
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
  // const result = await storage.query()
  // .filter((item) => item.type === 'Card') // Adjust to your storage schema
  // .limit(25)
  // .getMany();
  // Log the result from storage query
  console.log('Storage query result:', result);


  result.results.forEach(({ value }) => {
    console.log('value:', value);
    if ('answer_text' in value) {

      allFlashcards.push(value as Card);
    }
  });

  console.log('Fetched flashcards:', allFlashcards);


  return {
    success: true,
    cards: allFlashcards,
  };
});

// adding generating q&a through ai flashcards
resolver.define('generateQA', async (req) => {
  // get text
  const { text } = req.payload;

  // get the flashcards generated using the external url
  const response = await fetch("https://marlin-excited-gibbon.ngrok-free.app/generate_qa", {  // the url which we need to generate the flashcards
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  const data = await response.json();
  if (!response.ok) {
    return {
      success: false,
      error: 'Failed to generate Q&A from text',
    };
  }
  // this returns a json of q&a pairs, which can be displayed in the context menu
  return data;
});

resolver.define('addGeneratedFlashcards', async (req) => {
  const { qAPairs, deckTitle, siteUrl, siteName } = req.payload;
  let name = "unknown";

  // Retrieve the user's name if accountId is available
  if (req.context.accountId) {
    const bodyData = JSON.stringify({ accountIds: [req.context.accountId] });
    const response = await api.asApp().requestConfluence(route`/wiki/api/v2/users-bulk`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: bodyData
    });

    if (response.status === 200) {
      const data = await response.json();
      name = data.results[0]?.publicName || "unknown";
    }
  }

  let newDeck: Deck | null = null;

  if (deckTitle) {
    const deckId = createId(); // Generate a unique ID for the new deck
    newDeck = {
      id: deckId,
      owner: req.context.accountId,
      name: name,
      title: deckTitle,
      description: `Fetched from ${siteUrl} under the name ${siteName}.`,
      cards: [] // Initialize with an empty array for flashcards
    };
  }

  const cardIds:string[] = [];
  // Use Promise.all to ensure all flashcards are stored asynchronously
  const flashcardPromises = qAPairs.map(async (pair: GenFlashcardsPair) => {
    const { question, answer } = pair;

    // Check for missing question or answer
    if (!question || !answer) {
      return {
        success: false,
        error: 'Cannot add flashcard as it has no question or answer',
      };
    }

    // Create a new flashcard object
    const cardId = createId();
    const newFlashcard = {
      id: cardId,
      name: name,
      question_text: question,
      question_image: "", // Placeholder if no images are available
      answer_text: answer,
      answer_image: "", // Placeholder if no images are available
      hint: "", // Optional, can be adjusted
      tags: [],
      owner: req.context.accountId
    };
    cardIds.push(cardId);
    // Store the new flashcard in storage
    await storage.set(cardId, newFlashcard);
    return { success: true, id: cardId }; // return success and cardId
  });

  // Wait for all flashcards to be created
  const results = await Promise.all(flashcardPromises);

  // If a new deck was created, retrieve flashcards by their IDs and add them to the deck
  if (newDeck && newDeck.cards) {
    for (const cardId of cardIds) {
      const flashcard = await storage.get(cardId); // Retrieve the flashcard from storage
      if (flashcard) {
        newDeck.cards.push(flashcard); // Add the flashcard object to the new deck
      }
    }
    
    // Store the new deck in storage
    await storage.set(newDeck.id, newDeck);
  }

  return {
    success: true,
    createdFlashcards: results.filter(result => result.success).length
  };
});


resolver.define('createDeck', async (req) => {
  const { title, description, cards: flashcards } = req.payload as Omit<Deck, 'id'>;

  if (!title || !req.context.accountId) {
    return {
      success: false,
      error: 'Invalid Input: Please input the Title.',
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

    // Log the incoming request payload

    const existingDeck = await storage.get(id) as Deck | undefined;

    // Log if the deck exists or not
    if (!existingDeck) {

        return {
            success: false,
            error: 'Deck Not found',
        };
    }

    // Check ownershi

    if (req.context.accountId && req.context.accountId != existingDeck.owner) {
      return {
        success: false,
        error: "Permission Denied: Only owner can edit this deck."
      }
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

    if (req.context.accountId && req.context.accountId != deck.owner) {
      return {
        success: false,
        error: "Permission Denied: Only owner can delete this deck."
      }
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

    if (req.context.accountId && req.context.accountId != deck.owner) {
      return {
        success: false,
        error: "Permission Denied: Only owner can add the flashcard to this deck."
      }
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

    if (req.context.accountId && req.context.accountId != deck.owner) {
      return {
        success: false,
        error: "Permission Denied: Only owner can remove this flashcard from deck."
      }
    }

    deck.cards = deck.cards?.filter(c => c.id !== cardId) || [];

    await storage.set(deckId, deck);

    return {
        success: true,
        message: 'Removed card from deck',
    };
});



export const handler = resolver.getDefinitions();
