import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, 
  ActivityIndicator, ScrollView, Modal, Dimensions, Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fonts } from '../../constants/colors';
import { setJuzStatus } from '../../lib/storage';
import { parseTajweed, TAJWEED_COLORS } from '../../lib/tajweed';
import { useQuranAudio, RECITERS } from '../../hooks/useQuranAudio';

const { width: SW, height: SH } = Dimensions.get('window');

const JUZ_PAGES = {
  1:1,2:22,3:42,4:62,5:82,6:102,7:122,8:142,9:162,10:182,
  11:202,12:222,13:242,14:262,15:282,16:302,17:322,18:342,
  19:362,20:382,21:402,22:422,23:442,24:462,25:482,26:502,
  27:522,28:542,29:562,30:582,
};

function pageToJuz(pg) {
  let j = 1;
  for (let i = 1; i <= 30; i++) { if (pg >= JUZ_PAGES[i]) j = i; }
  return j;
}

const SURAHS = [
  {n:1,name:'Al-Fatihah',ar:'الفاتحة',page:1,juz:1,ayahs:7,type:'Meccan'},
  {n:2,name:'Al-Baqarah',ar:'البقرة',page:2,juz:1,ayahs:286,type:'Medinan'},
  {n:3,name:'Ali Imran',ar:'آل عمران',page:50,juz:3,ayahs:200,type:'Medinan'},
  {n:4,name:'An-Nisa',ar:'النساء',page:77,juz:4,ayahs:176,type:'Medinan'},
  {n:5,name:'Al-Maidah',ar:'المائدة',page:106,juz:6,ayahs:120,type:'Medinan'},
  {n:6,name:'Al-Anam',ar:'الأنعام',page:128,juz:7,ayahs:165,type:'Meccan'},
  {n:7,name:'Al-Araf',ar:'الأعراف',page:151,juz:8,ayahs:206,type:'Meccan'},
  {n:8,name:'Al-Anfal',ar:'الأنفال',page:177,juz:9,ayahs:75,type:'Medinan'},
  {n:9,name:'At-Tawbah',ar:'التوبة',page:187,juz:10,ayahs:129,type:'Medinan'},
  {n:10,name:'Yunus',ar:'يونس',page:208,juz:11,ayahs:109,type:'Meccan'},
  {n:11,name:'Hud',ar:'هود',page:221,juz:11,ayahs:123,type:'Meccan'},
  {n:12,name:'Yusuf',ar:'يوسف',page:235,juz:12,ayahs:111,type:'Meccan'},
  {n:13,name:'Ar-Rad',ar:'الرعد',page:249,juz:13,ayahs:43,type:'Medinan'},
  {n:14,name:'Ibrahim',ar:'إبراهيم',page:255,juz:13,ayahs:52,type:'Meccan'},
  {n:15,name:'Al-Hijr',ar:'الحجر',page:262,juz:14,ayahs:99,type:'Meccan'},
  {n:16,name:'An-Nahl',ar:'النحل',page:267,juz:14,ayahs:128,type:'Meccan'},
  {n:17,name:'Al-Isra',ar:'الإسراء',page:282,juz:15,ayahs:111,type:'Meccan'},
  {n:18,name:'Al-Kahf',ar:'الكهف',page:293,juz:15,ayahs:110,type:'Meccan'},
  {n:19,name:'Maryam',ar:'مريم',page:305,juz:16,ayahs:98,type:'Meccan'},
  {n:20,name:'Ta-Ha',ar:'طه',page:312,juz:16,ayahs:135,type:'Meccan'},
  {n:21,name:'Al-Anbiya',ar:'الأنبياء',page:322,juz:17,ayahs:112,type:'Meccan'},
  {n:22,name:'Al-Hajj',ar:'الحج',page:332,juz:17,ayahs:78,type:'Medinan'},
  {n:23,name:'Al-Muminun',ar:'المؤمنون',page:342,juz:18,ayahs:118,type:'Meccan'},
  {n:24,name:'An-Nur',ar:'النور',page:350,juz:18,ayahs:64,type:'Medinan'},
  {n:25,name:'Al-Furqan',ar:'الفرقان',page:359,juz:18,ayahs:77,type:'Meccan'},
  {n:26,name:'Ash-Shuara',ar:'الشعراء',page:367,juz:19,ayahs:227,type:'Meccan'},
  {n:27,name:'An-Naml',ar:'النمل',page:377,juz:19,ayahs:93,type:'Meccan'},
  {n:28,name:'Al-Qasas',ar:'القصص',page:385,juz:20,ayahs:88,type:'Meccan'},
  {n:29,name:'Al-Ankabut',ar:'العنكبوت',page:396,juz:20,ayahs:69,type:'Meccan'},
  {n:30,name:'Ar-Rum',ar:'الروم',page:404,juz:21,ayahs:60,type:'Meccan'},
  {n:31,name:'Luqman',ar:'لقمان',page:411,juz:21,ayahs:34,type:'Meccan'},
  {n:32,name:'As-Sajdah',ar:'السجدة',page:415,juz:21,ayahs:30,type:'Meccan'},
  {n:33,name:'Al-Ahzab',ar:'الأحزاب',page:418,juz:21,ayahs:73,type:'Medinan'},
  {n:34,name:'Saba',ar:'سبأ',page:428,juz:22,ayahs:54,type:'Meccan'},
  {n:35,name:'Fatir',ar:'فاطر',page:434,juz:22,ayahs:45,type:'Meccan'},
  {n:36,name:'Ya-Sin',ar:'يس',page:440,juz:22,ayahs:83,type:'Meccan'},
  {n:37,name:'As-Saffat',ar:'الصافات',page:446,juz:23,ayahs:182,type:'Meccan'},
  {n:38,name:'Sad',ar:'ص',page:453,juz:23,ayahs:88,type:'Meccan'},
  {n:39,name:'Az-Zumar',ar:'الزمر',page:458,juz:23,ayahs:75,type:'Meccan'},
  {n:40,name:'Ghafir',ar:'غافر',page:467,juz:24,ayahs:85,type:'Meccan'},
  {n:41,name:'Fussilat',ar:'فصلت',page:477,juz:24,ayahs:54,type:'Meccan'},
  {n:42,name:'Ash-Shura',ar:'الشورى',page:483,juz:25,ayahs:53,type:'Meccan'},
  {n:43,name:'Az-Zukhruf',ar:'الزخرف',page:489,juz:25,ayahs:89,type:'Meccan'},
  {n:44,name:'Ad-Dukhan',ar:'الدخان',page:496,juz:25,ayahs:59,type:'Meccan'},
  {n:45,name:'Al-Jathiyah',ar:'الجاثية',page:499,juz:26,ayahs:37,type:'Meccan'},
  {n:46,name:'Al-Ahqaf',ar:'الأحقاف',page:502,juz:26,ayahs:35,type:'Meccan'},
  {n:47,name:'Muhammad',ar:'محمد',page:507,juz:26,ayahs:38,type:'Medinan'},
  {n:48,name:'Al-Fath',ar:'الفتح',page:511,juz:26,ayahs:29,type:'Medinan'},
  {n:49,name:'Al-Hujurat',ar:'الحجرات',page:515,juz:26,ayahs:18,type:'Medinan'},
  {n:50,name:'Qaf',ar:'ق',page:518,juz:26,ayahs:45,type:'Meccan'},
  {n:51,name:'Adh-Dhariyat',ar:'الذاريات',page:520,juz:26,ayahs:60,type:'Meccan'},
  {n:52,name:'At-Tur',ar:'الطور',page:523,juz:27,ayahs:49,type:'Meccan'},
  {n:53,name:'An-Najm',ar:'النجم',page:526,juz:27,ayahs:62,type:'Meccan'},
  {n:54,name:'Al-Qamar',ar:'القمر',page:528,juz:27,ayahs:55,type:'Meccan'},
  {n:55,name:'Ar-Rahman',ar:'الرحمن',page:531,juz:27,ayahs:78,type:'Medinan'},
  {n:56,name:'Al-Waqiah',ar:'الواقعة',page:534,juz:27,ayahs:96,type:'Meccan'},
  {n:57,name:'Al-Hadid',ar:'الحديد',page:537,juz:27,ayahs:29,type:'Medinan'},
  {n:58,name:'Al-Mujadila',ar:'المجادلة',page:542,juz:28,ayahs:22,type:'Medinan'},
  {n:59,name:'Al-Hashr',ar:'الحشر',page:545,juz:28,ayahs:24,type:'Medinan'},
  {n:60,name:'Al-Mumtahanah',ar:'الممتحنة',page:549,juz:28,ayahs:13,type:'Medinan'},
  {n:61,name:'As-Saf',ar:'الصف',page:551,juz:28,ayahs:14,type:'Medinan'},
  {n:62,name:'Al-Jumuah',ar:'الجمعة',page:553,juz:28,ayahs:11,type:'Medinan'},
  {n:63,name:'Al-Munafiqun',ar:'المنافقون',page:554,juz:28,ayahs:11,type:'Medinan'},
  {n:64,name:'At-Taghabun',ar:'التغابن',page:556,juz:28,ayahs:18,type:'Medinan'},
  {n:65,name:'At-Talaq',ar:'الطلاق',page:558,juz:28,ayahs:12,type:'Medinan'},
  {n:66,name:'At-Tahrim',ar:'التحريم',page:560,juz:28,ayahs:12,type:'Medinan'},
  {n:67,name:'Al-Mulk',ar:'الملك',page:562,juz:29,ayahs:30,type:'Meccan'},
  {n:68,name:'Al-Qalam',ar:'القلم',page:564,juz:29,ayahs:52,type:'Meccan'},
  {n:69,name:'Al-Haqqah',ar:'الحاقة',page:566,juz:29,ayahs:52,type:'Meccan'},
  {n:70,name:'Al-Maarij',ar:'المعارج',page:568,juz:29,ayahs:44,type:'Meccan'},
  {n:71,name:'Nuh',ar:'نوح',page:570,juz:29,ayahs:28,type:'Meccan'},
  {n:72,name:'Al-Jinn',ar:'الجن',page:572,juz:29,ayahs:28,type:'Meccan'},
  {n:73,name:'Al-Muzzammil',ar:'المزمل',page:574,juz:29,ayahs:20,type:'Meccan'},
  {n:74,name:'Al-Muddaththir',ar:'المدثر',page:575,juz:29,ayahs:56,type:'Meccan'},
  {n:75,name:'Al-Qiyamah',ar:'القيامة',page:577,juz:29,ayahs:40,type:'Meccan'},
  {n:76,name:'Al-Insan',ar:'الإنسان',page:578,juz:29,ayahs:31,type:'Medinan'},
  {n:77,name:'Al-Mursalat',ar:'المرسلات',page:580,juz:29,ayahs:50,type:'Meccan'},
  {n:78,name:'An-Naba',ar:'النبأ',page:582,juz:30,ayahs:40,type:'Meccan'},
  {n:79,name:'An-Naziat',ar:'النازعات',page:583,juz:30,ayahs:46,type:'Meccan'},
  {n:80,name:'Abasa',ar:'عبس',page:585,juz:30,ayahs:42,type:'Meccan'},
  {n:81,name:'At-Takwir',ar:'التكوير',page:586,juz:30,ayahs:29,type:'Meccan'},
  {n:82,name:'Al-Infitar',ar:'الانفطار',page:587,juz:30,ayahs:19,type:'Meccan'},
  {n:83,name:'Al-Mutaffifin',ar:'المطففين',page:587,juz:30,ayahs:36,type:'Meccan'},
  {n:84,name:'Al-Inshiqaq',ar:'الانشقاق',page:589,juz:30,ayahs:25,type:'Meccan'},
  {n:85,name:'Al-Buruj',ar:'البروج',page:590,juz:30,ayahs:22,type:'Meccan'},
  {n:86,name:'At-Tariq',ar:'الطارق',page:591,juz:30,ayahs:17,type:'Meccan'},
  {n:87,name:'Al-Ala',ar:'الأعلى',page:591,juz:30,ayahs:19,type:'Meccan'},
  {n:88,name:'Al-Ghashiyah',ar:'الغاشية',page:592,juz:30,ayahs:26,type:'Meccan'},
  {n:89,name:'Al-Fajr',ar:'الفجر',page:593,juz:30,ayahs:30,type:'Meccan'},
  {n:90,name:'Al-Balad',ar:'البلد',page:594,juz:30,ayahs:20,type:'Meccan'},
  {n:91,name:'Ash-Shams',ar:'الشمس',page:595,juz:30,ayahs:15,type:'Meccan'},
  {n:92,name:'Al-Layl',ar:'الليل',page:595,juz:30,ayahs:21,type:'Meccan'},
  {n:93,name:'Ad-Duha',ar:'الضحى',page:596,juz:30,ayahs:11,type:'Meccan'},
  {n:94,name:'Ash-Sharh',ar:'الشرح',page:596,juz:30,ayahs:8,type:'Meccan'},
  {n:95,name:'At-Tin',ar:'التين',page:597,juz:30,ayahs:8,type:'Meccan'},
  {n:96,name:'Al-Alaq',ar:'العلق',page:597,juz:30,ayahs:19,type:'Meccan'},
  {n:97,name:'Al-Qadr',ar:'القدر',page:598,juz:30,ayahs:5,type:'Meccan'},
  {n:98,name:'Al-Bayyinah',ar:'البينة',page:598,juz:30,ayahs:8,type:'Medinan'},
  {n:99,name:'Az-Zalzalah',ar:'الزلزلة',page:599,juz:30,ayahs:8,type:'Medinan'},
  {n:100,name:'Al-Adiyat',ar:'العاديات',page:599,juz:30,ayahs:11,type:'Meccan'},
  {n:101,name:'Al-Qariah',ar:'القارعة',page:600,juz:30,ayahs:11,type:'Meccan'},
  {n:102,name:'At-Takathur',ar:'التكاثر',page:600,juz:30,ayahs:8,type:'Meccan'},
  {n:103,name:'Al-Asr',ar:'العصر',page:601,juz:30,ayahs:3,type:'Meccan'},
  {n:104,name:'Al-Humazah',ar:'الهمزة',page:601,juz:30,ayahs:9,type:'Meccan'},
  {n:105,name:'Al-Fil',ar:'الفيل',page:601,juz:30,ayahs:5,type:'Meccan'},
  {n:106,name:'Quraysh',ar:'قريش',page:602,juz:30,ayahs:4,type:'Meccan'},
  {n:107,name:'Al-Maun',ar:'الماعون',page:602,juz:30,ayahs:7,type:'Meccan'},
  {n:108,name:'Al-Kawthar',ar:'الكوثر',page:602,juz:30,ayahs:3,type:'Meccan'},
  {n:109,name:'Al-Kafirun',ar:'الكافرون',page:603,juz:30,ayahs:6,type:'Meccan'},
  {n:110,name:'An-Nasr',ar:'النصر',page:603,juz:30,ayahs:3,type:'Medinan'},
  {n:111,name:'Al-Masad',ar:'المسد',page:603,juz:30,ayahs:5,type:'Meccan'},
  {n:112,name:'Al-Ikhlas',ar:'الإخلاص',page:604,juz:30,ayahs:4,type:'Meccan'},
  {n:113,name:'Al-Falaq',ar:'الفلق',page:604,juz:30,ayahs:5,type:'Meccan'},
  {n:114,name:'An-Nas',ar:'الناس',page:604,juz:30,ayahs:6,type:'Meccan'},
];

const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
const pageCache = {};

async function fetchPage(pageNum, withTrans) {
  const key = String(pageNum);
  if (pageCache[key]) return pageCache[key];
  try {
    const arRes  = await fetch('https://api.alquran.cloud/v1/page/' + pageNum + '/quran-uthmani');
    const arData = await arRes.json();
    const enMap  = {};
    try {
      const enRes  = await fetch('https://api.alquran.cloud/v1/page/' + pageNum + '/en.sahih');
      const enData = await enRes.json();
      ((enData.data && enData.data.ayahs) || []).forEach(function(a) {
        enMap[a.number] = (a.text || '').replace(/\n/g, ' ').trim();
      });
    } catch(e) {}
    const result = {
      ayahs: ((arData.data && arData.data.ayahs) || []).map(function(a) {
        let t = (a.text || '').replace(/\n/g, ' ').trim();
        if (a.numberInSurah === 1 && a.surah && a.surah.number !== 1 && a.surah.number !== 9) {
          if (t.charCodeAt(0) === 0x0628) {
            const parts = t.split(' ');
            if (parts.length > 4) t = parts.slice(4).join(' ').trim();
          }
        }
        return {
          number:      a.numberInSurah,
          globalNum:   a.number,
          surahNum:    a.surah && a.surah.number,
          surahName:   a.surah && a.surah.englishName,
          surahNameAr: a.surah && a.surah.name,
          text:        t,
          translation: enMap[a.number] || '',
        };
      }),
    };
    pageCache[key] = result;
    return result;
  } catch(e) { return { ayahs: [] }; }
}

function groupBySurah(ayahs) {
  const groups = [];
  let last = -1;
  ayahs.forEach(function(a) {
    if (a.surahNum !== last) {
      last = a.surahNum;
      groups.push({ surahNum: a.surahNum, surahName: a.surahName, surahNameAr: a.surahNameAr, isFirst: a.number === 1, ayahs: [] });
    }
    groups[groups.length - 1].ayahs.push(a);
  });
  return groups;
}

// ── AUDIO BAR ──
function AudioBar({ audio, nightMode, gold, ink, onReciter, collapsed, onToggle }) {
  if (!audio.currentSurah && !audio.isLoading) return null;

  const surah   = SURAHS.find(function(s) { return s.n === audio.currentSurah; });
  const bg      = nightMode ? '#0A1410' : '#F0EBE0';
  const bdr     = nightMode ? 'rgba(201,168,76,0.12)' : 'rgba(0,0,0,0.07)';
  const mutedC  = nightMode ? colors.muted : '#999';

  // ── MINI collapsed state ──
  if (collapsed) {
    return (
      <View style={[ab.mini, { backgroundColor: bg, borderBottomColor: bdr }]}>
        <View style={[ab.miniStrip, { backgroundColor: nightMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
          <View style={[ab.miniStripFill, { width: audio.progressPct + '%', backgroundColor: gold }]}/>
        </View>
        <View style={ab.miniRow}>
          <View style={[ab.miniDot, { backgroundColor: audio.isPlaying ? gold : mutedC }]}/>
          <Text style={[ab.miniName, { color: ink }]} numberOfLines={1}>
            {surah ? surah.name : '...'} {audio.isPlaying ? '— Playing' : '— Paused'}
          </Text>
          <TouchableOpacity
            style={[ab.miniPlay, { backgroundColor: colors.green }]}
            onPress={audio.isLoading ? undefined : audio.togglePlay}
            activeOpacity={0.85}
          >
            {audio.isLoading
              ? <ActivityIndicator color={gold} size="small"/>
              : <Text style={{ color: gold, fontSize: 12 }}>{audio.isPlaying ? '⏸' : '▶'}</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity onPress={onToggle} activeOpacity={0.7} style={ab.miniExpand}>
            <Text style={{ color: mutedC, fontSize: 14 }}>⌄</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── EXPANDED player ──
  const pct = audio.progressPct;

  return (
    <View style={[ab.wrap, { backgroundColor: bg, borderBottomColor: bdr }]}>

      {/* Surah + reciter + collapse */}
      <View style={ab.header}>
        <View style={{ flex: 1 }}>
          <Text style={[ab.surahName, { color: ink }]} numberOfLines={1}>
            {surah ? surah.name : '...'}
            {audio.currentAyah > 0 ? (' · Ayah ' + audio.currentAyah) : ''}
          </Text>
          <TouchableOpacity onPress={onReciter} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <Text style={[ab.reciterName, { color: gold }]} numberOfLines={1}>{audio.currentReciter.name}</Text>
            <Text style={{ color: gold, fontSize: 9 }}>▾</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onToggle} activeOpacity={0.7} style={ab.collapseBtn}>
          <Text style={{ color: mutedC, fontSize: 16 }}>⌃</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={ab.progWrap}>
        <View style={[ab.progTrack, { backgroundColor: nightMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }]}>
          <View style={[ab.progFill, { width: pct + '%', backgroundColor: gold }]}/>
          <View style={[ab.progDot, { left: pct + '%', backgroundColor: gold }]}/>
        </View>
        <View style={ab.progTimes}>
          <Text style={[ab.timeStr, { color: mutedC }]}>{audio.formatTime(audio.position)}</Text>
          <Text style={[ab.timeStr, { color: mutedC }]}>{audio.formatTime(audio.duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={ab.controls}>
        {/* Previous ayah */}
        <TouchableOpacity
          style={ab.ctrlBtn}
          onPress={function() {
            if (audio.currentAyah > 1 && audio.timingsRef) {
              const idx = audio.currentAyah - 2;
              const t   = audio.timingsRef.current;
              if (t && t[idx] !== undefined) audio.seekTo(t[idx]);
            } else { audio.seekTo(0); }
          }}
          activeOpacity={0.7}
        >
          <Text style={[ab.ctrlIco, { color: mutedC }]}>⧏</Text>
        </TouchableOpacity>

        {/* Seek back 10s */}
        <TouchableOpacity
          style={ab.ctrlBtn}
          onPress={function() { audio.seekTo(Math.max(0, audio.position - 10000)); }}
          activeOpacity={0.7}
        >
          <Text style={[ab.ctrlIco, { color: mutedC, fontSize: 11 }]}>10⟲</Text>
        </TouchableOpacity>

        {/* Play/pause */}
        <TouchableOpacity
          style={[ab.playBtn, { backgroundColor: colors.green }]}
          onPress={audio.isLoading ? undefined : audio.togglePlay}
          activeOpacity={0.85}
        >
          {audio.isLoading
            ? <ActivityIndicator color={gold} size="small"/>
            : <Text style={{ color: gold, fontSize: 20 }}>{audio.isPlaying ? '⏸' : '▶'}</Text>
          }
        </TouchableOpacity>

        {/* Seek forward 10s */}
        <TouchableOpacity
          style={ab.ctrlBtn}
          onPress={function() { audio.seekTo(Math.min(audio.duration, audio.position + 10000)); }}
          activeOpacity={0.7}
        >
          <Text style={[ab.ctrlIco, { color: mutedC, fontSize: 11 }]}>10⟳</Text>
        </TouchableOpacity>

        {/* Speed */}
        <TouchableOpacity
          style={[ab.speedBtn, { borderColor: 'rgba(201,168,76,0.25)', backgroundColor: 'rgba(201,168,76,0.08)' }]}
          onPress={function() {
            const opts = [0.75, 1.0, 1.25, 1.5];
            audio.changeSpeed(opts[(opts.indexOf(audio.speed) + 1) % opts.length]);
          }}
          activeOpacity={0.8}
        >
          <Text style={[ab.speedTxt, { color: gold }]}>{audio.speed}x</Text>
        </TouchableOpacity>
      </View>

      {/* Stop button */}
      <TouchableOpacity onPress={audio.stop} activeOpacity={0.7} style={ab.stopRow}>
        <Text style={[ab.stopTxt, { color: mutedC }]}>Stop recitation</Text>
      </TouchableOpacity>

    </View>
  );
}


function AyahSheet({ ayah, nightMode, gold, ink, onClose, onPlay }) {
  const bg       = nightMode ? '#111D17' : '#fff';
  const bdr      = nightMode ? 'rgba(201,168,76,0.12)' : 'rgba(0,0,0,0.07)';
  const surahObj = SURAHS.find(function(s) { return s.n === ayah.surahNum; });
  const [showTr, setShowTr] = useState(false);

  return (
    <Modal visible transparent animationType="slide">
      <TouchableOpacity
        style={{ flex:1, backgroundColor:'rgba(0,0,0,0.6)', justifyContent:'flex-end' }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{ backgroundColor: bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 48 }}
        >
          {/* Handle */}
          <View style={{ alignItems:'center', paddingTop:12, paddingBottom:16, borderBottomWidth:1, borderBottomColor:bdr }}>
            <View style={{ width:40, height:4, borderRadius:2, backgroundColor:'rgba(128,128,128,0.2)', marginBottom:14 }}/>
            <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, width:'100%' }}>
              <View style={{ backgroundColor:'rgba(201,168,76,0.1)', borderRadius:10, paddingHorizontal:12, paddingVertical:5, borderWidth:1, borderColor:'rgba(201,168,76,0.25)' }}>
                <Text style={{ fontFamily:fonts.semibold, fontSize:13, color:gold }}>
                  {surahObj ? surahObj.name : ''} · Ayah {ayah.number}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={{ width:32, height:32, borderRadius:16, backgroundColor:'rgba(128,128,128,0.1)', alignItems:'center', justifyContent:'center' }}>
                <Text style={{ color:nightMode?colors.muted:'#888', fontSize:16 }}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Arabic */}
          <View style={{ backgroundColor:'rgba(201,168,76,0.04)', margin:16, marginBottom:8, borderRadius:16, padding:18, borderWidth:1, borderColor:'rgba(201,168,76,0.1)' }}>
            <Text style={{ fontFamily:fonts.arabic, fontSize:24, color:gold, textAlign:'right', lineHeight:48 }}>
              {ayah.text}
            </Text>
          </View>

          {/* Translation */}
          {ayah.translation ? (
            <TouchableOpacity
              style={{ marginHorizontal:16, marginBottom:14, padding:14, backgroundColor: showTr ? 'rgba(201,168,76,0.07)' : 'rgba(128,128,128,0.05)', borderRadius:12, borderWidth:1, borderColor: showTr ? 'rgba(201,168,76,0.2)' : bdr }}
              onPress={function() { setShowTr(function(v) { return !v; }); }}
              activeOpacity={0.8}
            >
              {showTr ? (
                <Text style={{ fontFamily:fonts.regular, fontSize:14, color:nightMode?'rgba(245,240,232,0.8)':'#444', lineHeight:22 }}>
                  {ayah.translation}
                </Text>
              ) : (
                <Text style={{ fontFamily:fonts.medium, fontSize:13, color:gold, textAlign:'center' }}>
                  Show Translation
                </Text>
              )}
            </TouchableOpacity>
          ) : null}

          {/* Actions */}
          <View style={{ flexDirection:'row', gap:10, paddingHorizontal:16 }}>
            <TouchableOpacity
              style={{ flex:1, backgroundColor:colors.green, borderRadius:16, paddingVertical:16, alignItems:'center', gap:6, borderWidth:1, borderColor:'rgba(201,168,76,0.2)' }}
              onPress={onPlay}
              activeOpacity={0.85}
            >
              <Text style={{ fontSize:20, color:'#fff' }}>▶</Text>
              <Text style={{ fontFamily:fonts.semibold, fontSize:12, color:'#fff' }}>Play from here</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex:1, backgroundColor:colors.card, borderRadius:16, paddingVertical:16, alignItems:'center', gap:6, borderWidth:1, borderColor:colors.border }}
              onPress={function() {
                try {
                  var RN = require('react-native');
                  if (RN.Clipboard) RN.Clipboard.setString(ayah.text);
                  else if (RN.Share) RN.Share.share({ message: ayah.text });
                } catch(e) {}
                onClose();
              }}
              activeOpacity={0.85}
            >
              <Text style={{ fontSize:20, color:ink }}>⧉</Text>
              <Text style={{ fontFamily:fonts.semibold, fontSize:12, color:nightMode?colors.muted:'#888' }}>Copy Arabic</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex:1, backgroundColor:colors.card, borderRadius:16, paddingVertical:16, alignItems:'center', gap:6, borderWidth:1, borderColor:colors.border }}
              onPress={function() {
                try {
                  var RN = require('react-native');
                  if (RN.Share) RN.Share.share({ message: ayah.text + '\n\n' + (ayah.translation || '') + '\n\n' + (surahObj ? surahObj.name : '') + ' : ' + ayah.number });
                } catch(e) {}
                onClose();
              }}
              activeOpacity={0.85}
            >
              <Text style={{ fontSize:18, color:ink }}>↗</Text>
              <Text style={{ fontFamily:fonts.semibold, fontSize:12, color:nightMode?colors.muted:'#888' }}>Share</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}


function PageReader({ initialPage, onClose }) {
  const [loadedPages,   setLoadedPages]   = useState([]);
  const [pageDataMap,   setPageDataMap]   = useState({});
  const [currentPage,   setCurrentPage]   = useState(initialPage);
  const [loading,       setLoading]       = useState(true);
  const [selectedAyah,  setSelectedAyah]  = useState(null);
  const [showAyahSheet, setShowAyahSheet] = useState(false);
  const [showSettings,  setShowSettings]  = useState(false);
  const [showJump,      setShowJump]      = useState(false);
  const [showReciter,   setShowReciter]   = useState(false);
  const [jumpTab,       setJumpTab]       = useState('surah');
  const [translation,   setTranslation]   = useState(false);
  const [fontSize,      setFontSize]      = useState(20);
  const [nightMode,     setNightMode]     = useState(true);
  const [bookmarks,     setBookmarks]     = useState([]);
  const [barCollapsed,  setBarCollapsed]  = useState(false);
  const [tajweedMode,   setTajweedMode]   = useState(false);
  const tajweedCacheRef = useRef({});

  const audio      = useQuranAudio();
  const scrollRef  = useRef(null);
  const readTimer  = useRef(null);
  const maxPageRef = useRef(initialPage);
  const minPageRef = useRef(initialPage);
  const pageYRef   = useRef({});
  const loadingSet = useRef(new Set());
  const initDone      = useRef(false);
  const pendingJumpRef = useRef(null);

  const juz   = pageToJuz(currentPage);
  const surah = SURAHS.filter(function(s) { return s.page <= currentPage; }).pop();
  const bg    = nightMode ? '#060D09' : '#FBF6E3';
  const ink   = nightMode ? '#F0EBE0' : '#1A1208';
  const gold  = nightMode ? '#C9A84C' : '#8B6914';
  const hl    = nightMode ? 'rgba(201,168,76,0.16)' : 'rgba(139,105,20,0.12)';

  useEffect(function() {
    for (let p = Math.max(1, initialPage - 1); p <= Math.min(604, initialPage + 3); p++) doLoadPage(p);
    AsyncStorage.getItem('noor:bookmarks').then(function(v) { if(v) setBookmarks(JSON.parse(v)); }).catch(function() {});
    AsyncStorage.getItem('noor:reader_settings').then(function(v) {
      if (!v) return;
      const s = JSON.parse(v);
      if (s.fontSize)               setFontSize(s.fontSize);
      if (s.translation !== undefined) setTranslation(s.translation);
      if (s.nightMode   !== undefined) setNightMode(s.nightMode);
      if (s.tajweedMode !== undefined) setTajweedMode(s.tajweedMode);
    }).catch(function() {});
    return function() { if (readTimer.current) clearTimeout(readTimer.current); };
  }, []);

  async function fetchTajweed(pageNum) {
    if (tajweedCacheRef.current[pageNum]) return;
    try {
      const res  = await fetch(
        'https://api.qurancdn.com/api/qdc/verses/by_page/' + pageNum +
        '?words=true&word_fields=text_uthmani_tajweed&per_page=50'
      );
      const data = await res.json();
      const verses = (data && data.verses) || [];
      const wordMap = {};
      verses.forEach(function(v) {
        const key = v.verse_key;
        const words = (v.words || []).filter(function(w) { return w.char_type_name === 'word'; });
        wordMap[key] = words.map(function(w) { return w.text_uthmani_tajweed || ''; });
      });
      tajweedCacheRef.current[pageNum] = wordMap;
    } catch(e) { }
  }

  async function doLoadPage(pageNum) {
    if (loadingSet.current.has(pageNum) || pageNum < 1 || pageNum > 604) return;
    loadingSet.current.add(pageNum);
    const data = await fetchPage(pageNum, true);
    setPageDataMap(function(prev) { const n = Object.assign({}, prev); n[pageNum] = data; return n; });
    setLoadedPages(function(prev) {
      if (prev.indexOf(pageNum) !== -1) return prev;
      return prev.concat([pageNum]).sort(function(a, b) { return a - b; });
    });
    if (pageNum > maxPageRef.current) maxPageRef.current = pageNum;
    if (tajweedMode) fetchTajweed(pageNum);
    if (pageNum < minPageRef.current) minPageRef.current = pageNum;
    if (pageNum === initialPage) setLoading(false);
  }

  async function saveSettings(overrides) {
    const s = Object.assign({ fontSize: fontSize, translation: translation, nightMode: nightMode }, overrides || {});
    await AsyncStorage.setItem('noor:reader_settings', JSON.stringify(s)).catch(function() {});
  }

  async function toggleBk() {
    const upd = bookmarks.indexOf(currentPage) !== -1
      ? bookmarks.filter(function(b) { return b !== currentPage; })
      : bookmarks.concat([currentPage]);
    setBookmarks(upd);
    await AsyncStorage.setItem('noor:bookmarks', JSON.stringify(upd)).catch(function() {});
  }

  function markRead(p) {
    if (readTimer.current) clearTimeout(readTimer.current);
    readTimer.current = setTimeout(async function() {
      const j    = pageToJuz(p);
      const next = JUZ_PAGES[j + 1] || 605;
      await setJuzStatus(j, p >= next - 1 ? 'complete' : 'reading');
    }, 10000);
  }

  function handleScroll(e) {
    const offsetY       = e.nativeEvent.contentOffset.y;
    const contentHeight = e.nativeEvent.contentSize.height;
    const layoutHeight  = e.nativeEvent.layoutMeasurement.height;
    const positions     = pageYRef.current;
    let cp = loadedPages[0] || initialPage;
    for (let i = 0; i < loadedPages.length; i++) {
      const pg = loadedPages[i];
      if (positions[pg] !== undefined && positions[pg] <= offsetY + 100) cp = pg;
    }
    if (cp !== currentPage) {
      setCurrentPage(cp);
      AsyncStorage.setItem('noor:last_read_page', String(cp)).catch(function() {});
      markRead(cp);
    }
    if (offsetY + layoutHeight > contentHeight - 600) {
      const next = maxPageRef.current + 1;
      if (next <= 604) doLoadPage(next);
    }
    if (offsetY < 400 && minPageRef.current > 1) {
      const prev = minPageRef.current - 1;
      if (prev >= 1) doLoadPage(prev);
    }
  }

  function jumpToPage(pg) {
    setShowJump(false);
    const y = pageYRef.current[pg];
    if (y !== undefined && scrollRef.current) {
      // Page already loaded — scroll directly
      scrollRef.current.scrollTo({ y: Math.max(0, y - 20), animated: true });
      setCurrentPage(pg);
    } else {
      // Page not loaded — reset and load from target page
      pendingJumpRef.current = pg;
      setLoadedPages([]);
      setPageDataMap({});
      setLoading(true);
      maxPageRef.current = pg;
      minPageRef.current = pg;
      loadingSet.current = new Set();
      pageYRef.current   = {};
      initDone.current   = false;
      setCurrentPage(pg);
      for (let p = Math.max(1, pg - 1); p <= Math.min(604, pg + 3); p++) {
        doLoadPage(p);
      }
    }
  }

  function renderPage(pageNum: number) {
    const data   = pageDataMap[pageNum];
    const ayahs  = data ? (data.ayahs || []) : [];
    const groups = groupBySurah(ayahs);
    return (
      <View key={pageNum} onLayout={function(e) {
        pageYRef.current[pageNum] = e.nativeEvent.layout.y;
        // Handle pending jump (from jumpToPage when page was not loaded)
        if (pendingJumpRef.current === pageNum && scrollRef.current) {
          const targetPage = pendingJumpRef.current;
          pendingJumpRef.current = null;
          var jumpAttempts = 0;
          var tryJump = function() {
            var yy = pageYRef.current[targetPage];
            if (yy !== undefined && scrollRef.current) {
              scrollRef.current.scrollTo({ y: Math.max(0, yy - 20), animated: false });
              setCurrentPage(targetPage);
              initDone.current = true;
            } else if (jumpAttempts < 10) {
              jumpAttempts++;
              setTimeout(tryJump, 200);
            }
          };
          setTimeout(tryJump, 100);
        }
        // Handle initial page scroll
        if (!initDone.current && pageNum === initialPage && scrollRef.current) {
          setTimeout(function() {
            const yy = pageYRef.current[initialPage];
            if (yy !== undefined && scrollRef.current) {
              scrollRef.current.scrollTo({ y: Math.max(0, yy - 20), animated: false });
              initDone.current = true;
            }
          }, 100);
        }
      }}>
        <View style={rd.divider}>
          <View style={[rd.dividerLine, { backgroundColor: nightMode ? 'rgba(201,168,76,0.12)' : 'rgba(0,0,0,0.06)' }]}/>
          <Text style={[rd.dividerTxt, { color: gold }]}>
            {(function() {
              const j   = pageToJuz(pageNum);
              const hizb = Math.ceil(pageNum / 2.5);
              const rubEl = Math.ceil(pageNum / 1.25);
              return 'Page ' + pageNum + '  ·  Juz ' + j;
            })()}
          </Text>
          <View style={[rd.dividerLine, { backgroundColor: nightMode ? 'rgba(201,168,76,0.12)' : 'rgba(0,0,0,0.06)' }]}/>
        </View>
        {!data ? (
          <View style={{ padding: 30, alignItems: 'center' }}><ActivityIndicator color={gold}/></View>
        ) : (
          <View style={rd.pageInner}>
            {groups.map(function(g, gi) {
              return (
                <View key={gi}>
                  {g.isFirst ? (
                    <View style={[rd.surahBadge, { borderColor: gold + '40' }]}>
                      <Text style={[rd.surahBadgeName, { color: gold }]}>{g.surahName}</Text>
                      <Text style={[rd.surahBadgeAr, { color: gold }]}>{g.surahNameAr}</Text>
                    </View>
                  ) : null}
                  {g.isFirst && g.surahNum !== 1 && g.surahNum !== 9 ? (
                    <Text style={[rd.bismillah, { color: gold, fontSize: fontSize - 2 }]}>{BISMILLAH}</Text>
                  ) : null}
                  <Text style={[rd.arabic, { fontSize: fontSize, lineHeight: fontSize * 2.1, color: ink }]}>
                    {g.ayahs.map(function(a, i) {
                      const isActive   = audio.currentSurah === a.surahNum && audio.currentAyah === a.number;
                      const isSelected = selectedAyah && selectedAyah.globalNum === a.globalNum;
                      return (
                        <Text key={i} onPress={function() { setSelectedAyah(a); setShowAyahSheet(true); }}>
                          {(function() {
                            const vkey = a.surahNum + ':' + a.number;
                            const pageWords = tajweedCacheRef.current[pageNum];
                            const words = pageWords && pageWords[vkey];
                            const baseColor = isSelected ? '#060D09' : isActive ? gold : ink;
                            const bgColor   = isSelected ? gold : isActive ? hl : undefined;
                            if (tajweedMode && words) {
                              const segs = parseTajweed(words.join(' '));
                              return segs.map(function(seg, si) {
                                return (
                                  <Text key={si} style={{
                                    color: isSelected ? '#060D09' : isActive ? gold : (seg.rule && TAJWEED_COLORS[seg.rule] ? TAJWEED_COLORS[seg.rule] : ink),
                                    backgroundColor: bgColor,
                                  }}>{seg.text}</Text>
                                );
                              });
                            }
                            return <Text style={{ color: baseColor, backgroundColor: bgColor }}>{a.text}</Text>;
                          })()}
                          <Text style={{ color: gold, fontSize: fontSize * 0.58 }}>{' {' + a.number + '} '}</Text>
                        </Text>
                      );
                    })}
                  </Text>
                  {translation ? (
                    <View style={[rd.transBlock, { borderTopColor: nightMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }]}>
                      {g.ayahs.map(function(a, i) {
                        return a.translation ? (
                          <Text key={i} style={[rd.transLine, { color: nightMode ? 'rgba(245,240,232,0.5)' : '#666' }]}>
                            <Text style={{ color: gold, fontFamily: fonts.bold }}>({a.number}) </Text>{a.translation}
                          </Text>
                        ) : null;
                      })}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[rd.root, { backgroundColor: bg }]}>
      <SafeAreaView style={{ backgroundColor: nightMode ? '#060D09' : '#FBF6E3' }}>
        <View style={[rd.topBar, { borderBottomColor: nightMode ? 'rgba(201,168,76,0.08)' : 'rgba(0,0,0,0.06)' }]}>
          <TouchableOpacity style={rd.topBtn} onPress={onClose}>
            <Text style={[rd.topIco, { color: nightMode ? colors.muted : '#777' }]}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={rd.topCenter} onPress={function() { setShowJump(true); }}>
            <Text style={[rd.topPage, { color: ink }]}>Page {currentPage}</Text>
            <Text style={[rd.topMeta, { color: nightMode ? colors.muted : '#888' }]}>Juz {juz} · {surah ? surah.name : ''}</Text>
          </TouchableOpacity>
          <View style={rd.topRight}>
            <TouchableOpacity
              style={[rd.topBtn, audio.currentSurah === (surah && surah.n) && audio.isPlaying && { backgroundColor: 'rgba(201,168,76,0.1)' }]}
              onPress={function() {
                if (!surah) return;
                if (audio.currentSurah === surah.n) { audio.togglePlay(); return; }
                audio.playSurah(surah.n);
              }}
              activeOpacity={0.8}
            >
              {audio.isLoading && audio.currentSurah === (surah && surah.n)
                ? <ActivityIndicator color={gold} size="small"/>
                : <Text style={[rd.topIco, { color: audio.currentSurah === (surah && surah.n) && audio.isPlaying ? gold : nightMode ? colors.muted : '#777' }]}>
                    {audio.currentSurah === (surah && surah.n) && audio.isPlaying ? '⏸' : '▶'}
                  </Text>
              }
            </TouchableOpacity>
            <TouchableOpacity style={rd.topBtn} onPress={toggleBk} activeOpacity={0.8}>
              <Text style={[rd.topIco, { color: bookmarks.indexOf(currentPage) !== -1 ? gold : nightMode ? colors.muted : '#777' }]}>
                {bookmarks.indexOf(currentPage) !== -1 ? '⦿' : '◯'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={rd.topBtn} onPress={function() { setShowSettings(true); }} activeOpacity={0.8}>
              <Text style={[rd.topIco, { color: nightMode ? colors.muted : '#777' }]}>⚙</Text>
            </TouchableOpacity>
          </View>
        </View>
        <AudioBar audio={audio} nightMode={nightMode} gold={gold} ink={ink}
          onReciter={function() { setShowReciter(true); }}
          collapsed={barCollapsed} onToggle={function() { setBarCollapsed(function(v) { return !v; }); }}
        />
      </SafeAreaView>

      {loading ? (
        <View style={rd.loader}><ActivityIndicator color={gold} size="large"/></View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1, backgroundColor: bg }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={150}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          {loadedPages.map(function(pn) { return renderPage(pn); })}
        </ScrollView>
      )}

      {showAyahSheet && selectedAyah ? (
        <AyahSheet ayah={selectedAyah} nightMode={nightMode} gold={gold} ink={ink}
          onClose={function() { setShowAyahSheet(false); setSelectedAyah(null); }}
          onPlay={function() {
            const s = SURAHS.find(function(s2) { return s2.n === selectedAyah.surahNum; });
            if (s) audio.playSurah(s.n, undefined, undefined, selectedAyah.number);
            setShowAyahSheet(false);
          }}
        />
      ) : null}

      <Modal visible={showSettings} transparent animationType="slide">
        <TouchableOpacity style={mo.overlay} activeOpacity={1} onPress={function() { setShowSettings(false); }}>
          <TouchableOpacity activeOpacity={1} style={[mo.panel, { backgroundColor: nightMode ? '#0F1A13' : '#fff' }]}>
            <View style={mo.handle}/>
            <Text style={[mo.title, { color: ink }]}>Reader Settings</Text>
            <Text style={[mo.label, { color: nightMode ? colors.muted : '#888' }]}>Font Size</Text>
            <View style={mo.segRow}>
              {[15, 17, 20, 24, 28].map(function(sz) {
                return (
                  <TouchableOpacity key={sz} style={[mo.seg, fontSize === sz && mo.segOn]}
                    onPress={function() { setFontSize(sz); saveSettings({ fontSize: sz }); }} activeOpacity={0.8}>
                    <Text style={[mo.segTxt, fontSize === sz && mo.segTxtOn]}>
                      {sz === 15 ? 'XS' : sz === 17 ? 'S' : sz === 20 ? 'M' : sz === 24 ? 'L' : 'XL'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[mo.label, { color: nightMode ? colors.muted : '#888' }]}>Display</Text>
            <TouchableOpacity style={[mo.toggle, translation && mo.toggleOn]}
              onPress={function() { const v = !translation; setTranslation(v); saveSettings({ translation: v }); }} activeOpacity={0.8}>
              <Text style={[mo.toggleTxt, { color: ink }]}>Show Translation</Text>
              <View style={[mo.dot, translation && mo.dotOn]}>{translation ? <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text> : null}</View>
            </TouchableOpacity>
            <TouchableOpacity style={[mo.toggle, nightMode && mo.toggleOn]}
              onPress={function() { const v = !nightMode; setNightMode(v); saveSettings({ nightMode: v }); }} activeOpacity={0.8}>
              <Text style={[mo.toggleTxt, { color: ink }]}>Night Mode</Text>
              <View style={[mo.dot, nightMode && mo.dotOn]}>{nightMode ? <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text> : null}</View>
            </TouchableOpacity>
            <TouchableOpacity style={[mo.toggle, tajweedMode && mo.toggleOn]}
              onPress={function() {
                const v = !tajweedMode;
                setTajweedMode(v);
                if (v) { tajweedCacheRef.current = {}; loadedPages.forEach(function(p) { fetchTajweed(p); }); }
                saveSettings({ tajweedMode: v });
              }} activeOpacity={0.8}>
              <Text style={[mo.toggleTxt, { color: ink }]}>Tajweed Colors</Text>
              <View style={[mo.dot, tajweedMode && mo.dotOn]}>{tajweedMode ? <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text> : null}</View>
            </TouchableOpacity>
            {tajweedMode && (
              <View style={{ marginTop: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12 }}>
                <Text style={{ fontFamily: fonts.semibold, fontSize: 12, color: ink, marginBottom: 10 }}>Tajweed Color Guide</Text>
                {[
                  { rule: 'Ghunnah',   color: '#3A8C3A', desc: 'Nasalization' },
                  { rule: 'Ikhfa',     color: '#FF8C00', desc: 'Hidden' },
                  { rule: 'Idgham',    color: '#209090', desc: 'Merging' },
                  { rule: 'Iqlab',     color: '#8B008B', desc: 'Converting' },
                  { rule: 'Qalqalah', color: '#DD1111', desc: 'Echo' },
                  { rule: 'Madd',      color: '#CC8A00', desc: 'Elongation' },
                  { rule: 'Izhar',     color: '#178717', desc: 'Clear' },
                ].map(function(item) {
                  return (
                    <View key={item.rule} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: item.color }}/>
                      <Text style={{ fontFamily: fonts.semibold, fontSize: 12, color: item.color, width: 72 }}>{item.rule}</Text>
                      <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: nightMode ? colors.muted : '#888' }}>{item.desc}</Text>
                    </View>
                  );
                })}
              </View>
            )}
            <Text style={[mo.hint, { color: nightMode ? colors.muted : '#999' }]}>Tap any ayah for options · Tap ▶ for audio</Text>
            <TouchableOpacity style={mo.doneBtn} onPress={function() { setShowSettings(false); }} activeOpacity={0.85}>
              <Text style={mo.doneTxt}>Done</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showReciter} transparent animationType="slide">
        <TouchableOpacity style={mo.overlay} activeOpacity={1} onPress={function() { setShowReciter(false); }}>
          <TouchableOpacity activeOpacity={1} style={[mo.panel, { backgroundColor: nightMode ? '#0F1A13' : '#fff' }]}>
            <View style={mo.handle}/>
            <Text style={[mo.title, { color: ink }]}>Choose Reciter</Text>
            {RECITERS.map(function(rec) {
              return (
                <TouchableOpacity key={rec.id} style={[mo.recRow, { borderBottomColor: nightMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}
                  onPress={function() { audio.switchReciter(rec); setShowReciter(false); }} activeOpacity={0.8}>
                  <View style={{ flex: 1 }}>
                    <Text style={[mo.recName, { color: ink }]}>{rec.name}</Text>
                    <Text style={[mo.recAr, { color: gold }]}>{rec.nameAr}</Text>
                  </View>
                  {audio.currentReciter.id === rec.id ? (
                    <View style={[mo.recCheck, { backgroundColor: colors.mid }]}>
                      <Text style={{ color: '#fff', fontSize: 11 }}>✓</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showJump} transparent animationType="slide">
        <View style={mo.overlay}>
          <View style={[mo.panel, { backgroundColor: nightMode ? '#0F1A13' : '#fff', maxHeight: SH * 0.82 }]}>
            <View style={mo.handle}/>
            <View style={[mo.modalHead, { borderBottomColor: nightMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
              <Text style={[mo.title, { color: ink, marginBottom: 0 }]}>Jump To</Text>
              <TouchableOpacity onPress={function() { setShowJump(false); }}>
                <Text style={{ color: nightMode ? colors.muted : '#888', fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, margin: 16 }}>
              {['surah', 'juz'].map(function(tab) {
                return (
                  <TouchableOpacity key={tab} style={[mo.seg, { flex: 1 }, jumpTab === tab && mo.segOn]}
                    onPress={function() { setJumpTab(tab); }}>
                    <Text style={[mo.segTxt, jumpTab === tab && mo.segTxtOn]}>{tab === 'surah' ? 'Surah' : 'Juz'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <View style={{ paddingHorizontal: 16 }}>
                {jumpTab === 'surah'
                  ? SURAHS.map(function(s) {
                      return (
                        <TouchableOpacity key={s.n}
                          style={[mo.jumpRow, { borderBottomColor: nightMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
                          onPress={function() { jumpToPage(s.page); }} activeOpacity={0.75}>
                          <View style={mo.jumpNum}><Text style={mo.jumpNumTxt}>{s.n}</Text></View>
                          <View style={{ flex: 1 }}>
                            <Text style={[mo.jumpName, { color: ink }]}>{s.name}</Text>
                            <Text style={[mo.jumpMeta, { color: nightMode ? colors.muted : '#888' }]}>Page {s.page} · Juz {s.juz}</Text>
                          </View>
                          <Text style={[mo.jumpAr, { color: gold }]}>{s.ar}</Text>
                        </TouchableOpacity>
                      );
                    })
                  : Array.from({ length: 30 }, function(_, i) { return i + 1; }).map(function(j) {
                      return (
                        <TouchableOpacity key={j}
                          style={[mo.jumpRow, { borderBottomColor: nightMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
                          onPress={function() { jumpToPage(JUZ_PAGES[j]); }} activeOpacity={0.75}>
                          <View style={mo.jumpNum}><Text style={mo.jumpNumTxt}>{j}</Text></View>
                          <View style={{ flex: 1 }}>
                            <Text style={[mo.jumpName, { color: ink }]}>Juz {j}</Text>
                            <Text style={[mo.jumpMeta, { color: nightMode ? colors.muted : '#888' }]}>Starts page {JUZ_PAGES[j]}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                }
                <View style={{ height: 40 }}/>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── HOME ──
export default function QuranScreen() {
  const [mode,      setMode]      = useState('home');
  const [startPage, setStartPage] = useState(1);
  const [lastPage,  setLastPage]  = useState(null);
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(function() {
    AsyncStorage.getItem('noor:last_read_page').then(function(v) { if(v) setLastPage(parseInt(v)); }).catch(function() {});
    AsyncStorage.getItem('noor:bookmarks').then(function(v) { if(v) setBookmarks(JSON.parse(v)); }).catch(function() {});
  }, []);

  function open(pg) { setStartPage(pg); setMode('read'); }
  function close() {
    setMode('home');
    AsyncStorage.getItem('noor:last_read_page').then(function(v) { if(v) setLastPage(parseInt(v)); }).catch(function() {});
    AsyncStorage.getItem('noor:bookmarks').then(function(v) { if(v) setBookmarks(JSON.parse(v)); }).catch(function() {});
  }

  if (mode === 'read') return <PageReader initialPage={startPage} onClose={close}/>;

  const lastSurah = lastPage ? SURAHS.filter(function(s) { return s.page <= lastPage; }).pop() : null;

  return (
    <SafeAreaView style={hm.safe}>
      <ScrollView style={hm.scroll} showsVerticalScrollIndicator={false}>
        <View style={hm.header}>
          <Text style={hm.title}>Quran</Text>
          <Text style={hm.sub}>604 pages · 114 surahs · 30 juz</Text>
        </View>

        {lastPage && lastSurah ? (
          <TouchableOpacity style={hm.continueCard} onPress={function() { open(lastPage); }} activeOpacity={0.85}>
            <View style={{ flex: 1 }}>
              <Text style={hm.cLabel}>Continue Reading</Text>
              <Text style={hm.cPage}>Page {lastPage} · Juz {pageToJuz(lastPage)}</Text>
              <Text style={hm.cMeta}>{lastSurah.name}</Text>
            </View>
            <Text style={{ color: colors.gold, fontSize: 24 }}>›</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={hm.startCard} onPress={function() { open(1); }} activeOpacity={0.85}>
            <View style={{ flex: 1 }}>
              <Text style={hm.startTitle}>Start Reading</Text>
              <Text style={hm.startSub}>Begin from Al-Fatihah · Page 1</Text>
            </View>
            <Text style={{ color: colors.gold, fontSize: 20 }}>›</Text>
          </TouchableOpacity>
        )}

        {bookmarks.length > 0 ? (
          <View style={{ marginBottom: 20 }}>
            <View style={hm.sectionHead}>
              <Text style={hm.sectionTitle}>Bookmarks</Text>
              <Text style={hm.sectionSub}>{bookmarks.length} pages</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {bookmarks.map(function(pg) {
                const bs = SURAHS.filter(function(s) { return s.page <= pg; }).pop();
                return (
                  <TouchableOpacity key={pg} style={hm.bkCard} onPress={function() { open(pg); }} activeOpacity={0.8}>
                    <Text style={hm.bkPage}>Page {pg}</Text>
                    <Text style={hm.bkMeta}>{bs ? bs.name : 'Juz ' + pageToJuz(pg)}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        <View style={hm.sectionHead}>
          <Text style={hm.sectionTitle}>All Surahs</Text>
          <Text style={hm.sectionSub}>114 total</Text>
        </View>
        {SURAHS.map(function(s) {
          return (
            <TouchableOpacity key={s.n} style={hm.surahRow} onPress={function() { open(s.page); }} activeOpacity={0.8}>
              <View style={hm.surahNum}><Text style={hm.surahNumTxt}>{s.n}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={hm.surahName}>{s.name}</Text>
                <Text style={hm.surahMeta}>{s.ayahs} ayahs · {s.type} · Page {s.page}</Text>
              </View>
              <Text style={hm.surahAr}>{s.ar}</Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 48 }}/>
      </ScrollView>
    </SafeAreaView>
  );
}

const hm = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: colors.bg },
  scroll:      { flex: 1, paddingHorizontal: 20 },
  header:      { paddingTop: 20, marginBottom: 20 },
  title:       { fontFamily: fonts.bold, fontSize: 32, color: colors.ink, marginBottom: 4 },
  sub:         { fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  continueCard:{ backgroundColor: colors.green, borderRadius: 22, padding: 20, marginBottom: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(201,168,76,0.18)' },
  cLabel:      { fontFamily: fonts.medium, fontSize: 10, color: 'rgba(245,240,232,0.5)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 },
  cPage:       { fontFamily: fonts.bold, fontSize: 17, color: '#fff', marginBottom: 2 },
  cMeta:       { fontFamily: fonts.regular, fontSize: 12, color: 'rgba(245,240,232,0.5)' },
  startCard:   { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
  startTitle:  { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink, marginBottom: 3 },
  startSub:    { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, paddingBottom: 12 },
  sectionTitle:{ fontFamily: fonts.semibold, fontSize: 15, color: colors.ink },
  sectionSub:  { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  bkCard:      { backgroundColor: colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(201,168,76,0.18)', minWidth: 100 },
  bkPage:      { fontFamily: fonts.bold, fontSize: 14, color: colors.ink, marginBottom: 3 },
  bkMeta:      { fontFamily: fonts.regular, fontSize: 11, color: colors.muted },
  surahRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  surahNum:    { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  surahNumTxt: { fontFamily: fonts.bold, fontSize: 13, color: colors.gold },
  surahName:   { fontFamily: fonts.medium, fontSize: 14, color: colors.ink },
  surahMeta:   { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 1 },
  surahAr:     { fontFamily: fonts.arabic, fontSize: 17, color: colors.gold },
});

const rd = StyleSheet.create({
  root:         { flex: 1 },
  topBar:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 10, borderBottomWidth: 1 },
  topBtn:       { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(128,128,128,0.08)' },
  topIco:       { fontSize: 16 },
  topCenter:    { flex: 1, alignItems: 'center', marginHorizontal: 6 },
  topPage:      { fontFamily: fonts.bold, fontSize: 15 },
  topMeta:      { fontFamily: fonts.regular, fontSize: 11, marginTop: 1 },
  topRight:     { flexDirection: 'row', gap: 6 },
  loader:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  divider:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 10 },
  dividerLine:  { flex: 1, height: 1 },
  dividerTxt:   { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 0.4 },
  pageInner:    { paddingHorizontal: 18, paddingBottom: 8 },
  bismillah:    { fontFamily: fonts.arabic, textAlign: 'center', marginBottom: 14, lineHeight: 40 },
  surahBadge:   { alignSelf: 'center', borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 12, flexDirection: 'row', gap: 8, alignItems: 'center' },
  surahBadgeName:{ fontFamily: fonts.semibold, fontSize: 12 },
  surahBadgeAr: { fontFamily: fonts.arabic, fontSize: 15 },
  arabic:       { fontFamily: fonts.arabic, writingDirection: 'rtl', textAlign: 'justify' },
  ayahRow:      { paddingHorizontal: 4, paddingVertical: 2, marginBottom: 2 },
  transBlock:   { marginTop: 14, paddingTop: 12, borderTopWidth: 1, marginBottom: 8 },
  transLine:    { fontFamily: fonts.regular, fontSize: 13, lineHeight: 22, marginBottom: 5 },
});

const mo = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  panel:      { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 44, maxHeight: SH * 0.85 },
  handle:     { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(128,128,128,0.25)', alignSelf: 'center', marginBottom: 20 },
  title:      { fontFamily: fonts.bold, fontSize: 18, marginBottom: 20 },
  label:      { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10, marginTop: 16 },
  segRow:     { flexDirection: 'row', gap: 8 },
  seg:        { flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(128,128,128,0.09)', borderWidth: 1, borderColor: 'rgba(128,128,128,0.12)' },
  segOn:      { backgroundColor: colors.green, borderColor: colors.green },
  segTxt:     { fontFamily: fonts.medium, fontSize: 13, color: '#888' },
  segTxtOn:   { color: '#fff' },
  toggle:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: 'rgba(128,128,128,0.07)', borderRadius: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(128,128,128,0.1)' },
  toggleOn:   { borderColor: 'rgba(201,168,76,0.3)', backgroundColor: 'rgba(201,168,76,0.06)' },
  toggleTxt:  { fontFamily: fonts.medium, fontSize: 15 },
  dot:        { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(128,128,128,0.3)', alignItems: 'center', justifyContent: 'center' },
  dotOn:      { backgroundColor: colors.mid, borderColor: colors.mid },
  hint:       { fontFamily: fonts.regular, fontSize: 12, textAlign: 'center', marginTop: 14, marginBottom: 4 },
  doneBtn:    { backgroundColor: colors.green, borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 16 },
  doneTxt:    { fontFamily: fonts.bold, fontSize: 15, color: '#fff' },
  recRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  recName:    { fontFamily: fonts.semibold, fontSize: 15, marginBottom: 3 },
  recAr:      { fontFamily: fonts.arabic, fontSize: 15 },
  recCheck:   { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalHead:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottomWidth: 1, marginBottom: 4 },
  jumpRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  jumpNum:    { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  jumpNumTxt: { fontFamily: fonts.bold, fontSize: 14, color: colors.gold },
  jumpName:   { fontFamily: fonts.semibold, fontSize: 15 },
  jumpMeta:   { fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
  jumpAr:     { fontFamily: fonts.arabic, fontSize: 18 },
  refBadge:   { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  refTxt:     { fontFamily: fonts.semibold, fontSize: 13 },
  arabicBox:  { borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1 },
  actGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  actBtn:     { width: '47%', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1 },
  actIco:     { fontSize: 18, color: '#fff', marginBottom: 6 },
  actTxt:     { fontFamily: fonts.medium, fontSize: 12, color: '#fff', textAlign: 'center' },
});

const ab = StyleSheet.create({
  // Mini collapsed
  mini:          { borderBottomWidth: 1 },
  miniStrip:     { height: 2, width: '100%' },
  miniStripFill: { height: '100%' },
  miniRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, gap: 10 },
  miniDot:       { width: 7, height: 7, borderRadius: 3.5 },
  miniName:      { flex: 1, fontFamily: fonts.semibold, fontSize: 13 },
  miniPlay:      { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  miniExpand:    { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },

  // Expanded
  wrap:          { borderBottomWidth: 1, paddingBottom: 4 },
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  surahName:     { fontFamily: fonts.bold, fontSize: 15 },
  reciterName:   { fontFamily: fonts.medium, fontSize: 11 },
  collapseBtn:   { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  progWrap:      { paddingHorizontal: 16, marginBottom: 14 },
  progTrack:     { height: 3, borderRadius: 2, overflow: 'visible', marginBottom: 6, position: 'relative' },
  progFill:      { height: '100%', borderRadius: 2 },
  progDot:       { position: 'absolute', width: 12, height: 12, borderRadius: 6, top: -4.5, marginLeft: -6 },
  progTimes:     { flexDirection: 'row', justifyContent: 'space-between' },
  timeStr:       { fontFamily: fonts.regular, fontSize: 10 },

  controls:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10 },
  ctrlBtn:       { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  ctrlIco:       { fontSize: 18 },
  playBtn:       { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)' },
  speedBtn:      { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  speedTxt:      { fontFamily: fonts.bold, fontSize: 12 },

  stopRow:       { alignItems: 'center', paddingBottom: 8 },
  stopTxt:       { fontFamily: fonts.medium, fontSize: 11 },
});
