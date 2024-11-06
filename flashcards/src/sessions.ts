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
    const user = await initUserData(accountId);

    if (!user) {
      return {
        success: false,
        error: 'user doesnt exist'
      }
    }

    if (!user.data) {
      user.data = {}
    }

    if (!(deckId in user.data)) {
      const newDynamicDataObj: DynamicData = {
        dynamicDeck: await storage.get(deckId),
        quizSessions: [],
        studySessions: []
      }
      user.data[deckId] = newDynamicDataObj;
    }
    
    const quizDeck = user.data[deckId].dynamicDeck;
    
    if (!quizDeck) {
      return {
        success: false,
        error: 'Deck not found. Please make sure the deck exists for the user.',
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
      const initialHintArray: boolean[] = Array(totalCards).fill(false);

      // creating a new session
      const sessionId = `q-${generateId()}`;
      const newSession: QuizSession = {
        deckInSession: quizDeck,
        totalCardCount: totalCards,
        currentCardIndex: 0,
        sessionStartTime: Date.now(),
        statusPerCard: statusPerCardArray,
        hintArray: initialHintArray
      }
  
      await storage.set(sessionId, newSession);
  
      // let us return the first card and the session
      return {
        success: true,
        session: newSession,
        firstIndex: 0,
        sessionId: sessionId
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
      session.statusPerCard[currentIndex] = QuizSessionCardStatus.Skip;
    } else if (status == 'hint') {
      session.hintArray[currentIndex] = true;
    } else if (status == 'correct') {
      session.statusPerCard[currentIndex] = QuizSessionCardStatus.Correct;
    } else if (status == 'incorrect') {
      session.statusPerCard[currentIndex] = QuizSessionCardStatus.Incorrect;
    }
  
    // now let us return the next card
    // check if quiz has finished
    let newIndex = currentIndex + 1;
    if (newIndex == session.totalCardCount) {
      return {
        success: true,
        message: 'quiz is finished'
      }
    } else {
      if (status == 'hint') {
        newIndex = newIndex - 1;
      }
      // quiz hasnt finished so we return the next card
      session.currentCardIndex = newIndex;
      return {
        success: true,
        nextIndex: newIndex,
        nextCardId: session.deckInSession.cards?.[newIndex].id,
        sessionId: sessionId
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
      countHints: session.statusPerCard.filter((element: boolean) => element === true).length,
      countSkip: session.statusPerCard.filter((status: QuizSessionCardStatus) => status === QuizSessionCardStatus.Skip).length,
    }
  
    const accountId = req.context.accountId;
    if (accountId) {
      const user = await storage.get(`u-${accountId}`);
      const deckId = session.deckInSession.id;
      // check if dynamic dict does not exist 
      if (!(deckId in user.data)) {
        const newDynamicDeck: DynamicData = {
          dynamicDeck: session.deckInSession,
          quizSessions: [],
          studySessions: []
        }
        user.data[deckId] = newDynamicDeck
      }
      // now let us add the session to the list 
      user.data[deckId].quizSessions.push(newQuizResult);

      // let us store a new reordered deck
      const sortedDeck = session.deck.slice().sort((a: Card, b: Card) => {
        const hintA = session.hintArray[session.deckInSession.indexOf(a)];
        const hintB = session.hintArray[session.deckInSession.indexOf(b)];
        if (hintA !== hintB) {
          return hintB - hintA;
        }
      
        const statusA = session.statusPerCard[session.deckInSession.indexOf(a)] as QuizSessionCardStatus;
        const statusB = session.statusPerCard[session.deckInSession.indexOf(b)] as QuizSessionCardStatus;
        if (statusA != statusB) {
          return statusB - statusA;
        }

        return session.deckInSession.indexOf(a) - session.deckInSession.indexOf(b)
      });
  
      // change the deck to retrieve the sorted deck when the user starts a new session
      user.data[deckId].dynamicDeck = sortedDeck;

      await storage.delete(sessionId);
    }
  };
  
  export const startStudySession = async (req: ResolverRequest) => {
    const { deckId } = req.payload;
    const accountId = req.context.accountId;
    const user = await initUserData(accountId);

    if (!(deckId in user.data)) {
      const newDynamicDataObj: DynamicData = {
        dynamicDeck: await storage.get(deckId),
        quizSessions: [],
        studySessions: []
      }
      user.data[deckId] = newDynamicDataObj;
    }
  
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