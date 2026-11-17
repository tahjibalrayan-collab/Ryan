export type Language = 'en' | 'bn';

export type AppTheme =
  | 'mono-light'
  | 'mono-dark'
  | 'paper'
  | 'midnight'
  | 'slate'
  | 'sepia';

export type NavModule =
  | 'methods'
  | 'timer'
  | 'journal'
  | 'library'
  | 'lab'
  | 'grammar'
  | 'wallpaper'
  | 'music';

export type MethodTradition =
  | 'Korean Focus'
  | 'Japanese Kaizen'
  | 'Chinese Intensive'
  | 'Ivy League Recall'
  | 'European & Classical'
  | 'Global STEM & Synthesis';

export interface StudyTip {
  id: string;
  tradition: MethodTradition;
  origin: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  solvesStruggles: string[];
  idealMinutes: number;
}

export interface StudyMethod {
  id: string;
  title: string;
  titleBn: string;
  tradition: MethodTradition;
  origin: string;
  originBn: string;
  subtitle: string;
  subtitleBn: string;
  summary: string;
  summaryBn: string;
  defaultMinutes: number;
  steps: string[];
  stepsBn: string[];
  bestFor: string;
  bestForBn: string;
  coverColor: string;
  spineColor: string;
  textColor: string;
}

export interface SubjectAllocation {
  id: string;
  subject: string;
  minutes: number;
  difficulty: 'conceptual' | 'problem-solving' | 'memorization';
}

export interface RoutineBlock {
  timeSlot: string;
  subject: string;
  method: string;
  methodBn: string;
  tradition: MethodTradition;
  durationMinutes: number;
  objective: string;
  objectiveBn: string;
  techniqueStep: string;
  techniqueStepBn: string;
  breakMinutes: number;
}

export interface GeneratedRoutine {
  id: string;
  createdAt: string;
  title: string;
  titleBn: string;
  diagnosis: string;
  diagnosisBn: string;
  totalMinutes: number;
  dailyPlan: RoutineBlock[];
  matchedTips: StudyTip[];
  rule147Note: string;
  rule147NoteBn: string;
}

export interface StudyLog {
  id: string;
  subject: string;
  topic: string;
  method: string;
  durationMinutes: number;
  completedAt: string;
  dateKey: string;
}

export interface SpacedRepetitionItem {
  id: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  day1Date: string;
  day4Date: string;
  day7Date: string;
  stageIndex: 0 | 1 | 2;
  nextReviewDate: string;
  reviewHistory: string[];
}

export type JournalFontOption =
  | 'Scribble'
  | 'Handwritten'
  | 'Typewriter'
  | 'Simple'
  | 'Classic';

export type JournalPaperStyle = 'plain' | 'lined' | 'dotted' | 'grid';

export type DiaryMoodCategory =
  | 'Happy Day'
  | 'Good Day'
  | 'Sad Day'
  | 'Bad Day'
  | 'Rainy Day'
  | 'Best Day of My Life'
  | 'Worst Day of My Life';

export interface JournalStickyNote {
  id: string;
  text: string;
  color: string;
  textColor: string;
  x: number; // percentage 0..85
  y: number; // percentage 0..80
}

export interface JournalStickerItem {
  id: string;
  stickerId: string;
  label: string;
  glyph: string;
  x: number; // percentage 0..85
  y: number; // percentage 0..80
  scale: number; // 0.6 .. 2.0
}

export interface JournalImageItem {
  id: string;
  dataUrl: string;
  caption?: string;
  x: number;
  y: number;
  widthPx: number;
}

export interface JournalSpread {
  id: string;
  leftDate: string;
  leftTime?: string;
  leftContent: string;
  rightDate: string;
  rightTime?: string;
  rightContent: string;
  moodTag?: DiaryMoodCategory | string;
  stickyNotes?: JournalStickyNote[];
  stickers?: JournalStickerItem[];
  images?: JournalImageItem[];
}

export interface JournalBook {
  id: string;
  title: string;
  subtitle: string;
  coverColor: string;
  textColor: string;
  font: JournalFontOption;
  paperStyle: JournalPaperStyle;
  backdropId: string;
  spreads: JournalSpread[];
  updatedAt: string;
}

export type ReadingStatus = 'Want to read' | 'Reading' | 'Finished';

export interface FavoritePageBookmark {
  page: number;
  label: string;
  savedAt: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  genre: string;
  topic: string;
  status: ReadingStatus;
  rating: number;
  coverColor: string;
  spineAccent: string;
  textColor: string;
  coverImage?: string;
  pdfFileId?: string;
  pdfFileName?: string;
  pdfUrl?: string;
  currentPage: number;
  totalPages: number;
  progress: number;
  notes: string;
  favoritePages?: FavoritePageBookmark[];
  createdAt: string;
  lastOpenedAt: string;
}

export interface WallpaperPreset {
  id: string;
  name: string;
  nameBn: string;
  type: 'image' | 'solid' | 'gradient';
  value: string;
  category: string;
}

export interface CustomAudioTrack {
  id: string;
  title: string;
  fileName: string;
  sizeBytes: number;
  addedAt: string;
}

export interface SavedVideoLink {
  id: string;
  title: string;
  subject: string;
  url: string;
  videoId: string;
  addedAt: string;
}
