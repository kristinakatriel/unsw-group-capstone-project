import Resolver from '@forge/resolver';
import api, { QueryApi, route, startsWith, storage } from '@forge/api';
import {
    Card, Deck, Tag, User, GenFlashcardsPair, DynamicData,
    QuizResult, StudyResult, QuizSession, StudySession
} from './types';
import { v4 as uuidv4 } from 'uuid';


export const generateId = () => uuidv4();


export const clearStorage = async (): Promise<void> => {
    let cursor = '';

    while (true) {
        const { results, nextCursor } = await storage
            .query()
            .limit(25)
            .cursor(cursor)
            .getMany();

        if (results.length === 0) {
            break;
        }

        for (const item of results) {
            await storage.delete(item.key);
            console.log(`Deleted key: ${item.key}`);
        }

        cursor = nextCursor ?? '';
        if (!nextCursor) {
            break;
        }
    }

    console.log(`Data cleared!`)
};


export const queryStorage = async (prefix: string): Promise<void> => {
    const start = Date.now();
    let cursor = '';
    let result = [];
    while (true) {
        const { results, nextCursor } = await storage
            .query()
            .where("key", startsWith(prefix))
            .limit(25)
            .cursor(cursor)
            .getMany();
        if (results.length === 0) {
            break;
        } else {
            cursor = nextCursor ?? '';
            result.push(...results);
        }
    }
    console.log(result);
    console.log(`Total results: ${result.length}`);
    const end = Date.now();
    console.log(`Total time: ${end - start}`);
    console.log("Query done!");
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
            name: getUserName,
            deckIds: [],
            cardIds: []
        };

        await storage.set(userDataKey, newUser);
        return newUser;
    }

    return existingUser;
};


export const fetchCardsById = async (cardIds: string[]): Promise<Card[]> => {
    const cards: Card[] = [];

    for (const cardId of cardIds) {
        const card = await storage.get(cardId);
        if (card) {
            cards.push(card);
        }
    }

    return cards;
};


export const fetchDecksById = async (deckIds: string[]): Promise<Deck[]> => {
    const decks: Deck[] = [];

    for (const deckId of deckIds) {
        const deck = await storage.get(deckId);
        if (deck) {
            decks.push(deck);
        }
    }

    return decks;
};


export const fetchTagsById = async (tagIds: string[]): Promise<Tag[]> => {
    const tags: Tag[] = [];

    for (const tagId of tagIds) {
        const tag = await storage.get(tagId);
        if (tag) {
            tags.push(tag);
        }
    }

    return tags;
};


export const fetchUsersById = async (userIds: string[]): Promise<User[]> => {
    const users: User[] = [];
    
    for (const userId of userIds) {
        const user = await storage.get(userId);
        if (user) {
            users.push(user);
        }
    }
    
    return users;
};