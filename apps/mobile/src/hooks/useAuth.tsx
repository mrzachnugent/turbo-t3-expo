import * as AppleAuthentication from 'expo-apple-authentication';
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

const redirectToExpoAppUri = makeRedirectUri({
  useProxy: true,
});

type SignInResponseInput = inferMutationInput<'expo-auth.signIn'>['response'];
type SignInProvider = inferMutationInput<'expo-auth.signIn'>['provider'];

export const useAuth = () => {
  const { setSession, setToken, setLoadingSession } = useStore();

  const googleSignIn = useGoogleAuth();
  const githubSignIn = useGithubAuth();
  const appleSignIn = useAppleAuth();

  const utils = trpc.useContext();
  trpc.useQuery(['expo-auth.getSession'], {
    onSuccess(data) {
      setSession(data);
    },
    onError(err) {
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
    githubSignIn,
    appleSignIn,
    signOut,
  };
};

const useGoogleAuth = () => {
  const { signIn } = useSignIn();
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    scopes: ['openid', 'profile', 'email'],
    redirectUri: redirectToExpoAppUri,
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
      signIn(response, 'google');
    }
  }, [response]);

  return { isDisabled: !request, promptAsync: () => promptAsync() };
};

const GITHUB_DISCOVERY = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint: `https://github.com/settings/connections/applications/${process.env.GITHUB_ID}`,
};

const useGithubAuth = () => {
  const { signIn } = useSignIn();
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.GITHUB_ID,
      scopes: ['read:user', 'user:email'],
      redirectUri: redirectToExpoAppUri,
    },
    GITHUB_DISCOVERY
  );

  useEffect(() => {
    if (response?.type === 'success') {
      signIn(response, 'github');
    }
  }, [response]);

  return {
    isDisabled: !request,
    promptAsync: () => promptAsync({ useProxy: true }),
  };
};

const useAppleAuth = () => {
  const { signIn } = useSignIn();

  async function promptAsync() {
    try {
      // type AppleAuthenticationCredential
      const credential: AppleAuthenticationCredential =
        await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });

      signIn(
        {
          type: 'success',
          authentication: { accessToken: credential.authorizationCode },
          params: credential,
        },
        'apple'
      );
    } catch (err) {
      console.log('useAppleAuth', err);
    }
  }

  return {
    isDisabled: false,
    promptAsync,
  };
};

type AppleAuthenticationCredential = {
  user: string;
  state: string | null;
  fullName: AppleAuthentication.AppleAuthenticationFullName | null;
  email: string | null;
  realUserStatus: AppleAuthentication.AppleAuthenticationUserDetectionStatus;
  identityToken: string | null;
  authorizationCode: string | null;
};

interface AppleAuthSessionResult {
  type: 'success' | 'error';
  authentication: { accessToken: string | null };
  params: AppleAuthentication.AppleAuthenticationCredential;
}

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

  async function signIn(
    response: AuthSessionResult | AppleAuthSessionResult,
    provider: SignInProvider
  ) {
    setLoadingSession(true);
    try {
      const result = await signInMutation.mutateAsync({
        response: response as SignInResponseInput,
        provider,
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
