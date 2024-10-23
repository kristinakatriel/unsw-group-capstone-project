export interface Card {
    id: string;
    question_text?: string;
    question_image?: string;
    answer_text: string;
    answer_image?: string;
    hint?: string;
    tags?: Tag[];
    owner: string;
    name?: string
}

export interface Deck {
    id: string;
    title: string;
    description?: string;
    owner: string;
    cards?: Card[];
    name?: string
}

export interface Tag {
    id: string;
    title: string;
    description?: string;
    owner: string;
}

// adding study sesh in
export interface StudySession {
    Deck: Deck;
    left_to_master: number; // -> number of cards left to learn
    num_looked:  number; // -> number of times the study session was done 
}

// NOTE: to be used later
// export enum AICardsThreshold {
//     minimumLength = 2
// }