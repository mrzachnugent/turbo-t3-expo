import { Prisma, prisma } from '../db';
import type { Adapter } from 'next-auth/adapters';

export const PrismaAuth: Adapter = {
  createUser: (data) => prisma.user.create({ data }),
  getUser: (id) => prisma.user.findUnique({ where: { id } }),
  getUserByEmail: (email) => prisma.user.findUnique({ where: { email } }),
  async getUserByAccount(provider_providerAccountId) {
    const account = await prisma.account.findUnique({
      where: { provider_providerAccountId },
      select: { user: true },
    });
    return account?.user ?? null;
  },
  updateUser: (data) => prisma.user.update({ where: { id: data.id }, data }),
  deleteUser: (id) => prisma.user.delete({ where: { id } }),
  linkAccount: (data) => prisma.account.create({ data }) as any,
  unlinkAccount: (provider_providerAccountId) =>
    prisma.account.delete({ where: { provider_providerAccountId } }) as any,
  async getSessionAndUser(sessionToken) {
    const userAndSession = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });
    if (!userAndSession) return null;
    const { user, ...session } = userAndSession;
    return { user, session };
  },
  createSession: (data) => prisma.session.create({ data }),
  updateSession: (data) =>
    prisma.session.update({ data, where: { sessionToken: data.sessionToken } }),
  deleteSession: (sessionToken) =>
    prisma.session.delete({ where: { sessionToken } }),
  createVerificationToken: (data) => prisma.verificationToken.create({ data }),
  async useVerificationToken(identifier_token) {
    try {
      return await prisma.verificationToken.delete({
        where: { identifier_token },
      });
    } catch (error) {
      // If token already used/deleted, just return null
      // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
      if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025')
        return null;
      throw error;
    }
  },
};
