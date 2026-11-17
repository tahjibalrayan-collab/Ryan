import React, { useMemo } from 'react';
import { Check, Image as ImageIcon, Palette, Upload } from 'lucide-react';
import { UI_TEXT } from '../data/i18n';
import { WALLPAPER_PRESETS } from '../data/seedData';
import { AppTheme, Language, WallpaperPreset } from '../types';
import { getThemeTokens } from '../utils/themeStyles';

interface WallpaperStudioModuleProps {
  lang: Language;
  theme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  activeWallpaperId: string;
  onSelectWallpaper: (id: string) => void;
  customWallpaper: string | null;
  onUploadCustomWallpaper: (dataUrl: string) => void;
  backdropDimming: number;
  onChangeBackdropDimming: (val: number) => void;
}

const THEME_CARDS: Array<{
  id: AppTheme;
  name: string;
  nameBn: string;
  desc: string;
  swatchBg: string;
  swatchFg: string;
}> = [
  {
    id: 'mono-light',
    name: 'Monochrome Minimal Light',
    nameBn: 'মনোক্রোম মিনিমাল লাইট',
    desc: 'Crisp pure white canvas & jet-black ink typography',
    swatchBg: '#FAFAFA',
    swatchFg: '#111111',
  },
  {
    id: 'mono-dark',
    name: 'Monochrome Minimal Dark',
    nameBn: 'মনোক্রোম মিনিমাল ডার্ক',
    desc: 'Deep obsidian canvas & pure chalk-white contrast',
    swatchBg: '#0B0B0D',
    swatchFg: '#FAFAFA',
  },
  {
    id: 'paper',
    name: 'Paper Bookshelf',
    nameBn: 'পেপার বুকশেল্ফ',
    desc: 'Archival warm ivory & deep indigo ink accents',
    swatchBg: '#DCD6CA',
    swatchFg: '#1D355E',
  },
  {
    id: 'midnight',
    name: 'Midnight Study',
    nameBn: 'মিডনাইট স্টাডি',
    desc: 'Nocturnal desk slate paired with warm brass highlights',
    swatchBg: '#111215',
    swatchFg: '#D4A359',
  },
  {
    id: 'slate',
    name: 'Cool Slate Indigo',
    nameBn: 'কুল স্লেট নীল',
    desc: 'Deep navy desk with sharp ice-blue science telemetry',
    swatchBg: '#0F172A',
    swatchFg: '#38BDF8',
  },
  {
    id: 'sepia',
    name: 'Warm Antique Sepia',
    nameBn: 'অ্যান্টিক সেপিয়া',
    desc: 'Soft amber parchment tone tuned for long reading',
    swatchBg: '#F4ECD8',
    swatchFg: '#5A3820',
  },
];

export const WallpaperStudioModule: React.FC<WallpaperStudioModuleProps> = ({
  lang,
  theme,
  onSelectTheme,
  activeWallpaperId,
  onSelectWallpaper,
  customWallpaper,
  onUploadCustomWallpaper,
  backdropDimming,
  onChangeBackdropDimming,
}) => {
  const t = UI_TEXT[lang];
  const tk = getThemeTokens(theme);

  const allWallpapers: WallpaperPreset[] = useMemo(() => {
    const list = [...WALLPAPER_PRESETS];
    if (customWallpaper) {
      list.push({
        id: 'custom-upload',
        name: 'Custom Photo',
        nameBn: 'কাস্টম ফটো',
        type: 'image',
        value: customWallpaper,
        category: 'Uploaded',
      });
    }
    return list;
  }, [customWallpaper]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUploadCustomWallpaper(reader.result);
        onSelectWallpaper('custom-upload');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-10">
      <section className={`border-b pb-6 ${tk.borderSubtle}`}>
        <p className={`text-xs font-medium ${tk.accentText}`}>
          {t.brand} · {t.subtitle}
        </p>
        <h1 className={`mt-1.5 text-3xl font-medium tracking-tight ${tk.headingText}`}>
          {t.wallpaperTitle}
        </h1>
        <p className={`mt-1.5 text-sm ${tk.mutedText}`}>{t.wallpaperDesc}</p>
      </section>

      {/* Theme Selector (6 Themes including Monochrome Black & White) */}
      <section className={`space-y-4 rounded-2xl border p-6 ${tk.cardSurface}`}>
        <div className="flex items-center gap-2">
          <Palette className={`h-4 w-4 ${tk.accentText}`} />
          <h2 className={`text-base font-semibold ${tk.headingText}`}>
            {lang === 'bn' ? 'আর্কাইভ থিম (মনোক্রোম ও স্টুডিও)' : 'Archive Color & Surface Themes'}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {THEME_CARDS.map((card) => {
            const active = theme === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onSelectTheme(card.id)}
                className={`flex items-start justify-between gap-3 rounded-xl border p-4 text-left transition-all ${
                  active ? `${tk.activeTabBtn} shadow-md` : tk.subCardSurface
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-black/20 text-[10px] font-bold"
                      style={{ backgroundColor: card.swatchBg, color: card.swatchFg }}
                    >
                      Aa
                    </span>
                    <span className="truncate text-sm font-semibold">
                      {lang === 'bn' ? card.nameBn : card.name}
                    </span>
                  </div>
                  <p className="mt-2 text-xs opacity-80">{card.desc}</p>
                </div>
                {active && <Check className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Wallpaper Backdrop Presets + Custom Photo Upload */}
      <section className={`space-y-5 rounded-2xl border p-6 ${tk.cardSurface}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ImageIcon className={`h-4 w-4 ${tk.accentText}`} />
            <div>
              <h2 className={`text-base font-semibold ${tk.headingText}`}>
                {lang === 'bn' ? 'ব্যাকগ্রাউন্ড ওয়ালপেপার গ্যালারি' : 'Ambient Wallpaper Studio'}
              </h2>
              <p className={`text-xs ${tk.mutedText}`}>
                {lang === 'bn'
                  ? 'যেকোনো ওয়ালপেপার বেছে নিন বা ডিভাইস থেকে ছবি আপলোড করুন।'
                  : 'Select an ambient backdrop or upload your own photo (applies behind dark themes).'}
              </p>
            </div>
          </div>

          <label
            className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${tk.primaryBtn}`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>{t.uploadPhoto}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {allWallpapers.map((preset) => {
            const selected = activeWallpaperId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectWallpaper(preset.id)}
                className={`group overflow-hidden rounded-xl border text-left transition-all ${
                  selected ? 'ring-2 ring-current' : `${tk.borderSubtle} opacity-85 hover:opacity-100`
                }`}
              >
                <div
                  className="h-24 w-full transition-transform duration-300 group-hover:scale-105"
                  style={
                    preset.type === 'image'
                      ? {
                          backgroundImage: `url(${preset.value})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : { background: preset.value }
                  }
                />
                <div className={`px-3 py-2 ${tk.subCardSurface}`}>
                  <p className={`truncate text-xs font-medium ${tk.headingText}`}>
                    {lang === 'bn' ? preset.nameBn : preset.name}
                  </p>
                  <p className={`text-[10px] ${tk.mutedText}`}>{preset.category}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className={`space-y-2 border-t pt-4 ${tk.borderSubtle}`}>
          <div className="flex items-center justify-between text-xs">
            <span className={tk.mutedText}>
              {lang === 'bn' ? 'ওয়ালপেপার স্ক্রিম গাঢ়তা' : 'Wallpaper Dimming Overlay'}
            </span>
            <span className="font-mono-tabular">{Math.round(backdropDimming * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.25}
            max={0.95}
            step={0.05}
            aria-label="Backdrop darkness"
            value={backdropDimming}
            onChange={(e) => onChangeBackdropDimming(Number(e.target.value))}
            className="w-full accent-current"
          />
        </div>
      </section>
    </div>
  );
};
