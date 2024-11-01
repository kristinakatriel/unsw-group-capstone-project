import Resolver from '@forge/resolver';
import api, { QueryApi, route, startsWith, storage } from '@forge/api';
import {
  Card, Deck, Tag, User, GenFlashcardsPair, DynamicData,
  QuizResult, StudyResult, QuizSession, StudySession
} from './types';
import { generateId, clearStorage, getUserName, initUserData } from './helpers'
// import { basename } from 'path';
// import { create } from 'domain';
import {
  createFlashcard, updateFlashcard, deleteFlashcard,
  getFlashcard, getAllFlashcards,
} from './cardResolvers';
import {
  createDeck, updateDeck, deleteDeck, getDeck, getAllDecks,
  addCardToDeck, removeCardFromDeck
} from './deckResolvers'
import {
  generateQA, addGeneratedFlashcards
} from './aiResolvers'

///////////////////////////////////////////////////////////////////////////////////

const resolver = new Resolver();

resolver.define('getModule', async (req) => {
  const { moduleKey } = req.context;
  return { moduleKey };
});

resolver.define('createFlashcard', createFlashcard);
resolver.define('updateFlashcard', updateFlashcard);
resolver.define('deleteFlashcard', deleteFlashcard);
resolver.define('getFlashcard', getFlashcard);
resolver.define('getAllFlashcards', getAllFlashcards);


resolver.define('createDeck', createDeck);
resolver.define('updateDeck', updateDeck);
resolver.define('deleteDeck', deleteDeck);
resolver.define('getDeck', getDeck);
resolver.define('getAllDecks', getAllDecks);
resolver.define('addCardToDeck', addCardToDeck);
resolver.define('removeCardFromDeck', removeCardFromDeck);

resolver.define('generateQA', generateQA);
resolver.define('addGeneratedFlashcards', addGeneratedFlashcards);

///////////////////////////////////////////////////////////////////////////////////

export const handler = resolver.getDefinitions();
