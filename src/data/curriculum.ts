// The default 20-week plan for Haruka. Days and tasks are generated from this in lib/plan.ts.

export interface TopicItem {
  label: string;
  ref?: string; // id of an in-app math topic or R&W skill
}

export interface DayOverride {
  title: string;
  blocks: { title: string; objective: string; assignment: string; minutes: number; kind: "math" | "rw" | "timed" | "review"; link?: { href: string; label: string; external?: boolean } }[];
}

export interface WeekPlan {
  week: number;
  month: number;
  monthTitle: string;
  title: string;
  objectives: string[];
  math: TopicItem[];
  rw: TopicItem[];
  practice: string[];
  assessment: string;
  /** Optional per-day overrides (index 0 = day 1). */
  days?: (DayOverride | undefined)[];
}

const BLUEBOOK = "https://bluebook.collegeboard.org/students/practice";
const QBANK = "https://satsuitequestionbank.collegeboard.org/";
const MYPRACTICE = "https://mypractice.collegeboard.org/";
const KHAN = "https://www.khanacademy.org/digital-sat";

const ext = (href: string, label: string) => ({ href, label, external: true });

// Reusable "test phase" day patterns for months 4–5
function fullTestDay(note: string): DayOverride {
  return {
    title: "Full-length practice test",
    blocks: [
      { kind: "timed", title: "Full-length Bluebook practice test", objective: "Simulate test day: both sections, real timing, one break only.", assignment: `Take an unused full-length test in Bluebook under real conditions. ${note}`, minutes: 135, link: ext(BLUEBOOK, "Open Bluebook") },
      { kind: "review", title: "Record your scores", objective: "Log the official practice score so progress is based on real data.", assignment: "Enter total, Math, and R&W scores in Progress → Add test result. Note how the timing felt.", minutes: 15, link: { href: "/progress", label: "Add test result" } },
      { kind: "review", title: "First-pass mistake review", objective: "Capture every missed question while it is still fresh.", assignment: "Open My Practice, review each incorrect answer, and log each one in the Error Notebook.", minutes: 60, link: ext(MYPRACTICE, "Open My Practice") },
      { kind: "review", title: "Vocabulary refresh", objective: "Keep vocabulary active with low-effort review after a long test.", assignment: "Review 15 flashcards marked 'learning'.", minutes: 20, link: { href: "/vocabulary", label: "Open flashcards" } },
    ],
  };
}

function testReviewDay(): DayOverride {
  return {
    title: "Test analysis & targeted repair",
    blocks: [
      { kind: "review", title: "Domain analysis", objective: "Find which domains and skills cost the most points.", assignment: "In My Practice, group misses by domain and skill. Add your 3 weakest topics to the test record in Progress.", minutes: 45, link: ext(MYPRACTICE, "Open My Practice") },
      { kind: "math", title: "Targeted Math repair", objective: "Re-learn the concept behind your most-missed Math skill.", assignment: "Re-read the matching SAT Math topic, then do 15 Question Bank questions for that skill (medium + hard).", minutes: 90, link: ext(QBANK, "Open Question Bank") },
      { kind: "rw", title: "Targeted R&W repair", objective: "Re-learn the strategy behind your most-missed R&W skill.", assignment: "Re-read the matching R&W lesson, then do 15 Question Bank questions for that skill.", minutes: 90, link: ext(QBANK, "Open Question Bank") },
      { kind: "review", title: "Retry yesterday's mistakes", objective: "Confirm the fixes actually stuck.", assignment: "Use Retry Mistakes in the Error Notebook for every unreviewed entry.", minutes: 45, link: { href: "/errors", label: "Retry mistakes" } },
    ],
  };
}

export const CURRICULUM: WeekPlan[] = [
  // ───────── MONTH 1 ─────────
  {
    week: 1, month: 1, monthTitle: "Foundation & Diagnostic",
    title: "SAT Orientation & Diagnostic Assessment",
    objectives: [
      "Understand the digital SAT format, timing, and adaptive modules.",
      "Get comfortable with the Bluebook testing interface and Desmos.",
      "Measure a real baseline with an official full-length practice test.",
      "Identify the weakest domains to shape the next 19 weeks.",
    ],
    math: [{ label: "Linear equations review", ref: "alg-linear-one" }, { label: "Basic algebraic expressions", ref: "adv-equivalent" }, { label: "Fractions and percentages", ref: "psda-ratios" }],
    rw: [{ label: "SAT format introduction" }, { label: "Sentence structure", ref: "boundaries" }, { label: "Basic grammar", ref: "form-structure-sense" }, { label: "Reading comprehension", ref: "central-ideas" }],
    practice: ["Bluebook test preview", "Short Math and R&W diagnostics in the Question Bank", "First full-length Bluebook practice test"],
    assessment: "First full-length official Bluebook practice test (baseline score).",
    days: [
      {
        title: "Welcome to the SAT",
        blocks: [
          { kind: "review", title: "SAT orientation", objective: "Know the structure: 2 sections, 2 adaptive modules each, 2 h 14 min total.", assignment: "Read the Test Center guide and the Khan Academy digital SAT overview. Write down 3 things that surprised you.", minutes: 60, link: ext(KHAN, "Open Khan Academy") },
          { kind: "review", title: "Install & explore Bluebook", objective: "Set up the official testing app before you need it.", assignment: "Install Bluebook, sign in with a College Board account, and explore the tools: annotator, mark for review, reference sheet, Desmos.", minutes: 45, link: ext(BLUEBOOK, "Open Bluebook") },
          { kind: "math", title: "Linear equations warm-up", objective: "Refresh solving one-variable linear equations.", assignment: "Read the Linear Equations topic and complete its easy and medium exercises.", minutes: 75, link: { href: "/math/alg-linear-one", label: "Open topic" } },
          { kind: "rw", title: "Sentence structure basics", objective: "Recognise independent clauses and how sentences are joined.", assignment: "Read the Boundaries lesson and the Grammar handbook section on clauses.", minutes: 60, link: { href: "/reading-writing/boundaries", label: "Open lesson" } },
        ],
      },
      {
        title: "Bluebook preview & Math diagnostic",
        blocks: [
          { kind: "timed", title: "Bluebook test preview", objective: "Experience real question types and timing without pressure.", assignment: "Complete the test preview in Bluebook. Practise using Desmos and the reference sheet.", minutes: 45, link: ext(BLUEBOOK, "Open Bluebook") },
          { kind: "math", title: "Math diagnostic", objective: "Find out which Math domains already feel comfortable.", assignment: "In the Question Bank, do 5 medium questions from each of the 4 Math domains (20 total). Note the domain of every miss.", minutes: 90, link: ext(QBANK, "Open Question Bank") },
          { kind: "math", title: "Fractions & percentages refresh", objective: "Make percent change and fraction operations automatic.", assignment: "Read the Ratios, Rates & Percentages topic and complete its exercises.", minutes: 60, link: { href: "/math/psda-ratios", label: "Open topic" } },
          { kind: "review", title: "Log diagnostic mistakes", objective: "Start the Error Notebook habit from day one.", assignment: "Add every missed diagnostic question to the Error Notebook (use the question ID as the reference).", minutes: 45, link: { href: "/errors", label: "Open Error Notebook" } },
        ],
      },
      {
        title: "Reading & Writing diagnostic",
        blocks: [
          { kind: "rw", title: "R&W diagnostic", objective: "Find which R&W domains already feel comfortable.", assignment: "In the Question Bank, do 5 medium questions from each of the 4 R&W domains (20 total). Note the domain of every miss.", minutes: 90, link: ext(QBANK, "Open Question Bank") },
          { kind: "rw", title: "Basic grammar review", objective: "Review agreement, verb tense, and pronouns.", assignment: "Read the Grammar handbook and complete the Form, Structure, and Sense exercises.", minutes: 60, link: { href: "/reading-writing/form-structure-sense", label: "Open lesson" } },
          { kind: "math", title: "Algebraic expressions", objective: "Combine like terms, distribute, and simplify confidently.", assignment: "Read the Equivalent Expressions topic and complete the easy exercise.", minutes: 60, link: { href: "/math/adv-equivalent", label: "Open topic" } },
          { kind: "review", title: "Log mistakes + first vocabulary", objective: "Track R&W misses and begin vocabulary.", assignment: "Log missed R&W diagnostic questions. Study 10 new flashcards.", minutes: 45, link: { href: "/vocabulary", label: "Open flashcards" } },
        ],
      },
      {
        title: "Reading comprehension & strategy",
        blocks: [
          { kind: "rw", title: "Reading comprehension", objective: "Read short passages actively: claim, support, purpose.", assignment: "Read the Central Ideas lesson and complete its exercises.", minutes: 90, link: { href: "/reading-writing/central-ideas", label: "Open lesson" } },
          { kind: "math", title: "Desmos essentials", objective: "Learn the 5 Desmos moves that save the most time.", assignment: "Read Desmos Tips and try each tip on one Question Bank problem.", minutes: 60, link: { href: "/math#desmos", label: "Open Desmos tips" } },
          { kind: "timed", title: "Pacing practice", objective: "Feel SAT pace: about 71 s per R&W question, 95 s per Math question.", assignment: "Timed set: 10 R&W questions in 12 minutes and 10 Math questions in 16 minutes from the Question Bank.", minutes: 45, link: ext(QBANK, "Open Question Bank") },
          { kind: "review", title: "Prepare for test day", objective: "Remove surprises before the baseline test.", assignment: "Plan a quiet 2.5-hour slot for tomorrow, charge your device, and review vocabulary.", minutes: 30 },
        ],
      },
      {
        title: "Baseline full-length test",
        blocks: [
          { kind: "timed", title: "First full-length Bluebook practice test", objective: "Get an honest baseline score. No pressure: this is a starting point, not a verdict.", assignment: "Take a full-length practice test in Bluebook under real conditions with the scheduled break only.", minutes: 135, link: ext(BLUEBOOK, "Open Bluebook") },
          { kind: "review", title: "Record your baseline", objective: "Make the dashboard reflect real data.", assignment: "Enter the score in Progress → Add test result (provider: Bluebook).", minutes: 15, link: { href: "/progress", label: "Add test result" } },
          { kind: "review", title: "Light vocabulary", objective: "Wind down with something easy.", assignment: "Review today's flashcards.", minutes: 20, link: { href: "/vocabulary", label: "Open flashcards" } },
        ],
      },
      {
        title: "Analyse results & set priorities",
        blocks: [
          { kind: "review", title: "Score report analysis", objective: "See which domains and skills cost the most points.", assignment: "Open My Practice. For each section, list missed questions by domain and skill. Add your weakest topics to the test record.", minutes: 75, link: ext(MYPRACTICE, "Open My Practice") },
          { kind: "review", title: "Error Notebook entries", objective: "Turn every miss into a lesson.", assignment: "Log each missed question with why it was wrong and the correct reasoning.", minutes: 90, link: { href: "/errors", label: "Open Error Notebook" } },
          { kind: "review", title: "Plan adjustments", objective: "Adapt the next weeks to your actual weak spots.", assignment: "Add personal tasks to weeks 2–4 for your two weakest skills (Study Plan → Add task).", minutes: 45, link: { href: "/plan", label: "Open Study Plan" } },
          { kind: "rw", title: "Vocabulary", objective: "Keep the vocabulary streak going.", assignment: "Study 10 new flashcards.", minutes: 30, link: { href: "/vocabulary", label: "Open flashcards" } },
        ],
      },
    ],
  },
  {
    week: 2, month: 1, monthTitle: "Foundation & Diagnostic",
    title: "Linear Algebra",
    objectives: ["Solve one- and two-variable linear equations quickly and accurately.", "Solve systems by substitution, elimination, and Desmos.", "Translate word problems into equations.", "Find central ideas and supporting evidence in short texts."],
    math: [{ label: "Linear equations in one variable", ref: "alg-linear-one" }, { label: "Linear equations in two variables", ref: "alg-linear-two" }, { label: "Systems of equations", ref: "alg-systems" }, { label: "Word problems", ref: "alg-linear-one" }],
    rw: [{ label: "Central Ideas and Details", ref: "central-ideas" }, { label: "Command of Evidence", ref: "evidence-textual" }, { label: "Inferences", ref: "inferences" }],
    practice: ["Question Bank: Algebra (easy → medium)", "Question Bank: Information and Ideas"],
    assessment: "Saturday mixed quiz: 15 Algebra + 15 Information and Ideas questions, timed.",
  },
  {
    week: 3, month: 1, monthTitle: "Foundation & Diagnostic",
    title: "Linear Functions",
    objectives: ["Read slope and intercepts from equations, tables, and graphs.", "Move between slope-intercept and point-slope form.", "Interpret linear models in context.", "Master Words in Context and Text Structure questions."],
    math: [{ label: "Slope", ref: "alg-linear-two" }, { label: "Intercepts", ref: "alg-linear-two" }, { label: "Slope-intercept form", ref: "alg-linear-two" }, { label: "Point-slope form", ref: "alg-linear-two" }, { label: "Graphs", ref: "alg-linear-two" }, { label: "Linear function applications", ref: "psda-data-models" }],
    rw: [{ label: "Words in Context", ref: "words-in-context" }, { label: "Text Structure and Purpose", ref: "text-structure" }, { label: "Quantitative evidence", ref: "evidence-quantitative" }],
    practice: ["Question Bank: Linear functions (medium)", "Question Bank: Craft and Structure"],
    assessment: "Saturday mixed quiz: 15 linear-function + 15 Craft and Structure questions, timed.",
  },
  {
    week: 4, month: 1, monthTitle: "Foundation & Diagnostic",
    title: "Inequalities & Basic Problem Solving",
    objectives: ["Solve and graph linear inequalities and systems of inequalities.", "Handle ratios, rates, unit conversions, and percentages.", "Choose logical transitions and complete rhetorical synthesis questions.", "Learn the core punctuation rules."],
    math: [{ label: "Linear inequalities", ref: "alg-inequalities" }, { label: "Systems of inequalities", ref: "alg-inequalities" }, { label: "Ratios", ref: "psda-ratios" }, { label: "Rates", ref: "psda-ratios" }, { label: "Percentages", ref: "psda-ratios" }],
    rw: [{ label: "Transitions", ref: "transitions" }, { label: "Rhetorical Synthesis", ref: "rhetorical-synthesis" }, { label: "Punctuation basics", ref: "boundaries" }],
    practice: ["Question Bank: Inequalities & ratios", "Question Bank: Expression of Ideas"],
    assessment: "Month 1 check-in: 27-question timed mixed set (one Math module length) + 27 R&W questions.",
  },
  // ───────── MONTH 2 ─────────
  {
    week: 5, month: 2, monthTitle: "Complete Core SAT Topics",
    title: "Quadratic Foundations",
    objectives: ["Solve quadratics by factoring, square roots, and the quadratic formula.", "Move between standard and factored form.", "Recognise equivalent expressions.", "Fix agreement, verb, pronoun, and boundary errors."],
    math: [{ label: "Quadratic equations", ref: "adv-quadratics" }, { label: "Factoring", ref: "adv-equivalent" }, { label: "Standard form", ref: "adv-quadratics" }, { label: "Factored form", ref: "adv-quadratics" }, { label: "Equivalent expressions", ref: "adv-equivalent" }],
    rw: [{ label: "Subject-verb agreement", ref: "form-structure-sense" }, { label: "Verb forms", ref: "form-structure-sense" }, { label: "Pronouns", ref: "form-structure-sense" }, { label: "Sentence boundaries", ref: "boundaries" }],
    practice: ["Question Bank: Advanced Math – nonlinear equations", "Question Bank: Standard English Conventions"],
    assessment: "Saturday quiz: 15 quadratic + 15 Conventions questions, timed.",
  },
  {
    week: 6, month: 2, monthTitle: "Complete Core SAT Topics",
    title: "Quadratic Functions",
    objectives: ["Use vertex form to find maximum and minimum values.", "Connect roots, zeros, and x-intercepts.", "Use the discriminant to count solutions.", "Master punctuation and form/structure/sense questions."],
    math: [{ label: "Vertex form", ref: "adv-quadratics" }, { label: "Vertex and axis of symmetry", ref: "adv-quadratics" }, { label: "Maximum and minimum values", ref: "adv-quadratics" }, { label: "Roots and zeros", ref: "adv-quadratics" }, { label: "Graph transformations", ref: "adv-quadratics" }, { label: "Discriminant", ref: "adv-quadratics" }],
    rw: [{ label: "Boundaries and Punctuation", ref: "boundaries" }, { label: "Form, Structure, and Sense", ref: "form-structure-sense" }],
    practice: ["Question Bank: Advanced Math – nonlinear functions", "Question Bank: Boundaries; Form, Structure, and Sense"],
    assessment: "Saturday quiz: 15 quadratic-function + 20 Conventions questions, timed.",
  },
  {
    week: 7, month: 2, monthTitle: "Complete Core SAT Topics",
    title: "Advanced Math",
    objectives: ["Work fluently with exponents, radicals, and polynomials.", "Model growth and decay with exponential functions.", "Solve rational and other nonlinear equations.", "Compare two texts and handle harder vocabulary in context."],
    math: [{ label: "Polynomials", ref: "adv-equivalent" }, { label: "Exponents", ref: "adv-exponential" }, { label: "Radicals", ref: "adv-exponential" }, { label: "Rational expressions", ref: "adv-nonlinear" }, { label: "Exponential functions", ref: "adv-exponential" }, { label: "Nonlinear equations", ref: "adv-nonlinear" }],
    rw: [{ label: "Craft and Structure", ref: "text-structure" }, { label: "Cross-Text Connections", ref: "cross-text" }, { label: "Advanced Words in Context", ref: "words-in-context" }],
    practice: ["Question Bank: Advanced Math (medium → hard)", "Question Bank: Craft and Structure (hard)"],
    assessment: "Saturday quiz: 20 Advanced Math + 15 Craft and Structure questions, timed.",
  },
  {
    week: 8, month: 2, monthTitle: "Complete Core SAT Topics",
    title: "Geometry & Trigonometry",
    objectives: ["Apply angle relationships and triangle properties.", "Use similar triangles and right-triangle trigonometry.", "Compute area, volume, and circle measures.", "Take a mid-plan full-length test to measure progress."],
    math: [{ label: "Lines and angles", ref: "geo-lines-triangles" }, { label: "Triangles", ref: "geo-lines-triangles" }, { label: "Similar triangles", ref: "geo-lines-triangles" }, { label: "Circles", ref: "geo-circles" }, { label: "Area and volume", ref: "geo-area-volume" }, { label: "Right-triangle trigonometry", ref: "geo-right-trig" }],
    rw: [{ label: "Advanced grammar", ref: "form-structure-sense" }, { label: "Transitions", ref: "transitions" }, { label: "Reading comprehension", ref: "central-ideas" }],
    practice: ["Question Bank: Geometry and Trigonometry", "Question Bank: mixed R&W"],
    assessment: "Saturday: second full-length Bluebook practice test (progress check).",
    days: [undefined, undefined, undefined, undefined, undefined, fullTestDay("This is your mid-plan progress check — compare with your Week 1 baseline.")],
  },
  // ───────── MONTH 3 ─────────
  {
    week: 9, month: 3, monthTitle: "Advanced SAT Skills",
    title: "Geometry Applications",
    objectives: ["Write and read circle equations (complete the square).", "Use arc length and sector area.", "Apply the Pythagorean theorem and special right triangles.", "Use quantitative and textual evidence precisely."],
    math: [{ label: "Circle equations", ref: "geo-circles" }, { label: "Arc and sector concepts", ref: "geo-circles" }, { label: "Area and volume applications", ref: "geo-area-volume" }, { label: "Pythagorean theorem", ref: "geo-right-trig" }, { label: "Advanced trigonometry", ref: "geo-right-trig" }],
    rw: [{ label: "Quantitative Evidence", ref: "evidence-quantitative" }, { label: "Inference questions", ref: "inferences" }, { label: "Evidence-based reasoning", ref: "evidence-textual" }],
    practice: ["Question Bank: Geometry and Trigonometry (hard)", "Question Bank: Information and Ideas (hard)"],
    assessment: "Saturday quiz: 20 geometry + 15 Information and Ideas questions, timed.",
  },
  {
    week: 10, month: 3, monthTitle: "Advanced SAT Skills",
    title: "Problem-Solving & Data Analysis",
    objectives: ["Compare mean, median, range, and standard deviation.", "Compute probabilities from tables.", "Interpret scatterplots and lines of best fit.", "Interpret data in R&W passages."],
    math: [{ label: "Statistics", ref: "psda-statistics" }, { label: "Mean, median, and range", ref: "psda-statistics" }, { label: "Standard deviation concepts", ref: "psda-statistics" }, { label: "Probability", ref: "psda-probability" }, { label: "Ratios and rates", ref: "psda-ratios" }, { label: "Scatterplots", ref: "psda-data-models" }, { label: "Tables and graphs", ref: "psda-data-models" }],
    rw: [{ label: "Information and Ideas", ref: "central-ideas" }, { label: "Data interpretation", ref: "evidence-quantitative" }, { label: "Central ideas", ref: "central-ideas" }],
    practice: ["Question Bank: Problem-Solving and Data Analysis", "Question Bank: Command of Evidence – Quantitative"],
    assessment: "Saturday quiz: 20 PSDA + 15 quantitative-evidence questions, timed.",
  },
  {
    week: 11, month: 3, monthTitle: "Advanced SAT Skills",
    title: "Advanced Algebra & Nonlinear Problems",
    objectives: ["Solve systems with parameters (no / infinitely many solutions).", "Solve linear–quadratic systems.", "Handle multi-step word problems.", "Tackle the hardest inference and cross-text questions."],
    math: [{ label: "Complex linear systems", ref: "alg-systems" }, { label: "Parameters", ref: "alg-systems" }, { label: "Nonlinear systems", ref: "adv-nonlinear" }, { label: "Quadratic applications", ref: "adv-quadratics" }, { label: "Advanced word problems", ref: "alg-linear-one" }],
    rw: [{ label: "Difficult inference questions", ref: "inferences" }, { label: "Text structure and purpose", ref: "text-structure" }, { label: "Cross-text connections", ref: "cross-text" }],
    practice: ["Question Bank: Algebra & Advanced Math (hard)", "Question Bank: Inferences & Cross-Text (hard)"],
    assessment: "Saturday quiz: 20 hard Algebra/Advanced Math + 15 hard R&W questions, timed.",
  },
  {
    week: 12, month: 3, monthTitle: "Advanced SAT Skills",
    title: "Domain Integration",
    objectives: ["Switch between all four Math domains without warm-up.", "Mix all four R&W domains.", "Measure each domain with a domain-level assessment."],
    math: [{ label: "Mixed Algebra", ref: "alg-systems" }, { label: "Mixed Advanced Math", ref: "adv-quadratics" }, { label: "Problem-Solving and Data Analysis", ref: "psda-data-models" }, { label: "Geometry and Trigonometry", ref: "geo-right-trig" }],
    rw: [{ label: "Mixed domain practice", ref: "central-ideas" }, { label: "Advanced grammar", ref: "form-structure-sense" }, { label: "Rhetorical synthesis", ref: "rhetorical-synthesis" }],
    practice: ["Question Bank: all domains, mixed difficulty"],
    assessment: "Domain-level assessment: 10 questions per domain (8 domains), scored and logged by domain.",
    days: [undefined, undefined, undefined, undefined, undefined, {
      title: "Domain-level assessment",
      blocks: [
        { kind: "math", title: "Math domain assessment", objective: "Measure each Math domain separately.", assignment: "Question Bank: 10 mixed-difficulty questions from each Math domain (40 total, ~60 min). Record accuracy per domain in the test notes.", minutes: 75, link: ext(QBANK, "Open Question Bank") },
        { kind: "rw", title: "R&W domain assessment", objective: "Measure each R&W domain separately.", assignment: "Question Bank: 10 mixed-difficulty questions from each R&W domain (40 total, ~50 min).", minutes: 60, link: ext(QBANK, "Open Question Bank") },
        { kind: "review", title: "Log results & mistakes", objective: "Turn the assessment into next month's priorities.", assignment: "Log misses in the Error Notebook. Add focus tasks for your two weakest domains in Week 13.", minutes: 75, link: { href: "/errors", label: "Open Error Notebook" } },
        { kind: "review", title: "Vocabulary review", objective: "Consolidate vocabulary.", assignment: "Review all 'learning' flashcards.", minutes: 30, link: { href: "/vocabulary", label: "Open flashcards" } },
      ],
    }],
  },
  // ───────── MONTH 4 ─────────
  {
    week: 13, month: 4, monthTitle: "Hard Questions & Timed Practice",
    title: "Advanced Math Practice",
    objectives: ["Raise accuracy on hard Algebra and quadratic questions.", "Handle unfamiliar nonlinear functions calmly.", "Break multi-step word problems into steps.", "Perfect advanced Conventions questions."],
    math: [{ label: "Difficult Algebra questions", ref: "alg-systems" }, { label: "Hard quadratic problems", ref: "adv-quadratics" }, { label: "Nonlinear functions", ref: "adv-nonlinear" }, { label: "Multi-step word problems", ref: "alg-linear-one" }],
    rw: [{ label: "Advanced Standard English Conventions", ref: "boundaries" }, { label: "Form, Structure, and Sense", ref: "form-structure-sense" }],
    practice: ["Question Bank: hard Math only", "Question Bank: hard Conventions"],
    assessment: "Saturday: one timed hard Math module (22 questions, 35 min) + 27 Conventions questions.",
  },
  {
    week: 14, month: 4, monthTitle: "Hard Questions & Timed Practice",
    title: "Advanced Reading & Writing",
    objectives: ["Master difficult inference and cross-text questions.", "Expand advanced vocabulary.", "Use Desmos to speed up Math.", "Practise advanced geometry under time pressure."],
    math: [{ label: "Desmos techniques", ref: "adv-quadratics" }, { label: "Advanced geometry", ref: "geo-circles" }, { label: "Timed questions" }],
    rw: [{ label: "Difficult inference questions", ref: "inferences" }, { label: "Advanced vocabulary", ref: "words-in-context" }, { label: "Cross-text connections", ref: "cross-text" }, { label: "Rhetorical synthesis", ref: "rhetorical-synthesis" }],
    practice: ["Question Bank: hard R&W", "Desmos-only challenge: solve 10 questions using only Desmos"],
    assessment: "Saturday: one timed hard R&W module (27 questions, 32 min) + timed Math geometry set.",
  },
  {
    week: 15, month: 4, monthTitle: "Hard Questions & Timed Practice",
    title: "Mixed Hard Practice",
    objectives: ["Build stamina with hard mixed sets.", "Practise module strategy: when to skip and return.", "Revise the weakest topics from the Error Notebook."],
    math: [{ label: "Hard Math question sets", ref: "adv-nonlinear" }, { label: "Time management" }, { label: "Weak-topic revision" }],
    rw: [{ label: "Hard R&W question sets", ref: "inferences" }, { label: "Module strategies" }, { label: "Weak-topic revision" }],
    practice: ["Question Bank: hard mixed sets", "Error Notebook retries"],
    assessment: "Saturday: full timed module pair (R&W + Math) from the Question Bank, hard difficulty.",
  },
  {
    week: 16, month: 4, monthTitle: "Hard Questions & Timed Practice",
    title: "First Intensive Test Phase",
    objectives: ["Take two full-length timed tests this week.", "Review every mistake thoroughly.", "Analyse domain performance and drill the weakest topics."],
    math: [{ label: "Full-length timed practice" }, { label: "Weakest-topic practice" }],
    rw: [{ label: "Full-length timed practice" }, { label: "Weakest-topic practice" }],
    practice: ["Full-length Bluebook test", "Full-length third-party test (unofficial)"],
    assessment: "Two full-length tests: one official Bluebook, one third-party (unofficial).",
    days: [
      fullTestDay("Official test #3."),
      testReviewDay(),
      undefined,
      {
        title: "Second full-length test (unofficial)",
        blocks: [
          { kind: "timed", title: "Third-party full-length practice test", objective: "Build stamina with a different test provider.", assignment: "Take the Princeton Review or Kaplan free digital practice test. Remember: this score is unofficial and may differ from Bluebook.", minutes: 135, link: { href: "/tests", label: "Open Test Center" } },
          { kind: "review", title: "Record the result as unofficial", objective: "Keep official and unofficial results separate.", assignment: "Add the result in Progress with the correct provider.", minutes: 15, link: { href: "/progress", label: "Add test result" } },
          { kind: "review", title: "Mistake review", objective: "Capture what went wrong.", assignment: "Log misses in the Error Notebook (use the provider's question reference).", minutes: 60, link: { href: "/errors", label: "Open Error Notebook" } },
          { kind: "review", title: "Vocabulary", objective: "Keep vocabulary active.", assignment: "Review 15 flashcards.", minutes: 20, link: { href: "/vocabulary", label: "Open flashcards" } },
        ],
      },
      testReviewDay(),
    ],
  },
  // ───────── MONTH 5 ─────────
  {
    week: 17, month: 5, monthTitle: "Final Preparation",
    title: "Test Simulation",
    objectives: ["Simulate test day with a full-length test.", "Do a detailed score analysis.", "Run targeted Math and R&W revision."],
    math: [{ label: "Targeted Math revision" }, { label: "Weak domains from test analysis" }],
    rw: [{ label: "Targeted R&W revision" }, { label: "Weak domains from test analysis" }],
    practice: ["Full-length Bluebook test", "Targeted Question Bank sets"],
    assessment: "Full-length official Bluebook practice test (Monday) + Saturday targeted assessment.",
    days: [fullTestDay("Official test #4."), testReviewDay()],
  },
  {
    week: 18, month: 5, monthTitle: "Final Preparation",
    title: "Advanced Test Preparation",
    objectives: ["Take another full-length test.", "Practise individual timed modules.", "Improve accuracy on hard questions."],
    math: [{ label: "Timed modules" }, { label: "Hard question practice" }, { label: "Accuracy improvement" }],
    rw: [{ label: "Timed modules" }, { label: "Hard question practice" }, { label: "Accuracy improvement" }],
    practice: ["Full-length Bluebook test", "Timed modules from the Question Bank"],
    assessment: "Full-length official Bluebook practice test (Monday) + Saturday timed modules.",
    days: [fullTestDay("Official test #5."), testReviewDay()],
  },
  {
    week: 19, month: 5, monthTitle: "Final Preparation",
    title: "Final Weakness Elimination",
    objectives: ["Take a full-length test.", "Eliminate recurring mistakes.", "Revise formulas and vocabulary.", "Lock in time-management habits."],
    math: [{ label: "Recurring mistakes" }, { label: "Formula revision", ref: "geo-area-volume" }, { label: "Time management" }],
    rw: [{ label: "Recurring mistakes" }, { label: "Vocabulary revision" }, { label: "Time management" }],
    practice: ["Full-length Bluebook test", "Error Notebook: retry every mistake"],
    assessment: "Full-length official Bluebook practice test (Monday) + Saturday retry of every Error Notebook entry.",
    days: [fullTestDay("Official test #6."), testReviewDay()],
  },
  {
    week: 20, month: 5, monthTitle: "Final Preparation",
    title: "Final Review",
    objectives: ["Take the final full-length test early in the week.", "Review difficult concepts lightly.", "Review formulas and strategies.", "Rest: no heavy new topics in the final 48 hours."],
    math: [{ label: "Formula review" }, { label: "Difficult concepts" }, { label: "Light practice" }],
    rw: [{ label: "Strategy review" }, { label: "Difficult concepts" }, { label: "Light practice" }],
    practice: ["Final full-length Bluebook test", "Light review only"],
    assessment: "Final full-length official Bluebook practice test (Monday).",
    days: [
      fullTestDay("Your final practice test — treat it exactly like test day."),
      testReviewDay(),
      {
        title: "Difficult concepts, lightly",
        blocks: [
          { kind: "math", title: "Math concept review", objective: "Review — don't learn new material.", assignment: "Re-read the formulas section of each Math domain and redo 10 Error Notebook Math retries.", minutes: 75, link: { href: "/errors", label: "Retry mistakes" } },
          { kind: "rw", title: "R&W strategy review", objective: "Refresh the strategy for each question type.", assignment: "Re-read the strategy list of each R&W lesson. Do 10 medium questions to stay sharp.", minutes: 75, link: { href: "/reading-writing", label: "Open R&W" } },
          { kind: "review", title: "Vocabulary", objective: "Final vocabulary pass.", assignment: "Review all 'learning' cards.", minutes: 30, link: { href: "/vocabulary", label: "Open flashcards" } },
        ],
      },
      {
        title: "Formulas & strategies",
        blocks: [
          { kind: "math", title: "Formula & Desmos review", objective: "Make sure the key formulas and Desmos moves are automatic.", assignment: "Review every formula card and the Desmos Tips section.", minutes: 60, link: { href: "/math#desmos", label: "Open Desmos tips" } },
          { kind: "timed", title: "Light timed practice", objective: "Stay in rhythm without fatigue.", assignment: "One short timed set: 10 Math + 10 R&W medium questions.", minutes: 40, link: ext(QBANK, "Open Question Bank") },
          { kind: "review", title: "Test-day checklist", objective: "Remove test-day stress.", assignment: "Confirm admission ticket, ID, charged device with Bluebook updated, route and arrival time.", minutes: 20, link: ext(BLUEBOOK, "Open Bluebook") },
        ],
      },
      {
        title: "Light review — final 48 hours",
        blocks: [
          { kind: "review", title: "Light review only", objective: "Rest your mind. No heavy new topics in the final 48 hours.", assignment: "Glance over your Error Notebook highlights for 30 minutes, then stop studying.", minutes: 30, link: { href: "/errors", label: "Open Error Notebook" } },
          { kind: "review", title: "Rest & prepare", objective: "Sleep, food, and calm matter more than one more question.", assignment: "Pack your bag, go to bed early. You've done the work.", minutes: 15 },
        ],
      },
      {
        title: "Rest — or test day",
        blocks: [
          { kind: "review", title: "Rest or sit the SAT", objective: "Arrive at the test rested and confident.", assignment: "If this is test day: eat breakfast, arrive early, trust your training. Otherwise: no studying, a walk, good food, early sleep.", minutes: 10 },
        ],
      },
    ],
  },
];

export const TOTAL_WEEKS = CURRICULUM.length;
