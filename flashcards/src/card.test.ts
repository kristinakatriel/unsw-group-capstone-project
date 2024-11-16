jest.mock('@forge/api', () => ({
  storage: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

jest.mock('./helpers', () => ({
  generateId: jest.fn(() => '12345'),
  getUserName: jest.fn(() => 'Test User'),
  initUserData: jest.fn()
}));

import {createFlashcard} from './cardResolvers';
import { storage } from '@forge/api';
import { Card, ResolverRequest } from './types';
import { Resolver } from 'dns';

describe('Flashcards Resolver Functions', () => {
  describe('createFlashcard', () => {
    it('Successful card creation', async () => {
      const req = {
        payload: { front: 'Question', back: 'Answer', hint: 'Hint', locked: false },
        context: { accountId: '123' },
      };
      const jestCardId = 'c-12345';

      const result = await createFlashcard(req);

      expect(result.success).toBe(true);
      expect(result.card?.id).toBe(jestCardId);
      expect(result.card?.front).toBe('Question');
      expect(result.card?.back).toBe('Answer');
      expect(result.card?.owner).toBe('123')
    });
  });
});