import {
  AuthSessionResult,
  makeRedirectUri,
  useAuthRequest,
} from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useStore } from '../store';
import { clearToken, saveJWT } from '../utils/secure-store';
import { inferMutationInput, trpc } from '../utils/trpc';

type SignInResponseInput = inferMutationInput<'expo-auth.signIn'>['response'];

export const useAuth = () => {
  const { setSession, setToken, setLoadingSession } = useStore();

  const utils = trpc.useContext();
  const googleSignIn = useGoogleAuth();
  trpc.useQuery(['expo-auth.getSession'], {
    onSuccess(data) {
      setSession(data);
    },
    onError(err) {
      if (err.message === 'Missing token') {
        console.log('No session');
      }
      if (err.message === 'Token expired') {
        console.log(err);
        signOut();
      }
    },
  });
  async function signOut() {
    setLoadingSession(true);
    try {
      await clearToken();
      utils.queryClient.resetQueries(); // or utils.invalidateQueries()
      setSession(null);
      setToken(null);
    } catch (err) {
      console.log({ SIGN_OUT_ERROR: err });
    } finally {
      setLoadingSession(false);
    }
  }

  return {
    googleSignIn,
    signOut,
  };
};

const useGoogleAuth = () => {
  const { signIn } = useSignIn();
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    scopes: ['openid', 'profile', 'email'],
    redirectUri: makeRedirectUri({
      useProxy: true,
    }),
  });

  useEffect(() => {
    if (response?.type === 'cancel') {
      console.log('useGoogleAuth', 'CANCEL');
    }
    if (response?.type === 'error') {
      console.log('useGoogleAuth', 'ERROR');
    }
    if (response?.type === 'locked') {
      console.log('useGoogleAuth', 'LOCKED');
    }

    if (response?.type === 'success') {
      signIn(response);
    }
  }, [response]);

  return { canSignInGoogle: !!request, promptGoogleSignIn: promptAsync };
};

const githubGiscovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint:
    'https://github.com/settings/connections/applications/<CLIENT_ID>',
};

// @TODO: implement
const useGithubAuth = () => {
  const { signIn } = useSignIn();
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'CLIENT_ID',
      scopes: ['read:user', 'user:email'],
      redirectUri: makeRedirectUri({
        scheme: 'your.app',
      }),
    },
    githubGiscovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      signIn(response);
    }
  }, [response]);

  return { canSignInGithub: !!request, promptGithubSignIn: promptAsync };
};

const useSignIn = () => {
  const { setLoadingSession, setSession, setToken } = useStore();

  const signInMutation = trpc.useMutation(['expo-auth.signIn'], {
    onError(error, variables, context) {
      if (error.message === 'Failed to authenticate') {
        console.log({
          HANDLE_THIS_AUTH_ERROR: error,
          variables,
          context,
        });
      } else {
        console.log({
          HANDLE_ALL_OTHER_AUTH_ERRORS: error,
          variables,
          context,
        });
      }
    },
  });

  async function signIn(response: AuthSessionResult) {
    setLoadingSession(true);
    try {
      console.log({ response });
      const result = await signInMutation.mutateAsync({
        response: response as SignInResponseInput,
        provider: 'google',
      });
      if (!result?.jwt) {
        Alert.alert('ERROR', 'Unable to login at this time.');
        return;
      }
      setSession(result?.currentUser);
      setToken(result?.jwt);
      saveJWT(result?.jwt);
    } catch (err) {
      console.error('Error: useSignIn', err);
    } finally {
      setLoadingSession(false);
    }
  }

  return { signIn };
};
