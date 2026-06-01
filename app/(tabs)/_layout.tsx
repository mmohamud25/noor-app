import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { colors, fonts } from '../../constants/colors';

function HomeIco({ c }: { c: string }) {
  return <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={c} strokeWidth={1.6} strokeLinejoin="round"/>
    <Path d="M9 21V12h6v9" stroke={c} strokeWidth={1.6} strokeLinecap="round"/>
  </Svg>;
}
function BookIco({ c }: { c: string }) {
  return <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={2} width={18} height={20} rx={2} stroke={c} strokeWidth={1.6}/>
    <Line x1={7} y1={2} x2={7} y2={22} stroke={c} strokeWidth={1.4} strokeOpacity={0.4}/>
    <Line x1={10} y1={8} x2={19} y2={8} stroke={c} strokeWidth={1.2} strokeLinecap="round" strokeOpacity={0.6}/>
    <Line x1={10} y1={12} x2={19} y2={12} stroke={c} strokeWidth={1.2} strokeLinecap="round" strokeOpacity={0.4}/>
    <Line x1={10} y1={16} x2={15} y2={16} stroke={c} strokeWidth={1.2} strokeLinecap="round" strokeOpacity={0.3}/>
  </Svg>;
}
function DhikrIco({ c }: { c: string }) {
  return <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={9} stroke={c} strokeWidth={1.6}/>
    <Circle cx={12} cy={12} r={3} stroke={c} strokeWidth={1.4}/>
    <Line x1={12} y1={3} x2={12} y2={6} stroke={c} strokeWidth={1.4} strokeLinecap="round"/>
  </Svg>;
}
function LearnIco({ c }: { c: string }) {
  return <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3L2 8l10 5 10-5-10-5z" stroke={c} strokeWidth={1.6} strokeLinejoin="round"/>
    <Path d="M2 8v6M6 10.5v5a6 6 0 0012 0v-5" stroke={c} strokeWidth={1.6} strokeLinecap="round"/>
  </Svg>;
}
function MoreIco({ c }: { c: string }) {
  return <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={3} width={8} height={8} rx={1.5} stroke={c} strokeWidth={1.6}/>
    <Rect x={13} y={3} width={8} height={8} rx={1.5} stroke={c} strokeWidth={1.6}/>
    <Rect x={3} y={13} width={8} height={8} rx={1.5} stroke={c} strokeWidth={1.6}/>
    <Rect x={13} y={13} width={8} height={8} rx={1.5} stroke={c} strokeWidth={1.6}/>
  </Svg>;
}

function TabIcon({ Icon, label, focused }: { Icon: any; label: string; focused: boolean }) {
  const c = focused ? colors.gold : colors.muted;
  return (
    <View style={s.wrap}>
      <Icon c={c}/>
      <Text style={[s.label, { color: c }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: s.bar, tabBarShowLabel: false }}>
      <Tabs.Screen name="index"    options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={HomeIco}  label="Home"  focused={focused}/> }} />
      <Tabs.Screen name="quran"    options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={BookIco}  label="Quran" focused={focused}/> }} />
      <Tabs.Screen name="dhikr"    options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={DhikrIco} label="Dhikr" focused={focused}/> }} />
      <Tabs.Screen name="madarasa" options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={LearnIco} label="Learn" focused={focused}/> }} />
      <Tabs.Screen name="more"     options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={MoreIco}  label="More"  focused={focused}/> }} />
      <Tabs.Screen name="prayer"   options={{ href: null }} />
      <Tabs.Screen name="duas"     options={{ href: null }} />
      <Tabs.Screen name="summary"  options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="search"   options={{ href: null }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  bar:   { backgroundColor:colors.panel, borderTopColor:colors.border, borderTopWidth:1, height:72, paddingBottom:8 },
  wrap:  { alignItems:'center', justifyContent:'center', gap:4, paddingTop:6, width:60 },
  label: { fontSize:10, textAlign:'center' },
});
