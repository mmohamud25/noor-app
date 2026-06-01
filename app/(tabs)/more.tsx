import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet,  ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { SearchIcon, PrayerIcon, DuaIcon, SummaryIcon, SettingsIcon } from '../../components/Icons';

const MENU_ICONS = { search: SearchIcon, prayer: PrayerIcon, duas: DuaIcon, summary: SummaryIcon, settings: SettingsIcon };
const MENU = [
  { iconKey:'search',   label:'Quran Search',   sub:'Find any surah or ayah',       route:'/(tabs)/search'   },
  { iconKey:'prayer',   label:'Prayer Times',   sub:'Today\'s salah schedule',     route:'/(tabs)/prayer'   },
  { iconKey:'duas',     label:'Dua Library',    sub:'Supplications & dhikr',        route:'/(tabs)/duas'     },
  { iconKey:'summary',  label:'Weekly Summary', sub:'Your progress this week',      route:'/(tabs)/summary'  },
  { iconKey:'settings', label:'Settings',       sub:'Account, language, reminders', route:'/(tabs)/settings' },
];

export default function MoreScreen() {
  const router = useRouter();
  const { profile, isGuest } = useAuth();
  const displayName = profile?.name || profile?.email?.split('@')[0] || 'Guest';
  const initial = displayName[0]?.toUpperCase() ?? 'N';

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.title}>More</Text>
        </View>

        <TouchableOpacity style={s.profileCard} onPress={() => router.push('/(tabs)/settings')} activeOpacity={0.85}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initial}</Text>
          </View>
          <View style={{flex:1}}>
            <Text style={s.profileName}>{isGuest ? 'Guest User' : displayName}</Text>
            <Text style={s.profileSub}>{isGuest ? 'Tap to create an account' : (profile?.email ?? '')}</Text>
          </View>
          <Text style={s.arrow}>›</Text>
        </TouchableOpacity>

        <View style={s.menuCard}>
          {MENU.map((item, i) => (
            <TouchableOpacity key={item.label}
              style={[s.menuRow, i < MENU.length-1 && s.menuBorder]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.75}
            >
              <View style={s.menuIcon}>
                {React.createElement(MENU_ICONS[item.iconKey] || SearchIcon, { size: 22, color: colors.gold })}
              </View>
              <View style={{flex:1}}>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Text style={s.menuSub}>{item.sub}</Text>
              </View>
              <Text style={s.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.brand}>
          <Text style={s.brandAr}>نور</Text>
          <Text style={s.brandName}>NOOR</Text>
          <Text style={s.brandSub}>Illuminate Your Islamic Journey</Text>
          <Text style={s.brandCopy}>© 2026 Kulan Group Ltd · v1.0.0 Beta</Text>
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
  title:{ fontFamily:fonts.bold, fontSize:32, color:colors.ink },
  profileCard:{ flexDirection:'row', alignItems:'center', gap:14, backgroundColor:colors.card, borderRadius:20, padding:18, borderWidth:1, borderColor:colors.border, marginBottom:20 },
  avatar:{ width:52, height:52, borderRadius:26, backgroundColor:colors.green, alignItems:'center', justifyContent:'center', borderWidth:2, borderColor:'rgba(201,168,76,0.25)' },
  avatarText:{ fontFamily:fonts.arabic, fontSize:22, color:colors.gold },
  profileName:{ fontFamily:fonts.semibold, fontSize:17, color:colors.ink, marginBottom:3 },
  profileSub:{ fontFamily:fonts.regular, fontSize:13, color:colors.muted },
  arrow:{ fontSize:22, color:colors.muted },
  menuCard:{ backgroundColor:colors.card, borderRadius:20, borderWidth:1, borderColor:colors.border, overflow:'hidden', marginBottom:32 },
  menuRow:{ flexDirection:'row', alignItems:'center', gap:14, padding:18 },
  menuBorder:{ borderBottomWidth:1, borderBottomColor:colors.border },
  menuIcon:{ width:46, height:46, borderRadius:23, backgroundColor:colors.panel, alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:colors.border },
  menuIconText:{ fontSize:21 },
  menuLabel:{ fontFamily:fonts.semibold, fontSize:15, color:colors.ink, marginBottom:2 },
  menuSub:{ fontFamily:fonts.regular, fontSize:12, color:colors.muted },
  brand:{ alignItems:'center', paddingVertical:24, gap:4 },
  brandAr:{ fontFamily:fonts.arabic, fontSize:52, color:colors.gold, lineHeight:60 },
  brandName:{ fontFamily:fonts.bold, fontSize:18, color:colors.ink, letterSpacing:5 },
  brandSub:{ fontFamily:fonts.regular, fontSize:13, color:colors.muted },
  brandCopy:{ fontFamily:fonts.regular, fontSize:11, color:'rgba(245,240,232,0.2)', marginTop:4 },
});
