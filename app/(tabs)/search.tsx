import { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet,  TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fonts } from '../../constants/colors';

const SURAHS = [
  {n:1,name:'Al-Fatihah',ar:'الفاتحة',page:1},
  {n:2,name:'Al-Baqarah',ar:'البقرة',page:2},
  {n:3,name:'Ali Imran',ar:'آل عمران',page:50},
  {n:4,name:'An-Nisa',ar:'النساء',page:77},
  {n:5,name:'Al-Maidah',ar:'المائدة',page:106},
  {n:6,name:'Al-Anam',ar:'الأنعام',page:128},
  {n:7,name:'Al-Araf',ar:'الأعراف',page:151},
  {n:8,name:'Al-Anfal',ar:'الأنفال',page:177},
  {n:9,name:'At-Tawbah',ar:'التوبة',page:187},
  {n:10,name:'Yunus',ar:'يونس',page:208},
  {n:11,name:'Hud',ar:'هود',page:221},
  {n:12,name:'Yusuf',ar:'يوسف',page:235},
  {n:13,name:'Ar-Rad',ar:'الرعد',page:249},
  {n:14,name:'Ibrahim',ar:'إبراهيم',page:255},
  {n:15,name:'Al-Hijr',ar:'الحجر',page:262},
  {n:16,name:'An-Nahl',ar:'النحل',page:267},
  {n:17,name:'Al-Isra',ar:'الإسراء',page:282},
  {n:18,name:'Al-Kahf',ar:'الكهف',page:293},
  {n:19,name:'Maryam',ar:'مريم',page:305},
  {n:20,name:'Ta-Ha',ar:'طه',page:312},
  {n:21,name:'Al-Anbiya',ar:'الأنبياء',page:322},
  {n:22,name:'Al-Hajj',ar:'الحج',page:332},
  {n:23,name:'Al-Muminun',ar:'المؤمنون',page:342},
  {n:24,name:'An-Nur',ar:'النور',page:350},
  {n:25,name:'Al-Furqan',ar:'الفرقان',page:359},
  {n:26,name:'Ash-Shuara',ar:'الشعراء',page:367},
  {n:27,name:'An-Naml',ar:'النمل',page:377},
  {n:28,name:'Al-Qasas',ar:'القصص',page:385},
  {n:29,name:'Al-Ankabut',ar:'العنكبوت',page:396},
  {n:30,name:'Ar-Rum',ar:'الروم',page:404},
  {n:31,name:'Luqman',ar:'لقمان',page:411},
  {n:32,name:'As-Sajdah',ar:'السجدة',page:415},
  {n:33,name:'Al-Ahzab',ar:'الأحزاب',page:418},
  {n:34,name:'Saba',ar:'سبأ',page:428},
  {n:35,name:'Fatir',ar:'فاطر',page:434},
  {n:36,name:'Ya-Sin',ar:'يس',page:440},
  {n:37,name:'As-Saffat',ar:'الصافات',page:446},
  {n:38,name:'Sad',ar:'ص',page:453},
  {n:39,name:'Az-Zumar',ar:'الزمر',page:458},
  {n:40,name:'Ghafir',ar:'غافر',page:467},
  {n:41,name:'Fussilat',ar:'فصلت',page:477},
  {n:42,name:'Ash-Shura',ar:'الشورى',page:483},
  {n:43,name:'Az-Zukhruf',ar:'الزخرف',page:489},
  {n:44,name:'Ad-Dukhan',ar:'الدخان',page:496},
  {n:45,name:'Al-Jathiyah',ar:'الجاثية',page:499},
  {n:46,name:'Al-Ahqaf',ar:'الأحقاف',page:502},
  {n:47,name:'Muhammad',ar:'محمد',page:507},
  {n:48,name:'Al-Fath',ar:'الفتح',page:511},
  {n:49,name:'Al-Hujurat',ar:'الحجرات',page:515},
  {n:50,name:'Qaf',ar:'ق',page:518},
  {n:51,name:'Adh-Dhariyat',ar:'الذاريات',page:520},
  {n:52,name:'At-Tur',ar:'الطور',page:523},
  {n:53,name:'An-Najm',ar:'النجم',page:526},
  {n:54,name:'Al-Qamar',ar:'القمر',page:528},
  {n:55,name:'Ar-Rahman',ar:'الرحمن',page:531},
  {n:56,name:'Al-Waqiah',ar:'الواقعة',page:534},
  {n:57,name:'Al-Hadid',ar:'الحديد',page:537},
  {n:58,name:'Al-Mujadila',ar:'المجادلة',page:542},
  {n:59,name:'Al-Hashr',ar:'الحشر',page:545},
  {n:60,name:'Al-Mumtahanah',ar:'الممتحنة',page:549},
  {n:61,name:'As-Saf',ar:'الصف',page:551},
  {n:62,name:'Al-Jumuah',ar:'الجمعة',page:553},
  {n:63,name:'Al-Munafiqun',ar:'المنافقون',page:554},
  {n:64,name:'At-Taghabun',ar:'التغابن',page:556},
  {n:65,name:'At-Talaq',ar:'الطلاق',page:558},
  {n:66,name:'At-Tahrim',ar:'التحريم',page:560},
  {n:67,name:'Al-Mulk',ar:'الملك',page:562},
  {n:68,name:'Al-Qalam',ar:'القلم',page:564},
  {n:69,name:'Al-Haqqah',ar:'الحاقة',page:566},
  {n:70,name:'Al-Maarij',ar:'المعارج',page:568},
  {n:71,name:'Nuh',ar:'نوح',page:570},
  {n:72,name:'Al-Jinn',ar:'الجن',page:572},
  {n:73,name:'Al-Muzzammil',ar:'المزمل',page:574},
  {n:74,name:'Al-Muddaththir',ar:'المدثر',page:575},
  {n:75,name:'Al-Qiyamah',ar:'القيامة',page:577},
  {n:76,name:'Al-Insan',ar:'الإنسان',page:578},
  {n:77,name:'Al-Mursalat',ar:'المرسلات',page:580},
  {n:78,name:'An-Naba',ar:'النبأ',page:582},
  {n:79,name:'An-Naziat',ar:'النازعات',page:583},
  {n:80,name:'Abasa',ar:'عبس',page:585},
  {n:81,name:'At-Takwir',ar:'التكوير',page:586},
  {n:82,name:'Al-Infitar',ar:'الانفطار',page:587},
  {n:83,name:'Al-Mutaffifin',ar:'المطففين',page:587},
  {n:84,name:'Al-Inshiqaq',ar:'الانشقاق',page:589},
  {n:85,name:'Al-Buruj',ar:'البروج',page:590},
  {n:86,name:'At-Tariq',ar:'الطارق',page:591},
  {n:87,name:'Al-Ala',ar:'الأعلى',page:591},
  {n:88,name:'Al-Ghashiyah',ar:'الغاشية',page:592},
  {n:89,name:'Al-Fajr',ar:'الفجر',page:593},
  {n:90,name:'Al-Balad',ar:'البلد',page:594},
  {n:91,name:'Ash-Shams',ar:'الشمس',page:595},
  {n:92,name:'Al-Layl',ar:'الليل',page:595},
  {n:93,name:'Ad-Duha',ar:'الضحى',page:596},
  {n:94,name:'Ash-Sharh',ar:'الشرح',page:596},
  {n:95,name:'At-Tin',ar:'التين',page:597},
  {n:96,name:'Al-Alaq',ar:'العلق',page:597},
  {n:97,name:'Al-Qadr',ar:'القدر',page:598},
  {n:98,name:'Al-Bayyinah',ar:'البينة',page:598},
  {n:99,name:'Az-Zalzalah',ar:'الزلزلة',page:599},
  {n:100,name:'Al-Adiyat',ar:'العاديات',page:599},
  {n:101,name:'Al-Qariah',ar:'القارعة',page:600},
  {n:102,name:'At-Takathur',ar:'التكاثر',page:600},
  {n:103,name:'Al-Asr',ar:'العصر',page:601},
  {n:104,name:'Al-Humazah',ar:'الهمزة',page:601},
  {n:105,name:'Al-Fil',ar:'الفيل',page:601},
  {n:106,name:'Quraysh',ar:'قريش',page:602},
  {n:107,name:'Al-Maun',ar:'الماعون',page:602},
  {n:108,name:'Al-Kawthar',ar:'الكوثر',page:602},
  {n:109,name:'Al-Kafirun',ar:'الكافرون',page:603},
  {n:110,name:'An-Nasr',ar:'النصر',page:603},
  {n:111,name:'Al-Masad',ar:'المسد',page:603},
  {n:112,name:'Al-Ikhlas',ar:'الإخلاص',page:604},
  {n:113,name:'Al-Falaq',ar:'الفلق',page:604},
  {n:114,name:'An-Nas',ar:'الناس',page:604},
];

async function goToPage(page) {
  await AsyncStorage.setItem('noor:goto_page', String(page));
  router.push('/(tabs)/quran');
}

export default function SearchScreen() {
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [tab,      setTab]      = useState('surah');
  const [searched, setSearched] = useState(false);

  const surahResults = query.trim()
    ? SURAHS.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.ar.includes(query)
      )
    : [];

  async function searchAyahs() {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res  = await fetch(
        'https://api.alquran.cloud/v1/search/' +
        encodeURIComponent(query.trim()) + '/all/en.sahih'
      );
      const data = await res.json();
      const hits = (data.data && data.data.matches) || [];
      setResults(hits.slice(0, 30));
    } catch { setResults([]); }
    setLoading(false);
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Search</Text>
        <Text style={s.sub}>Find any surah or ayah</Text>
      </View>

      <View style={s.searchWrap}>
        <TextInput
          style={s.input}
          placeholder="Search by name or keyword..."
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={t => { setQuery(t); setSearched(false); }}
          onSubmitEditing={() => { if (tab === 'ayah') searchAyahs(); }}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }} style={s.clearBtn} activeOpacity={0.7}>
            <Text style={s.clearTxt}>x</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={s.tabs}>
        {['surah','ayah'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab===t && s.tabActive]} onPress={() => setTab(t)} activeOpacity={0.8}>
            <Text style={[s.tabTxt, tab===t && s.tabTxtActive]}>{t === 'surah' ? 'By Surah' : 'By Keyword'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'ayah' && query.trim().length > 0 && !searched && (
        <TouchableOpacity style={s.searchBtn} onPress={searchAyahs} activeOpacity={0.85}>
          <Text style={s.searchBtnTxt}>Search Ayahs</Text>
        </TouchableOpacity>
      )}

      <ScrollView style={s.list} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal:20, paddingBottom:40 }}>

        {tab === 'surah' && surahResults.map(sr => (
          <TouchableOpacity key={sr.n} style={s.card} onPress={() => goToPage(sr.page)} activeOpacity={0.8}>
            <View style={s.sNum}><Text style={s.sNumTxt}>{sr.n}</Text></View>
            <View style={{ flex:1 }}>
              <Text style={s.sName}>{sr.name}</Text>
              <Text style={s.sMeta}>Page {sr.page}</Text>
            </View>
            <Text style={s.sAr}>{sr.ar}</Text>
          </TouchableOpacity>
        ))}
        {tab === 'surah' && query.trim().length > 0 && surahResults.length === 0 && (
          <View style={s.empty}><Text style={s.emptyTxt}>No surahs found for "{query}"</Text></View>
        )}
        {tab === 'surah' && query.trim().length === 0 && (
          <View style={s.empty}><Text style={s.emptyTxt}>Type a surah name to search</Text></View>
        )}

        {tab === 'ayah' && loading && (
          <View style={s.empty}><ActivityIndicator color={colors.gold} size="large"/></View>
        )}
        {tab === 'ayah' && !loading && results.map((r, i) => {
          const surahNum = r.surah && r.surah.number ? r.surah.number : 1;
          const ayahNum  = r.numberInSurah || 1;
          const page     = r.page || 1;
          return (
            <TouchableOpacity key={i} style={s.ayahCard} onPress={() => goToPage(page)} activeOpacity={0.8}>
              <View style={s.ayahTop}>
                <View style={s.ayahRef}>
                  <Text style={s.ayahRefTxt}>{r.surah && r.surah.englishName} {ayahNum}</Text>
                </View>
                <Text style={s.ayahPage}>Page {page}</Text>
              </View>
              <Text style={s.ayahAr}>{r.text}</Text>
            </TouchableOpacity>
          );
        })}
        {tab === 'ayah' && !loading && searched && results.length === 0 && (
          <View style={s.empty}><Text style={s.emptyTxt}>No results for "{query}"</Text></View>
        )}
        {tab === 'ayah' && !loading && !searched && query.trim().length > 0 && (
          <View style={s.empty}><Text style={s.emptyTxt}>Tap Search Ayahs above</Text></View>
        )}
        {tab === 'ayah' && query.trim().length === 0 && (
          <View style={s.empty}><Text style={s.emptyTxt}>Type a keyword to search ayahs</Text></View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex:1, backgroundColor:colors.bg },
  header:       { paddingHorizontal:20, paddingTop:20, marginBottom:16 },
  title:        { fontFamily:fonts.bold, fontSize:32, color:colors.ink, marginBottom:4 },
  sub:          { fontFamily:fonts.regular, fontSize:14, color:colors.muted },
  searchWrap:   { marginHorizontal:20, marginBottom:12, flexDirection:'row', alignItems:'center', backgroundColor:colors.card, borderRadius:14, borderWidth:1, borderColor:colors.border, paddingHorizontal:14 },
  input:        { flex:1, fontFamily:fonts.regular, fontSize:14, color:colors.ink, paddingVertical:13 },
  clearBtn:     { padding:6 },
  clearTxt:     { fontSize:14, color:colors.muted },
  tabs:         { flexDirection:'row', gap:8, paddingHorizontal:20, marginBottom:12 },
  tab:          { flex:1, paddingVertical:10, borderRadius:12, alignItems:'center', backgroundColor:colors.card, borderWidth:1, borderColor:colors.border },
  tabActive:    { backgroundColor:colors.green, borderColor:'rgba(201,168,76,0.25)' },
  tabTxt:       { fontFamily:fonts.medium, fontSize:13, color:colors.muted },
  tabTxtActive: { color:colors.gold },
  searchBtn:    { marginHorizontal:20, marginBottom:12, backgroundColor:colors.green, borderRadius:14, padding:14, alignItems:'center', borderWidth:1, borderColor:'rgba(201,168,76,0.2)' },
  searchBtnTxt: { fontFamily:fonts.semibold, fontSize:15, color:'#fff' },
  list:         { flex:1 },
  empty:        { alignItems:'center', paddingVertical:48 },
  emptyTxt:     { fontFamily:fonts.regular, fontSize:14, color:colors.muted, textAlign:'center' },
  card:         { flexDirection:'row', alignItems:'center', gap:12, paddingVertical:12, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.05)' },
  sNum:         { width:36, height:36, borderRadius:18, backgroundColor:colors.green, alignItems:'center', justifyContent:'center', flexShrink:0 },
  sNumTxt:      { fontFamily:fonts.bold, fontSize:13, color:colors.gold },
  sName:        { fontFamily:fonts.medium, fontSize:14, color:colors.ink },
  sMeta:        { fontFamily:fonts.regular, fontSize:11, color:colors.muted, marginTop:2 },
  sAr:          { fontFamily:fonts.arabic, fontSize:17, color:colors.gold },
  ayahCard:     { backgroundColor:colors.card, borderRadius:16, padding:16, marginBottom:10, borderWidth:1, borderColor:colors.border },
  ayahTop:      { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
  ayahRef:      { backgroundColor:'rgba(201,168,76,0.1)', borderRadius:8, paddingHorizontal:10, paddingVertical:4, borderWidth:1, borderColor:'rgba(201,168,76,0.2)' },
  ayahRefTxt:   { fontFamily:fonts.semibold, fontSize:12, color:colors.gold },
  ayahPage:     { fontFamily:fonts.regular, fontSize:11, color:colors.muted },
  ayahAr:       { fontFamily:fonts.arabic, fontSize:18, color:colors.gold, textAlign:'right', lineHeight:34 },
});
