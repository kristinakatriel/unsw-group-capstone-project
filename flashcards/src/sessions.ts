import Resolver from '@forge/resolver';
import api, { QueryApi, route, startsWith, storage } from '@forge/api';
import {
  Card, Deck, Tag, User, GenFlashcardsPair, DynamicData,
  QuizResult, StudyResult, QuizSession, StudySession,
  ResolverRequest, QuizSessionCardStatus, StudySessionCardStatus
} from './types';
import { generateId, clearStorage, getUserName, initUserData } from './helpers'

export const startQuizSession = async (req: ResolverRequest) => {
    const { deckId } = req.payload;
    const accountId = req.context.accountId;
    const user = await storage.get(`u-${accountId}`);
  
    const quizDeck = user.data[deckId].dynamicDeck;
  
      if (!quizDeck) {
          return {
              success: false,
              error: 'Deck Not found',
          };
      } 
  
      // create an array of status
      const totalCards = quizDeck.cards?.length
  
      // check if length = 0
      if (totalCards == 0) {
        return {
          success: false, 
          error: 'cannot enter quiz mode if deck has no cards'
        }
      }
      const statusPerCardArray: QuizSessionCardStatus[] = Array(totalCards).fill(QuizSessionCardStatus.Incomplete);
  
      // creating a new session
      const sessionId = `q-${generateId()}`;
      const newSession: QuizSession = {
        deckInSession: quizDeck,
        totalCardCount: totalCards,
        currentCardIndex: 0,
        sessionStartTime: Date.now(),
        statusPerCard: statusPerCardArray
      }
  
      await storage.set(sessionId, newSession);
  
      // let us return the first card and the session
      return {
        success: true,
        firstCardId: quizDeck.cards?.[0].id,
        session: newSession,
        firstIndex: 0
      }
  };
  
  
  export const updateCardStatusQuiz = async (req: ResolverRequest) => {
    const { currentIndex, status, sessionId } = req.payload;
    
    const session = await storage.get(sessionId);
      if (!session) {
        return {
          success: false,
          error: `No session found with id: ${sessionId}`
        };
      }
  
    // check if current index is less than total length
    if (currentIndex >= session.totalCardCount) {
      return {
        success: false,
        error: 'out of index'
      }
    }
  
    if (status == 'skip') {
      session.statusPerCard[currentIndex] = QuizSessionCardStatus.Skip
    } else if (status == 'hint') {
      session.statusPerCard[currentIndex] = QuizSessionCardStatus.Hint
    } else if (status == 'correct') {
      session.statusPerCard[currentIndex] = QuizSessionCardStatus.Correct
    } else if (status == 'incorrect') {
      session.statusPerCard[currentIndex] = QuizSessionCardStatus.Incorrect
    }
  
    // now let us return the next card
    // check if quiz has finished
    const newIndex = currentIndex + 1;
    if (newIndex == session.totalCardCount) {
      return {
        success: true,
        message: 'quiz is finished'
      }
    } else {
      // quiz hasnt finished so we return the next card
      session.currentCardIndex = newIndex;
      return {
        success: true,
        nextIndex: newIndex,
        nextCardId: session.deckInSession.cards?.[newIndex].id
      }
    }
  }; 
  
  export const endQuizSession = async (req: ResolverRequest) => {
    const { sessionId } = req.payload;
  
    const session = await storage.get(sessionId);
      if (!session) {
        return {
          success: false,
          error: `No session found with id: ${sessionId}`
        };
      }
  
    // create a new quiz result object
    const newQuizResult: QuizResult = {
      sessionId: sessionId,  
      deckInArchive: session.deckInSession,
      statusPerCard: session.statusPerCard,
      countCards: session.totalCardCount,
      countIncomplete: session.statusPerCard.filter((status: QuizSessionCardStatus) => status === QuizSessionCardStatus.Incomplete).length,
      countIncorrect: session.statusPerCard.filter((status: QuizSessionCardStatus) => status === QuizSessionCardStatus.Incorrect).length,
      countCorrect: session.statusPerCard.filter((status: QuizSessionCardStatus) => status === QuizSessionCardStatus.Correct).length,
      countHints: session.statusPerCard.filter((status: QuizSessionCardStatus) => status === QuizSessionCardStatus.Hint).length,
      countSkip: session.statusPerCard.filter((status: QuizSessionCardStatus) => status === QuizSessionCardStatus.Skip).length,
    }
  
    const accountId = req.context.accountId;
    if (accountId) {
      const user = await storage.get(`u-${accountId}`);
      const deckId = session.deckInSession.id;
      // check if dynamic dict does not exist 
      if (!(deckId in user.data)) {
        const newDynamicDeck: DynamicData = {
          dynamicDeck: session.deck,
          quizSessions: [],
          studySessions: []
        }
        user.data[deckId] = newDynamicDeck
      }
      // now let us add the session to the list 
      user.data[deckId].quizSessions.push(newQuizResult);
  
      await storage.delete(sessionId);
    }
  };
  
  export const startStudySession = async (req: ResolverRequest) => {
    const { deckId } = req.payload;
    const accountId = req.context.accountId;
    const user = await storage.get(`u-${accountId}`);
  
    const studyDeck = user.data[deckId].dynamicDeck;
  
      if (!studyDeck) {
          return {
              success: false,
              error: 'Deck Not found',
          };
      }
    
      const totalCards = studyDeck.cards?.length
  
      // check if length = 0
      if (totalCards == 0) {
        return {
          success: false, 
          error: 'cannot enter quiz mode if deck has no cards'
        }
      }
  
      const statusPerCardArray: StudySessionCardStatus[] = Array(totalCards).fill(QuizSessionCardStatus.Incomplete);
  
      const sessionId = `ss-${generateId()}`;
      const newStudySession: StudySession = {
        deckInSession: studyDeck,
        statusPerCard: statusPerCardArray,
        totalCardCount: totalCards,
        currentCardIndex: 0,
        sessionStartTime: Date.now()
      }
      await storage.set(sessionId, newStudySession);
  
      return {
        success: true,
        firstCardId: studyDeck.cards?.[0].id,
        session: newStudySession,
        firstIndex: 0
      }
  };
  
  export const updateCardStatusStudy = async (req: ResolverRequest) => {
    const { currentIndex, positive, negative, sessionId } = req.payload;
  
    const session = await storage.get(sessionId);
      if (!session) {
        return {
          success: false,
          error: `No session found with id: ${sessionId}`
        };
      }
  
    // check if current index is less than total length
    if (currentIndex >= session.totalCardCount) {
      return {
        success: false,
        error: 'out of index'
      }
    }
  
    if (positive) {
      session.statusPerCard[currentIndex] = StudySessionCardStatus.Positive
    }
    if (negative) {
      session.statusPerCard[currentIndex] = StudySessionCardStatus.Negative
    }
  
    const newIndex = currentIndex + 1
    if (newIndex == session.totalCardCount) {
      return {
        success: true,
        message: 'study session is finished'
      }
    } else {
      // study session hasnt finished so we return the next card
      session.currentCardIndex = newIndex;
      return {
        success: true,
        nextIndex: newIndex,
        nextCardId: session.deckInSession.cards?.[newIndex].id
      }
    }
  
  };
  
  export const endStudySession = async (req: ResolverRequest) => {
    const { sessionId } = req.payload
  
    const session = await storage.get(sessionId);
      if (!session) {
        return {
          success: false,
          error: `No session found with id: ${sessionId}`
        };
      }
    
    // create a new study result 
    const newStudyResult: StudyResult = {
      sessionId: sessionId,  
      deckInArchive: session.deckInSession,
      statusPerCard: session.statusPerCard,
      countNegative: session.statusPerCard.filter((status: StudySessionCardStatus) => status === StudySessionCardStatus.Negative).length,
      countPositive: session.statusPerCard.filter((status: StudySessionCardStatus) => status === StudySessionCardStatus.Positive).length
    }
  
    const accountId = req.context.accountId;
    if (accountId) {
      const user = await storage.get(`u-${accountId}`);
      const deckId = session.deckInSession.id;
      const reorderedDeck = session.deck
      // check if dynamic dict does not exist 
      if (!(deckId in user.data)) {
        const newDynamicDeck: DynamicData = {
          dynamicDeck: reorderedDeck,
          quizSessions: [],
          studySessions: []
        }
        user.data[deckId] = newDynamicDeck
      } else {
        user.data.deckId.dynamicDeck = reorderedDeck
      }
      // now let us add the session to the list 
      user.data.deckId.studySessions.push(newStudyResult);
  
      // now let us delete session id
      await storage.delete(sessionId);
    }
  };