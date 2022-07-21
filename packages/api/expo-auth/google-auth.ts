import { TRPCError } from '@trpc/server';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import { encode, JWT } from 'next-auth/jwt';
import { PrismaAuth } from '../expo-auth';
import { ISS_GOOGLE_VALUES, MY_EXPO_URLS, SECRET } from './constants';
import { AuthResponse } from './zod';
import { AdapterUser } from 'next-auth/adapters';
import { Account } from 'next-auth/core/types';

interface DecodedJwtPayload extends JwtPayload {
  name: string;
  email: string;
  picture: string;
}
export async function signInWithGoogle(response: AuthResponse) {
  if (
    !response?.authentication?.idToken ||
    !response.authentication.accessToken
  ) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Failed to authenticate',
      cause: 'Missing oAuth Information',
    });
  }

  const verifyJwtFromExpoAuthGoogle = await fetch(
    `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${response.authentication.accessToken}`
  );

  // Verified Result from Google
  const verifiedResult: JwtPayload = await verifyJwtFromExpoAuthGoogle.json();

  // id_token from Expo App
  const decodedIdToken = jwtDecode<JwtPayload>(response.authentication.idToken);

  // Check JwtPayloads from Google and from Expo match and are valid
  if (
    !ISS_GOOGLE_VALUES.some((iss) => decodedIdToken.iss === iss) ||
    !(
      decodedIdToken?.aud === verifiedResult?.aud &&
      decodedIdToken?.aud === process.env.GOOGLE_CLIENT_ID
    ) ||
    decodedIdToken.sub !== verifiedResult.sub ||
    !MY_EXPO_URLS.some((url) => response?.url.startsWith(url))
  ) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }

  if (!decodedIdToken.sub) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid Response' });
  }

  // Check if user already has a Google oAuth Account
  // If they do, create new JWT for authentication and return user
  const currentUserByAccount = await PrismaAuth.getUserByAccount({
    providerAccountId: decodedIdToken.sub,
    provider: 'google',
  });

  if (currentUserByAccount) {
    decodedIdToken.sub = currentUserByAccount.id;
    const newJwt = await encode({
      token: decodedIdToken as JWT,
      secret: SECRET,
    });
    return {
      currentUser: currentUserByAccount,
      jwt: newJwt,
    };
  } else {
    // Check if user without Google oAuth Account is already a user in our database
    // If they are, link Google oAuth Account with existing user, create new JWT for authentication and return user
    const currentUserByEmail = await PrismaAuth.getUserByEmail(
      (decodedIdToken as DecodedJwtPayload).email
    );
    if (currentUserByEmail) {
      const newJwt = await encode({
        token: decodedIdToken as JWT,
        secret: SECRET,
      });
      const newAccount: Account = {
        provider: 'google',
        providerAccountId: decodedIdToken.sub,
        type: 'oauth',
        userId: currentUserByEmail.id,
        access_token: newJwt,
        id_token: response.authentication.idToken,
        token_type: 'Bearer',
        scope:
          'https://www.googleapis.com/auth/userinfo.profile openid https://www.googleapis.com/auth/userinfo.email',
      };
      await PrismaAuth.linkAccount(newAccount);
      return {
        currentUser: currentUserByEmail,
        jwt: newJwt,
      };
    } else {
      // Create new user, create new JWT for authentication and return new user
      const newUser: Omit<AdapterUser, 'id'> = {
        name: (decodedIdToken as DecodedJwtPayload).name,
        email: (decodedIdToken as DecodedJwtPayload).email,
        image: (decodedIdToken as DecodedJwtPayload).picture,
        emailVerified: new Date(),
      };
      const user = await PrismaAuth.createUser(newUser);
      if (user) {
        const newJwt = await encode({
          token: decodedIdToken as JWT,
          secret: SECRET,
        });
        const newAccount: Account = {
          provider: 'google',
          providerAccountId: decodedIdToken.sub,
          type: 'oauth',
          userId: user.id,
          access_token: newJwt,
          id_token: response.authentication.idToken,
          token_type: 'Bearer',
          scope:
            'https://www.googleapis.com/auth/userinfo.profile openid https://www.googleapis.com/auth/userinfo.email',
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

//  const verifiedResult = {
//  azp: 'blablablabla-blablabla.apps.googleusercontent.com', // GOOGLE_CLIENT_ID
//  aud: 'blablablabla-blablabla.apps.googleusercontent.com',// my GOOGLE_CLIENT_ID
//  sub: '12345678901234', // userId
//  scope: 'openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
//  exp: '1658118254',
//  expires_in: '3599',
//  email: 'email@gmail.com', // same email
//  email_verified: 'true',
//  access_type: 'online'
// }
//
// const decodedIdToken = {
// iss: 'https://accounts.google.com', // this exact iss or accounts.google.com
// azp: 'blablablabla-blablabla.apps.googleusercontent.com', // GOOGLE_CLIENT_ID
// aud: 'blablablabla-blablabla.apps.googleusercontent.com', // GOOGLE_CLIENT_ID
// sub: '12345678901234', // userId
// email: 'email@gmail.com',
// email_verified: true,
// at_hash: 'vowjv9wev9ewv9uev',
// name: 'User Name',
// picture: 'https://lh3.googleusercontent.com/a/Ablahblah-blahablh-blah',
// given_name: 'User',
// family_name: 'Name',
// locale: 'en',
// iat: 1658114654,
// exp: 1658118254
// }
