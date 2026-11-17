import React, { useState } from 'react';
import { Music2, Pause, Play, Trash2, Upload, Volume2 } from 'lucide-react';
import { UI_TEXT } from '../data/i18n';
import { AppTheme, CustomAudioTrack, Language } from '../types';
import { AMBIENT_TRACKS, AmbientTrackId } from '../utils/audioEngine';
import { getThemeTokens } from '../utils/themeStyles';

interface MusicStudioModuleProps {
  lang: Language;
  theme: AppTheme;
  isMusicPlaying: boolean;
  activeTrackId: AmbientTrackId;
  musicVolume: number;
  customTracks: CustomAudioTrack[];
  onToggleMusic: () => void;
  onSelectTrack: (id: AmbientTrackId) => void;
  onChangeVolume: (vol: number) => void;
  onUploadAudioFile: (file: File) => Promise<void>;
  onDeleteCustomTrack: (id: string) => void;
}

export const MusicStudioModule: React.FC<MusicStudioModuleProps> = ({
  lang,
  theme,
  isMusicPlaying,
  activeTrackId,
  musicVolume,
  customTracks,
  onToggleMusic,
  onSelectTrack,
  onChangeVolume,
  onUploadAudioFile,
  onDeleteCustomTrack,
}) => {
  const t = UI_TEXT[lang];
  const tk = getThemeTokens(theme);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onUploadAudioFile(file);
    setUploadStatus(
      lang === 'bn'
        ? `"${file.name}" সেভ হয়েছে এবং চলছে!`
        : `"${file.name}" saved to Archive Audio & playing continuously.`
    );
    window.setTimeout(() => setUploadStatus(null), 5000);
    e.target.value = '';
  };

  const activeTrackTitle = activeTrackId.startsWith('custom:')
    ? customTracks.find((c) => `custom:${c.id}` === activeTrackId)?.title || 'Custom Audio'
    : AMBIENT_TRACKS.find((tr) => tr.id === activeTrackId)?.title || AMBIENT_TRACKS[0].title;

  return (
    <div className="space-y-8">
      <section
        className={`flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between ${tk.borderSubtle}`}
      >
        <div>
          <p className={`text-xs font-medium ${tk.accentText}`}>
            {t.brand} · {t.subtitle}
          </p>
          <h1 className={`mt-1.5 text-3xl font-medium tracking-tight ${tk.headingText}`}>
            {t.ambientTitle}
          </h1>
          <p className={`mt-1.5 text-sm ${tk.mutedText}`}>{t.ambientDesc}</p>
        </div>

        <button
          type="button"
          onClick={onToggleMusic}
          className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors ${tk.primaryBtn}`}
        >
          {isMusicPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span>
            {isMusicPlaying
              ? lang === 'bn'
                ? 'মিউজিক থামান'
                : 'Pause BGM'
              : lang === 'bn'
              ? 'মিউজিক চালান'
              : 'Play BGM'}
          </span>
        </button>
      </section>

      {uploadStatus && (
        <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/15 px-4 py-3 text-xs font-medium text-emerald-500">
          {uploadStatus}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Built-In Ambient Channels */}
        <section className={`space-y-4 rounded-2xl border p-6 lg:col-span-6 ${tk.cardSurface}`}>
          <div className="flex items-center gap-2">
            <Music2 className={`h-4 w-4 ${tk.accentText}`} />
            <h2 className={`text-base font-semibold ${tk.headingText}`}>
              {lang === 'bn' ? 'বিল্ট-ইন অ্যাম্বিয়েন্ট সাউন্ড' : 'Built-In Focus Soundscapes'}
            </h2>
          </div>

          <div className={`divide-y rounded-xl border ${tk.divideSubtle} ${tk.subCardSurface}`}>
            {AMBIENT_TRACKS.map((track) => {
              const isSelected = activeTrackId === track.id;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => onSelectTrack(track.id)}
                  className={`flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors ${
                    isSelected ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <p
                      className={`text-sm font-medium ${
                        isSelected ? tk.accentText : tk.headingText
                      }`}
                    >
                      {track.title}
                    </p>
                    <p className={`truncate text-xs ${tk.mutedText}`}>{track.subtitle}</p>
                  </div>
                  <span className={`font-mono-tabular shrink-0 text-[11px] ${tk.mutedText}`}>
                    {isSelected && isMusicPlaying
                      ? lang === 'bn'
                        ? 'চলছে'
                        : 'Playing'
                      : track.durationLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Custom Device Audio Upload + Controls */}
        <section className={`space-y-5 rounded-2xl border p-6 lg:col-span-6 ${tk.cardSurface}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className={`text-base font-semibold ${tk.headingText}`}>
                {lang === 'bn'
                  ? 'ডিভাইস থেকে নিজের অডিও/মিউজিক যুক্ত করুন'
                  : 'Custom Device BGM Library'}
              </h2>
              <p className={`mt-0.5 text-xs ${tk.mutedText}`}>
                {lang === 'bn'
                  ? 'MP3, WAV, OGG ফাইল ব্রাউজারে সেভ থাকে—অ্যাপের সব পেজে নিরবচ্ছিন্ন বাজবে।'
                  : 'Upload MP3/WAV/OGG tracks from your device; loops seamlessly across all tabs.'}
              </p>
            </div>

            <label
              className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold ${tk.primaryBtn}`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{lang === 'bn' ? 'অডিও আপলোড' : 'Upload Audio'}</span>
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.m4a"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {customTracks.length === 0 ? (
            <div className={`rounded-xl border border-dashed p-8 text-center ${tk.borderSubtle}`}>
              <Music2 className={`mx-auto h-7 w-7 ${tk.mutedText}`} />
              <p className={`mt-2 text-xs font-medium ${tk.headingText}`}>
                {lang === 'bn'
                  ? 'এখনো কোনো কাস্টম অডিও আপলোড করা হয়নি'
                  : 'No custom audio tracks uploaded yet'}
              </p>
            </div>
          ) : (
            <div className={`divide-y rounded-xl border ${tk.divideSubtle} ${tk.subCardSurface}`}>
              {customTracks.map((tr) => {
                const trackKey: AmbientTrackId = `custom:${tr.id}`;
                const isSelected = activeTrackId === trackKey;
                const sizeMb = (tr.sizeBytes / (1024 * 1024)).toFixed(1);
                return (
                  <div
                    key={tr.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectTrack(trackKey)}
                      className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                    >
                      {isSelected && isMusicPlaying ? (
                        <Pause className={`h-4 w-4 shrink-0 ${tk.accentText}`} />
                      ) : (
                        <Play className={`h-4 w-4 shrink-0 ${tk.mutedText}`} />
                      )}
                      <div className="min-w-0">
                        <p
                          className={`truncate text-sm font-medium ${
                            isSelected ? tk.accentText : tk.headingText
                          }`}
                        >
                          {tr.title}
                        </p>
                        <p className={`font-mono-tabular text-[11px] ${tk.mutedText}`}>
                          {tr.fileName} · {sizeMb} MB
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCustomTrack(tr.id)}
                      aria-label={`Delete ${tr.title}`}
                      className={`rounded-md p-1.5 hover:text-rose-500 ${tk.mutedText}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Master Volume */}
          <div className={`space-y-2 border-t pt-4 ${tk.borderSubtle}`}>
            <div className="flex items-center gap-3">
              <Volume2 className={`h-4 w-4 shrink-0 ${tk.mutedText}`} />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                aria-label="Ambient volume"
                value={musicVolume}
                onChange={(e) => onChangeVolume(Number(e.target.value))}
                className="w-full accent-current"
              />
              <span className={`font-mono-tabular w-12 text-right text-xs ${tk.mutedText}`}>
                {Math.round(musicVolume * 100)}%
              </span>
            </div>
            <p className={`text-xs ${tk.mutedText}`}>
              {lang === 'bn' ? 'বর্তমান চ্যানেল:' : 'Active channel:'}{' '}
              <span className={`font-semibold ${tk.headingText}`}>{activeTrackTitle}</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
