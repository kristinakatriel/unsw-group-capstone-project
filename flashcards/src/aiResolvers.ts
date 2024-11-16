import Resolver from '@forge/resolver';
import api, { QueryApi, route, startsWith, storage } from '@forge/api';
import {
    Card, Deck, Tag, User, GenFlashcardsPair, DynamicData,
    QuizResult, StudyResult, QuizSession, StudySession,
    ParagraphType
} from './types';
import { generateId, clearStorage, getUserName, initUserData } from './helpers';
import { ResolverRequest } from './types'
import { addTagToCard, getAllTags } from './tagResolvers';

export const url = "https://marlin-excited-gibbon.ngrok-free.app"

export const getAllContent = async (req: ResolverRequest) => {
    const { pageId, siteUrl } = req.payload;
    const { accountId } = req.context;

    if (!accountId) {
        return {
            success: false,
            message: 'No user',
        };
    }

    console.log(req.payload);
    // view: HTML but diff
    // storage: shit
    // atlas_doc_format: best bet
    const response = await api.asUser().requestConfluence(route`/wiki/api/v2/pages/${pageId}?body-format=atlas_doc_format`, {
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
            title: data.title,
            url: `${siteUrl}/wiki/spaces/~${accountId}/pages/${pageId}`
        }
    }

    // console.log(text);
    return {
        success: false,
        error: response.statusText
    };
};

// get generated deck info: For content byline
export const getGeneratedDeckTitle = async (req: ResolverRequest) => {
    const { text } = req.payload;
    const response = await fetch(`${url}/generate_deck_title`, {  // the url which we need to generate the deck title
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
    });

    const data = await response.json();
    if (!response.ok) {
        return {
            success: false,
            error: 'No deck title generated',
        };
    }

    // also add the page url to the description in the end
    return {
        success: true,
        title: data.title
    };
}

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
    const response = await fetch(`${url}/generate_qa`, {  // the url which we need to generate the flashcards
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
    const { qAPairs, deckId } = req.payload;
    const accountId = req.context.accountId;

    const deck = await storage.get(deckId) as Deck | undefined;

    if (!deck) {
        return {
            success: false,
            error: 'Deck Not found',
        };
    }

    const user = await getUserName(accountId);
    const tags = await getAllTags();
    const autoTag = tags.tags.find(tag => tag.title === 'auto-generated') as Tag || undefined;
    let autoId = 'undefined';
    if (!autoTag) {
        // here, need to make the tag. ya
        return {
            success: false,
            error: 'tag not found'
        }
    } else {
        autoId = autoTag.id;
    }
    const cardIds: string[] = [];

    const flashcardPromises = qAPairs.map(async (pair: GenFlashcardsPair) => {
        const { question, answer } = pair;
        if (!question || !answer) {
            return { success: false, error: 'Cannot add flashcard as question or answer are missing' };
        }

        const cardId = `c-${generateId()}`;
        const newCard = {
            id: cardId,
            front: question,
            back: answer,
            hint: "",
            owner: accountId,
            name: user,
            locked: false
        };
        cardIds.push(cardId);

        autoTag.cardIds.push(cardId);

        await storage.set(autoTag.id, autoTag);

        await storage.set(cardId, newCard);
        // const req = {
        //     payload: {
        //         cardId: cardId,
        //         tagId: autoId
        //     },
        //     context: {
        //         accountId: accountId
        //     }
        // } as ResolverRequest;
        // const res = await addTagToCard(req);
        return { success: true, id: cardId };
    });

    // Wait for all flashcards to be created
    const results = await Promise.all(flashcardPromises);

    // Ensure deck.cards exists
    if (!deck.cards) {
        deck.cards = [];
    }

    // Add the newly created flashcards to the deck
    for (const cardId of cardIds) {
        const flashcard = await storage.get(cardId);
        if (flashcard) {
            deck.cards.push(flashcard);
        }
    }

    // Store the updated deck in storage
    await storage.set(deck.id, deck);

    // Return a consistent response
    return {
        success: true,
        createdDeck: deck,
        createdFlashcardsCount: results.filter(result => result.success).length,
    };
};