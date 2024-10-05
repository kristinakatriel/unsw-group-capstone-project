import Resolver from '@forge/resolver';

const resolver = new Resolver();

resolver.define('getModule', (req) => {
  const { moduleKey } = req.context;
  return { moduleKey };
});

export const handler = resolver.getDefinitions();
