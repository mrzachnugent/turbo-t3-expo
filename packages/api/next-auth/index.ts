import { type NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import EmailProvider from 'next-auth/providers/email';

import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '../db';

const providers = [
  GithubProvider({
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
  }),
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
  EmailProvider({
    server: {
      host: 'smtp.gmail.com',
      port: 465,
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_SERVER_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.EMAIL_SERVER_REFRESH_TOKEN,
      },
    },
    from: process.env.EMAIL_SERVER_USER,
  }),
  AppleProvider({
    // @TODO
    clientId: '',
    clientSecret: '',
  }),
];

export const NextAuthProviderIds = ['github', 'google', 'apple'] as const; // Manually ajdust

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  callbacks: {
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user && typeof token.uid === 'string') {
        session.user.id = token.uid;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
};
