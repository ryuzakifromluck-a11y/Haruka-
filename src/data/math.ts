import type { Domain, MathDomainId, MathTopic } from "./content-types";

// All exercises below are original, AI-generated SAT-style practice — unofficial.

export const MATH_DOMAINS: Domain<MathDomainId>[] = [
  { id: "algebra", title: "Algebra", weight: "≈35% of Math", description: "Linear equations, linear functions, systems, and inequalities in one and two variables." },
  { id: "advanced", title: "Advanced Math", weight: "≈35% of Math", description: "Equivalent expressions, quadratics, exponentials, polynomials, radicals, and nonlinear equations." },
  { id: "psda", title: "Problem-Solving and Data Analysis", weight: "≈15% of Math", description: "Ratios, rates, percentages, statistics, probability, and data models." },
  { id: "geometry", title: "Geometry and Trigonometry", weight: "≈15% of Math", description: "Lines, angles, triangles, right-triangle trigonometry, circles, area, and volume." },
];

export const MATH_TOPICS: MathTopic[] = [
  // ─────────────── ALGEBRA ───────────────
  {
    id: "alg-linear-one",
    domain: "algebra",
    title: "Linear Equations in One Variable",
    summary: "Solve equations like 3(x − 4) + 2x = 9, spot no-solution and infinite-solution cases, and turn words into equations.",
    overview: [
      "A linear equation in one variable has the variable only to the first power. The goal is always the same: undo operations in reverse order until the variable is alone.",
      "The SAT loves two special cases. If simplifying leaves a false statement (like 4 = 9), the equation has no solution. If it leaves a true statement (like 4 = 4), it has infinitely many solutions.",
      "Word problems usually describe a starting value plus a rate. Name the unknown, write one equation, and check that your answer answers the actual question asked.",
    ],
    formulas: [
      { name: "Isolating x", expr: "ax + b = c  →  x = (c − b) / a", note: "a ≠ 0" },
      { name: "No solution", expr: "ax + b = ax + d, with b ≠ d", note: "Same x-coefficient, different constants." },
      { name: "Infinitely many solutions", expr: "ax + b = ax + b", note: "Both sides are identical after simplifying." },
      { name: "Starting value + rate", expr: "total = initial + rate × units" },
    ],
    examples: [
      { problem: "Solve 3(x − 4) + 2x = 2x + 9.", steps: ["Distribute: 3x − 12 + 2x = 2x + 9", "Combine like terms: 5x − 12 = 2x + 9", "Subtract 2x: 3x − 12 = 9", "Add 12 and divide by 3: x = 7"], answer: "x = 7" },
      { problem: "A gym charges a $25 sign-up fee plus $15 per month. Haruka paid $160 in total. For how many months did she pay?", steps: ["Let m = number of months.", "25 + 15m = 160", "15m = 135", "m = 9"], answer: "9 months" },
    ],
    questions: [
      { id: "m-alg1-e", level: "easy", prompt: "What value of x satisfies 4x + 7 = 31?", accept: [6], answerText: "6", explanation: "Subtract 7: 4x = 24. Divide by 4: x = 6." },
      { id: "m-alg1-m", level: "medium", prompt: "If 2(3x − 5) = 4x + 12, what is the value of x?", accept: [11], answerText: "11", explanation: "Distribute: 6x − 10 = 4x + 12. Subtract 4x: 2x − 10 = 12. Add 10: 2x = 22, so x = 11." },
      { id: "m-alg1-h", level: "hard", prompt: "In the equation 3(2x + k) = 6x + 15, k is a constant. For what value of k does the equation have infinitely many solutions?", accept: [5], answerText: "5", explanation: "The left side is 6x + 3k. For infinitely many solutions both sides must be identical, so 3k = 15 and k = 5." },
      { id: "m-alg1-s1", level: "sat", prompt: "The equation 5x − 2(x + 3) = 3x + c, where c is a constant, has infinitely many solutions. What is the value of c?", choices: ["−6", "−3", "0", "6"], correct: 0, answerText: "A) −6", explanation: "Simplify the left side: 5x − 2x − 6 = 3x − 6. Both sides match exactly when c = −6. Any other value of c gives no solution." },
      { id: "m-alg1-s2", level: "sat", prompt: "If (x + 5) / 3 = 4, what is the value of 2x − 1?", accept: [13], answerText: "13", explanation: "Multiply by 3: x + 5 = 12, so x = 7. Then 2x − 1 = 14 − 1 = 13. Always answer the question that was asked, not just x." },
    ],
    keywords: ["solve", "equation", "word problem", "no solution", "infinitely many"],
  },
  {
    id: "alg-linear-two",
    domain: "algebra",
    title: "Linear Equations in Two Variables & Linear Functions",
    summary: "Slope, intercepts, slope-intercept and point-slope form, parallel and perpendicular lines, and interpreting linear models.",
    overview: [
      "A linear function changes by the same amount every time x increases by 1. That constant change is the slope; the value when x = 0 is the y-intercept.",
      "You'll see lines in four forms: equations, tables, graphs, and word descriptions. Practise moving between them, because the SAT often gives one form and asks about another.",
      "In context, the slope is a rate (\"per hour\", \"per item\") and the y-intercept is a starting amount. Many questions only ask you to interpret one of these.",
    ],
    formulas: [
      { name: "Slope", expr: "m = (y₂ − y₁) / (x₂ − x₁)" },
      { name: "Slope-intercept form", expr: "y = mx + b", note: "b is the y-intercept." },
      { name: "Point-slope form", expr: "y − y₁ = m(x − x₁)" },
      { name: "Standard form", expr: "Ax + By = C  →  slope = −A/B, y-intercept = C/B" },
      { name: "Parallel / perpendicular", expr: "parallel: m₁ = m₂   perpendicular: m₁ · m₂ = −1" },
    ],
    examples: [
      { problem: "Find the equation of the line through (2, 5) and (6, 13).", steps: ["Slope: (13 − 5) / (6 − 2) = 8 / 4 = 2", "Use y = 2x + b with (2, 5): 5 = 4 + b", "b = 1"], answer: "y = 2x + 1" },
      { problem: "A taxi fare is modelled by f(x) = 2.5x + 4, where x is miles driven. Interpret 2.5 and 4.", steps: ["2.5 is the slope: the fare increases by $2.50 for each additional mile.", "4 is the y-intercept: the fare is $4 before any miles are driven (a base fee)."], answer: "$2.50 per mile; $4 base fee" },
    ],
    questions: [
      { id: "m-alg2-e", level: "easy", prompt: "What is the slope of the line passing through the points (1, 3) and (4, 12)?", accept: [3], answerText: "3", explanation: "m = (12 − 3) / (4 − 1) = 9 / 3 = 3." },
      { id: "m-alg2-m", level: "medium", prompt: "The graph of 3x + 4y = 24 crosses the y-axis at (0, b). What is the value of b?", accept: [6], answerText: "6", explanation: "On the y-axis x = 0, so 4y = 24 and y = 6." },
      { id: "m-alg2-h", level: "hard", prompt: "Line ℓ is perpendicular to the line y = (2/3)x − 1 and passes through the point (4, 1). What is the y-intercept of line ℓ?", accept: [7], answerText: "7", explanation: "Perpendicular slope = −3/2. Using (4, 1): 1 = (−3/2)(4) + b = −6 + b, so b = 7." },
      { id: "m-alg2-s1", level: "sat", prompt: "For the linear function f, f(2) = 7 and f(5) = 16. Which equation defines f?", choices: ["f(x) = 3x + 1", "f(x) = 3x − 1", "f(x) = 2x + 3", "f(x) = 9x − 11"], correct: 0, answerText: "A) f(x) = 3x + 1", explanation: "Slope = (16 − 7)/(5 − 2) = 3. Then 7 = 3(2) + b gives b = 1. Check: f(5) = 16 ✓. Choice C works for f(2) but not f(5) — always check both points." },
      { id: "m-alg2-s2", level: "sat", prompt: "The height of a candle, in centimetres, t hours after it is lit is modelled by h(t) = 30 − 1.5t. What is the best interpretation of 30 in this context?", choices: ["The height of the candle, in cm, when it is lit", "The number of cm the candle burns each hour", "The number of hours it takes the candle to burn completely", "The height of the candle, in cm, after 1 hour"], correct: 0, answerText: "A", explanation: "30 is the value of h when t = 0, so it is the initial height. 1.5 is the burn rate, and the candle burns out after 30 / 1.5 = 20 hours." },
    ],
    keywords: ["slope", "intercept", "graph", "linear function", "parallel", "perpendicular", "point-slope"],
  },
  {
    id: "alg-systems",
    domain: "algebra",
    title: "Systems of Linear Equations",
    summary: "Solve systems by substitution, elimination, or graphing, and decide when a system has zero, one, or infinitely many solutions.",
    overview: [
      "A system's solution is the point where the lines meet. Two different lines meet once; parallel lines never meet; identical lines meet everywhere.",
      "Elimination is usually fastest on the SAT: add or subtract the equations so one variable cancels. Substitution is best when one variable is already isolated.",
      "Hard questions add a constant (a parameter) and ask when the system has no solution or infinitely many. Compare the ratios of the coefficients.",
    ],
    formulas: [
      { name: "One solution", expr: "slopes are different" },
      { name: "No solution", expr: "a₁/a₂ = b₁/b₂ ≠ c₁/c₂", note: "Same slope, different intercept (parallel lines)." },
      { name: "Infinitely many solutions", expr: "a₁/a₂ = b₁/b₂ = c₁/c₂", note: "One equation is a multiple of the other." },
      { name: "Desmos shortcut", expr: "Type both equations, click the intersection point." },
    ],
    examples: [
      { problem: "Solve x + y = 10 and 2x − y = 5.", steps: ["Add the equations: 3x = 15", "x = 5", "Substitute: 5 + y = 10, so y = 5"], answer: "(5, 5)" },
      { problem: "Adult tickets cost $12 and child tickets $8. Twenty tickets were sold for $200. How many adult tickets were sold?", steps: ["a + c = 20 and 12a + 8c = 200", "Substitute c = 20 − a: 12a + 160 − 8a = 200", "4a = 40, so a = 10"], answer: "10 adult tickets" },
    ],
    questions: [
      { id: "m-sys-e", level: "easy", prompt: "If x + y = 12 and x − y = 4, what is the value of x?", accept: [8], answerText: "8", explanation: "Add the equations: 2x = 16, so x = 8." },
      { id: "m-sys-m", level: "medium", prompt: "3x + 2y = 16 and x − 2y = 0. What is the value of x + y?", accept: [6], answerText: "6", explanation: "Add the equations: 4x = 16, so x = 4. Then 4 − 2y = 0 gives y = 2. x + y = 6." },
      { id: "m-sys-h", level: "hard", prompt: "In the system 4x − 6y = 10 and kx − 9y = 15, k is a constant. For what value of k does the system have infinitely many solutions?", accept: [6], answerText: "6", explanation: "The second equation must be 1.5 times the first: −6 × 1.5 = −9 and 10 × 1.5 = 15. So k = 4 × 1.5 = 6." },
      { id: "m-sys-s1", level: "sat", prompt: "Which system of equations has no solution?", choices: ["y = 2x + 3 and y = 2x − 1", "y = 2x + 3 and y = −2x + 3", "y = 2x + 3 and 2y = 4x + 6", "y = 3x + 2 and y = 2x + 3"], correct: 0, answerText: "A", explanation: "A: same slope (2), different intercepts → parallel lines, no solution. C is the same line twice (infinitely many). B and D have different slopes (one solution)." },
      { id: "m-sys-s2", level: "sat", prompt: "A café sold 50 drinks. Coffees cost $3 and teas cost $2, and total sales were $130. How many coffees were sold?", choices: ["20", "25", "30", "35"], correct: 2, answerText: "C) 30", explanation: "c + t = 50 and 3c + 2t = 130. Substitute t = 50 − c: 3c + 100 − 2c = 130, so c = 30." },
    ],
    keywords: ["system", "elimination", "substitution", "parameter", "no solution", "intersection"],
  },
  {
    id: "alg-inequalities",
    domain: "algebra",
    title: "Linear Inequalities",
    summary: "Solve and graph inequalities, translate \"at least\" and \"at most\", and test points in systems of inequalities.",
    overview: [
      "Solve inequalities exactly like equations, with one extra rule: multiplying or dividing by a negative number flips the inequality sign.",
      "Word problems hinge on vocabulary: \"at least\" means ≥, \"at most\" and \"no more than\" mean ≤, \"more than\" means >.",
      "For systems of inequalities, the fastest SAT method is to test each answer choice in every inequality. A point must satisfy all of them.",
    ],
    formulas: [
      { name: "Sign flip", expr: "−2x > 6  →  x < −3" },
      { name: "Vocabulary", expr: "at least ≥   at most ≤   no more than ≤   fewer than <" },
      { name: "Graphs", expr: "≤, ≥ → solid line   <, > → dashed line" },
    ],
    examples: [
      { problem: "Solve −3x + 5 > 17.", steps: ["Subtract 5: −3x > 12", "Divide by −3 and flip: x < −4"], answer: "x < −4" },
      { problem: "Haruka has $60. She buys a $12 calculator and some $4 notebooks. What is the greatest number of notebooks she can buy?", steps: ["12 + 4n ≤ 60", "4n ≤ 48", "n ≤ 12"], answer: "12 notebooks" },
    ],
    questions: [
      { id: "m-ineq-e", level: "easy", prompt: "What is the greatest integer x that satisfies 2x + 3 < 15?", accept: [5], answerText: "5", explanation: "2x < 12, so x < 6. The greatest integer less than 6 is 5." },
      { id: "m-ineq-m", level: "medium", prompt: "What is the greatest value of x that satisfies −4(x − 2) ≥ 20?", accept: [-3], answerText: "−3", explanation: "−4x + 8 ≥ 20 → −4x ≥ 12 → x ≤ −3 (sign flips). The greatest value is −3." },
      { id: "m-ineq-h", level: "hard", prompt: "Which point (x, y) is a solution to the system y > 2x − 1 and y ≤ −x + 5?", choices: ["(1, 3)", "(2, 4)", "(3, 1)", "(−1, −4)"], correct: 0, answerText: "A) (1, 3)", explanation: "(1, 3): 3 > 1 ✓ and 3 ≤ 4 ✓. (2, 4) fails the second (4 ≤ 3 is false). (3, 1) fails the first (1 > 5 is false). (−1, −4) fails the first (−4 > −3 is false)." },
      { id: "m-ineq-s1", level: "sat", prompt: "A delivery van can carry at most 1,200 kg. The driver weighs 80 kg and each box weighs 25 kg. Which inequality represents the number of boxes, b, the van can carry with the driver?", choices: ["25b + 80 ≤ 1,200", "25b + 80 ≥ 1,200", "80b + 25 ≤ 1,200", "25b ≤ 1,200 + 80"], correct: 0, answerText: "A", explanation: "Total weight = driver + boxes = 80 + 25b, and \"at most\" means ≤ 1,200." },
      { id: "m-ineq-s2", level: "sat", prompt: "Using the situation above (80 + 25b ≤ 1,200), what is the maximum number of boxes the van can carry?", accept: [44], answerText: "44", explanation: "25b ≤ 1,120 → b ≤ 44.8. Boxes must be whole, so the maximum is 44 (rounding up to 45 would exceed the limit)." },
    ],
    keywords: ["inequality", "at least", "at most", "system of inequalities", "graph"],
  },
  // ─────────────── ADVANCED MATH ───────────────
  {
    id: "adv-equivalent",
    domain: "advanced",
    title: "Equivalent Expressions & Polynomials",
    summary: "Expand, factor, and simplify polynomial and rational expressions; match coefficients.",
    overview: [
      "\"Equivalent\" means equal for every allowed value of x. You can prove equivalence algebraically or check quickly by substituting a number like x = 2 into the original and each answer choice.",
      "Know the three special products by heart — they turn hard-looking factoring questions into one-step recognitions.",
      "When an identity holds \"for all values of x\", the coefficients of matching powers of x must be equal. This is how you find unknown constants.",
    ],
    formulas: [
      { name: "Square of a sum", expr: "(a + b)² = a² + 2ab + b²" },
      { name: "Square of a difference", expr: "(a − b)² = a² − 2ab + b²" },
      { name: "Difference of squares", expr: "a² − b² = (a + b)(a − b)" },
      { name: "Factoring x² + bx + c", expr: "(x + p)(x + q) where p + q = b and pq = c" },
      { name: "Matching coefficients", expr: "ax² + bx + c ≡ dx² + ex + f  →  a = d, b = e, c = f" },
    ],
    examples: [
      { problem: "Expand (2x − 3)(x + 5).", steps: ["2x · x = 2x²", "2x · 5 = 10x and −3 · x = −3x", "−3 · 5 = −15", "Combine: 2x² + 7x − 15"], answer: "2x² + 7x − 15" },
      { problem: "Factor 9x² − 16.", steps: ["Recognise a difference of squares: (3x)² − 4²", "Apply a² − b² = (a + b)(a − b)"], answer: "(3x + 4)(3x − 4)" },
    ],
    questions: [
      { id: "m-eq-e", level: "easy", prompt: "Which expression is equivalent to 3(x + 4) − 2(x − 1)?", choices: ["x + 10", "x + 14", "x + 13", "5x + 14"], correct: 1, answerText: "B) x + 14", explanation: "3x + 12 − 2x + 2 = x + 14. Watch the sign: −2 · (−1) = +2." },
      { id: "m-eq-m", level: "medium", prompt: "Which expression is equivalent to x² − 10x + 25?", choices: ["(x + 5)²", "(x − 5)²", "(x − 25)(x − 1)", "(x − 5)(x + 5)"], correct: 1, answerText: "B) (x − 5)²", explanation: "x² − 10x + 25 = x² − 2(5)x + 5², a perfect square: (x − 5)²." },
      { id: "m-eq-h", level: "hard", prompt: "(ax + 2)(3x + b) = 12x² − 14x − 10 for all values of x, where a and b are constants. What is the value of a − b?", accept: [9], answerText: "9", explanation: "Expanding: 3a·x² + (ab + 6)x + 2b. Match: 3a = 12 → a = 4; 2b = −10 → b = −5. Check: ab + 6 = −20 + 6 = −14 ✓. So a − b = 4 − (−5) = 9." },
      { id: "m-eq-s1", level: "sat", prompt: "Which expression is equivalent to (x² − 9) / (x + 3), for x ≠ −3?", choices: ["x + 3", "x − 3", "x − 9", "x² − 3"], correct: 1, answerText: "B) x − 3", explanation: "x² − 9 = (x + 3)(x − 3). Cancel the common factor (x + 3) to get x − 3." },
      { id: "m-eq-s2", level: "sat", prompt: "Which expression is equivalent to 2x(3x − 1) − (x² − 4x)?", choices: ["5x² + 2x", "5x² − 6x", "7x² + 2x", "5x² − 2x"], correct: 0, answerText: "A) 5x² + 2x", explanation: "6x² − 2x − x² + 4x = 5x² + 2x. Distribute the negative sign to both terms in the parentheses." },
    ],
    keywords: ["expand", "factor", "polynomial", "equivalent", "coefficient", "rational expression"],
  },
  {
    id: "adv-quadratics",
    domain: "advanced",
    title: "Quadratic Equations & Functions",
    summary: "Factoring, the quadratic formula, the discriminant, vertex form, maximum/minimum, and roots.",
    overview: [
      "Quadratics appear in three forms, and each one shows something directly: standard form ax² + bx + c shows the y-intercept c; factored form a(x − r)(x − s) shows the zeros r and s; vertex form a(x − h)² + k shows the vertex (h, k).",
      "The discriminant b² − 4ac tells you how many real solutions there are without solving. This is a favourite hard-question tool.",
      "If a > 0 the parabola opens up and the vertex is a minimum; if a < 0 it opens down and the vertex is a maximum. Desmos shows the vertex instantly when you click the graph.",
    ],
    formulas: [
      { name: "Quadratic formula", expr: "x = (−b ± √(b² − 4ac)) / (2a)" },
      { name: "Discriminant", expr: "D = b² − 4ac:  D > 0 two real,  D = 0 one real,  D < 0 none" },
      { name: "Vertex x-coordinate", expr: "x = −b / (2a)" },
      { name: "Vertex form", expr: "f(x) = a(x − h)² + k  →  vertex (h, k)" },
      { name: "Sum and product of roots", expr: "sum = −b/a   product = c/a" },
    ],
    examples: [
      { problem: "Solve x² − 5x − 14 = 0.", steps: ["Find two numbers that multiply to −14 and add to −5: −7 and 2", "(x − 7)(x + 2) = 0", "x = 7 or x = −2"], answer: "x = 7 or x = −2" },
      { problem: "Find the minimum value of f(x) = 2x² − 12x + 11.", steps: ["Vertex x = −(−12)/(2·2) = 3", "f(3) = 18 − 36 + 11 = −7", "a = 2 > 0, so this is a minimum: f(x) = 2(x − 3)² − 7"], answer: "Minimum −7 at x = 3" },
    ],
    questions: [
      { id: "m-quad-e", level: "easy", prompt: "What is the positive solution to x² − 3x − 10 = 0?", accept: [5], answerText: "5", explanation: "Factor: (x − 5)(x + 2) = 0, so x = 5 or x = −2. The positive solution is 5." },
      { id: "m-quad-m", level: "medium", prompt: "The function f is defined by f(x) = −(x − 4)² + 9. What is the sum of the x-intercepts of the graph of y = f(x)?", accept: [8], answerText: "8", explanation: "Set f(x) = 0: (x − 4)² = 9, so x − 4 = ±3 and x = 1 or 7. Sum = 8. Shortcut: the intercepts are symmetric around the axis x = 4, so the sum is 2 × 4." },
      { id: "m-quad-h", level: "hard", prompt: "The equation 2x² − kx + 8 = 0, where k is a positive constant, has exactly one real solution. What is the value of k?", accept: [8], answerText: "8", explanation: "Exactly one solution means D = 0: (−k)² − 4(2)(8) = 0 → k² = 64 → k = 8 (k is positive)." },
      { id: "m-quad-s1", level: "sat", prompt: "A ball's height, in feet, t seconds after it is thrown is h(t) = −16t² + 64t + 5. What is the maximum height of the ball, in feet?", choices: ["64", "69", "72", "133"], correct: 1, answerText: "B) 69", explanation: "Vertex at t = −64 / (2 · −16) = 2. h(2) = −64 + 128 + 5 = 69." },
      { id: "m-quad-s2", level: "sat", prompt: "Which equation has no real solutions?", choices: ["x² + 4x + 5 = 0", "x² + 4x + 4 = 0", "x² + 4x − 5 = 0", "x² − 4x + 3 = 0"], correct: 0, answerText: "A", explanation: "Discriminants: A: 16 − 20 = −4 < 0 (none). B: 0 (one). C: 16 + 20 = 36 (two). D: 16 − 12 = 4 (two)." },
    ],
    keywords: ["quadratic", "parabola", "vertex", "discriminant", "roots", "zeros", "maximum", "minimum", "factoring"],
  },
  {
    id: "adv-exponential",
    domain: "advanced",
    title: "Exponents, Radicals & Exponential Functions",
    summary: "Exponent rules, rational exponents, and exponential growth and decay models.",
    overview: [
      "Exponent rules let you rewrite expressions quickly. Rational exponents connect powers and roots: the denominator is the root, the numerator is the power.",
      "Exponential functions multiply by the same factor each step. Growth of r% means multiplying by (1 + r); decay of r% means multiplying by (1 − r).",
      "To solve equations like 9ˣ = 27ˣ⁻¹, rewrite both sides with the same base and set the exponents equal.",
    ],
    formulas: [
      { name: "Product & power rules", expr: "aᵐ · aⁿ = aᵐ⁺ⁿ   (aᵐ)ⁿ = aᵐⁿ   aᵐ / aⁿ = aᵐ⁻ⁿ" },
      { name: "Negative & zero exponents", expr: "a⁻ⁿ = 1 / aⁿ   a⁰ = 1" },
      { name: "Rational exponents", expr: "a^(m/n) = ⁿ√(aᵐ)" },
      { name: "Growth / decay", expr: "y = a(1 + r)ᵗ   y = a(1 − r)ᵗ" },
      { name: "Doubling / halving", expr: "y = a · 2^(t/d)   y = a · (1/2)^(t/h)" },
    ],
    examples: [
      { problem: "Simplify (8x⁶)^(2/3).", steps: ["8^(2/3) = (∛8)² = 2² = 4", "(x⁶)^(2/3) = x⁴"], answer: "4x⁴" },
      { problem: "A town of 2,000 grows by 5% per year. What is the population after 2 years?", steps: ["P(t) = 2000(1.05)ᵗ", "P(2) = 2000 × 1.1025"], answer: "2,205" },
    ],
    questions: [
      { id: "m-exp-e", level: "easy", prompt: "If 2ˣ = 32, what is the value of x?", accept: [5], answerText: "5", explanation: "32 = 2⁵, so x = 5." },
      { id: "m-exp-m", level: "medium", prompt: "Which expression is equivalent to x^(3/2) for x > 0?", choices: ["∛(x²)", "x√x", "x³ / 2", "1 / √(x³)"], correct: 1, answerText: "B) x√x", explanation: "x^(3/2) = x^1 · x^(1/2) = x√x. Choice A is x^(2/3) — the root and power are swapped." },
      { id: "m-exp-h", level: "hard", prompt: "If 9ˣ = 27^(x − 1), what is the value of x?", accept: [3], answerText: "3", explanation: "Rewrite with base 3: 3^(2x) = 3^(3x − 3). So 2x = 3x − 3 and x = 3." },
      { id: "m-exp-s1", level: "sat", prompt: "A car is worth $24,000 and loses 15% of its value each year. Which function models its value, in dollars, after t years?", choices: ["V(t) = 24,000(0.15)ᵗ", "V(t) = 24,000(0.85)ᵗ", "V(t) = 24,000(1.15)ᵗ", "V(t) = 24,000 − 0.15t"], correct: 1, answerText: "B", explanation: "Losing 15% leaves 85% each year, so multiply by 0.85 each year." },
      { id: "m-exp-s2", level: "sat", prompt: "The function f(x) = 500(1.03)ˣ models a quantity. Which statement best describes f?", choices: ["It increases by 3% for each increase of 1 in x.", "It increases by 3 for each increase of 1 in x.", "It increases by 103% for each increase of 1 in x.", "It decreases by 3% for each increase of 1 in x."], correct: 0, answerText: "A", explanation: "A base of 1.03 means multiplying by 1 + 0.03 each step: a 3% increase." },
    ],
    keywords: ["exponent", "radical", "root", "growth", "decay", "exponential", "percent"],
  },
  {
    id: "adv-nonlinear",
    domain: "advanced",
    title: "Nonlinear Equations & Systems",
    summary: "Radical and rational equations, extraneous solutions, and linear–quadratic systems.",
    overview: [
      "For radical equations, isolate the root and square both sides. Squaring can create extraneous solutions, so always check answers in the original equation.",
      "For rational equations, multiply through by the common denominator, solve, and reject any value that makes a denominator zero.",
      "A line and a parabola can meet 0, 1, or 2 times. Set the expressions equal and look at the resulting quadratic — its discriminant counts the intersections.",
    ],
    formulas: [
      { name: "Radical equations", expr: "isolate √ → square both sides → check for extraneous roots" },
      { name: "Rational equations", expr: "multiply by LCD → solve → exclude zeros of denominators" },
      { name: "Linear–quadratic system", expr: "set equal → quadratic = 0 → discriminant = number of intersections" },
    ],
    examples: [
      { problem: "Solve √(x + 7) = x − 5.", steps: ["Square: x + 7 = x² − 10x + 25", "x² − 11x + 18 = 0 → (x − 9)(x − 2) = 0", "Check x = 9: √16 = 4 and 9 − 5 = 4 ✓", "Check x = 2: √9 = 3 but 2 − 5 = −3 ✗ (extraneous)"], answer: "x = 9" },
      { problem: "Solve the system y = x² − 4x + 3 and y = x − 1.", steps: ["x² − 4x + 3 = x − 1", "x² − 5x + 4 = 0 → (x − 1)(x − 4) = 0", "x = 1 → y = 0; x = 4 → y = 3"], answer: "(1, 0) and (4, 3)" },
    ],
    questions: [
      { id: "m-nl-e", level: "easy", prompt: "If √(2x + 1) = 5, what is the value of x?", accept: [12], answerText: "12", explanation: "Square both sides: 2x + 1 = 25, so x = 12. Check: √25 = 5 ✓." },
      { id: "m-nl-m", level: "medium", prompt: "What value of x satisfies 6 / (x − 1) = 3 / 2?", accept: [5], answerText: "5", explanation: "Cross-multiply: 12 = 3(x − 1), so x − 1 = 4 and x = 5." },
      { id: "m-nl-h", level: "hard", prompt: "The graphs of y = x² + 2 and y = 2x + k, where k is a constant, intersect at exactly one point. What is the value of k?", accept: [1], answerText: "1", explanation: "x² + 2 = 2x + k → x² − 2x + (2 − k) = 0. One intersection means D = 0: 4 − 4(2 − k) = 0 → 4k = 4 → k = 1." },
      { id: "m-nl-s1", level: "sat", prompt: "How many real solutions does the system y = x² − 1 and y = −2 have?", choices: ["Zero", "Exactly one", "Exactly two", "Infinitely many"], correct: 0, answerText: "A) Zero", explanation: "x² − 1 = −2 gives x² = −1, which has no real solutions. The parabola's minimum is −1, so it never reaches y = −2." },
      { id: "m-nl-s2", level: "sat", prompt: "What is the solution to (x² − 4) / (x − 2) = 5?", choices: ["x = 2", "x = 3", "x = 7", "There is no solution."], correct: 1, answerText: "B) x = 3", explanation: "For x ≠ 2, (x² − 4)/(x − 2) = x + 2. So x + 2 = 5 and x = 3. x = 2 is not allowed because it makes the denominator zero." },
    ],
    keywords: ["radical", "rational", "extraneous", "nonlinear system", "intersection"],
  },
  // ─────────────── PSDA ───────────────
  {
    id: "psda-ratios",
    domain: "psda",
    title: "Ratios, Rates, Proportions & Percentages",
    summary: "Percent change, successive percentages, proportions, rates, and unit conversions.",
    overview: [
      "Think of percentages as multipliers: a 20% increase is × 1.2, a 20% decrease is × 0.8. Successive changes multiply — they do not add.",
      "Set up proportions with matching units in matching positions, then cross-multiply.",
      "For unit conversions, write each conversion as a fraction and cancel units until only the units you want remain.",
    ],
    formulas: [
      { name: "Percent change", expr: "(new − old) / old × 100%" },
      { name: "Percent of a number", expr: "part = (percent / 100) × whole" },
      { name: "Multipliers", expr: "increase r% → × (1 + r/100)   decrease r% → × (1 − r/100)" },
      { name: "Proportion", expr: "a / b = c / d  →  ad = bc" },
      { name: "Ratio parts", expr: "ratio a : b, total T → first part = a/(a + b) × T" },
    ],
    examples: [
      { problem: "A price rises from $80 to $92. What is the percent increase?", steps: ["Change = 92 − 80 = 12", "12 / 80 = 0.15"], answer: "15%" },
      { problem: "Convert 60 miles per hour to feet per second (1 mile = 5,280 feet).", steps: ["60 mi/h × 5,280 ft/mi = 316,800 ft/h", "316,800 ÷ 3,600 s/h = 88"], answer: "88 ft/s" },
    ],
    questions: [
      { id: "m-rat-e", level: "easy", prompt: "What is 30% of 250?", accept: [75], answerText: "75", explanation: "0.30 × 250 = 75." },
      { id: "m-rat-m", level: "medium", prompt: "A jacket originally cost $50. Its price was increased by 20%, and then the new price was decreased by 20%. What is the final price, in dollars?", accept: [48], answerText: "48", explanation: "50 × 1.2 × 0.8 = 50 × 0.96 = 48. A 20% rise followed by a 20% drop is not a return to the start." },
      { id: "m-rat-h", level: "hard", prompt: "A number is increased by 25%. The result is then decreased by p%, giving the original number. What is the value of p?", accept: [20], answerText: "20", explanation: "1.25 × (1 − p/100) = 1 → 1 − p/100 = 0.8 → p = 20." },
      { id: "m-rat-s1", level: "sat", prompt: "A recipe uses flour and sugar in a ratio of 5 to 2 by volume. If a baker uses 21 cups of flour and sugar combined, how many cups of flour are used?", choices: ["6", "14", "15", "18"], correct: 2, answerText: "C) 15", explanation: "There are 5 + 2 = 7 parts; each part is 21 / 7 = 3 cups. Flour = 5 × 3 = 15 cups." },
      { id: "m-rat-s2", level: "sat", prompt: "A printer prints 45 pages in 3 minutes. At this rate, how many pages does it print in 20 minutes?", choices: ["135", "270", "300", "900"], correct: 2, answerText: "C) 300", explanation: "Rate = 45 / 3 = 15 pages per minute. 15 × 20 = 300." },
    ],
    keywords: ["ratio", "rate", "percent", "proportion", "unit conversion", "fractions"],
  },
  {
    id: "psda-statistics",
    domain: "psda",
    title: "Statistics: Center & Spread",
    summary: "Mean, median, range, and what standard deviation tells you; effects of outliers and transformations.",
    overview: [
      "The mean is the balance point; the median is the middle value. Outliers pull the mean much more than the median.",
      "The SAT doesn't ask you to compute standard deviation, but it does ask you to compare it: data clustered near the mean has a small SD; data spread out has a large SD.",
      "For \"missing value\" questions, work with totals: total = mean × count.",
    ],
    formulas: [
      { name: "Mean", expr: "mean = (sum of values) / (number of values)" },
      { name: "Total from mean", expr: "sum = mean × n" },
      { name: "Median", expr: "middle value (average of the two middle values if n is even)" },
      { name: "Range", expr: "maximum − minimum" },
      { name: "Shifting data", expr: "add k to every value: mean and median +k, SD and range unchanged" },
    ],
    examples: [
      { problem: "Find the mean, median, and range of 4, 7, 7, 9, 13.", steps: ["Sum = 40, so mean = 40 / 5 = 8", "Middle value (3rd of 5) = 7", "Range = 13 − 4 = 9"], answer: "Mean 8, median 7, range 9" },
      { problem: "Haruka's mean on 5 quizzes is 82. What must she score on the 6th quiz to raise her mean to 84?", steps: ["Current total = 82 × 5 = 410", "Needed total = 84 × 6 = 504", "504 − 410 = 94"], answer: "94" },
    ],
    questions: [
      { id: "m-stat-e", level: "easy", prompt: "What is the mean of 3, 8, 10, and 11?", accept: [8], answerText: "8", explanation: "Sum = 32; 32 / 4 = 8." },
      { id: "m-stat-m", level: "medium", prompt: "What is the median of the data set 12, 5, 9, 20, 7, 15?", accept: [10.5], answerText: "10.5", explanation: "Order the data: 5, 7, 9, 12, 15, 20. With 6 values, average the 3rd and 4th: (9 + 12) / 2 = 10.5." },
      { id: "m-stat-h", level: "hard", prompt: "The mean of 8 numbers is 15. When one number is removed, the mean of the remaining 7 numbers is 14. What number was removed?", accept: [22], answerText: "22", explanation: "Original total = 8 × 15 = 120. New total = 7 × 14 = 98. Removed number = 120 − 98 = 22." },
      { id: "m-stat-s1", level: "sat", prompt: "Data set A: 10, 20, 30, 40, 50. Data set B: 28, 29, 30, 31, 32. Which statement is true?", choices: ["The means are equal, and the standard deviation of A is greater.", "The means are equal, and the standard deviation of B is greater.", "The mean of A is greater than the mean of B.", "The standard deviations are equal."], correct: 0, answerText: "A", explanation: "Both means are 30. A's values are much farther from 30, so A has the larger standard deviation." },
      { id: "m-stat-s2", level: "sat", prompt: "Each value in a data set is increased by 5. Which statement is true?", choices: ["The mean and median each increase by 5; the standard deviation is unchanged.", "The mean, median, and standard deviation each increase by 5.", "The standard deviation increases; the mean is unchanged.", "None of the mean, median, or standard deviation changes."], correct: 0, answerText: "A", explanation: "Shifting every value moves the center by 5 but doesn't change how spread out the values are." },
    ],
    keywords: ["mean", "median", "range", "standard deviation", "outlier", "average"],
  },
  {
    id: "psda-probability",
    domain: "psda",
    title: "Probability & Two-Way Tables",
    summary: "Simple and conditional probability, complements, and expected counts from tables.",
    overview: [
      "Probability = favourable outcomes / total outcomes. In two-way tables, the key is choosing the correct total — the whole table, a row, or a column.",
      "\"Given that\" (conditional probability) shrinks the total to just that row or column.",
      "Expected count = probability × number of trials. This turns a percentage into an actual prediction.",
    ],
    formulas: [
      { name: "Probability", expr: "P(A) = favourable / total" },
      { name: "Complement", expr: "P(not A) = 1 − P(A)" },
      { name: "Conditional", expr: "P(A | B) = count(A and B) / count(B)" },
      { name: "Either / or", expr: "P(A or B) = P(A) + P(B) − P(A and B)" },
      { name: "Independent events", expr: "P(A and B) = P(A) · P(B)" },
    ],
    examples: [
      { problem: "A survey of 200 students: Grade 11 — 45 prefer coffee, 35 prefer tea (80 total). Grade 12 — 75 coffee, 45 tea (120 total). Column totals: 120 coffee, 80 tea. What is the probability that a student who prefers tea is in Grade 12?", steps: ["\"Who prefers tea\" → use the Tea column total: 80", "Grade 12 and tea: 45", "45 / 80 = 9/16"], answer: "9/16" },
    ],
    questions: [
      { id: "m-prob-e", level: "easy", prompt: "A bag contains 4 red marbles and 6 blue marbles. One marble is chosen at random. What is the probability it is red? (Enter a decimal or fraction.)", accept: [0.4], answerText: "0.4 (or 2/5)", explanation: "4 red out of 10 total = 4/10 = 0.4." },
      { id: "m-prob-m", level: "medium", prompt: "Using the table, if a student who prefers coffee is chosen at random, what is the probability the student is in Grade 11?", table: { headers: ["", "Coffee", "Tea", "Total"], rows: [["Grade 11", 45, 35, 80], ["Grade 12", 75, 45, 120], ["Total", 120, 80, 200]] }, choices: ["45/200", "45/80", "3/8", "9/16"], correct: 2, answerText: "C) 3/8", explanation: "Condition on coffee: total = 120. Grade 11 and coffee = 45. 45/120 = 3/8." },
      { id: "m-prob-h", level: "hard", prompt: "In a class, 60% of students study Spanish, 30% study French, and 10% study both. What is the probability that a randomly chosen student studies neither language? (Enter a decimal.)", accept: [0.2], answerText: "0.2", explanation: "P(Spanish or French) = 0.6 + 0.3 − 0.1 = 0.8. P(neither) = 1 − 0.8 = 0.2." },
      { id: "m-prob-s1", level: "sat", prompt: "Using the same survey table, what is the probability that a randomly chosen student from all 200 is in Grade 12 and prefers tea?", table: { headers: ["", "Coffee", "Tea", "Total"], rows: [["Grade 11", 45, 35, 80], ["Grade 12", 75, 45, 120], ["Total", 120, 80, 200]] }, choices: ["9/40", "9/16", "3/8", "45/120"], correct: 0, answerText: "A) 9/40", explanation: "No condition, so the total is all 200 students. Grade 12 and tea = 45. 45/200 = 9/40." },
      { id: "m-prob-s2", level: "sat", prompt: "A factory finds that 3% of its light bulbs are defective. In a batch of 1,500 bulbs, how many are expected to be defective?", accept: [45], answerText: "45", explanation: "0.03 × 1,500 = 45." },
    ],
    keywords: ["probability", "two-way table", "conditional", "expected value", "chance"],
  },
  {
    id: "psda-data-models",
    domain: "psda",
    title: "Data Models, Scatterplots & Inference",
    summary: "Lines of best fit, residuals, linear vs. exponential data, sampling, and margin of error.",
    overview: [
      "A line of best fit summarises a scatterplot. Its slope is the predicted change in y per unit of x; use the equation to make predictions.",
      "Linear data changes by a constant difference; exponential data changes by a constant ratio. Check consecutive values to tell them apart.",
      "Survey results generalise only to the population that was randomly sampled. A margin of error gives a range of plausible values for the population.",
    ],
    formulas: [
      { name: "Residual", expr: "residual = actual − predicted" },
      { name: "Linear vs. exponential", expr: "constant difference → linear   constant ratio → exponential" },
      { name: "Margin of error", expr: "estimate ± margin = plausible range for the population" },
      { name: "Causation", expr: "only a randomised experiment supports cause-and-effect conclusions" },
    ],
    examples: [
      { problem: "A plant's height is modelled by y = 0.6x + 4 (cm, x weeks). Predict the height at 10 weeks. If the actual height is 11.2 cm, what is the residual?", steps: ["Predicted: 0.6 × 10 + 4 = 10 cm", "Residual: 11.2 − 10 = 1.2 cm"], answer: "10 cm predicted; residual 1.2 cm" },
      { problem: "Is the pattern 3, 6, 12, 24 linear or exponential?", steps: ["Differences: 3, 6, 12 — not constant", "Ratios: 2, 2, 2 — constant"], answer: "Exponential (ratio 2)" },
    ],
    questions: [
      { id: "m-dm-e", level: "easy", prompt: "The model y = 2.5x + 40 estimates a monthly phone bill y, in dollars, when x gigabytes of data are used. What does 2.5 represent?", choices: ["Each additional gigabyte increases the estimated bill by $2.50.", "The estimated bill when no data is used.", "The number of gigabytes used per month.", "The bill increases by 2.5% per gigabyte."], correct: 0, answerText: "A", explanation: "2.5 is the slope: the change in the bill for each additional gigabyte. $40 is the bill when x = 0." },
      { id: "m-dm-m", level: "medium", prompt: "The line of best fit for a data set is y = −0.8x + 95. What is the predicted value of y when x = 25?", accept: [75], answerText: "75", explanation: "−0.8 × 25 + 95 = −20 + 95 = 75." },
      { id: "m-dm-h", level: "hard", prompt: "Which equation models the data in the table?", table: { headers: ["x", "0", "1", "2", "3"], rows: [["y", 5, 15, 45, 135]] }, choices: ["y = 10x + 5", "y = 5(3)ˣ", "y = 3(5)ˣ", "y = 5x + 10"], correct: 1, answerText: "B) y = 5(3)ˣ", explanation: "Each y is 3 times the previous one (constant ratio), and y = 5 at x = 0. So y = 5(3)ˣ." },
      { id: "m-dm-s1", level: "sat", prompt: "A researcher surveyed 400 randomly selected residents of a city. 64% supported a new park, with a margin of error of 4%. Which conclusion is most appropriate?", choices: ["It is plausible that between 60% and 68% of all city residents support the park.", "Exactly 64% of all city residents support the park.", "Between 60% and 68% of all residents of the country support the park.", "64% of residents in every neighbourhood support the park."], correct: 0, answerText: "A", explanation: "A random sample supports conclusions about the population sampled (the city), as a range: 64% ± 4%." },
      { id: "m-dm-s2", level: "sat", prompt: "A model predicts y = 0.6x + 4. For x = 15, the actual value is 14.5. What is the residual?", accept: [1.5], answerText: "1.5", explanation: "Predicted = 0.6 × 15 + 4 = 13. Residual = 14.5 − 13 = 1.5." },
    ],
    keywords: ["scatterplot", "line of best fit", "residual", "sample", "margin of error", "model", "tables", "graphs"],
  },
  // ─────────────── GEOMETRY ───────────────
  {
    id: "geo-lines-triangles",
    domain: "geometry",
    title: "Lines, Angles & Triangles",
    summary: "Angle relationships, parallel lines, triangle sums, exterior angles, and similar triangles.",
    overview: [
      "Most angle questions are solved with three facts: a straight line is 180°, vertical angles are equal, and a triangle's angles sum to 180°.",
      "When parallel lines are cut by a transversal, all the acute angles are equal, all the obtuse angles are equal, and any acute + obtuse pair sums to 180°.",
      "Similar triangles have equal angles and proportional sides. If side lengths scale by k, areas scale by k².",
    ],
    formulas: [
      { name: "Triangle angle sum", expr: "∠A + ∠B + ∠C = 180°" },
      { name: "Exterior angle", expr: "exterior angle = sum of the two remote interior angles" },
      { name: "Parallel lines", expr: "corresponding & alternate interior angles are equal; same-side interior angles sum to 180°" },
      { name: "Similar triangles", expr: "AB/DE = BC/EF = AC/DF = k;  area ratio = k²" },
      { name: "Triangle inequality", expr: "each side < sum of the other two sides" },
    ],
    examples: [
      { problem: "A triangle's angles are x°, 2x°, and 3x°. Find each angle.", steps: ["x + 2x + 3x = 180", "6x = 180 → x = 30"], answer: "30°, 60°, 90°" },
      { problem: "In triangle ABC, DE ∥ BC with D on AB and E on AC. AD = 4, DB = 6, and DE = 5. Find BC.", steps: ["Triangles ADE and ABC are similar.", "AB = 4 + 6 = 10, so the scale factor is 10 / 4 = 2.5", "BC = 5 × 2.5"], answer: "BC = 12.5" },
    ],
    questions: [
      { id: "m-tri-e", level: "easy", prompt: "Two angles of a triangle measure 48° and 67°. What is the measure, in degrees, of the third angle?", accept: [65], answerText: "65", explanation: "180 − 48 − 67 = 65." },
      { id: "m-tri-m", level: "medium", prompt: "Two parallel lines are cut by a transversal. Two same-side interior angles measure (3x + 10)° and (2x + 20)°. What is the value of x?", accept: [30], answerText: "30", explanation: "Same-side interior angles are supplementary: 5x + 30 = 180, so x = 30." },
      { id: "m-tri-h", level: "hard", prompt: "Triangle ABC is similar to triangle DEF, and AB / DE = 3/2. The area of triangle ABC is 54. What is the area of triangle DEF?", accept: [24], answerText: "24", explanation: "DEF is smaller with scale factor 2/3. Area scales by (2/3)² = 4/9. 54 × 4/9 = 24." },
      { id: "m-tri-s1", level: "sat", prompt: "In triangle ABC, the exterior angle at vertex C measures 130°, and angle A measures 55°. What is the measure of angle B?", choices: ["50°", "65°", "75°", "125°"], correct: 2, answerText: "C) 75°", explanation: "Exterior angle = sum of the remote interior angles: 130 = 55 + ∠B, so ∠B = 75°." },
      { id: "m-tri-s2", level: "sat", prompt: "Which set of numbers could be the side lengths of a triangle?", choices: ["3, 4, 8", "5, 5, 11", "6, 9, 14", "2, 7, 9"], correct: 2, answerText: "C) 6, 9, 14", explanation: "The two shorter sides must add to more than the longest: 6 + 9 = 15 > 14 ✓. 3 + 4 < 8, 5 + 5 < 11, and 2 + 7 = 9 (not greater) all fail." },
    ],
    keywords: ["angle", "triangle", "parallel", "transversal", "similar", "exterior angle"],
  },
  {
    id: "geo-right-trig",
    domain: "geometry",
    title: "Right Triangles & Trigonometry",
    summary: "Pythagorean theorem, special right triangles, SOH-CAH-TOA, complementary angles, and radians.",
    overview: [
      "The Pythagorean theorem and the two special right triangles are on the SAT reference sheet, but knowing them by heart saves time. Watch for common triples: 3-4-5, 5-12-13, 8-15-17, 7-24-25.",
      "SOH-CAH-TOA defines sine, cosine, and tangent from the sides of a right triangle relative to an angle.",
      "A favourite SAT fact: the sine of an angle equals the cosine of its complement. In a right triangle, sin A = cos B.",
    ],
    formulas: [
      { name: "Pythagorean theorem", expr: "a² + b² = c²" },
      { name: "45-45-90 triangle", expr: "sides x, x, x√2" },
      { name: "30-60-90 triangle", expr: "sides x, x√3, 2x  (short leg opposite 30°)" },
      { name: "SOH-CAH-TOA", expr: "sin = opp/hyp   cos = adj/hyp   tan = opp/adj" },
      { name: "Complementary angles", expr: "sin(x°) = cos(90° − x°)" },
      { name: "Radians", expr: "π radians = 180°" },
    ],
    examples: [
      { problem: "A right triangle has legs 9 and 12. Find the hypotenuse.", steps: ["c² = 81 + 144 = 225", "c = 15 (a 3-4-5 triangle scaled by 3)"], answer: "15" },
      { problem: "A right triangle has a 30° angle and a hypotenuse of 14. Find both legs.", steps: ["30-60-90: hypotenuse = 2x → x = 7", "Short leg (opposite 30°) = 7", "Long leg = 7√3"], answer: "7 and 7√3" },
    ],
    questions: [
      { id: "m-trig-e", level: "easy", prompt: "A right triangle has legs of length 5 and 12. What is the length of the hypotenuse?", accept: [13], answerText: "13", explanation: "√(25 + 144) = √169 = 13." },
      { id: "m-trig-m", level: "medium", prompt: "In right triangle ABC, angle C is the right angle and sin A = 3/5. What is cos B?", choices: ["3/5", "4/5", "3/4", "5/3"], correct: 0, answerText: "A) 3/5", explanation: "A and B are complementary, so cos B = sin A = 3/5. (Side BC is opposite A and adjacent to B.)" },
      { id: "m-trig-h", level: "hard", prompt: "An isosceles right triangle has a hypotenuse of length 10√2. What is its area?", accept: [50], answerText: "50", explanation: "In a 45-45-90 triangle, hypotenuse = leg × √2, so each leg is 10. Area = ½ × 10 × 10 = 50." },
      { id: "m-trig-s1", level: "sat", prompt: "A right triangle has legs of length 8 and 15. What is the tangent of the angle opposite the side of length 8?", choices: ["8/17", "15/17", "8/15", "15/8"], correct: 2, answerText: "C) 8/15", explanation: "tan = opposite / adjacent = 8/15. (The hypotenuse is 17, used for sine and cosine.)" },
      { id: "m-trig-s2", level: "sat", prompt: "What is the measure, in degrees, of an angle of 3π/4 radians?", accept: [135], answerText: "135", explanation: "Multiply by 180/π: (3π/4)(180/π) = 135." },
    ],
    keywords: ["pythagorean", "trigonometry", "sine", "cosine", "tangent", "special right triangle", "radians"],
  },
  {
    id: "geo-circles",
    domain: "geometry",
    title: "Circles",
    summary: "Circle equations, completing the square, arcs, sectors, central and inscribed angles.",
    overview: [
      "The circle equation (x − h)² + (y − k)² = r² gives the center (h, k) and radius r. Note the signs: (x + 2)² means h = −2.",
      "If the equation is expanded, complete the square for both x and y to recover the center and radius. This is one of the most common hard geometry questions.",
      "Arcs and sectors are fractions of the whole circle: the fraction is the central angle over 360° (or over 2π radians).",
    ],
    formulas: [
      { name: "Circumference & area", expr: "C = 2πr   A = πr²" },
      { name: "Circle equation", expr: "(x − h)² + (y − k)² = r²" },
      { name: "Arc length", expr: "(θ / 360°) × 2πr" },
      { name: "Sector area", expr: "(θ / 360°) × πr²" },
      { name: "Inscribed angle", expr: "inscribed angle = ½ × central angle on the same arc" },
      { name: "Tangent line", expr: "a tangent is perpendicular to the radius at the point of tangency" },
    ],
    examples: [
      { problem: "Find the center and radius of x² + y² − 6x + 8y = 11.", steps: ["Group: (x² − 6x) + (y² + 8y) = 11", "Complete the squares: add 9 and 16 to both sides", "(x − 3)² + (y + 4)² = 36"], answer: "Center (3, −4), radius 6" },
      { problem: "A circle has radius 9. Find the length of an arc with central angle 80°.", steps: ["(80/360) × 2π(9) = (2/9) × 18π"], answer: "4π" },
    ],
    questions: [
      { id: "m-circ-e", level: "easy", prompt: "A circle has an area of 49π. What is its radius?", accept: [7], answerText: "7", explanation: "πr² = 49π → r² = 49 → r = 7." },
      { id: "m-circ-m", level: "medium", prompt: "What are the center and radius of the circle (x + 2)² + (y − 5)² = 16?", choices: ["Center (2, −5), radius 4", "Center (−2, 5), radius 4", "Center (−2, 5), radius 16", "Center (2, −5), radius 16"], correct: 1, answerText: "B", explanation: "(x − h) with h = −2 and (y − k) with k = 5; r² = 16 → r = 4." },
      { id: "m-circ-h", level: "hard", prompt: "What is the radius of the circle x² + y² + 10x − 4y = −20?", accept: [3], answerText: "3", explanation: "(x² + 10x + 25) + (y² − 4y + 4) = −20 + 25 + 4 → (x + 5)² + (y − 2)² = 9 → r = 3." },
      { id: "m-circ-s1", level: "sat", prompt: "A sector of a circle with radius 6 has a central angle of 120°. What is the area of the sector?", choices: ["4π", "6π", "12π", "36π"], correct: 2, answerText: "C) 12π", explanation: "(120/360) × π(6)² = (1/3) × 36π = 12π." },
      { id: "m-circ-s2", level: "sat", prompt: "A central angle of a circle measures 110°. An inscribed angle intercepts the same arc. What is the measure, in degrees, of the inscribed angle?", accept: [55], answerText: "55", explanation: "An inscribed angle is half of the central angle on the same arc: 110 / 2 = 55." },
    ],
    keywords: ["circle", "radius", "arc", "sector", "inscribed angle", "complete the square", "equation of a circle"],
  },
  {
    id: "geo-area-volume",
    domain: "geometry",
    title: "Area & Volume",
    summary: "Area and volume formulas, composite shapes, and how scaling affects area and volume.",
    overview: [
      "Most area and volume formulas are on the reference sheet in Bluebook — the skill being tested is choosing the right one and applying it in a multi-step context.",
      "Scaling is a frequent hard-question theme: multiplying every length by k multiplies area by k² and volume by k³.",
      "For composite figures, split them into familiar shapes, or compute a large shape and subtract the missing part.",
    ],
    formulas: [
      { name: "Triangle / trapezoid", expr: "A = ½bh   A = ½(b₁ + b₂)h" },
      { name: "Rectangular prism", expr: "V = lwh" },
      { name: "Cylinder", expr: "V = πr²h" },
      { name: "Cone / pyramid", expr: "V = ⅓πr²h   V = ⅓Bh" },
      { name: "Sphere", expr: "V = (4/3)πr³" },
      { name: "Scaling", expr: "lengths × k → area × k², volume × k³" },
    ],
    examples: [
      { problem: "Find the volume of a cylinder with radius 3 and height 10.", steps: ["V = π(3)²(10) = 90π"], answer: "90π" },
      { problem: "Every edge of a cube is doubled. How does its volume change?", steps: ["k = 2, so volume × 2³"], answer: "The volume is multiplied by 8." },
    ],
    questions: [
      { id: "m-vol-e", level: "easy", prompt: "What is the area of a rectangle that is 12 units long and 7 units wide?", accept: [84], answerText: "84", explanation: "A = 12 × 7 = 84." },
      { id: "m-vol-m", level: "medium", prompt: "A trapezoid has bases of length 6 and 10 and a height of 5. What is its area?", accept: [40], answerText: "40", explanation: "A = ½(6 + 10)(5) = ½(16)(5) = 40." },
      { id: "m-vol-h", level: "hard", prompt: "A cylinder has a volume of 72π and a height of 8. If its radius is tripled and its height is halved, what is the new volume?", choices: ["108π", "216π", "324π", "648π"], correct: 2, answerText: "C) 324π", explanation: "πr²(8) = 72π → r² = 9 → r = 3. New radius 9, new height 4: π(81)(4) = 324π. (Equivalently 72π × 3² × ½.)" },
      { id: "m-vol-s1", level: "sat", prompt: "A square has an area of 10. If each side length is multiplied by 3, what is the area of the new square?", accept: [90], answerText: "90", explanation: "Area scales by 3² = 9: 10 × 9 = 90." },
      { id: "m-vol-s2", level: "sat", prompt: "A water tank is a cube with edges 2 metres long. How many litres can it hold? (1 m³ = 1,000 litres)", choices: ["800", "6,000", "8,000", "80,000"], correct: 2, answerText: "C) 8,000", explanation: "V = 2³ = 8 m³ = 8 × 1,000 = 8,000 litres." },
    ],
    keywords: ["area", "volume", "cylinder", "cone", "sphere", "prism", "scale factor", "formula"],
  },
];

export const MATH_BY_ID: Record<string, MathTopic> = Object.fromEntries(MATH_TOPICS.map((t) => [t.id, t]));

export interface DesmosTip {
  title: string;
  body: string;
  tryIt: string;
}

export const DESMOS_TIPS: DesmosTip[] = [
  { title: "Solve any equation by graphing both sides", body: "Type the left side as y = … and the right side as y = …, then click the intersection. The x-coordinate is the solution. Works for linear, quadratic, radical, and exponential equations.", tryIt: "√(x + 7) = x − 5 → graph y = √(x+7) and y = x − 5; the only intersection is at x = 9." },
  { title: "Read the vertex and zeros directly", body: "Graph a quadratic and click it: Desmos marks the vertex, x-intercepts, and y-intercept as grey points you can tap for coordinates.", tryIt: "y = 2x² − 12x + 11 → click the vertex to see (3, −7)." },
  { title: "Use sliders for unknown constants", body: "Type an equation with a letter like k. Desmos offers to add a slider. Drag it until the graph meets the condition (one intersection, passes through a point…).", tryIt: "y = x² + 2 and y = 2x + k → drag k until the line just touches the parabola (k = 1)." },
  { title: "Check equivalent expressions", body: "Graph the original expression and an answer choice. If the graphs lie exactly on top of each other, they are equivalent.", tryIt: "Graph y = (x² − 9)/(x + 3) and y = x − 3 — identical lines (with a hole at x = −3)." },
  { title: "Systems with no or infinite solutions", body: "Parallel lines (no intersection) mean no solution; one line hidden under the other means infinitely many.", tryIt: "y = 2x + 3 and y = 2x − 1 never meet." },
  { title: "Statistics in one line", body: "Type a list like L = [4, 7, 7, 9, 13] and then mean(L), median(L), stdev(L) to get values instantly.", tryIt: "mean([3, 8, 10, 11]) returns 8." },
  { title: "Regression from a table", body: "Add a table, enter the data, then type y₁ ~ mx₁ + b (linear) or y₁ ~ a·b^x₁ (exponential). Desmos fits the model and shows the parameters.", tryIt: "Table x: 0, 1, 2, 3 and y: 5, 15, 45, 135 with y₁ ~ a·b^x₁ gives a = 5, b = 3." },
  { title: "Inequalities as shaded regions", body: "Type inequalities directly (y > 2x − 1). The overlap of shaded regions is the solution set — then test answer-choice points by plotting them as (x, y).", tryIt: "Plot y > 2x − 1, y ≤ −x + 5 and the point (1, 3) to see it inside the overlap." },
  { title: "Know when NOT to use Desmos", body: "For simple arithmetic or a one-step equation, solving by hand is faster. Use Desmos when algebra would take more than about 30 seconds or when you want to verify an answer.", tryIt: "4x + 7 = 31 is faster by hand (x = 6)." },
];
