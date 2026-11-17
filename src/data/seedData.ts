import {
  GeneratedRoutine,
  JournalBook,
  Language,
  LibraryBook,
  MethodTradition,
  RoutineBlock,
  SpacedRepetitionItem,
  StudyLog,
  StudyMethod,
  StudyTip,
  SubjectAllocation,
  WallpaperPreset,
} from '../types';

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return formatDateKey(dt);
}

export function formatShortJournalDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const yr = String(date.getFullYear()).slice(-2);
  return `${months[date.getMonth()]} ${date.getDate()} '${yr}`;
}

export const DEFAULT_GENRES = [
  'Biography',
  'Science',
  'Romance',
  'Fantasy',
  'Mystery & Thriller',
  'History',
  'Philosophy',
  'Horror',
  'CSE',
  'Fiction',
  'Non-Fiction',
  'Self-Help',
];

export const DEFAULT_GENRE_TOPICS: Record<string, string[]> = {
  History: [
    'Islamic War',
    'Ottoman Empire',
    'World War I',
    'World War II',
    'Ancient & Medieval',
    'Bengal & South Asia',
  ],
  Philosophy: [
    'Stoicism',
    'Islamic Philosophy',
    'Existentialism',
    'Ethics & Logic',
  ],
  Horror: [
    'Gothic Horror',
    'Psychological Horror',
    'Cosmic & Supernatural',
    'Folk Horror',
  ],
  'Mystery & Thriller': [
    'Crime Thriller',
    'Psychological Thriller',
    'Action Thriller',
    'Nordic Noir',
    'Gothic Mystery',
  ],
  Science: ['Physics & Cosmology', 'Chemistry', 'Biology & Medicine', 'Mathematics'],
  CSE: ['Algorithms & Data Structures', 'Systems & Architecture', 'AI & Machine Learning'],
  Fiction: ['Contemporary', 'Literary Fiction', 'Classic Literature'],
  Fantasy: ['Urban Fantasy', 'High Fantasy', 'Dark Fantasy'],
  Biography: ['Historical Figures', 'Scientists & Thinkers', 'Memoirs'],
  'Non-Fiction': ['Productivity & Focus', 'Economics & Society', 'Essays'],
  'Self-Help': ['Mindset & Habits', 'Communication', 'Emotional Mastery'],
  Romance: ['Contemporary Romance', 'Historical Romance'],
};

export const DIARY_MOOD_CATEGORIES = [
  'Happy Day',
  'Good Day',
  'Sad Day',
  'Bad Day',
  'Rainy Day',
  'Best Day of My Life',
  'Worst Day of My Life',
] as const;

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'obsidian-default',
    name: 'Obsidian Study',
    nameBn: 'অবসিডিয়ান স্টাডি',
    type: 'solid',
    value: '#111215',
    category: 'Minimal',
  },
  {
    id: 'plum-dusk',
    name: 'Plum Dusk',
    nameBn: 'প্লাম ডাস্ক',
    type: 'gradient',
    value: 'linear-gradient(180deg, #2D263A 0%, #5B4C62 55%, #75637A 100%)',
    category: 'Journal Classic',
  },
  {
    id: 'midnight-library',
    name: 'Midnight Library',
    nameBn: 'মিডনাইট লাইব্রেরি',
    type: 'image',
    value: '/src/assets/images/wallpaper_midnight_library_1794924317371.jpg',
    category: 'Atmosphere',
  },
  {
    id: 'rainy-tokyo',
    name: 'Rainy Tokyo Desk',
    nameBn: 'বৃষ্টিভেজা টোকিও ডেস্ক',
    type: 'image',
    value: '/src/assets/images/wallpaper_rainy_tokyo_desk_1794924317640.jpg',
    category: 'Atmosphere',
  },
  {
    id: 'misty-pine',
    name: 'Misty Cedar Pavilion',
    nameBn: 'কুয়াশাচ্ছন্ন সিডার বন',
    type: 'image',
    value: '/src/assets/images/wallpaper_misty_pine_study_1794924318275.jpg',
    category: 'Atmosphere',
  },
  {
    id: 'plum-paper',
    name: 'Velvet Twilight Paper',
    nameBn: 'ভেলভেট টোয়াইলাইট পেপার',
    type: 'image',
    value: '/src/assets/images/wallpaper_plum_velvet_dusk_1794924317533.jpg',
    category: 'Journal Classic',
  },
];

export const STRUGGLE_OPTIONS = [
  {
    id: 'procrastination',
    en: 'Hard to start / Procrastination',
    bn: 'পড়া শুরু করতে আলসেমি / প্রোক্র্যাস্টিনেশন',
  },
  {
    id: 'forgetting',
    en: 'Forgetting concepts after 2-3 days',
    bn: '২-৩ দিন পর পড়া ও সূত্র ভুলে যাওয়া',
  },
  {
    id: 'distraction',
    en: 'Phone & focus drift mid-session',
    bn: 'পড়ার মাঝে ফোন বা মনোযোগ নষ্ট হওয়া',
  },
  {
    id: 'comprehension',
    en: 'Tough concepts & derivations feel overwhelming',
    bn: 'কঠিন টপিক ও ডেরিভেশন বুঝতে অসুবিধা',
  },
  {
    id: 'fatigue',
    en: 'Mental fatigue / Sleepiness during long blocks',
    bn: 'লম্বা সেশনে ক্লান্তি বা ঘুম আসা',
  },
  {
    id: 'exam-speed',
    en: 'Slow problem-solving under exam pressure',
    bn: 'পরীক্ষায় দ্রুত অঙ্ক বা প্রশ্ন সমাধান করতে না পারা',
  },
];

export const GLOBAL_STUDY_TIPS: StudyTip[] = [
  {
    id: 'tip-korean-baekji',
    tradition: 'Korean Focus',
    origin: 'Seoul SKY Univ. Method',
    title: 'Baekji (Blank-Sheet) Recall Test',
    titleBn: 'বেকজি (সাদা কাগজ) রিকল টেস্ট',
    description:
      'After studying a chapter, close all books and reconstruct every formula, diagram, and heading onto a completely blank sheet from memory, then patch gaps in red ink.',
    descriptionBn:
      'অধ্যায় পড়া শেষ করে বই বন্ধ করুন এবং একটি সম্পূর্ণ সাদা কাগজে মুখস্থ সব সূত্র, চিত্র ও পয়েন্ট লিখুন; এরপর লাল কালি দিয়ে ভুলে যাওয়া অংশগুলো পূরণ করুন।',
    solvesStruggles: ['forgetting', 'comprehension'],
    idealMinutes: 45,
  },
  {
    id: 'tip-korean-tenmin',
    tradition: 'Korean Focus',
    origin: 'Korean Study Planner',
    title: '10-Minute Grid Accountability & Phone Lock',
    titleBn: '১০-মিনিট গ্রিড ও ফোন লকিং নিয়ম',
    description:
      'Place your phone in another room and shade a 10-minute grid block only for pure uninterrupted focus. Visual momentum destroys procrastination within 5 minutes.',
    descriptionBn:
      'ফোনটি অন্য ঘরে রেখে প্রতি ১০ মিনিট সম্পূর্ণ মনোযোগে পড়ার পর প্ল্যানার গ্রিডে দাগ দিন। এই দৃশ্যমান অগ্রগতি ৫ মিনিটেই আলসেমি দূর করে।',
    solvesStruggles: ['procrastination', 'distraction'],
    idealMinutes: 50,
  },
  {
    id: 'tip-japanese-machigai',
    tradition: 'Japanese Kaizen',
    origin: 'Tokyo Univ. (Todai)',
    title: 'Machigai Note (Error-Only Notebook)',
    titleBn: 'মাচিগাই নোট (ভুল সংশোধনের খাতা)',
    description:
      'Stop re-reading things you already know. Keep a dedicated notebook exclusively for wrong answers, writing why your brain slipped and re-solving within 72 hours.',
    descriptionBn:
      'যা পারেন তা বারবার না পড়ে শুধু ভুল হওয়া প্রশ্নগুলো একটি আলাদা খাতায় লিখে রাখুন এবং কেন ভুল হলো তা উল্লেখ করে ৭২ ঘণ্টার মধ্যে আবার সমাধান করুন।',
    solvesStruggles: ['exam-speed', 'forgetting'],
    idealMinutes: 35,
  },
  {
    id: 'tip-japanese-kaizen5',
    tradition: 'Japanese Kaizen',
    origin: 'Japanese Kaizen Discipline',
    title: 'Kaizen 5-Minute Micro-Start + Standing Reset',
    titleBn: 'কাইজেন ৫-মিনিট মাইক্রো-স্টার্ট ও ব্রেক রিসেট',
    description:
      'Tell yourself you only have to read 2 pages or solve 1 problem. Once friction breaks, momentum carries you; stand up and drink water every 35-50 mins to beat drowsiness.',
    descriptionBn:
      'শুরুতে নিজেকে বলুন মাত্র ২ পাতা বা ১টি অঙ্ক করবেন। শুরু হয়ে গেলে ফ্লো চলে আসবে। প্রতি ৩৫-৫০ মিনিট পর উঠে দাঁড়িয়ে পানি পান করলে ঘুমভাব দূর হয়।',
    solvesStruggles: ['procrastination', 'fatigue'],
    idealMinutes: 35,
  },
  {
    id: 'tip-chinese-3pass',
    tradition: 'Chinese Intensive',
    origin: 'Peking & Tsinghua Intensive',
    title: 'Gaokao 3-Tier Problem Escalation',
    titleBn: 'পিকিং ৩-স্তরের প্রবলেম সলভিং',
    description:
      'Divide each session into 20% axiom mapping, 50% core drills, and 30% timed cold simulation with zero hints. Trains high-speed accuracy under pressure.',
    descriptionBn:
      'প্রতি সেশনকে ভাগ করুন: ২০% মূল সূত্র বোঝা, ৫০% মাঝারি অনুশীলন, এবং ৩০% বই না দেখে টাইম ধরে পরীক্ষা-স্টাইলে সমাধান।',
    solvesStruggles: ['exam-speed', 'comprehension'],
    idealMinutes: 60,
  },
  {
    id: 'tip-chinese-golden',
    tradition: 'Chinese Intensive',
    origin: 'Chinese Morning Memorization',
    title: 'Golden Window Oral Recitation + Night Review',
    titleBn: 'সকালের গোল্ডেন উইন্ডো ও রাতের রিকল',
    description:
      'Tackle the heaviest memorization or formula proofs in your freshest mental window, speaking key definitions aloud, then skim your Day-1 notes 10 minutes before sleep.',
    descriptionBn:
      'সবচেয়ে কঠিন মুখস্থ বা থিওরি সকালে ফ্রেশ মাইন্ডে জোরে উচ্চারণ করে পড়ুন এবং ঘুমানোর আগে ১০ মিনিট নোটসগুলো চোখ বুলিয়ে নিন।',
    solvesStruggles: ['forgetting', 'fatigue'],
    idealMinutes: 45,
  },
  {
    id: 'tip-ivy-feynman',
    tradition: 'Ivy League Recall',
    origin: 'Oxford / Caltech Feynman',
    title: 'Feynman 12-Year-Old Simplification',
    titleBn: 'ফাইনম্যান সহজীকরণ কৌশল',
    description:
      'Explain the hardest concept on paper using simple everyday words—no textbook jargon. Wherever you get stuck or sound vague is the exact gap you must re-study.',
    descriptionBn:
      'কঠিন টপিকটি এমন সহজ ভাষায় কাগজে ব্যাখ্যা করুন যেন ১২ বছরের একটি শিশুও বুঝতে পারে। যেখানে আটকে যাবেন, ঠিক সেই অংশটিই আবার পড়তে হবে।',
    solvesStruggles: ['comprehension'],
    idealMinutes: 35,
  },
  {
    id: 'tip-ivy-interleave',
    tradition: 'Ivy League Recall',
    origin: 'Harvard / Stanford Cognitive Lab',
    title: 'Interleaving & Closed-Book Blurting',
    titleBn: 'ইন্টারলিভিং ও ক্লোজড-বুক ব্লার্টিং',
    description:
      'Mix 2 related problem types instead of repeating the same formula 20 times. Forces the brain to identify *which* method applies, boosting exam recall by 40%.',
    descriptionBn:
      'একই ধরনের অঙ্ক ২০ বার না করে ২-৩ ধরনের টপিক মিশিয়ে অনুশীলন করুন। এতে পরীক্ষায় কোন সূত্র কখন ব্যবহার করতে হবে তা দ্রুত ধরা যায়।',
    solvesStruggles: ['exam-speed', 'forgetting', 'distraction'],
    idealMinutes: 45,
  },
];

export const GLOBAL_STUDY_METHODS: StudyMethod[] = [
  {
    id: 'korean-gongbu',
    title: 'Korean Gongbu 50/10 & Baekji',
    titleBn: 'কোরিয়ান গংবু ৫০/১০ ও বেকজি মেথড',
    tradition: 'Korean Focus',
    origin: 'Seoul Study Hall Method',
    originBn: 'সিউল স্টাডি হল পদ্ধতি',
    subtitle: 'Monochrome deep-work sprints paired with blank-sheet recall.',
    subtitleBn: 'ফোনমুক্ত ৫০ মিনিট গভীর মনোযোগ ও সাদা কাগজে মুখস্থ রিকল।',
    summary:
      'Used across Seoul Dokseosil study rooms. Combines 50-minute uninterrupted single-subject sprints with a 10-minute physical reset and Baekji blank-sheet memory checks.',
    summaryBn:
      'কোরিয়ার টপ শিক্ষার্থীদের ব্যবহৃত পদ্ধতি। ৫০ মিনিট সম্পূর্ণ নীরব ও একমুখী পড়াশোনা, ১০ মিনিট স্ক্রিনমুক্ত বিরতি এবং শেষে বই বন্ধ করে সাদা কাগজে রিকল টেস্ট।',
    defaultMinutes: 50,
    steps: [
      'Clear your desk to one textbook and blank paper; leave your phone outside the room.',
      'Run a 50-minute timer and commit to a measurable target (e.g., 15 problems or 10 pages).',
      'End with a 5-minute Baekji blank-sheet writeup: write everything recalled without peeking.',
      'Take a strict 10-minute break without scrolling before starting the next block.',
    ],
    stepsBn: [
      'টেবিলে শুধু একটি বই ও সাদা কাগজ রাখুন; ফোন অন্য ঘরে রেখে দিন।',
      '৫০ মিনিটের টাইমার সেট করে নির্দিষ্ট লক্ষ্য ঠিক করুন (যেমন ১৫টি অঙ্ক বা ১০ পাতা)।',
      'শেষ ৫ মিনিট বই বন্ধ করে বেকজি (সাদা কাগজে) যা মনে আছে সব লিখুন।',
      '১০ মিনিটের বিরতিতে ফোন না দেখে হাঁটাচলা বা পানি পান করুন।',
    ],
    bestFor: 'Building raw focus stamina and beating phone distractions.',
    bestForBn: 'দীর্ঘক্ষণ মনোযোগ ধরে রাখা ও ফোন আসক্তি দূর করা।',
    coverColor: '#232B2B',
    spineColor: '#D4A359',
    textColor: '#F4F2ED',
  },
  {
    id: 'japanese-todai-kaizen',
    title: 'Japanese Todai 3-Zone & Machigai',
    titleBn: 'জাপানিজ তোদাই ৩-জোন ও মাচিগাই নোট',
    tradition: 'Japanese Kaizen',
    origin: 'University of Tokyo Protocol',
    originBn: 'টোকিও বিশ্ববিদ্যালয় প্রোটোকল',
    subtitle: '3-column note structure paired with an Error-Only notebook.',
    subtitleBn: 'তিন কলামের নোট পদ্ধতি এবং শুধু ভুলগুলো নিয়ে আলাদা খাতা।',
    summary:
      'Inspired by University of Tokyo notebooks and Kaizen 1% refinement. Separates facts, causal questions, and summary on one spread, backed by an Error Notebook.',
    summaryBn:
      'টোকিও বিশ্ববিদ্যালয়ের শিক্ষার্থীদের জনপ্রিয় কৌশল। পাতার ৩ অংশে মূল তথ্য, প্রশ্ন ও সারাংশ রাখা হয় এবং ভুল হওয়া অঙ্ক/তথ্য আলাদা মাচিগাই নোটে লিখে রাখা হয়।',
    defaultMinutes: 35,
    steps: [
      'Divide each page into 3 zones: Core Facts (left), Why/Questions (middle), Synthesis (right).',
      'Log every wrong problem inside your Machigai (Error) Notebook with the exact reason you slipped.',
      'Re-solve only your logged mistakes within 72 hours instead of re-reading easy material.',
      'Use a 5-minute micro-start whenever you feel resistance to begin.',
    ],
    stepsBn: [
      'নোটবুকের পাতা ৩ ভাগে ভাগ করুন: মূল তথ্য (বাম), প্রশ্ন ও যুক্তি (মাঝে), সারসংক্ষেপ (ডান)।',
      'প্রতিটি ভুল হওয়া প্রশ্ন আলাদা মাচিগাই খাতায় লিখুন এবং কেন ভুল হলো নোট করুন।',
      'সহজ পড়া বারবার না পড়ে ৭২ ঘণ্টার মধ্যে শুধু ভুলগুলো আবার সমাধান করুন।',
      'পড়া শুরু করতে আলসেমি লাগলে মাত্র ৫ মিনিটের মাইক্রো-স্টার্ট দিয়ে শুরু করুন।',
    ],
    bestFor: 'STEM problem solving and eliminating repeat exam mistakes.',
    bestForBn: 'বিজ্ঞান ও গণিতের ভুল কমানো এবং দ্রুত ইমপ্রুভমেন্ট।',
    coverColor: '#1E2530',
    spineColor: '#8CA3C3',
    textColor: '#F4F2ED',
  },
  {
    id: 'peking-intensive',
    title: 'Chinese Peking 3-Tier Intensive',
    titleBn: 'চাইনিজ পিকিং ৩-স্তরের ইনটেনসিভ মেথড',
    tradition: 'Chinese Intensive',
    origin: 'Peking & Tsinghua Loop',
    originBn: 'পিকিং ও সিংহুয়া লুপ',
    subtitle: '60–90m layered sprints from core axioms to timed exam drills.',
    subtitleBn: 'মূল সূত্র থেকে ধাপে ধাপে টাইম-বাউন্ড পরীক্ষার অনুশীলন।',
    summary:
      'Engineered for intense competitive curricula. Compresses structural mapping, escalating problem tiers, and cold timed verification into one sharp block.',
    summaryBn:
      'চীনের শীর্ষ বিশ্ববিদ্যালয়ের শিক্ষার্থীদের দ্রুত ও গভীর প্রস্তুতির পদ্ধতি। প্রথমে অধ্যায়ের মূল কাঠামো, তারপর সহজ থেকে কঠিন প্রশ্ন এবং শেষে ঘড়ি ধরে পরীক্ষা।',
    defaultMinutes: 60,
    steps: [
      'First 15 mins: Map the chapter skeleton—only core axioms, definitions, and edge conditions.',
      'Next 30 mins: Escalate across 3 tiers: mechanical basics, multi-concept synthesis, and trap problems.',
      'Final 15 mins: Run a cold timed mini-test with zero notes open and grade immediately.',
    ],
    stepsBn: [
      'প্রথম ১৫ মিনিট: অধ্যায়ের মূল সূত্র, সংজ্ঞা ও শর্তগুলোর একটি ম্যাপ তৈরি করুন।',
      'পরবর্তী ৩০ মিনিট: ৩ ধাপে অনুশীলন করুন—বেসিক, মাঝারি মিশ্র প্রশ্ন ও কঠিন ট্র্যাপ প্রশ্ন।',
      'শেষ ১৫ মিনিট: কোনো সাহায্য ছাড়া টাইমার চালু করে দ্রুত মিনি-টেস্ট দিন এবং সাথে সাথে যাচাই করুন।',
    ],
    bestFor: 'Math, Physics, Chemistry, and high-speed exam mastery.',
    bestForBn: 'গণিত, পদার্থবিজ্ঞান, রসায়ন ও পরীক্ষায় দ্রুত সমাধানের দক্ষতা।',
    coverColor: '#312023',
    spineColor: '#C97B74',
    textColor: '#F4F2ED',
  },
  {
    id: 'harvard-active-recall',
    title: 'Harvard Blurting & Interleaving',
    titleBn: 'হার্ভার্ড ব্লার্টিং ও ইন্টারলিভিং মেথড',
    tradition: 'Ivy League Recall',
    origin: 'Harvard / Stanford Science',
    originBn: 'হার্ভার্ড / স্ট্যানফোর্ড সায়েন্স',
    subtitle: 'Closed-book retrieval practice mixed across question types.',
    subtitleBn: 'বই বন্ধ করে স্মৃতি থেকে লেখা এবং মিশ্র টপিকে প্র্যাকটিস।',
    summary:
      'Replaces passive highlighting with high-effort memory retrieval and topic interleaving, then feeds directly into the 1-4-7 Spaced Repetition schedule.',
    summaryBn:
      'শুধু হাইলাইট করার বদলে মস্তিষ্ককে জোর দিয়ে তথ্য মনে করিয়ে দেওয়ার বৈজ্ঞানিক পদ্ধতি। এটি সরাসরি ১-৪-৭ স্পেসড রিপিটেশনের সাথে দারুণ কাজ করে।',
    defaultMinutes: 45,
    steps: [
      'Read actively for 15 minutes, then close the book and write down every concept from memory.',
      'Check the source in a second color to fix missing links or weak definitions.',
      'Interleave 2-3 related subtopics in your practice set rather than drilling one pattern.',
      'Mark Done in the Focus Timer to trigger Day 4 Recall & Day 7 Finish reminders.',
    ],
    stepsBn: [
      '১৫ মিনিট মনোযোগ দিয়ে পড়ে বই বন্ধ করুন এবং যা মনে আছে সব লিখে ফেলুন।',
      'ভিন্ন রঙের কলম দিয়ে বইয়ের সাথে মিলিয়ে বাদ পড়া অংশগুলো ঠিক করুন।',
      'একই টপিক বারবার না করে ২-৩টি টপিক মিলিয়ে প্র্যাকটিস করুন।',
      'পড়া শেষে টাইমারে Done ক্লিক করে ৪র্থ ও ৭ম দিনের রিমাইন্ডার সেট করুন।',
    ],
    bestFor: 'Long-term memory retention across Biology, Law, and Theory.',
    bestForBn: 'দীর্ঘদিন পড়া মনে রাখা এবং তাত্ত্বিক বিষয়ে দক্ষতা।',
    coverColor: '#29222C',
    spineColor: '#B89AC9',
    textColor: '#F4F2ED',
  },
  {
    id: 'oxford-feynman',
    title: 'Oxford Tutorial & Feynman Drill',
    titleBn: 'অক্সফোর্ড টিউটোরিয়াল ও ফাইনম্যান কৌশল',
    tradition: 'Ivy League Recall',
    origin: 'Oxford / Caltech Model',
    originBn: 'অক্সফোর্ড / ক্যালটেক মডেল',
    subtitle: 'Strip away jargon and defend concepts in plain language.',
    subtitleBn: 'কঠিন বিষয় সহজ ভাষায় ব্যাখ্যা করে দুর্বলতা খুঁজে বের করা।',
    summary:
      'Combines Oxford oral defense with Richard Feynman’s simplification test. If you cannot explain a theorem simply, you have exposed the exact gap to fix.',
    summaryBn:
      'অক্সফোর্ডের যুক্তি উপস্থাপন ও রিচার্ড ফাইনম্যানের সহজীকরণ কৌশলের সমন্বয়। জটিল শব্দ বাদ দিয়ে সহজভাবে বোঝাতে পারলেই আসল শেখা সম্পূর্ণ হয়।',
    defaultMinutes: 35,
    steps: [
      'Write the topic at the top of a page and explain it in plain language for a 12-year-old.',
      'Circle every spot where you hesitate or hide behind memorized jargon.',
      'Return to the textbook strictly for those circled gaps, then add a real-world analogy.',
      'Speak your final 3-minute summary aloud before closing the session.',
    ],
    stepsBn: [
      'পাতার উপরে টপিকের নাম লিখে একজন ১২ বছর বয়সী শিক্ষার্থীর উপযোগী সহজ ভাষায় ব্যাখ্যা লিখুন।',
      'যেখানে আটকে যাবেন বা শুধু কঠিন শব্দ ব্যবহার করবেন, সেখানে গোল দাগ দিন।',
      'শুধু দাগ দেওয়া অংশগুলো আবার বই থেকে পরিষ্কার করে বুঝে একটি বাস্তব উদাহরণ যোগ করুন।',
      'সেশন শেষে ৩ মিনিট জোরে জোরে মূল বক্তব্যটি নিজের ভাষায় বলুন।',
    ],
    bestFor: 'Deep conceptual clarity, essays, algorithms, and viva prep.',
    bestForBn: 'জটিল কনসেপ্ট পরিষ্কার করা, রচনা ও মৌখিক পরীক্ষার প্রস্তুতি।',
    coverColor: '#222A23',
    spineColor: '#8FB593',
    textColor: '#F4F2ED',
  },
];

// Automatic Smart Routine Assembler from Global Tips & Frameworks (no AI label!)
export function assembleSmartRoutine(
  allocations: SubjectAllocation[],
  selectedStruggles: string[],
  customStruggle: string,
  lang: Language,
  startTime = '18:00'
): {
  title: string;
  titleBn: string;
  diagnosis: string;
  diagnosisBn: string;
  totalMinutes: number;
  dailyPlan: RoutineBlock[];
  matchedTips: StudyTip[];
  rule147Note: string;
  rule147NoteBn: string;
} {
  const validAllocations = allocations.filter((a) => a.subject.trim().length > 0 && a.minutes > 0);
  const totalMinutes = validAllocations.reduce((s, a) => s + a.minutes, 0);

  // Rank tips based on selected struggles
  const scoredTips = GLOBAL_STUDY_TIPS.map((tip) => {
    const overlap = tip.solvesStruggles.filter((st) => selectedStruggles.includes(st)).length;
    return { tip, score: overlap };
  })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.tip);

  const matchedTips = scoredTips.slice(0, 4);

  const [startHour, startMinute] = startTime.split(':').map(Number);
  let currentMinuteCursor = startHour * 60 + startMinute;
  const formatClock = (mins: number) => {
    const h = String(Math.floor(mins / 60) % 24).padStart(2, '0');
    const m = String(mins % 60).padStart(2, '0');
    return `${h}:${m}`;
  };

  const dailyPlan: RoutineBlock[] = validAllocations.map((alloc, idx) => {
    let chosenMethod: StudyMethod;
    if (alloc.difficulty === 'problem-solving') {
      chosenMethod =
        alloc.minutes >= 55
          ? GLOBAL_STUDY_METHODS[2] // Chinese Peking 3-Tier
          : GLOBAL_STUDY_METHODS[1]; // Japanese Todai Machigai
    } else if (alloc.difficulty === 'memorization') {
      chosenMethod =
        selectedStruggles.includes('forgetting') || idx % 2 === 0
          ? GLOBAL_STUDY_METHODS[0] // Korean Gongbu + Baekji
          : GLOBAL_STUDY_METHODS[3]; // Harvard Blurting
    } else {
      chosenMethod =
        selectedStruggles.includes('comprehension')
          ? GLOBAL_STUDY_METHODS[4] // Oxford Feynman
          : GLOBAL_STUDY_METHODS[3]; // Harvard Active Recall
    }

    const startLabel = formatClock(currentMinuteCursor);
    const endLabel = formatClock(currentMinuteCursor + alloc.minutes);
    const breakMins = alloc.minutes >= 50 ? 10 : 5;
    currentMinuteCursor += alloc.minutes + breakMins;

    const matchingTip = matchedTips[idx % matchedTips.length];

    const objective =
      alloc.difficulty === 'problem-solving'
        ? `Complete timed problem tiers & log slips in Machigai Error Note`
        : alloc.difficulty === 'memorization'
        ? `Encode core definitions & run closed-book Baekji blank-sheet recall`
        : `Map first principles & simplify core concepts via Feynman check`;

    const objectiveBn =
      alloc.difficulty === 'problem-solving'
        ? `টাইম ধরে প্রবলেম সলভ করুন এবং ভুলগুলো মাচিগাই নোটে লিখে রাখুন`
        : alloc.difficulty === 'memorization'
        ? `মূল তথ্য আয়ত্ত করে বই বন্ধ করে বেকজি সাদা কাগজে মুখস্থ রিকল দিন`
        : `মূল ধারণাগুলো ফাইনম্যান পদ্ধতিতে সহজ ভাষায় সাজিয়ে নিন`;

    return {
      timeSlot: `${startLabel}–${endLabel}`,
      subject: alloc.subject.trim(),
      method: chosenMethod.title,
      methodBn: chosenMethod.titleBn,
      tradition: chosenMethod.tradition,
      durationMinutes: alloc.minutes,
      objective,
      objectiveBn,
      techniqueStep: `${chosenMethod.steps[0]} Bonus trick (${matchingTip.origin}): ${matchingTip.title}.`,
      techniqueStepBn: `${chosenMethod.stepsBn[0]} বিশেষ কৌশল (${matchingTip.origin}): ${matchingTip.titleBn}।`,
      breakMinutes: breakMins,
    };
  });

  const struggleTextEn = selectedStruggles.length
    ? selectedStruggles
        .map((id) => STRUGGLE_OPTIONS.find((s) => s.id === id)?.en || id)
        .join(', ')
    : 'Balanced concentration & recall';

  const struggleTextBn = selectedStruggles.length
    ? selectedStruggles
        .map((id) => STRUGGLE_OPTIONS.find((s) => s.id === id)?.bn || id)
        .join(', ')
    : 'মনোযোগ ও স্মৃতিশক্তি সমন্বয়';

  const extraNoteEn = customStruggle.trim() ? ` Custom focus note: "${customStruggle.trim()}".` : '';
  const extraNoteBn = customStruggle.trim() ? ` বিশেষ নোট: "${customStruggle.trim()}"।` : '';

  const title = `${validAllocations.length}-Subject Focused Blueprint (${totalMinutes}m)`;
  const titleBn = `${validAllocations.length}টি সাবজেক্টের কাস্টম রুটিন (${totalMinutes} মিনিট)`;

  const diagnosis = `Tailored around ${totalMinutes} minutes across ${validAllocations
    .map((a) => a.subject)
    .join(', ')}. Matched Korean, Japanese, Chinese, and Ivy League protocols specifically to counter: ${struggleTextEn}.${extraNoteEn}`;

  const diagnosisBn = `${validAllocations
    .map((a) => a.subject)
    .join(', ')} — মোট ${totalMinutes} মিনিটের জন্য সাজানো হয়েছে। আপনার সমস্যা (${struggleTextBn}) সমাধানের জন্য কোরিয়ান, জাপানিজ, চাইনিজ ও আইভি লিগ কৌশল নির্বাচন করা হয়েছে।${extraNoteBn}`;

  const rule147Note = `After finishing each block in the Focus Timer, click "Done" to lock Day 1. Your Day 4 Recall reminder and Day 7 Finish reminder will trigger automatically.`;
  const rule147NoteBn = `প্রতিটি ব্লক ফোকাস টাইমারে পড়া শেষ করে Done চাপলে ১ম দিন সেভ হবে এবং ৪র্থ দিনে রিকল ও ৭ম দিনে ফিনিশ করার রিমাইন্ডার অটোমেটিক তৈরি হবে।`;

  void lang;

  return {
    title,
    titleBn,
    diagnosis,
    diagnosisBn,
    totalMinutes,
    dailyPlan,
    matchedTips,
    rule147Note,
    rule147NoteBn,
  };
}

const today = new Date();
export const INITIAL_SAVED_ROUTINE: GeneratedRoutine = {
  id: 'routine-seed-1',
  createdAt: today.toISOString(),
  ...assembleSmartRoutine(
    [
      { id: 'sub-1', subject: 'Chemistry', minutes: 60, difficulty: 'problem-solving' },
      { id: 'sub-2', subject: 'Linear Algebra', minutes: 45, difficulty: 'conceptual' },
      { id: 'sub-3', subject: 'Biology / Theory', minutes: 35, difficulty: 'memorization' },
    ],
    ['forgetting', 'procrastination'],
    '',
    'en'
  ),
};

const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(today.getDate() - 3); // Day 1 was 3 days ago -> Day 4 Recall is TODAY!
const sixDaysAgo = new Date(today);
sixDaysAgo.setDate(today.getDate() - 6); // Day 1 was 6 days ago -> Day 7 Finish is TODAY!
const oneDayAgo = new Date(today);
oneDayAgo.setDate(today.getDate() - 1);

const todayKey = formatDateKey(today);
const threeDaysAgoKey = formatDateKey(threeDaysAgo);
const sixDaysAgoKey = formatDateKey(sixDaysAgo);
const oneDayAgoKey = formatDateKey(oneDayAgo);

export const INITIAL_STUDY_LOGS: StudyLog[] = [
  {
    id: 'log-seed-1',
    subject: 'Chemistry',
    topic: 'Chemical Bonding & Hybridization',
    method: 'Chinese Peking 3-Tier Intensive',
    durationMinutes: 60,
    completedAt: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    dateKey: todayKey,
  },
];

// 1-4-7 Spaced Repetition Seed Items:
export const INITIAL_SPACED_REPETITION: SpacedRepetitionItem[] = [
  {
    id: 'sr-seed-day4',
    subject: 'Chemistry',
    topic: 'SN1 vs SN2 Reaction Kinetics',
    durationMinutes: 60,
    day1Date: threeDaysAgoKey,
    day4Date: todayKey, // Due for Day 4 Recall TODAY
    day7Date: addDaysToDateKey(threeDaysAgoKey, 6),
    stageIndex: 0,
    nextReviewDate: todayKey,
    reviewHistory: [threeDaysAgoKey],
  },
  {
    id: 'sr-seed-day7',
    subject: 'Linear Algebra',
    topic: 'Eigenvalues & Spectral Theorem',
    durationMinutes: 45,
    day1Date: sixDaysAgoKey,
    day4Date: addDaysToDateKey(sixDaysAgoKey, 3),
    day7Date: todayKey, // Due for Day 7 Finish TODAY
    stageIndex: 1,
    nextReviewDate: todayKey,
    reviewHistory: [sixDaysAgoKey, addDaysToDateKey(sixDaysAgoKey, 3)],
  },
  {
    id: 'sr-seed-upcoming',
    subject: 'Physics',
    topic: 'Thermodynamics: Entropy & Carnot Cycle',
    durationMinutes: 50,
    day1Date: oneDayAgoKey,
    day4Date: addDaysToDateKey(oneDayAgoKey, 3),
    day7Date: addDaysToDateKey(oneDayAgoKey, 6),
    stageIndex: 0,
    nextReviewDate: addDaysToDateKey(oneDayAgoKey, 3),
    reviewHistory: [oneDayAgoKey],
  },
];

export const INITIAL_JOURNALS: JournalBook[] = [
  {
    id: 'journal-mood',
    title: 'MOOD: NAVIGATING & NAMING EMOTIONS',
    subtitle: 'Daily clarity & emotional mapping',
    coverColor: '#DCEAD7',
    textColor: '#252B24',
    font: 'Scribble',
    paperStyle: 'plain',
    backdropId: 'plum-dusk',
    updatedAt: today.toISOString(),
    spreads: [
      {
        id: 'spread-1',
        leftDate: formatShortJournalDate(today),
        leftTime: '08:30 AM',
        leftContent:
          "Didn't start at 6am like I thought I would, but calm, clear mind today. I gonna complete my chemistry notes before evening and keep my focus blocks clean.",
        rightDate: formatShortJournalDate(today),
        rightTime: '09:15 PM',
        rightContent:
          'What helped most:\n- Putting my phone in the hallway before opening the textbook.\n- Breaking the chapter into two 35-minute active recall passes instead of staring at the whole syllabus.',
        moodTag: 'Good Day',
      },
      {
        id: 'spread-2',
        leftDate: formatShortJournalDate(oneDayAgo),
        leftTime: '07:45 PM',
        leftContent:
          'Notice how resistance disappears after the first 7 minutes of writing. Once the pen moves, the fog clears.',
        rightDate: formatShortJournalDate(oneDayAgo),
        rightTime: '10:20 PM',
        rightContent:
          'Evening check-in: Feeling quietly proud of finishing the problem set without checking solutions prematurely.',
        moodTag: 'Happy Day',
      },
    ],
  },
  {
    id: 'journal-deepwork',
    title: 'DEEP WORK & FIRST PRINCIPLES',
    subtitle: 'Technical syntheses & Feynman drills',
    coverColor: '#D9B19F',
    textColor: '#2A1E19',
    font: 'Typewriter',
    paperStyle: 'lined',
    backdropId: 'midnight-library',
    updatedAt: oneDayAgo.toISOString(),
    spreads: [
      {
        id: 'spread-dw-1',
        leftDate: formatShortJournalDate(today),
        leftTime: '10:00 AM',
        leftContent:
          'Feynman check on Entropy:\nNot "disorder" in the vague sense — it is the count of microstates consistent with a macrostate. The system drifts toward the most probable configuration.',
        rightDate: formatShortJournalDate(today),
        rightTime: '11:30 AM',
        rightContent:
          'Questions to test on Day 4 recall:\n1. Derive Gibbs free energy sign criteria from scratch.\n2. Why does reversible expansion maximize work?',
        moodTag: 'Best Day of My Life',
      },
    ],
  },
  {
    id: 'journal-midnight',
    title: 'NIGHT ARCHIVE & STOIC NOTES',
    subtitle: 'Quiet reflections before sleep',
    coverColor: '#9EAAC2',
    textColor: '#19202C',
    font: 'Classic',
    paperStyle: 'dotted',
    backdropId: 'rainy-tokyo',
    updatedAt: threeDaysAgo.toISOString(),
    spreads: [
      {
        id: 'spread-mn-1',
        leftDate: formatShortJournalDate(threeDaysAgo),
        leftTime: '11:10 PM',
        leftContent:
          'Rain outside the window. Slow reading speed is not a weakness when the goal is permanence rather than skimming.',
        rightDate: formatShortJournalDate(threeDaysAgo),
        rightTime: '11:45 PM',
        rightContent:
          'Tomorrow morning priority:\nComplete 45 minutes of 1-4-7 spaced recall before opening any messages.',
        moodTag: 'Rainy Day',
      },
    ],
  },
];

// Clean empty shelf on start so user adds their own books via + Add book or Bulk add
export const INITIAL_LIBRARY_BOOKS: LibraryBook[] = [];
