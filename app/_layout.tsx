import { Stack } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import {
  NotoNaskhArabic_400Regular,
  NotoNaskhArabic_700Bold,
} from '@expo-google-fonts/noto-naskh-arabic';
import {
  ScheherazadeNew_400Regular,
  ScheherazadeNew_700Bold,
} from '@expo-google-fonts/scheherazade-new';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Outfit-Regular':  Outfit_400Regular,
    'Outfit-Medium':   Outfit_500Medium,
    'Outfit-SemiBold': Outfit_600SemiBold,
    'Outfit-Bold':     Outfit_700Bold,
    'Arabic-Regular':  NotoNaskhArabic_400Regular,
    'Arabic-Bold':     NotoNaskhArabic_700Bold,
    'Quran-Regular':   ScheherazadeNew_400Regular,
    'Quran-Bold':      ScheherazadeNew_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#0A1410' }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </SafeAreaProvider>
  );
}
