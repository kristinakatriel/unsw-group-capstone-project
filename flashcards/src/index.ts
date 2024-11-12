import Resolver from '@forge/resolver';
import api, { QueryApi, route, startsWith, storage } from '@forge/api';
import {
  Card, Deck, Tag, User, GenFlashcardsPair, DynamicData,
  QuizResult, StudyResult, QuizSession, StudySession,
  ResolverRequest
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
  createTag, updateTag, deleteTag, getTag, getAllTags, getTagsForItem,
  addTagToCard, addTagToDeck, removeTagFromCard, removeTagFromDeck
} from './tagResolvers';
import {
  fetchUserCards, fetchUserDecks, fetchUserTags
} from './userResolvers';
import {
  generateQA, addGeneratedFlashcards,
  getAllContent,
  getGeneratedDeckTitle
} from './aiResolvers'

import {
  startQuizSession, updateCardStatusQuiz, endQuizSession, viewQuizResults,
  startStudySession, nextCardStudy, endStudySession, prevCardStudy
} from './sessions'

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

resolver.define('createTag', createTag);
resolver.define('updateTag', updateTag);
resolver.define('deleteTag', deleteTag);
resolver.define('getTag', getTag);
resolver.define('getAllTags', getAllTags);
resolver.define('getTagsForItem', getTagsForItem);
resolver.define('addTagToCard', addTagToCard);
resolver.define('addTagToDeck', addTagToDeck);
resolver.define('removeTagFromCard', removeTagFromCard);
resolver.define('removeTagFromDeck', removeTagFromDeck);
// main handler file (where the resolver is defined)
// resolver.define('getTagsByCardId', getTagsByCardId);


resolver.define('fetchUserCards', fetchUserCards);
resolver.define('fetchUserDecks', fetchUserDecks);
resolver.define('fetchUserTags', fetchUserTags);

resolver.define('getGeneratedDeckTitle', getGeneratedDeckTitle);
resolver.define('getAllContent', getAllContent);
resolver.define('generateQA', generateQA);
resolver.define('addGeneratedFlashcards', addGeneratedFlashcards);

resolver.define('startQuizSession', startQuizSession);
resolver.define('endQuizSession', endQuizSession);
resolver.define('updateCardStatusQuiz',updateCardStatusQuiz);
resolver.define('viewQuizResults', viewQuizResults);

resolver.define('startStudySession', startStudySession);
resolver.define('endStudySession', endStudySession);
resolver.define('nextCardStudy', nextCardStudy);
resolver.define('prevCardStudy', prevCardStudy);

///////////////////////////////////////////////////////////////////////////////////

export const handler = resolver.getDefinitions();
