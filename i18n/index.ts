import { getLanguage } from '../lib/storage';

const en: Record<string,string> = {
  home:'Home', quran:'Quran', madarasa:'Madarasa', dhikr:'Dhikr', settings:'Settings',
  greeting_morning:'Good morning', greeting_evening:'Good evening',
  your_journey:'Your Journey', streak:'Day Streak', juz_done:'Juz Done', lessons:'Lessons',
  daily_reminder:'Daily Reminder', continue:'Continue',
  quran_tracker:'Quran Tracker', juz_progress:'30 Juz Progress',
  juz_complete:'Complete', juz_reading:'In Progress', juz_unread:'Not Started',
  mark_complete:'Mark Complete', mark_reading:'Mark In Progress', mark_unread:'Mark Unread',
  your_lessons:'Your Lessons', all:'All', completed:'Completed',
  lesson_complete:'Lesson Complete', mark_done:'Mark as Done',
  daily_dhikr:'Daily Dhikr', tap_to_count:'Tap to count', of:'of',
  session_complete:'Session Complete', reset:'Reset',
  language:'Language', english:'English', arabic:'Arabic', somali:'Somali',
  account:'Account', sign_out:'Sign Out', guest_mode:'Guest Mode',
  create_account:'Create Account', about:'About Noor', version:'Version',
  sign_in:'Sign In', sign_up:'Sign Up', email:'Email', password:'Password', name:'Your Name',
  continue_guest:'Continue as Guest', no_account:"Don't have an account?", have_account:'Already have an account?',
  ob_title_1:'What is your Quran level?', ob_opt_beginner:'Beginner',
  ob_opt_intermediate:'Intermediate', ob_opt_advanced:'Advanced',
  ob_title_2:'What is your main goal?', ob_opt_memorize:'Memorize the Quran',
  ob_opt_revise:'Revise what I know', ob_opt_learn:'Learn with tajweed',
  ob_opt_understand:'Understand the meaning',
  ob_title_3:'How much time daily?', ob_opt_5:'5 minutes', ob_opt_15:'15 minutes',
  ob_opt_30:'30 minutes', ob_opt_60:'1 hour',
  ob_finish:'Get Started', ob_skip:'Skip',
  save:'Save', cancel:'Cancel', done:'Done', next:'Next', back:'Back',
};

let currentLang = 'en';

export function initI18n() {
  getLanguage().then(lang => { currentLang = lang; }).catch(() => {});
}
export function t(key: string): string {
  return en[key] ?? key;
}
export function setLang(lang: string) { currentLang = lang; }
export function isRTL(): boolean { return currentLang === 'ar'; }
