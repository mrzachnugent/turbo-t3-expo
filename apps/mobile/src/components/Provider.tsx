import { StatusBar } from 'expo-status-bar';
import { FC, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { transformer, trpc } from '../utils/trpc';

export const Provider: FC = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      url: 'http://localhost:3000/api/trpc',
      async headers() {
        return {};
      },
      transformer,
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style='dark' />
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
};
