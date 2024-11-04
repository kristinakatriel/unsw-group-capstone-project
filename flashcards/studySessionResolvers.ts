



resolver.define('startStudySession', async (req: ResolverRequest) => {
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
  });
  
  resolver.define('updateCardStatusStudy', async (req) => {
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
  
  });
  
  resolver.define('endStudySession', async (req) => {
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
  });
  
  
  
  export const handler = resolver.getDefinitions();