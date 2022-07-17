import { TRPCError } from '@trpc/server';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import { z } from 'zod';
import { createRouter } from './context';
import { ExpoAuth } from '../expo-auth';

const { getUserByAccount } = ExpoAuth;

const AuthErrorShape = z.object({
  code: z.string(),
  description: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  params: z.record(z.string().min(1), z.any()).nullable().optional(),
  stack: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  uri: z.string().nullable().optional(),
});
const AuthTokenResponseShape = z.object({
  accessToken: z.string().nullable().optional(),
  expiresIn: z.number().nullable().optional(),
  getRequestConfig: z.function().nullable().optional(),
  idToken: z.string().nullable().optional(),
  issuedAt: z.number().nullable().optional(),
  refreshAsync: z.function().nullable().optional(),
  refreshToken: z.string().nullable().optional(),
  scope: z.string().nullable().optional(),
  shouldRefresh: z.boolean().nullable().optional(),
  state: z.string().nullable().optional(),
  tokenType: z.string().nullable().optional(),
});

const SignInInput = z.object({
  type: z.string(),
  errorCode: z.string().nullable().optional(),
  error: AuthErrorShape.nullable().optional(),
  params: z.record(z.string(), z.any()).nullable().optional(),
  authentication: AuthTokenResponseShape.nullable().optional(),
  url: z.string(),
});

export const expoAuthRouter = createRouter()
  .mutation('signIn', {
    input: SignInInput.nullable(),
    // input: z.record(z.string().min(1), z.any()),

    async resolve({ input }) {
      if (!input?.authentication?.idToken) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      const payload = jwtDecode<JwtPayload>(input.authentication.idToken);
      if (payload.sub) {
        const currentUser = await getUserByAccount({
          providerAccountId: payload.sub,
          provider: 'google',
        });
        console.log({ currentUser });
        return currentUser;
      }

      return null;
    },
  })
  .middleware(async ({ ctx, next }) => {
    // Any queries or mutations after this middleware will
    // raise an error unless there is a current session
    if (!ctx.session) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next();
  })
  .query('getSession', {
    resolve({ ctx }) {
      return ctx.session;
    },
  })
  .mutation('signOut', {
    resolve({ ctx }) {
      return ctx.session;
    },
  });
