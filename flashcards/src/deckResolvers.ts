import Resolver from '@forge/resolver';
import api, { QueryApi, route, startsWith, storage } from '@forge/api';
import {
    Card, Deck, Tag, User, GenFlashcardsPair, DynamicData,
    QuizResult, StudyResult, QuizSession, StudySession
} from './types';
import { generateId, clearStorage, queryStorage, getUserName, initUserData } from './helpers'
import { queryCardsById, queryDecksById, queryTagsById, queryUsersById } from './helpers'
import { ResolverRequest } from './types'


export const createDeck = async (req: ResolverRequest) => {
    const { title, description, cards: flashcards, locked } = req.payload as Omit<Deck, 'id'>;
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
        cardIds: [],             // todo: implement card id references
        size: 0,                 // todo: implement or remove
        locked
    };

    await storage.set(deckId, deck);

    return {
        success: true,
        id: deckId,
        deck: deck,
    };
};


export const updateDeck = async (req: ResolverRequest) => {
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

    if (!title) {
        return {
            success: false,
            error: 'Invalid input: title required',
        };
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
};


export const deleteDeck = async (req: ResolverRequest) => {
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

    const tags = await queryTagsById(deck.tagIds || []);
    for (const tag of tags) {
        tag.deckIds = tag.deckIds.filter(id => id !== deckId);
        await storage.set(tag.id, tag);
    }

    const user = await storage.get(deck.owner);
    if (user) {
        user.deckIds = user.deckIds.filter((id: string) => id !== deckId);
        await storage.set(user.id, user);
    }

    await storage.delete(deckId);

    return {
        success: true,
        message: `Deleted deck with id: ${deckId}`,
    };
};


export const getDeck = async (req: ResolverRequest) => {
    const { deckId } = req.payload;

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
};


// export const getAllDecks = async (req: ResolverRequest) => {
//     const allDecks: Deck[] = [];

//     const query = await storage.query().where('key', startsWith('d-')).limit(50).getMany();

//     query.results.forEach(({ value }) => {
//         allDecks.push(value as Deck);
//     });

//     return {
//         success: true,
//         decks: allDecks,
//     };
// };


export const getAllDecks = async (req: ResolverRequest) => {
    const allDecks = await queryStorage('d-') as Deck[]; // use once limit implemented

    // const allDecks: Deck[] = [];

    // const query = await storage.query().where('key', startsWith('d-')).limit(50).getMany();

    // query.allDecks.forEach(({ value }) => {
    //     allDecks.push(value as Deck);
    // });

    const allTags = await queryStorage('t-') as Tag[];

    const mapTags: Record<string, Tag[]> = {};
    allTags.forEach(tag => {
        tag.deckIds.forEach(deckId => {
            if (!mapTags[deckId]) {
                mapTags[deckId] = [];
            }
            mapTags[deckId].push(tag);
        });
    });

    return {
        success: true,
        decks: allDecks,
        tags: mapTags
    };
};

export const addCardToDeck = async (req: ResolverRequest) => {
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
    card.deckIds = [...(card.deckIds || []), deckId];

    await storage.set(deckId, deck);

    return {
        success: true,
        message: 'Added card to deck',
    };
};


export const removeCardFromDeck = async (req: ResolverRequest) => {
    const { deckId, cardId } = req.payload;

    const deck = await storage.get(deckId) as Deck | undefined;
    const card = await storage.get(cardId) as Card | undefined;

    if (!deck || !card) {
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
    card.deckIds = card.deckIds?.filter(id => id !== deckId) || [];

    await storage.set(deckId, deck);

    return {
        success: true,
        message: 'Removed card from deck',
    };
};
