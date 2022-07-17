import { FC } from 'react';
import { View, Text, ViewStyle } from 'react-native';
import GoogleLogIn from '../components/GoogleLogin';
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
  const hello = trpc.useQuery(['example.hello', { text: 'Mobile' }]);
  const restricted = trpc.useQuery(['auth.getSecretMessage']);
  if (!hello.data) return <Text>Loading...</Text>;
  return (
    <View style={ROOT}>
      <View style={CENTER_CENTER}>
        <Text>{hello.data.greeting}</Text>
        <Text>{restricted.data}</Text>
        <GoogleLogIn />
      </View>
    </View>
  );
};
