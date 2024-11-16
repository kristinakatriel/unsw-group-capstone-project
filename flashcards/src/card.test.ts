jest.mock('@forge/api', () => ({
  storage: {
    get: jest.fn(),
    set: jest.fn(),
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
  initUserData: jest.fn()
}));

import {createFlashcard, updateFlashcard} from './cardResolvers';
import { storage } from '@forge/api';
import { Card, ResolverRequest } from './types';
import { Resolver } from 'dns';
import { startsWith } from '@forge/api';

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
        name: 'Freddie'
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
    it('Test 1 - successful card update', async () =>{
      const jestCardId = `c-${12345}`;

      const oldCard = {
        id: jestCardId,
        front: '1+1',
        back: '3',
        hint: 'use addition',
        owner: '123',
        name: 'Freddie',
        locked: false,
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(oldCard); // replicating storage get
      (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

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

    it('Test 2 - unsuccessful card update: locked card', async () =>{
      const jestCardId = `c-${12345}`;

      const oldCard = {
        id: jestCardId,
        front: '1+1',
        back: '3',
        hint: 'use addition',
        owner: '123',
        name: 'Freddie',
        locked: true,
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(oldCard); // replicating storage get
      (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

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

    it('Test 3 - successful card update: unlocked card but different user is trying to edit', async () =>{
      const jestCardId = `c-${12345}`;

      const oldCard = {
        id: jestCardId,
        front: '1+1',
        back: '3',
        hint: 'use addition',
        owner: '123',
        name: 'Freddie',
        locked: false,
      };

      (storage.get as jest.Mock).mockResolvedValueOnce(oldCard); // replicating storage get
      (storage.set as jest.Mock).mockResolvedValue(undefined); // replicating storage set

      const updatedCard = {
        ...oldCard,
        back: '2'
      }

      const req = {
        payload: { ...updatedCard },
        context: { accountId: '1234' },
      }

      const result = await updateFlashcard(req);

      expect(result.success).toBe(true);
      expect(result.card).toEqual(updatedCard);
    });
  });
});