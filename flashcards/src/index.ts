import Resolver from '@forge/resolver';
import api, { route, storage } from '@forge/api';
import { Card, Deck, Tag } from './types';
import { v4 as uuidv4 } from 'uuid';

const resolver = new Resolver();

const createId = () => uuidv4();

// get user name
// const getUserName = async (accountId: string) => {
//   // Construct the body data
//   const bodyData = {
//     accountIds: [accountId],  // Confluence expects an array of account IDs
//   };

//   // Make the API call to fetch the user info
//   const response = await api.asApp().requestConfluence(route`/wiki/rest/api/user/bulk`, {
//     method: 'POST',
//     headers: {
//       'Accept': 'application/json',
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(bodyData),
//   });

//   // Check if the response is okay
//   if (!response.ok) {
//     throw new Error(`Failed to fetch user information: ${response.status} ${response.statusText}`);
//   }

//   const data = await response.json();

//   // Return the `publicName` of the user if found
//   const user = data.results[0];  // Assuming only one accountId is passed, get the first result
//   if (!user) {
//     throw new Error('User not found');
//   }

//   return user.publicName;
// };

resolver.define('getModule', async (req) => {
  const { moduleKey } = req.context;
  return { moduleKey };
});


resolver.define('createFlashcard', async (req) => {
  const { question_text, question_image, answer_text, answer_image, hint, tags, owner } = req.payload as Omit<Card, 'id'>;
  // let userName = getUserName(req.context.accountId);

  if (!question_text || !answer_text || !owner) {
    return {
      success: false,
      error: 'Invalid input: question, answer, owner required',
    };
  }

  const cardId = createId();
  const newCard: Card = {
    id: cardId,
    question_text,
    question_image,
    answer_text,
    answer_image,
    hint,
    tags: tags || [],
    owner,
    // owner_name: userName
  };

  await storage.set(cardId, newCard);

  return {
    success: true,
    id: cardId,
    card: newCard,
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
  // alternative solution: if the q&a pairs are not meant to be shown for the user to select,
  // then it can be created as flashcards right away
  // const generatedFlashcards = await response.json();  // Q&A pairs

  // // Store the created flashcards in the system
  // const createdFlashcards = [];
  // for (const { question, answer } of generatedFlashcards) {
  //   const cardId = createId();
  //   const newCard = {
  //     id: cardId,
  //     question_text: question,
  //     answer_text: answer,
  //     owner: req.context.accountId,
  //     tags: [],  // you can extend this as needed
  //     hint: '',
  //     question_image: null,  // assuming no images in this case
  //     answer_image: null,
  //   };

  //   // Save the new card in storage
  //   await storage.set(cardId, newCard);
  //   createdFlashcards.push(newCard);
  // }

  // return {
  //   success: true,
  //   cards: createdFlashcards,
  // };
});


resolver.define('createDeck', async (req) => {
  const { title, description, owner, cards: flashcards } = req.payload as Omit<Deck, 'id'>;

  if (!title || !owner) {
    return {
      success: false,
      error: 'Invalid input: title and owner required',
    };
  }

  const deckId = createId();
  const newDeck: Deck = {
    id: deckId,
    title,
    description,
    owner,
    cards: flashcards || [],
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
