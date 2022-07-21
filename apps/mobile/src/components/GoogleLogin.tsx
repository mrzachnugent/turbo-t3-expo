import { Dimensions, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../hooks';

export const GoogleLogIn = () => {
  const {
    googleSignIn: { canSignInGoogle, promptGoogleSignIn },
  } = useAuth();

  function signInGoogle() {
    promptGoogleSignIn();
  }

  return (
    <TouchableOpacity
      disabled={!canSignInGoogle}
      onPress={signInGoogle}
      style={{
        borderWidth: 1,
        borderColor: '#00000050',
        borderRadius: 50,
        width: Dimensions.get('screen').width - 24,
        maxWidth: 350,
        paddingVertical: 16,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ fontWeight: '600', fontSize: 17 }}>
        Continue with Google
      </Text>
    </TouchableOpacity>
  );
};
