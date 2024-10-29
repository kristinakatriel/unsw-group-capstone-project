import Resolver from '@forge/resolver';
import api, { QueryApi, route, startsWith, storage } from '@forge/api';
import { Card, Deck, Tag, User, GenFlashcardsPair, DynamicData,
         QuizResult, StudyResult, QuizSession, StudySession, QuizSessionCardStatus} from './types';
import { v4 as uuidv4 } from 'uuid';
import { basename } from 'path';
import { create } from 'domain';
import { Session } from 'inspector/promises';


const resolver = new Resolver();


resolver.define('getModule', async (req) => {
  const { moduleKey } = req.context;
  return { moduleKey };
});


const clearStorage = async (cursor: string = ''): Promise<void> => {
  const cursorRecursion = async (cursor: string | undefined): Promise<void> => {
    const query = storage.query().limit(10);
    if (cursor) {
      query.cursor(cursor);
    }

    const items = await query.getMany();
    for (const item of items.results) {
      await storage.delete(item.key);
      console.log("Deleted key:", item.key);
    }

    if (items.nextCursor) {
      await cursorRecursion(items.nextCursor);
    } else {
      console.log("Data clear!");
    }
  };

  await cursorRecursion(cursor);
};


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
  const { front, back, hint, locked } = req.payload;
  const accountId = req.context.accountId;

  console.log(front);
  console.log(back);

  if (!front || !back) {
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
    name: name,
    locked,
  };

  await storage.set(cardId, card);

  return {
    success: true,
    id: cardId,
    card: card,
  };
});


resolver.define('updateFlashcard', async (req) => {
    const { id, front, back, hint, owner, locked } = req.payload as Card;

    const existingCard = await storage.get(id) as Card | undefined;
    if (!existingCard) {
        return {
            success: false,
            error: 'Card not found'
        };
    }

    if (req.context.accountId && req.context.accountId != existingCard.owner && existingCard.locked) {
      return {
        success: false,
        error: "Only owner can edit"
      }
    }

    const updatedCard: Card = {
        ...existingCard,
        front: front || existingCard.front,
        back: back || existingCard.back,
        hint: hint || existingCard.hint,
        locked: locked || existingCard.locked
    };

    // Update the flashcard in storage
    await storage.set(id, updatedCard);
    // Update any decks containing this card
    const decksResult = await storage.query().where('key', startsWith('d-')).getMany();
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

    const card = await storage.get(cardId);
    if (!card) {
      return {
        success: false,
        error: `No card found with id: ${cardId}`
      };
    }

    if (req.context.accountId && req.context.accountId != card.owner && card.locked) {
      return {
        success: false,
        error: "Only owner can delete"
      }
    }

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

  const query = await storage.query().where('key', startsWith('c-')).limit(50).getMany();

  query.results.forEach(({ value }) => {
      allFlashcards.push(value as Card);
  });

  return {
    success: true,
    cards: allFlashcards,
  };
});


resolver.define('createDeck', async (req) => {
  const { title, description, cards: flashcards, locked} = req.payload as Omit<Deck, 'id'>;
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
    size: 0,
    locked
  };

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

    if (req.context.accountId && req.context.accountId != existingDeck.owner && existingDeck.locked) {
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

    if (req.context.accountId && req.context.accountId != deck.owner && deck.locked) {
      return {
        success: false,
        error: "Only owner can delete"
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

    const query = await storage.query().where('key', startsWith('d-')).limit(50).getMany();

    query.results.forEach(({ value }) => {
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

    if (deck.cardIds && deck.cardIds.includes(cardId)) {
          return {
              success: false,
              error: 'Item already included',
          };
      }

    if (req.context.accountId && req.context.accountId != deck.owner && deck.locked) {
      return {
        success: false,
        error: "Only owner can edit"
      }
    }

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

    if (req.context.accountId && req.context.accountId != deck.owner && deck.locked) {
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


// adding generating q&a through ai flashcards
resolver.define('generateQA', async (req) => {
  // get text
  const { text } = req.payload;
  console.log("testing tunnel");
  if (text.length <= 2) {
    return {
      success: false,
      error: 'Too few words; select more text to generate flashcards.'
    }
  }

  console.log("calling url thing");
  // get the flashcards generated using the external url
  const response = await fetch("https://marlin-excited-gibbon.ngrok-free.app/generate_qa", {  // the url which we need to generate the flashcards
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  console.log("printing responce", response);

  const data = await response.json();
  if (!response.ok) {
    return {
      success: false,
      error: 'Failed to generate Q&A from text',
    };
  }
  // this returns a json of q&a pairs, which can be displayed in the context menu
  return {
    success: true,
    data: data
  };
});


resolver.define('addGeneratedFlashcards', async (req) => {
  const { qAPairs, deckTitle, siteUrl, siteName } = req.payload;
  const accountId = req.context.accountId;

  if (!deckTitle || deckTitle.trim() === "") {
    return { success: false, error: 'Deck title is required.' };
  }

  initUserData(accountId);
  const user = await getUserName(accountId);

  let newDeck: Deck | null = {
      id: `d-${generateId()}`,
      owner: accountId,
      name: user,
      title: deckTitle,
      description: `Fetched from ${siteUrl} under the name ${siteName}.`,
      cards:[],
      size: 0,
      locked: false
  };

  const cardIds: string[] = [];
   // Use Promise.all to ensure all flashcards are stored asynchronously
   const flashcardPromises = qAPairs.map(async (pair: GenFlashcardsPair) => {
    const { question, answer } = pair;
    // Check for missing question or answer
    if (!question || !answer) {
      return {
        success: false,
        error: 'Cannot add flashcard as question or answer are missing',
      };
    }
    // Create a new flashcard object
    const cardId = `c-${generateId()}`;
    const newCard = {
      id: cardId,
      front: question,
      back: answer,
      hint: "",
      owner: accountId,
      name: user
    };
    cardIds.push(cardId);
    // Store the new flashcard in storage
    await storage.set(cardId, newCard);
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


// COMING SOON

resolver.define('startStudySession', async (req) => {
  const { deckId } = req.payload;

  const quizDeck = await storage.get(deckId) as Deck | undefined;

    if (!quizDeck) {
        return {
            success: false,
            error: 'Deck Not found',
        };
    } 

    // create an array of status
    const totalCards = quizDeck.cards?.length

    // check if length = 0
    if (totalCards == 0) {
      return {
        success: false, 
        error: 'cannot enter quiz mode if deck has no cards'
      }
    }
    const statusPerCardArray: QuizSessionCardStatus[] = Array(totalCards).fill(QuizSessionCardStatus.Incomplete);

    // creating a new session
    const sessionId = `q-${generateId()}`;
    const newSession: QuizSession = {
      deckInSession: quizDeck,
      totalCardCount: totalCards,
      currentCardIndex: 0,
      sessionStartTime: Date.now(),
      statusPerCard: statusPerCardArray
    }

    await storage.set(sessionId, newSession);

    // let us return the first card and the session
    return {
      success: true,
      firstCardId: quizDeck.cards?.[0].id,
      session: newSession,
      firstIndex: 0
    }
});


resolver.define('updateCardStatus', async (req) => {
  const { currentIndex, incorrect, correct, skip, hint, sessionId } = req.payload;
  
  const session = await storage.get(sessionId);
    if (!session) {
      return {
        success: false,
        error: `No session found with id: ${sessionId}`
      };
    }

  // check if current index is less than total length
  if (currentIndex >= session.totalCardCount) {
    return {
      success: false,
      error: 'out of index'
    }
  }

  if (skip) {
    session.statusPerCard[currentIndex] = QuizSessionCardStatus.Skip
  } else if (hint) {
    session.statusPerCard[currentIndex] = QuizSessionCardStatus.Hint
  } else if (correct) {
    session.statusPerCard[currentIndex] = QuizSessionCardStatus.Correct
  } else if (incorrect) {
    session.statusPerCard[currentIndex] = QuizSessionCardStatus.Incorrect
  }

  // now let us return the next card
  // check if quiz has finished
  const newIndex = currentIndex + 1;
  if (newIndex == session.totalCardCount) {
    return {
      success: true,
      message: 'quiz is finished'
    }
  } else {
    // quiz hasnt finished so we return the next card
    return {
      success: true,
      nextIndex: newIndex,
      nextCardId: session.deckInSession.cards?.[newIndex].id
    }
  }
}); 

resolver.define('endStudySession', async (req) => {
  const { sessionId } = req.payload;

  const session = await storage.get(sessionId);
    if (!session) {
      return {
        success: false,
        error: `No session found with id: ${sessionId}`
      };
    }

  // create a new quiz result object
  const newQuizResult: QuizResult = {
    deckInArchive: session.deckInSession,
    statusPerCard: session.statusPerCard,
    countCards: session.totalCardCount,
    countIncomplete: session.statusPerCard.filter((status: QuizSessionCardStatus) => status === QuizSessionCardStatus.Incomplete).length,
    countIncorrect: session.statusPerCard.filter((status: QuizSessionCardStatus) => status === QuizSessionCardStatus.Incorrect).length,
    countCorrect: session.statusPerCard.filter((status: QuizSessionCardStatus) => status === QuizSessionCardStatus.Correct).length,
    countHints: session.statusPerCard.filter((status: QuizSessionCardStatus) => status === QuizSessionCardStatus.Hint).length,
    countSkip: session.statusPerCard.filter((status: QuizSessionCardStatus) => status === QuizSessionCardStatus.Skip).length,
  }
});

// resolver.define('startQuizSession', async (req) => {});
// resolver.define('endQuizSession', async (req) => {});



export const handler = resolver.getDefinitions();
