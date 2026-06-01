import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

export interface Reciter {
  id: string;
  cdnId: number;
  name: string;
  nameAr: string;
  url: (n: number) => string;
}

export const RECITERS: Reciter[] = [
  { id:'husary',   cdnId:9,  name:'Khalil Al Husary',            nameAr:'خليل الحصري',               url:(n)=>`https://server13.mp3quran.net/husr/${String(n).padStart(3,'0')}.mp3` },
  { id:'minshawi', cdnId:10, name:'Muhammad Siddiq Al Minshawi', nameAr:'محمد صديق المنشاوي', url:(n)=>`https://server10.mp3quran.net/minsh/${String(n).padStart(3,'0')}.mp3` },
  { id:'basit',    cdnId:3,  name:'Abdul Basit Abdus Samad',     nameAr:'عبد الباسط عبد الصمد', url:(n)=>`https://server7.mp3quran.net/basit/${String(n).padStart(3,'0')}.mp3` },
  { id:'ghamdi',   cdnId:14, name:'Saad Al Ghamdi',              nameAr:'سعد الغامدي',            url:(n)=>`https://server7.mp3quran.net/s_gmd/${String(n).padStart(3,'0')}.mp3` },
];

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
}

export function useQuranAudio() {
  const soundRef        = useRef<Audio.Sound|null>(null);
  const highlightTimer  = useRef<any>(null);
  const timingsRef      = useRef<number[]>([]);
  const savedPosRef     = useRef(0);
  const currentAyahRef  = useRef(0);

  const [isPlaying, setIsPlaying]           = useState(false);
  const [isLoading, setIsLoading]           = useState(false);
  const [currentSurah, setCurrentSurah]     = useState<number|null>(null);
  const [currentReciter, setCurrentReciter] = useState<Reciter>(RECITERS[0]);
  const [position, setPosition]             = useState(0);
  const [duration, setDuration]             = useState(0);
  const [currentAyah, setCurrentAyah]       = useState(0);
  const [speed, setSpeed]                   = useState(1.0);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS:      false,
      staysActiveInBackground: true,
      playsInSilentModeIOS:    true,
      shouldDuckAndroid:       true,
    });
    return () => { cleanup(); };
  }, []);

  async function cleanup() {
    if (highlightTimer.current) { clearTimeout(highlightTimer.current); highlightTimer.current = null; }
    if (soundRef.current) {
      await soundRef.current.unloadAsync().catch(()=>{});
      soundRef.current = null;
    }
  }

  async function fetchTimings(surahNum: number) {
    timingsRef.current = [];
    const reciterObj = RECITERS.find(function(r) { return r.id === currentReciter.id; });
    const cdnId = (reciterObj && reciterObj.cdnId) ? reciterObj.cdnId : 9;
    const urls = [
      'https://api.qurancdn.com/api/qdc/audio/reciters/' + cdnId + '/audio_files?chapter_number=' + surahNum + '&segments=true',
      'https://api.qurancdn.com/api/qdc/audio/reciters/9/audio_files?chapter_number=' + surahNum + '&segments=true',
      'https://api.qurancdn.com/api/qdc/audio/reciters/10/audio_files?chapter_number=' + surahNum + '&segments=true',
    ];
    for (let i = 0; i < urls.length; i++) {
      try {
        const res  = await fetch(urls[i]);
        const data = await res.json();
        const af   = data && (data.audio_files ? data.audio_files[0] : data.audio_file);
        const vt   = (af && af.verse_timings) ? af.verse_timings : [];
        if (vt.length > 0) {
          timingsRef.current = vt.map(function(s: any) { return s.timestamp_from; });
          return;
        }
      } catch(e) {}
    }
  }

  function ayahAtPosition(posMs: number): number {
    const t = timingsRef.current;
    if (!t.length) return 0;
    let cur = 0;
    for (let i = 0; i < t.length; i++) {
      // Highlight ayah when we are within 100ms before its start timestamp
      if (posMs + 100 >= t[i]) cur = i + 1;
    }
    return cur;
  }

  async function playSurah(surahNum: number, reciter?: Reciter, seekToMs?: number, startAyah?: number) {
    const r = reciter ?? currentReciter;
    if (reciter) setCurrentReciter(r);
    setIsLoading(true);
    await cleanup();
    setCurrentSurah(surahNum);
    setCurrentAyah(0);
    currentAyahRef.current = 0;
    await fetchTimings(surahNum);
    let startMs = seekToMs ?? 0;
    if (startAyah && timingsRef.current.length > 0) {
      const tidx = startAyah - 1;
      if (tidx >= 0 && tidx < timingsRef.current.length) {
        startMs = timingsRef.current[tidx] || 0;
      } else {
      }
    } else {
    }
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: r.url(surahNum) },
        { shouldPlay:true, rate:speed, shouldCorrectPitch:true, positionMillis:startMs }
      );
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((st:any) => {
        if (!st.isLoaded) return;
        const pos = st.positionMillis ?? 0;
        savedPosRef.current = pos;
        setIsPlaying(st.isPlaying);
        setPosition(pos);
        setDuration(st.durationMillis ?? 0);
        // Exact ayah highlight with timer
        const t = timingsRef.current;
        if (t.length > 0 && st.isPlaying) {
          let cur = 0;
          for (let i = 0; i < t.length; i++) {
            if (pos >= t[i]) cur = i + 1;
          }
          // Update current ayah if changed
          if (cur !== currentAyahRef.current) {
            currentAyahRef.current = cur;
            setCurrentAyah(cur);
          }
          // Clear any pending highlight timer
          if (highlightTimer.current) {
            clearTimeout(highlightTimer.current);
            highlightTimer.current = null;
          }
          // Schedule next ayah transition exactly
          if (cur < t.length) {
            const nextMs = t[cur] - pos;
            if (nextMs > 50 && nextMs < 15000) {
              const expectedAyah = cur + 1;
              highlightTimer.current = setTimeout(function() {
                if (currentAyahRef.current === cur) {
                  currentAyahRef.current = expectedAyah;
                  setCurrentAyah(expectedAyah);
                }
                highlightTimer.current = null;
              }, nextMs);
            }
          }
        }
        if (st.didJustFinish) {
          setIsPlaying(false);
          setCurrentAyah(0);
          currentAyahRef.current = 0;
          savedPosRef.current = 0;
        }
      });
      if (startMs > 0) setPosition(startMs);
      setIsPlaying(true);
    } catch(e) { }
    setIsLoading(false);
  }

  async function switchReciter(reciter: Reciter) {
    if (!currentSurah) { setCurrentReciter(reciter); return; }
    let pos = savedPosRef.current;
    if (soundRef.current) {
      try {
        const st = await soundRef.current.getStatusAsync() as any;
        if (st.isLoaded) pos = st.positionMillis ?? pos;
      } catch {}
    }
    await playSurah(currentSurah, reciter, pos);
  }

  async function togglePlay() {
    if (!soundRef.current) return;
    const st = await soundRef.current.getStatusAsync() as any;
    if (st.isPlaying) await soundRef.current.pauseAsync();
    else await soundRef.current.playAsync();
  }

  async function seekTo(ms: number) {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(ms);
    savedPosRef.current = ms;
  }

  async function changeSpeed(s: number) {
    setSpeed(s);
    if (soundRef.current) await soundRef.current.setRateAsync(s, true);
  }

  async function stop() {
    await cleanup();
    setIsPlaying(false); setCurrentSurah(null);
    setCurrentAyah(0); setPosition(0); setDuration(0);
    savedPosRef.current = 0; currentAyahRef.current = 0; timingsRef.current = [];
  }

  return {
    isPlaying, isLoading, currentSurah, currentReciter,
    position, duration, progressPct: duration>0?(position/duration)*100:0,
    currentAyah, speed, formatTime,
    playSurah, switchReciter, togglePlay, seekTo, changeSpeed, stop,
    setCurrentReciter,
  };
}
