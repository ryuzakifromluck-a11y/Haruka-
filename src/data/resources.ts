import { tr } from "@/i18n";

export type ResourceCategory = "official" | "third-party";

export interface Resource {
  id: string;
  category: ResourceCategory;
  name: string;
  provider: string;
  testType: string;
  access: "Free" | "Paid" | "Free (some paid options)";
  registration: string; // human-readable, "Unknown" when not known
  registrationRequired: boolean | null;
  url: string;
  cta: string;
  description: string;
  details: string[];
  note?: string;
}

export const RESOURCES: Resource[] = [
  {
    id: "bluebook",
    category: "official",
    name: "Bluebook — Official Full-Length Digital SAT Tests",
    provider: "College Board",
    testType: "Full-length adaptive digital SAT practice tests",
    access: "Free",
    registration: "College Board account required (sign in inside the Bluebook app)",
    registrationRequired: true,
    url: "https://bluebook.collegeboard.org/students/practice",
    cta: "Open Bluebook",
    description: "Official full-length digital SAT practice tests with the real testing interface and scored results.",
    details: [
      "Uses the same app, tools (Desmos, annotator, reference sheet), and adaptive modules as the real SAT.",
      "Scores and answer explanations appear afterwards in My Practice.",
      "Also includes a short test preview to explore the interface.",
    ],
    note: "The Bluebook application must be installed on your laptop or tablet. Tests are taken inside Bluebook — not on this website.",
  },
  {
    id: "question-bank",
    category: "official",
    name: "College Board Student Question Bank",
    provider: "College Board",
    testType: "Searchable bank of individual official SAT questions",
    access: "Free",
    registration: "No account required",
    registrationRequired: false,
    url: "https://satsuitequestionbank.collegeboard.org/",
    cta: "Open Question Bank",
    description: "Thousands of official SAT questions you can filter to practise exactly the skills you need.",
    details: [
      "Filter by test section: Reading & Writing or Math.",
      "Filter by domain and by skill.",
      "Filter by difficulty: easy, medium, or hard.",
      "Each question includes the correct answer and a rationale.",
    ],
  },
  {
    id: "my-practice",
    category: "official",
    name: "College Board My Practice",
    provider: "College Board",
    testType: "Score reports and review for Bluebook practice tests",
    access: "Free",
    registration: "College Board account required",
    registrationRequired: true,
    url: "https://mypractice.collegeboard.org/",
    cta: "Open My Practice",
    description: "Review completed practice test scores, answers, explanations, and personalized practice recommendations.",
    details: [
      "See your score for each Bluebook practice test you have completed.",
      "Review every question with answer explanations.",
      "Get skill-level insights and recommended practice.",
    ],
  },
  {
    id: "khan",
    category: "official",
    name: "Official Digital SAT Prep — Khan Academy",
    provider: "Khan Academy (in collaboration with College Board)",
    testType: "Lessons, videos, and skill practice",
    access: "Free",
    registration: "Free account recommended to save progress",
    registrationRequired: false,
    url: "https://www.khanacademy.org/digital-sat",
    cta: "Open Khan Academy",
    description: "Free official SAT preparation developed in collaboration with College Board.",
    details: ["Lessons and videos for every skill.", "Practice exercises with hints.", "Skill-based learning that adapts to your level."],
  },
  {
    id: "paper",
    category: "official",
    name: "Official Paper Practice Tests",
    provider: "College Board",
    testType: "Nonadaptive printable (PDF) practice tests",
    access: "Free",
    registration: "No account required",
    registrationRequired: false,
    url: "https://satsuite.collegeboard.org/practice/practice-tests/paper",
    cta: "Open paper tests",
    description: "Printable, nonadaptive versions of the SAT practice tests with answer explanations and scoring guides.",
    details: ["Primarily intended for students who will test on paper with approved accommodations.", "Nonadaptive, so the experience differs from the digital SAT."],
    note: "For regular digital-SAT preparation, Bluebook is the better simulation. Paper tests are nonadaptive and mainly for students with paper-based testing accommodations.",
  },
  {
    id: "princeton",
    category: "third-party",
    name: "Princeton Review — Free Digital SAT Practice Test",
    provider: "The Princeton Review",
    testType: "Full-length digital SAT simulation",
    access: "Free (some paid options)",
    registration: "Free account required",
    registrationRequired: true,
    url: "https://www.princetonreview.com/college/free-digitalsat-practice-test",
    cta: "Open Princeton Review",
    description: "Digital SAT simulation with timed modules, adaptive practice, and performance feedback.",
    details: ["Timed modules similar to the digital SAT.", "Score report with performance feedback.", "Paid courses are offered — the practice test itself is free."],
  },
  {
    id: "kaplan",
    category: "third-party",
    name: "Kaplan Test Prep — Free SAT Practice",
    provider: "Kaplan",
    testType: "Free digital SAT practice test",
    access: "Free (some paid options)",
    registration: "Registration may be required",
    registrationRequired: null,
    url: "https://www.kaptest.com/sat/free/sat-practice",
    cta: "Open Kaplan",
    description: "Free digital SAT practice test, performance report, and additional practice materials.",
    details: ["Performance report after the test.", "Additional free practice resources and events.", "Paid courses are offered separately."],
  },
];

export interface Provider {
  id: string;
  name: string;
  official: boolean;
}

/** Providers available when entering a test result. */
/** Provider names follow the interface language. */
function provider(id: string, key: "bluebook" | "paper" | "princeton" | "kaplan" | "otherProvider", official: boolean): Provider {
  return { id, official, get name() { return tr(`progress.providers.${key}`); } };
}

export const PROVIDERS: Provider[] = [
  provider("bluebook", "bluebook", true),
  provider("paper", "paper", true),
  provider("princeton", "princeton", false),
  provider("kaplan", "kaplan", false),
  provider("other", "otherProvider", false),
];

export const PROVIDER_BY_ID: Record<string, Provider> = Object.fromEntries(PROVIDERS.map((p) => [p.id, p]));
