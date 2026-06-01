import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet,  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../../constants/colors';
import { CheckIcon, ChevronUpIcon, ChevronDownIcon } from '../../components/Icons';
import { getCompletedLessons, markLessonComplete } from '../../lib/storage';

const LESSONS = [
  { id:'tj-01', subject:'Tajweed', title:'Makharij al-Huruf', duration:'5 min', body:'Makharij refers to the precise articulation points of each Arabic letter. Every letter exits from a specific place in the mouth, throat, or nasal passage. There are 17 main articulation points grouped across 5 regions: the throat (halq), tongue (lisan), lips (shafatayn), nasal passage (khayshum), and the jauf (empty space).' },
  { id:'tj-02', subject:'Tajweed', title:'Sifaat al-Huruf', duration:'6 min', body:'Each Arabic letter has characteristics (sifaat) that distinguish its sound. These include: jahr (voiced) vs hams (whispered), shiddah (strong) vs rakhawah (soft), istila (raised tongue) vs istifal (lowered), and others. Understanding sifaat ensures proper letter distinction.' },
  { id:'tj-03', subject:'Tajweed', title:'Noon Sakinah Rules', duration:'7 min', body:'Noon Sakinah or Tanween has four rules: Izhar (clear) when followed by throat letters. Idgham (merge) when followed by y r m l w n. Iqlab (convert to m) when followed by b. Ikhfa (hide) when followed by the remaining 15 letters.' },
  { id:'tj-04', subject:'Tajweed', title:'Meem Sakinah Rules', duration:'5 min', body:'Meem Sakinah has three rules: Ikhfa Shafawi — hide the meem when followed by b with slight ghunnah. Idgham Shafawi — merge when followed by another m. Izhar Shafawi — clearly pronounce the meem before all other letters.' },
  { id:'tj-05', subject:'Tajweed', title:'Madd Rules Part 1', duration:'6 min', body:'Madd means elongation of a vowel sound. The natural madd (madd tabii) is 2 counts and occurs when a madd letter is followed by no hamzah or sukoon. This is the foundation for all other madd types.' },
  { id:'tj-06', subject:'Tajweed', title:'Madd Rules Part 2', duration:'7 min', body:'Extended madd types: Madd Muttasil (4-5 counts) — madd letter followed by hamzah in the same word. Madd Munfasil (2-5 counts) — madd letter followed by hamzah in the next word. Madd Lazim (6 counts) — madd letter followed by a shaddah or sukoon in the same word.' },
  { id:'tj-07', subject:'Tajweed', title:'Qalqalah', duration:'4 min', body:'Qalqalah is a slight echo or bounce applied to the letters q t b j d when they appear with sukoon. Qalqalah sughra (minor) occurs when the letter is in the middle of a word. Qalqalah kubra (major) occurs when the letter is at the end of a word during a stop.' },
  { id:'tj-08', subject:'Tajweed', title:'Waqf and Ibtida', duration:'6 min', body:'Waqf means stopping during recitation. Signs include m (must stop), la (do not stop), j (permissible stop), t (absolute stop). Ibtida means resuming correctly after a stop. Knowing these signs prevents changing the meaning of the Quran during recitation.' },
  { id:'fq-01', subject:'Fiqh', title:'Taharah — Purification', duration:'6 min', body:'Taharah (ritual purity) is a prerequisite for prayer and touching the Quran. It includes Wudu (minor purification), Ghusl (major purification), and Tayammum (dry purification with earth when water is unavailable). Najasah (impurities) must be removed from body, clothing, and place of prayer.' },
  { id:'fq-02', subject:'Fiqh', title:'Wudu Step by Step', duration:'5 min', body:'Wudu has six obligatory acts: intention (niyyah), washing the face, washing both arms to the elbows, wiping a portion of the head, washing both feet to the ankles, and performing acts in order. Sunnah acts include saying Bismillah, washing hands first, and rinsing the mouth and nose.' },
  { id:'fq-03', subject:'Fiqh', title:'Ghusl — Full Purification', duration:'5 min', body:'Ghusl is obligatory after marital relations, wet dream, end of menstruation or postnatal bleeding, and death. The obligatory acts are intention, rinsing the mouth, rinsing the nostrils, and washing the entire body. The Sunnah method includes beginning with wudu.' },
  { id:'fq-04', subject:'Fiqh', title:'Salah — The Five Prayers', duration:'7 min', body:'The five daily prayers are: Fajr (2 rakahs), Dhuhr (4 rakahs), Asr (4 rakahs), Maghrib (3 rakahs), and Isha (4 rakahs). Each prayer has a specific time window and cannot be delayed without a valid reason. Missing prayer intentionally is a major sin.' },
  { id:'fq-05', subject:'Fiqh', title:'Pillars of Salah', duration:'6 min', body:'The pillars (arkan) of salah include: standing (qiyam), opening takbir, reciting Al-Fatihah, bowing (ruku), rising from ruku, prostration (sujud) twice per rakah, sitting between prostrations, final tashahhud, and tasleem (salaam). Missing any pillar invalidates the prayer.' },
  { id:'fq-06', subject:'Fiqh', title:'Zakat — Obligatory Charity', duration:'6 min', body:'Zakat is 2.5% of wealth held above the nisab (minimum threshold equivalent to 85g of gold) for one full lunar year. It is given to eight categories: the poor, the needy, zakat collectors, those whose hearts need winning, slaves, debtors, those striving in Allah\'s way, and travelers.' },
  { id:'fq-07', subject:'Fiqh', title:'Sawm — Fasting in Ramadan', duration:'6 min', body:'Muslims fast from Fajr to Maghrib throughout Ramadan. The fast is broken by eating, drinking, and marital relations. Things that do not break the fast include rinsing the mouth, bathing, and non-nutritional injections. Those excused include travelers, the ill, the elderly, and pregnant or nursing women.' },
  { id:'fq-08', subject:'Fiqh', title:'Hajj — The Pilgrimage', duration:'7 min', body:'Hajj is obligatory once in a lifetime for those physically and financially able. Its main rites include: Ihram (consecrated state), Tawaf (circling the Kabah 7 times), Sai (walking between Safa and Marwa 7 times), standing at Arafah, and throwing pebbles at Mina during Dhul Hijjah 8-12.' },
  { id:'aq-01', subject:'Aqeedah', title:'The Six Pillars of Iman', duration:'6 min', body:'The six pillars of faith are belief in: Allah, His Angels, His Books, His Messengers, the Last Day, and divine decree (Qadar) both good and bad. These are mentioned in the Hadith of Jibreel (Sahih Muslim) and form the foundation of Islamic belief. Rejecting any one pillar removes a person from faith.' },
  { id:'aq-02', subject:'Aqeedah', title:'Tawheed — Oneness of Allah', duration:'7 min', body:'Tawheed has three categories: Tawheed ar-Rububiyyah (Oneness in Lordship) — Allah alone creates and sustains. Tawheed al-Uluhiyyah (Oneness in Worship) — all acts of worship belong solely to Allah. Tawheed al-Asma was-Sifat (Oneness in Names and Attributes) — affirming Allah\'s names and attributes without distortion.' },
  { id:'aq-03', subject:'Aqeedah', title:'Belief in Angels', duration:'5 min', body:'Angels are created from light, have no free will, and worship Allah perfectly. Key angels include: Jibreel (revelation), Mikail (provision and rain), Israfeel (will blow the Trumpet), Izraeel (takes souls), Munkar and Nakir (question in the grave), Malik (guardian of Hell), and Ridwan (guardian of Paradise).' },
  { id:'aq-04', subject:'Aqeedah', title:'The Last Day', duration:'7 min', body:'Belief in the Last Day includes: signs of the Hour (minor and major), the blowing of the Trumpet, resurrection, gathering on the plains of Hashr, the scale (Mizan), the Bridge (Sirat), intercession (Shafaah), and the final abodes of Jannah and Jahannam. Every soul will be held accountable.' },
  { id:'sr-01', subject:'Seerah', title:'Birth and Early Life', duration:'5 min', body:'The Prophet Muhammad (peace be upon him) was born in Makkah in 570 CE, the Year of the Elephant, into the noble tribe of Quraysh, the clan of Banu Hashim. His father Abdullah died before his birth. His mother Aminah died when he was 6. He was then raised by his grandfather Abdul Muttalib, then his uncle Abu Talib.' },
  { id:'sr-02', subject:'Seerah', title:'Youth and Character', duration:'5 min', body:'Before prophethood, he was known as Al-Amin (The Trustworthy) and As-Sadiq (The Truthful). He worked as a shepherd and later as a merchant. At age 25, he married Khadijah bint Khuwaylid RA. He was known for justice, honesty, and avoiding the immoral practices common in his society.' },
  { id:'sr-03', subject:'Seerah', title:'First Revelation', duration:'5 min', body:'At age 40, while meditating in the Cave of Hira, the angel Jibreel appeared and commanded "Iqra!" (Read!). This marked the beginning of revelation. The first five verses of Surah Al-Alaq were revealed. The Prophet returned home trembling. Khadijah RA comforted him and took him to Waraqah ibn Nawfal who confirmed the prophethood.' },
  { id:'sr-04', subject:'Seerah', title:'The Makkan Period', duration:'6 min', body:'For 13 years in Makkah, the Prophet called people to Islam privately then publicly. Early Muslims faced severe persecution including torture, economic boycotts, and social exclusion. Key early converts included Khadijah, Abu Bakr, Ali, Zayd ibn Harithah, and Bilal ibn Rabah. The Hijra to Abyssinia was a pivotal relief.' },
  { id:'sr-05', subject:'Seerah', title:'The Hijra to Madinah', duration:'6 min', body:'In 622 CE, the Prophet emigrated from Makkah to Madinah — this marks Year 1 of the Islamic calendar. He and Abu Bakr hid in the Cave of Thawr for three days. In Madinah, he established the first Islamic state, built the Prophet\'s Mosque, created brotherhood between Muhajireen and Ansar, and issued the Constitution of Madinah.' },
  { id:'sr-06', subject:'Seerah', title:'Key Battles', duration:'7 min', body:'Battle of Badr (2 AH): 313 Muslims defeated 1,000 Quraysh. Battle of Uhud (3 AH): archers left their post leading to a setback; 70 companions were martyred including Hamzah RA. Battle of the Trench (5 AH): Madinah was defended by a trench suggested by Salman al-Farisi. Each battle carried deep lessons for the ummah.' },
  { id:'sr-07', subject:'Seerah', title:'The Farewell Pilgrimage', duration:'6 min', body:'In 10 AH, the Prophet performed his only Hajj. He delivered the Farewell Sermon at Arafah to over 100,000 companions. Key messages: all Muslims are equal, no Arab has superiority over a non-Arab except in taqwa, and women\'s rights must be upheld. The verse completing the religion was revealed during this occasion.' },
  { id:'ar-01', subject:'Arabic', title:'The Arabic Alphabet', duration:'5 min', body:'Arabic has 28 letters, all consonants. Short vowels (harakat) are written as diacritical marks: fathah (a), kasrah (i), and dammah (u). Long vowels are written with alif, waw, and ya. Arabic is written right to left. Letters change shape depending on their position: initial, medial, final, or isolated.' },
  { id:'ar-02', subject:'Arabic', title:'Sun and Moon Letters', duration:'5 min', body:'Arabic letters are classified as shamsiyyah (sun) or qamariyyah (moon). Sun letters cause the lam in the definite article "al" to assimilate: ash-shams. Moon letters keep the lam clear: al-qamar. The 14 sun letters are t, th, d, dh, r, z, s, sh, s, d, t, z, l, n. This affects how every word with "al" is pronounced.' },
  { id:'ar-03', subject:'Arabic', title:'Roots and Patterns', duration:'6 min', body:'Arabic is a root-based language. Most words derive from a 3-letter root that carries a core meaning. The root k-t-b relates to writing: kitaab (book), kataba (he wrote), kaatib (writer), maktab (office), maktabah (library). Understanding roots allows you to guess the meaning of new words rapidly.' },
  { id:'ar-04', subject:'Arabic', title:'Common Quranic Vocabulary', duration:'6 min', body:'The 100 most repeated words in the Quran cover approximately 50% of its text. Key words include: qala (said), alladhina (those who), wa (and), Allah, inna (indeed), kana (was), ma (what/not), min (from), ila (to), ala (upon), la (no/not). Learning these words transforms your Quran comprehension significantly.' },
  { id:'ar-05', subject:'Arabic', title:'Verb Conjugation Basics', duration:'7 min', body:'Arabic verbs conjugate by person, gender, and number. The past tense for kataba (to write): kataba (he wrote), katabat (she wrote), katabtu (I wrote), katabnaa (we wrote), katabtum (you all wrote). The present tense root is yafalu. Understanding verb patterns allows reading the Quran with greater comprehension.' },
];

const SUBJECTS = ['All','Tajweed','Fiqh','Aqeedah','Seerah','Arabic'];
const SUBJECT_COLORS: Record<string,string> = {
  Tajweed:  '#2D6A4F',
  Fiqh:     '#1B4332',
  Aqeedah:  '#7C3AED',
  Seerah:   '#B45309',
  Arabic:   '#0369A1',
};

export default function MadarasaScreen() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [expanded, setExpanded]   = useState<string|null>(null);
  const [subject, setSubject]     = useState('All');
  const [search, setSearch]       = useState('');

  useEffect(() => {
    getCompletedLessons().then(setCompleted).catch(() => {});
  }, []);

  async function markDone(id: string) {
    const updated = [...completed, id];
    setCompleted(updated);
    await markLessonComplete(id);
    setExpanded(null);
  }

  const filtered = LESSONS.filter(l => {
    const matchSubject = subject === 'All' || l.subject === subject;
    const matchSearch  = !search || l.title.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  const total = LESSONS.length;
  const done  = completed.length;
  const pct   = Math.round((done / total) * 100);

  const subjectProgress = Object.fromEntries(
    ['Tajweed','Fiqh','Aqeedah','Seerah','Arabic'].map(s => {
      const sub    = LESSONS.filter(l => l.subject === s);
      const subDone = sub.filter(l => completed.includes(l.id)).length;
      return [s, { done: subDone, total: sub.length }];
    })
  );

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <View style={s.header}>
          <Text style={s.title}>Madarasa</Text>
          <Text style={s.sub}>Islamic Learning Curriculum</Text>
        </View>

        {/* Progress card */}
        <View style={s.progressCard}>
          <View style={s.progressTop}>
            <View>
              <Text style={s.progressNum}>{done}<Text style={s.progressDen}>/{total}</Text></Text>
              <Text style={s.progressLabel}>Lessons Complete</Text>
            </View>
            <View style={s.progressCircle}>
              <Text style={s.progressPct}>{pct}%</Text>
            </View>
          </View>
          <View style={s.barBg}>
            <View style={[s.barFill, {width:`${pct}%` as any}]}/>
          </View>
          <View style={s.subjectBars}>
            {['Tajweed','Fiqh','Aqeedah','Seerah','Arabic'].map(sub => {
              const p    = subjectProgress[sub];
              const col  = SUBJECT_COLORS[sub];
              const pct2 = p.total ? Math.round((p.done / p.total) * 100) : 0;
              return (
                <View key={sub} style={s.subBar}>
                  <View style={s.subBarHead}>
                    <Text style={s.subBarLabel}>{sub}</Text>
                    <Text style={s.subBarCount}>{p.done}/{p.total}</Text>
                  </View>
                  <View style={s.subBarBg}>
                    <View style={[s.subBarFill, {width:`${pct2}%` as any, backgroundColor:col}]}/>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Search */}
        <TextInput
          style={s.search}
          placeholder="Search lessons..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
        />

        {/* Subject filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
          {SUBJECTS.map(sub => (
            <TouchableOpacity
              key={sub}
              style={[s.pill, subject === sub && s.pillActive]}
              onPress={() => setSubject(sub)}
              activeOpacity={0.8}
            >
              <Text style={[s.pillTxt, subject === sub && s.pillTxtActive]}>{sub}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lessons list */}
        <View style={s.list}>
          {filtered.length === 0 && (
            <Text style={s.noResults}>No lessons found for "{search}"</Text>
          )}
          {filtered.map(lesson => {
            const isDone = completed.includes(lesson.id);
            const isOpen = expanded === lesson.id;
            const color  = SUBJECT_COLORS[lesson.subject] ?? colors.mid;
            return (
              <TouchableOpacity
                key={lesson.id}
                style={[s.card, isDone && s.cardDone, isOpen && s.cardOpen]}
                onPress={() => setExpanded(isOpen ? null : lesson.id)}
                activeOpacity={0.8}
              >
                <View style={s.cardTop}>
                  <View style={[s.check, isDone && s.checkDone]}>
                    {isDone && <CheckIcon size={13} color='#fff'/>}
                  </View>
                  <View style={{flex:1}}>
                    <Text style={[s.lessonTitle, isDone && s.lessonTitleDone]}>{lesson.title}</Text>
                    <View style={s.lessonMeta}>
                      <View style={[s.badge, {backgroundColor:`${color}22`, borderColor:`${color}44`}]}>
                        <Text style={[s.badgeTxt, {color}]}>{lesson.subject}</Text>
                      </View>
                      <Text style={s.duration}>{lesson.duration}</Text>
                    </View>
                  </View>
                  {isOpen ? <ChevronUpIcon size={12} color={colors.muted}/> : <ChevronDownIcon size={12} color={colors.muted}/>}
                </View>

                {isOpen && (
                  <View style={s.cardBody}>
                    <Text style={s.bodyTxt}>{lesson.body}</Text>
                    {!isDone ? (
                      <TouchableOpacity style={s.doneBtn} onPress={() => markDone(lesson.id)} activeOpacity={0.85}>
                        <Text style={s.doneBtnTxt}>Mark as Complete</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={s.completedBadge}>
                        <View style={{flexDirection:'row',alignItems:'center',gap:6}}><CheckIcon size={13} color='#34D399'/><Text style={s.completedBadgeTxt}>Completed</Text></View>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={{height:48}}/>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:              { flex:1, backgroundColor:colors.bg },
  scroll:            { flex:1, paddingHorizontal:20 },
  header:            { paddingTop:20, marginBottom:20 },
  title:             { fontFamily:fonts.bold, fontSize:32, color:colors.ink, marginBottom:4 },
  sub:               { fontFamily:fonts.regular, fontSize:14, color:colors.muted },

  progressCard:      { backgroundColor:colors.card, borderRadius:20, padding:20, borderWidth:1, borderColor:colors.border, marginBottom:16 },
  progressTop:       { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:14 },
  progressNum:       { fontFamily:fonts.bold, fontSize:36, color:colors.ink },
  progressDen:       { fontFamily:fonts.regular, fontSize:20, color:colors.muted },
  progressLabel:     { fontFamily:fonts.regular, fontSize:13, color:colors.muted, marginTop:2 },
  progressCircle:    { width:56, height:56, borderRadius:28, backgroundColor:colors.green, alignItems:'center', justifyContent:'center' },
  progressPct:       { fontFamily:fonts.bold, fontSize:16, color:colors.gold },
  barBg:             { height:5, backgroundColor:'rgba(255,255,255,0.07)', borderRadius:3, overflow:'hidden', marginBottom:16 },
  barFill:           { height:'100%', backgroundColor:colors.mid, borderRadius:3 },

  subjectBars:       { gap:8 },
  subBar:            { },
  subBarHead:        { flexDirection:'row', justifyContent:'space-between', marginBottom:4 },
  subBarLabel:       { fontFamily:fonts.medium, fontSize:12, color:colors.muted },
  subBarCount:       { fontFamily:fonts.regular, fontSize:11, color:colors.muted },
  subBarBg:          { height:3, backgroundColor:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden' },
  subBarFill:        { height:'100%', borderRadius:2 },

  search:            { backgroundColor:colors.card, borderRadius:14, borderWidth:1, borderColor:colors.border, color:colors.ink, fontFamily:fonts.regular, fontSize:14, padding:13, paddingHorizontal:16, marginBottom:12 },

  filterScroll:      { marginBottom:16 },
  filterContent:     { gap:8 },
  pill:              { paddingHorizontal:16, paddingVertical:8, borderRadius:20, borderWidth:1, borderColor:colors.border, backgroundColor:colors.card },
  pillActive:        { borderColor:colors.mid, backgroundColor:'rgba(45,106,79,0.15)' },
  pillTxt:           { fontFamily:fonts.medium, fontSize:13, color:colors.muted },
  pillTxtActive:     { color:colors.ink },

  noResults:         { fontFamily:fonts.regular, fontSize:14, color:colors.muted, textAlign:'center', paddingVertical:32 },
  list:              { gap:10 },
  card:              { backgroundColor:colors.card, borderRadius:18, padding:18, borderWidth:1, borderColor:colors.border },
  cardDone:          { opacity:0.6 },
  cardOpen:          { borderColor:'rgba(201,168,76,0.28)' },
  cardTop:           { flexDirection:'row', alignItems:'center', gap:12 },
  check:             { width:24, height:24, borderRadius:12, borderWidth:1.5, borderColor:colors.border, alignItems:'center', justifyContent:'center', flexShrink:0 },
  checkDone:         { backgroundColor:colors.mid, borderColor:colors.mid },
  checkMark:         { fontSize:12, color:'#fff' },
  lessonTitle:       { fontFamily:fonts.semibold, fontSize:15, color:colors.ink, marginBottom:6 },
  lessonTitleDone:   { color:colors.muted },
  lessonMeta:        { flexDirection:'row', alignItems:'center', gap:8 },
  badge:             { paddingHorizontal:8, paddingVertical:3, borderRadius:8, borderWidth:1 },
  badgeTxt:          { fontFamily:fonts.medium, fontSize:10, letterSpacing:0.3 },
  duration:          { fontFamily:fonts.regular, fontSize:11, color:colors.muted },
  chevron:           { fontSize:10, color:colors.muted },
  cardBody:          { marginTop:16, paddingTop:16, borderTopWidth:1, borderTopColor:colors.border },
  bodyTxt:           { fontFamily:fonts.regular, fontSize:14, color:colors.muted, lineHeight:23, marginBottom:16 },
  doneBtn:           { backgroundColor:colors.green, borderRadius:12, padding:13, alignItems:'center' },
  doneBtnTxt:        { fontFamily:fonts.semibold, fontSize:14, color:'#fff' },
  completedBadge:    { backgroundColor:'rgba(45,106,79,0.15)', borderRadius:10, padding:10, alignItems:'center', borderWidth:1, borderColor:'rgba(45,106,79,0.3)' },
  completedBadgeTxt: { fontFamily:fonts.medium, fontSize:13, color:'#34D399' },
});
