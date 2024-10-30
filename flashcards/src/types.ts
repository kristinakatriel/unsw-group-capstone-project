
import Resolver from '@forge/resolver';

export type ResolverFunction = Parameters<Resolver['define']>[1];
export type ResolverRequest = Parameters<ResolverFunction>[0];

//////////////////////////////////////////////////

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
    owner: string;
    name?: string;          // TODO: REMOVE AND RETURN MANUALLY
    front: string;
    back: string;
    hint?: string;          // TODO: NOT OPTIONAL
    deckIds: string[];      // TODO: REPLACE WITH K-V STORAGE
    locked: boolean;
}

export interface Deck {
    id: string;
    title: string;
    description?: string;
    owner: string;
    name?: string;          // TODO: REMOVE AND RETURN MANUALLY
    cards: Card[];          // TODO: REMOVE AND RETURN MANUALLY
    cardIds: string[];     // TODO: NOT OPTIONAL
    size: number;
    locked: boolean
}

export interface Tag {
    id: string;
    title: string;
    owner: string;
    name?: string;          // TODO: REMOVE AND RETURN MANUALLY
    cardIds: string[];
    deckIds: string[];
    tagIds: string[];
    // userIds: string[];
}

export interface User {
    id: string;
    name: string;
    cardIds: string[];
    deckIds: string[];
    tagIds: string[];
    data: { deckId: DynamicData };
}

//////////////////////////////////////////////////

export interface DynamicData {
    dynamicDeck: Deck;
    quizSessions: QuizResult[];
    studySessions: StudyResult[];
}

export interface QuizResult {
    sessionId: string;
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
    sessionId: string;
    deckInArchive: Deck;
    statusPerCard: StudySessionCardStatus[];
    countPositive: number;
    countNegative: number;
}

//////////////////////////////////////////////////

export interface SpaceSessions {
    quizSessions: string[];
    studySessions: string[];
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

//////////////////////////////////////////////////

export interface GenFlashcardsPair {
    question: string,
    answer: string
}
