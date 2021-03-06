import { signInWithGoogle } from './google-auth';
import { NextAuthProviderIds } from '../next-auth';
import { signInWithGithub } from './github-auth';
import { AuthResponse } from './zod';
import { signInWithApple } from './apple-auth';

export const Providers: Record<
  typeof NextAuthProviderIds[number],
  SignInFunction
> = {
  google: signInWithGoogle,
  github: signInWithGithub,
  apple: signInWithApple,
};

export * from './prisma-auth';
export * from './zod';

type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (
  ...args: any
) => Promise<infer R>
  ? R
  : any;

type SignInResponse = AsyncReturnType<typeof signInWithGithub>;

type SignInFunction = (response: AuthResponse) => Promise<SignInResponse>;
