import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

export async function saveJWT(jwt: string) {
  try {
    SecureStore.setItemAsync(process.env.SECURE_STORE_JWT_KEY, jwt);
  } catch (err) {
    Alert.alert('ERROR', 'Unable to sign in.');
  }
}

export async function getJWT() {
  try {
    return await SecureStore.getItemAsync(process.env.SECURE_STORE_JWT_KEY);
  } catch (err) {
    Alert.alert('UH OH', 'Something unexpected happened.');
    return null;
  }
}

export async function clearToken() {
  try {
    SecureStore.setItemAsync(process.env.SECURE_STORE_JWT_KEY, '');
  } catch (err) {
    Alert.alert('ERROR', 'Cannot log out at this time.');
  }
}
