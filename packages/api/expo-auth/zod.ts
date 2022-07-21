import { z } from 'zod';

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

export const SignInResponseInput = z
  .object({
    type: z.string(),
    errorCode: z.string().nullable().optional(),
    error: AuthErrorShape.nullable().optional(),
    params: z.record(z.string(), z.any()).nullable().optional(),
    authentication: AuthTokenResponseShape.nullable().optional(),
    url: z.string(),
  })
  .nullable();

export type AuthResponse = z.infer<typeof SignInResponseInput>;
