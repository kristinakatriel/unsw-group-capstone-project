import Resolver from '@forge/resolver';
// import { storage } from '@forge/api'; UNCOMMENT ONCE PERMISSIONS UPDATE

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

  // await storage.set(flashcard.id, flashcard); UNCOMMENT ONCE PERMISSIONS UPDATE

  return {
    statusCode: 201,
    body: { id: flashcard.id, message: "Flashcard created successfully" },
  };
});

export const handler = resolver.getDefinitions();
