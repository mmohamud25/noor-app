import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, 
  ScrollView, TextInput, Alert, Switch, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { updateProfile, getCompletedLessons, getQuranProgress, getStreak } from '../../lib/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const router             = useRouter();
  const { profile, isGuest, refreshProfile } = useAuth();
  const [editingName, setEditingName]   = useState(false);
  const [name,        setName]          = useState('');
  const [saving,      setSaving]        = useState(false);
  const [streak,      setStreak]        = useState(0);
  const [juzDone,     setJuzDone]       = useState(0);
  const [lessonsDone, setLessonsDone]   = useState(0);
  const [pagesRead,   setPagesRead]     = useState(0);
  const [notifOn,     setNotifOn]       = useState(false);

  useEffect(() => {
    if (profile?.name) setName(profile.name);
    loadStats();
  }, [profile]);

  async function loadStats() {
    try {
      const lessons = await getCompletedLessons();
      setLessonsDone(lessons.length);
      const prog  = await getQuranProgress();
      setJuzDone(Object.values(prog).filter(v => v === 'complete').length);
      const lp = await AsyncStorage.getItem('noor:last_read_page');
      if (lp) setPagesRead(parseInt(lp));
      const sk = await AsyncStorage.getItem('noor:streak:count');
      if (sk) setStreak(parseInt(sk));
    } catch {}
  }

  async function saveName() {
    if (!name.trim()) return;
    setSaving(true);
    await updateProfile(name.trim());
    await refreshProfile();
    setSaving(false);
    setEditingName(false);
  }

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => {
        await supabase.auth.signOut();
        router.replace('/auth/login');
      }},
    ]);
  }

  async function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your progress. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/auth/login');
        }},
      ]
    );
  }

  const displayName = profile?.name || profile?.email?.split('@')[0] || 'Guest';
  const initial     = displayName[0]?.toUpperCase() || 'N';

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Profile</Text>
        </View>

        {/* Avatar + name */}
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={s.avatarTxt}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            {editingName ? (
              <View style={s.nameEditRow}>
                <TextInput
                  style={s.nameInput}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  placeholder="Your name"
                  placeholderTextColor={colors.muted}
                />
                <TouchableOpacity style={s.saveBtn} onPress={saveName} activeOpacity={0.85}>
                  {saving
                    ? <ActivityIndicator color="#fff" size="small"/>
                    : <Text style={s.saveBtnTxt}>Save</Text>
                  }
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => !isGuest && setEditingName(true)} activeOpacity={0.8}>
                <Text style={s.profileName}>{isGuest ? 'Guest User' : displayName}</Text>
                {!isGuest && <Text style={s.profileEdit}>Tap to edit name</Text>}
              </TouchableOpacity>
            )}
            <Text style={s.profileEmail}>{isGuest ? 'Not signed in' : (profile?.email || '')}</Text>
          </View>
        </View>

        {/* Stats */}
        <Text style={s.sectionTitle}>Your Progress</Text>
        <View style={s.statsGrid}>
          {[
            { n: streak,      label: 'Day Streak',   color: colors.gold    },
            { n: juzDone,     label: 'Juz Complete',  color: '#34D399'      },
            { n: lessonsDone, label: 'Lessons Done',  color: '#93C5FD'      },
            { n: pagesRead,   label: 'Last Page',     color: colors.muted   },
          ].map((st, i) => (
            <View key={i} style={s.statCard}>
              <Text style={[s.statNum, { color: st.color }]}>{st.n}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Sync status */}
        {!isGuest && (
          <View style={s.syncCard}>
            <View style={s.syncDot}/>
            <Text style={s.syncTxt}>Progress synced to cloud</Text>
          </View>
        )}

        {/* Account */}
        <Text style={s.sectionTitle}>Account</Text>
        <View style={s.menuCard}>
          {isGuest ? (
            <>
              <TouchableOpacity style={s.menuRow} onPress={() => router.push('/auth/signup')} activeOpacity={0.8}>
                <Text style={[s.menuLabel, { color: colors.gold }]}>Create Account</Text>
                <Text style={s.menuArrow}>›</Text>
              </TouchableOpacity>
              <View style={s.menuDivider}/>
              <TouchableOpacity style={s.menuRow} onPress={() => router.push('/auth/login')} activeOpacity={0.8}>
                <Text style={s.menuLabel}>Sign In</Text>
                <Text style={s.menuArrow}>›</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={s.menuRow} onPress={handleSignOut} activeOpacity={0.8}>
                <Text style={s.menuLabel}>Sign Out</Text>
                <Text style={s.menuArrow}>›</Text>
              </TouchableOpacity>
              <View style={s.menuDivider}/>
              <TouchableOpacity style={s.menuRow} onPress={handleDeleteAccount} activeOpacity={0.8}>
                <Text style={[s.menuLabel, { color: '#E57373' }]}>Delete Account</Text>
                <Text style={s.menuArrow}>›</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* App info */}
        <Text style={s.sectionTitle}>App</Text>
        <View style={s.menuCard}>
          <View style={s.menuRow}>
            <Text style={s.menuLabel}>Version</Text>
            <Text style={s.menuValue}>1.0.0</Text>
          </View>
          <View style={s.menuDivider}/>
          <View style={s.menuRow}>
            <Text style={s.menuLabel}>Platform</Text>
            <Text style={s.menuValue}>Noor by Kulan Group</Text>
          </View>
        </View>

        <View style={{ height: 48 }}/>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: colors.bg },
  scroll:       { flex: 1, paddingHorizontal: 20 },
  header:       { paddingTop: 20, marginBottom: 20 },
  title:        { fontFamily: fonts.bold, fontSize: 32, color: colors.ink },

  profileCard:  { backgroundColor: colors.card, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
  avatar:       { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)', flexShrink: 0 },
  avatarTxt:    { fontFamily: fonts.bold, fontSize: 26, color: colors.gold },
  profileName:  { fontFamily: fonts.bold, fontSize: 18, color: colors.ink, marginBottom: 2 },
  profileEdit:  { fontFamily: fonts.regular, fontSize: 11, color: colors.gold, marginBottom: 4 },
  profileEmail: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  nameEditRow:  { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 6 },
  nameInput:    { flex: 1, backgroundColor: colors.bg, borderRadius: 10, borderWidth: 1, borderColor: colors.border, color: colors.ink, fontFamily: fonts.regular, fontSize: 15, padding: 10, paddingHorizontal: 12 },
  saveBtn:      { backgroundColor: colors.green, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  saveBtnTxt:   { fontFamily: fonts.semibold, fontSize: 13, color: '#fff' },

  sectionTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink, marginBottom: 12, marginTop: 4 },

  statsGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  statCard:     { width: '47.5%', backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  statNum:      { fontFamily: fonts.bold, fontSize: 28, lineHeight: 30, marginBottom: 4 },
  statLabel:    { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, textAlign: 'center' },

  syncCard:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(52,211,153,0.08)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(52,211,153,0.2)', marginBottom: 20 },
  syncDot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34D399' },
  syncTxt:      { fontFamily: fonts.medium, fontSize: 13, color: '#34D399' },

  menuCard:     { backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border, marginBottom: 16, overflow: 'hidden' },
  menuRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  menuLabel:    { fontFamily: fonts.medium, fontSize: 15, color: colors.ink },
  menuValue:    { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  menuArrow:    { fontSize: 20, color: colors.muted },
  menuDivider:  { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
});
