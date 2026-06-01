import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';
import * as Location from 'expo-location';
import { LocationIcon } from '../../components/Icons';
import { colors, fonts } from '../../constants/colors';

const PRAYERS = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];

const PRAYER_AR = {
  Fajr:'الفجر', Sunrise:'الشروق',
  Dhuhr:'الظهر', Asr:'العصر',
  Maghrib:'المغرب', Isha:'العشاء',
};

const PRAYER_COLORS = {
  Fajr: '#6366F1', Sunrise: '#F59E0B', Dhuhr: '#EF4444',
  Asr: '#3B82F6', Maghrib: '#F97316', Isha: '#8B5CF6',
};

function PrayerIcon({ name, size, color }) {
  const c = color || '#fff';
  const s = size || 28;
  if (name === 'Fajr') return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={c} strokeWidth={1.8} strokeLinecap="round"/>
    </Svg>
  );
  if (name === 'Sunrise') return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path d="M17 18a5 5 0 00-10 0" stroke={c} strokeWidth={1.8} strokeLinecap="round"/>
      <Line x1={12} y1={2} x2={12} y2={9} stroke={c} strokeWidth={1.8} strokeLinecap="round"/>
      <Polyline points="8 6 12 2 16 6" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      <Line x1={3} y1={18} x2={21} y2={18} stroke={c} strokeWidth={1.8} strokeLinecap="round"/>
    </Svg>
  );
  if (name === 'Dhuhr') return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={5} stroke={c} strokeWidth={1.8}/>
      <Line x1={12} y1={1} x2={12} y2={3} stroke={c} strokeWidth={1.8} strokeLinecap="round"/>
      <Line x1={12} y1={21} x2={12} y2={23} stroke={c} strokeWidth={1.8} strokeLinecap="round"/>
      <Line x1={4.22} y1={4.22} x2={5.64} y2={5.64} stroke={c} strokeWidth={1.8} strokeLinecap="round"/>
      <Line x1={18.36} y1={18.36} x2={19.78} y2={19.78} stroke={c} strokeWidth={1.8} strokeLinecap="round"/>
      <Line x1={1} y1={12} x2={3} y2={12} stroke={c} strokeWidth={1.8} strokeLinecap="round"/>
      <Line x1={21} y1={12} x2={23} y2={12} stroke={c} strokeWidth={1.8} strokeLinecap="round"/>
    </Svg>
  );
  if (name === 'Asr') return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" stroke={c} strokeWidth={1.8} strokeLinejoin="round"/>
    </Svg>
  );
  if (name === 'Maghrib') return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path d="M17 18a5 5 0 00-10 0" stroke={c} strokeWidth={1.8} strokeLinecap="round"/>
      <Line x1={12} y1={9} x2={12} y2={2} stroke={c} strokeWidth={1.8} strokeLinecap="round"/>
      <Polyline points="16 5 12 9 8 5" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      <Line x1={3} y1={18} x2={21} y2={18} stroke={c} strokeWidth={1.8} strokeLinecap="round"/>
    </Svg>
  );
  // Isha
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={c} strokeWidth={1.8} strokeLinecap="round"/>
      <Line x1={18} y1={3} x2={18} y2={3.01} stroke={c} strokeWidth={2.5} strokeLinecap="round"/>
      <Line x1={21} y1={6} x2={21} y2={6.01} stroke={c} strokeWidth={2.5} strokeLinecap="round"/>
      <Line x1={15} y1={6} x2={15} y2={6.01} stroke={c} strokeWidth={2.5} strokeLinecap="round"/>
    </Svg>
  );
}

function getNextPrayer(times) {
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  for (const p of PRAYERS) {
    if (!times[p]) continue;
    const [h, m] = times[p].split(':').map(Number);
    if (h * 60 + m > cur) return p;
  }
  return 'Fajr';
}

function formatTime(time) {
  if (!time) return '--:--';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return hour + ':' + m.toString().padStart(2,'0') + ' ' + ampm;
}

function timeUntil(time) {
  if (!time) return '';
  const now = new Date();
  const [h, m] = time.split(':').map(Number);
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  const diff = Math.floor((target.getTime() - now.getTime()) / 60000);
  const hours = Math.floor(diff / 60);
  const mins  = diff % 60;
  if (hours > 0) return 'in ' + hours + 'h ' + mins + 'm';
  return 'in ' + mins + 'm';
}

export default function PrayerScreen() {
  const [times,      setTimes]      = useState({});
  const [location,   setLocation]   = useState('');
  const [date,       setDate]       = useState('');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [nextPrayer, setNextPrayer] = useState('');

  useEffect(function() {
    loadPrayerTimes();
    const interval = setInterval(function() {
      setNextPrayer(function() { return getNextPrayer(times); });
    }, 60000);
    return function() { clearInterval(interval); };
  }, []);

  async function loadPrayerTimes() {
    try {
      setLoading(true); setError('');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission required for prayer times.');
        setLoading(false); return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      const { latitude, longitude } = loc.coords;

      const geo     = await fetch('https://nominatim.openstreetmap.org/reverse?lat=' + latitude + '&lon=' + longitude + '&format=json');
      const geoData = await geo.json();
      const city    = geoData.address?.city || geoData.address?.town || geoData.address?.state || 'Your Location';
      const country = geoData.address?.country_code?.toUpperCase() || '';
      setLocation(city + ', ' + country);

      const today   = new Date();
      const dateStr = today.getDate() + '-' + (today.getMonth()+1) + '-' + today.getFullYear();
      setDate(today.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' }));

      const res  = await fetch('https://api.aladhan.com/v1/timings/' + dateStr + '?latitude=' + latitude + '&longitude=' + longitude + '&method=2');
      const data = await res.json();
      const t    = data.data.timings;
      const pt   = { Fajr:t.Fajr, Sunrise:t.Sunrise, Dhuhr:t.Dhuhr, Asr:t.Asr, Maghrib:t.Maghrib, Isha:t.Isha };
      setTimes(pt);
      setNextPrayer(getNextPrayer(pt));
      setLoading(false);
    } catch(e) {
      setError('Could not load prayer times. Check your connection.');
      setLoading(false);
    }
  }

  const next = nextPrayer || 'Fajr';
  const nextColor = PRAYER_COLORS[next] || colors.gold;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Prayer Times</Text>
          {location ? (
            <View style={{ flexDirection:'row', alignItems:'center', gap:5, marginTop:4 }}>
              <LocationIcon size={13} color={colors.gold}/>
              <Text style={s.location}>{location}</Text>
            </View>
          ) : null}
          {date ? <Text style={s.date}>{date}</Text> : null}
        </View>

        {loading ? (
          <View style={s.center}>
            <ActivityIndicator color={colors.gold} size="large"/>
            <Text style={s.loadingTxt}>Getting your location...</Text>
          </View>
        ) : error ? (
          <View style={s.errorCard}>
            <Text style={s.errorTxt}>{error}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={loadPrayerTimes} activeOpacity={0.8}>
              <Text style={s.retryTxt}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Next prayer hero card */}
            {times[next] ? (
              <View style={[s.heroCard, { borderColor: nextColor + '40' }]}>
                <View style={[s.heroIconWrap, { backgroundColor: nextColor + '20' }]}>
                  <PrayerIcon name={next} size={36} color={nextColor}/>
                </View>
                <Text style={s.heroLabel}>NEXT PRAYER</Text>
                <Text style={[s.heroName, { color: '#fff' }]}>{next}</Text>
                <Text style={[s.heroAr, { color: nextColor }]}>{PRAYER_AR[next]}</Text>
                <Text style={s.heroTime}>{formatTime(times[next])}</Text>
                <View style={[s.heroPill, { backgroundColor: nextColor + '25', borderColor: nextColor + '40' }]}>
                  <Text style={[s.heroPillTxt, { color: nextColor }]}>{timeUntil(times[next])}</Text>
                </View>
              </View>
            ) : null}

            {/* Prayer list */}
            <View style={s.list}>
              {PRAYERS.map(function(prayer, i) {
                const isNext   = prayer === next;
                const pColor   = PRAYER_COLORS[prayer];
                return (
                  <View key={prayer} style={[
                    s.row,
                    i < PRAYERS.length - 1 && s.rowBorder,
                    isNext && { backgroundColor: 'rgba(201,168,76,0.04)' },
                  ]}>
                    <View style={[s.iconBox, { backgroundColor: pColor + '18' }]}>
                      <PrayerIcon name={prayer} size={20} color={pColor}/>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.pName, isNext && { color: colors.gold, fontFamily: fonts.bold }]}>{prayer}</Text>
                      <Text style={s.pAr}>{PRAYER_AR[prayer]}</Text>
                    </View>
                    <Text style={[s.pTime, isNext && { color: colors.gold }]}>{formatTime(times[prayer])}</Text>
                    {isNext ? <View style={[s.activeDot, { backgroundColor: colors.gold }]}/> : <View style={s.activeDot}/>}
                  </View>
                );
              })}
            </View>

            <TouchableOpacity style={s.refreshBtn} onPress={loadPrayerTimes} activeOpacity={0.8}>
              <Text style={s.refreshTxt}>Refresh times</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex:1, backgroundColor:colors.bg },
  scroll:       { flex:1, paddingHorizontal:20 },
  header:       { paddingTop:20, marginBottom:24 },
  title:        { fontFamily:fonts.bold, fontSize:32, color:colors.ink, marginBottom:2 },
  location:     { fontFamily:fonts.medium, fontSize:14, color:colors.gold },
  date:         { fontFamily:fonts.regular, fontSize:13, color:colors.muted, marginTop:3 },

  center:       { alignItems:'center', paddingVertical:60, gap:16 },
  loadingTxt:   { fontFamily:fonts.regular, fontSize:14, color:colors.muted },

  errorCard:    { backgroundColor:colors.card, borderRadius:20, padding:28, alignItems:'center', borderWidth:1, borderColor:colors.border, gap:16 },
  errorTxt:     { fontFamily:fonts.regular, fontSize:14, color:colors.muted, textAlign:'center', lineHeight:22 },
  retryBtn:     { backgroundColor:colors.green, borderRadius:14, paddingHorizontal:28, paddingVertical:13 },
  retryTxt:     { fontFamily:fonts.semibold, fontSize:14, color:'#fff' },

  heroCard:     { backgroundColor:colors.green, borderRadius:28, padding:28, alignItems:'center', marginBottom:20, borderWidth:1 },
  heroIconWrap: { width:72, height:72, borderRadius:36, alignItems:'center', justifyContent:'center', marginBottom:16 },
  heroLabel:    { fontFamily:fonts.medium, fontSize:10, color:'rgba(255,255,255,0.45)', letterSpacing:1, marginBottom:8 },
  heroName:     { fontFamily:fonts.bold, fontSize:32, marginBottom:4 },
  heroAr:       { fontFamily:fonts.arabic, fontSize:20, marginBottom:16 },
  heroTime:     { fontFamily:fonts.bold, fontSize:52, color:'#fff', lineHeight:56, marginBottom:14 },
  heroPill:     { paddingHorizontal:16, paddingVertical:7, borderRadius:20, borderWidth:1 },
  heroPillTxt:  { fontFamily:fonts.semibold, fontSize:13 },

  list:         { backgroundColor:colors.card, borderRadius:22, borderWidth:1, borderColor:colors.border, overflow:'hidden', marginBottom:16 },
  row:          { flexDirection:'row', alignItems:'center', gap:14, paddingVertical:16, paddingHorizontal:18 },
  rowBorder:    { borderBottomWidth:1, borderBottomColor:colors.border },
  iconBox:      { width:42, height:42, borderRadius:21, alignItems:'center', justifyContent:'center', flexShrink:0 },
  pName:        { fontFamily:fonts.semibold, fontSize:15, color:colors.ink },
  pAr:          { fontFamily:fonts.arabic, fontSize:13, color:colors.muted, marginTop:2 },
  pTime:        { fontFamily:fonts.bold, fontSize:15, color:colors.ink },
  activeDot:    { width:8, height:8, borderRadius:4, marginLeft:4 },

  refreshBtn:   { alignSelf:'center', paddingHorizontal:24, paddingVertical:10, borderRadius:20, borderWidth:1, borderColor:colors.border },
  refreshTxt:   { fontFamily:fonts.medium, fontSize:13, color:colors.muted },
});
