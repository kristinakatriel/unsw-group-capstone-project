import { storage } from '@forge/api';
import { queryStorage } from '../helpers';
import { createTag } from '../tagResolvers';

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
  queryStorage: jest.fn(() => Promise.resolve([]))
}));

describe('Tag Resolver Functions', () => {
    describe('Create Tag', () => {
        it('Test 1 - add tag successful', async() => {
            const req = {
                        payload: { title: 'math', 
                                colour: 'red', 
                                cardIds: [], 
                                deckIds: [],
                                tagIds: []
                                },
                        context: { accountId: '123' },
                        };
            const result = await createTag(req);
            const jestTagId = `c-${12345}`;
            const createdTag = {
                id: jestTagId,
                title: 'math',
                colour: 'red',
                cardIds: [],
                deckIds: [],
                tagIds: [],
                owner: '123',
            }
            expect(result.success).toBe(true);
        });
    });
});