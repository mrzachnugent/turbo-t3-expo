import { signInWithGoogle } from './google-auth';
import { NextAuthProviderIds } from '../next-auth';

export const Providers: Record<typeof NextAuthProviderIds[number], any> = {
  google: signInWithGoogle,
  github: () => {},
};

export * from './prisma-auth';
export * from './zod';
