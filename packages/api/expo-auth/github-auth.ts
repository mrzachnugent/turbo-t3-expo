import { TRPCError } from '@trpc/server';
import { AdapterUser } from 'next-auth/adapters';
import { Account } from 'next-auth/core/types';
import { encode, JWT } from 'next-auth/jwt';
import { GithubEmail } from 'next-auth/providers/github';
import { PrismaAuth } from '.';
import { MY_EXPO_URLS, SECRET } from './constants';
import { AuthResponse } from './zod';

interface IGithubUser {
  id: number;
  name?: string | null;
  avatar_url?: string | null;
  email?: string | null;
}

interface IAccessTokenRequest {
  access_token: string;
  token_type: 'bearer';
  scope: 'read:user,user:email';
}

interface GithubUserJwt extends JWT {
  sub: string;
}

export async function signInWithGithub(response: AuthResponse) {
  // Check Response is from Expo and provides a github temporary code
  if (
    !response?.params?.code ||
    !MY_EXPO_URLS.some((url) => response?.url.startsWith(url))
  ) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Failed to authenticate',
      cause: 'Missing oAuth Information',
    });
  }
  const requestAccessToken = await fetch(
    `https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_ID}&client_secret=${process.env.GITHUB_SECRET}&code=${response.params.code}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    }
  );

  if (!requestAccessToken.ok) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Failed to authenticate',
      cause: 'Missing oAuth Information',
    });
  }

  const accessTokenResponse: IAccessTokenRequest =
    await requestAccessToken.json();

  const getGithubUser = await fetch('https://api.github.com/user', {
    method: 'GET',
    headers: {
      Authorization: `token ${accessTokenResponse.access_token}`,
    },
  });

  if (!getGithubUser.ok) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Failed to authenticate',
      cause: 'Missing oAuth Information',
    });
  }

  const githubUser: IGithubUser = await getGithubUser.json();

  const formattedGithubUser: GithubUserJwt = {
    name: githubUser.name,
    picture: githubUser.avatar_url,
    email: githubUser.email,
    sub: githubUser.id.toString(),
  };

  // Check if user already has a Github oAuth Account
  // If they do, create new JWT for authentication and return user
  const currentUserByAccount = await PrismaAuth.getUserByAccount({
    providerAccountId: formattedGithubUser.sub,
    provider: 'github',
  });

  if (currentUserByAccount) {
    formattedGithubUser.sub = currentUserByAccount.id;
    const newJwt = await encode({
      token: formattedGithubUser as JWT,
      secret: SECRET,
    });
    return {
      currentUser: currentUserByAccount,
      jwt: newJwt,
    };
  } else {
    // Check if user without Github oAuth Account is already a user in our database
    // If they are, link Github oAuth Account with existing user, create new JWT for authentication and return user

    if (!formattedGithubUser.email) {
      // If the user does not have a public email, get another via the GitHub API
      // See https://docs.github.com/en/rest/users/emails#list-public-email-addresses-for-the-authenticated-user
      const res = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `token ${accessTokenResponse.access_token}` },
      });

      if (res.ok) {
        const emails: GithubEmail[] = await res.json();
        formattedGithubUser.email = (
          emails.find((e) => e.primary) ?? emails[0]
        ).email;
      } else {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot fetch user email',
        });
      }
    }

    const currentUserByEmail = await PrismaAuth.getUserByEmail(
      formattedGithubUser.email
    );
    if (currentUserByEmail) {
      const newJwt = await encode({
        token: formattedGithubUser,
        secret: SECRET,
      });
      const newAccount: Account = {
        provider: 'github',
        providerAccountId: formattedGithubUser.sub,
        type: 'oauth',
        userId: currentUserByEmail.id,
        access_token: newJwt,
        id_token: accessTokenResponse.access_token,
        token_type: accessTokenResponse?.token_type,
        scope: accessTokenResponse?.scope,
      };
      await PrismaAuth.linkAccount(newAccount);
      return {
        currentUser: currentUserByEmail,
        jwt: newJwt,
      };
    } else {
      // Create new user, create new JWT for authentication and return new user
      const newUser: Omit<AdapterUser, 'id'> = {
        name: formattedGithubUser.name,
        email: formattedGithubUser.email,
        image: formattedGithubUser.picture,
        emailVerified: new Date(),
      };
      const user = await PrismaAuth.createUser(newUser);
      if (user) {
        const newJwt = await encode({
          token: formattedGithubUser,
          secret: SECRET,
        });
        const newAccount: Account = {
          provider: 'github',
          providerAccountId: formattedGithubUser.sub,
          type: 'oauth',
          userId: user.id,
          access_token: newJwt,
          id_token: accessTokenResponse.access_token,
          token_type: accessTokenResponse?.token_type,
          scope: accessTokenResponse?.scope,
        };
        await PrismaAuth.linkAccount(newAccount);

        return {
          currentUser: user,
          jwt: newJwt,
        };
      }

      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Unable to create new user',
      });
    }
  }
}
