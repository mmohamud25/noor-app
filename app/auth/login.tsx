import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts } from '../../constants/colors';
import { supabase } from '../../lib/supabase';

function getErrorMessage(msg: string): string {
  if (msg.includes('Invalid login'))      return 'Incorrect email or password.';
  if (msg.includes('Email not confirmed'))return 'Please confirm your email first.';
  if (msg.includes('User not found'))     return 'No account found with this email.';
  if (msg.includes('rate limit'))         return 'Too many attempts. Please wait.';
  return 'Something went wrong. Try again.';
}

export default function LoginScreen() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [showPass, setShowPass] = useState(false);

  async function handleLogin() {
    setError('');
    if (!email.trim() || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    try {
      const { error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (e) { setError(getErrorMessage(e.message)); }
      else   { router.replace('/(tabs)'); }
    } catch { setError('Something went wrong. Try again.'); }
    setLoading(false);
  }

  async function handleForgot() {
    if (!email.trim()) { setError('Enter your email above first.'); return; }
    setLoading(true);
    try {
      await supabase.auth.resetPasswordForEmail(email.trim());
      setError('');
      alert('Password reset email sent. Check your inbox.');
    } catch {}
    setLoading(false);
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={s.kav} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.logo}>
            <Text style={s.logoAr}>ن</Text>
          </View>
          <Text style={s.appName}>Noor</Text>
          <Text style={s.tagline}>Your Islamic companion</Text>
        </View>

        {/* Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Welcome back</Text>
          <Text style={s.cardSub}>Sign in to sync your progress</Text>

          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorTxt}>{error}</Text>
            </View>
          ) : null}

          <Text style={s.label}>Email</Text>
          <TextInput
            style={s.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.muted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Text style={s.label}>Password</Text>
          <View style={s.passWrap}>
            <TextInput
              style={[s.input, s.passInput]}
              placeholder="Your password"
              placeholderTextColor={colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              autoComplete="password"
            />
            <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPass(v => !v)} activeOpacity={0.7}>
              <Text style={s.eyeTxt}>{showPass ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.forgotBtn} onPress={handleForgot} activeOpacity={0.7}>
            <Text style={s.forgotTxt}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.loginBtn, (!email || !password) && s.loginBtnDim]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff"/>
              : <Text style={s.loginTxt}>Sign In</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Footer links */}
        <View style={s.footer}>
          <TouchableOpacity onPress={() => router.push('/auth/signup')} activeOpacity={0.8}>
            <Text style={s.footerTxt}>
              No account? <Text style={s.footerLink}>Create one</Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} activeOpacity={0.7} style={{ marginTop: 12 }}>
            <Text style={s.guestTxt}>Continue as guest</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: colors.bg },
  kav:        { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },

  header:     { alignItems: 'center', marginBottom: 32 },
  logo:       { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', marginBottom: 14, borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)' },
  logoAr:     { fontFamily: fonts.arabic, fontSize: 36, color: colors.gold },
  appName:    { fontFamily: fonts.bold, fontSize: 32, color: colors.ink, marginBottom: 6 },
  tagline:    { fontFamily: fonts.regular, fontSize: 14, color: colors.muted },

  card:       { backgroundColor: colors.card, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: colors.border, marginBottom: 24 },
  cardTitle:  { fontFamily: fonts.bold, fontSize: 22, color: colors.ink, marginBottom: 4 },
  cardSub:    { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginBottom: 20 },

  errorBox:   { backgroundColor: 'rgba(229,115,115,0.1)', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(229,115,115,0.3)' },
  errorTxt:   { fontFamily: fonts.medium, fontSize: 13, color: '#E57373' },

  label:      { fontFamily: fonts.medium, fontSize: 13, color: colors.muted, marginBottom: 6, marginTop: 14 },
  input:      { backgroundColor: colors.bg, borderRadius: 12, borderWidth: 1, borderColor: colors.border, color: colors.ink, fontFamily: fonts.regular, fontSize: 15, padding: 13, paddingHorizontal: 16 },
  passWrap:   { position: 'relative' },
  passInput:  { paddingRight: 60 },
  eyeBtn:     { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  eyeTxt:     { fontFamily: fonts.medium, fontSize: 12, color: colors.gold },

  forgotBtn:  { alignSelf: 'flex-end', marginTop: 8, marginBottom: 20 },
  forgotTxt:  { fontFamily: fonts.medium, fontSize: 12, color: colors.gold },

  loginBtn:   { backgroundColor: colors.green, borderRadius: 14, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)' },
  loginBtnDim:{ opacity: 0.6 },
  loginTxt:   { fontFamily: fonts.bold, fontSize: 16, color: '#fff' },

  footer:     { alignItems: 'center' },
  footerTxt:  { fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  footerLink: { fontFamily: fonts.semibold, color: colors.gold },
  guestTxt:   { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
});
