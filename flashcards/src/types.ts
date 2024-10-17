export interface Card {
    id: string;
    question_text?: string;
    question_image?: string;
    answer_text: string;
    answer_image?: string;
    hint?: string;
    tags?: Tag[];
    owner: string;
    // adding 2 other fields here yay
    // mistakes_made: number; -> how many times this card was wrong ??
    // known: boolean; -> is it known now or unknown ?
}

export interface Deck {
    id: string;
    title: string;
    description?: string;
    owner: string;
    cards?: Card[];
    // adding 2 other fields here
    // left_to_master: number; -> number of cards left to learn
    // num_looked:  number; -> number of cards left to learn as well yay
}

export interface Tag {
    id: string;
    title: string;
    description?: string;
    owner: string;
}

// adding study sesh in
export interface StudySession {
    Deck: Deck[];
    known: number;
    unknown: number;
}