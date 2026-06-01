import { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet,  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../../constants/colors';

const DUAS = [
  { id:'1', category:'Morning', title:'Morning Supplication', arabic:'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا', transliteration:'Allahumma bika asbahna wa bika amsayna wa bika nahya wa bika namutu wa ilayka nushur', translation:'O Allah, by You we enter the morning, by You we enter the evening, by You we live, by You we die, and to You is the resurrection.' },
  { id:'2', category:'Morning', title:'Sayyid al-Istighfar', arabic:'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ', transliteration:'Allahumma anta rabbi la ilaha illa anta khalaqtani wa ana abduk', translation:'O Allah, You are my Lord. There is no god but You. You created me and I am Your servant, upon Your covenant and promise as best I can.' },
  { id:'3', category:'Morning', title:'Morning Protection', arabic:'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ', transliteration:'Bismillahil-ladhi la yadurru ma a ismihi shay un fil-ardi wa la fis-sama i', translation:'In the name of Allah with Whose name nothing can cause harm in the earth or heaven. He is the All-Hearing, the All-Knowing.' },
  { id:'4', category:'Morning', title:'Morning Remembrance', arabic:'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ', transliteration:'Asbahna wa asbahal-mulku lillah walhamdu lillah', translation:'We have entered the morning and the Kingdom belongs to Allah. All praise is for Allah.' },
  { id:'5', category:'Evening', title:'Evening Supplication', arabic:'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ', transliteration:'Allahumma bika amsayna wa bika asbahna wa bika nahya wa bika namutu wa ilaykal-masir', translation:'O Allah, by You we enter the evening, by You we enter the morning, by You we live, by You we die, and to You is the return.' },
  { id:'6', category:'Evening', title:'Entering the Night', arabic:'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ', transliteration:'Amsayna wa amsal-mulku lillah walhamdu lillah', translation:'We have entered the evening and the Kingdom belongs to Allah. All praise is for Allah.' },
  { id:'7', category:'Sleep', title:'Before Sleeping', arabic:'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', transliteration:'Bismika Allahumma amutu wa ahya', translation:'In Your name, O Allah, I die and I live.' },
  { id:'8', category:'Sleep', title:'Upon Waking', arabic:'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا', transliteration:'Alhamdulillahil-ladhi ahyana ba da ma amatana wa ilayhin-nushur', translation:'All praise is for Allah who gave us life after death and to Him is the resurrection.' },
  { id:'9', category:'Sleep', title:'Dua Before Sleeping', arabic:'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ', transliteration:'Allahumma qini adhabaka yawma tab athu ibadak', translation:'O Allah, protect me from Your punishment on the Day You resurrect Your servants.' },
  { id:'10', category:'Daily', title:'Before Eating', arabic:'بِسْمِ اللَّهِ', transliteration:'Bismillah', translation:'In the name of Allah.' },
  { id:'11', category:'Daily', title:'After Eating', arabic:'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ', transliteration:'Alhamdulillahil-ladhi at amana wa saqana wa ja alana muslimin', translation:'All praise is for Allah who fed us, gave us drink, and made us Muslims.' },
  { id:'12', category:'Daily', title:'Before Leaving Home', arabic:'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', transliteration:'Bismillah tawakkaltu alallah wa la hawla wa la quwwata illa billah', translation:'In the name of Allah, I place my trust in Allah, and there is no might or power except with Allah.' },
  { id:'13', category:'Daily', title:'Entering the Home', arabic:'بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا', transliteration:'Bismillahi walajna wa bismillahi kharajna wa alallahi rabbina tawakkalna', translation:'In the name of Allah we enter, in the name of Allah we leave, and upon Allah our Lord we place our trust.' },
  { id:'14', category:'Daily', title:'Entering the Masjid', arabic:'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', transliteration:'Allahumma iftah li abwaba rahmatik', translation:'O Allah, open for me the gates of Your mercy.' },
  { id:'15', category:'Daily', title:'Leaving the Masjid', arabic:'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ', transliteration:'Allahumma inni as aluka min fadlik', translation:'O Allah, I ask You of Your bounty.' },
  { id:'16', category:'Daily', title:'When Wearing Clothes', arabic:'الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا وَرَزَقَنِيهِ', transliteration:'Alhamdulillahil-ladhi kasani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah', translation:'All praise is for Allah who clothed me with this and provided it without any power from myself.' },
  { id:'17', category:'Daily', title:'Looking in the Mirror', arabic:'اللَّهُمَّ أَنْتَ حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي', transliteration:'Allahumma anta hassanta khalqi fahassin khuluqi', translation:'O Allah, just as You have made my external features good, make my character good as well.' },
  { id:'18', category:'Daily', title:'When It Rains', arabic:'اللَّهُمَّ صَيِّبًا نَافِعًا', transliteration:'Allahumma sayyiban nafi an', translation:'O Allah, make it a beneficial rain.' },
  { id:'19', category:'Daily', title:'When Sneezing', arabic:'الْحَمْدُ لِلَّهِ', transliteration:'Alhamdulillah', translation:'All praise is for Allah.' },
  { id:'20', category:'Daily', title:'Response to Sneezing', arabic:'يَرْحَمُكَ اللَّهُ', transliteration:'Yarhamukallah', translation:'May Allah have mercy on you.' },
  { id:'21', category:'Daily', title:'Entering the Toilet', arabic:'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ', transliteration:'Allahumma inni a udhu bika minal-khubuthi wal-khaba ith', translation:'O Allah, I seek refuge in You from male and female devils.' },
  { id:'22', category:'Prayer', title:'Before Wudu', arabic:'بِسْمِ اللَّهِ', transliteration:'Bismillah', translation:'In the name of Allah.' },
  { id:'23', category:'Prayer', title:'After Wudu', arabic:'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', transliteration:'Ashhadu an la ilaha illallahu wahdahu la sharika lah', translation:'I bear witness that there is no god but Allah alone, with no partner.' },
  { id:'24', category:'Prayer', title:'Opening Dua in Prayer', arabic:'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ', transliteration:'Subhanakal-lahumma wa bihamdika wa tabarakasmuka wa ta ala jadduka', translation:'Glory be to You O Allah and praise. Blessed is Your name and exalted is Your majesty.' },
  { id:'25', category:'Prayer', title:'Dua in Ruku', arabic:'سُبْحَانَ رَبِّيَ الْعَظِيمِ', transliteration:'Subhana rabbiyal adhim', translation:'Glory be to my Lord, the Most Great.' },
  { id:'26', category:'Prayer', title:'Dua in Sujud', arabic:'سُبْحَانَ رَبِّيَ الْأَعْلَى', transliteration:'Subhana rabbiyal a la', translation:'Glory be to my Lord, the Most High.' },
  { id:'27', category:'Prayer', title:'Between Two Sujud', arabic:'رَبِّ اغْفِرْ لِي', transliteration:'Rabbighfir li', translation:'My Lord, forgive me.' },
  { id:'28', category:'Protection', title:'Ayatul Kursi', arabic:'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', transliteration:'Allahu la ilaha illa huwal-hayyul-qayyum', translation:'Allah, there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep.' },
  { id:'29', category:'Protection', title:'Against Evil Eye', arabic:'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', transliteration:'A udhu bikalimatillahit-tammati min sharri ma khalaq', translation:'I seek refuge in the perfect words of Allah from the evil of what He has created.' },
  { id:'30', category:'Protection', title:'The Three Quls', arabic:'قُلْ هُوَ اللَّهُ أَحَدٌ — قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ — قُلْ أَعُوذُ بِرَبِّ النَّاسِ', transliteration:'Qul Huwallahu ahad — Qul a udhu birabbil-falaq — Qul a udhu birabbin-nas 3x each', translation:'Al-Ikhlas, Al-Falaq, and An-Nas each recited 3 times in the morning and evening for complete protection.' },
  { id:'31', category:'Forgiveness', title:'Sayyidul Istighfar', arabic:'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ', transliteration:'Allahumma anta rabbi la ilaha illa anta khalaqtani wa ana abduk', translation:'O Allah, You are my Lord. There is no god but You. You created me and I am Your servant, holding to Your covenant as best I can.' },
  { id:'32', category:'Forgiveness', title:'General Forgiveness', arabic:'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ', transliteration:'Rabbighfir li wa tub alayya innaka antat-tawwabur-rahim', translation:'My Lord, forgive me and accept my repentance. Surely You are the Accepter of repentance, the Most Merciful.' },
  { id:'33', category:'Forgiveness', title:'Seeking Forgiveness', arabic:'رَبِّ اغْفِرْ لِي', transliteration:'Rabbighfir li 100x daily', translation:'My Lord, forgive me. The Prophet peace be upon him would seek forgiveness more than 70 times a day.' },
  { id:'34', category:'Travel', title:'Before Travelling', arabic:'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ', transliteration:'Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin', translation:'Glory be to Him who has subjected this to us. We could not have done it ourselves, and indeed to our Lord we shall return.' },
  { id:'35', category:'Travel', title:'Returning from Travel', arabic:'آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ', transliteration:'Ayibuna ta ibuna abiduna lirabbina hamidun', translation:'We return, repenting, worshipping, and praising our Lord.' },
  { id:'36', category:'Travel', title:'Dua for a Good Journey', arabic:'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى', transliteration:'Allahumma inna nas aluka fi safarina hadhal-birra wat-taqwa', translation:'O Allah, we ask You for righteousness and piety in this journey of ours.' },
  { id:'37', category:'Distress', title:'Dua of Yunus AS', arabic:'لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ', transliteration:'La ilaha illa anta subhanaka inni kuntu minaz-zalimin', translation:'There is no god but You. Glory be to You. Indeed I have been of the wrongdoers.' },
  { id:'38', category:'Distress', title:'Dua for Anxiety', arabic:'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَالْعَجْزِ وَالْكَسَلِ', transliteration:'Allahumma inni a udhu bika minal-hammi wal-hazan wal-ajzi wal-kasal', translation:'O Allah, I seek refuge in You from worry, grief, incapacity, and laziness.' },
  { id:'39', category:'Distress', title:'For Difficult Matters', arabic:'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا', transliteration:'Allahumma la sahla illa ma ja altahu sahla', translation:'O Allah, there is no ease except what You make easy, and You make difficulty easy when You will.' },
  { id:'40', category:'Distress', title:'Hasbi Allah', arabic:'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ', transliteration:'Hasbiyallahu la ilaha illa huwa alayhi tawakkaltu', translation:'Allah is sufficient for me. There is no god but Him. Upon Him I rely, and He is the Lord of the magnificent Throne.' },
  { id:'41', category:'Family', title:'For Righteous Children', arabic:'رَبِّ هَبْ لِي مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً', transliteration:'Rabbi hab li milladunka dhurriyyatan tayyibah', translation:'My Lord, grant me from Yourself a good offspring. Indeed, You are the Hearer of supplication.' },
  { id:'42', category:'Family', title:'For Parents', arabic:'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', transliteration:'Rabbir hamhuma kama rabbayani saghira', translation:'My Lord, have mercy upon them as they raised me when I was small.' },
  { id:'43', category:'Family', title:'For Spouse and Family', arabic:'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ', transliteration:'Rabbana hab lana min azwajina wa dhurriyyatina qurrata a yun', translation:'Our Lord, grant us from among our wives and offspring comfort to our eyes and make us a leader for the righteous.' },
  { id:'44', category:'Knowledge', title:'Increase in Knowledge', arabic:'رَّبِّ زِدْنِي عِلْمًا', transliteration:'Rabbi zidni ilma', translation:'My Lord, increase me in knowledge.' },
  { id:'45', category:'Knowledge', title:'Before Studying', arabic:'اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي وَعَلِّمْنِي مَا يَنْفَعُنِي', transliteration:'Allahumma infa ni bima allamtani wa allimni ma yanfa uni', translation:'O Allah, benefit me with what You have taught me, and teach me that which will benefit me.' },
  { id:'46', category:'Knowledge', title:'For Understanding', arabic:'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي', transliteration:'Rabbish-rah li sadri wa yassir li amri', translation:'My Lord, expand for me my chest and ease for me my task.' },
  { id:'47', category:'Gratitude', title:'Complete Gratitude', arabic:'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ', transliteration:'Allahumma a inni ala dhikrika wa shukrika wa husni ibadatik', translation:'O Allah, help me to remember You, to thank You, and to worship You in the best manner.' },
  { id:'48', category:'Gratitude', title:'Dua of Gratitude', arabic:'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ', transliteration:'Rabbi awzi ni an ashkura ni matakal-lati an amta alayya', translation:'My Lord, enable me to be grateful for Your favor which You have bestowed upon me.' },
  { id:'49', category:'Health', title:'Dua for the Sick', arabic:'اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ وَاشْفِ أَنْتَ الشَّافِي', transliteration:'Allahumma rabban-nas adhhabil-ba sa washfi antash-shafi', translation:'O Allah, Lord of mankind, remove the harm and heal. You are the Healer. There is no healing except Your healing.' },
  { id:'50', category:'Health', title:'Visiting the Sick', arabic:'لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ', transliteration:'La ba sa tahurun insha Allah', translation:'Do not worry, it will be a purification, if Allah wills.' },
  { id:'51', category:'Health', title:'Ruqyah for Oneself', arabic:'بِسْمِ اللَّهِ أَرْقِيكَ مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ', transliteration:'Bismillahi arqika min kulli shay in yu dhika', translation:'In the name of Allah I perform ruqyah for you, from everything that is harming you. May Allah heal you.' },
  { id:'52', category:'Health', title:'For Recovery', arabic:'اللَّهُمَّ عَافِنِي فِي بَدَنِي اللَّهُمَّ عَافِنِي فِي سَمْعِي', transliteration:'Allahumma afini fi badani Allahumma afini fi sam i Allahumma afini fi basari', translation:'O Allah, grant me health in my body, in my hearing, and in my sight.' },
];

const CATEGORIES = ['All','Morning','Evening','Sleep','Daily','Prayer','Protection','Forgiveness','Travel','Distress','Family','Knowledge','Gratitude','Health'];

const CAT_COLOR = {
  Morning:'#D97706',
  Evening:'#7C3AED',
  Sleep:'#0369A1',
  Daily:'#2D6A4F',
  Prayer:'#1B4332',
  Protection:'#DC2626',
  Forgiveness:'#059669',
  Travel:'#B45309',
  Distress:'#6B7280',
  Family:'#DB2777',
  Knowledge:'#0891B2',
  Gratitude:'#D97706',
  Health:'#059669',
};

export default function DuasScreen() {
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const [translit, setTranslit] = useState(true);

  const filtered = DUAS.filter(d => {
    const matchCat  = category === 'All' || d.category === category;
    const matchSrch = !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.translation.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSrch;
  });

  const countFor = (cat) => cat === 'All' ? DUAS.length : DUAS.filter(d => d.category === cat).length;

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:colors.bg }}>

      <View style={{ flexDirection:'row', alignItems:'flex-start', justifyContent:'space-between', paddingHorizontal:20, paddingTop:20, paddingBottom:16 }}>
        <View>
          <Text style={{ fontFamily:fonts.bold, fontSize:30, color:colors.ink, marginBottom:3 }}>Dua Library</Text>
          <Text style={{ fontFamily:fonts.regular, fontSize:13, color:colors.muted }}>{DUAS.length} supplications</Text>
        </View>
        <TouchableOpacity
          style={{ marginTop:4, paddingHorizontal:12, paddingVertical:7, borderRadius:10, borderWidth:1, borderColor: translit ? 'rgba(201,168,76,0.4)' : colors.border, backgroundColor: translit ? 'rgba(201,168,76,0.08)' : colors.card }}
          onPress={() => setTranslit(v => !v)}
          activeOpacity={0.8}
        >
          <Text style={{ fontFamily:fonts.medium, fontSize:12, color: translit ? colors.gold : colors.muted }}>Transliteration</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginHorizontal:20, marginBottom:12, flexDirection:'row', alignItems:'center', backgroundColor:colors.card, borderRadius:14, borderWidth:1, borderColor:colors.border, paddingHorizontal:14 }}>
        <TextInput
          style={{ flex:1, fontFamily:fonts.regular, fontSize:14, color:colors.ink, paddingVertical:13 }}
          placeholder="Search duas..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={{ padding:6 }}>
            <Text style={{ fontSize:13, color:colors.muted }}>x</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight:44, marginBottom:14 }}
        contentContainerStyle={{ paddingHorizontal:20, gap:8, alignItems:'center' }}
      >
        {CATEGORIES.map(cat => {
          const active = category === cat;
          const color  = CAT_COLOR[cat] || '#2D6A4F';
          return (
            <TouchableOpacity
              key={cat}
              style={{ flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:12, paddingVertical:7, borderRadius:20, borderWidth:1, height:36, borderColor: active ? color + '88' : colors.border, backgroundColor: active ? color + '22' : colors.card }}
              onPress={() => setCategory(cat)}
              activeOpacity={0.75}
            >
              <Text style={{ fontFamily:fonts.medium, fontSize:13, color: active ? color : colors.muted }}>{cat}</Text>
              <View style={{ backgroundColor: active ? color + '33' : 'rgba(255,255,255,0.06)', borderRadius:10, paddingHorizontal:6, paddingVertical:1 }}>
                <Text style={{ fontFamily:fonts.bold, fontSize:10, color: active ? color : colors.muted }}>{countFor(cat)}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={{ flex:1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal:20, gap:8 }}>
        {filtered.length === 0 && (
          <View style={{ alignItems:'center', paddingVertical:48 }}>
            <Text style={{ fontFamily:fonts.regular, fontSize:14, color:colors.muted }}>No duas found</Text>
          </View>
        )}
        {filtered.map(dua => {
          const open  = expanded === dua.id;
          const color = CAT_COLOR[dua.category] || '#2D6A4F';
          return (
            <TouchableOpacity
              key={dua.id}
              style={{ backgroundColor:colors.card, borderRadius:16, borderWidth:1, borderLeftWidth:3, overflow:'hidden', borderColor: open ? 'rgba(201,168,76,0.2)' : colors.border, borderLeftColor: open ? color : 'transparent' }}
              onPress={() => setExpanded(open ? null : dua.id)}
              activeOpacity={0.82}
            >
              <View style={{ flexDirection:'row', alignItems:'center', gap:12, padding:16 }}>
                <View style={{ width:8, height:8, borderRadius:4, backgroundColor:color, flexShrink:0 }}/>
                <View style={{ flex:1 }}>
                  <Text style={{ fontFamily:fonts.semibold, fontSize:15, color:colors.ink, marginBottom:3 }}>{dua.title}</Text>
                  <Text style={{ fontFamily:fonts.medium, fontSize:11, color }}>{dua.category}</Text>
                </View>
                <Text style={{ fontSize:22, color:colors.muted }}>{open ? 'v' : '>'}</Text>
              </View>
              {open && (
                <View style={{ paddingHorizontal:16, paddingBottom:18, borderTopWidth:1, borderTopColor:colors.border }}>
                  <View style={{ backgroundColor:'rgba(201,168,76,0.05)', borderRadius:12, padding:16, marginBottom:14, marginTop:4 }}>
                    <Text style={{ fontFamily:fonts.arabic, fontSize:22, color:colors.gold, textAlign:'right', lineHeight:42 }}>{dua.arabic}</Text>
                  </View>
                  {translit && (
                    <Text style={{ fontFamily:fonts.regular, fontSize:13, color:colors.muted, fontStyle:'italic', lineHeight:20, marginBottom:14 }}>{dua.transliteration}</Text>
                  )}
                  <View style={{ height:1, backgroundColor:colors.border, marginBottom:14 }}/>
                  <Text style={{ fontFamily:fonts.regular, fontSize:14, color:colors.ink, lineHeight:22 }}>{dua.translation}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        <View style={{ height:40 }}/>
      </ScrollView>
    </SafeAreaView>
  );
}
