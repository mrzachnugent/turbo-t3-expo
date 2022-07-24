import { StatusBar } from 'expo-status-bar';
import { FC, useState } from 'react';
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useStore } from '../store';
import { getJWT } from '../utils/secure-store';
import { transformer, trpc } from '../utils/trpc';

export const Provider: FC = ({ children }) => {
  const { token, setToken } = useStore();
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      url: `${process.env.NEXT_API_URL}/api/trpc`,
      async headers() {
        if (token) {
          return {
            Authorization: token,
          };
        }
        try {
          const localToken = await getJWT();
          if (localToken) {
            setToken(localToken);
            return {
              Authorization: localToken,
            };
          }

          return {
            Authorization: '',
          };
        } catch (err) {
          console.log({ CREATE_TRPC_CLIENT_HEADER: err });
          return {
            Authorization: '',
          };
        }
      },
      transformer,
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style='dark' />
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          {children}
        </SafeAreaProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
};
