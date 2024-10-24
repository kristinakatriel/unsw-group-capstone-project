enum QuizSessionCardStatus {
    Incomplete,
    Correct,
    Incorrect,
    Skip,
    Hint
}

enum StudySessionCardStatus {
    Positive,
    Negative
}

//////////////////////////////////////////////////

export interface Card {
    id: string;
    front?: string;
    back: string;
    hint?: string;
    owner: string;
    name?: string;
}

export interface Deck {
    id: string;
    title: string;
    description?: string;
    owner: string;
    name?: string;
    cards?: Card[];
}

export interface Tag {
    id: string;
    title: string;
    description?: string;
    owner: string;
    name?: string;
    decks: Deck[];
    cards: Card[];
}

//////////////////////////////////////////////////

export interface SpaceData {
    userData: { userId: UserData };
}

export interface UserData {
    deckData: { deckId: DeckData };
}

export interface DeckData {
    dynamicDeck: Deck;
    quizSessionResults: QuizSession[];
    studySessionResults: StudySession[];
}

//////////////////////////////////////////////////

export interface QuizResult {
    deckInArchive: Deck;
    statusPerCard: QuizSessionCardStatus[];     
    countCards: number;
    countIncomplete: number;
    countCorrect: number;
    countIncorrect: number;
    countSkip: number;
    countHints: number;
}

export interface StudyResult {
    deckInArchive: Deck;
    statusPerCard: StudySessionCardStatus[];     
    countPositive: number;
    countNegative: number;
}

//////////////////////////////////////////////////

export interface QuizSession {
    deckInSession: Deck;
    statusPerCard: QuizSessionCardStatus[];
    totalCardCount: number;
    currentCardIndex: number;
    sessionStartTime: number;
}

export interface StudySession {
    deckInSession: Deck;
    statusPerCard: StudySessionCardStatus[];
    totalCardCount: number;
    currentCardIndex: number;
    sessionStartTime: number;
}
