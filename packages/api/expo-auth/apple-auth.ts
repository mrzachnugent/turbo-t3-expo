import type {
  AppleAuthenticationFullName,
  AppleAuthenticationUserDetectionStatus,
} from 'expo-apple-authentication';
import * as jwt from 'jsonwebtoken';
import { AuthResponse } from './zod';
import { TRPCError } from '@trpc/server';
import { PrismaAuth } from './prisma-auth';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import { encode, JWT } from 'next-auth/jwt';
import { SECRET } from './constants';
import { AdapterUser } from 'next-auth/adapters';
import { Account } from 'next-auth/core/types';

const IS_TESTING = true;

const privateKey = process.env.PRIVATE_KEY as jwt.Secret;

type AppleAuthenticationCredential = {
  user: string;
  state: string | null;
  fullName: AppleAuthenticationFullName | null;
  email: string | null;
  realUserStatus: AppleAuthenticationUserDetectionStatus;
  identityToken: string | null;
  authorizationCode: string | null;
};

interface DecodedJwtPayload extends JwtPayload {
  name: string;
  email: string;
  picture: string;
}

export async function signInWithApple(response: AuthResponse) {
  const params = response?.params as AppleAuthenticationCredential;

  if (!params.authorizationCode || !params.identityToken) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Failed to authenticate',
      cause: 'Missing oAuth Information',
    });
  }

  // To generate a signed JWT:
  // Create the JWT header.
  const header = {
    alg: 'ES256',
    kid: process.env.KEY_ID,
  };
  // Create the JWT payload.
  const payload = {
    iss: process.env.TEAM_ID,
    iat: Math.floor(Date.now() / 1000),
    exp: 30 * 24 * 60 * 60, // 30 days
    aud: 'https://appleid.apple.com',
    sub: process.env.APPLE_CLIENT_ID,
  };

  // Sign the JWT.
  const getClientSecret = () =>
    jwt.sign(payload, privateKey, {
      algorithm: 'ES256',
      header,
      expiresIn: '30d',
    });

  // Verify authorizationCode
  const verifyAuthCode = await fetch('https://appleid.apple.com/auth/token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.APPLE_CLIENT_ID, // bundler ex: com.company.product_name
      client_secret: getClientSecret(), // This is a JWT token signed with the .p8 file generated while creating the Sign in with Apple key
      code: params.authorizationCode,
      grant_type: 'authorization_code',
      redirect_uri: '', // can be an empty string
    }),
  });

  const verifiedResult = await verifyAuthCode.json();
  console.log({ verifiedResult });
  // access_token - (Reserved for future use) A token used to access allowed data. Currently, no data set has been defined for access. Valid for an hour.
  // expires_in - The amount of time, in seconds, before the access token expires.
  // id_token - A JSON Web Token that contains the user’s identity information.
  // refresh_token - The refresh token used to regenerate new access tokens. Store this token securely on your server.
  // token_type - The type of access token. It will always be "bearer".

  // id_token from Expo App
  const decodedIdToken = jwtDecode<JwtPayload>(verifiedResult.id_token);
  console.log({ decodedIdToken });
  if (!decodedIdToken.sub) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid Response' });
  }

  if (IS_TESTING) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'Testing so throw error here',
    });
  }
  // Check if user already has a Apple oAuth Account
  // If they do, create new JWT for authentication and return user
  const currentUserByAccount = await PrismaAuth.getUserByAccount({
    providerAccountId: decodedIdToken.sub,
    provider: 'apple',
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
    // Check if user without Apple oAuth Account is already a user in our database
    // If they are, link Apple oAuth Account with existing user, create new JWT for authentication and return user
    const currentUserByEmail = await PrismaAuth.getUserByEmail(
      (decodedIdToken as DecodedJwtPayload).email
    );
    if (currentUserByEmail) {
      const newJwt = await encode({
        token: decodedIdToken as JWT,
        secret: SECRET,
      });
      const newAccount: Account = {
        provider: 'apple',
        providerAccountId: decodedIdToken.sub,
        type: 'oauth',
        userId: currentUserByEmail.id,
        access_token: newJwt,
        id_token: verifiedResult.id_token,
        token_type: 'bearer',
        scope: 'name,email',
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
        emailVerified: new Date(),
      };

      const user = await PrismaAuth.createUser(newUser);
      if (user) {
        const newJwt = await encode({
          token: decodedIdToken as JWT,
          secret: SECRET,
        });
        const newAccount: Account = {
          provider: 'apple',
          providerAccountId: decodedIdToken.sub,
          type: 'oauth',
          userId: user.id,
          access_token: newJwt,
          id_token: verifiedResult.id_token,
          token_type: 'bearer',
          scope: 'name,email',
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
