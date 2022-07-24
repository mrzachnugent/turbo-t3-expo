import {
  Dimensions,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  Platform,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks';
import MaterialIcon from '@expo/vector-icons/MaterialCommunityIcons';
import { FC } from 'react';
import * as Haptics from 'expo-haptics';
import * as AppleAuthentication from 'expo-apple-authentication';

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
      {Platform.OS === 'ios' && <AppleLoginButton />}
    </>
  );
};

const BUTTON_ROOT: ViewStyle = {
  borderWidth: 1,
  borderColor: '#00000050',
  borderRadius: 5,
};

const INNER_BOUTTON: ViewStyle = {
  height: 50,
  width: Dimensions.get('screen').width - 24,
  maxWidth: 350,
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'row',
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
    <View style={BUTTON_ROOT}>
      <TouchableOpacity
        disabled={disabled}
        onPress={handleOnPress}
        style={INNER_BOUTTON}
      >
        <MaterialIcon name={provider} size={19} />
        <View style={{ width: 4 }} />
        <Text style={{ fontFamily: 'poppins500', fontSize: 17 }}>
          Continue with{' '}
          <Text style={{ textTransform: 'capitalize' }}>{provider}</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const AppleLoginButton = () => {
  // const { appleSignIn } = useAuth();

  function signIn() {
    Alert.alert('NOT IMPLEMENTED');
    return;
  }
  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={5}
      style={INNER_BOUTTON}
      onPress={signIn}
    />
  );
};
