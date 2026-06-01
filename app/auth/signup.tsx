import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet,  KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { WarningIcon, CheckIcon } from '../../components/Icons';
import { colors, fonts } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';

function getPasswordStrength(p: string): { label:string; color:string; width:string } {
  if (p.length===0) return {label:'',color:'transparent',width:'0%'};
  if (p.length<6)   return {label:'Too short',color:colors.error,width:'25%'};
  if (p.length<8)   return {label:'Weak',color:'#F59E0B',width:'50%'};
  if (p.length<12)  return {label:'Good',color:colors.mid,width:'75%'};
  return {label:'Strong',color:colors.success,width:'100%'};
}

export default function SignUpScreen() {
  const router = useRouter();
  const { signUpWithEmail } = useAuth();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const strength = getPasswordStrength(password);

  async function handleSignUp() {
    if (!name.trim()||name.trim().length<2) { setError('Please enter your full name.'); return; }
    if (!email.includes('@')) { setError('Please enter a valid email address.'); return; }
    if (password.length<6) { setError('Password must be at least 6 characters.'); return; }
    if (!agreed) { setError('Please agree to the Terms of Service to continue.'); return; }
    setLoading(true); setError('');
    const { error:err } = await signUpWithEmail(email, password, name.trim()) as any;
    if (err) { setError(err.message); setLoading(false); }
    else { router.replace('/(tabs)'); }
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={s.kav} behavior={Platform.OS==='ios'?'padding':'height'}>
        <View style={s.logoWrap}>
          <Text style={s.logoAr}>نور</Text>
          <Text style={s.logoEn}>NOOR</Text>
        </View>
        <Text style={s.heading}>Create Account</Text>
        <Text style={s.headingSub}>Free forever. No credit card required.</Text>

        {error?<View style={s.errorBox}><View style={{flexDirection:'row',alignItems:'center',gap:8}}><WarningIcon size={15} color='#E57373'/><Text style={s.errorText}>{error}</Text></View></View>:null}

        <TextInput style={s.input} placeholder="Full name" placeholderTextColor={colors.muted} value={name} onChangeText={n=>{setName(n);setError('');}} autoCapitalize="words" returnKeyType="next"/>
        <TextInput style={s.input} placeholder="Email address" placeholderTextColor={colors.muted} value={email} onChangeText={e=>{setEmail(e);setError('');}} autoCapitalize="none" keyboardType="email-address" returnKeyType="next"/>
        <TextInput style={s.input} placeholder="Password (min 6 characters)" placeholderTextColor={colors.muted} value={password} onChangeText={p=>{setPassword(p);setError('');}} secureTextEntry returnKeyType="done" onSubmitEditing={handleSignUp}/>

        {password.length>0&&(
          <View style={s.strengthWrap}>
            <View style={s.strengthBg}><View style={[s.strengthFill,{width:strength.width,backgroundColor:strength.color}]}/></View>
            <Text style={[s.strengthLabel,{color:strength.color}]}>{strength.label}</Text>
          </View>
        )}

        <TouchableOpacity style={s.termsRow} onPress={()=>setAgreed(a=>!a)} activeOpacity={0.7}>
          <View style={[s.checkbox,agreed&&s.checkboxChecked]}>
            {agreed&&<CheckIcon size={12} color='#fff'/>}
          </View>
          <Text style={s.termsText}>I agree to the <Text style={s.termsCta}>Terms of Service</Text> and <Text style={s.termsCta}>Privacy Policy</Text></Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.btn,(loading||!agreed)&&s.btnOff]} onPress={handleSignUp} disabled={loading||!agreed} activeOpacity={0.85}>
          {loading?<ActivityIndicator color="#fff"/>:<Text style={s.btnText}>Create Account</Text>}
        </TouchableOpacity>

        <View style={s.divider}><View style={s.divLine}/><Text style={s.divText}>or</Text><View style={s.divLine}/></View>

        <TouchableOpacity style={s.guest} onPress={()=>router.replace('/(tabs)')} activeOpacity={0.8}>
          <Text style={s.guestText}>Continue as Guest</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.link} onPress={()=>router.push('/auth/login')}>
          <Text style={s.linkText}>Already have an account? <Text style={s.linkCta}>Sign In</Text></Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:{ flex:1, backgroundColor:colors.bg },
  kav:{ flex:1, paddingHorizontal:24, justifyContent:'center' },
  logoWrap:{ alignItems:'center', marginBottom:24 },
  logoAr:{ fontFamily:fonts.heading, fontSize:48, color:colors.gold, lineHeight:56 },
  logoEn:{ fontFamily:fonts.heading, fontSize:18, color:colors.ink, letterSpacing:4 },
  heading:{ fontFamily:fonts.heading, fontSize:30, color:colors.ink, marginBottom:4 },
  headingSub:{ fontFamily:fonts.body, fontSize:13, color:colors.muted, marginBottom:20 },
  errorBox:{ backgroundColor:'rgba(229,115,115,0.1)', borderRadius:12, padding:14, marginBottom:16, borderWidth:1, borderColor:'rgba(229,115,115,0.3)' },
  errorText:{ fontFamily:fonts.body, fontSize:13, color:colors.error, lineHeight:20 },
  input:{ backgroundColor:colors.card, borderRadius:14, borderWidth:1, borderColor:colors.border, color:colors.ink, fontFamily:fonts.body, fontSize:15, padding:16, marginBottom:12 },
  strengthWrap:{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:12, marginTop:-4 },
  strengthBg:{ flex:1, height:4, backgroundColor:'rgba(255,255,255,0.07)', borderRadius:2, overflow:'hidden' },
  strengthFill:{ height:'100%', borderRadius:2 },
  strengthLabel:{ fontFamily:fonts.bold, fontSize:11, width:55 },
  termsRow:{ flexDirection:'row', alignItems:'flex-start', gap:10, marginBottom:20 },
  checkbox:{ width:20, height:20, borderRadius:6, borderWidth:1.5, borderColor:colors.border, alignItems:'center', justifyContent:'center', marginTop:1, flexShrink:0 },
  checkboxChecked:{ backgroundColor:colors.mid, borderColor:colors.mid },
  checkboxMark:{ fontSize:11, color:'#fff' },
  termsText:{ fontFamily:fonts.body, fontSize:13, color:colors.muted, flex:1, lineHeight:20 },
  termsCta:{ color:colors.gold, fontFamily:fonts.medium },
  btn:{ backgroundColor:colors.green, borderRadius:14, padding:16, alignItems:'center', marginBottom:20 },
  btnOff:{ opacity:0.5 },
  btnText:{ fontFamily:fonts.bold, fontSize:16, color:'#fff' },
  divider:{ flexDirection:'row', alignItems:'center', gap:12, marginBottom:16 },
  divLine:{ flex:1, height:1, backgroundColor:colors.border },
  divText:{ fontFamily:fonts.body, fontSize:13, color:colors.muted },
  guest:{ padding:16, borderRadius:14, borderWidth:1, borderColor:colors.border, alignItems:'center', marginBottom:20 },
  guestText:{ fontFamily:fonts.medium, fontSize:14, color:colors.muted },
  link:{ alignItems:'center' },
  linkText:{ fontFamily:fonts.body, fontSize:14, color:colors.muted },
  linkCta:{ color:colors.gold, fontFamily:fonts.bold },
});
