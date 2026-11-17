import { AppTheme } from '../types';

export interface ThemeTokens {
  isDark: boolean;
  isPaper: boolean;
  isMono: boolean;
  rootBg: string;
  headerBg: string;
  cardSurface: string;
  subCardSurface: string;
  inputSurface: string;
  headingText: string;
  bodyText: string;
  mutedText: string;
  accentText: string;
  accentBg: string;
  primaryBtn: string;
  activeTabBtn: string;
  borderSubtle: string;
  divideSubtle: string;
  shelfLedge: string;
  ringAccent: string;
}

export function getThemeTokens(theme: AppTheme): ThemeTokens {
  switch (theme) {
    case 'mono-light':
      return {
        isDark: false,
        isPaper: false,
        isMono: true,
        rootBg: 'mono-light-bg text-[#111111]',
        headerBg: 'border-black/10 bg-[#FAFAFA]/90',
        cardSurface: 'border-black/12 bg-white text-[#111111] shadow-sm',
        subCardSurface: 'border-black/10 bg-[#F4F4F5] text-[#111111]',
        inputSurface:
          'border-black/15 bg-white text-[#111111] placeholder:text-[#71717A]',
        headingText: 'text-[#09090B]',
        bodyText: 'text-[#18181B]',
        mutedText: 'text-[#52525B]',
        accentText: 'text-[#111111]',
        accentBg: 'bg-[#111111]',
        primaryBtn: 'bg-[#111111] text-white hover:bg-[#27272A]',
        activeTabBtn: 'bg-[#111111] text-white border-[#111111]',
        borderSubtle: 'border-black/10',
        divideSubtle: 'divide-black/10',
        shelfLedge: 'shelf-ledge-light',
        ringAccent: '#111111',
      };

    case 'mono-dark':
      return {
        isDark: true,
        isPaper: false,
        isMono: true,
        rootBg: 'bg-[#0B0B0D] text-[#FAFAFA]',
        headerBg: 'border-white/10 bg-[#0B0B0D]/90',
        cardSurface: 'border-white/12 bg-[#141417] text-[#FAFAFA]',
        subCardSurface: 'border-white/10 bg-[#0F0F12] text-[#FAFAFA]',
        inputSurface:
          'border-white/15 bg-[#0B0B0D] text-[#FAFAFA] placeholder:text-[#71717A]',
        headingText: 'text-[#FFFFFF]',
        bodyText: 'text-[#E4E4E7]',
        mutedText: 'text-[#A1A1AA]',
        accentText: 'text-[#FFFFFF]',
        accentBg: 'bg-[#FFFFFF]',
        primaryBtn: 'bg-[#FAFAFA] text-[#09090B] hover:bg-[#E4E4E7]',
        activeTabBtn: 'bg-[#FAFAFA] text-[#09090B] border-[#FAFAFA]',
        borderSubtle: 'border-white/10',
        divideSubtle: 'divide-white/10',
        shelfLedge: 'shelf-ledge',
        ringAccent: '#FAFAFA',
      };

    case 'paper':
      return {
        isDark: false,
        isPaper: true,
        isMono: false,
        rootBg: 'paper-archive-bg text-[#211E19]',
        headerBg: 'border-[#C6BEB0] bg-[#DCD6CA]/92',
        cardSurface: 'border-[#D5CFC2] bg-[#FAF8F4] text-[#211E19] shadow-sm',
        subCardSurface: 'border-[#C6BEB0] bg-[#EFECE5] text-[#211E19]',
        inputSurface:
          'border-[#C6BEB0] bg-white text-[#211E19] placeholder:text-[#888072]',
        headingText: 'text-[#1F1C18]',
        bodyText: 'text-[#2C2822]',
        mutedText: 'text-[#665E52]',
        accentText: 'text-[#8D5B16]',
        accentBg: 'bg-[#1D355E]',
        primaryBtn: 'bg-[#1D355E] text-white hover:bg-[#152849]',
        activeTabBtn: 'bg-[#1D355E] text-white border-[#1D355E]',
        borderSubtle: 'border-[#C6BEB0]',
        divideSubtle: 'divide-[#C6BEB0]',
        shelfLedge: 'shelf-ledge-light',
        ringAccent: '#1D355E',
      };

    case 'slate':
      return {
        isDark: true,
        isPaper: false,
        isMono: false,
        rootBg: 'bg-[#0F172A] text-[#F1F5F9]',
        headerBg: 'border-slate-700/60 bg-[#0F172A]/90',
        cardSurface: 'border-slate-700/60 bg-[#1E293B] text-[#F1F5F9]',
        subCardSurface: 'border-slate-700/50 bg-[#162032] text-[#F1F5F9]',
        inputSurface:
          'border-slate-700 bg-[#0F172A] text-[#F1F5F9] placeholder:text-slate-400',
        headingText: 'text-[#F8FAFC]',
        bodyText: 'text-[#E2E8F0]',
        mutedText: 'text-[#94A3B8]',
        accentText: 'text-[#38BDF8]',
        accentBg: 'bg-[#38BDF8]',
        primaryBtn: 'bg-[#38BDF8] text-[#0F172A] hover:bg-[#7DD3FC]',
        activeTabBtn: 'bg-[#38BDF8] text-[#0F172A] border-[#38BDF8]',
        borderSubtle: 'border-slate-700/60',
        divideSubtle: 'divide-slate-700/60',
        shelfLedge: 'shelf-ledge',
        ringAccent: '#38BDF8',
      };

    case 'sepia':
      return {
        isDark: false,
        isPaper: false,
        isMono: false,
        rootBg: 'bg-[#F4ECD8] text-[#3B2F23]',
        headerBg: 'border-[#D9CCB2] bg-[#EDE2C8]/92',
        cardSurface: 'border-[#D9CCB2] bg-[#FBF6EA] text-[#3B2F23] shadow-sm',
        subCardSurface: 'border-[#D9CCB2] bg-[#F1E6CE] text-[#3B2F23]',
        inputSurface:
          'border-[#CBBBA0] bg-[#FFFDF8] text-[#3B2F23] placeholder:text-[#8E7D68]',
        headingText: 'text-[#2B2118]',
        bodyText: 'text-[#3B2F23]',
        mutedText: 'text-[#73624F]',
        accentText: 'text-[#8C4A1F]',
        accentBg: 'bg-[#8C4A1F]',
        primaryBtn: 'bg-[#5A3820] text-[#FFFDF8] hover:bg-[#462B18]',
        activeTabBtn: 'bg-[#5A3820] text-[#FFFDF8] border-[#5A3820]',
        borderSubtle: 'border-[#D9CCB2]',
        divideSubtle: 'divide-[#D9CCB2]',
        shelfLedge: 'shelf-ledge-light',
        ringAccent: '#8C4A1F',
      };

    case 'midnight':
    default:
      return {
        isDark: true,
        isPaper: false,
        isMono: false,
        rootBg: 'bg-[#111215] text-[#F4F2ED]',
        headerBg: 'border-white/8 bg-[#111215]/90',
        cardSurface: 'border-white/8 bg-[#16181D] text-[#F4F2ED]',
        subCardSurface: 'border-white/8 bg-[#121419] text-[#F4F2ED]',
        inputSurface:
          'border-white/10 bg-[#111215] text-[#F4F2ED] placeholder:text-[#5F6573]',
        headingText: 'text-[#F4F2ED]',
        bodyText: 'text-[#E5E7EB]',
        mutedText: 'text-[#9CA3AF]',
        accentText: 'text-[#D4A359]',
        accentBg: 'bg-[#D4A359]',
        primaryBtn: 'bg-[#D4A359] text-[#111215] hover:bg-[#DFB26D]',
        activeTabBtn: 'bg-[#D4A359] text-[#111215] border-[#D4A359]',
        borderSubtle: 'border-white/8',
        divideSubtle: 'divide-white/8',
        shelfLedge: 'shelf-ledge',
        ringAccent: '#D4A359',
      };
  }
}
