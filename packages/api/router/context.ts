import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import { decode, getToken } from 'next-auth/jwt';
import { prisma } from '../db';
import { PrismaAuth } from '../expo-auth';

const secret = process.env.NEXTAUTH_SECRET;

export const createContext = async (
  opts?: trpcNext.CreateNextContextOptions
) => {
  const req = opts?.req;
  const res = opts?.res;
  let decodedToken;
  let user;
  let jwt;
  try {
    const webToken =
      req && !req?.headers.authorization
        ? await getToken({ req, secret, raw: true })
        : undefined;

    const mobileToken = req?.headers.authorization;

    jwt = webToken || mobileToken;
    decodedToken = await decode({ token: jwt, secret });

    if (decodedToken && decodedToken.sub) {
      user = await PrismaAuth.getUser(decodedToken.sub);
    }
  } catch (e) {
    console.log(e);
  }
  return {
    req,
    res,
    session: user,
    jwt,
    prisma,
  };
};

type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const createRouter = () => trpc.router<Context>();
