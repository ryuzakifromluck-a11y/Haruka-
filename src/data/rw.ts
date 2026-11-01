import type { Domain, RWDomainId, RWSkill } from "./content-types";

// All passages and questions below are original, AI-generated SAT-style practice — unofficial.
// Names of people and places in passages are fictional unless they are widely known facts.

export const RW_DOMAINS: Domain<RWDomainId>[] = [
  { id: "info", title: "Information and Ideas", weight: "≈26% of R&W", description: "Understand, interpret, and use information from texts, tables, and graphs." },
  { id: "craft", title: "Craft and Structure", weight: "≈28% of R&W", description: "Vocabulary in context, the purpose and structure of texts, and connections between texts." },
  { id: "expression", title: "Expression of Ideas", weight: "≈20% of R&W", description: "Revise texts to improve logic and achieve specific rhetorical goals." },
  { id: "conventions", title: "Standard English Conventions", weight: "≈26% of R&W", description: "Edit texts for sentence structure, usage, and punctuation." },
];

export const RW_SKILLS: RWSkill[] = [
  // ─────────── INFORMATION AND IDEAS ───────────
  {
    id: "central-ideas",
    domain: "info",
    title: "Central Ideas and Details",
    summary: "Identify the main point of a short text and locate the details that support it.",
    overview: [
      "These questions ask what a text is mostly about, or what it says about a specific detail. The correct answer is always directly supported by the text — never your outside knowledge.",
      "The central idea usually combines the topic with the author's point about it. Answers that are true but too narrow (one detail) or too broad (more than the text covers) are wrong.",
    ],
    looksLike: ["Which choice best states the main idea of the text?", "According to the text, what is true about …?", "Based on the text, what did the researchers find?"],
    strategies: ["Read the whole text first, then summarise it in 6–8 words before looking at the choices.", "Pay special attention to contrast words (however, but, yet) — the main idea often comes after them.", "Eliminate choices that mention something the text never says, even if it sounds reasonable.", "For detail questions, find the exact sentence that proves your answer."],
    traps: ["Too narrow: a true detail, not the main idea.", "Too broad: claims more than the text supports.", "Extreme words (always, never, proves) that the text doesn't justify."],
    questions: [
      { id: "rw-ci-e", level: "easy", passage: "In recent years, rooftop beehives have appeared across many cities. Supporters argue that urban hives help pollinate city gardens and parks. Some ecologists caution, however, that adding large numbers of honeybees may increase competition for flowers, leaving less food for native wild bees.", prompt: "Which choice best states the main idea of the text?", choices: ["Urban beekeeping may benefit city plants, but it could also create problems for native bees.", "Honeybees are more effective pollinators than native wild bees.", "Ecologists have successfully banned rooftop beehives in many cities.", "City gardens cannot survive without rooftop beehives."], correct: 0, answerText: "A", explanation: "The text presents a benefit (pollination) and a concern (competition with wild bees). B, C, and D make claims the text never states." },
      { id: "rw-ci-m", level: "medium", passage: "Although critics often describe the novels of Lena Varga as tragedies, a closer reading reveals a persistent strand of humor. Her characters, even in moments of loss, trade sharp jokes that reveal both their resilience and their refusal to be defined by misfortune.", prompt: "Which choice best states the main idea of the text?", choices: ["Varga's novels, though often seen as tragic, contain humor that reveals her characters' resilience.", "Critics have misunderstood every aspect of Varga's novels.", "Varga's characters rarely experience loss or misfortune.", "Varga's novels are primarily comedies with no tragic elements."], correct: 0, answerText: "A", explanation: "The key move is after \"Although\": the novels contain humor that shows resilience. B is too extreme, C contradicts \"moments of loss\", and D overstates the point." },
      { id: "rw-ci-h", level: "hard", passage: "Researchers asked two groups of participants to memorize word pairs. One group slept for eight hours before being tested; the other stayed awake for the same period. The rested group recalled more pairs overall, but the difference between the groups was largest for the pairs that participants had initially found most difficult to learn.", prompt: "Based on the text, what did the researchers find?", choices: ["Sleep appeared to benefit recall most for the word pairs that were hardest to learn.", "The group that stayed awake was unable to recall any word pairs.", "Sleep improved recall equally for every type of word pair.", "Participants found all the word pairs equally difficult to learn."], correct: 0, answerText: "A", explanation: "The last sentence says the gap was largest for the most difficult pairs. C contradicts this, and B and D are not supported." },
    ],
    keywords: ["main idea", "central idea", "details", "reading comprehension", "summary"],
  },
  {
    id: "evidence-textual",
    domain: "info",
    title: "Command of Evidence: Textual",
    summary: "Choose the quotation or finding that best supports, weakens, or illustrates a claim.",
    overview: [
      "You'll be given a claim (a student's interpretation, a researcher's hypothesis) and asked which evidence most directly supports or weakens it.",
      "The correct answer must match every part of the claim. If the claim is about loneliness conveyed through nature imagery, the quotation needs both nature and loneliness.",
    ],
    looksLike: ["Which quotation from the poem most effectively illustrates the claim?", "Which finding, if true, would most directly support the researchers' hypothesis?", "Which finding would most directly weaken the claim?"],
    strategies: ["Underline the exact claim before reading the choices. Break it into its key parts.", "Check each choice against every part of the claim — partial matches are traps.", "To weaken a hypothesis, look for a result showing the proposed cause is not necessary or not sufficient.", "Ignore whether a choice is interesting; ask only whether it is relevant."],
    traps: ["A quotation on the right topic that doesn't show the specific claim.", "A finding that is true but doesn't connect cause and effect.", "Confusing \"support\" and \"weaken\" — reread the question stem."],
    questions: [
      { id: "rw-et-e", level: "easy", passage: "In the poem \"The Empty Field,\" the speaker describes a farm after the harvest. A student claims that the poet uses images of nature to convey a feeling of loneliness.", prompt: "Which quotation from the poem most effectively illustrates the student's claim?", choices: ["\"A single crow circles the silent field, / calling to no one.\"", "\"The market hums with voices at noon.\"", "\"We laughed beside the river all summer.\"", "\"My brother paints the barn bright red.\""], correct: 0, answerText: "A", explanation: "Only A combines a nature image (crow, field) with loneliness (single, silent, calling to no one). C mentions nature but conveys joy." },
      { id: "rw-et-m", level: "medium", passage: "A historian claims that the opening of a canal in the 1830s transformed the economy of the small town of Brightwater.", prompt: "Which finding, if true, would most directly support the historian's claim?", choices: ["Within ten years of the canal's opening, the number of businesses in Brightwater tripled.", "The canal was designed by a well-known engineer from a distant city.", "Before the canal opened, many residents of Brightwater were farmers.", "Some residents complained about the noise made by passing boats."], correct: 0, answerText: "A", explanation: "A shows a dramatic economic change after the canal opened. The other choices are about the canal or the town but not about economic transformation." },
      { id: "rw-et-h", level: "hard", passage: "Researchers hypothesize that a certain species of coral survives in unusually warm water because it hosts a particular type of symbiotic alga.", prompt: "Which finding, if true, would most directly weaken the researchers' hypothesis?", choices: ["Corals of this species that lack the alga survive in warm water just as well as those that host it.", "The same type of alga is also found in several other coral species.", "Average water temperatures in the region have risen over the past decade.", "Corals that host the alga tend to be more brightly colored."], correct: 0, answerText: "A", explanation: "If corals without the alga do equally well, the alga cannot explain the heat tolerance. B doesn't address the coral's survival, and C and D are irrelevant to the causal claim." },
    ],
    keywords: ["evidence", "support", "weaken", "quotation", "claim", "hypothesis"],
  },
  {
    id: "evidence-quantitative",
    domain: "info",
    title: "Command of Evidence: Quantitative",
    summary: "Use data from a table or graph to complete a claim accurately.",
    overview: [
      "These questions pair a short text with a table or graph. The answer must be accurate to the data and relevant to the specific claim in the text.",
      "Many wrong choices describe the data correctly but don't support the claim. Others support the claim but misread the numbers.",
    ],
    looksLike: ["Which choice most effectively uses data from the table to complete the statement?", "Which choice best describes data from the graph that support the researcher's conclusion?"],
    strategies: ["Read the text first to find the exact claim, then go to the data.", "Read the table's title, column headings, and units carefully.", "Check every number in an answer choice against the table.", "Ask: is this accurate AND does it support this claim?"],
    traps: ["Accurate data that doesn't relate to the claim.", "Comparing the wrong rows or columns.", "Mixing up years, groups, or units."],
    questions: [
      { id: "rw-eq-e", level: "easy", passage: "A city library launched a weekend reading program in January and tracked monthly visits afterward. Library staff claimed that visits increased steadily after the program began.", table: { headers: ["Month", "Visits"], rows: [["January", "1,200"], ["February", "1,450"], ["March", "1,900"]] }, prompt: "Which choice most effectively uses data from the table to support the staff's claim?", choices: ["Visits rose each month, from 1,200 in January to 1,900 in March.", "Visits were highest in January, when the program began.", "February had fewer visits than January.", "The library recorded 1,450 visits in March."], correct: 0, answerText: "A", explanation: "A is accurate and shows a steady increase. B and C are inaccurate, and D misreads the table (1,450 was February)." },
      { id: "rw-eq-m", level: "medium", passage: "Agronomists compared crop yields from fields treated with two fertilizers over two years. They concluded that Fertilizer B's advantage over Fertilizer A appeared only in the second year.", table: { headers: ["Fertilizer", "2022 yield (t/ha)", "2023 yield (t/ha)"], rows: [["A", 4.1, 4.3], ["B", 3.6, 4.8]] }, prompt: "Which choice most effectively uses data from the table to support the agronomists' conclusion?", choices: ["In 2022, fields with Fertilizer B yielded less than fields with A (3.6 vs. 4.1 t/ha), but in 2023 they yielded more (4.8 vs. 4.3 t/ha).", "Fertilizer B produced higher yields than Fertilizer A in both years.", "Yields from Fertilizer A increased by 0.2 t/ha from 2022 to 2023.", "Fertilizer B produced lower yields than Fertilizer A in both years."], correct: 0, answerText: "A", explanation: "The conclusion is about a change between years, so the answer must compare both years. C is accurate but doesn't address B's advantage." },
      { id: "rw-eq-h", level: "hard", passage: "A psychologist tested whether studying in several short, spaced sessions leads to better long-term retention than studying in one long session. She hypothesized that the benefit of spacing would appear mainly on delayed tests.", table: { headers: ["Group", "Score after 1 week", "Score after 1 month"], rows: [["Single session", 82, 61], ["Spaced sessions", 79, 74]] }, prompt: "Which choice most effectively uses data from the table to support the psychologist's hypothesis?", choices: ["Although the single-session group scored slightly higher after one week, the spaced group scored substantially higher after one month (74 vs. 61).", "The spaced group scored higher than the single-session group at both times.", "The single-session group's score after one week was the highest score recorded.", "Both groups' scores declined between one week and one month."], correct: 0, answerText: "A", explanation: "The hypothesis predicts an advantage on the delayed test. A shows exactly that contrast. B is inaccurate, and C and D are accurate but don't support the hypothesis." },
    ],
    keywords: ["data", "table", "graph", "quantitative", "evidence", "data interpretation"],
  },
  {
    id: "inferences",
    domain: "info",
    title: "Inferences",
    summary: "Complete a text with the conclusion that logically follows from the information given.",
    overview: [
      "Inference questions end with a blank. You choose the conclusion that most logically follows from everything before it.",
      "The right answer is the most modest, best-supported conclusion — not the boldest one. If you can't point to the sentences that justify it, it's wrong.",
    ],
    looksLike: ["Which choice most logically completes the text?"],
    strategies: ["Summarise the logic in your own words: \"Because A and B, therefore ___.\"", "Predict the ending before reading choices.", "Prefer cautious language (may, suggests, likely) when the evidence is limited.", "Check that the answer uses all the key information, especially any \"however\" or \"yet\"."],
    traps: ["Conclusions that go beyond the evidence.", "Answers that repeat a detail instead of drawing a conclusion.", "Ignoring the second half of a contrast."],
    questions: [
      { id: "rw-inf-e", level: "easy", passage: "Ferns reproduce using spores rather than seeds. Because the spores need moisture to develop into new plants, ferns ______", prompt: "Which choice most logically completes the text?", choices: ["are often most common in damp environments such as shaded forest floors.", "grow only in deserts, where moisture is scarce.", "produce large, brightly colored flowers.", "cannot survive in any shaded area."], correct: 0, answerText: "A", explanation: "If spores need moisture, ferns will tend to thrive where it is damp. B contradicts the logic, and C and D aren't supported." },
      { id: "rw-inf-m", level: "medium", passage: "Historians long assumed that the medieval town of Velmora traded only with nearby villages. Recently, however, archaeologists excavating the town found coins minted in several distant coastal cities. This finding suggests that ______", prompt: "Which choice most logically completes the text?", choices: ["Velmora may have had trade connections that extended well beyond its immediate region.", "the coastal cities were originally founded by people from Velmora.", "the coins were actually made in Velmora.", "nearby villages did not use coins."], correct: 0, answerText: "A", explanation: "Distant coins challenge the \"only nearby\" assumption, suggesting wider trade. The cautious \"may\" matches the limited evidence." },
      { id: "rw-inf-h", level: "hard", passage: "In a study of songbirds, young males that learned from older tutors developed more complex songs than males raised in isolation. Yet males raised alongside tutors of their own age developed songs nearly as complex as those of males with older tutors. Taken together, these results suggest that ______", prompt: "Which choice most logically completes the text?", choices: ["social interaction during learning, rather than the tutor's age specifically, may be key to developing complex songs.", "older tutors interfere with young birds' song development.", "being raised in isolation helps songbirds develop more complex songs.", "a tutor's age is the only factor that determines song complexity."], correct: 0, answerText: "A", explanation: "Same-age tutors worked almost as well as older ones, and both beat isolation. So the common factor — interaction — matters more than age. B, C, and D contradict the results." },
    ],
    keywords: ["inference", "logical conclusion", "complete the text", "reasoning"],
  },
  // ─────────── CRAFT AND STRUCTURE ───────────
  {
    id: "words-in-context",
    domain: "craft",
    title: "Words in Context",
    summary: "Choose the most logical and precise word or phrase for a blank, using clues from the text.",
    overview: [
      "These questions test precise vocabulary. The surrounding sentence always contains clues — a definition, a contrast, or an example — that tell you what the blank must mean.",
      "Predict a simple word for the blank first, then find the choice closest in meaning. This prevents attractive but wrong words from pulling you in.",
    ],
    looksLike: ["Which choice completes the text with the most logical and precise word or phrase?", "As used in the text, what does the word … most nearly mean?"],
    strategies: ["Cover the choices and fill the blank with your own word.", "Look for clue words: colons and semicolons often signal a definition; although/despite signal contrast.", "Decide if the blank needs a positive or negative word.", "Build vocabulary daily with the flashcards — it compounds over 20 weeks."],
    traps: ["Words that sound sophisticated but don't fit the logic.", "Words with the right tone but the wrong meaning.", "Secondary meanings of common words (e.g., \"novel\" meaning new)."],
    questions: [
      { id: "rw-wic-e", level: "easy", passage: "Despite the team's initial doubts, the new schedule proved remarkably ______: it worked well for both the morning and evening shifts.", prompt: "Which choice completes the text with the most logical and precise word?", choices: ["flexible", "rigid", "fragile", "obscure"], correct: 0, answerText: "A) flexible", explanation: "The colon explains the blank: it worked for different shifts, so it was adaptable — flexible." },
      { id: "rw-wic-m", level: "medium", passage: "The scientist described her conclusions as ______, noting that further experiments might reveal a different pattern.", prompt: "Which choice completes the text with the most logical and precise word?", choices: ["tentative", "definitive", "arbitrary", "celebrated"], correct: 0, answerText: "A) tentative", explanation: "If further experiments might change them, the conclusions are provisional — tentative. Definitive is the opposite." },
      { id: "rw-wic-h", level: "hard", passage: "Although the critic briefly acknowledged the novel's ambition, her review was overwhelmingly ______, faulting the book's uneven pacing and underdeveloped characters.", prompt: "Which choice completes the text with the most logical and precise word?", choices: ["laudatory", "disapproving", "ambivalent", "whimsical"], correct: 1, answerText: "B) disapproving", explanation: "\"Overwhelmingly\" plus the list of faults signals a negative review. Ambivalent (mixed) is tempting because of the brief praise, but \"overwhelmingly\" rules it out." },
    ],
    keywords: ["vocabulary", "words in context", "precise word", "meaning"],
  },
  {
    id: "text-structure",
    domain: "craft",
    title: "Text Structure and Purpose",
    summary: "Identify a text's main purpose, its overall structure, or the function of a particular sentence.",
    overview: [
      "Purpose questions ask why the author wrote the text; structure questions ask how it is organised; function questions ask what one sentence does within the text.",
      "Think in verbs: does the text argue, describe, challenge, explain, compare? The correct answer's verb must match what the text actually does.",
    ],
    looksLike: ["Which choice best states the main purpose of the text?", "Which choice best describes the overall structure of the text?", "Which choice best describes the function of the second sentence in the text as a whole?"],
    strategies: ["Label each sentence with a word or two (claim, example, contrast, result).", "For function questions, ask how the sentence relates to the one before and after.", "Check every part of a multi-part answer choice — one wrong part makes it wrong.", "Don't confuse the topic with the purpose."],
    traps: ["Answers that describe the content but not its role.", "Verbs that are too strong (\"refute\") when the text only qualifies.", "Answers describing only half of the text."],
    questions: [
      { id: "rw-ts-e", level: "easy", passage: "Many people assume that deserts are nearly lifeless. In fact, the Sonoran Desert in North America supports around 2,000 species of plants, along with a great variety of birds, reptiles, and insects.", prompt: "Which choice best states the main purpose of the text?", choices: ["To challenge a common assumption by presenting contrary evidence", "To explain how desert plants survive without water", "To compare the Sonoran Desert with other deserts", "To argue that deserts should be protected by law"], correct: 0, answerText: "A", explanation: "The text states an assumption (deserts are lifeless) and then contradicts it (\"In fact…\"). It doesn't explain survival, compare deserts, or argue for laws." },
      { id: "rw-ts-m", level: "medium", passage: "The architect Rosa Lind designed homes that seemed to grow out of the hillsides. She built with local stone and planted grasses on the roofs, so that from a distance her buildings were almost invisible. Critics who expected bold modern statements were often disappointed.", prompt: "Which choice best describes the function of the second sentence in the text as a whole?", choices: ["It provides specific examples of how Lind's homes blended into their surroundings.", "It introduces the critics' main objection to Lind's work.", "It explains where Lind received her architectural training.", "It contrasts Lind's methods with those of other architects."], correct: 0, answerText: "A", explanation: "Sentence 1 makes a general statement; sentence 2 gives concrete details (local stone, grass roofs) that show it. The critics only appear in sentence 3." },
      { id: "rw-ts-h", level: "hard", passage: "Sociologists once believed that people's social networks simply shrink as they age. A long-term study complicates this view: while older adults did report fewer friends overall, they also reported more frequent contact with the friends they kept and greater satisfaction with those relationships.", prompt: "Which choice best describes the overall structure of the text?", choices: ["It presents a belief and then describes a study that adds nuance to that belief.", "It proposes a hypothesis and then describes a study that fully confirms it.", "It presents two competing theories and then rejects both of them.", "It describes a social problem and then proposes a solution to it."], correct: 0, answerText: "A", explanation: "\"Complicates\" is the key word: the study partly agrees (fewer friends) but adds new detail (closer relationships). It neither fully confirms nor rejects the belief." },
    ],
    keywords: ["purpose", "structure", "function", "craft", "organization"],
  },
  {
    id: "cross-text",
    domain: "craft",
    title: "Cross-Text Connections",
    summary: "Compare two short texts on the same topic and predict how one author would respond to the other.",
    overview: [
      "You'll read two short texts, usually with different views on the same topic. The question asks how the author of one text would most likely respond to a claim in the other.",
      "First identify each author's position in one sentence. Then find the exact point where they agree or disagree.",
    ],
    looksLike: ["Based on the texts, how would the author of Text 2 most likely respond to the claim in Text 1?", "Based on the texts, both authors would most likely agree with which statement?"],
    strategies: ["Summarise Text 1's claim and Text 2's claim separately.", "Look for the specific weakness Text 2 identifies in Text 1's reasoning.", "Partial agreement is common: \"yes, but…\" answers are often correct.", "Reject answers that put words in an author's mouth."],
    traps: ["Answers that describe Text 2's view in general but don't respond to Text 1's specific claim.", "Answers that are too extreme (total rejection when Text 2 only qualifies).", "Reversing which text says what."],
    questions: [
      { id: "rw-ct-e", level: "easy", passage: "Text 1: Some nutrition researchers argue that breakfast is the most important meal of the day. They cite studies in which people who ate breakfast performed better on morning tasks than people who skipped it.", passage2: "Text 2: Recent controlled trials found that when overall diet quality was taken into account, skipping breakfast had little effect on morning performance. The earlier studies, the trial authors note, did not separate breakfast habits from other healthy behaviors.", prompt: "Based on the texts, how would the authors of the trials in Text 2 most likely respond to the researchers in Text 1?", choices: ["They would argue that the earlier results may reflect other healthy habits of breakfast eaters rather than breakfast itself.", "They would agree that breakfast is the most important meal of the day.", "They would claim that skipping breakfast greatly improves morning performance.", "They would argue that morning tasks cannot be measured accurately."], correct: 0, answerText: "A", explanation: "Text 2 explicitly says the earlier studies didn't separate breakfast from other healthy behaviors — a confounding factor." },
      { id: "rw-ct-m", level: "medium", passage: "Text 1: The spread of the printing press in fifteenth-century Europe was the main reason literacy rates rose. By making books cheap and plentiful, the press gave ordinary people a reason to learn to read.", passage2: "Text 2: Printed books certainly mattered, but they were not enough on their own. In regions where few schools existed, literacy rose slowly even after printers arrived. The growth of schools and the falling cost of paper were just as important.", prompt: "Based on the texts, how would the author of Text 2 most likely respond to the claim in Text 1?", choices: ["By agreeing that the printing press played a role but arguing that it was not sufficient by itself to raise literacy", "By arguing that the printing press had no effect on literacy", "By claiming that schools were less important than paper", "By agreeing that the printing press was the only important factor"], correct: 0, answerText: "A", explanation: "Text 2 concedes (\"certainly mattered\") but qualifies (\"not enough on their own\"). B is too extreme, and D contradicts Text 2." },
      { id: "rw-ct-h", level: "hard", passage: "Text 1: Octopuses can open jars, escape enclosures, and solve mazes. A biologist argues that this problem-solving shows that octopus intelligence is comparable to that of many mammals.", passage2: "Text 2: Tests of animal intelligence are typically designed around the abilities of mammals. Octopuses, whose nervous systems are organized very differently, may excel at abilities such tests barely measure. Ranking such different animals on a single scale of intelligence can therefore mislead.", prompt: "Based on the texts, how would the author of Text 2 most likely respond to the biologist's argument in Text 1?", choices: ["By questioning whether intelligence in such different animals can be meaningfully compared on one scale", "By arguing that octopuses are far more intelligent than any mammal", "By claiming that octopuses cannot actually solve problems", "By suggesting that tests for mammals are too easy for octopuses"], correct: 0, answerText: "A", explanation: "Text 2 doesn't dispute the octopus's abilities; it challenges the idea of comparing animals on a single scale — the basis of Text 1's claim." },
    ],
    keywords: ["cross-text", "two texts", "compare", "respond", "connections"],
  },
  // ─────────── EXPRESSION OF IDEAS ───────────
  {
    id: "transitions",
    domain: "expression",
    title: "Transitions",
    summary: "Choose the transition word or phrase that shows the logical relationship between ideas.",
    overview: [
      "Transition questions test logic, not grammar. Decide how the sentence with the blank relates to the one before it: does it continue, contrast, give an example, or show a result?",
      "Cover the choices, name the relationship, then pick the transition from that category. Several choices are often from the same category — if two mean the same thing, neither is likely correct.",
    ],
    looksLike: ["Which choice completes the text with the most logical transition?"],
    strategies: ["Read the sentence before AND the sentence with the blank.", "Name the relationship in one word: addition, contrast, cause/effect, example, sequence, emphasis.", "Know the families: However/Nevertheless (contrast); Therefore/As a result (effect); For example (illustration); Moreover/Additionally (addition); Similarly (comparison).", "Read your choice back in context to confirm it."],
    traps: ["Picking a transition because it \"sounds smart\".", "Reading only the sentence with the blank.", "Confusing contrast with concession (\"Admittedly\")."],
    questions: [
      { id: "rw-tr-e", level: "easy", passage: "Sea otters eat large numbers of sea urchins, which feed on kelp. ______ where otters are present, kelp forests tend to flourish.", prompt: "Which choice completes the text with the most logical transition?", choices: ["As a result,", "However,", "For example,", "Similarly,"], correct: 0, answerText: "A) As a result,", explanation: "Otters eat urchins → fewer urchins eat kelp → kelp flourishes. That is cause and effect." },
      { id: "rw-tr-m", level: "medium", passage: "The first trial of the new vaccine showed promising results. ______ researchers cautioned that the sample was small and that larger trials would be needed before drawing firm conclusions.", prompt: "Which choice completes the text with the most logical transition?", choices: ["However,", "Therefore,", "Likewise,", "For instance,"], correct: 0, answerText: "A) However,", explanation: "Promising results vs. a caution about them — a contrast." },
      { id: "rw-tr-h", level: "hard", passage: "Many early critics dismissed the composer's experimental symphony as mere noise. ______ one reviewer wrote that it \"resembled a kitchen falling down a staircase.\"", prompt: "Which choice completes the text with the most logical transition?", choices: ["Indeed,", "Nevertheless,", "In contrast,", "Consequently,"], correct: 0, answerText: "A) Indeed,", explanation: "The second sentence reinforces the first with a vivid example of the dismissal. \"Indeed\" emphasises and confirms. The review isn't a result (consequently) or a contrast." },
    ],
    keywords: ["transition", "logic", "however", "therefore", "connector"],
  },
  {
    id: "rhetorical-synthesis",
    domain: "expression",
    title: "Rhetorical Synthesis",
    summary: "Use a student's notes to write a sentence that achieves a specific goal.",
    overview: [
      "You'll see bullet-point notes and a goal, such as \"emphasize a difference\" or \"introduce the study to an unfamiliar audience\". Several choices are accurate — only one meets the goal.",
      "You don't need to read the notes closely at first. Read the goal, then check each choice against it.",
    ],
    looksLike: ["The student wants to emphasize … Which choice most effectively uses relevant information from the notes to accomplish this goal?"],
    strategies: ["Read the goal first and underline its key words (similarity, difference, audience, purpose).", "Check every choice against every part of the goal.", "For \"unfamiliar audience\" goals, the answer must explain or define key terms.", "Accuracy alone is not enough — every choice is usually accurate."],
    traps: ["An accurate sentence that doesn't address the goal.", "A choice that meets half of a two-part goal.", "Being distracted by the most detailed choice."],
    questions: [
      { id: "rw-rs-e", level: "easy", passage: "While researching a topic, a student has taken the following notes:\n• The axolotl is a salamander native to lakes near Mexico City.\n• Unlike most salamanders, axolotls keep their gills and remain aquatic as adults.\n• Axolotls can regrow lost limbs.\n• Scientists study axolotls to learn about tissue regeneration.", prompt: "The student wants to explain why scientists are interested in axolotls. Which choice most effectively uses relevant information from the notes to accomplish this goal?", choices: ["Because axolotls can regrow lost limbs, scientists study them to learn about tissue regeneration.", "The axolotl is a salamander native to lakes near Mexico City.", "Unlike most salamanders, axolotls keep their gills as adults.", "Axolotls remain aquatic as adults and live in lakes near Mexico City."], correct: 0, answerText: "A", explanation: "Only A mentions the scientists' interest and the reason for it. B, C, and D are accurate but don't address the goal." },
      { id: "rw-rs-m", level: "medium", passage: "While researching a topic, a student has taken the following notes:\n• Oda Brenn and Felix Marr were painters.\n• Brenn worked mainly in watercolor and painted coastal scenes.\n• Marr worked mainly in oil and painted busy city streets.\n• Both exhibited at the same gallery show in 1921.", prompt: "The student wants to emphasize a difference in the subjects the two painters chose. Which choice most effectively uses relevant information from the notes to accomplish this goal?", choices: ["While Brenn painted coastal scenes, Marr painted busy city streets.", "Brenn and Marr both exhibited at the same gallery show in 1921.", "Brenn worked mainly in watercolor.", "Brenn and Marr were painters whose work was shown in 1921."], correct: 0, answerText: "A", explanation: "The goal is a difference in subject matter. A contrasts coastal scenes with city streets. B and D emphasise a similarity, and C mentions only one painter's medium." },
      { id: "rw-rs-h", level: "hard", passage: "While researching a topic, a student has taken the following notes:\n• Mangroves are trees and shrubs that grow in salty water along tropical coastlines.\n• Their dense, tangled roots slow incoming waves.\n• Many coastal communities are planting mangroves as a natural barrier against storm surges.", prompt: "The student wants to explain to an audience unfamiliar with mangroves why coastal communities are planting them. Which choice most effectively uses relevant information from the notes to accomplish this goal?", choices: ["Mangroves—trees and shrubs that grow in salty water along tropical coastlines—have dense roots that slow waves, so many coastal communities plant them as a natural barrier against storm surges.", "Because their roots slow waves, mangroves are being planted by many coastal communities.", "Mangroves are trees and shrubs that grow in salty water along tropical coastlines.", "Many coastal communities are planting mangroves."], correct: 0, answerText: "A", explanation: "The goal has two parts: an unfamiliar audience (so define mangroves) and explain why communities plant them. Only A does both. B gives the reason but doesn't explain what mangroves are." },
    ],
    keywords: ["rhetorical synthesis", "notes", "goal", "audience"],
  },
  // ─────────── STANDARD ENGLISH CONVENTIONS ───────────
  {
    id: "boundaries",
    domain: "conventions",
    title: "Boundaries and Punctuation",
    summary: "Join and separate clauses correctly with periods, semicolons, colons, commas, and dashes.",
    overview: [
      "Boundary questions test how sentences and clauses are joined. The core skill is recognising an independent clause — a group of words that could stand alone as a sentence.",
      "Two independent clauses can be joined by a period, a semicolon, or a comma plus a FANBOYS conjunction (for, and, nor, but, or, yet, so). A comma alone creates a comma splice.",
      "Nonessential information is set off by a matching pair of punctuation marks: two commas, two dashes, or two parentheses. Never mix them.",
    ],
    looksLike: ["Which choice completes the text so that it conforms to the conventions of Standard English?"],
    strategies: ["Find the subject and verb on each side of the blank to see if both sides are independent clauses.", "Period = semicolon (both need independent clauses on each side).", "A colon needs an independent clause before it; what follows explains or lists.", "Check for a matching mark earlier in the sentence when nonessential elements are involved."],
    traps: ["Comma splices (two sentences joined by only a comma).", "Semicolons before a dependent clause or a list introduction.", "Mismatched pairs (a comma opening and a dash closing)."],
    questions: [
      { id: "rw-bd-e", level: "easy", passage: "The museum's newest exhibit features ancient pottery from across the Mediterranean ______ it will remain open until June.", prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?", choices: ["Mediterranean; it", "Mediterranean it", "Mediterranean, it", "Mediterranean, and, it"], correct: 0, answerText: "A", explanation: "Both sides are independent clauses, so they need a semicolon (or a period). B is a run-on, C is a comma splice, and D has an extra comma after \"and\"." },
      { id: "rw-bd-m", level: "medium", passage: "The researcher brought three essential tools on the expedition ______ a compass, a field notebook, and a portable microscope.", prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?", choices: ["expedition:", "expedition;", "expedition, and", "expedition"], correct: 0, answerText: "A) expedition:", explanation: "An independent clause introduces a list, so a colon is correct. A semicolon needs an independent clause after it, which a list is not." },
      { id: "rw-bd-h", level: "hard", passage: "Marine biologist Ines Ortega ______ has spent two decades studying coral reefs, will lead the new survey.", prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?", choices: [", who", "who", "; who", "—who"], correct: 0, answerText: "A) , who", explanation: "\"who has spent two decades studying coral reefs\" is nonessential information closed by a comma, so it must also open with a comma. A dash would create a mismatched pair." },
    ],
    keywords: ["punctuation", "semicolon", "colon", "comma", "comma splice", "run-on", "sentence boundaries", "sentence structure", "dash"],
  },
  {
    id: "form-structure-sense",
    domain: "conventions",
    title: "Form, Structure, and Sense",
    summary: "Subject-verb agreement, pronouns, verb tense, modifiers, possessives, and plurals.",
    overview: [
      "These questions test whether words fit together grammatically: verbs agree with subjects, pronouns agree with what they refer to, tenses stay consistent, and modifiers attach to the right noun.",
      "Many questions hide the true subject behind a long phrase. Cross out prepositional phrases (\"of the …\", \"in the …\") to find it.",
    ],
    looksLike: ["Which choice completes the text so that it conforms to the conventions of Standard English?"],
    strategies: ["Find the true subject: cross out phrases between the subject and the verb.", "Match pronouns to their nouns in number (singular/plural).", "Check surrounding verbs for the tense of the passage.", "After an introductory modifier (\"Having finished…,\"), the next noun must be the one doing the action."],
    traps: ["Making the verb agree with the nearest noun instead of the subject.", "Using \"it's\" (it is) for \"its\" (possessive).", "Dangling modifiers that describe the wrong noun."],
    questions: [
      { id: "rw-fss-e", level: "easy", passage: "The collection of rare maps ______ displayed in the library's west wing.", prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?", choices: ["is", "are", "were", "have been"], correct: 0, answerText: "A) is", explanation: "The subject is \"collection\" (singular), not \"maps\". Cross out \"of rare maps\" to see it." },
      { id: "rw-fss-m", level: "medium", passage: "After months of meetings, the committee members finished ______ report a week ahead of schedule.", prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?", choices: ["their", "its", "his", "it's"], correct: 0, answerText: "A) their", explanation: "The pronoun refers to \"members\" (plural), so \"their\" is correct. \"It's\" means \"it is\"." },
      { id: "rw-fss-h", level: "hard", passage: "Having analyzed hundreds of soil samples from the valley, ______", prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?", choices: ["the researchers concluded that the site had once been a riverbed.", "the site was determined to have once been a riverbed.", "a riverbed was what the researchers concluded the site had been.", "it was concluded by the researchers that the site had been a riverbed."], correct: 0, answerText: "A", explanation: "The people who analyzed the samples must come right after the comma. Only A places \"the researchers\" there; the others create dangling modifiers." },
    ],
    keywords: ["grammar", "subject-verb agreement", "pronoun", "verb tense", "verb forms", "modifier", "possessive", "basic grammar"],
  },
];

export const RW_BY_ID: Record<string, RWSkill> = Object.fromEntries(RW_SKILLS.map((s) => [s.id, s]));

export interface GrammarLesson {
  id: string;
  title: string;
  rule: string;
  correct: string;
  incorrect: string;
  tip: string;
}

export const GRAMMAR_LESSONS: GrammarLesson[] = [
  { id: "g-clauses", title: "Independent vs. dependent clauses", rule: "An independent clause has a subject and a verb and expresses a complete thought. A dependent clause starts with a word like because, although, which, or when and cannot stand alone.", correct: "Because the train was late, we missed the opening.", incorrect: "Because the train was late. We missed the opening.", tip: "If a group of words starts with a subordinating word, it can't be its own sentence." },
  { id: "g-semicolon", title: "Semicolons and colons", rule: "A semicolon joins two independent clauses. A colon follows an independent clause and introduces an explanation, example, or list.", correct: "The results were clear; the new method worked. / She packed one thing: a notebook.", incorrect: "The results were clear; because the new method worked.", tip: "Semicolon = period. Colon = \"here's what I mean\"." },
  { id: "g-comma-splice", title: "Comma splices & FANBOYS", rule: "Two independent clauses can't be joined by a comma alone. Use a period, a semicolon, or a comma + for/and/nor/but/or/yet/so.", correct: "The lab was closed, so the class met outdoors.", incorrect: "The lab was closed, the class met outdoors.", tip: "Words like however and therefore are not FANBOYS: use \"; however,\"." },
  { id: "g-nonessential", title: "Nonessential elements", rule: "Information that could be removed without changing the sentence's core meaning is set off by two commas, two dashes, or two parentheses.", correct: "The novel, which took ten years to write, won several awards.", incorrect: "The novel, which took ten years to write—won several awards.", tip: "Test it: delete the phrase. If the sentence still works, it's nonessential." },
  { id: "g-sva", title: "Subject-verb agreement", rule: "A verb must agree in number with its subject, not with the nearest noun.", correct: "The list of required books is posted online.", incorrect: "The list of required books are posted online.", tip: "Cross out prepositional phrases to find the real subject." },
  { id: "g-pronouns", title: "Pronoun agreement & case", rule: "Pronouns must match their antecedent in number. Use subject pronouns (I, he, they) as subjects and object pronouns (me, him, them) as objects.", correct: "The scientists shared their data. / The award went to her and me.", incorrect: "The company changed their logo. / The award went to she and I.", tip: "Company, team, committee (as a unit) are singular → its." },
  { id: "g-tense", title: "Verb tense consistency", rule: "Keep verb tenses consistent unless the timeline actually changes. Use the past perfect (had + verb) for an action completed before another past action.", correct: "By the time the guests arrived, the chef had finished the meal.", incorrect: "By the time the guests arrived, the chef finishes the meal.", tip: "Look at the other verbs in the passage to decide the tense." },
  { id: "g-modifiers", title: "Modifiers", rule: "An introductory modifier must be followed immediately by the noun it describes.", correct: "Walking to school, Haruka noticed a new bookshop.", incorrect: "Walking to school, a new bookshop caught Haruka's eye.", tip: "Ask: who is doing the -ing action? That noun goes right after the comma." },
  { id: "g-possessives", title: "Possessives and plurals", rule: "Singular possessive: 's (the student's book). Plural possessive: s' (the students' books). Its = possessive; it's = it is.", correct: "The team celebrated its victory. The researchers' findings were published.", incorrect: "The team celebrated it's victory. The researcher's findings (for many researchers).", tip: "Replace \"it's\" with \"it is\" — if it doesn't make sense, use \"its\"." },
];
