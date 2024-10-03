import Resolver from '@forge/resolver';

const resolver = new Resolver();

resolver.define('getText', (req) => {
  console.log(req);

  return 'Manually Create Flashcards Here';
});

export const handler = resolver.getDefinitions();
