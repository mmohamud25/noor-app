import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet,  ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { MoonIcon, SunriseIcon, SunIcon, CloudIcon, SunsetIcon, StarIcon, LocationIcon } from '../../components/Icons';
import { colors } from '../../constants/colors';

const PRAYERS = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
const PRAYER_AR: Record<string,string> = {
  Fajr:'الفجر', Sunrise:'الشروق', Dhuhr:'الظهر',
  Asr:'العصر', Maghrib:'المغرب', Isha:'العشاء',
};
const PRAYER_ICONS: Record<string,string> = {
  Fajr:'moon', Sunrise:'sunrise', Dhuhr:'sun', Asr:'cloud', Maghrib:'sunset', Isha:'star',
};

function getNextPrayer(times: Record<string,string>): string {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  for (const prayer of PRAYERS) {
    if (!times[prayer]) continue;
    const [h, m] = times[prayer].split(':').map(Number);
    if (h * 60 + m > currentMinutes) return prayer;
  }
  return 'Fajr';
}

function formatTime(time: string): string {
  if (!time) return '--:--';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2,'0')} ${ampm}`;
}

function timeUntil(time: string): string {
  if (!time) return '';
  const now = new Date();
  const [h, m] = time.split(':').map(Number);
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  const diff = Math.floor((target.getTime() - now.getTime()) / 60000);
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hours > 0) return `${hours}h ${mins}m away`;
  return `${mins}m away`;
}

export default function PrayerScreen() {
  const [times, setTimes] = useState<Record<string,string>>({});
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nextPrayer, setNextPrayer] = useState('');

  useEffect(() => {
    loadPrayerTimes();
    const interval = setInterval(() => {
      if (Object.keys(times).length > 0) setNextPrayer(getNextPrayer(times));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  async function loadPrayerTimes() {
    try {
      setLoading(true);
      setError('');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission is required to get prayer times.');
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      const { latitude, longitude } = loc.coords;

      const geo = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
      const geoData = await geo.json();
      const city = geoData.address?.city || geoData.address?.town || geoData.address?.state || 'Your Location';
      const country = geoData.address?.country_code?.toUpperCase() || '';
      setLocation(`${city}, ${country}`);

      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}`;
      setDate(today.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' }));

      const res = await fetch(`https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=2`);
      const data = await res.json();
      const t = data.data.timings;
      const prayerTimes: Record<string,string> = {
        Fajr:    t.Fajr,
        Sunrise: t.Sunrise,
        Dhuhr:   t.Dhuhr,
        Asr:     t.Asr,
        Maghrib: t.Maghrib,
        Isha:    t.Isha,
      };
      setTimes(prayerTimes);
      setNextPrayer(getNextPrayer(prayerTimes));
      setLoading(false);
    } catch (e) {
      setError('Could not load prayer times. Check your internet connection.');
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.title}>Prayer Times</Text>
          {location ? <View style={{flexDirection:'row',alignItems:'center',gap:4}}><LocationIcon size={13} color={colors.muted}/><Text style={s.location}>{location}</Text></View> : null}
          {date ? <Text style={s.date}>{date}</Text> : null}
        </View>

        {loading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator color={colors.gold} size="large"/>
            <Text style={s.loadingText}>Getting your location...</Text>
          </View>
        ) : error ? (
          <View style={s.errorCard}>
            <Text style={s.errorText}>{error}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={loadPrayerTimes} activeOpacity={0.8}>
              <Text style={s.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Next prayer highlight */}
            {nextPrayer && times[nextPrayer] && (
              <View style={s.nextCard}>
                <Text style={s.nextLabel}>Next Prayer</Text>
                <Text style={s.nextIcon}>{PRAYER_ICONS[nextPrayer]}</Text>
                <Text style={s.nextName}>{nextPrayer}</Text>
                <Text style={s.nextAr}>{PRAYER_AR[nextPrayer]}</Text>
                <Text style={s.nextTime}>{formatTime(times[nextPrayer])}</Text>
                <Text style={s.nextUntil}>{timeUntil(times[nextPrayer])}</Text>
              </View>
            )}

            {/* All prayers */}
            <View style={s.prayerList}>
              {PRAYERS.map(prayer => {
                const isNext = prayer === nextPrayer;
                return (
                  <View key={prayer} style={[s.prayerRow, isNext && s.prayerRowActive]}>
                    <Text style={s.prayerIcon}>{PRAYER_ICONS[prayer]}</Text>
                    <View style={{flex:1}}>
                      <Text style={[s.prayerName, isNext && s.prayerNameActive]}>{prayer}</Text>
                      <Text style={s.prayerAr}>{PRAYER_AR[prayer]}</Text>
                    </View>
                    <Text style={[s.prayerTime, isNext && s.prayerTimeActive]}>
                      {formatTime(times[prayer])}
                    </Text>
                    {isNext && <View style={s.nextDot}/>}
                  </View>
                );
              })}
            </View>

            <TouchableOpacity style={s.refreshBtn} onPress={loadPrayerTimes} activeOpacity={0.8}>
              <Text style={s.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </>
        )}
        <View style={{height:32}}/>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:{ flex:1, backgroundColor:colors.bg },
  scroll:{ flex:1, paddingHorizontal:20 },
  header:{ paddingTop:20, marginBottom:24 },
  title:{ fontSize:32, color:colors.ink, fontWeight:'600', marginBottom:6 },
  location:{ fontSize:14, color:colors.gold, marginBottom:2 },
  date:{ fontSize:13, color:colors.muted },
  loadingWrap:{ alignItems:'center', paddingVertical:60, gap:16 },
  loadingText:{ fontSize:14, color:colors.muted },
  errorCard:{ backgroundColor:colors.card, borderRadius:16, padding:24, alignItems:'center', borderWidth:1, borderColor:colors.border, gap:16 },
  errorText:{ fontSize:14, color:colors.muted, textAlign:'center', lineHeight:22 },
  retryBtn:{ backgroundColor:colors.green, borderRadius:12, paddingHorizontal:24, paddingVertical:12 },
  retryText:{ fontSize:14, color:'#fff', fontWeight:'600' },
  nextCard:{ backgroundColor:colors.green, borderRadius:24, padding:28, alignItems:'center', marginBottom:20, borderWidth:1, borderColor:'rgba(201,168,76,0.2)' },
  nextLabel:{ fontSize:11, color:'rgba(255,255,255,0.5)', letterSpacing:0.2, textTransform:'uppercase', marginBottom:12 },
  nextIcon:{ fontSize:40, marginBottom:8 },
  nextName:{ fontSize:28, color:'#fff', fontWeight:'700', marginBottom:2 },
  nextAr:{ fontSize:20, color:colors.gold, marginBottom:12 },
  nextTime:{ fontSize:44, color:'#fff', fontWeight:'700', lineHeight:52 },
  nextUntil:{ fontSize:14, color:'rgba(255,255,255,0.55)', marginTop:6 },
  prayerList:{ backgroundColor:colors.card, borderRadius:20, borderWidth:1, borderColor:colors.border, overflow:'hidden', marginBottom:16 },
  prayerRow:{ flexDirection:'row', alignItems:'center', gap:14, padding:18, borderBottomWidth:1, borderBottomColor:colors.border },
  prayerRowActive:{ backgroundColor:'rgba(201,168,76,0.06)' },
  prayerIcon:{ fontSize:22, width:32, textAlign:'center' },
  prayerName:{ fontSize:16, color:colors.ink, fontWeight:'500' },
  prayerNameActive:{ color:colors.gold, fontWeight:'700' },
  prayerAr:{ fontSize:12, color:colors.muted, marginTop:1 },
  prayerTime:{ fontSize:16, color:colors.ink, fontWeight:'600' },
  prayerTimeActive:{ color:colors.gold },
  nextDot:{ width:8, height:8, borderRadius:4, backgroundColor:colors.gold },
  refreshBtn:{ alignSelf:'center', paddingHorizontal:24, paddingVertical:10, borderRadius:20, borderWidth:1, borderColor:colors.border },
  refreshText:{ fontSize:13, color:colors.muted },
});
