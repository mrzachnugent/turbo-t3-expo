import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';
import { inferMutationInput, trpc } from '../utils/trpc';

type SignInInput = inferMutationInput<'expo-auth.signIn'>;
export default function GoogleLogIn() {
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState<any>();
  const signIn = trpc.useMutation(['expo-auth.signIn']);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    scopes: ['openid', 'profile', 'email'],
    redirectUri: makeRedirectUri({
      useProxy: true,
    }),
  });
  React.useEffect(() => {
    console.log(
      '============================================================='
    );
    if (response?.type === 'success') {
      async function some() {
        const user = await signIn.mutateAsync(response as SignInInput);
        setData(user);
        if (user) {
          setAuthenticated(true);
        }
      }
      some();
    }
  }, [response]);

  return (
    <>
      {!authenticated && (
        <Button
          disabled={!request}
          onPress={() => {
            promptAsync({});
          }}
          title='Login with Google'
        />
      )}

      {authenticated && (
        <View>
          <Text>
            Successfully authenticated! Response: {JSON.stringify(data)}
          </Text>
          <Button
            onPress={() => {
              // Do somehthing
            }}
            title='Log out'
          />
        </View>
      )}
    </>
  );
}
