import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { isOnboardingDone } from '../lib/storage';
import { colors } from '../constants/colors';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    isOnboardingDone().then(done => {
      router.replace(done ? '/(tabs)' : '/onboarding');
    }).catch(() => {
      router.replace('/onboarding');
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.gold} size="large" />
    </View>
  );
}
