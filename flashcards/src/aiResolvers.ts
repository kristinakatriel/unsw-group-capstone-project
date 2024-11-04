import Resolver from '@forge/resolver';
import api, { QueryApi, route, startsWith, storage } from '@forge/api';
import {
    Card, Deck, Tag, User, GenFlashcardsPair, DynamicData,
    QuizResult, StudyResult, QuizSession, StudySession,
    ParagraphType
} from './types';
import { generateId, clearStorage, getUserName, initUserData } from './helpers';
import { ResolverRequest } from './types'

export const getAllContentQA = async (req: ResolverRequest) => {
    const { pageId } = req.payload;
    console.log(req.payload);
    // view: HTML but diff
    // storage: shit
    // atlas_doc_format: best bet
    const response = await api.asApp().requestConfluence(route`/wiki/api/v2/pages/${pageId}?body-format=atlas_doc_format`, {
        headers: {
        'Accept': 'application/json'
        }
    });
    
    console.log(response.status);

    if (response.status == 200) {
        const data = await response.json();
        const doc = JSON.parse(data.body.atlas_doc_format.value);
        // Function to recursively extract paragraph texts
        const extractParagraphs = (content: any[]): string[] => {
            return content.flatMap(item => {
            if (item.type === 'paragraph' && item.content) {
                return item.content.map((paragraph: ParagraphType) => paragraph.text);
            } else if (item.content) {
                return extractParagraphs(item.content);
            }
            return [];
            });
        };

        // Get all paragraph texts
        const paragraphs = extractParagraphs(doc.content);
        const allText = paragraphs.join(' ');
        return {
            success: true,
            data: JSON.stringify(allText),
        };
    }

    // console.log(text);
    return {
        success: false,
        error: response.statusText
    };
};

// AI GENERATION

// adding generating q&a through ai flashcards
export const generateQA = async (req: ResolverRequest) => {
    // get text
    const { text } = req.payload;
    console.log("testing tunnel");
    if (text.length <= 2) {
        return {
            success: false,
            error: 'Too few words; select more text to generate flashcards.'
        }
    }

    console.log("calling url thing");
    // get the flashcards generated using the external url
    const response = await fetch("https://marlin-excited-gibbon.ngrok-free.app/generate_qa", {  // the url which we need to generate the flashcards
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
    });

    console.log("printing responce", response);

    const data = await response.json();
    if (!response.ok) {
        return {
            success: false,
            error: 'Failed to generate Q&A from text',
        };
    }
    // this returns a json of q&a pairs, which can be displayed in the context menu
    return {
        success: true,
        data: data
    };
};


export const addGeneratedFlashcards = async (req: ResolverRequest) => {
    const { qAPairs, deckTitle, siteUrl, siteName } = req.payload;
    const accountId = req.context.accountId;

    if (!deckTitle || deckTitle.trim() === "") {
        return { success: false, error: 'Deck title is required.' };
    }

    initUserData(accountId);
    const user = await getUserName(accountId);

    let newDeck: Deck | null = {
        id: `d-${generateId()}`,
        owner: accountId,
        name: user,
        title: deckTitle,
        description: `Fetched from ${siteUrl} under the name ${siteName}.`,
        cards: [],
        cardIds: [],
        size: 0,
        locked: false
    };

    const cardIds: string[] = [];
    // Use Promise.all to ensure all flashcards are stored asynchronously
    const flashcardPromises = qAPairs.map(async (pair: GenFlashcardsPair) => {
        const { question, answer } = pair;
        // Check for missing question or answer
        if (!question || !answer) {
            return {
                success: false,
                error: 'Cannot add flashcard as question or answer are missing',
            };
        }
        // Create a new flashcard object
        const cardId = `c-${generateId()}`;
        const newCard = {
            id: cardId,
            front: question,
            back: answer,
            hint: "",
            owner: accountId,
            name: user
        };
        cardIds.push(cardId);
        // Store the new flashcard in storage
        await storage.set(cardId, newCard);
        return { success: true, id: cardId }; // return success and cardId
    });

    // Wait for all flashcards to be created
    const results = await Promise.all(flashcardPromises);

    // If a new deck was created, retrieve flashcards by their IDs and add them to the deck
    if (newDeck && newDeck.cards) {
        for (const cardId of cardIds) {
            const flashcard = await storage.get(cardId); // Retrieve the flashcard from storage
            if (flashcard) {
                newDeck.cards.push(flashcard); // Add the flashcard object to the new deck
            }
        }

        // Store the new deck in storage
        await storage.set(newDeck.id, newDeck);
    }

    return {
        success: true,
        createdFlashcards: results.filter(result => result.success).length
    };
};
