import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { trpc, transformer } from './utils/trpc';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useState } from 'react';

export default function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      url: `http://localhost:3000/api/trpc`,

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
        <HelloWorld />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const HelloWorld = () => {
  const hello = trpc.useQuery(['example.hello', { text: 'Mobile' }]);
  if (!hello.data) return <Text>Loading...</Text>;
  return (
    <View style={styles.container}>
      <Text>{hello.data.greeting}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
