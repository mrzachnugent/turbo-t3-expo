import { TRPCError } from '@trpc/server';
import { decode, JWT } from 'next-auth/jwt';
import { SendVerificationRequestParams } from 'next-auth/providers/email';
import { createTransport } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
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

const server: SMTPTransport['options'] = {
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_SERVER_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.EMAIL_SERVER_REFRESH_TOKEN,
  },
};

// @TODO implement
// 1. sendVerificationRequest
// 2. verify token from login and provide new token

// In expo app
// const redirectUrl = Linking.createURL('path/into/app', {
//   queryParams: { hello: 'world' },
// });
async function sendVerificationRequest(params: SendVerificationRequestParams) {
  const {
    identifier,
    url = 'exp://127.0.0.1:19000/--/path/into/app?hello=world',
  } = params;
  const { host } = new URL(url);
  const transport = createTransport(server);
  const result = await transport.sendMail({
    to: identifier,
    from: process.env.EMAIL_SERVER_USER,
    subject: `Sign in to ${host}`,
    text: text({ url, host }),
    html: html({ url, host }),
  });
  const failed = result.rejected.concat(result.pending).filter(Boolean);
  if (failed.length) {
    throw new Error(`Email(s) (${failed.join(', ')}) could not be sent`);
  }
}

function html(params: { url: string; host: string }) {
  const { url, host } = params;

  const escapedHost = host.replace(/\./g, '&#8203;.');

  const brandColor = '#346df1';
  const buttonText = '#fff';

  const color = {
    background: '#f9f9f9',
    text: '#444',
    mainBackground: '#fff',
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText,
  };

  return `
  <body style="background: ${color.background};">
    <table width="100%" border="0" cellspacing="20" cellpadding="0"
      style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
      <tr>
        <td align="center"
          style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
          Sign in to <strong>${escapedHost}</strong>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                  target="_blank"
                  style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
                  in</a></td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center"
          style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
          If you did not request this email you can safely ignore it.
        </td>
      </tr>
    </table>
  </body>
  `;
}

/** Email Text body (fallback for email clients that don't render HTML, e.g. feature phones) */
function text({ url, host }: { url: string; host: string }) {
  return `Sign in to ${host}\n${url}\n\n`;
}

// HTML <a></a> tag attributes
// http://localhost:3000/api/auth/callback/email?
// callbackUrl=http%3A%2F%2Flocalhost%3A3000%2F&amp;
// token=deb45fa3baa3f7eb151c2263bfc53dbb3abcea5497aa9d3e0690b3797fbb008f&amp;
// email=example%40gmail.com"

// target="_blank"

// data-saferedirecturl=
// "https://www.google.com/url?
// q=http://localhost:3000/api/auth/callback/email?
// callbackUrl%3Dhttp%253A%252F%252Flocalhost%253A3000%252F%26token%3Ddeb45fa3baa3f7eb151c2263bfc53dbb3abcea5497aa9d3e0690b3797fbb008f%26email%3Dexample%2540gmail.com&amp;
// source=gmail&amp;
// ust=1658799806415000&amp;
// usg=AOvVaw3I_ovZ9lRPyC3S46fkBwZM"
