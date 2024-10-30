import Resolver from '@forge/resolver';
import api, { QueryApi, route, startsWith, storage } from '@forge/api';
import {
  Card, Deck, Tag, User, GenFlashcardsPair, DynamicData,
  QuizResult, StudyResult, QuizSession, StudySession
} from './types';
import { generateId, clearStorage, getUserName, initUserData } from './helpers'

import { ResolverRequest } from './types'


export const createFlashcard = async (req: ResolverRequest) => {
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
};


export const updateFlashcard = async (req: ResolverRequest) => {
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

  await storage.set(id, updatedCard);

  // TODO: CHECK IF NEEDED

  const decksResult = await storage.query().where('key', startsWith('d-')).getMany();
  if (!decksResult) {
    return {
      success: true,
      card: updatedCard,
    };
  }

  for (const { value } of decksResult.results) {
    const deck = value as Deck;
    const cardIndex = deck.cards?.findIndex(c => c.id === id);
    if (cardIndex !== undefined && cardIndex >= 0 && deck.cards) {
      deck.cards[cardIndex] = updatedCard;
      await storage.set(deck.id, deck);
    }
  }

  return {
    success: true,
    card: updatedCard
  };
};


export const deleteFlashcard = async (req: ResolverRequest) => {
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
};


export const getFlashcard = async (req: ResolverRequest) => {
  const { cardId } = req.payload;

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
};


export const getAllFlashcards = async (req: ResolverRequest) => {
  const allFlashcards: Card[] = [];

  const query = await storage.query().where('key', startsWith('c-')).limit(50).getMany();

  query.results.forEach(({ value }) => {
    allFlashcards.push(value as Card);
  });

  return {
    success: true,
    cards: allFlashcards,
  };
};
