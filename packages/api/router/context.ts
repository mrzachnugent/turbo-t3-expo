import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import { decode, getToken } from 'next-auth/jwt';
import { prisma } from '../db';
import { ExpoAuth } from '../expo-auth';

const { getUser } = ExpoAuth;
const secret = process.env.NEXTAUTH_SECRET;

export const createContext = async (
  opts?: trpcNext.CreateNextContextOptions
) => {
  const req = opts?.req;
  const res = opts?.res;
  let decodedToken;
  let user;
  let token;
  try {
    const webToken = req
      ? await getToken({ req, secret, raw: true })
      : undefined;

    const mobileToken = req?.headers.authorization;

    token = webToken || mobileToken;
    decodedToken = await decode({ token: webToken || mobileToken, secret });

    if (decodedToken && 'sub' in decodedToken && decodedToken.sub) {
      user = await getUser(decodedToken.sub);
    }

    // console.log({
    //   JWT: token,
    //   AUTH: decodedToken,
    //   USER: user,
    // });
  } catch (e) {
    console.log(e);
  }
  return {
    req,
    res,
    session: user,
    prisma,
  };
};

type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const createRouter = () => trpc.router<Context>();
