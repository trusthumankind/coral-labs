import Resolver from '@forge/resolver';

const resolver = new Resolver();

resolver.define('getConfig', async ({ context }) => {
  // TODO: read sync config from Forge Storage
  return { enabled: false };
});

export const handler = resolver.getDefinitions();
