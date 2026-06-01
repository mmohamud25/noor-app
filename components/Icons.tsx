import Svg, { Path, Circle, Rect, Line, Polyline, Polygon } from 'react-native-svg';

interface IconProps { size?: number; color?: string; }

export function SearchIcon({ size=20, color='currentColor' }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={11} cy={11} r={8} stroke={color} strokeWidth={1.8}/>
    <Line x1={21} y1={21} x2={16.65} y2={16.65} stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
  </Svg>;
}

export function PrayerIcon({ size=20, color='currentColor' }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C9 2 7 4 7 7v3H5v12h14V10h-2V7c0-3-2-5-5-5z" stroke={color} strokeWidth={1.6} strokeLinejoin="round"/>
    <Path d="M9 10V7a3 3 0 016 0v3" stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Circle cx={12} cy={16} r={2} stroke={color} strokeWidth={1.5}/>
  </Svg>;
}

export function DuaIcon({ size=20, color='currentColor' }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" stroke={color} strokeWidth={1.6}/>
    <Path d="M8 14s1.5 2 4 2 4-2 4-2" stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Line x1={9} y1={9} x2={9.01} y2={9} stroke={color} strokeWidth={2} strokeLinecap="round"/>
    <Line x1={15} y1={9} x2={15.01} y2={9} stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>;
}

export function SummaryIcon({ size=20, color='currentColor' }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={3} width={18} height={18} rx={2} stroke={color} strokeWidth={1.6}/>
    <Line x1={3} y1={9} x2={21} y2={9} stroke={color} strokeWidth={1.4}/>
    <Line x1={9} y1={21} x2={9} y2={9} stroke={color} strokeWidth={1.4}/>
    <Line x1={7} y1={15} x2={7} y2={17} stroke={color} strokeWidth={1.4} strokeLinecap="round"/>
    <Line x1={12} y1={13} x2={12} y2={17} stroke={color} strokeWidth={1.4} strokeLinecap="round"/>
    <Line x1={17} y1={11} x2={17} y2={17} stroke={color} strokeWidth={1.4} strokeLinecap="round"/>
  </Svg>;
}

export function SettingsIcon({ size=20, color='currentColor' }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.6}/>
    <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth={1.6}/>
  </Svg>;
}

export function LocationIcon({ size=16, color='currentColor' }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={color} strokeWidth={1.6}/>
    <Circle cx={12} cy={10} r={3} stroke={color} strokeWidth={1.6}/>
  </Svg>;
}

export function MoonIcon({ size=18, color='currentColor' }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>;
}

export function SunIcon({ size=18, color='currentColor' }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={5} stroke={color} strokeWidth={1.6}/>
    <Line x1={12} y1={1} x2={12} y2={3} stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Line x1={12} y1={21} x2={12} y2={23} stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Line x1={4.22} y1={4.22} x2={5.64} y2={5.64} stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Line x1={18.36} y1={18.36} x2={19.78} y2={19.78} stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Line x1={1} y1={12} x2={3} y2={12} stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Line x1={21} y1={12} x2={23} y2={12} stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Line x1={4.22} y1={19.78} x2={5.64} y2={18.36} stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Line x1={18.36} y1={5.64} x2={19.78} y2={4.22} stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
  </Svg>;
}

export function SunriseIcon({ size=18, color='currentColor' }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M17 18a5 5 0 00-10 0" stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Line x1={12} y1={2} x2={12} y2={9} stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Line x1={4.22} y1={10.22} x2={5.64} y2={11.64} stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Line x1={1} y1={18} x2={3} y2={18} stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Line x1={21} y1={18} x2={23} y2={18} stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Line x1={18.36} y1={11.64} x2={19.78} y2={10.22} stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Line x1={3} y1={18} x2={21} y2={18} stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Polyline points="8 6 12 2 16 6" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>;
}

export function CloudIcon({ size=18, color='currentColor' }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" stroke={color} strokeWidth={1.6} strokeLinejoin="round"/>
  </Svg>;
}

export function SunsetIcon({ size=18, color='currentColor' }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M17 18a5 5 0 00-10 0" stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Line x1={12} y1={9} x2={12} y2={2} stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Line x1={4.22} y1={10.22} x2={5.64} y2={11.64} stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Line x1={1} y1={18} x2={3} y2={18} stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Line x1={21} y1={18} x2={23} y2={18} stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Line x1={18.36} y1={11.64} x2={19.78} y2={10.22} stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Line x1={3} y1={18} x2={21} y2={18} stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Polyline points="16 5 12 9 8 5" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>;
}

export function StarIcon({ size=18, color='currentColor' }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke={color} strokeWidth={1.6} strokeLinejoin="round"/>
  </Svg>;
}

export function StreakIcon({ size=18, color='currentColor' }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>;
}

export function CheckIcon({ size=14, color='#fff' }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="20 6 9 17 4 12" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>;
}

export function ChevronUpIcon({ size=14, color='currentColor' }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="18 15 12 9 6 15" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>;
}

export function ChevronDownIcon({ size=14, color='currentColor' }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="6 9 12 15 18 9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>;
}

export function UserIcon({ size=20, color='currentColor' }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Circle cx={12} cy={7} r={4} stroke={color} strokeWidth={1.6}/>
  </Svg>;
}

export function BookOpenIcon({ size=20, color='currentColor' }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" stroke={color} strokeWidth={1.6} strokeLinejoin="round"/>
    <Path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" stroke={color} strokeWidth={1.6} strokeLinejoin="round"/>
  </Svg>;
}

export function WarningIcon({ size=16, color='#F59E0B' }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={color} strokeWidth={1.6} strokeLinejoin="round"/>
    <Line x1={12} y1={9} x2={12} y2={13} stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Line x1={12} y1={17} x2={12.01} y2={17} stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>;
}
