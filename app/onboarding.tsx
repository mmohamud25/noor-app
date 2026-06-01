import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CheckIcon } from '../components/Icons';
import { colors, fonts } from '../constants/colors';
import { setOnboardingDone } from '../lib/storage';

const STEPS = [
  { key:'level', title:'What is your\nQuran level?', options:['Beginner','Intermediate','Advanced'] },
  { key:'goal',  title:'What is your\nmain goal?', options:['Memorize the Quran','Revise what I know','Learn with tajweed','Understand the meaning'] },
  { key:'time',  title:'How much time\ncan you spare daily?', options:['5 minutes','15 minutes','30 minutes','1 hour'] },
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string|null>(null);
  const current = STEPS[step];

  async function next() {
    if (!selected) return;
    setSelected(null);
    if (step < STEPS.length - 1) { setStep(s => s + 1); }
    else { await setOnboardingDone(); router.replace('/(tabs)'); }
  }
  async function skip() { await setOnboardingDone(); router.replace('/(tabs)'); }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View style={s.logoRow}>
          <Text style={s.logoAr}>نور</Text>
          <Text style={s.logoEn}>Noor</Text>
        </View>
        <TouchableOpacity onPress={skip} style={s.skipBtn}>
          <Text style={s.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={s.dots}>
        {STEPS.map((_,i) => <View key={i} style={[s.dot, i===step && s.dotActive]}/>)}
      </View>

      <View style={s.body}>
        <Text style={s.stepNum}>Step {step+1} of {STEPS.length}</Text>
        <Text style={s.question}>{current.title}</Text>
        <View style={s.options}>
          {current.options.map(opt => (
            <TouchableOpacity key={opt}
              style={[s.option, selected===opt && s.optionSelected]}
              onPress={() => setSelected(opt)}
              activeOpacity={0.8}
            >
              <Text style={[s.optionText, selected===opt && s.optionTextSelected]}>{opt}</Text>
              {selected===opt && (
                <View style={s.check}><CheckIcon size={12} color='#fff'/></View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[s.nextBtn, !selected && s.disabled]}
        onPress={next}
        disabled={!selected}
        activeOpacity={0.85}
      >
        <Text style={s.nextText}>{step===STEPS.length-1 ? 'Get Started' : 'Continue'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:{ flex:1, backgroundColor:colors.bg, paddingHorizontal:24 },
  header:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingTop:20, marginBottom:32 },
  logoRow:{ flexDirection:'row', alignItems:'center', gap:8 },
  logoAr:{ fontFamily:fonts.heading, fontSize:28, color:colors.gold },
  logoEn:{ fontFamily:fonts.heading, fontSize:20, color:colors.ink, letterSpacing:2 },
  skipBtn:{ padding:8 },
  skip:{ fontFamily:fonts.body, fontSize:14, color:colors.muted },
  dots:{ flexDirection:'row', gap:8, marginBottom:40 },
  dot:{ width:8, height:8, borderRadius:4, backgroundColor:colors.panel },
  dotActive:{ backgroundColor:colors.gold, width:28 },
  body:{ flex:1 },
  stepNum:{ fontFamily:fonts.body, fontSize:12, color:colors.gold, letterSpacing:0.5, marginBottom:10 },
  question:{ fontFamily:fonts.heading, fontSize:38, color:colors.ink, lineHeight:46, marginBottom:32 },
  options:{ gap:12 },
  option:{ backgroundColor:colors.card, borderRadius:18, padding:20, borderWidth:1, borderColor:colors.border, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  optionSelected:{ borderColor:colors.gold, backgroundColor:'rgba(201,168,76,0.08)' },
  optionText:{ fontFamily:fonts.medium, fontSize:16, color:colors.muted },
  optionTextSelected:{ color:colors.ink },
  check:{ width:24, height:24, borderRadius:12, backgroundColor:colors.mid, alignItems:'center', justifyContent:'center' },
  nextBtn:{ backgroundColor:colors.green, borderRadius:18, padding:19, alignItems:'center', marginBottom:28 },
  disabled:{ opacity:0.35 },
  nextText:{ fontFamily:fonts.bold, fontSize:16, color:'#fff', letterSpacing:0.3 },
});
