// src/pages/api/trpc/[trpc].ts
import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter, createContext } from 'api';

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createContext,
});
