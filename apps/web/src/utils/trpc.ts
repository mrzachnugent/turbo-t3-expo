// src/utils/trpc.ts
import type { AppRouter } from 'api';
import { createReactQueryHooks } from '@trpc/react';

type Trpc = ReturnType<typeof createReactQueryHooks<AppRouter>>;

export const trpc: Trpc = createReactQueryHooks<AppRouter>();

/**
 * Check out tRPC docs for Inference Helpers
 * https://trpc.io/docs/infer-types#inference-helpers
 */
