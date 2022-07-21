import { createRouter } from './context';
import superjson from 'superjson';

import { exampleRouter } from './example';
import { expoAuthRouter } from './expoAuth';

export const appRouter = createRouter()
  .transformer(superjson)
  .merge('example.', exampleRouter)
  .merge('expo-auth.', expoAuthRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
