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
  
  jest.mock('../helpers', () => ({
    generateId: jest.fn(() => '12345'),
    getUserName: jest.fn(() => 'Freddie'),
    initUserData: jest.fn(),
    queryDecksById: jest.fn(() => Promise.resolve([])),
    queryTagsById: jest.fn(() => Promise.resolve([])),
  }));
  
  import {createFlashcard, updateFlashcard, deleteFlashcard, getFlashcard} from '../cardResolvers';
  import { storage } from '@forge/api';
  import { Card, ResolverRequest } from '../types';
  import { Resolver } from 'dns';
  import { startsWith } from '@forge/api';
  import { resourceLimits } from 'worker_threads';
  import { addCardToDeck, createDeck, updateDeck } from '../deckResolvers';
import { faMagicWandSparkles } from '@fortawesome/free-solid-svg-icons';

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
        payload: { cardId: deck.id },
        context: { accountId: '1234' },
      }

      const result = await deleteFlashcard(req);

      // expect(storage.delete).toHaveBeenCalledWith(jestDeckId);
      expect(result.success).toBe(false);
      expect(result.error).toEqual("Only owner can delete");
    });
  });

  describe('Add Card to Deck', () => {
    it('successful add card to deck', async() => {
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

      (storage.get as jest.Mock).mockResolvedValueOnce(card);
      (storage.get as jest.Mock).mockResolvedValueOnce(deck);

      const req = {
        payload: {deckId: jestDeckId, cardId: jestCardId},
        context: {accountId: '123'}
      }

      const result = await addCardToDeck(req);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Added card to deck")
    });
  });
});