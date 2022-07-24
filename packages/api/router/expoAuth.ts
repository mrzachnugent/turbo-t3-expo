import { TRPCError } from '@trpc/server';
import { decode, JWT } from 'next-auth/jwt';
import { z } from 'zod';
import { Providers, SignInResponseInput } from '../expo-auth';
import { NextAuthProviderIds } from '../next-auth';
import { createRouter } from './context';

interface ExpoAuthJWT extends JWT {
  exp?: number;
}

const secret = process.env.NEXTAUTH_SECRET;

export const expoAuthRouter = createRouter()
  .mutation('signIn', {
    input: z.object({
      response: SignInResponseInput,
      provider: z.enum(NextAuthProviderIds),
    }),
    async resolve({ input }) {
      try {
        return await Providers[input.provider](input.response);
      } catch (err) {
        console.error(err);
      }
    },
  })
  .middleware(async ({ ctx, next }) => {
    if (!ctx.jwt) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Missing token',
        cause: {
          jwt: ctx.jwt,
        },
      });
    }
    // Verify JWT token is not expired
    const decodedToken = (await decode({
      token: ctx.jwt,
      secret,
    })) as ExpoAuthJWT;
    if (decodedToken?.exp && new Date(decodedToken.exp * 1000) < new Date()) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Token expired',
        cause: {
          expiredToken: new Date(decodedToken.exp * 1000) < new Date(),
          now: new Date(),
          expiration: new Date(decodedToken.exp * 1000),
        },
      });
    }
    return next();
  })
  .query('getSession', {
    resolve({ ctx }) {
      return ctx.session;
    },
  });
