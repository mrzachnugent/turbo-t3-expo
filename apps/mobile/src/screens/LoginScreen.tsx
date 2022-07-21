import { FC } from 'react';
import { Button, Image, Text, View, ViewStyle } from 'react-native';
import { GoogleLogIn } from '../components';
import { useAuth } from '../hooks';
import { useStore } from '../store';
import { trpc } from '../utils/trpc';

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
  const { session, loadingSession } = useStore();
  const hello = trpc.useQuery(['example.hello', { text: 'from tRPC' }]);
  const { signOut } = useAuth();

  if (loadingSession)
    return (
      <View style={ROOT}>
        <Text>Loading session...</Text>
      </View>
    );

  return (
    <View style={ROOT}>
      <View style={CENTER_CENTER}>
        <Text style={{ fontSize: 27 }}>
          {!hello.data ? 'Loading tRPC query' : hello.data.greeting}
        </Text>
        <View style={{ height: 18 }} />
        {!session ? (
          <GoogleLogIn />
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
    </View>
  );
};
