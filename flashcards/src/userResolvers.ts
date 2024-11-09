import Resolver from '@forge/resolver';
import api, { QueryApi, route, startsWith, storage } from '@forge/api';
import {
    Card, Deck, Tag, User, GenFlashcardsPair, DynamicData,
    QuizResult, StudyResult, QuizSession, StudySession
} from './types';
import { generateId, clearStorage, getUserName, initUserData } from './helpers'
import { queryCardsById, queryDecksById, queryTagsById, queryUsersById } from './helpers'
import { ResolverRequest } from './types'


export const fetchUserCards = async (req: ResolverRequest) => {
    const { accountId } = req.context;

    if (!accountId) {
        return {
            success: false,
            message: 'Error!',
        };
    }

    const user = await storage.get(accountId);

    if (!user || !user.cardIds) {
        return {
            success: false,
            message: 'No card data for user',
        };
    }

    const cards = await queryCardsById(user.cardIds);

    return {
        success: true,
        cards
    };
};


export const fetchUserDecks = async (req: ResolverRequest) => {
    const { accountId } = req.context;

    if (!accountId) {
        return {
            success: false,
            message: 'Error!',
        };
    }

    const user = await storage.get(accountId);

    if (!user || !user.deckIds) {
        return {
            success: false,
            message: 'No deck data for user',
        };
    }

    const decks = await queryDecksById(user.deckIds);

    return {
        success: true,
        decks
    };
};


export const fetchUserTags = async (req: ResolverRequest) => {
    const { accountId } = req.context;

    if (!accountId) {
        return {
            success: false,
            message: 'Error!',
        };
    }

    const user = await storage.get(accountId);

    if (!user || !user.tagIds) {
        return {
            success: false,
            message: 'No tag data for user',
        };
    }

    const tags = await queryTagsById(user.tagIds);

    return {
        success: true,
        tags
    };
};
