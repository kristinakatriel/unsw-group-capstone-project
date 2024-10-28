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
    front: string;
    back: string;
    hint?: string;
    owner: string;
    name?: string;
    locked: boolean;
}

export interface Deck {
    id: string;
    title: string;
    description?: string;
    owner: string;
    name?: string;
    cards: Card[];
    cardIds?: number[];
    size: number;
    locked: boolean
}

export interface Tag {
    id: string;
    title: string;
    description?: string;
    owner: string;
    name?: string;
    deckIds: number[];
    cardIds: number[];
}

export interface User {
    id: string;
    // name: string;
    cards: number[];
    decks: number[];
    tags: number[];
    data: { deckId: DynamicData };
}

//////////////////////////////////////////////////

export interface DynamicData {
    dynamicDeck: Deck;
    quizSessions: QuizResult[];
    studySessions: StudyResult[];
}

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

export interface GenFlashcardsPair {
    question: string,
    answer: string
}

// NOTE: to be used later
// export enum AICardsThreshold {
//     minimumLength = 2
// }
