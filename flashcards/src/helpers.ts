import Resolver from '@forge/resolver';
import api, { QueryApi, route, startsWith, storage } from '@forge/api';
import { Card, Deck, Tag, User, GenFlashcardsPair, DynamicData,
         QuizResult, StudyResult, QuizSession, StudySession
 } from './types';
import { v4 as uuidv4 } from 'uuid';


export const generateId = () => uuidv4();


export const clearStorage = async (cursor: string = ''): Promise<void> => {
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


export const getUserName = async (accountId: string) => {
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


export const initUserData = async (accountId: string) => {
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

