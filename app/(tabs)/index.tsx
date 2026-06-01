import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fonts } from '../../constants/colors';
import { BookOpenIcon, DhikrIco, LearnIcon, DuaIcon } from '../../components/Icons';
import { getCompletedLessons, getQuranProgress } from '../../lib/storage';

const AYAHS = [
  ["اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ", "Al-Alaq 96:1", "Read in the name of your Lord who created."],
  ["فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي", "Al-Baqarah 2:152", "Remember Me and I will remember you. Be grateful to Me and do not be ungrateful."],
  ["إِنَّ مَعَ الْعُسْرِ يُسْرًا", "Ash-Sharh 94:6", "Indeed, with hardship comes ease."],
  ["وَلَذِكْرُ اللَّهِ أَكْبَرُ", "Al-Ankabut 29:45", "And the remembrance of Allah is greatest."],
  ["رَبِّ زِدْنِي عِلْمًا", "Ta-Ha 20:114", "My Lord, increase me in knowledge."],
  ["حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", "Al-Imran 3:173", "Allah is sufficient for us and He is the best Disposer of affairs."],
  ["إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", "Al-Baqarah 2:153", "Indeed, Allah is with the patient."],
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function ActionIcon({ type }) {
  const cfgs = {
    book:  { bg: 'rgba(201,168,76,0.15)',  color: '#C9A84C', icon: 'book'  },
    dhikr: { bg: 'rgba(147,197,253,0.15)', color: '#93C5FD', icon: 'dhikr' },
    learn: { bg: 'rgba(110,231,183,0.15)', color: '#6EE7A0', icon: 'learn' },
    duas:  { bg: 'rgba(253,230,138,0.15)', color: '#FCD34D', icon: 'duas'  },
  };
  const cfg = cfgs[type] || cfgs.book;
  return (
    <View style={{ width:48, height:48, borderRadius:24, alignItems:'center', justifyContent:'center', marginBottom:12, backgroundColor: cfg.bg }}>
      {cfg.icon === 'book'  && <BookSvgIcon  color={cfg.color}/>}
      {cfg.icon === 'dhikr' && <DhikrSvgIcon color={cfg.color}/>}
      {cfg.icon === 'learn' && <LearnSvgIcon color={cfg.color}/>}
      {cfg.icon === 'duas'  && <DuasSvgIcon  color={cfg.color}/>}
    </View>
  );
}

function BookSvgIcon({ color }) {
  const Svg  = require('react-native-svg').default;
  const Rect = require('react-native-svg').Rect;
  const Line = require('react-native-svg').Line;
  return <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={2} width={18} height={20} rx={2} stroke={color} strokeWidth={1.6}/>
    <Line x1={7} y1={2} x2={7} y2={22} stroke={color} strokeWidth={1.4} strokeOpacity={0.5}/>
    <Line x1={10} y1={8} x2={19} y2={8} stroke={color} strokeWidth={1.2} strokeOpacity={0.6}/>
    <Line x1={10} y1={12} x2={19} y2={12} stroke={color} strokeWidth={1.2} strokeOpacity={0.4}/>
  </Svg>;
}

function DhikrSvgIcon({ color }) {
  const Svg    = require('react-native-svg').default;
  const Circle = require('react-native-svg').Circle;
  const Line   = require('react-native-svg').Line;
  return <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.6}/>
    <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.4}/>
    <Line x1={12} y1={3} x2={12} y2={6} stroke={color} strokeWidth={1.4} strokeLinecap="round"/>
  </Svg>;
}

function LearnSvgIcon({ color }) {
  const Svg      = require('react-native-svg').default;
  const Path     = require('react-native-svg').Path;
  return <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3L2 8l10 5 10-5-10-5z" stroke={color} strokeWidth={1.6} strokeLinejoin="round"/>
    <Path d="M2 8v6M6 10.5v5a6 6 0 0012 0v-5" stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
  </Svg>;
}

function DuasSvgIcon({ color }) {
  const Svg  = require('react-native-svg').default;
  const Path = require('react-native-svg').Path;
  const Line = require('react-native-svg').Line;
  return <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" stroke={color} strokeWidth={1.6} strokeLinejoin="round"/>
    <Path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" stroke={color} strokeWidth={1.6} strokeLinejoin="round"/>
  </Svg>;
}


export default function HomeScreen() {
  const [greeting,    setGreeting]    = useState('Good Evening');
  const [streak,      setStreak]      = useState(0);
  const [juzDone,     setJuzDone]     = useState(0);
  const [lessonsDone, setLessonsDone] = useState(0);
  const [lastPage,    setLastPage]    = useState(null);
  const [nextPrayer,  setNextPrayer]  = useState(null);

  const day  = new Date().getDay();
  const ayah = AYAHS[day % AYAHS.length];

  const load = useCallback(async () => {
    try {
      const h = new Date().getHours();
      setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening');

      const lastDate  = await AsyncStorage.getItem('noor:streak:date');
      const lastCount = parseInt((await AsyncStorage.getItem('noor:streak:count')) || '0');
      const today     = todayStr();
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      let newStreak   = 1;
      if (lastDate === today)          newStreak = lastCount;
      else if (lastDate === yesterday) newStreak = lastCount + 1;
      setStreak(newStreak);
      await AsyncStorage.setItem('noor:streak:date',  today);
      await AsyncStorage.setItem('noor:streak:count', String(newStreak));

      const prog = await getQuranProgress();
      setJuzDone(Object.values(prog).filter(v => v === 'complete').length);

      const lessons = await getCompletedLessons();
      setLessonsDone(lessons.length);

      const lp = await AsyncStorage.getItem('noor:last_read_page');
      if (lp) setLastPage(parseInt(lp));
    } catch {}
  }, []);

  const fetchPrayer = useCallback(async () => {
    try {
      const res  = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Columbus&country=US&method=2');
      const data = await res.json();
      const t    = data.data && data.data.timings;
      if (!t) return;
      const now    = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const pList  = [
        { name: 'Fajr',    time: t.Fajr    },
        { name: 'Dhuhr',   time: t.Dhuhr   },
        { name: 'Asr',     time: t.Asr     },
        { name: 'Maghrib', time: t.Maghrib  },
        { name: 'Isha',    time: t.Isha     },
      ];
      var next = null;
      for (var i = 0; i < pList.length; i++) {
        var parts = pList[i].time.split(':');
        var ph = parseInt(parts[0]);
        var pm = parseInt(parts[1]);
        if (ph * 60 + pm > nowMin) { next = pList[i]; break; }
      }
      if (!next) next = pList[0];
      var nparts = next.time.split(':');
      var nh = parseInt(nparts[0]);
      var nm = parseInt(nparts[1]);
      var diff = nh * 60 + nm - nowMin;
      if (diff < 0) diff += 1440;
      var hrs = Math.floor(diff / 60);
      var mins = diff % 60;
      var ampm = nh >= 12 ? 'PM' : 'AM';
      var hf   = nh % 12 || 12;
      setNextPrayer({
        name:      next.name,
        time:      hf + ':' + (nm < 10 ? '0' : '') + nm + ' ' + ampm,
        countdown: hrs > 0 ? 'in ' + hrs + 'h ' + mins + 'm' : 'in ' + mins + ' min',
      });
    } catch {}
  }, []);

  useEffect(() => { load(); fetchPrayer(); }, []);

  const ACTIONS = [
    { label: 'Quran',    sub: lastPage ? 'Page ' + lastPage : 'Start reading', route: '/(tabs)/quran',    type: 'book'  },
    { label: 'Dhikr',   sub: 'Daily adhkar',                                   route: '/(tabs)/dhikr',   type: 'dhikr' },
    { label: 'Madarasa', sub: lessonsDone + ' / 33 done',                      route: '/(tabs)/madarasa', type: 'learn' },
    { label: 'Duas',    sub: '52 supplications',                                route: '/(tabs)/duas',    type: 'duas'  },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >

        {/* Header */}
        <View style={s.header}>
          <Text style={s.greeting}>{greeting}</Text>
          <Text style={s.headline}>Assalamu Alaykum</Text>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          {[
            { n: streak,      l: 'Day Streak', color: colors.gold },
            { n: juzDone,     l: 'Juz Done',   color: '#34D399'   },
            { n: lessonsDone, l: 'Lessons',     color: '#93C5FD'   },
          ].map((st, i) => (
            <View key={i} style={s.statCard}>
              <Text style={[s.statNum, { color: st.color }]}>{st.n}</Text>
              <Text style={s.statLabel}>{st.l}</Text>
            </View>
          ))}
        </View>

        {/* Prayer card */}
        {nextPrayer && (
          <View style={s.prayerCard}>
            <View>
              <Text style={s.prayerEyebrow}>NEXT PRAYER</Text>
              <Text style={s.prayerName}>{nextPrayer.name}</Text>
              <Text style={s.prayerCountdown}>{nextPrayer.countdown}</Text>
            </View>
            <Text style={s.prayerTime}>{nextPrayer.time}</Text>
          </View>
        )}

        {/* Daily ayah */}
        <View style={s.ayahCard}>
          <Text style={s.ayahEyebrow}>DAILY AYAH</Text>
          <Text style={s.ayahArabic}>{ayah[0]}</Text>
          <View style={s.ayahDivider}/>
          <Text style={s.ayahTranslation}>{ayah[2]}</Text>
          <Text style={s.ayahRef}>{ayah[1]}</Text>
        </View>

        {/* Quick access */}
        <Text style={s.sectionTitle}>Quick Access</Text>
        <View style={s.grid}>
          {ACTIONS.map((a, i) => (
            <TouchableOpacity
              key={i}
              style={s.actionCard}
              onPress={() => router.push(a.route)}
              activeOpacity={0.82}
            >
              <ActionIcon type={a.type}/>
              <Text style={s.actionLabel}>{a.label}</Text>
              <Text style={s.actionSub}>{a.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Juz grid */}
        <Text style={s.sectionTitle}>Juz Progress</Text>
        <View style={s.juzGrid}>
          {Array.from({ length: 30 }, function(_, i) { return i + 1; }).map(function(j) {
            return (
              <View key={j} style={[s.juzCell, juzDone >= j && s.juzDone]}>
                <Text style={[s.juzNum, juzDone >= j && s.juzNumDone]}>{j}</Text>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex:1, backgroundColor:colors.bg },
  scroll:          { flex:1, paddingHorizontal:20 },

  header:          { paddingTop:20, marginBottom:20 },
  greeting:        { fontFamily:fonts.regular, fontSize:14, color:colors.muted, marginBottom:4 },
  headline:        { fontFamily:fonts.bold, fontSize:30, color:colors.ink },

  statsRow:        { flexDirection:'row', gap:10, marginBottom:14 },
  statCard:        { flex:1, backgroundColor:colors.card, borderRadius:16, paddingVertical:16, paddingHorizontal:10, borderWidth:1, borderColor:colors.border, alignItems:'center' },
  statNum:         { fontFamily:fonts.bold, fontSize:28, lineHeight:30, marginBottom:4 },
  statLabel:       { fontFamily:fonts.regular, fontSize:11, color:colors.muted, textAlign:'center' },

  prayerCard:      { backgroundColor:colors.green, borderRadius:20, paddingVertical:18, paddingHorizontal:20, marginBottom:14, flexDirection:'row', justifyContent:'space-between', alignItems:'center', borderWidth:1, borderColor:'rgba(201,168,76,0.18)' },
  prayerEyebrow:   { fontFamily:fonts.medium, fontSize:10, color:'rgba(245,240,232,0.5)', letterSpacing:0.8, marginBottom:4 },
  prayerName:      { fontFamily:fonts.bold, fontSize:22, color:colors.ink, marginBottom:2 },
  prayerCountdown: { fontFamily:fonts.regular, fontSize:13, color:'rgba(245,240,232,0.5)' },
  prayerTime:      { fontFamily:fonts.bold, fontSize:24, color:colors.gold },

  ayahCard:        { backgroundColor:colors.card, borderRadius:20, padding:20, marginBottom:20, borderWidth:1, borderColor:colors.border },
  ayahEyebrow:     { fontFamily:fonts.medium, fontSize:10, color:colors.gold, letterSpacing:0.8, marginBottom:14 },
  ayahArabic:      { fontFamily:fonts.arabic, fontSize:22, color:colors.gold, textAlign:'right', lineHeight:42, marginBottom:16 },
  ayahDivider:     { height:1, backgroundColor:colors.border, marginBottom:12 },
  ayahTranslation: { fontFamily:fonts.regular, fontSize:14, color:colors.ink, lineHeight:22, marginBottom:8 },
  ayahRef:         { fontFamily:fonts.medium, fontSize:11, color:colors.muted },

  sectionTitle:    { fontFamily:fonts.semibold, fontSize:16, color:colors.ink, marginBottom:12 },

  grid:            { flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:24 },
  actionCard:      { width:'47.5%', backgroundColor:colors.card, borderRadius:18, padding:16, borderWidth:1, borderColor:colors.border },
  actionLabel:     { fontFamily:fonts.semibold, fontSize:15, color:colors.ink, marginBottom:3 },
  actionSub:       { fontFamily:fonts.regular, fontSize:12, color:colors.muted },

  juzGrid:         { flexDirection:'row', flexWrap:'wrap', gap:7 },
  juzCell:         { width:'13.5%', aspectRatio:1, borderRadius:10, backgroundColor:colors.card, alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:colors.border },
  juzDone:         { backgroundColor:'rgba(45,106,79,0.35)', borderColor:'rgba(45,106,79,0.5)' },
  juzNum:          { fontFamily:fonts.bold, fontSize:12, color:colors.gold },
  juzNumDone:      { color:'#34D399' },
});
