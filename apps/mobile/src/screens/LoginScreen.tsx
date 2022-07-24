import { FC, useEffect } from 'react';
import { Button, Image, Text, View, ViewStyle } from 'react-native';
import { LoginOptions } from '../components';
import { useAuth } from '../hooks';
import { useStore } from '../store';
import { trpc } from '../utils/trpc';
import NetInfo from '@react-native-community/netinfo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CENTER_CENTER: ViewStyle = {
  alignItems: 'center',
  justifyContent: 'center',
};

const ROOT: ViewStyle = {
  flex: 1,
  backgroundColor: '#fff',
  ...CENTER_CENTER,
};

export const LoginScreen: FC = () => {
  const { bottom } = useSafeAreaInsets();
  const {
    session,
    loadingSession,
    hasInternetConnection,
    setHasInternetConnection,
  } = useStore();
  const hello = trpc.useQuery(['example.hello', { text: 'from tRPC' }]);
  const { signOut } = useAuth();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setHasInternetConnection(Boolean(state.isConnected));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (loadingSession)
    return (
      <View style={ROOT}>
        <Text>Loading session...</Text>
      </View>
    );

  return (
    <View style={ROOT}>
      <View style={CENTER_CENTER}>
        <View style={{ height: 12 }} />
        <MaterialCommunityIcons
          name='application-brackets-outline'
          size={72}
          color='black'
        />
        <Text
          style={{
            fontSize: 27,
            fontFamily: 'poppins700',
          }}
        >
          Turbo-t3-expo
        </Text>
        <Text style={{ fontSize: 16 }}>
          {!hello.data ? 'Loading tRPC query...' : hello.data.greeting}
        </Text>

        <View style={{ height: 32 }} />
        {!session ? (
          <LoginOptions />
        ) : (
          <View>
            <Text>Successfully authenticated!</Text>
            <Text>Name: {session.name}</Text>
            <Text>Email: {session.email}</Text>
            <Text>ID: {session.id}</Text>
            <View style={{ height: 24 }} />
            <View style={{ alignItems: 'center' }}>
              <Image
                source={{ uri: session.image }}
                style={{ width: 44, height: 44, borderRadius: 50 }}
                resizeMode='cover'
              />
            </View>
            <View
              style={{
                height: 24,
              }}
            />
            <Button onPress={signOut} title='Log out' />
          </View>
        )}
      </View>
      <Text
        style={{
          fontSize: 14,
          position: 'absolute',
          bottom: bottom ? bottom : 4,
        }}
      >
        {hasInternetConnection
          ? 'You are connected to the internet'
          : 'You are not connected to the internet'}
      </Text>
    </View>
  );
};
