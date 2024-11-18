import Resolver from '@forge/resolver';
import api, { QueryApi, route, startsWith, storage } from '@forge/api';
import {
  Card, Deck, Tag, User, GenFlashcardsPair, DynamicData,
  QuizResult, StudyResult, QuizSession, StudySession,
  ResolverRequest, QuizSessionCardStatus, StudySessionCardStatus
} from './types';
import { generateId, clearStorage, getUserName, initUserData } from './helpers'
import { IndicatorSeparator } from 'react-select/dist/declarations/src/components/indicators';


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
      studySessions: [],
      numTimesAttempted: 0
    }
    user.data[deckId] = newDynamicDataObj;
  }
  await storage.set(`u-${accountId}`, user);

  const quizDeck : Deck = user.data[deckId].dynamicDeck;
  if (!quizDeck) {
    return {
      success: false,
      error: 'Deck not found. Please make sure the deck exists for the user.',
    };
  }
  const newDeck = await storage.get(deckId) as Deck | undefined;
  if (!newDeck) {
    return {
      success: false,
      error: 'deck does not exist'
    }
  }

  const newDeckCardIdSet = new Set(newDeck.cards.map(card => card.id));

  quizDeck.cards = quizDeck.cards.filter(card => newDeckCardIdSet.has(card.id));

  const quizDeckCardIdSet = new Set(quizDeck.cards.map(card => card.id));

  // we loop through the new deck and add cards not in quiz deck
  for (const newCard of newDeck.cards) {
    // check if new card is in quizDeckCardID Set
    if (!quizDeckCardIdSet.has(newCard.id)) {
      quizDeck.cards.push(newCard);
      quizDeckCardIdSet.add(newCard.id);
    }
  }

  const totalCards = quizDeck.cards?.length

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

  return {
    success: true,
    session: newSession,
    firstIndex: 0,
    sessionId: sessionId,
    cards: quizDeck.cards
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
  await storage.set(sessionId, session);

  let newIndex = currentIndex + 1;
  if (newIndex == session.totalCardCount && status != 'hint') {
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
    await storage.set(sessionId, session);
    return {
      success: true,
      nextIndex: newIndex,
      nextCardId: session.deckInSession.cards?.[newIndex].id,
      sessionId: sessionId,
      session: session,
      state: status
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

  const currentDate: Date = new Date();
  const dateString: string = currentDate.toDateString();

  // create a new quiz result object
  const newQuizResult: QuizResult = {
    date: dateString,
    sessionId: sessionId,  
    deckInArchive: session.deckInSession,
    statusPerCard: session.statusPerCard,
    countCards: session.totalCardCount,
    countIncomplete: session.statusPerCard.filter((status: QuizSessionCardStatus) => status === QuizSessionCardStatus.Incomplete).length,
    countIncorrect: session.statusPerCard.filter((status: QuizSessionCardStatus) => status === QuizSessionCardStatus.Incorrect).length,
    countCorrect: session.statusPerCard.filter((status: QuizSessionCardStatus) => status === QuizSessionCardStatus.Correct).length,
    countHints: session.hintArray.filter((element: boolean) => element === true).length,
    countSkip: session.statusPerCard.filter((status: QuizSessionCardStatus) => status === QuizSessionCardStatus.Skip).length,
  }

  const accountId = req.context.accountId;
  if (accountId) {
    const user = await initUserData(accountId);
    const deckId = session.deckInSession.id;
    if (!(deckId in user.data)) {
      const newDynamicDeck: DynamicData = {
        dynamicDeck: session.deckInSession,
        quizSessions: [],
        studySessions: [],
        numTimesAttempted: 0
      }
      user.data[deckId] = newDynamicDeck
    }
    // now let us add the session to the list
    user.data[deckId].quizSessions.push(newQuizResult);

    if (!session.deckInSession.cards) {
      return {
        success: false,
        error: 'deck not found'
      }
    }

    session.deckInSession.cards.sort((a: Card, b: Card) => {
      const indexA = session.deckInSession.cards.findIndex((card: Card) => card.id === a.id);
      const indexB = session.deckInSession.cards.findIndex((card: Card) => card.id === b.id);

      const hintA = session.hintArray[indexA];
      const hintB = session.hintArray[indexB];

      const statusA = session.statusPerCard[indexA] as QuizSessionCardStatus;
      const statusB = session.statusPerCard[indexB] as QuizSessionCardStatus;
      if (statusA !== statusB) {
        return statusB - statusA;
      }

      if (hintA !== hintB) {
        return hintB - hintA;
      }

      return indexA - indexB;
    });

    // change the user dynamic deck to retrieve the sorted deck when the user starts a new session
    user.data[deckId].dynamicDeck = session.deckInSession;
    user.data[deckId].numTimesAttempted += 1;

    await storage.delete(sessionId);
    await storage.set(`u-${accountId}`, user);

    return {
      success: true,
      session: session,
      message: 'successful',
      num_attempt: user.data[deckId].numTimesAttempted,
      cards: session.deckInSession.cards,
      countCorrect: newQuizResult.countCorrect,
      countSkip: newQuizResult.countSkip,
      countIncorrect: newQuizResult.countIncorrect,
      countHint: newQuizResult.countHints
    }
  } else {
    return {
      success: false,
      error: 'invalid user'
    }
  }
};


export const viewQuizResults = async(req: ResolverRequest) => {
  const { deckId, index } = req.payload;
  const accountId = req.context.accountId;
  const user = await initUserData(accountId);
  if (!user.data) {
    return {
      success: false,
      error: 'complete a quiz to see results'
    }
  }
  if (!user.data[deckId]) {
    return {
      success: false,
      error: 'complete a quiz to see results'
    }
  }
  if (!user.data[deckId].quizSessions) {
    return {
      success: false,
      error: 'quiz session not accessible'
    }
  }

  if (user.data[deckId].quizSessions.length === 0) {
    return {
      success: false,
      error: 'number of quiz completed is 0 so unable to check results'
    }
  }

  if (index >= user.data[deckId].quizSessions.length) {
    return {
      success: false,
      error: 'out of bound error'
    }
  }

  const quizResultArray: QuizResult[] = user.data[deckId].quizSessions;
  const quiz: QuizResult = quizResultArray[index];

  return {
    success: true,
    date: quiz.date,
    numCorrect: quiz.countCorrect,
    numIncorrect: quiz.countIncorrect,
    numHint: quiz.countHints,
    numSkip: quiz.countSkip
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
      studySessions: [],
      numTimesAttempted: 0
    }
    user.data[deckId] = newDynamicDataObj;
  }

  // we are changing user data
  await storage.set(`u-${accountId}`, user);

  const studyDeck = user.data[deckId].dynamicDeck;

  if (!studyDeck) {
    return {
        success: false,
        error: 'Deck Not found',
    };
  }

  const totalCards = studyDeck.cards?.length

  if (totalCards == 0) {
    return {
      success: false, 
      error: 'cannot enter quiz mode if deck has no cards'
    }
  }

  const sessionId = `ss-${generateId()}`;
  const newStudySession: StudySession = {
    deckInSession: studyDeck,
    totalCardCount: totalCards,
    currentCardIndex: 0,
    sessionStartTime: Date.now()
  }
  await storage.set(sessionId, newStudySession);

  return {
    success: true,
    firstCardId: studyDeck.cards?.[0].id,
    session: newStudySession,
    firstIndex: 0,
    cards: studyDeck.cards,
    sessionId: sessionId
  }
};

export const nextCardStudy = async (req: ResolverRequest) => {
  const { currentIndex, sessionId } = req.payload;

  const session = await storage.get(sessionId);
    if (!session) {
      return {
        success: false,
        error: `No session found with id: ${sessionId}`
      };
    }

  if (currentIndex >= session.totalCardCount) {
    return {
      success: false,
      error: 'out of index'
    }
  }

  let newIndex = currentIndex + 1
  if (newIndex == session.totalCardCount) {
    newIndex = 0;
  }
  session.currentCardIndex = newIndex;
  await storage.set(sessionId, session);
  return {
    success: true,
    newIndex: newIndex,
  }
};

export const prevCardStudy = async (req: ResolverRequest) => {
  const { currentIndex, sessionId } = req.payload;

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

  let newIndex = currentIndex - 1
  if (newIndex < 0) {
    newIndex = session.totalCardCount - 1;
  }
  session.currentCardIndex = newIndex;
  await storage.set(sessionId, session);
  return {
    success: true,
    newIndex: newIndex,
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
    session: session,  
    deckInArchive: session.deckInSession,
  }

  const accountId = req.context.accountId;
  if (accountId) {
    const user = await initUserData(accountId);
    const deckId = session.deckInSession.id;
    if (!(deckId in user.data)) {
      const newDynamicDeck: DynamicData = {
        dynamicDeck: session.deckInSession,
        quizSessions: [],
        studySessions: [],
        numTimesAttempted: 0
      }
      user.data[deckId] = newDynamicDeck
    } else {
      user.data[deckId].dynamicDeck = session.deckInSession
    }
    user.data[deckId].studySessions.push(newStudyResult);

    // let us store user data
    await storage.set(`u-${accountId}`, user);

    // now let us delete session id
    await storage.delete(sessionId);

    return {
      success: true,
      session: session
    }
  } else {
    return {
      success: false,
      error: 'invalid account id'
    }
  }
};
