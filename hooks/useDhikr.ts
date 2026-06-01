import { useEffect, useState, useCallback } from 'react';
import { getTodayDhikr, saveDhikr, DhikrSession } from '../lib/storage';

const TARGETS = { subhanallah:33, alhamdulillah:33, allahuakbar:34 };

export function useDhikr() {
  const today = new Date().toISOString().split('T')[0];
  const [session, setSession] = useState<DhikrSession>({
    date: today, subhanallah: 0, alhamdulillah: 0, allahuakbar: 0,
  });

  useEffect(() => { getTodayDhikr().then(setSession).catch(() => {}); }, []);

  const increment = useCallback(async (type: keyof typeof TARGETS) => {
    if (session[type] >= TARGETS[type]) return;
    const updated = { ...session, [type]: session[type] + 1 };
    setSession(updated);
    await saveDhikr(updated);
  }, [session]);

  const reset = useCallback(async () => {
    const fresh: DhikrSession = {
      date: new Date().toISOString().split('T')[0],
      subhanallah: 0, alhamdulillah: 0, allahuakbar: 0,
    };
    setSession(fresh);
    await saveDhikr(fresh);
  }, []);

  function activeDhikr(): keyof typeof TARGETS {
    if (session.subhanallah   < 33) return 'subhanallah';
    if (session.alhamdulillah < 33) return 'alhamdulillah';
    return 'allahuakbar';
  }

  const active    = activeDhikr();
  const current   = session[active];
  const target    = TARGETS[active];
  const completed = session.subhanallah>=33 && session.alhamdulillah>=33 && session.allahuakbar>=34;

  return { session, increment, reset, active, current, target, completed };
}
