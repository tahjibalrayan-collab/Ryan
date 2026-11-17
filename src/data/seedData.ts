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
  {
    id: 'tip-german-leitner',
    tradition: 'European & Classical',
    origin: 'German Leitner & Zettelkasten',
    title: 'Atomic Zettelkasten Note Linking',
    titleBn: 'জার্মান জেটেলকাস্টেন অ্যাটোমিক নোট লিংকিং',
    description:
      'Write one clear idea per note card in your own words and link it to two older concepts you already know. Connected memories never decay like isolated facts.',
    descriptionBn:
      'প্রতিটি কার্ডে নিজের ভাষায় একটি মাত্র মূল ধারণা লিখুন এবং পুরোনো দুটি ধারণার সাথে সংযোগ দেখান। সংযুক্ত তথ্য কখনো সহজে ভুলে যাওয়া যায় না।',
    solvesStruggles: ['comprehension', 'forgetting'],
    idealMinutes: 40,
  },
  {
    id: 'tip-italian-pomodoro',
    tradition: 'European & Classical',
    origin: 'Italian Pomodoro Flow',
    title: '25/5 Friction-Breaker Sprint',
    titleBn: 'ইতালীয় পমোডোরো ২৫/৫ ফ্লো স্প্রিন্ট',
    description:
      'Commit to just one 25-minute ring without multitasking. Every time an intrusive thought pops up, jot it on a scratch sheet and return immediately.',
    descriptionBn:
      'মাত্র ২৫ মিনিটের একটি সাইকেল ঠিক করুন; মাথায় কোনো বাহ্যিক চিন্তা এলে আলাদা কাগজে লিখে আবার সাথে সাথে পড়ায় ফিরে আসুন।',
    solvesStruggles: ['procrastination', 'distraction', 'fatigue'],
    idealMinutes: 25,
  },
  {
    id: 'tip-singapore-cpa',
    tradition: 'Global STEM & Synthesis',
    origin: 'Singapore Math CPA Model',
    title: 'Concrete → Pictorial → Abstract Ladder',
    titleBn: 'সিঙ্গাপুর সিপিএ (চিত্র-থেকে-সমীকরণ) কৌশল',
    description:
      'Never jump straight to dry equations. Sketch a quick bar model or diagram first (Pictorial), then translate the geometry directly into symbolic math (Abstract).',
    descriptionBn:
      'সরাসরি কঠিন সমীকরণে না গিয়ে আগে খাতায় চিত্র বা মডেল এঁকে নিন, তারপর চিত্র দেখে সমীকরণ তৈরি করুন।',
    solvesStruggles: ['comprehension', 'exam-speed'],
    idealMinutes: 45,
  },
  {
    id: 'tip-nalanda-oral',
    tradition: 'Global STEM & Synthesis',
    origin: 'Nalanda / Classical Synthesis',
    title: 'Shabda-Manana Oral Defense',
    titleBn: 'নালন্দা তর্ক ও মৌখিক পুনরাবৃত্তি',
    description:
      'Defend your thesis aloud against an imaginary opponent asking "Why?" three times in a row. Exposed weak spots show exactly what to re-verify.',
    descriptionBn:
      'নিজের শেখা বিষয়টি কাল্পনিক প্রতিপক্ষের সামনে যুক্তি দিয়ে ব্যাখ্যা করুন এবং পরপর ৩ বার "কেন?" প্রশ্ন করে দুর্বলতা যাচাই করুন।',
    solvesStruggles: ['comprehension', 'forgetting', 'fatigue'],
    idealMinutes: 30,
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
    coverColor: '#18181B',
    spineColor: '#E5E5E5',
    textColor: '#FAFAFA',
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
    coverColor: '#27272A',
    spineColor: '#D4D4D8',
    textColor: '#FAFAFA',
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
    coverColor: '#1F1F23',
    spineColor: '#A1A1AA',
    textColor: '#FAFAFA',
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
    coverColor: '#141416',
    spineColor: '#E4E4E7',
    textColor: '#FAFAFA',
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
    coverColor: '#262626',
    spineColor: '#D4D4D4',
    textColor: '#FAFAFA',
  },
  {
    id: 'cornell-5r',
    title: 'Cornell 5R Systematic Notes',
    titleBn: 'কর্নেল ৫-আর নোট মেথড (USA)',
    tradition: 'Ivy League Recall',
    origin: 'Cornell University (USA)',
    originBn: 'কর্নেল বিশ্ববিদ্যালয় (আমেরিকা)',
    subtitle: 'Record, Reduce, Recite, Reflect & Review structured recall.',
    subtitleBn: 'নোট, কিওয়ার্ড, আবৃত্তি ও সারাংশের মাধ্যমে সুশৃঙ্খল পড়াশোনা।',
    summary:
      'Developed by Prof. Walter Pauk at Cornell. Divides pages into Cue Column, Note-Taking Area, and Bottom Summary so every page becomes an instant self-quiz.',
    summaryBn:
      'আমেরিকার কর্নেল বিশ্ববিদ্যালয়ের পদ্ধতি। বাম পাশে প্রশ্ন/কিওয়ার্ড, ডানে মূল নোট এবং নিচে ২ লাইনের সারাংশ লিখে প্রতিটি পাতাকে কুইজে রূপান্তর করা হয়।',
    defaultMinutes: 40,
    steps: [
      'Record key concepts on the right 70% of the page during reading or lectures.',
      'Reduce ideas into short cue questions inside the left 30% margin.',
      'Recite answers aloud while covering the right column completely.',
      'Write a 2-sentence bottom summary and review weekly.',
    ],
    stepsBn: [
      'পাতার ডান দিকের ৭০% অংশে মূল তথ্য ও নোট লিখুন।',
      'বাম দিকের ৩০% অংশে ছোট প্রশ্ন ও কিওয়ার্ড লিখুন।',
      'ডান দিক ঢেকে রেখে বামের প্রশ্ন দেখে মুখে উত্তর বলুন।',
      'পাতার নিচে ২ লাইনের সারাংশ লিখে সপ্তাহে একবার রিভাইজ দিন।',
    ],
    bestFor: 'Lecture comprehension, history, medicine, and structured textbooks.',
    bestForBn: 'লেকচার নোট, ইতিহাস, মেডিকেল ও বড় অধ্যায় গুছিয়ে পড়া।',
    coverColor: '#1E1E22',
    spineColor: '#D1D5DB',
    textColor: '#FAFAFA',
  },
  {
    id: 'german-zettelkasten',
    title: 'German Leitner & Zettelkasten',
    titleBn: 'জার্মান লিটনার বক্স ও জেটেলকাস্টেন',
    tradition: 'European & Classical',
    origin: 'German Research Tradition',
    originBn: 'জার্মান গবেষণা পদ্ধতি',
    subtitle: 'Atomic linked note cards paired with interval card boxes.',
    subtitleBn: 'সংযুক্ত নোট কার্ড ও ভুল-সঠিকের ভিত্তিতে ব্যবধান রেখে রিভিশন।',
    summary:
      'Combines Sebastian Leitner’s physical spaced flashcard boxes with Niklas Luhmann’s Zettelkasten web of linked atomic ideas—used to master vast syllabi permanently.',
    summaryBn:
      'জার্মান বিজ্ঞানী লিটনারের ফ্ল্যাশকার্ড বক্স এবং লুহম্যানের সংযুক্ত নোট কার্ড পদ্ধতির সমন্বয়। এতে কঠিন বিষয়গুলো আলাদা বক্সে রেখে দ্রুত বারবার পড়া হয়।',
    defaultMinutes: 40,
    steps: [
      'Write one atomic formula, reaction, or idea per index card.',
      'Link each new card to two related cards already in your archive.',
      'Test yourself: correct cards move forward (Day 4 -> Day 7); missed cards stay in Box 1.',
    ],
    stepsBn: [
      'প্রতিটি কার্ডে কেবল একটি মূল সূত্র, বিক্রিয়া বা ধারণা লিখুন।',
      'নতুন কার্ডটির সাথে আগের দুটি সম্পর্কিত ধারণার সংযোগ উল্লেখ করুন।',
      'নিজেকে পরীক্ষা করুন: পারলে পরের ধাপে নিন, ভুল হলে বক্স-১ এ রেখে পরদিন আবার পড়ুন।',
    ],
    bestFor: 'Organic chemistry reactions, vocabulary, laws, and connected theory.',
    bestForBn: 'জৈব রসায়নের বিক্রিয়া, সংজ্ঞা, সূত্র ও গভীর গবেষণা।',
    coverColor: '#222226',
    spineColor: '#E5E7EB',
    textColor: '#FAFAFA',
  },
  {
    id: 'italian-pomodoro-flow',
    title: 'Italian Pomodoro Flow System',
    titleBn: 'ইতালীয় পমোডোরো ফ্লো সিস্টেম',
    tradition: 'European & Classical',
    origin: 'Francesco Cirillo (Italy)',
    originBn: 'ফ্রান্সেসকো সিরিলো (ইতালি)',
    subtitle: '25-minute anti-procrastination sprints with distraction capture.',
    subtitleBn: 'আলসেমি কাটানোর ২৫ মিনিটের ফ্লো এবং চিন্তা-নোট করার কৌশল।',
    summary:
      'More than a timer: uses an Inventory Sheet + distraction capture rule so perfectionism and phone urges never break your momentum.',
    summaryBn:
      'শুধু ঘড়ি নয়—শুরু করার ভয় কাটাতে ২৫ মিনিটের ছোট টার্গেট এবং মাঝখানে আসা অপ্রয়োজনীয় চিন্তা আলাদা কাগজে লিখে মন স্থির রাখার ইতালীয় পদ্ধতি।',
    defaultMinutes: 25,
    steps: [
      'Pick ONE single task before pressing Start—never switch mid-ring.',
      'If distracted by a thought or message urge, write it on a scratchpad and keep going.',
      'Take a clean 5-minute physical stretch break (no social feeds); take 20m after 4 rings.',
    ],
    stepsBn: [
      'শুরু করার আগে কেবল একটি কাজ বেছে নিন—রিং শেষ না হওয়া পর্যন্ত কাজ বদলাবেন না।',
      'মন অন্যদিকে গেলে কাগজে লিখে রেখে সাথে সাথে পড়ায় ফিরুন।',
      'প্রতি ২৫ মিনিটে ৫ মিনিট এবং ৪ বার পর ২০ মিনিট স্ক্রিনমুক্ত বিশ্রাম নিন।',
    ],
    bestFor: 'Overcoming starting paralysis, fatigue, and short attention spans.',
    bestForBn: 'পড়া শুরু করার আলসেমি, ক্লান্তি ও মনোযোগহীনতা দূর করা।',
    coverColor: '#19191C',
    spineColor: '#D4D4D8',
    textColor: '#FAFAFA',
  },
  {
    id: 'finnish-phenomenon',
    title: 'Finnish Phenomenon Synthesis',
    titleBn: 'ফিনিশ ফেনোমেনন-ভিত্তিক শেখা',
    tradition: 'European & Classical',
    origin: 'Finnish Pedagogy (Finland)',
    originBn: 'ফিনল্যান্ড শিক্ষা মডেল',
    subtitle: 'Anchor every abstract chapter to one real-world phenomenon.',
    subtitleBn: 'প্রতিটি অধ্যায়ের পেছনের বাস্তব ঘটনা ও বড় চিত্র আগে বোঝা।',
    summary:
      'Rather than memorizing isolated syllabus fragments, start with a concrete real-world system and map Physics, Chemistry, and Math principles around it.',
    summaryBn:
      'বিচ্ছিন্নভাবে মুখস্থ না করে একটি বাস্তব ঘটনা বা সিস্টেমকে কেন্দ্র করে পদার্থ, রসায়ন ও গণিতের সূত্রগুলো একসাথে যুক্ত করে বোঝার ফিনিশ কৌশল।',
    defaultMinutes: 40,
    steps: [
      'Open the chapter by asking: What real-world mechanism does this explain?',
      'Draw a 1-page mind-web connecting formulas, units, and real examples.',
      'Write 3 "What happens if X doubles?" stress-test questions and solve them.',
    ],
    stepsBn: [
      'অধ্যায় শুরুর আগে নিজেকে প্রশ্ন করুন: এটি বাস্তবের কোন কাজ ব্যাখ্যা করে?',
      'এক পাতায় সূত্র, একক এবং বাস্তব উদাহরণগুলোর মধ্যে সংযোগের একটি ম্যাপ আঁকুন।',
      '"X দ্বিগুণ হলে কী হবে?"—এ ধরনের ৩টি বিশ্লেষণী প্রশ্ন নিজে বানিয়ে সমাধান করুন।',
    ],
    bestFor: 'Interdisciplinary intuition, physics systems, and deep essays.',
    bestForBn: 'বিজ্ঞান ও সমাজবিজ্ঞানের মূল কনসেপ্ট গভীরভাবে বোঝা।',
    coverColor: '#252529',
    spineColor: '#CBD5E1',
    textColor: '#FAFAFA',
  },
  {
    id: 'singapore-cpa',
    title: 'Singaporean CPA Mastery Model',
    titleBn: 'সিঙ্গাপুর সিপিএ (CPA) মাস্টারি মডেল',
    tradition: 'Global STEM & Synthesis',
    origin: 'Singapore Math & Science',
    originBn: 'সিঙ্গাপুর শিক্ষাক্রম',
    subtitle: 'Concrete → Pictorial → Abstract progression for STEM intuition.',
    subtitleBn: 'বাস্তব উদাহরণ → চিত্র/মডেল → বিমূর্ত সমীকরণ ধাপ।',
    summary:
      'Internationally famous for producing top quantitative problem-solvers. Forces visual modeling before symbolic manipulation.',
    summaryBn:
      'গণিত ও বিজ্ঞানে বিশ্বসেরা ফলাফলের পেছনের পদ্ধতি—অঙ্ক দেখেই মুখস্থ সূত্রে না গিয়ে আগে চিত্র এঁকে যুক্তি স্পষ্ট করা।',
    defaultMinutes: 45,
    steps: [
      'Concrete: Ground the concept in a physical measurement or real lab observation.',
      'Pictorial: Sketch bar models, free-body diagrams, or reaction pathways first.',
      'Abstract: Translate your sketch cleanly into equations and verify units.',
    ],
    stepsBn: [
      'বাস্তব ধাপ: পরিমাণ বা ল্যাব পর্যবেক্ষণ দিয়ে বিষয়টির মূল রূপ বুঝুন।',
      'চিত্র ধাপ: বার-মডেল, ফ্রি-বডি ডায়াগ্রাম বা বিক্রিয়া পথ আগে খাতায় আঁকুন।',
      'বিমূর্ত ধাপ: চিত্র দেখে সমীকরণ তৈরি করে সমাধান করুন ও একক যাচাই করুন।',
    ],
    bestFor: 'Word problems, mechanics, stoichiometry, and thermodynamics.',
    bestForBn: 'পদার্থ, রসায়ন ও জটিল কথার অঙ্ক নির্ভুলভাবে সমাধান।',
    coverColor: '#1B1B1F',
    spineColor: '#E2E8F0',
    textColor: '#FAFAFA',
  },
  {
    id: 'russian-olympiad',
    title: 'Russian Olympiad Proof Sheet',
    titleBn: 'রাশিয়ান অলিম্পিয়াড প্রুফ-শিট মেথড',
    tradition: 'Global STEM & Synthesis',
    origin: 'Moscow / Eastern European',
    originBn: 'মস্কো / পূর্ব ইউরোপীয় ধারা',
    subtitle: 'Minimal hints, derivation-first mastery & invariant hunting.',
    subtitleBn: 'হিন্টস ছাড়া নিজে প্রমাণ বের করা এবং মূল নিয়ম খুঁজে বের করা।',
    summary:
      'Built on graded problem sheets (Listki) where students derive core theorems themselves and verify limiting cases instead of reading solved examples.',
    summaryBn:
      'সমাধান করা উদাহরণ মুখস্থ না করে নিজে প্রমাণ ও সীমাবদ্ধ ক্ষেত্র যাচাই করে শেখার অলিম্পিয়াড পদ্ধতি।',
    defaultMinutes: 60,
    steps: [
      'Close the solution manual completely; spend at least 15 quiet minutes wrestling with one problem.',
      'Test extreme/boundary cases (x → 0, x → ∞, T → 0) to verify your formula.',
      'Write a clean, step-by-step formal derivation from first principles.',
    ],
    stepsBn: [
      'গাইড বা সমাধান বই বন্ধ রেখে একটি কঠিন সমস্যায় অন্তত ১৫ মিনিট নিজে চিন্তা করুন।',
      'সূত্রের সীমা যাচাই করুন (যেমন মান ০ বা অসীম হলে কী হয়)।',
      'প্রথম নীতি থেকে পরিষ্কার ধাপে ধাপে পুরো প্রমাণটি খাতায় লিখুন।',
    ],
    bestFor: 'Olympiads, calculus proofs, organic mechanisms, and hard exams.',
    bestForBn: 'অলিম্পিয়াড, ক্যালকুলাস ও কঠিন ভর্তি পরীক্ষার প্রস্তুতি।',
    coverColor: '#141414',
    spineColor: '#FFFFFF',
    textColor: '#FAFAFA',
  },
  {
    id: 'nalanda-synthesis',
    title: 'Nalanda Shabda-Manana Debate',
    titleBn: 'নালন্দা শব্দ-মনন ও তর্ক পদ্ধতি',
    tradition: 'Global STEM & Synthesis',
    origin: 'Ancient South Asian Tradition',
    originBn: 'প্রাচীন নালন্দা ঐতিহ্য',
    subtitle: 'Listen/Read (Shravana), Question (Manana) & Teach aloud.',
    subtitleBn: 'গভীর শ্রবণ, যুক্তিতর্কে যাচাই এবং স্পষ্ট উচ্চারণে উপস্থাপন।',
    summary:
      'Classical Asian scholarly rigor built on three pillars: attentive absorption, ruthless counter-questioning, and crystallized oral articulation.',
    summaryBn:
      'প্রাচীন এশীয় বিদ্যাপীঠের তিন স্তম্ভ—মনোযোগে গ্রহণ (শ্রবণ), নিজের সাথে যুক্তিতর্কে যাচাই (মনন) এবং অন্যকে বোঝানোর মতো স্পষ্ট প্রকাশ।',
    defaultMinutes: 35,
    steps: [
      'Shravana: Read or listen through one compact section once with zero interruptions.',
      'Manana: Cross-examine every claim with counterexamples until no ambiguity remains.',
      'Vyakhyana: Deliver a crisp 5-minute spoken explanation without glancing at notes.',
    ],
    stepsBn: [
      'শ্রবণ: কোনো বিরতি ছাড়া একটি নির্দিষ্ট অংশ গভীর মনোযোগে শেষ করুন।',
      'মনন: প্রতিটি যুক্তিকে পাল্টা প্রশ্ন করে যাচাই করুন যতক্ষণ না সব স্পষ্ট হয়।',
      'ব্যাখ্যান: নোট না দেখে ৫ মিনিটে মূল বক্তব্য স্পষ্টভাবে মুখে উপস্থাপন করুন।',
    ],
    bestFor: 'Philosophy, humanities, viva exams, and deep retention.',
    bestForBn: 'দর্শন, সাহিত্য, ভাইভা ও দীর্ঘস্থায়ী স্মৃতিশক্তি।',
    coverColor: '#202024',
    spineColor: '#D4D4D4',
    textColor: '#FAFAFA',
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

  const [startH, startM] = startTime.split(':').map((n) => Number(n) || 0);
  let currentMinuteCursor = startH * 60 + startM;
  const formatClock = (mins: number) => {
    const wrapped = ((mins % 1440) + 1440) % 1440;
    const h = String(Math.floor(wrapped / 60)).padStart(2, '0');
    const m = String(wrapped % 60).padStart(2, '0');
    return `${h}:${m}`;
  };

  // Split 75+ min allocations into 2 smart sprints with an active break
  const expandedAllocations: Array<SubjectAllocation & { sprintLabel?: string; sprintLabelBn?: string }> = [];
  for (const alloc of validAllocations) {
    if (alloc.minutes >= 75) {
      const firstHalf = Math.ceil(alloc.minutes / 2);
      const secondHalf = alloc.minutes - firstHalf;
      expandedAllocations.push({
        ...alloc,
        minutes: firstHalf,
        sprintLabel: 'Sprint 1 (Core)',
        sprintLabelBn: 'স্প্রিন্ট ১ (মূল অংশ)',
      });
      expandedAllocations.push({
        ...alloc,
        minutes: secondHalf,
        sprintLabel: 'Sprint 2 (Recall & Drills)',
        sprintLabelBn: 'স্প্রিন্ট ২ (রিকল ও অনুশীলন)',
      });
    } else {
      expandedAllocations.push(alloc);
    }
  }

  const dailyPlan: RoutineBlock[] = expandedAllocations.map((alloc, idx) => {
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

    const objectiveBase =
      alloc.difficulty === 'problem-solving'
        ? `Complete timed problem tiers & log slips in Machigai Error Note`
        : alloc.difficulty === 'memorization'
        ? `Encode core definitions & run closed-book Baekji blank-sheet recall`
        : `Map first principles & simplify core concepts via Feynman check`;

    const objectiveBaseBn =
      alloc.difficulty === 'problem-solving'
        ? `টাইম ধরে প্রবলেম সলভ করুন এবং ভুলগুলো মাচিগাই নোটে লিখে রাখুন`
        : alloc.difficulty === 'memorization'
        ? `মূল তথ্য আয়ত্ত করে বই বন্ধ করে বেকজি সাদা কাগজে মুখস্থ রিকল দিন`
        : `মূল ধারণাগুলো ফাইনম্যান পদ্ধতিতে সহজ ভাষায় সাজিয়ে নিন`;

    const objective = alloc.sprintLabel
      ? `${alloc.sprintLabel}: ${objectiveBase}`
      : objectiveBase;
    const objectiveBn = alloc.sprintLabelBn
      ? `${alloc.sprintLabelBn}: ${objectiveBaseBn}`
      : objectiveBaseBn;

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

export const INITIAL_SAVED_ROUTINE: GeneratedRoutine = {
  id: 'routine-seed-default',
  createdAt: new Date().toISOString(),
  ...assembleSmartRoutine(
    [
      { id: 'sub-1', subject: 'Chemistry', minutes: 60, difficulty: 'problem-solving' },
      { id: 'sub-2', subject: 'Linear Algebra', minutes: 45, difficulty: 'conceptual' },
      { id: 'sub-3', subject: 'Biology / Theory', minutes: 35, difficulty: 'memorization' },
    ],
    ['forgetting', 'procrastination'],
    '',
    'en',
    '18:00'
  ),
};

const today = new Date();
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
