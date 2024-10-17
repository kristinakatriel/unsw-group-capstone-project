import { Deck } from "./types"

export interface StudySession {
    Deck: Deck[];
    known: number;
    unknown: number;
}