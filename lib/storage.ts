import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const KEYS = {
  QURAN_PROGRESS:     'noor:quran_progress',
  LESSON_COMPLETIONS: 'noor:lesson_completions',
  DHIKR_TODAY:        'noor:dhikr_today',
  STREAK:             'noor:streak',
  LAST_ACTIVE:        'noor:last_active',
  ONBOARDING_DONE:    'noor:onboarding_done',
  LANGUAGE:           'noor:language',
};

export type JuzStatus = 'unread' | 'reading' | 'complete';
export type QuranProgress = Record<number, JuzStatus>;

async function getUser() {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user ?? null;
  } catch { return null; }
}

//  QURAN PROGRESS 
export async function getQuranProgress(): Promise<QuranProgress> {
  try {
    const local = await AsyncStorage.getItem(KEYS.QURAN_PROGRESS);
    const prog  = local ? JSON.parse(local) : {};
    const user  = await getUser();
    if (!user) return prog;
    const { data } = await supabase
      .from('noor_quran_progress')
      .select('juz, status')
      .eq('user_id', user.id);
    if (data && data.length > 0) {
      data.forEach(function(row: any) { prog[row.juz] = row.status; });
      await AsyncStorage.setItem(KEYS.QURAN_PROGRESS, JSON.stringify(prog));
    }
    return prog;
  } catch { return {}; }
}

export async function setJuzStatus(juz: number, status: JuzStatus): Promise<void> {
  try {
    const p = await getQuranProgress();
    p[juz]  = status;
    await AsyncStorage.setItem(KEYS.QURAN_PROGRESS, JSON.stringify(p));
    const user = await getUser();
    if (!user) return;
    await supabase.from('noor_quran_progress').upsert(
      { user_id: user.id, juz, status, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,juz' }
    );
  } catch {}
}

//  LESSON COMPLETIONS 
export async function getCompletedLessons(): Promise<string[]> {
  try {
    const local = await AsyncStorage.getItem(KEYS.LESSON_COMPLETIONS);
    const local_ids: string[] = local ? JSON.parse(local) : [];
    const user = await getUser();
    if (!user) return local_ids;
    const { data } = await supabase
      .from('noor_lesson_completions')
      .select('lesson_id')
      .eq('user_id', user.id);
    if (data && data.length > 0) {
      const cloud_ids = data.map(function(r: any) { return r.lesson_id; });
      const merged    = Array.from(new Set([...local_ids, ...cloud_ids]));
      await AsyncStorage.setItem(KEYS.LESSON_COMPLETIONS, JSON.stringify(merged));
      return merged;
    }
    return local_ids;
  } catch { return []; }
}

export async function markLessonComplete(lessonId: string): Promise<void> {
  try {
    const existing = await getCompletedLessons();
    if (existing.indexOf(lessonId) !== -1) return;
    const updated  = [...existing, lessonId];
    await AsyncStorage.setItem(KEYS.LESSON_COMPLETIONS, JSON.stringify(updated));
    const user = await getUser();
    if (!user) return;
    await supabase.from('noor_lesson_completions').upsert(
      { user_id: user.id, lesson_id: lessonId, completed_at: new Date().toISOString() },
      { onConflict: 'user_id,lesson_id' }
    );
  } catch {}
}

//  STREAK 
export async function getStreak(): Promise<{ count: number; lastDate: string }> {
  try {
    const local = await AsyncStorage.getItem(KEYS.STREAK);
    const loc   = local ? JSON.parse(local) : { count: 0, lastDate: '' };
    const user  = await getUser();
    if (!user) return loc;
    const { data } = await supabase
      .from('noor_streaks')
      .select('count, last_date')
      .eq('user_id', user.id)
      .single();
    if (data) return { count: data.count, lastDate: data.last_date || '' };
    return loc;
  } catch { return { count: 0, lastDate: '' }; }
}

export async function saveStreak(count: number, lastDate: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.STREAK, JSON.stringify({ count, lastDate }));
    const user = await getUser();
    if (!user) return;
    await supabase.from('noor_streaks').upsert(
      { user_id: user.id, count, last_date: lastDate, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  } catch {}
}

//  BOOKMARKS 
export async function getBookmarks(): Promise<number[]> {
  try {
    const local = await AsyncStorage.getItem('noor:bookmarks');
    const loc   = local ? JSON.parse(local) : [];
    const user  = await getUser();
    if (!user) return loc;
    const { data } = await supabase
      .from('noor_bookmarks')
      .select('page')
      .eq('user_id', user.id);
    if (data && data.length > 0) {
      const cloud  = data.map(function(r: any) { return r.page; });
      const merged = Array.from(new Set([...loc, ...cloud])) as number[];
      await AsyncStorage.setItem('noor:bookmarks', JSON.stringify(merged));
      return merged;
    }
    return loc;
  } catch { return []; }
}

export async function addBookmark(page: number): Promise<void> {
  try {
    const existing = await getBookmarks();
    if (existing.indexOf(page) !== -1) return;
    const updated  = [...existing, page];
    await AsyncStorage.setItem('noor:bookmarks', JSON.stringify(updated));
    const user = await getUser();
    if (!user) return;
    await supabase.from('noor_bookmarks').upsert(
      { user_id: user.id, page },
      { onConflict: 'user_id,page' }
    );
  } catch {}
}

export async function removeBookmark(page: number): Promise<void> {
  try {
    const existing = await getBookmarks();
    const updated  = existing.filter(function(p) { return p !== page; });
    await AsyncStorage.setItem('noor:bookmarks', JSON.stringify(updated));
    const user = await getUser();
    if (!user) return;
    await supabase.from('noor_bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('page', page);
  } catch {}
}

//  LANGUAGE 
export async function setLanguage(lang: string): Promise<void> {
  try { await AsyncStorage.setItem(KEYS.LANGUAGE, lang); } catch {}
}

export async function getLanguage(): Promise<string> {
  try { return (await AsyncStorage.getItem(KEYS.LANGUAGE)) || 'en'; }
  catch { return 'en'; }
}

//  PROFILE UPDATE 
export async function updateProfile(name: string): Promise<void> {
  try {
    const user = await getUser();
    if (!user) return;
    await supabase.from('noor_profiles').upsert(
      { id: user.id, name, email: user.email },
      { onConflict: 'id' }
    );
    await supabase.auth.updateUser({ data: { name } });
  } catch {}
}

//  SYNC ALL ON LOGIN 
export async function syncOnLogin(): Promise<void> {
  try {
    const user = await getUser();
    if (!user) return;
    const prog    = await AsyncStorage.getItem(KEYS.QURAN_PROGRESS);
    const lessons = await AsyncStorage.getItem(KEYS.LESSON_COMPLETIONS);
    const bkmarks = await AsyncStorage.getItem('noor:bookmarks');
    if (prog) {
      const p = JSON.parse(prog) as QuranProgress;
      for (const juz in p) {
        await supabase.from('noor_quran_progress').upsert(
          { user_id: user.id, juz: parseInt(juz), status: p[juz], updated_at: new Date().toISOString() },
          { onConflict: 'user_id,juz' }
        );
      }
    }
    if (lessons) {
      const ids: string[] = JSON.parse(lessons);
      for (const id of ids) {
        await supabase.from('noor_lesson_completions').upsert(
          { user_id: user.id, lesson_id: id },
          { onConflict: 'user_id,lesson_id' }
        );
      }
    }
    if (bkmarks) {
      const pages: number[] = JSON.parse(bkmarks);
      for (const page of pages) {
        await supabase.from('noor_bookmarks').upsert(
          { user_id: user.id, page },
          { onConflict: 'user_id,page' }
        );
      }
    }
  } catch(e) { }
}

//  ONBOARDING 
export async function isOnboardingDone(): Promise<boolean> {
  try { return (await AsyncStorage.getItem('noor:onboarding_done')) === 'true'; }
  catch { return false; }
}

export async function setOnboardingDone(): Promise<void> {
  try { await AsyncStorage.setItem('noor:onboarding_done', 'true'); }
  catch {}
}

//  DHIKR 
export async function getDhikrCounts(): Promise<Record<string,number>> {
  try {
    const today = new Date().toISOString().slice(0,10);
    const raw   = await AsyncStorage.getItem('noor:dhikr:' + today);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

//  DHIKR TODAY 
export async function getTodayDhikr(): Promise<{subhanallah:number;alhamdulillah:number;allahuakbar:number}> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const raw   = await AsyncStorage.getItem('noor:dhikr:' + today);
    const counts = raw ? JSON.parse(raw) : {};
    return {
      subhanallah:   counts['d1'] || 0,
      alhamdulillah: counts['d2'] || 0,
      allahuakbar:   counts['d3'] || 0,
    };
  } catch {
    return { subhanallah: 0, alhamdulillah: 0, allahuakbar: 0 };
  }
}
