import Resolver from '@forge/resolver';
import { storage } from '@forge/api';

const resolver = new Resolver();

resolver.define('getModule', (req) => {
  const { moduleKey } = req.context;
  return { moduleKey };
});

resolver.define('getUserEmail', async (req) => {
  const user = req.context.user;
  return { email: user.email };
});

// NOTE: ADD HINT IMAGES
resolver.define('createFlashcard', async (req) => {
  const { 
    question_text, 
    question_image, 
    answer_text, 
    answer_image, 
    hint, 
    tags, 
    owner 
  } = req.payload;

  const flashcard = {
    question_text,
    question_image,
    answer_text,
    answer_image,
    hint,
    tags,
    owner,
    id: new Date().getTime().toString(),
  };

  return {
    statusCode: 201,
    body: {id: flashcard.id},
  };
});

resolver.define('createDeck', async (req) => {
  const {
    deck_title,
    deck_description
  } = req.payload;

  const deck = {
    deck_title,
    deck_description,
    id: new Date().getTime().toString(),
  };

  return {
    statusCode: 201, // Double check this status code
    body: {id: deck.id, title: deck.deck_title}
  }
});

resolver.define('createGroup', async (req) => {
  const {
    group_title,
    group_description,
    group_owner,
    group_flashdecks,
  } = req.payload;

  const group = {
    group_title,
    group_description,
    group_owner,
    group_flashdecks,
    id: new Date().getTime().toString(),
  };

  return {
    statusCode: 201, // Double check if this is the correct status code
    body: {id: group.id, title: group.group_title, flashdecks: group.group_flashdecks}
  }
});

export const handler = resolver.getDefinitions();
