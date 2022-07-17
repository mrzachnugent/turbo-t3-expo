import { createRouter } from './context';
import superjson from 'superjson';

import { exampleRouter } from './example';
import { authRouter } from './auth';
import { expoAuthRouter } from './expoAuth';

export const appRouter = createRouter()
  .transformer(superjson)
  .merge('example.', exampleRouter)
  .merge('auth.', authRouter)
  .merge('expo-auth.', expoAuthRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
