import {
  Dimensions,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  Platform,
} from 'react-native';
import { useAuth } from '../hooks';
import MaterialIcon from '@expo/vector-icons/MaterialCommunityIcons';
import { FC } from 'react';
import * as Haptics from 'expo-haptics';

export const LoginOptions = () => {
  const { googleSignIn, githubSignIn } = useAuth();

  return (
    <>
      <OAuthLoginButton
        onPress={googleSignIn.promptAsync}
        disabled={googleSignIn.isDisabled}
        provider='google'
      />
      <View style={{ height: 12 }} />
      <OAuthLoginButton
        onPress={githubSignIn.promptAsync}
        disabled={githubSignIn.isDisabled}
        provider='github'
      />
      <View style={{ height: 12 }} />
      {Platform.OS === 'ios' && (
        <OAuthLoginButton
          onPress={() => {
            console.log('TODO');
          }}
          disabled={true}
          provider='apple'
        />
      )}
    </>
  );
};

const BUTTON_ROOT: ViewStyle = {
  borderWidth: 1,
  borderColor: '#00000050',
  borderRadius: 50,
  width: Dimensions.get('screen').width - 24,
  maxWidth: 350,
  paddingVertical: 16,
  justifyContent: 'center',
  alignItems: 'center',
};

interface OAuthLoginButtonProps {
  onPress(): void;
  disabled: boolean;
  provider: 'google' | 'github' | 'apple';
}

const OAuthLoginButton: FC<OAuthLoginButtonProps> = ({
  onPress,
  disabled,
  provider,
}) => {
  function handleOnPress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={handleOnPress}
      style={BUTTON_ROOT}
    >
      <MaterialIcon
        name={provider}
        size={27}
        style={{ position: 'absolute', left: 24 }}
      />
      <Text style={{ fontWeight: '600', fontSize: 17 }}>
        Continue with{' '}
        <Text style={{ textTransform: 'capitalize' }}>{provider}</Text>
      </Text>
    </TouchableOpacity>
  );
};
