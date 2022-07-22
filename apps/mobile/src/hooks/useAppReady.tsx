import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useStore } from '../store';

SplashScreen.preventAutoHideAsync();

export const useAppReady = () => {
  const { setIsAppReady, isAppReady } = useStore();
  const customFonts = useFonts({
    poppins: Poppins_400Regular,
    poppins500: Poppins_500Medium,
    poppins600: Poppins_600SemiBold,
    poppins700: Poppins_700Bold,
    poppins800: Poppins_800ExtraBold,
  });

  useEffect(() => {
    if (customFonts[1]) {
      console.error({ fontsLoadingError: customFonts[1] });
    }
    if (customFonts[0] && !isAppReady) {
      setIsAppReady(true);
      SplashScreen.hideAsync();
    }
  }, [customFonts]);
};
