import { startsWith, storage } from '@forge/api';
import { ResolverRequest, Card, Deck, Tag } from './types';
import { generateId, initUserData, queryStorage, queryTagsForItem, 
         queryCardsById, queryDecksById, queryTagsById } from './helpers'


export const createTag = async (req: ResolverRequest) => {
    const { title, colour, cardIds, deckIds, tagIds } = req.payload;
    const accountId = req.context.accountId;

    if (!title) {
        return {
            success: false,
            error: 'Tag title is required',
        };
    }

    initUserData(accountId);

    const tagId = `t-${generateId()}`;
    const tag: Tag = {
        id: tagId,
        title: title,
        colour: colour,
        cardIds: cardIds || [],
        deckIds: deckIds || [],
        tagIds: tagIds || [],
        owner: accountId,
    };

    await storage.set(tagId, tag);

    return {
        success: true,
        tag: tag
    };
};


export const updateTag = async (req: ResolverRequest) => {
    const { id, title, colour, cardIds, deckIds } = req.payload;

    const existingTag = await storage.get(id);

    if (!existingTag) {
        return {
            success: false,
            error: 'Tag not found'
        };
    }

    if (!title) {
        return {
            success: false,
            error: 'Tag title is required',
        };
    }

    const updatedTag = {
        ...existingTag,
        title: title || existingTag.title,
        colour: colour || existingTag.colour,
        cardIds: cardIds || existingTag.flashcards,
        deckIds: deckIds || existingTag.decks
    };

    await storage.set(id, updatedTag);

    return {
        success: true,
        tag: updatedTag,
    };
};


export const deleteTag = async (req: ResolverRequest) => {
    const { tagId } = req.payload;

    const tag = await storage.get(tagId);

    if (!tag) {
        return {
            success: false,
            error: `No tag found with id: ${tagId}`
        };
    }

    for (const relTagId of tag.tagIds) {
        const relTag = await storage.get(relTagId);
        if (relTag) {
            relTag.tagIds = relTag.tagIds.filter((id: string) => id !== tagId);
            await storage.set(relTagId, relTag);
        }
    }

    await storage.delete(tagId);

    return {
        success: true,
        message: `Deleted tag with id: ${tagId}`
    };
};


export const getTag = async (req: ResolverRequest) => {
    const { tagId } = req.payload;

    const tag = await storage.get(tagId);

    if (!tag) {
        return {
            success: false,
            error: `No tag found with id: ${tagId}`
        };
    }

    const cards = await queryCardsById(tag.cardIds);
    const decks = await queryDecksById(tag.deckIds);
    const tags = await queryTagsById(tag.tagIds);

    return {
        success: true,
        tag,
        cards,
        decks,
        tags,
    };
};


export const getAllTags = async () => {
    const allTags = await queryStorage('t-') as Tag[];

    const tags: Tag[] = [];
    
    // FIXME
    const query = await storage.query().where('key', startsWith('t-')).limit(50).getMany();

    query.results.forEach(({ value }) => {
        tags.push(value as Tag);
    });


    const mapTags: Record<string, Tag[]> = {};
    allTags.forEach(tag => {
        tag.tagIds.forEach(subId => {
            if (!mapTags[subId]) {
                mapTags[subId] = [];
            }
            mapTags[subId].push(tag);
        });
    });

    return {
        success: true,
        tags,
        links: mapTags
    };
};


export const getTagsForItem = async (req: ResolverRequest) => {


    const { itemId, itemType } = req.payload;
    try {
        const relTags = await queryTagsForItem(itemId, itemType);

        // Check if any tags were found and return them
        if (relTags.length > 0) {
            return { success: true, tags: relTags };
        } else {
            return { success: false, error: 'No tags found for this item.' };
        }
    } catch (error) {
        console.error('Error fetching tags:', error);
        return { success: false, error: 'Error fetching tags' };
    }


    // //const allTags = await queryStorage('t-') as Tag[];

    // const relTags = await queryTagsForItem(itemId, itemType);


    // return {
    //     success: true,
    //     tags: relTags,
    // };
};


export const addTagToCard = async (req: ResolverRequest) => {
    const { cardId, tagId } = req.payload;

    const card = await storage.get(cardId) as Card | undefined;
    const tag = await storage.get(tagId) as Tag | undefined;

    if (!card || !tag) {
        return {
            success: false,
            error: 'Item not found',
        };
    }

    if (tag.cardIds && tag.cardIds.includes(tagId)) {
        return {
            success: false,
            error: 'Item already included',
        };
    }

    tag.cardIds = [...(tag.cardIds || []), cardId];
    await storage.set(tagId, tag);

    return {
        success: true,
        message: 'Added tag to card',
    };
};


export const addTagToDeck = async (req: ResolverRequest) => {
    const { deckId, tagId } = req.payload;

    const deck = await storage.get(deckId) as Deck | undefined;
    const tag = await storage.get(tagId) as Tag | undefined;

    if (!deck || !tag) {
        return {
            success: false,
            error: 'Item not found',
        };
    }

    if (tag.deckIds && tag.deckIds.includes(deckId)) {
        return {
            success: false,
            error: 'Item already included',
        };
    }

    tag.deckIds = [...(tag.deckIds || []), deckId];
    await storage.set(tagId, tag);

    return {
        success: true,
        message: 'Added tag to deck',
    };
};


export const removeTagFromCard = async (req: ResolverRequest) => {
    const { cardId, tagId } = req.payload;

    const card = await storage.get(cardId) as Card | undefined;
    const tag = await storage.get(tagId) as Tag | undefined;

    if (!card || !tag) {
        return {
            success: false,
            error: 'Item not found',
        };
    }

    tag.cardIds = tag.cardIds?.filter((id: string) => id !== cardId) || [];

    await storage.set(tagId, tag);

    return {
        success: true,
        message: 'Removed tag from card',
    };
};


export const removeTagFromDeck = async (req: ResolverRequest) => {
    const { deckId, tagId } = req.payload;

    const deck = await storage.get(deckId) as Deck | undefined;
    const tag = await storage.get(tagId) as Tag | undefined;

    if (!deck || !tag) {
        return {
            success: false,
            error: 'Item not found',
        };
    }

    tag.deckIds = tag.deckIds?.filter((id: string) => id !== deckId) || [];

    await storage.set(deckId, deck);

    return {
        success: true,
        message: 'Tag removed from deck',
    };
};


// export const getTagsByCardId = async (req: ResolverRequest) => {
//     const { cardId } = req.payload;

//     // Fetch all tags stored in the system
//     const tags: Tag[] = [];

//     const query = await storage.query().where('key', startsWith('t-')).limit(50).getMany();

//     // Loop through the tags and check if the cardId is in the tag's cardIds array
//     query.results.forEach(({ value }) => {
//         const tag = value as Tag;
//         if (tag.cardIds.includes(cardId)) {
//             tags.push(tag);
//         }
//     });

//     if (tags.length === 0) {
//         return {
//             success: false,
//             error: `No tags found for card with id: ${cardId}`,
//         };
//     }

//     return {
//         success: true,
//         tags,
//     };
// };
