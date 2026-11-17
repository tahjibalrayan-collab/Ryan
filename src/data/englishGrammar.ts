export type GrammarSectionId =
  | 'parts-of-speech'
  | 'verbals'
  | 'tenses'
  | 'clauses'
  | 'voice'
  | 'narration'
  | 'transformation'
  | 'agreement-punctuation';

export interface GrammarSubtype {
  name: string;
  definition: string;
  examples: string[];
}

export interface GrammarTopic {
  id: string;
  section: GrammarSectionId;
  sectionLabel: string;
  title: string;
  definition: string;
  structureFormula?: string;
  subtypes: GrammarSubtype[];
  goldenRules: string[];
  commonMistake?: {
    wrong: string;
    right: string;
    why: string;
  };
}

export const GRAMMAR_SECTIONS: Array<{ id: 'all' | GrammarSectionId; label: string }> = [
  { id: 'all', label: 'All Topics' },
  { id: 'parts-of-speech', label: 'Parts of Speech' },
  { id: 'verbals', label: 'Gerund, Participle & Infinitive' },
  { id: 'tenses', label: 'Tenses & Conditionals' },
  { id: 'clauses', label: 'Clauses & Phrases' },
  { id: 'voice', label: 'Active & Passive Voice' },
  { id: 'narration', label: 'Narration (Speech)' },
  { id: 'transformation', label: 'Sentence Transformation' },
  { id: 'agreement-punctuation', label: 'Agreement & Punctuation' },
];

export const ENGLISH_GRAMMAR_ENCYCLOPEDIA: GrammarTopic[] = [
  {
    id: 'noun',
    section: 'parts-of-speech',
    sectionLabel: 'Parts of Speech',
    title: '1. Noun (All 10 Types & Properties)',
    definition:
      'A noun is a naming word that identifies a person, place, physical object, living creature, substance, quality, state, or abstract idea.',
    subtypes: [
      {
        name: 'Proper Noun',
        definition: 'Specific capitalized name of an individual person, city, country, brand, or day.',
        examples: ['Dhaka, Al Tahjib Noor Raiyan, Monday, Atlantic Ocean'],
      },
      {
        name: 'Common Noun',
        definition: 'General name shared by every member of a class or kind.',
        examples: ['student, textbook, city, river, scientist'],
      },
      {
        name: 'Collective Noun',
        definition: 'Names a group of individuals treated as one unit (takes singular verb when acting together, plural when divided).',
        examples: ['jury, committee, flock, fleet, audience, team'],
      },
      {
        name: 'Abstract Noun',
        definition: 'Names intangible qualities, states, emotions, or actions that cannot be touched.',
        examples: ['courage, honesty, entropy, wisdom, childhood, freedom'],
      },
      {
        name: 'Material Noun',
        definition: 'Names raw substances or matter from which objects are made (usually uncountable, no article a/an).',
        examples: ['gold, water, iron, cotton, oxygen, marble'],
      },
      {
        name: 'Countable & Uncountable Noun',
        definition: 'Countable nouns have plural forms (books, stars); uncountable nouns cannot be counted directly (information, furniture, advice).',
        examples: ['Countable: three essays | Uncountable: much advice, a piece of information'],
      },
      {
        name: 'Compound & Possessive Noun',
        definition: 'Multiple words functioning as one noun (textbook, mother-in-law) or showing ownership (student’s notes).',
        examples: ['commander-in-chief, passers-by, Raiyan’s Archive'],
      },
    ],
    goldenRules: [
      'Nouns like scenery, machinery, furniture, information, luggage, bread, poetry are strictly uncountable — never add -s or a/an.',
      'Plural-looking nouns like physics, mathematics, news, innings, measles take SINGULAR verbs.',
      'Nouns denoting pairs (scissors, trousers, spectacles) take PLURAL verbs unless preceded by "a pair of".',
    ],
    commonMistake: {
      wrong: 'He gave me many informations and advices.',
      right: 'He gave me much information and a piece of advice.',
      why: 'Information and advice are uncountable in standard English.',
    },
  },
  {
    id: 'pronoun',
    section: 'parts-of-speech',
    sectionLabel: 'Parts of Speech',
    title: '2. Pronoun (All 9 Classifications)',
    definition:
      'A pronoun substitutes for a noun or noun phrase to prevent awkward repetition and maintain cohesion.',
    structureFormula: 'Order for multiple pronouns: 2nd Person → 3rd → 1st (231 for good news; 123 for confession)',
    subtypes: [
      {
        name: 'Personal Pronouns',
        definition: 'Represent speakers/subjects/objects across Subjective (I, he, they) & Objective (me, him, them) cases.',
        examples: ['You, he, and I studied together. / Give the book to him and me.'],
      },
      {
        name: 'Possessive & Reflexive/Intensive',
        definition: 'Possessive pronouns replace noun ownership (mine, yours, theirs). Reflexive ends in -self/-selves when subject = object.',
        examples: ['The archive is mine. / She taught herself calculus. (Intensive: The dean himself attended.)'],
      },
      {
        name: 'Relative Pronouns (who, whom, whose, which, that)',
        definition: 'Connects a dependent relative clause to its antecedent noun.',
        examples: ['Who → subject; Whom → object; Which → things; That → people/things in essential clauses'],
      },
      {
        name: 'Demonstrative, Interrogative & Indefinite',
        definition: 'Point out (this, those), ask questions (who, what), or refer generally (each, everyone, none, few).',
        examples: ['Each of the students has finished. / These notes are clearer than those.'],
      },
      {
        name: 'Reciprocal & Distributive',
        definition: 'Each other (two), one another (more than two); each, either, neither (always singular verb).',
        examples: ['The two partners helped each other. / Neither of the plans is risky.'],
      },
    ],
    goldenRules: [
      'Use subjective pronouns (I, he, she, they) after "It is/was" and after "than/as" when comparing subjects.',
      'Use objective pronouns (me, him, her, us) immediately after prepositions like between, except, let, and for.',
      'Indefinite pronouns (each, every, everyone, somebody, neither) always require singular verbs and singular pronouns.',
    ],
    commonMistake: {
      wrong: 'Between you and I, the exam was hard.',
      right: 'Between you and me, the exam was hard.',
      why: '"Between" is a preposition and governs the objective case ("me").',
    },
  },
  {
    id: 'verb-classification',
    section: 'parts-of-speech',
    sectionLabel: 'Parts of Speech',
    title: '3. Verbs (Transitive, Intransitive, Linking, Auxiliary & Modals)',
    definition:
      'A verb expresses an action, state of being, or occurrence, and determines the predicate structure of every English sentence.',
    subtypes: [
      {
        name: 'Transitive vs Intransitive Verbs',
        definition: 'Transitive verbs transfer action to a Direct Object; intransitive verbs stand complete without an object.',
        examples: ['Transitive: She solved the equation. / Intransitive: Birds fly high.'],
      },
      {
        name: 'Linking (Copular) Verbs',
        definition: 'Connects the subject to a Subject Complement (adjective or noun) describing state — never takes an adverb after it.',
        examples: ['be, seem, appear, become, look, smell, taste ("The soup tastes delicious.")'],
      },
      {
        name: 'Primary & Modal Auxiliaries',
        definition: 'Primary (be, do, have) form tenses/passives; Modals (can, could, may, might, must, shall, should, will, would, ought to) express necessity/ability.',
        examples: ['You must revise Day 4 notes. / Might it rain tonight?'],
      },
      {
        name: 'Causative Verbs (make, have, get, let, help)',
        definition: 'Indicates a subject causing someone else to perform an action.',
        examples: ['make/let + Obj + V1 | get + Obj + to V1 (person) | have/get + Obj + V3 (thing repaired)'],
      },
    ],
    goldenRules: [
      'After every modal auxiliary (can, should, must, will), always use the bare base verb V1 — never "to + V1" or "-s/-ed".',
      'Linking verbs take adjectives, not adverbs: say "He feels bad", not "He feels badly".',
      'Had better + V1 (bare infinitive) expresses strong recommendation.',
    ],
  },
  {
    id: 'verbals-nonfinite',
    section: 'verbals',
    sectionLabel: 'Gerund, Participle & Infinitive',
    title: '4. Gerunds, Participles & Infinitives (Non-Finite Verbals)',
    definition:
      'Non-finite verbs do not change with tense or subject number; instead they function inside a sentence as nouns, adjectives, or adverbs.',
    structureFormula: 'Gerund = V+ing (Noun)  |  Participle = V+ing / V3 / Having+V3 (Adjective)  |  Infinitive = to + V1',
    subtypes: [
      {
        name: 'Gerund (Verbal Noun)',
        definition: 'Ends in -ing and acts strictly as a Noun (Subject, Object, Object of Preposition). Possessives precede gerunds!',
        examples: ['Reading deepens focus. / I appreciate YOUR helping me. / Avoid making noise.'],
      },
      {
        name: 'Present, Past & Perfect Participles (Verbal Adjectives)',
        definition: 'Modify nouns/pronouns. Present (-ing) denotes active ongoing state; Past (V3) passive completed state; Perfect (Having + V3) prior action.',
        examples: ['a rolling stone (Present) | a broken glass (Past) | Having finished work, he slept (Perfect).'],
      },
      {
        name: 'Full & Bare Infinitives',
        definition: 'to + V1 functions as noun, adjective, or adverb of purpose. Bare infinitives omit "to" after modals, let, make, see, hear, had better.',
        examples: ['To err is human. / Let him speak freely. / With a view to improving (takes V+ing!).'],
      },
    ],
    goldenRules: [
      'Phrases ending in "to" that are PREPOSITIONS take Gerund (V+ing): look forward to meeting, with a view to solving, used to waking, addicted to reading.',
      'Verbs like enjoy, avoid, mind, finish, suggest, deny, admit, keep are always followed by a Gerund (V+ing), not an infinitive.',
      'Ensure participial phrases attach to the true logical subject to prevent dangling modifiers.',
    ],
    commonMistake: {
      wrong: 'I look forward to hear from you soon.',
      right: 'I look forward to hearing from you soon.',
      why: '"to" inside "look forward to" is a preposition, which requires a noun/gerund (-ing).',
    },
  },
  {
    id: 'adjectives',
    section: 'parts-of-speech',
    sectionLabel: 'Parts of Speech',
    title: '5. Adjectives, OSASCOMP Order & Degrees of Comparison',
    definition:
      'An adjective modifies or describes a noun or pronoun by specifying quality, quantity, number, identity, or degree.',
    structureFormula: 'OSASCOMP Order: Opinion → Size → Age → Shape → Color → Origin → Material → Purpose + Noun',
    subtypes: [
      {
        name: 'Descriptive, Quantitative & Numeral',
        definition: 'Describe attributes (brilliant), uncountable quantity (much, little), or countable numbers (many, few, two).',
        examples: ['a brilliant student, little time left, few errors'],
      },
      {
        name: 'Positive, Comparative & Superlative',
        definition: 'Positive compares equals (as...as); Comparative compares two (-er / more); Superlative compares 3+ (the -est / the most).',
        examples: ['tall / taller than / the tallest of all | good / better / best'],
      },
      {
        name: 'Latin Comparatives ending in -ior',
        definition: 'Senior, junior, superior, inferior, prior, prefer ALWAYS take "to", never "than".',
        examples: ['He is senior to me by three years. / I prefer physics to idle scrolling.'],
      },
    ],
    goldenRules: [
      'Never use double comparatives or superlatives (e.g., never "more better" or "most tallest").',
      'In parallel comparison ("The + comparative..., the + comparative..."): "The higher you climb, the colder it gets."',
      'Use "fewer" for countable nouns and "less" for uncountable quantities.',
    ],
  },
  {
    id: 'adverbs-prepositions-conjunctions',
    section: 'parts-of-speech',
    sectionLabel: 'Parts of Speech',
    title: '6. Adverbs, Prepositions, Conjunctions & Interjections',
    definition:
      'Connecting and modifying word classes that supply manner, time, place, logical relationship, and emotion.',
    structureFormula: 'Adverb Order (MPT): Manner → Place → Time  |  Correlative Pairs: Not only...but also, Scarcely...when',
    subtypes: [
      {
        name: 'Adverbs (Manner, Time, Place, Frequency, Degree)',
        definition: 'Modify verbs, adjectives, or other adverbs. Negative adverbs at start trigger subject-verb inversion.',
        examples: ['She answered calmly at school yesterday. / Seldom have I seen such precision.'],
      },
      {
        name: 'Prepositions (Time, Place, Direction, Appropriate Pairs)',
        definition: 'at = exact point; on = surface/day/date; in = enclosed space/month/year; since = point of time; for = duration.',
        examples: ['at 6:00 AM, on Monday, in November | abide by, comply with, proficient in, consist of'],
      },
      {
        name: 'Conjunctions (Coordinating FANBOYS, Subordinating, Correlative)',
        definition: 'FANBOYS (For, And, Nor, But, Or, Yet, So); Subordinating (although, because, lest...should, unless); Correlative pairs.',
        examples: ['No sooner had I arrived than it rained. / Walk carefully lest you should fall.'],
      },
      {
        name: 'Interjections & Articles (a, an, the)',
        definition: 'Interjections express sudden feeling (Alas!, Bravo!). Articles track vowel SOUND ("an hour", "a university", "an M.A.").',
        examples: ['An honest scientist (silent h = vowel sound) | A European tour (starts with "yu" consonant sound)'],
      },
    ],
    goldenRules: [
      'Use "a/an" strictly by initial pronunciation SOUND, not spelling letter.',
      'Pair correlative conjunctions accurately: No sooner...than, Hardly/Scarcely...when, Neither...nor, Both...and.',
      '"Unless" and "Lest" already carry negative meaning — never add "not" inside their clause.',
    ],
  },
  {
    id: 'tenses-conditionals',
    section: 'tenses',
    sectionLabel: 'Tenses & Conditionals',
    title: '7. Complete 12 Tenses & All 4 Conditionals',
    definition:
      'Tense locates an action in Past, Present, or Future time while showing its aspect (Simple, Continuous, Perfect, Perfect Continuous).',
    structureFormula: 'Simple / Continuous (be + V-ing) / Perfect (have + V3) / Perfect Cont. (have been + V-ing)',
    subtypes: [
      {
        name: 'Present Group (4 Forms)',
        definition: 'Simple (V1/s: habit/universal truth), Continuous (am/is/are+V-ing: right now), Perfect (has/have+V3: just finished/yet/already), Perf. Cont. (has/have been+V-ing + since/for).',
        examples: ['The Earth orbits the Sun. / I have studied thermodynamics since 8 AM.'],
      },
      {
        name: 'Past Group (4 Forms)',
        definition: 'Simple (V2: finished past), Continuous (was/were+V-ing), Past Perfect (had+V3: earlier of two past events), Past Perf. Cont. (had been+V-ing).',
        examples: ['The train had left BEFORE we reached the station.'],
      },
      {
        name: 'Future Group (4 Forms)',
        definition: 'Simple (will+V1), Continuous (will be+V-ing), Future Perfect (will have+V3 by a deadline), Future Perf. Cont. (will have been+V-ing).',
        examples: ['By Friday, I will have completed Chapter 5.'],
      },
      {
        name: 'Zero, 1st, 2nd, 3rd & Mixed Conditionals',
        definition: 'Zero (facts: Pres/Pres); 1st (real future: If + V1, will+V1); 2nd (unreal present: If + were/V2, would+V1); 3rd (unreal past: If + had+V3, would have+V3).',
        examples: ['If I had studied earlier, I would have topped. / Had I known, I would have helped.'],
      },
    ],
    goldenRules: [
      'After "It is high time / It is time + Subject", always use Past Simple V2 (e.g., "It is high time we started revising").',
      'If two actions happened in the past, the earlier action takes Past Perfect (had + V3) and the later takes Past Simple (V2).',
      'Never use "will" inside an "if", "when", or "until" future conditional clause — use Present Simple instead.',
    ],
  },
  {
    id: 'clauses-phrases',
    section: 'clauses',
    sectionLabel: 'Clauses & Phrases',
    title: '8. Clauses (Noun, Adjective, Adverbial) & Phrases',
    definition:
      'A phrase is a group of words without a finite subject-verb pair; a clause contains both a Subject and a Finite Verb.',
    structureFormula: 'Simple (1 IC)  |  Compound (IC + FANBOYS + IC)  |  Complex (IC + Subordinator + DC)',
    subtypes: [
      {
        name: 'Noun Clause',
        definition: 'Dependent clause acting as Subject, Object, or Complement (answers "What?").',
        examples: ['What he discovered amazed the laboratory. / I know that focus beats speed.'],
      },
      {
        name: 'Adjective (Relative) Clause',
        definition: 'Modifies a noun/pronoun immediately preceding it, introduced by who, which, that, whose, where, when.',
        examples: ['The book that lies on the shelf is mine. (Non-defining uses commas + who/which, never "that")'],
      },
      {
        name: 'Adverbial Clause',
        definition: 'Modifies a verb/adjective/adverb expressing time, reason, concession, condition, purpose, or comparison.',
        examples: ['Although the chapter was dense, he mastered it completely.'],
      },
    ],
    goldenRules: [
      'Non-defining (extra info) relative clauses require commas on both sides and cannot use "that".',
      'Prepositional, Participial, Infinitive, and Appositive phrases add precision when placed right next to the word they modify.',
    ],
  },
  {
    id: 'voice-active-passive',
    section: 'voice',
    sectionLabel: 'Active & Passive Voice',
    title: '9. Voice (Active ↔ Passive Conversion Blueprint)',
    definition:
      'Active voice highlights the doer (Subject → Verb → Object); Passive voice shifts focus onto the receiver of the action (Object + "be" + V3 + by Subject).',
    structureFormula: 'Passive Formula = New Subject + [Appropriate "be" tense] + Past Participle (V3) + (by Agent)',
    subtypes: [
      {
        name: 'Continuous & Perfect Passive Rules',
        definition: 'Continuous uses "being + V3"; Perfect uses "been + V3"; Modals use "modal + be + V3".',
        examples: ['He is writing notes → Notes are being written by him. / She solved it → It was solved by her.'],
      },
      {
        name: 'Imperative & Interrogative Passives',
        definition: 'Imperative orders: "Let + Object + be + V3"; Requests: "You are requested to + V1". Wh-questions keep Wh-word first.',
        examples: ['Open the book → Let the book be opened. / Who wrote this? → By whom was this written?'],
      },
      {
        name: 'Special Prepositions & Quasi-Passive',
        definition: 'Some verbs take specific prepositions instead of "by": known to, pleased with, amazed at, satisfied with, filled with.',
        examples: ['Honey tastes sweet → Honey is sweet when it is tasted. / He is known to me.'],
      },
    ],
    goldenRules: [
      'Intransitive verbs (sleep, arrive, happen, die, go) have NO object and CANNOT form a passive voice.',
      'In double-object passives ("gave me a book"), either object may become subject while the other remains as a retained object.',
    ],
  },
  {
    id: 'narration-speech',
    section: 'narration',
    sectionLabel: 'Narration (Speech)',
    title: '10. Narration (Direct & Indirect Speech Rules)',
    definition:
      'Direct speech quotes the speaker’s exact words inside quotation marks; Indirect (Reported) speech conveys the message grammatically without quotes.',
    structureFormula: 'Past Reporting Verb shifts tense: V1→V2 | V2→had+V3 | will→would | can→could | may→might',
    subtypes: [
      {
        name: 'Pronoun & Time/Place Distance Shifts',
        definition: 'SON Rule: 1st person → Speaker; 2nd → Listener; 3rd → No change. Time shifts: now→then, today→that day, yesterday→the previous day, tomorrow→the next day, here→there, this→that.',
        examples: ['He said, "I finished it yesterday." → He said that he had finished it the previous day.'],
      },
      {
        name: 'Interrogative, Imperative, Optative & Exclamatory',
        definition: 'Yes/No Qs use if/whether (Statement order: Subject BEFORE Verb!). Commands use ordered/advised + to+V1. Exclamations use exclaimed with joy/sorrow.',
        examples: ['She asked me, "Where do you live?" → She asked me where I lived. (NOT "where did I live")'],
      },
    ],
    goldenRules: [
      'Universal truths, scientific facts, and habitual facts NEVER change tense in indirect speech ("Galileo proved that the Earth moves round the Sun").',
      'Inside indirect questions, ALWAYS switch from question word order to assertive word order (Subject + Verb) and end with a full stop, never "?".',
    ],
  },
  {
    id: 'transformation-sentences',
    section: 'transformation',
    sectionLabel: 'Sentence Transformation',
    title: '11. Transformation of Sentences (Meaning-Preserving Conversion)',
    definition:
      'Converting the grammatical structure of a sentence (Simple, Complex, Compound, Assertive, Affirmative/Negative, Degree) without changing its core meaning.',
    subtypes: [
      {
        name: 'Simple ↔ Complex ↔ Compound Map',
        definition: 'In spite of + Noun/V-ing (Simple) ↔ Though/Although (Complex) ↔ ...but... (Compound). By + V-ing ↔ If (Affirmative) ↔ ...and.... Without + V-ing ↔ Unless ↔ ...or....',
        examples: ['Simple: In spite of poverty, he is honest. | Complex: Although he is poor, he is honest. | Compound: He is poor, but he is honest.'],
      },
      {
        name: 'Too...to ↔ So...that',
        definition: 'Replaces "too + adj + to + V1" with "so + adj + that + Subject + cannot/could not + V1".',
        examples: ['He is too tired to walk → He is so tired that he cannot walk.'],
      },
      {
        name: 'Affirmative ↔ Negative & Assertive ↔ Exclamatory',
        definition: 'Only/Alone (person) → None but; Every → There is no...but; Must → Cannot but / cannot help + V-ing.',
        examples: ['Assertive: It is a very calm night. ↔ Exclamatory: What a calm night it is!'],
      },
    ],
    goldenRules: [
      'Meaning must remain 100% identical during Transformation (unlike Conversion where polarity can flip).',
      'Watch tense matching in Complex "so...that": present requires "cannot", past requires "could not".',
    ],
  },
  {
    id: 'agreement-punctuation',
    section: 'agreement-punctuation',
    sectionLabel: 'Agreement & Punctuation',
    title: '12. Subject-Verb Agreement & Complete Punctuation Guide',
    definition:
      'Essential mechanics governing how subjects match verbs in number/person and how punctuation marks clarify pauses, boundaries, and possession.',
    subtypes: [
      {
        name: 'Top Subject-Verb Agreement Rules',
        definition: '1) Along with/together with/as well as → agrees with FIRST subject. 2) Either...or / Neither...nor → agrees with NEARER subject. 3) A number of + Plural Noun → Plural verb; The number of → Singular verb.',
        examples: ['The captain, along with his teammates, WAS praised. / Neither the notes nor the book IS missing.'],
      },
      {
        name: 'Comma (,), Semicolon (;), Colon (:) & Em-Dash (—)',
        definition: 'Semicolon joins two closely related independent clauses without FANBOYS. Colon introduces a list or explanation after an independent clause.',
        examples: ['Study hard; results follow. / Bring three items: a notebook, a pen, and focus.'],
      },
      {
        name: 'Apostrophe (’)',
        definition: 'Shows possession (Raiyan’s desk; students’ library) or contraction (it’s = it is). Never use an apostrophe for possessive pronoun "its" or regular plurals.',
        examples: ['The dog wagged its tail. (Possessive) | It’s raining. (It is)'],
      },
    ],
    goldenRules: [
      'Never join two independent clauses with only a comma (Comma Splice) — use a semicolon, period, or comma + FANBOYS.',
      'Distances, weights, sums of money, and periods of time taken as a single unit require a SINGULAR verb ("Fifty miles is a long drive").',
    ],
  },
];
