import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpenIcon, StarIcon, StreakIcon, CheckIcon } from '../../components/Icons';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import { colors } from '../../constants/colors';
import { getQuranProgress, getCompletedLessons, getStreak, getTodayDhikr } from '../../lib/storage';
import { useAuth } from '../../hooks/useAuth';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getWeekDates(): Date[] {
  const today = new Date();
  const day = today.getDay();
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d);
  }
  return dates;
}

export default function SummaryScreen() {
  const { profile } = useAuth();
  const [juzDone, setJuzDone] = useState(0);
  const [lessons, setLessons] = useState(0);
  const [streak, setStreak] = useState(0);
  const [dhikrDone, setDhikrDone] = useState(false);
  const weekDates = getWeekDates();
  const today = new Date();

  useEffect(() => {
    getQuranProgress().then(q => setJuzDone(Object.values(q).filter(v => v==='complete').length)).catch(()=>{});
    getCompletedLessons().then(l => setLessons(l.length)).catch(()=>{});
    getStreak().then(setStreak).catch(()=>{});
    getTodayDhikr().then(d => {
      setDhikrDone(d.subhanallah>=33 && d.alhamdulillah>=33 && d.allahuakbar>=34);
    }).catch(()=>{});
  }, []);

  const displayName = profile?.name?.split(' ')[0] || '';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const STATS = [
    { label:'Juz Complete', value:juzDone, total:30, icon:'book', color:colors.mid },
    { label:'Lessons Done', value:lessons, total:33, icon:'star', color:'#7C3AED' },
    { label:'Day Streak',   value:streak,  total:null, icon:'streak', color:colors.gold },
    { label:'Dhikr Today',  value:dhikrDone?1:0, total:1, icon:'circle', color:'#0369A1' },
  ];

  const CHECKLIST = [
    { label:'Read Quran today',        done: juzDone > 0 },
    { label:'Complete a lesson',       done: lessons > 0 },
    { label:'Count daily dhikr',       done: dhikrDone },
    { label:'Check prayer times',      done: false },
    { label:'Read a dua',              done: false },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.greeting}>{greeting}{displayName ? `, ${displayName}` : ''}</Text>
          <Text style={s.title}>Weekly Summary</Text>
          <Text style={s.date}>{today.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</Text>
        </View>

        {/* Week strip */}
        <View style={s.weekStrip}>
          {weekDates.map((d, i) => {
            const isToday = d.toDateString() === today.toDateString();
            return (
              <View key={i} style={[s.dayCol, isToday && s.dayColActive]}>
                <Text style={[s.dayName, isToday && s.dayNameActive]}>{DAYS[d.getDay()]}</Text>
                <View style={[s.dayCircle, isToday && s.dayCircleActive]}>
                  <Text style={[s.dayNum, isToday && s.dayNumActive]}>{d.getDate()}</Text>
                </View>
                <View style={[s.dayDot, isToday && s.dayDotActive]}/>
              </View>
            );
          })}
        </View>

        {/* Stats grid */}
        <View style={s.statsGrid}>
          {STATS.map(stat => {
            const pct = stat.total ? Math.round((stat.value/stat.total)*100) : null;
            return (
              <View key={stat.label} style={s.statCard}>
                <View style={s.statIconWrap}>
                  {stat.icon === 'book'   && <BookOpenIcon size={24} color={stat.color}/>}
                  {stat.icon === 'star'   && <StarIcon size={24} color={stat.color}/>}
                  {stat.icon === 'streak' && <StreakIcon size={24} color={stat.color}/>}
                  {stat.icon === 'circle' && <CheckIcon size={24} color={stat.color}/>}
                </View>
                <Text style={[s.statValue, {color:stat.color}]}>{stat.value}{stat.total ? `/${stat.total}` : ''}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
                {pct !== null && (
                  <View style={s.statBar}>
                    <View style={[s.statBarFill, {width:`${pct}%`, backgroundColor:stat.color}]}/>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Daily checklist */}
        <Text style={s.sectionTitle}>Today's Checklist</Text>
        <View style={s.checklist}>
          {CHECKLIST.map((item, i) => (
            <View key={i} style={s.checkRow}>
              <View style={[s.check, item.done && s.checkDone]}>
                {item.done && <CheckIcon size={14} color='#34D399'/>}
              </View>
              <Text style={[s.checkLabel, item.done && s.checkLabelDone]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Motivational quote */}
        <View style={s.quoteCard}>
          <Text style={s.quoteAr}>وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا</Text>
          <Text style={s.quoteEn}>And whoever fears Allah — He will make for them a way out.</Text>
          <Text style={s.quoteRef}>At-Talaq 65:2</Text>
        </View>

        {/* Streak message */}
        <View style={s.streakCard}>
          <StreakIcon size={32} color={colors.gold}/>
          <View style={{flex:1}}>
            <Text style={s.streakTitle}>{streak} Day Streak</Text>
            <Text style={s.streakSub}>
              {streak === 0 ? 'Start your streak today. Open the Quran tracker.' :
               streak < 7  ? 'Keep going. You are building a great habit.' :
               streak < 30 ? `${streak} days strong. MashaAllah!` :
               `${streak} days. SubhanAllah — remarkable consistency.`}
            </Text>
          </View>
        </View>

        <View style={{height:32}}/>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:{ flex:1, backgroundColor:colors.bg },
  scroll:{ flex:1, paddingHorizontal:20 },
  header:{ paddingTop:20, marginBottom:24 },
  greeting:{ fontSize:13, color:colors.muted, marginBottom:4 },
  title:{ fontSize:32, color:colors.ink, fontWeight:'600', marginBottom:4 },
  date:{ fontSize:13, color:colors.muted },
  weekStrip:{ flexDirection:'row', backgroundColor:colors.card, borderRadius:16, padding:12, marginBottom:20, borderWidth:1, borderColor:colors.border, justifyContent:'space-between' },
  dayCol:{ alignItems:'center', gap:4, flex:1 },
  dayColActive:{ },
  dayName:{ fontSize:10, color:colors.muted, fontWeight:'500' },
  dayNameActive:{ color:colors.gold },
  dayCircle:{ width:28, height:28, borderRadius:14, alignItems:'center', justifyContent:'center' },
  dayCircleActive:{ backgroundColor:colors.green },
  dayNum:{ fontSize:13, color:colors.muted, fontWeight:'500' },
  dayNumActive:{ color:'#fff', fontWeight:'700' },
  dayDot:{ width:4, height:4, borderRadius:2, backgroundColor:'transparent' },
  dayDotActive:{ backgroundColor:colors.gold },
  statsGrid:{ flexDirection:'row', flexWrap:'wrap', gap:12, marginBottom:24 },
  statCard:{ flex:1, minWidth:'45%', backgroundColor:colors.card, borderRadius:16, padding:16, borderWidth:1, borderColor:colors.border },
  statIcon:{ fontSize:20, marginBottom:8 },
  statValue:{ fontSize:28, fontWeight:'700', lineHeight:32, marginBottom:4 },
  statLabel:{ fontSize:12, color:colors.muted, marginBottom:8 },
  statBar:{ height:4, backgroundColor:'rgba(255,255,255,0.07)', borderRadius:2, overflow:'hidden' },
  statBarFill:{ height:'100%', borderRadius:2 },
  sectionTitle:{ fontSize:16, color:colors.ink, fontWeight:'600', marginBottom:12 },
  checklist:{ backgroundColor:colors.card, borderRadius:16, borderWidth:1, borderColor:colors.border, overflow:'hidden', marginBottom:20 },
  checkRow:{ flexDirection:'row', alignItems:'center', gap:12, padding:16, borderBottomWidth:1, borderBottomColor:colors.border },
  check:{ width:22, height:22, borderRadius:11, borderWidth:1.5, borderColor:colors.border, alignItems:'center', justifyContent:'center', flexShrink:0 },
  checkDone:{ backgroundColor:colors.mid, borderColor:colors.mid },
  checkMark:{ fontSize:11, color:'#fff' },
  checkLabel:{ fontSize:14, color:colors.ink, fontWeight:'500' },
  checkLabelDone:{ color:colors.muted, textDecorationLine:'line-through' },
  quoteCard:{ backgroundColor:'rgba(201,168,76,0.06)', borderRadius:20, padding:24, borderWidth:1, borderColor:'rgba(201,168,76,0.14)', marginBottom:16, alignItems:'center' },
  quoteAr:{ fontSize:20, color:colors.gold, textAlign:'center', marginBottom:10, lineHeight:32 },
  quoteEn:{ fontSize:14, color:colors.ink, textAlign:'center', fontStyle:'italic', lineHeight:22, marginBottom:8 },
  quoteRef:{ fontSize:12, color:colors.muted },
  streakCard:{ backgroundColor:colors.card, borderRadius:16, padding:20, borderWidth:1, borderColor:colors.border, flexDirection:'row', alignItems:'center', gap:16, marginBottom:12 },
  streakIcon:{ fontSize:36 },
  streakTitle:{ fontSize:18, color:colors.ink, fontWeight:'600', marginBottom:4 },
  streakSub:{ fontSize:13, color:colors.muted, lineHeight:20 },
});
