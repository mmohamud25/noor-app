import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,  TextInput, Modal, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fonts } from '../../constants/colors';

const SECTIONS = [
  {
    id: 'daily',
    title: 'Daily Tasbih',
    subtitle: 'SubhanAllah · Alhamdulillah · Allahu Akbar',
    color: colors.gold,
    items: [
      { id:'d1', name:'SubhanAllah',   arabic:'سُبْحَانَ اللَّهِ',   translit:'SubhanAllah',   meaning:'Glory be to Allah',       target:33  },
      { id:'d2', name:'Alhamdulillah', arabic:'الْحَمْدُ لِلَّهِ', translit:'Alhamdulillah', meaning:'All praise is for Allah',  target:33  },
      { id:'d3', name:'Allahu Akbar',  arabic:'اللَّهُ أَكْبَرُ',         translit:'Allahu Akbar',  meaning:'Allah is the Greatest',   target:34  },
    ],
  },
  {
    id: 'morning',
    title: 'Morning Adhkar',
    subtitle: 'Authentic morning remembrance',
    color: '#D97706',
    items: [
      { id:'m1', name:'Ayatul Kursi',            arabic:'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',             translit:'Allahu la ilaha illa huwal-hayyul-qayyum',   meaning:'Recite Ayatul Kursi for morning protection',      target:1   },
      { id:'m2', name:'Al-Ikhlas',               arabic:'قُلْ هُوَ اللَّهُ أَحَدٌ',                                                                                                                                               translit:"Qul huwallahu ahad",                          meaning:'Recite 3x for protection equal to reciting the whole Quran', target:3   },
      { id:'m3', name:'Al-Falaq',                arabic:'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',                                                                                                       translit:"Qul a'udhu birabbil-falaq",                   meaning:'Seek refuge with the Lord of daybreak',           target:3   },
      { id:'m4', name:'An-Nas',                  arabic:'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',                                                                                                               translit:"Qul a'udhu birabbin-nas",                     meaning:'Seek refuge with the Lord of mankind',            target:3   },
      { id:'m5', name:'SubhanAllah wa bihamdih', arabic:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',                                                                                                  translit:'SubhanAllahi wa bihamdih',                    meaning:'Whoever says this 100x daily, sins are forgiven even if like sea foam', target:100 },
      { id:'m6', name:'La ilaha illAllah wahdah',arabic:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',  translit:'La ilaha illallahu wahdahu la sharika lah',   meaning:'Equals freeing 10 slaves, 100 good deeds written', target:10  },
      { id:'m7', name:'Astaghfirullah',           arabic:'أَسْتَغْفِرُ اللَّهَ',                                                                                                                                                           translit:'Astaghfirullah',                              meaning:'I seek forgiveness from Allah',                   target:100 },
      { id:'m8', name:'Bismillah morning',        arabic:'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ',translit:'Bismillahil-ladhi la yadurru ma a ismihi shay un', meaning:'Nothing in earth or heaven can harm you — say 3x morning and evening', target:3 },
    ],
  },
  {
    id: 'evening',
    title: 'Evening Adhkar',
    subtitle: 'Evening protection and remembrance',
    color: '#7C3AED',
    items: [
      { id:'e1', name:'Ayatul Kursi',             arabic:'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',             translit:'Allahu la ilaha illa huwal-hayyul-qayyum',   meaning:'Evening protection — angels guard you until morning',  target:1   },
      { id:'e2', name:'Al-Ikhlas',                arabic:'قُلْ هُوَ اللَّهُ أَحَدٌ',                                                                                                                                              translit:"Qul huwallahu ahad",                          meaning:'Evening recitation 3x',                               target:3   },
      { id:'e3', name:'Al-Falaq',                 arabic:'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',                                                                                                      translit:"Qul a'udhu birabbil-falaq",                   meaning:'Evening protection 3x',                               target:3   },
      { id:'e4', name:'An-Nas',                   arabic:'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',                                                                                                              translit:"Qul a'udhu birabbin-nas",                     meaning:'Evening protection 3x',                               target:3   },
      { id:'e5', name:'SubhanAllah wa bihamdih',  arabic:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',                                                                                                 translit:'SubhanAllahi wa bihamdih',                    meaning:'100x — sins forgiven even if like sea foam',          target:100 },
      { id:'e6', name:'Sayyid al-Istighfar',      arabic:'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ',      translit:'Allahumma anta rabbi la ilaha illa anta',     meaning:'Master supplication for forgiveness — say once in evening', target:1 },
      { id:'e7', name:'Evening protection',       arabic:'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', translit:"A'udhu bikalimatillahit-tammati min sharri ma khalaq", meaning:'Protection from all evil — 3x in evening',     target:3   },
    ],
  },
  {
    id: 'salah',
    title: 'After Salah',
    subtitle: 'Post-prayer remembrance',
    color: '#059669',
    items: [
      { id:'s1', name:'Astaghfirullah',            arabic:'أَسْتَغْفِرُ اللَّهَ',                                                                                                                                                          translit:'Astaghfirullah',                              meaning:'Seek forgiveness 3x after each prayer',               target:3   },
      { id:'s2', name:'Allahumma anta as-salam',  arabic:'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ',  translit:'Allahumma antas-salam wa minkas-salam',       meaning:'O Allah You are Peace and from You is peace',         target:1   },
      { id:'s3', name:'Ayatul Kursi',              arabic:'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',            translit:'Allahu la ilaha illa huwal-hayyul-qayyum',    meaning:'Whoever recites after each prayer enters Paradise',   target:1   },
      { id:'s4', name:'SubhanAllah',               arabic:'سُبْحَانَ اللَّهِ',                                                                                                                                                                           translit:'SubhanAllah',                                 meaning:'Glory be to Allah — 33x',                             target:33  },
      { id:'s5', name:'Alhamdulillah',             arabic:'الْحَمْدُ لِلَّهِ',                                                                                                                                                                          translit:'Alhamdulillah',                               meaning:'All praise is for Allah — 33x',                        target:33  },
      { id:'s6', name:'Allahu Akbar',              arabic:'اللَّهُ أَكْبَرُ',                                                                                                                                                                                 translit:'Allahu Akbar',                                meaning:'Allah is Greatest — 34x (totals 100)',                target:34  },
      { id:'s7', name:'La ilaha illAllah',         arabic:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ', translit:'La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd', meaning:'Recite after every prayer to complete the remembrance', target:1 },
    ],
  },
  {
    id: 'sleep',
    title: 'Before Sleep',
    subtitle: 'Bedtime adhkar for protection',
    color: '#0369A1',
    items: [
      { id:'sl1', name:'Ayatul Kursi',             arabic:'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',            translit:'Allahu la ilaha illa huwal-hayyul-qayyum',    meaning:'Allah will appoint a guardian and shaytan will not come near', target:1 },
      { id:'sl2', name:'Al-Ikhlas',                arabic:'قُلْ هُوَ اللَّهُ أَحَدٌ',                                                                                                                                             translit:"Qul huwallahu ahad",                          meaning:'Blow into palms and wipe over body 3x',               target:3   },
      { id:'sl3', name:'Al-Falaq',                 arabic:'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',                                                                                                     translit:"Qul a'udhu birabbil-falaq",                   meaning:'Blow into palms and wipe over body 3x',               target:3   },
      { id:'sl4', name:'An-Nas',                   arabic:'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',                                                                                                             translit:"Qul a'udhu birabbin-nas",                     meaning:'Blow into palms and wipe over body 3x',               target:3   },
      { id:'sl5', name:'Bismika amutu wa ahya',    arabic:'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',                                                       translit:'Bismika Allahumma amutu wa ahya',              meaning:'In Your name O Allah I die and I live',               target:1   },
      { id:'sl6', name:'SubhanAllah',              arabic:'سُبْحَانَ اللَّهِ',                                                                                                                                                                          translit:'SubhanAllah',                                 meaning:'33x — better than a servant for all your needs',      target:33  },
      { id:'sl7', name:'Alhamdulillah',            arabic:'الْحَمْدُ لِلَّهِ',                                                                                                                                                                         translit:'Alhamdulillah',                               meaning:'33x',                                                 target:33  },
      { id:'sl8', name:'Allahu Akbar',             arabic:'اللَّهُ أَكْبَرُ',                                                                                                                                                                                translit:'Allahu Akbar',                                meaning:'34x',                                                 target:34  },
    ],
  },
];

function todayStr() { return new Date().toISOString().slice(0, 10); }

function Ring({ count, target, color, size }) {
  const safeCount = Math.min(count, target);
  const r     = (size / 2) - 6;
  const circ  = 2 * Math.PI * r;
  const pct   = target > 0 ? safeCount / target : 0;
  const off   = circ * (1 - Math.min(pct, 1));
  return (
    <Svg width={size} height={size} viewBox={"0 0 " + size + " " + size}>
      <Circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.07)" strokeWidth={8} fill="none"/>
      <Circle cx={size/2} cy={size/2} r={r} stroke={color || colors.gold} strokeWidth={8} fill="none"
        strokeDasharray={circ} strokeDashoffset={off}
        strokeLinecap="round" transform={"rotate(-90 " + (size/2) + " " + (size/2) + ")"}
      />
    </Svg>
  );
}

export default function DhikrScreen() {
  const [view,       setView]       = useState('home');
  const [sectionId,  setSectionId]  = useState('daily');
  const [itemIdx,    setItemIdx]    = useState(0);
  const [counts,     setCounts]     = useState({});
  const [customs,    setCustoms]    = useState([]);
  const [sheet,      setSheet]      = useState(false);
  const [cName,      setCName]      = useState('');
  const [cArabic,    setCArabic]    = useState('');
  const [cTarget,    setCTarget]    = useState(33);
  const [cCustomNum, setCCustomNum] = useState('');

  const allSections = customs.length > 0
    ? [...SECTIONS, { id:'custom', title:'My Dhikr', subtitle: customs.map(function(i) { return i.name; }).join(', '), color: colors.mid, items: customs }]
    : SECTIONS;

  const section = allSections.find(function(s) { return s.id === sectionId; }) || SECTIONS[0];
  const item    = section.items[itemIdx];
  const itemCount = Math.min(counts[item && item.id] || 0, item && item.target || 99999);
  const itemDone  = itemCount >= (item && item.target || 33);
  const secColor  = section.color || colors.gold;

  useEffect(function() {
    AsyncStorage.getItem('noor:dhikr:' + todayStr()).then(function(v) {
      if (v) setCounts(JSON.parse(v));
    }).catch(function() {});
    AsyncStorage.getItem('noor:dhikr:customs').then(function(v) {
      if (v) setCustoms(JSON.parse(v));
    }).catch(function() {});
  }, []);

  async function persist(updated) {
    try { await AsyncStorage.setItem('noor:dhikr:' + todayStr(), JSON.stringify(updated)); } catch {}
  }

  async function tap() {
    if (!item) return;
    const current = counts[item.id] || 0;
    if (current >= item.target) {
      // Already done — advance to next
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const ni = itemIdx + 1;
      if (ni < section.items.length) setItemIdx(ni);
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = current + 1;
    const updated = Object.assign({}, counts, { [item.id]: next });
    setCounts(updated);
    persist(updated);
    if (next >= item.target) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const ni = itemIdx + 1;
      if (ni < section.items.length) {
        setTimeout(function() { setItemIdx(ni); }, 600);
      }
    }
  }

  async function resetItem() {
    if (!item) return;
    const updated = Object.assign({}, counts, { [item.id]: 0 });
    setCounts(updated);
    persist(updated);
  }

  function getProgress(sec) {
    const done = sec.items.filter(function(i) { return (counts[i.id] || 0) >= i.target; }).length;
    return { done, total: sec.items.length };
  }

  function getTotalToday() {
    return Object.values(counts).reduce(function(a, b) { return a + b; }, 0);
  }

  async function addCustom() {
    if (!cName.trim()) return;
    const t  = cCustomNum ? (parseInt(cCustomNum) || 33) : cTarget;
    const ci = { id: 'c' + Date.now(), name: cName.trim(), arabic: cArabic.trim(), translit: '', meaning: '', target: t };
    const updated = [...customs, ci];
    setCustoms(updated);
    try { await AsyncStorage.setItem('noor:dhikr:customs', JSON.stringify(updated)); } catch {}
    setCName(''); setCArabic(''); setCTarget(33); setCCustomNum(''); setSheet(false);
  }

  async function removeCustom(id) {
    const updated = customs.filter(function(i) { return i.id !== id; });
    setCustoms(updated);
    try { await AsyncStorage.setItem('noor:dhikr:customs', JSON.stringify(updated)); } catch {}
  }

  //  HOME 
  if (view === 'home') return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={s.header}>
          <View>
            <Text style={s.title}>Dhikr</Text>
            <Text style={s.sub}>Daily remembrance</Text>
          </View>
          <View style={s.totalBadge}>
            <Text style={s.totalNum}>{getTotalToday()}</Text>
            <Text style={s.totalLbl}>today</Text>
          </View>
        </View>

        {allSections.map(function(sec) {
          const p   = getProgress(sec);
          const pct = p.total > 0 ? p.done / p.total : 0;
          const done = p.done === p.total && p.total > 0;
          const col  = sec.color || colors.gold;
          return (
            <TouchableOpacity
              key={sec.id}
              style={[s.card, done && { borderColor: col + '40', backgroundColor: col + '08' }]}
              onPress={function() { setSectionId(sec.id); setItemIdx(0); setView('counter'); }}
              activeOpacity={0.82}
            >
              <View style={s.cardTop}>
                <View style={[s.cardDot, { backgroundColor: col }]}/>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <Text style={s.cardTitle}>{sec.title}</Text>
                    {done && (
                      <View style={[s.donePill, { backgroundColor: col + '20', borderColor: col + '40' }]}>
                        <Text style={[s.doneTxt, { color: col }]}>Done</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.cardSub} numberOfLines={1}>{sec.subtitle}</Text>
                </View>
                <Text style={s.cardCount}>{p.done}/{p.total}</Text>
              </View>
              <View style={[s.bar, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <View style={[s.barFill, { width: (Math.round(pct * 100) + '%'), backgroundColor: col }]}/>
              </View>
              {sec.id === 'custom' && customs.length > 0 && (
                <View style={{ marginTop: 10, gap: 6 }}>
                  {customs.map(function(ci) {
                    return (
                      <View key={ci.id} style={s.customItem}>
                        <Text style={s.customItemName}>{ci.name} ×{ci.target}</Text>
                        <TouchableOpacity onPress={function() { removeCustom(ci.id); }} activeOpacity={0.7}>
                          <Text style={{ color: '#E57373', fontSize: 11, fontFamily: fonts.medium }}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={s.addBtn} onPress={function() { setSheet(true); }} activeOpacity={0.8}>
          <View style={s.addIco}><Text style={s.addPlus}>+</Text></View>
          <View>
            <Text style={s.addTitle}>Add Custom Dhikr</Text>
            <Text style={s.addSub}>Set your own name and count</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={sheet} transparent animationType="slide">
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={function() { setSheet(false); }}>
          <TouchableOpacity activeOpacity={1} style={s.sheetWrap}>
            <View style={s.sheetHandle}/>
            <Text style={s.sheetTitle}>Add Custom Dhikr</Text>
            <Text style={s.sheetLbl}>Name</Text>
            <TextInput style={s.inp} placeholder="e.g. La ilaha illAllah" placeholderTextColor={colors.muted} value={cName} onChangeText={setCName}/>
            <Text style={s.sheetLbl}>Arabic (optional)</Text>
            <TextInput style={[s.inp, { fontFamily: fonts.arabic, fontSize: 18, lineHeight: 32, textAlign: 'right' }]} placeholder="..." placeholderTextColor={colors.muted} value={cArabic} onChangeText={setCArabic}/>
            <Text style={s.sheetLbl}>Target count</Text>
            <View style={s.targetRow}>
              {[33, 100, 500, 1000].map(function(n) {
                return (
                  <TouchableOpacity key={n} style={[s.tPill, cTarget === n && !cCustomNum && s.tPillOn]}
                    onPress={function() { setCTarget(n); setCCustomNum(''); }} activeOpacity={0.8}>
                    <Text style={[s.tPillTxt, cTarget === n && !cCustomNum && s.tPillTxtOn]}>{n}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput style={[s.inp, { marginTop: 8 }]} placeholder="Or type a custom number" placeholderTextColor={colors.muted} value={cCustomNum} onChangeText={setCCustomNum} keyboardType="number-pad"/>
            <TouchableOpacity style={[s.startBtn, !cName.trim() && { opacity: 0.4 }]} onPress={addCustom} activeOpacity={0.85}>
              <Text style={s.startTxt}>Add to My Dhikr</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );

  //  COUNTER 
  const sectionDone = section.items.every(function(i) { return (counts[i.id] || 0) >= i.target; });

  return (
    <SafeAreaView style={[s.safe, { justifyContent: 'space-between' }]}>

      {/* Top bar */}
      <View style={s.cTop}>
        <TouchableOpacity style={s.backBtn} onPress={function() { setView('home'); }} activeOpacity={0.7}>
          <Text style={s.backTxt}>Back</Text>
        </TouchableOpacity>
        <Text style={s.cTopTitle}>{section.title}</Text>
        <TouchableOpacity style={s.resetBtn} onPress={resetItem} activeOpacity={0.7}>
          <Text style={s.resetTxt}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Item tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 52, flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, alignItems: 'center' }}>
        {section.items.map(function(it, i) {
          const d2     = (counts[it.id] || 0) >= it.target;
          const active = i === itemIdx;
          return (
            <TouchableOpacity key={it.id}
              style={[s.tab,
                active && { backgroundColor: secColor + '22', borderColor: secColor + '55' },
                d2 && !active && { backgroundColor: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.3)' },
              ]}
              onPress={function() { setItemIdx(i); }} activeOpacity={0.8}>
              <Text style={[s.tabTxt,
                active && { color: secColor },
                d2 && !active && { color: '#34D399' },
              ]}>{d2 ? '\u2713' : (i + 1)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Ring + text */}
      <View style={s.cCenter}>
        <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Ring count={itemCount} target={item && item.target || 33} color={secColor} size={160}/>
          <View style={{ position: 'absolute', alignItems: 'center' }}>
            <Text style={s.bigCount}>{itemCount}</Text>
            <Text style={s.ofTxt}>of {item && item.target}</Text>
          </View>
        </View>

        {item && item.arabic ? (
          <Text style={s.cArabic}>{item.arabic}</Text>
        ) : null}
        <Text style={s.cName}>{item && item.name}</Text>
        {item && item.translit ? (
          <Text style={s.cTranslit}>{item.translit}</Text>
        ) : null}
        {item && item.meaning ? (
          <View style={s.meaningBox}>
            <Text style={s.meaningTxt}>{item.meaning}</Text>
          </View>
        ) : null}
      </View>

      {/* Tap zone */}
      <TouchableOpacity
        style={[s.tapZone, itemDone && { backgroundColor: 'rgba(45,106,79,0.4)', borderColor: 'rgba(52,211,153,0.3)' }]}
        onPress={tap}
        activeOpacity={0.88}
      >
        {itemDone ? (
          <>
            <Text style={[s.tapTxt, { color: '#34D399' }]}>Complete ✓</Text>
            <Text style={s.tapSub}>{itemIdx < section.items.length - 1 ? 'Tap to continue' : 'Section done!'}</Text>
          </>
        ) : (
          <>
            <Text style={s.tapTxt}>Tap to count</Text>
            <Text style={s.tapSub}>{(item && item.target || 33) - itemCount} remaining</Text>
          </>
        )}
      </TouchableOpacity>

      {itemIdx < section.items.length - 1 ? (
        <TouchableOpacity style={s.nextBtn} onPress={function() { setItemIdx(function(i) { return i + 1; }); }} activeOpacity={0.8}>
          <Text style={s.nextTxt}>Next: {section.items[itemIdx + 1] && section.items[itemIdx + 1].name} ›</Text>
        </TouchableOpacity>
      ) : null}

      {sectionDone ? (
        <View style={s.sectionDone}>
          <Text style={s.sectionDoneTxt}>✓ Section complete! May Allah accept your dhikr.</Text>
        </View>
      ) : null}

      <View style={{ height: 20 }}/>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex:1, backgroundColor:colors.bg },
  scroll:        { flex:1, paddingHorizontal:20 },
  header:        { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', paddingTop:20, marginBottom:20 },
  title:         { fontFamily:fonts.bold, fontSize:32, color:colors.ink, marginBottom:4 },
  sub:           { fontFamily:fonts.regular, fontSize:14, color:colors.muted },
  totalBadge:    { alignItems:'center', backgroundColor:colors.card, borderRadius:14, paddingHorizontal:14, paddingVertical:10, borderWidth:1, borderColor:colors.border },
  totalNum:      { fontFamily:fonts.bold, fontSize:24, color:colors.gold, lineHeight:26 },
  totalLbl:      { fontFamily:fonts.regular, fontSize:10, color:colors.muted, marginTop:2 },

  card:          { backgroundColor:colors.card, borderRadius:20, padding:18, marginBottom:12, borderWidth:1, borderColor:colors.border },
  cardTop:       { flexDirection:'row', alignItems:'center', gap:12, marginBottom:14 },
  cardDot:       { width:10, height:10, borderRadius:5, flexShrink:0 },
  cardTitle:     { fontFamily:fonts.semibold, fontSize:16, color:colors.ink },
  cardSub:       { fontFamily:fonts.regular, fontSize:12, color:colors.muted },
  cardCount:     { fontFamily:fonts.bold, fontSize:14, color:colors.gold },
  donePill:      { paddingHorizontal:8, paddingVertical:2, borderRadius:8, borderWidth:1 },
  doneTxt:       { fontFamily:fonts.medium, fontSize:10 },
  bar:           { height:4, borderRadius:2, overflow:'hidden' },
  barFill:       { height:'100%', borderRadius:2 },

  customItem:    { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingTop:8, borderTopWidth:1, borderTopColor:colors.border },
  customItemName:{ fontFamily:fonts.regular, fontSize:13, color:colors.muted },

  addBtn:        { flexDirection:'row', alignItems:'center', gap:14, backgroundColor:colors.card, borderRadius:18, padding:18, borderWidth:1, borderStyle:'dashed', borderColor:'rgba(201,168,76,0.25)', marginBottom:10 },
  addIco:        { width:40, height:40, borderRadius:20, backgroundColor:'rgba(201,168,76,0.1)', borderWidth:1, borderColor:'rgba(201,168,76,0.2)', alignItems:'center', justifyContent:'center' },
  addPlus:       { fontSize:24, color:colors.gold, lineHeight:28 },
  addTitle:      { fontFamily:fonts.semibold, fontSize:15, color:colors.gold, marginBottom:2 },
  addSub:        { fontFamily:fonts.regular, fontSize:12, color:colors.muted },

  overlay:       { flex:1, backgroundColor:'rgba(0,0,0,0.65)', justifyContent:'flex-end' },
  sheetWrap:     { backgroundColor:'#0F1A13', borderTopLeftRadius:24, borderTopRightRadius:24, padding:24, paddingBottom:48 },
  sheetHandle:   { width:36, height:4, borderRadius:2, backgroundColor:'rgba(255,255,255,0.15)', alignSelf:'center', marginBottom:20 },
  sheetTitle:    { fontFamily:fonts.bold, fontSize:18, color:colors.ink, marginBottom:20 },
  sheetLbl:      { fontFamily:fonts.medium, fontSize:11, color:colors.muted, letterSpacing:0.5, textTransform:'uppercase', marginBottom:8, marginTop:16 },
  inp:           { backgroundColor:colors.card, borderRadius:12, borderWidth:1, borderColor:colors.border, color:colors.ink, fontFamily:fonts.regular, fontSize:14, padding:13, paddingHorizontal:16 },
  targetRow:     { flexDirection:'row', gap:8 },
  tPill:         { flex:1, paddingVertical:10, borderRadius:12, alignItems:'center', backgroundColor:colors.card, borderWidth:1, borderColor:colors.border },
  tPillOn:       { backgroundColor:colors.green, borderColor:colors.green },
  tPillTxt:      { fontFamily:fonts.bold, fontSize:14, color:colors.muted },
  tPillTxtOn:    { color:colors.gold },
  startBtn:      { backgroundColor:colors.green, borderRadius:14, padding:15, alignItems:'center', marginTop:20, borderWidth:1, borderColor:'rgba(201,168,76,0.2)' },
  startTxt:      { fontFamily:fonts.bold, fontSize:15, color:'#fff' },

  cTop:          { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingTop:16, paddingBottom:8 },
  backBtn:       { paddingVertical:6, paddingRight:16 },
  backTxt:       { fontFamily:fonts.medium, fontSize:15, color:colors.muted },
  cTopTitle:     { fontFamily:fonts.bold, fontSize:16, color:colors.ink },
  resetBtn:      { paddingVertical:6, paddingLeft:16 },
  resetTxt:      { fontFamily:fonts.medium, fontSize:13, color:colors.muted },

  tab:           { minWidth:36, height:36, paddingHorizontal:10, borderRadius:18, alignItems:'center', justifyContent:'center', backgroundColor:colors.card, borderWidth:1, borderColor:colors.border },
  tabTxt:        { fontFamily:fonts.bold, fontSize:13, color:colors.muted },

  cCenter:       { alignItems:'center', paddingHorizontal:24 },
  bigCount:      { fontFamily:fonts.bold, fontSize:56, color:colors.ink, lineHeight:60 },
  ofTxt:         { fontFamily:fonts.regular, fontSize:13, color:colors.muted, marginTop:2 },
  cArabic:       { fontFamily:fonts.arabic, fontSize:30, color:colors.gold, textAlign:'center', lineHeight:56, marginBottom:8, paddingHorizontal:20 },
  cName:         { fontFamily:fonts.bold, fontSize:18, color:colors.ink, marginBottom:4, textAlign:'center' },
  cTranslit:     { fontFamily:fonts.regular, fontSize:13, color:colors.muted, fontStyle:'italic', marginBottom:12, textAlign:'center' },
  meaningBox:    { backgroundColor:'rgba(201,168,76,0.06)', borderRadius:12, padding:12, borderWidth:1, borderColor:'rgba(201,168,76,0.12)', marginHorizontal:4 },
  meaningTxt:    { fontFamily:fonts.regular, fontSize:13, color:colors.muted, textAlign:'center', lineHeight:20 },

  tapZone:       { backgroundColor:colors.green, borderRadius:22, marginHorizontal:20, paddingVertical:26, alignItems:'center', borderWidth:1, borderColor:'rgba(201,168,76,0.2)' },
  tapTxt:        { fontFamily:fonts.bold, fontSize:18, color:'#fff', marginBottom:4 },
  tapSub:        { fontFamily:fonts.regular, fontSize:13, color:'rgba(245,240,232,0.5)' },

  nextBtn:       { alignItems:'center', paddingVertical:10 },
  nextTxt:       { fontFamily:fonts.medium, fontSize:14, color:colors.muted },
  sectionDone:   { alignItems:'center', paddingHorizontal:24, paddingBottom:4 },
  sectionDoneTxt:{ fontFamily:fonts.medium, fontSize:13, color:'#34D399', textAlign:'center' },
});
