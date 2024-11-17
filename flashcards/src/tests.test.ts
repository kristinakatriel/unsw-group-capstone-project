// TESTING FILE

jest.mock('@forge/api', () => ({
  storage: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    query: jest.fn(() => ({
      where: jest.fn(() => ({
        getMany: jest.fn(),
      })),
    })),
  },
  startsWith: jest.fn((prefix) => prefix),
}));

jest.mock('./helpers', () => ({
  generateId: jest.fn(() => '12345'),
  getUserName: jest.fn(() => 'Freddie'),
  initUserData: jest.fn(),
  queryDecksById: jest.fn(() => Promise.resolve([])),
  queryTagsById: jest.fn(() => Promise.resolve([])),
}));

import {createFlashcard, updateFlashcard, deleteFlashcard, getFlashcard} from './cardResolvers';
import { storage } from '@forge/api';
import { Card, ResolverRequest } from './types';
import { Resolver } from 'dns';
import { startsWith } from '@forge/api';
import { resourceLimits } from 'worker_threads';
import { createDeck, updateDeck } from './deckResolvers';

describe('Flashcards Resolver Functions', () => {
  describe('createFlashcard', () => {
    it('Test 1 - Successful card creation', async () => {
      const req = {
        payload: { front: 'Question', back: 'Answer', hint: 'Hint', locked: false },
        context: { accountId: '123' },
      };
      const jestCardId = `c-${12345}`;

      const result = await createFlashcard(req); // result will be in the form of return body

      const createdCardData = {
        id: 'c-12345',
        front: 'Question',
        back: 'Answer',
        hint: 'Hint',
        locked: false,
        owner: '123',
        name: 'Freddie',
        // deckIds: []
      };

      expect(storage.set).toHaveBeenCalledWith(jestCardId, createdCardData);

      expect(result.success).toBe(true);
      expect(result.card).toEqual(createdCardData);
    });

    it('Test 2 - unsuccessful card creation - missing front', async () => {
      const req = {
        payload: { front: '', back: 'Answer', hint: 'Hint', locked: false },
        context: { accountId: '123' },
      };
      const jestCardId = `c-${12345}`;

      const result = await createFlashcard(req);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid input: front and back required');
    });

    it('Test 3 - unsuccessful card creation - missing back', async () => {
      const req = {
        payload: { front: 'Question', back: '', hint: 'Hint', locked: false },
        context: { accountId: '123' },
      };
      const jestCardId = `c-${12345}`;

      const result = await createFlashcard(req);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid input: front and back required');
    });
  });

  describe('updateFlashcard', () => {
    it('Test 1 - successful card update - unlocked card - same user', async () =>{
      const jestCardId = `c-${12345}`;

      const oldCard = {
        id: jestCardId,
        front: '1+1',
        back: '3',
        hint: 'use addition',
        owner: '123',
        name: 'Freddie',
        locked: false,
        deckIds: []
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(oldCard); // replicating storage get
      // (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const updatedCard = {
        ...oldCard,
        back: '2'
      }

      const req = {
        payload: { ...updatedCard },
        context: { accountId: '123' },
      }

      const result = await updateFlashcard(req);

      expect(storage.set).toHaveBeenCalledWith(jestCardId, updatedCard);
      expect(result.success).toBe(true);
      expect(result.card).toEqual(updatedCard);
    });

    it('Test 2 - unsuccessful card update - locked card - different user', async () =>{
      const jestCardId = `c-${12345}`;

      const oldCard = {
        id: jestCardId,
        front: '1+1',
        back: '3',
        hint: 'use addition',
        owner: '123',
        name: 'Freddie',
        locked: true,
        deckIds: []
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(oldCard); // replicating storage get
      // (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const updatedCard = {
        ...oldCard,
        back: '2'
      }

      const req = {
        payload: { ...updatedCard },
        context: { accountId: '1234' },
      }

      const result = await updateFlashcard(req);

      expect(result.success).toBe(false);
      expect(result.error).toEqual("Only owner can edit");
    });

    it('Test 3 - successful card update - unlocked card - different user', async () =>{
      const jestCardId = `c-${12345}`;

      const oldCard = {
        id: jestCardId,
        front: '1+1',
        back: '3',
        hint: 'use addition',
        owner: '123',
        name: 'Freddie',
        locked: false,
        deckIds: []
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(oldCard); // replicating storage get
      // (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const updatedCard = {
        ...oldCard,
        back: '2'
      }

      const req = {
        payload: { ...updatedCard },
        context: { accountId: '1234' },
      }

      const result = await updateFlashcard(req);

      expect(storage.set).toHaveBeenCalledWith(jestCardId, updatedCard);
      expect(result.success).toBe(true);
      expect(result.card).toEqual(updatedCard);
    });

    it('Test 4 - successful card update - locked card - same user', async () =>{
      const jestCardId = `c-${12345}`;

      const oldCard = {
        id: jestCardId,
        front: '1+1',
        back: '3',
        hint: 'use addition',
        owner: '123',
        name: 'Freddie',
        locked: true,
        deckIds: []
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(oldCard); // replicating storage get
      // (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const updatedCard = {
        ...oldCard,
        back: '2'
      }

      const req = {
        payload: { ...updatedCard },
        context: { accountId: '123' },
      }

      const result = await updateFlashcard(req);

      expect(storage.set).toHaveBeenCalledWith(jestCardId, updatedCard);
      expect(result.success).toBe(true);
      expect(result.card).toEqual(updatedCard);
    });

    it('Test 5 - unsuccessful card update - missing front', async () =>{
      const jestCardId = `c-${12345}`;

      const oldCard = {
        id: jestCardId,
        front: '1+1',
        back: '3',
        hint: 'use addition',
        owner: '123',
        name: 'Freddie',
        locked: false,
        deckIds: []
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(oldCard); // replicating storage get
      // (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const updatedCard = {
        ...oldCard,
        front: ''
      }

      const req = {
        payload: { ...updatedCard },
        context: { accountId: '123' },
      }

      const result = await updateFlashcard(req);

      // expect(storage.set).toHaveBeenCalledWith(jestCardId, updatedCard);
      expect(result.success).toBe(false);
      expect(result.error).toEqual("Invalid input: front and back required");
    });

    it('Test 6 - unsuccessful card update - missing back', async () =>{
      const jestCardId = `c-${12345}`;

      const oldCard = {
        id: jestCardId,
        front: '1+1',
        back: '3',
        hint: 'use addition',
        owner: '123',
        name: 'Freddie',
        locked: false,
        deckIds: []
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(oldCard); // replicating storage get
      // (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const updatedCard = {
        ...oldCard,
        back: ''
      }

      const req = {
        payload: { ...updatedCard },
        context: { accountId: '123' },
      }

      const result = await updateFlashcard(req);

      // expect(storage.set).toHaveBeenCalledWith(jestCardId, updatedCard);
      expect(result.success).toBe(false);
      expect(result.error).toEqual("Invalid input: front and back required");
    });
  });
  describe('deleteFlashcard', () => {
    it('Test 1 - successful deletion - unlocked card - same user', async () =>{
      const jestCardId = `c-${12345}`;

      const card = {
        id: jestCardId,
        front: '1+1',
        back: '3',
        hint: 'use addition',
        owner: '123',
        name: 'Freddie',
        locked: false,
        deckIds: []
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(card); // replicating storage get
      // (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const req = {
        payload: { cardId: card.id },
        context: { accountId: '123' },
      }

      const result = await deleteFlashcard(req);

      expect(storage.delete).toHaveBeenCalledWith(jestCardId);
      expect(result.success).toBe(true);
      expect(result.message).toEqual(`Deleted card with id: ${jestCardId}`);
    });
    
    it('Test 2 - successful deletion - unlocked card - different user', async () =>{
      const jestCardId = `c-${12345}`;

      const card = {
        id: jestCardId,
        front: '1+1',
        back: '3',
        hint: 'use addition',
        owner: '123',
        name: 'Freddie',
        locked: false,
        deckIds: []
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(card); // replicating storage get
      // (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const req = {
        payload: { cardId: card.id },
        context: { accountId: '1234' },
      }

      const result = await deleteFlashcard(req);

      expect(storage.delete).toHaveBeenCalledWith(jestCardId);
      expect(result.success).toBe(true);
      expect(result.message).toEqual(`Deleted card with id: ${jestCardId}`);
    });
    
    it('Test 3 - unsuccessful deletion - locked card - different user', async () =>{
      const jestCardId = `c-${12345}`;

      const card = {
        id: jestCardId,
        front: '1+1',
        back: '3',
        hint: 'use addition',
        owner: '123',
        name: 'Freddie',
        locked: true,
        deckIds: []
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(card); // replicating storage get
      // (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const req = {
        payload: { cardId: card.id },
        context: { accountId: '1234' },
      }

      const result = await deleteFlashcard(req);

      // expect(storage.delete).toHaveBeenCalledWith(jestCardId);
      expect(result.success).toBe(false);
      expect(result.error).toEqual("Only owner can delete");
    });

    it('Test 4 - successful deletion - locked card - same user', async () =>{
      const jestCardId = `c-${12345}`;

      const card = {
        id: jestCardId,
        front: '1+1',
        back: '3',
        hint: 'use addition',
        owner: '123',
        name: 'Freddie',
        locked: true,
        deckIds: []
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(card); // replicating storage get
      // (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const req = {
        payload: { cardId: card.id },
        context: { accountId: '123' },
      }

      const result = await deleteFlashcard(req);

      expect(storage.delete).toHaveBeenCalledWith(jestCardId);
      expect(result.success).toBe(true);
      expect(result.message).toEqual(`Deleted card with id: ${jestCardId}`);
    });
  });
  describe('getFlashcard', () => {
    it('Test 1 - successful get card', async () =>{
      const jestCardId = `c-${12345}`;

      const card = {
        id: jestCardId,
        front: '1+1',
        back: '3',
        hint: 'use addition',
        owner: '123',
        name: 'Freddie',
        locked: true,
        deckIds: []
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(card); // replicating storage get
      // (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const req = {
        payload: { cardId: card.id },
        context: { accountId: '123' },
      }

      const result = await getFlashcard(req);

      expect(result.success).toBe(true);
    });

    it('Test 2 - successful get card with different user', async () =>{
      const jestCardId = `c-${12345}`;

      const card = {
        id: jestCardId,
        front: '1+1',
        back: '3',
        hint: 'use addition',
        owner: '123',
        name: 'Freddie',
        locked: true,
        deckIds: []
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(card); // replicating storage get
      // (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const req = {
        payload: { cardId: card.id },
        context: { accountId: '1234' },
      }

      const result = await getFlashcard(req);

      expect(result.success).toBe(true);
    });
  });
});

describe('Deck Resolver Functions', () => {
  describe('Create Deck', () => {
    it('Test 1 - successful deck creation', async () => {
      const req = {
        payload: { title: 'Math', description: 'math deck', cards: [], locked: false },
        context: { accountId: '123' },
      };
      const jestDeckId = `d-${12345}`;

      const deck = {
        id: jestDeckId,
        title: 'Math',
        description: 'math deck',
        owner: '123',
        name: 'Freddie',
        cards: [],
        cardIds: [],
        size: 0,                 
        locked: false
      };

      const result = await createDeck(req);

      expect(storage.set).toHaveBeenCalledWith(jestDeckId, deck);

      expect(result.success).toBe(true);
      expect(result.deck).toEqual(deck);
    });

    it('Test 2 - unsuccessful deck creation - missing title', async () => {
      const req = {
        payload: { title: '', description: 'math deck', cards: [], locked: false },
        context: { accountId: '123' },
      };
      const jestDeckId = `d-${12345}`;

      const deck = {
        id: jestDeckId,
        title: '',
        description: 'math deck',
        owner: '123',
        name: 'Freddie',
        cards: [],
        cardIds: [],
        size: 0,                 
        locked: false
      };

      const result = await createDeck(req);

      // expect(storage.set).toHaveBeenCalledWith(jestDeckId, deck);

      expect(result.success).toBe(false);
      expect(result.error).toEqual("Invalid input: title required");
    });
  });

  describe('Update Deck', () => {
    it('Test 1 - successful update - unlocked deck - same user', async () => {
      const jestDeckId = `d-${12345}`;

      const oldDeck = {
        id: jestDeckId,
        title: 'Math',
        description: 'math deck',
        owner: '123',
        name: 'Freddie',
        cards: [],
        cardIds: [],
        size: 0,                 
        locked: false
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(oldDeck); // replicating storage get
      // (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const updatedDeck = {
        ...oldDeck,
        description: 'arithmetic deck'
      }

      const req = {
        payload: { ...updatedDeck },
        context: { accountId: '123' },
      }

      const result = await updateDeck(req);

      expect(storage.set).toHaveBeenCalledWith(jestDeckId, updatedDeck);
      expect(result.success).toBe(true);
      expect(result.deck).toEqual(updatedDeck);
    });

    it('Test 2 - successful update - unlocked deck - different user', async () => {
      const jestDeckId = `d-${12345}`;

      const oldDeck = {
        id: jestDeckId,
        title: 'Math',
        description: 'math deck',
        owner: '123',
        name: 'Freddie',
        cards: [],
        cardIds: [],
        size: 0,                 
        locked: false
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(oldDeck); // replicating storage get
      // (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const updatedDeck = {
        ...oldDeck,
        description: 'arithmetic deck'
      }

      const req = {
        payload: { ...updatedDeck },
        context: { accountId: '1234' },
      }

      const result = await updateDeck(req);

      expect(storage.set).toHaveBeenCalledWith(jestDeckId, updatedDeck);
      expect(result.success).toBe(true);
      expect(result.deck).toEqual(updatedDeck);
    });

    it('Test 3 - successful update - locked deck - same user', async () => {
      const jestDeckId = `d-${12345}`;

      const oldDeck = {
        id: jestDeckId,
        title: 'Math',
        description: 'math deck',
        owner: '123',
        name: 'Freddie',
        cards: [],
        cardIds: [],
        size: 0,                 
        locked: true
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(oldDeck); // replicating storage get
      // (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const updatedDeck = {
        ...oldDeck,
        description: 'arithmetic deck'
      }

      const req = {
        payload: { ...updatedDeck },
        context: { accountId: '123' },
      }

      const result = await updateDeck(req);

      expect(storage.set).toHaveBeenCalledWith(jestDeckId, updatedDeck);
      expect(result.success).toBe(true);
      expect(result.deck).toEqual(updatedDeck);
    });

    it('Test 4 - unsuccessful update - locked deck - different user', async () => {
      const jestDeckId = `d-${12345}`;

      const oldDeck = {
        id: jestDeckId,
        title: 'Math',
        description: 'math deck',
        owner: '123',
        name: 'Freddie',
        cards: [],
        cardIds: [],
        size: 0,                 
        locked: true
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(oldDeck); // replicating storage get
      // (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const updatedDeck = {
        ...oldDeck,
        description: 'arithmetic deck'
      }

      const req = {
        payload: { ...updatedDeck },
        context: { accountId: '1234' },
      }

      const result = await updateDeck(req);

      // expect(storage.set).toHaveBeenCalledWith(jestDeckId, updatedDeck);
      expect(result.success).toBe(false);
      expect(result.error).toEqual("Only owner can edit");
    });

    it('Test 5 - missing title', async () => {
      const jestDeckId = `d-${12345}`;

      const oldDeck = {
        id: jestDeckId,
        title: 'Math',
        description: 'math deck',
        owner: '123',
        name: 'Freddie',
        cards: [],
        cardIds: [],
        size: 0,                 
        locked: true
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(oldDeck); // replicating storage get
      // (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const updatedDeck = {
        ...oldDeck,
        title: ''
      }

      const req = {
        payload: { ...updatedDeck },
        context: { accountId: '123' },
      }

      const result = await updateDeck(req);

      // expect(storage.set).toHaveBeenCalledWith(jestDeckId, updatedDeck);
      expect(result.success).toBe(false);
      expect(result.error).toEqual("Invalid input: title required");
    });
  });
  describe('Get Deck', () => {
    it('Test 1 - Get deck - same user - locked deck', async () => {
      const jestDeckId = `d-${12345}`;

      const deck = {
        id: jestDeckId,
        title: 'Math',
        description: 'math deck',
        owner: '123',
        name: 'Freddie',
        cards: [],
        cardIds: [],
        size: 0,                 
        locked: true
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(deck); // replicating storage get
      // (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const req = {
        payload: { deckId: deck.id },
        context: { accountId: '123' },
      }

      const result = await getFlashcard(req);

      expect(result.success).toBe(true);
    });

    it('Test 2 - Get deck - different user - locked deck', async () => {
      const jestDeckId = `d-${12345}`;

      const deck = {
        id: jestDeckId,
        title: 'Math',
        description: 'math deck',
        owner: '123',
        name: 'Freddie',
        cards: [],
        cardIds: [],
        size: 0,                 
        locked: true
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(deck); // replicating storage get
      // (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const req = {
        payload: { deckId: deck.id },
        context: { accountId: '123' },
      }

      const result = await getFlashcard(req);

      expect(result.success).toBe(true);
    });
  });

  describe('Delete Deck', () => {
    it('Test 1 - successful delete - unlocked deck - same user', async () => {
      const jestDeckId = `c-${12345}`;

      const deck = {
        id: jestDeckId,
        title: 'Math',
        description: 'math deck',
        owner: '123',
        name: 'Freddie',
        cards: [],
        cardIds: [],
        size: 0,                 
        locked: false
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(deck); // replicating storage get
      // (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const req = {
        payload: { cardId: deck.id },
        context: { accountId: '123' },
      }

      const result = await deleteFlashcard(req);

      expect(storage.delete).toHaveBeenCalledWith(jestDeckId);
      expect(result.success).toBe(true);
      expect(result.message).toEqual(`Deleted card with id: ${jestDeckId}`);
    });

    it('Test 2 - successful delete - unlocked deck - different user', async () => {
      const jestDeckId = `c-${12345}`;

      const deck = {
        id: jestDeckId,
        title: 'Math',
        description: 'math deck',
        owner: '123',
        name: 'Freddie',
        cards: [],
        cardIds: [],
        size: 0,                 
        locked: false
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(deck); // replicating storage get
      // (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const req = {
        payload: { cardId: deck.id },
        context: { accountId: '1234' },
      }

      const result = await deleteFlashcard(req);

      expect(storage.delete).toHaveBeenCalledWith(jestDeckId);
      expect(result.success).toBe(true);
      expect(result.message).toEqual(`Deleted card with id: ${jestDeckId}`);
    });

    it('Test 3 - successful delete - locked deck - same user', async () => {
      const jestDeckId = `c-${12345}`;

      const deck = {
        id: jestDeckId,
        title: 'Math',
        description: 'math deck',
        owner: '123',
        name: 'Freddie',
        cards: [],
        cardIds: [],
        size: 0,                 
        locked: true
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(deck); // replicating storage get
      // (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const req = {
        payload: { cardId: deck.id },
        context: { accountId: '123' },
      }

      const result = await deleteFlashcard(req);

      expect(storage.delete).toHaveBeenCalledWith(jestDeckId);
      expect(result.success).toBe(true);
      expect(result.message).toEqual(`Deleted card with id: ${jestDeckId}`);
    });

    it('Test 4 - unsuccessful delete - locked deck - different user', async () => {
      const jestDeckId = `c-${12345}`;

      const deck = {
        id: jestDeckId,
        title: 'Math',
        description: 'math deck',
        owner: '123',
        name: 'Freddie',
        cards: [],
        cardIds: [],
        size: 0,                 
        locked: true
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(deck); // replicating storage get
      // (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const req = {
        payload: { cardId: deck.id },
        context: { accountId: '1234' },
      }

      const result = await deleteFlashcard(req);

      // expect(storage.delete).toHaveBeenCalledWith(jestDeckId);
      expect(result.success).toBe(false);
      expect(result.error).toEqual("Only owner can delete");
    });
  });
});