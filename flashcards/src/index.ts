import Resolver from '@forge/resolver';
import api, { route, storage } from '@forge/api';
import { Card, Deck, Tag, User, GenFlashcardsPair, DynamicData, 
         QuizResult, StudyResult, QuizSession, StudySession
 } from './types';
import { v4 as uuidv4 } from 'uuid';
import { basename } from 'path';
import { create } from 'domain';


const resolver = new Resolver();


resolver.define('getModule', async (req) => {
  const { moduleKey } = req.context;
  return { moduleKey };
});


const generateId = () => uuidv4();


const getUserName = async (accountId: string) => {
  if (!accountId) {
    return "unknown";
  }

  const bodyData = JSON.stringify({
    accountIds: [accountId],
  });

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
    return data.results?.[0]?.publicName || "unknown";
  } else {
    return "unknown";
  }
};


const initUserData = async (accountId: string) => {
  const userDataKey = `u-${accountId}`;
  const existingUser = await storage.get(userDataKey);

  if (!existingUser) {    
    const newUser = {
      id: userDataKey,
      deckIds: [],
      cardIds: []
    };
    
    await storage.set(userDataKey, newUser);
    return newUser;
  }

  return existingUser;
};


resolver.define('createFlashcard', async (req) => {
  const { front, back, hint } = req.payload as Omit<Card, 'id' | 'owner' | 'name'>;
  const accountId = req.context.accountId;

  console.log("MKM TEST CREATE");

  if (!front || !back || !accountId) {
    return {
      success: false,
      error: 'Invalid input: front and back required',
    };
  }

  initUserData(accountId);
  const name = await getUserName(accountId);

  const cardId = `c-${generateId()}`;
  const card = {
    id: cardId,
    front,
    back,
    hint,
    owner: accountId,
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
    const { id, front, back, hint, owner } = req.payload as Card;

    const existingCard = await storage.get(id) as Card | undefined;
    if (!existingCard) {
        return {
            success: false,
            error: 'Card not found'
        };
    }

    // if (req.context.accountId && req.context.accountId != owner) {
    //   return {
    //     success: false,
    //     error: "Only owner can edit"
    //   }
    // }

    const updatedCard: Card = {
        ...existingCard,
        front: front || existingCard.front,
        back: back || existingCard.back,
        hint: hint || existingCard.hint
    };

    // TODO ***

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
        card: updatedCard
    };
});


resolver.define('deleteFlashcard', async (req) => {
    const { cardId } = req.payload;

    const queryResult = await storage.query().limit(25).getMany();
  
    for (const entity of queryResult.results) {
      await storage.delete(entity.key);
    }

    const card = await storage.get(cardId);
    if (!card) {
      return {
        success: false,
        error: `No card found with id: ${cardId}`
      };
    }

    // if (req.context.accountId && req.context.accountId != card.owner) {
    //   return {
    //     success: false,
    //     error: "Only owner can delete"
    //   }
    // }

    console.log("MKM TEST DELETE");

    await storage.delete(cardId);

    return {
      success: true,
      message: `Deleted card with id: ${cardId}`
    };
});


resolver.define('getFlashcard', async ({ payload }) => {
  const { cardId } = payload;

  const card = await storage.get(cardId) as Card | undefined;
  if (!card) {
    return {
      success: false,
      error: `No card found with id: ${cardId}`
    };
  }

  return {
    success: true,
    card
  };
});


resolver.define('getAllFlashcards', async () => {
  const allFlashcards: Card[] = [];

  // TODO ***
  const result = await storage.query().limit(25).getMany();

  // console.log('Storage query result:', result);

  result.results.forEach(({ value }) => {
    // console.log('value:', value);
    if ('back' in value) {
      allFlashcards.push(value as Card);
    }
  });

  // console.log('Fetched flashcards:', allFlashcards);

  return {
    success: true,
    cards: allFlashcards,
  };
});


resolver.define('createDeck', async (req) => {
  const { title, description, cards: flashcards } = req.payload as Omit<Deck, 'id'>;
  const accountId = req.context.accountId;

  if (!title || !accountId) {
    return {
      success: false,
      error: 'Invalid input: title required',
    };
  }

  initUserData(accountId);
  const user = await getUserName(accountId);

  const deckId = `d-${generateId()}`;
  const deck: Deck = {
    id: deckId,
    title,
    description,
    owner: accountId,
    name: user,
    cards: flashcards || [], // todo: remove once frontend refactored
    cardIds: [0],            // todo: implement card id references
    size: 0
  };

  // TODO ***
  await storage.set(deckId, deck);

  return {
    success: true,
    id: deckId,
    deck: deck,
  };
});


resolver.define('updateDeck', async (req) => {
    const { id, title, description, owner, cards } = req.payload as Deck;

    const existingDeck = await storage.get(id) as Deck | undefined;

    if (!existingDeck) {
        return {
            success: false,
            error: 'Deck Not found',
        };
    }

    if (req.context.accountId && req.context.accountId != existingDeck.owner) {
      return {
        success: false,
        error: "Only owner can edit"
      }
    }

    const updatedDeck: Deck = {
        ...existingDeck,
        title: title || existingDeck.title,
        description: description || existingDeck.description,
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

    // if (req.context.accountId && req.context.accountId != deck.owner) {
    //   return {
    //     success: false,
    //     error: "Only owner can delete"
    //   }
    // }

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

    // TODO ***
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

    // if (req.context.accountId && req.context.accountId != deck.owner) {
    //   return {
    //     success: false,
    //     error: "Only owner can edit"
    //   }
    // }

    deck.cards = [...(deck.cards || []), card];          // todo: remove once frontend refactored
    deck.cardIds = [...(deck.cardIds || []), cardId];

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
        error: "Only owner can edit"
      }
    }

    deck.cards = deck.cards?.filter(c => c.id !== cardId) || [];  // todo: remove once frontend refactored
    deck.cardIds = deck.cardIds?.filter(id => id !== cardId) || [];

    await storage.set(deckId, deck);

    return {
        success: true,
        message: 'Removed card from deck',
    };
});


///////////////////////////////////////////////////////////////////////////////////


// // adding generating q&a through ai flashcards
// resolver.define('generateQA', async (req) => {
//   // get text
//   const { text } = req.payload;

//   if (text.length <= 2) {
//     return {
//       success: false,
//       error: 'Too few words; select more text to generate flashcards.'
//     }
//   }

//   // get the flashcards generated using the external url
//   const response = await fetch("https://marlin-excited-gibbon.ngrok-free.app/generate_qa", {  // the url which we need to generate the flashcards
//     method: 'POST',
//     headers: {
//       Accept: 'application/json',
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ text }),
//   });

//   const data = await response.json();
//   if (!response.ok) {
//     return {
//       success: false,
//       error: 'Failed to generate Q&A from text',
//     };
//   }
//   // this returns a json of q&a pairs, which can be displayed in the context menu
//   return data;
// });

// resolver.define('addGeneratedFlashcards', async (req) => {
//   const { qAPairs, deckTitle, siteUrl, siteName } = req.payload;
//   const accountId = req.context.accountId;

//   if (!deckTitle || deckTitle.trim() === "") {
//     return { success: false, error: 'Deck title is required.' };
//   }

//   initUserData(accountId);
//   const user = await getUserName(accountId);

//   const cardIds: string[] = [];

//   let newDeck: Deck | null = {
//       id: `d-${generateId()}`,
//       owner: accountId,
//       name: user,
//       title: deckTitle,
//       description: `Fetched from ${siteUrl} under the name ${siteName}.`,
//       cards:[],
//       size: 0
//   };


//   // Use Promise.all to ensure all flashcards are stored asynchronously
//   const flashcardPromises = qAPairs.map(async (pair: GenFlashcardsPair) => {
//     const { question, answer } = pair;
//     // Check for missing question or answer
//     if (!question || !answer) {
//       return {
//         success: false,
//         error: 'Cannot add flashcard as it has no question or answer',
//       };
//     }
//     // Create a new flashcard object
//     const cardId = `c-${generateId()}`;
//     const newCard = {
//       id: cardId,
//       front: question,
//       back: answer,
//       hint: "",
//       owner: accountId,
//       name: user
//     };
//     cardIds.push(cardId);
//     // Store the new flashcard in storage
//     await storage.set(cardId, newCard);
//     return { success: true, id: cardId }; // return success and cardId
//   });

//   const results = await Promise.all(flashcardPromises);

//   // Add flashcards to the deck if newDeck is not null
//   if (newDeck) {
//     const cards = await Promise.all(cardIds.map((id) => storage.get(id)));
//     newDeck.cards = cards.filter(Boolean);  // Ensure cards are valid
//     await storage.set(newDeck.id, newDeck);
//   }

//   // // Wait for all flashcards to be created
//   // const results = await Promise.all(flashcardPromises);
//   // // If a new deck was created, retrieve flashcards by their IDs and add them to the deck
//   // if (newDeck && newDeck.cards) {
//   //   for (const cardId of cardIds) {
//   //     const flashcard = await storage.get(cardId); // Retrieve the flashcard from storage
//   //     if (flashcard) {
//   //       newDeck.cards.push(flashcard); // Add the flashcard object to the new deck
//   //     }
//   //   }
    
//   //   // Store the new deck in storage
//   //   await storage.set(newDeck.id, newDeck);
//   // }

//   return {
//     success: true,
//     createdFlashcards: results.filter(result => result.success).length
//   };
// });





// adding generating q&a through ai flashcards
resolver.define('generateQA', async (req) => {
  // get text
  const { text } = req.payload;

  if (text.length <= 2) {
    return {
      success: false,
      error: 'Too less; Select more words to create flashcards for.'
    }
  }

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
    const deckId = `d-${generateId()}`; // Generate a unique ID for the new deck
    newDeck = {
      id: deckId,
      owner: req.context.accountId,
      name: name,
      title: deckTitle,
      description: `Fetched from ${siteUrl} under the name ${siteName}.`,
      cards: [], // Initialize with an empty array for flashcards
      size: 0
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
    const cardId = `c-${generateId()}`;
    const newFlashcard = {
      id: cardId,
      name: name,
      front: question,
      back: answer,
      hint: "", // Optional, can be adjusted
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


///////////////////////////////////////////////////////////////////////////////////



// resolver.define('startStudySession', async (req) => {});
// resolver.define('endStudySession', async (req) => {});

// resolver.define('startQuizSession', async (req) => {});
// resolver.define('endQuizSession', async (req) => {});



export const handler = resolver.getDefinitions();
