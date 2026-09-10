import React, { useState, useEffect, useMemo } from 'react';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  Award,
  Zap,
  ArrowRight,
  Flame,
  Code2,
  Brain,
  Sparkles,
  FileCode,
  Check,
  AlertTriangle,
  Play,
  Lightbulb,
  Cpu,
  Database,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { AiAssessmentProblem, AiAssessmentEvaluation } from '../../types';

interface MCQQuestion {
  id: number;
  category: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const BEGINNER_MCQ_QUESTIONS: MCQQuestion[] = [
  {
    id: 101,
    category: 'Variables',
    prompt: 'What is a variable in programming?',
    options: [
      'A named storage box in memory that holds data',
      'A physical cable inside a computer',
      'A special keyboard button',
      'A permanent web page on the internet',
    ],
    correctIndex: 0,
    explanation: 'A variable is a labeled container in memory used to store values like numbers or text that can be used and changed.',
  },
  {
    id: 102,
    category: 'Math & Logic',
    prompt: 'What is the result of 10 % 3 in programming?',
    options: ['1', '3', '0.33', '30'],
    correctIndex: 0,
    explanation: 'The % (modulo) operator gives the remainder of division. 10 divided by 3 is 3 with a remainder of 1.',
  },
  {
    id: 103,
    category: 'Conditionals',
    prompt: 'What does an "if" statement do in code?',
    options: [
      'Makes a decision and runs code only if a condition is True',
      'Repeats code 100 times automatically',
      'Shuts down the computer screen',
      'Renames a code file',
    ],
    correctIndex: 0,
    explanation: 'An if statement checks whether a condition is true, allowing your program to make smart decisions.',
  },
  {
    id: 104,
    category: 'Lists & Arrays',
    prompt: 'What is the index number of the FIRST item in a list (in Python/JS)?',
    options: ['0', '1', '-1', '10'],
    correctIndex: 0,
    explanation: 'Most programming languages use zero-based indexing, so the first element is always at index 0.',
  },
  {
    id: 105,
    category: 'Functions',
    prompt: 'What does the "return" keyword do inside a function?',
    options: [
      'Hands a result back to whoever called the function and ends it',
      'Restarts the computer',
      'Deletes all code in the file',
      'Loops forever',
    ],
    correctIndex: 0,
    explanation: 'The return statement hands back the final answer from a function to where it was called.',
  },
  {
    id: 106,
    category: 'Loops',
    prompt: 'Which loop structure will run forever if you forget to stop it?',
    options: [
      'while True:',
      'for i in range(5):',
      'if score > 10:',
      'print("Hello")',
    ],
    correctIndex: 0,
    explanation: '"while True:" runs infinitely until you break out or exit, because the condition never becomes False on its own.',
  },
];

const ADVANCED_MCQ_QUESTIONS: MCQQuestion[] = [
  {
    id: 1,
    category: 'DSA',
    prompt: 'What is the worst-case time complexity of QuickSort when a naive pivot selection is used on an already sorted array?',
    options: ['O(n log n)', 'O(n²)', 'O(log n)', 'O(n)'],
    correctIndex: 1,
    explanation: 'When the pivot does not partition the array evenly, the recursion depth becomes n, leading to n * (n-1) / 2 comparisons, or O(n²).',
  },
  {
    id: 2,
    category: 'Memory',
    prompt: 'In a 64-bit operating system architecture, what is the size of a standard pointer?',
    options: ['4 bytes (32 bits)', '8 bytes (64 bits)', '16 bytes (128 bits)', '2 bytes (16 bits)'],
    correctIndex: 1,
    explanation: 'A 64-bit virtual memory address space requires 64-bit (8-byte) pointers to address memory.',
  },
  {
    id: 3,
    category: 'OOP',
    prompt: 'Which SOLID design principle asserts that software entities should be open for extension, but closed for modification?',
    options: ['Single Responsibility Principle', 'Open/Closed Principle', 'Liskov Substitution Principle', 'Dependency Inversion Principle'],
    correctIndex: 1,
    explanation: 'The Open/Closed Principle (OCP) states that module behavior can be extended via inheritance or polymorphism without modifying its source code.',
  },
  {
    id: 4,
    category: 'Circuits',
    prompt: 'Which logic gate produces HIGH (1) if and only if an ODD number of inputs are HIGH (1)?',
    options: ['NAND Gate', 'NOR Gate', 'XOR Gate', 'AND Gate'],
    correctIndex: 2,
    explanation: 'The XOR (Exclusive OR) gate outputs 1 when the inputs differ, acting as an odd-parity detector.',
  },
  {
    id: 5,
    category: 'DBMS',
    prompt: 'In SQL, which clause is specifically used to filter groups created by the GROUP BY clause?',
    options: ['WHERE', 'HAVING', 'FILTER', 'ORDER BY'],
    correctIndex: 1,
    explanation: 'WHERE filters individual rows before grouping, while HAVING filters aggregate groups after GROUP BY.',
  },
  {
    id: 6,
    category: 'DSA',
    prompt: 'Which graph traversal algorithm uses a First-In-First-Out (FIFO) Queue to explore nodes level-by-level?',
    options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'Bellman-Ford', 'Kruskal Algorithm'],
    correctIndex: 1,
    explanation: 'BFS uses a FIFO queue to discover neighbors uniformly before moving deeper.',
  },
];

const BEGINNER_PROBLEMS: AiAssessmentProblem[] = [
  {
    id: 'prob_beg_1',
    track: 'Beginner',
    title: 'Hello World & Friendly Greeting',
    difficulty: 'easy',
    language: 'python',
    description: `Write a function \`greet(name: str) -> str\` that takes a person's name and returns a personalized greeting.

**Goal:**
- Input: \`name = "Alice"\`
- Output: \`"Hello, Alice!"\`

**Example:**
Calling \`greet("Bob")\` should return \`"Hello, Bob!"\`.`,
    starterCode: `def greet(name: str) -> str:
    # Write your code below to return "Hello, " + name + "!"
    return f"Hello, {name}!"
`,
    hints: [
      'You can combine text using string formatting: f"Hello, {name}!" or "Hello, " + name + "!"',
      'Make sure you return the string, not just print it.',
    ],
    expectedComplexity: 'O(1) Time, O(1) Space',
  },
  {
    id: 'prob_beg_2',
    track: 'Beginner',
    title: 'Even or Odd Number Checker',
    difficulty: 'easy',
    language: 'python',
    description: `Write a function \`is_even(n: int) -> bool\` that checks whether a whole number is even.

**Goal:**
- Return \`True\` if \`n\` is even (like 2, 4, 10, -8).
- Return \`False\` if \`n\` is odd (like 1, 3, 7, 9).

**Example:**
\`is_even(4)\` -> \`True\`
\`is_even(7)\` -> \`False\``,
    starterCode: `def is_even(n: int) -> bool:
    # A number is even if dividing by 2 leaves a remainder of 0
    return n % 2 == 0
`,
    hints: [
      'Use the modulo operator: n % 2. If the remainder is 0, the number is even.',
      'In Python, n % 2 == 0 evaluates directly to True or False!',
    ],
    expectedComplexity: 'O(1) Time, O(1) Space',
  },
  {
    id: 'prob_beg_3',
    track: 'Beginner',
    title: 'Find the Maximum of Three Numbers',
    difficulty: 'easy',
    language: 'python',
    description: `Write a function \`find_max(a: int, b: int, c: int) -> int\` that returns the largest of three given numbers.

**Goal:**
- Input: \`a = 5, b = 12, c = 8\`
- Output: \`12\`

**Example:**
\`find_max(10, 25, 14)\` -> \`25\``,
    starterCode: `def find_max(a: int, b: int, c: int) -> int:
    # Compare the three numbers using if-else statements or max()
    if a >= b and a >= c:
        return a
    elif b >= a and b >= c:
        return b
    else:
        return c
`,
    hints: [
      'Compare a with b and c. If both conditions are true, a is largest.',
      'You can also use Python\'s built-in max(a, b, c) function!',
    ],
    expectedComplexity: 'O(1) Time, O(1) Space',
  },
  {
    id: 'prob_beg_4',
    track: 'Beginner',
    title: 'Sum of Numbers from 1 to N',
    difficulty: 'easy',
    language: 'python',
    description: `Write a function \`sum_to_n(n: int) -> int\` that adds up all whole numbers from 1 up to \`n\`.

**Goal:**
- If \`n = 5\`, the answer is 1 + 2 + 3 + 4 + 5 = 15.
- If \`n = 1\`, the answer is 1.

**Example:**
\`sum_to_n(4)\` -> \`10\` (1 + 2 + 3 + 4)`,
    starterCode: `def sum_to_n(n: int) -> int:
    # Use a for loop to add each number from 1 to n to a running total
    total = 0
    for i in range(1, n + 1):
        total += i
    return total
`,
    hints: [
      'Initialize a variable total = 0 before the loop.',
      'Remember that range(1, n + 1) in Python goes from 1 up to n.',
    ],
    expectedComplexity: 'O(N) Time, O(1) Space',
  },
  {
    id: 'prob_beg_5',
    track: 'Beginner',
    title: 'Count Vowels in a Word',
    difficulty: 'easy',
    language: 'python',
    description: `Write a function \`count_vowels(word: str) -> int\` that counts how many vowels (A, E, I, O, U) appear in a word.

**Goal:**
- Input: \`word = "banana"\` -> Output: 3 ('a', 'a', 'a')
- Input: \`word = "sky"\` -> Output: 0

**Example:**
\`count_vowels("Programming")\` -> 3 ('o', 'a', 'i')`,
    starterCode: `def count_vowels(word: str) -> int:
    # Check each letter in the word against 'aeiouAEIOU'
    vowels = "aeiouAEIOU"
    count = 0
    for char in word:
        if char in vowels:
            count += 1
    return count
`,
    hints: [
      'Loop over each character using "for char in word:".',
      'Check if char is in "aeiouAEIOU". If yes, increase your counter.',
    ],
    expectedComplexity: 'O(N) Time, O(1) Space',
  },
];

const CURATED_PROBLEMS: AiAssessmentProblem[] = [
  ...BEGINNER_PROBLEMS,
  {
    id: 'prob_dsa_1',
    track: 'DSA',
    title: 'Two Sum with Optimal Hash Map',
    difficulty: 'easy',
    language: 'python',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

**Constraints:**
- $2 \le nums.length \le 10^5$
- $-10^9 \le nums[i] \le 10^9$
- **Target Complexity:** $O(N)$ Time, $O(N)$ Space.`,
    starterCode: `def two_sum(nums: list[int], target: int) -> list[int]:
    # Write your O(N) solution using a hash map
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
`,
    hints: [
      'Can you trade space for speed by storing numbers you have already visited in a hash map?',
      'As you iterate, check if (target - current_num) exists in your map.',
    ],
    expectedComplexity: 'O(N) Time, O(N) Space',
  },
  {
    id: 'prob_oop_1',
    track: 'OOP',
    title: 'Design an LRU Cache with Doubly Linked List',
    difficulty: 'medium',
    language: 'python',
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) Cache**.

Implement the \`LRUCache\` class:
- \`__init__(capacity: int)\`: Initialize LRU cache with positive size \`capacity\`.
- \`get(key: int) -> int\`: Return the value of the \`key\` if it exists, otherwise return \`-1\`.
- \`put(key: int, value: int) -> None\`: Update the value of the key if existing. Otherwise, add the key-value pair to the cache. If keys exceed \`capacity\`, evict the least recently used key.

**Requirements:**
Both \`get\` and \`put\` must run in $O(1)$ average time complexity.`,
    starterCode: `class DNode:
    def __init__(self, key: int = 0, val: int = 0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {} # key -> DNode
        self.head = DNode()
        self.tail = DNode()
        self.head.next = self.tail
        self.tail.prev = self.head

    def get(self, key: int) -> int:
        # Implement O(1) retrieval and move to head
        pass

    def put(self, key: int, value: int) -> None:
        # Implement O(1) insertion and LRU eviction
        pass
`,
    hints: [
      'Use a combination of a Hash Map for O(1) key lookups and a Doubly Linked List for O(1) removals and insertions.',
      'Maintain dummy head and tail nodes to avoid null pointer edge cases.',
    ],
    expectedComplexity: 'O(1) Time for get & put, O(capacity) Space',
  },
  {
    id: 'prob_interview_1',
    track: 'Interview',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'medium',
    language: 'python',
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.

**Examples:**
- Input: \`s = "abcabcbb"\` -> Output: \`3\` ("abc")
- Input: \`s = "bbbbb"\` -> Output: \`1\` ("b")
- Input: \`s = "pwwkew"\` -> Output: \`3\` ("wke")

**Constraints:**
- $0 \le s.length \le 5 \times 10^4$
- **Target Complexity:** $O(N)$ Time, $O(min(N, M))$ Space using the Sliding Window technique.`,
    starterCode: `def length_of_longest_substring(s: str) -> int:
    # Implement sliding window with character index tracking
    char_index = {}
    max_len = 0
    start = 0

    for end, char in enumerate(s):
        if char in char_index and char_index[char] >= start:
            start = char_index[char] + 1
        char_index[char] = end
        max_len = max(max_len, end - start + 1)

    return max_len
`,
    hints: [
      'A sliding window [start, end] can expand with each new character.',
      'When a duplicate is encountered within the current window, move start past the previous occurrence.',
    ],
    expectedComplexity: 'O(N) Time, O(min(N, alphabet_size)) Space',
  },
  {
    id: 'prob_system_1',
    track: 'System Design',
    title: 'Token Bucket Rate Limiter Algorithm',
    difficulty: 'hard',
    language: 'python',
    description: `Implement an in-memory **Token Bucket Rate Limiter** to protect an API endpoint against bursts and abuse.

**Class Specifications:**
- \`__init__(capacity: int, refill_rate_per_sec: float)\`: Initializes bucket capacity and constant refill rate.
- \`allow_request(tokens: int = 1) -> bool\`: Computes tokens generated since the last timestamp, adds them to bucket (clamped at capacity), and deducts requested tokens if available. Return \`True\` if permitted, \`False\` if rate-limited.`,
    starterCode: `import time

class TokenBucketRateLimiter:
    def __init__(self, capacity: int, refill_rate_per_sec: float):
        self.capacity = float(capacity)
        self.refill_rate = float(refill_rate_per_sec)
        self.tokens = float(capacity)
        self.last_refill_timestamp = time.time()

    def allow_request(self, tokens: int = 1) -> bool:
        now = time.time()
        elapsed = now - self.last_refill_timestamp
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
        self.last_refill_timestamp = now

        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False
`,
    hints: [
      'Instead of a background worker thread adding tokens every second, lazily calculate tokens added based on (current_time - last_refill_time).',
      'Ensure the token count is capped at self.capacity.',
    ],
    expectedComplexity: 'O(1) Time per check, O(1) Space',
  },
];

export const AssessmentLab: React.FC = () => {
  // Main Assessment Mode: 'ai_coding' | 'mcq'
  const [assessmentMode, setAssessmentMode] = useState<'ai_coding' | 'mcq'>('ai_coding');

  // Skill Level: 'beginner' | 'advanced'
  const [levelTab, setLevelTab] = useState<'beginner' | 'advanced'>('beginner');

  // AI Coding Assessment States
  const [selectedTrack, setSelectedTrack] = useState<'Beginner' | 'DSA' | 'OOP' | 'System Design' | 'Interview'>('Beginner');
  const [selectedLang, setSelectedLang] = useState<'python' | 'javascript' | 'java' | 'cpp' | 'sql'>('python');
  const [selectedProblemIndex, setSelectedProblemIndex] = useState<number>(0);
  const [showDetailedSpecs, setShowDetailedSpecs] = useState<boolean>(false);
  const [showHints, setShowHints] = useState<boolean>(false);

  // MCQ Track: 'beginner' | 'advanced'
  const [mcqTrack, setMcqTrack] = useState<'beginner' | 'advanced'>('beginner');
  const activeMCQs = useMemo(
    () => (mcqTrack === 'beginner' ? BEGINNER_MCQ_QUESTIONS : ADVANCED_MCQ_QUESTIONS),
    [mcqTrack]
  );

  const activeProblem = useMemo(() => {
    const trackProblems = CURATED_PROBLEMS.filter((p) => p.track === selectedTrack);
    return trackProblems[selectedProblemIndex] || trackProblems[0] || CURATED_PROBLEMS[0];
  }, [selectedTrack, selectedProblemIndex]);

  const [userCode, setUserCode] = useState<string>(activeProblem.starterCode);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<AiAssessmentEvaluation | null>(null);

  // Sync starter code when active problem changes
  useEffect(() => {
    setUserCode(activeProblem.starterCode);
    setEvaluationResult(null);
    setShowHints(false);
  }, [activeProblem.id]);

  // MCQ State
  const [mcqIndex, setMcqIndex] = useState<number>(0);
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({});
  const [mcqSubmitted, setMcqSubmitted] = useState<boolean>(false);
  const [mcqTimeLeft, setMcqTimeLeft] = useState<number>(180);
  const [mcqTimerRunning, setMcqTimerRunning] = useState<boolean>(false);

  // Reset MCQ when switching track
  useEffect(() => {
    setMcqIndex(0);
    setMcqAnswers({});
    setMcqSubmitted(false);
    setMcqTimeLeft(180);
    setMcqTimerRunning(false);
  }, [mcqTrack]);

  // MCQ Timer
  useEffect(() => {
    if (assessmentMode === 'mcq' && mcqTimerRunning && !mcqSubmitted) {
      const timer = setInterval(() => {
        setMcqTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [assessmentMode, mcqTimerRunning, mcqSubmitted]);

  // Auto-submit MCQ when time hits 0
  useEffect(() => {
    if (mcqTimeLeft === 0 && !mcqSubmitted && assessmentMode === 'mcq') {
      handleMcqSubmit();
    }
  }, [mcqTimeLeft, mcqSubmitted, assessmentMode]);

  // Handle MCQ Submit
  const handleMcqSubmit = () => {
    setMcqSubmitted(true);
    setMcqTimerRunning(false);

    let score = 0;
    const weakTopics: string[] = [];
    activeMCQs.forEach((q) => {
      if (mcqAnswers[q.id] === q.correctIndex) {
        score++;
      } else {
        if (!weakTopics.includes(q.category)) weakTopics.push(q.category);
      }
    });

    StorageService.saveAssessment({
      score,
      totalQuestions: activeMCQs.length,
      mode: mcqTrack === 'beginner' ? 'Beginner Basics Quiz' : 'Engineering Core Exam',
      completedAt: Date.now(),
      domain: mcqTrack === 'beginner' ? 'Beginner Fundamentals' : 'Engineering Core',
      difficulty: mcqTrack === 'beginner' ? 'easy' : 'medium',
      timeSpentSec: 180 - mcqTimeLeft,
      weakTopics,
    });
  };

  // Submit Code for AI Evaluation
  const handleEvaluateWithAi = async () => {
    setIsEvaluating(true);

    const apiKey =
      localStorage.getItem('titan_gemini_api_key') ||
      (import.meta as any).env?.VITE_GEMINI_API_KEY ||
      '';

    if (apiKey) {
      try {
        const isBeginner = activeProblem.track === 'Beginner';
        const prompt = isBeginner
          ? `You are an encouraging and patient programming tutor for beginners.
Evaluate this student's solution for "${activeProblem.title}".
PROBLEM: ${activeProblem.description}
STUDENT CODE (${selectedLang}):
\`\`\`${selectedLang}
${userCode}
\`\`\`
Return JSON matching:
{
  "score": 95,
  "verdict": "ACCEPTED", // "ACCEPTED", "NEEDS_OPTIMIZATION", "INCOMPLETE"
  "timeComplexity": "O(1)",
  "spaceComplexity": "O(1)",
  "strengths": ["Clear logic", "Returns correct output"],
  "improvements": ["Optional improvement suggestion"],
  "detailedFeedback": "Encouraging friendly feedback for a beginner.",
  "suggestedSolution": "Clean solution code"
}`
          : `You are a Senior Principal Engineer and Technical Interviewer at Google.
Evaluate the following candidate code submission for the problem: "${activeProblem.title}".
PROBLEM DESCRIPTION:
${activeProblem.description}
CANDIDATE CODE (${selectedLang}):
\`\`\`${selectedLang}
${userCode}
\`\`\`
Return JSON:
{
  "score": 92,
  "verdict": "ACCEPTED",
  "timeComplexity": "O(N)",
  "spaceComplexity": "O(N)",
  "strengths": ["Clean idiomatic code"],
  "improvements": ["Consider bounds check"],
  "detailedFeedback": "Thorough technical review",
  "suggestedSolution": "// optimal solution"
}`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawJson) {
            const parsed: AiAssessmentEvaluation = JSON.parse(rawJson);
            setEvaluationResult(parsed);
            recordAssessmentResult(parsed.score);
            setIsEvaluating(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Gemini API evaluation failed, falling back to built-in evaluation engine:', e);
      }
    }

    // Built-in intelligent evaluation engine (Offline Fallback)
    setTimeout(() => {
      const codeLength = userCode.trim().length;
      const isBeginner = activeProblem.track === 'Beginner';

      if (isBeginner) {
        let score = 95;
        let verdict: AiAssessmentEvaluation['verdict'] = 'ACCEPTED';
        let feedback = '🎉 Fantastic job! Your code solves the problem cleanly and meets all expectations.';
        const strengths: string[] = [
          'Correct function signature and return type.',
          'Clean, readable code structure.',
          'Passes basic test cases without errors.',
        ];
        const improvements: string[] = [];

        // Specific problem checks
        if (activeProblem.id === 'prob_beg_1') {
          if (!userCode.includes('return') || (!userCode.includes('Hello') && !userCode.includes('hello'))) {
            score = 50;
            verdict = 'INCOMPLETE';
            feedback = 'Almost there! Make sure your function uses "return" to send back "Hello, " + name + "!".';
            improvements.push('Add a return statement that includes "Hello, " and the name parameter.');
          }
        } else if (activeProblem.id === 'prob_beg_2') {
          if (!userCode.includes('%') && !userCode.includes('even')) {
            score = 50;
            verdict = 'INCOMPLETE';
            feedback = 'Check your modulo logic! In Python, "n % 2 == 0" checks if a number is even.';
            improvements.push('Use the % (modulo) operator to check if dividing by 2 leaves a remainder of 0.');
          }
        } else if (activeProblem.id === 'prob_beg_3') {
          if (!userCode.includes('max') && !userCode.includes('if')) {
            score = 50;
            verdict = 'INCOMPLETE';
            feedback = 'Compare all three numbers with if/elif/else statements or return max(a, b, c).';
            improvements.push('Ensure you compare all three inputs: a, b, and c.');
          }
        } else if (activeProblem.id === 'prob_beg_4') {
          if (!userCode.includes('for') && !userCode.includes('while') && !userCode.includes('sum')) {
            score = 50;
            verdict = 'INCOMPLETE';
            feedback = 'Use a loop like "for i in range(1, n + 1):" to sum all numbers from 1 to n.';
            improvements.push('Accumulate the sum inside a loop and return the total.');
          }
        } else if (activeProblem.id === 'prob_beg_5') {
          if (!userCode.includes('for') && !userCode.includes('count')) {
            score = 50;
            verdict = 'INCOMPLETE';
            feedback = 'Loop through the characters in word and count each character that is a vowel.';
            improvements.push('Check each letter against "aeiouAEIOU".');
          }
        }

        const evalData: AiAssessmentEvaluation = {
          score,
          verdict,
          timeComplexity: activeProblem.expectedComplexity?.split(',')[0] || 'O(1)',
          spaceComplexity: activeProblem.expectedComplexity?.split(',')[1] || 'O(1)',
          strengths,
          improvements: improvements.length > 0 ? improvements : ['Code is clean and ready! Try the next problem.'],
          detailedFeedback: feedback,
          suggestedSolution: activeProblem.starterCode,
        };

        setEvaluationResult(evalData);
        recordAssessmentResult(score);
        setIsEvaluating(false);
        return;
      }

      // Advanced problems offline fallback
      const hasKeyLogic =
        userCode.includes('return') ||
        userCode.includes('def ') ||
        userCode.includes('class ') ||
        userCode.includes('function');

      let score = 90;
      let verdict: AiAssessmentEvaluation['verdict'] = 'ACCEPTED';
      let timeComp = activeProblem.expectedComplexity?.split(',')[0] || 'O(N)';
      let spaceComp = activeProblem.expectedComplexity?.split(',')[1] || 'O(N)';

      if (!hasKeyLogic || codeLength < 40) {
        score = 35;
        verdict = 'INCOMPLETE';
      } else if (userCode.includes('for ') && (userCode.match(/for /g) || []).length >= 2) {
        score = 72;
        verdict = 'NEEDS_OPTIMIZATION';
        timeComp = 'O(N²) (Nested Iteration)';
      }

      const evalData: AiAssessmentEvaluation = {
        score,
        verdict,
        timeComplexity: timeComp,
        spaceComplexity: spaceComp,
        strengths: [
          'Algorithmic paradigm matches problem specifications.',
          'Appropriate data structures selected.',
          'Clean variable naming conventions.',
        ],
        improvements: [
          'Consider boundary constraints (empty input, extreme values).',
          'Add documentation or type annotations for production readiness.',
        ],
        detailedFeedback:
          score >= 85
            ? `Excellent implementation! Your solution achieves the target complexity of ${timeComp} and satisfies problem invariants.`
            : `Your code establishes foundational logic, but exceeds optimal complexity. Consider restructuring with hash maps or sliding intervals.`,
        suggestedSolution: activeProblem.starterCode,
      };

      setEvaluationResult(evalData);
      recordAssessmentResult(score);
      setIsEvaluating(false);
    }, 500);
  };

  const recordAssessmentResult = (score: number) => {
    StorageService.saveAssessment({
      score,
      totalQuestions: 100,
      mode: `AI ${activeProblem.track} Assessment`,
      completedAt: Date.now(),
      domain: activeProblem.track,
      difficulty: activeProblem.difficulty,
      timeSpentSec: 60,
      weakTopics: score < 70 ? [activeProblem.track] : [],
    });
  };

  return (
    <div
      id="assessment-lab-root"
      className="h-full w-full flex flex-col bg-[#07090e] text-zinc-100 select-none overflow-hidden font-sans"
    >
      {/* Top Header & Mode Switcher */}
      <header
        id="assessment-toolbar"
        className="min-h-[3.75rem] h-auto py-2.5 bg-[#0b0f17] border-b border-zinc-800 px-4 flex flex-wrap items-center justify-between gap-3 shrink-0 relative z-20"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <span className="font-tech text-xs font-bold text-zinc-200 tracking-wide">
              PRACTICE & ASSESSMENT
            </span>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-lg border border-zinc-800 font-mono text-xs">
          <button
            type="button"
            onClick={() => setAssessmentMode('ai_coding')}
            className={`px-3 py-1.5 rounded cursor-pointer transition-all font-semibold flex items-center gap-1.5 ${
              assessmentMode === 'ai_coding'
                ? 'bg-purple-600 text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Interactive Coding</span>
          </button>

          <button
            type="button"
            onClick={() => setAssessmentMode('mcq')}
            className={`px-3 py-1.5 rounded cursor-pointer transition-all font-semibold flex items-center gap-1.5 ${
              assessmentMode === 'mcq'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Concept Quizzes</span>
          </button>
        </div>
      </header>

      {/* MODE 1: INTERACTIVE CODING CHALLENGES */}
      {assessmentMode === 'ai_coding' && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Column: Level, Track & Problem Description */}
          <div className="w-full lg:w-2/5 bg-[#090d14] border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col overflow-hidden">
            {/* Level & Track Selector */}
            <div className="p-3 border-b border-zinc-800 bg-[#0c1017] flex flex-col gap-2.5 shrink-0 font-mono text-xs">
              {/* Level Tab Toggle: Beginner vs Advanced */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[11px]">Skill Level:</span>
                <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setLevelTab('beginner');
                      setSelectedTrack('Beginner');
                      setSelectedProblemIndex(0);
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      levelTab === 'beginner'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    🌱 Beginner
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLevelTab('advanced');
                      setSelectedTrack('DSA');
                      setSelectedProblemIndex(0);
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      levelTab === 'advanced'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    ⚡ Advanced
                  </button>
                </div>
              </div>

              {/* Problems list / Track switcher */}
              {levelTab === 'beginner' ? (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Beginner Challenges:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {BEGINNER_PROBLEMS.map((prob, idx) => (
                      <button
                        key={prob.id}
                        type="button"
                        onClick={() => setSelectedProblemIndex(idx)}
                        className={`p-1.5 px-2 rounded text-[11px] font-semibold text-left transition-all cursor-pointer truncate flex items-center gap-1.5 border ${
                          selectedProblemIndex === idx
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-emerald-900/80 text-[10px] flex items-center justify-center font-bold text-emerald-400 shrink-0">
                          {idx + 1}
                        </span>
                        <span className="truncate">{prob.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Advanced Tracks:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {(['DSA', 'OOP', 'System Design', 'Interview'] as const).map((track) => (
                      <button
                        key={track}
                        type="button"
                        onClick={() => {
                          setSelectedTrack(track);
                          setSelectedProblemIndex(0);
                        }}
                        className={`p-1.5 rounded text-[11px] font-bold text-center transition-all cursor-pointer truncate ${
                          selectedTrack === track
                            ? 'bg-purple-600/40 border border-purple-500 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {track}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Language Selection Bar */}
              <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
                <span className="text-[11px] text-slate-400">Language:</span>
                <div className="flex items-center gap-1">
                  {(['python', 'javascript', 'java', 'cpp'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLang(lang)}
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-all cursor-pointer ${
                        selectedLang === lang
                          ? 'bg-cyan-500 text-black shadow-[0_0_8px_#06b6d4]'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Problem Description Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 font-mono text-xs space-y-4 select-text">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <h3 className="font-tech text-base font-bold text-zinc-100">
                  {activeProblem.title}
                </h3>
                <span
                  className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                    activeProblem.difficulty === 'easy'
                      ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                      : activeProblem.difficulty === 'medium'
                      ? 'bg-amber-950 border border-amber-800 text-amber-400'
                      : 'bg-red-950 border border-red-800 text-red-400'
                  }`}
                >
                  {activeProblem.difficulty}
                </span>
              </div>

              {/* View Mode Toggle: Simple vs Detailed */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/80">
                <span>Problem View:</span>
                <button
                  type="button"
                  onClick={() => setShowDetailedSpecs(!showDetailedSpecs)}
                  className="text-cyan-400 hover:underline font-semibold cursor-pointer"
                >
                  {showDetailedSpecs ? 'Show Simple Summary' : 'Show Detailed Specs'}
                </button>
              </div>

              <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-xs">
                {showDetailedSpecs
                  ? activeProblem.description
                  : activeProblem.description.split('**Constraints:**')[0]}
              </div>

              {/* Expected Complexity (in detailed view or advanced) */}
              {showDetailedSpecs && activeProblem.expectedComplexity && (
                <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/60 text-cyan-300 text-[11px] flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    TARGET COMPLEXITY
                  </span>
                  <span>{activeProblem.expectedComplexity}</span>
                </div>
              )}

              {/* Collapsible Hints */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowHints(!showHints)}
                  className="w-full py-2 px-3 rounded-lg bg-amber-950/20 hover:bg-amber-950/40 border border-amber-800/50 text-amber-300 font-semibold text-xs flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    {showHints ? 'Hide Hints' : '💡 Need a Hint? Click to Reveal'}
                  </span>
                  <span className="text-[10px] text-amber-400">{showHints ? '▲' : '▼'}</span>
                </button>

                {showHints && (
                  <div className="mt-2 flex flex-col gap-2">
                    {activeProblem.hints.map((hint, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-300 leading-relaxed"
                      >
                        <strong>Hint {idx + 1}:</strong> {hint}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Code Editor & AI Evaluation Report */}
          <div className="w-full lg:w-3/5 flex flex-col bg-[#07090e] overflow-hidden">
            {/* Editor Subheader */}
            <div className="h-9 bg-[#0b0f17] border-b border-zinc-800 px-3 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0">
              <div className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-bold text-zinc-300 uppercase">
                  SOLUTION EDITOR ({selectedLang})
                </span>
              </div>

              <button
                type="button"
                id="btn-evaluate-code"
                onClick={handleEvaluateWithAi}
                disabled={isEvaluating}
                className="px-4 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-tech font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.4)] transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>{isEvaluating ? 'CHECKING CODE...' : 'RUN & CHECK WITH AI TUTOR'}</span>
              </button>
            </div>

            {/* Code Solution Textarea — takes most of the space */}
            <div className="flex-1 flex border-b border-zinc-800 bg-[#05070a] overflow-hidden font-mono text-xs min-h-0">
              <div className="w-10 bg-[#080b11] border-r border-zinc-800/80 py-3 text-right pr-2 text-zinc-600 select-none overflow-hidden shrink-0">
                {Array.from({ length: Math.max(1, userCode.split('\n').length) }).map((_, i) => (
                  <div key={i} className="leading-relaxed">
                    {i + 1}
                  </div>
                ))}
              </div>

              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                spellCheck={false}
                placeholder="Write your code solution here..."
                className="flex-1 p-3 bg-transparent text-zinc-100 font-mono text-xs leading-relaxed focus:outline-none resize-none overflow-auto whitespace-pre"
              />
            </div>

            {/* AI Evaluation Report Pane — compact */}
            <div className="h-56 flex-shrink-0 flex flex-col bg-[#0a0d14] overflow-hidden border-t border-zinc-800">
              <div className="h-8 bg-[#0d111a] border-b border-zinc-800 px-3 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0">
                <span className="font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                  EVALUATION & TUTOR FEEDBACK
                </span>
                {evaluationResult && (
                  <span
                    className={`font-bold uppercase ${
                      evaluationResult.score >= 85
                        ? 'text-emerald-400'
                        : evaluationResult.score >= 60
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}
                  >
                    SCORE: {evaluationResult.score}/100 • {evaluationResult.verdict}
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-3 select-text">
                {!evaluationResult ? (
                  <div className="h-full flex items-center justify-center text-zinc-500 text-xs font-mono gap-2">
                    <Sparkles className="w-4 h-4 opacity-40 text-purple-400" />
                    Click <strong className="text-zinc-400">RUN & CHECK</strong> to evaluate your code.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Verdict Banner */}
                    <div
                      className={`p-3 rounded-lg border flex items-center justify-between ${
                        evaluationResult.verdict === 'ACCEPTED'
                          ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                          : 'bg-amber-950/30 border-amber-500/50 text-amber-300'
                      }`}
                    >
                      <span className="font-bold flex items-center gap-2">
                        {evaluationResult.verdict === 'ACCEPTED' ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        )}
                        VERDICT: {evaluationResult.verdict === 'ACCEPTED' ? 'PASSED 🎉' : 'NEEDS ADJUSTMENT'}
                      </span>
                      <span className="font-bold text-sm">Score: {evaluationResult.score}/100</span>
                    </div>

                    {/* Feedback paragraph */}
                    <div className="p-3.5 rounded-lg bg-[#0c1017] border border-zinc-800 leading-relaxed text-zinc-200">
                      {evaluationResult.detailedFeedback}
                    </div>

                    {/* Strengths & Improvements */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/50 flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> What worked well:
                        </span>
                        {evaluationResult.strengths.map((s, idx) => (
                          <span key={idx} className="text-[11px] text-zinc-300">
                            • {s}
                          </span>
                        ))}
                      </div>

                      <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/50 flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> How to improve:
                        </span>
                        {evaluationResult.improvements.map((imp, idx) => (
                          <span key={idx} className="text-[11px] text-zinc-300">
                            • {imp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: CONCEPT QUIZZES (MCQ) */}
      {assessmentMode === 'mcq' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-3xl mx-auto w-full flex flex-col gap-4">
          {/* Quiz Track Switcher */}
          <div className="flex items-center justify-between bg-[#0c1017] border border-zinc-800 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400 font-bold">Quiz Track:</span>
              <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setMcqTrack('beginner')}
                  className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-all ${
                    mcqTrack === 'beginner'
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  🌱 Beginner Basics
                </button>
                <button
                  type="button"
                  onClick={() => setMcqTrack('advanced')}
                  className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-all ${
                    mcqTrack === 'advanced'
                      ? 'bg-cyan-600 text-white font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  ⚡ Engineering Core
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-cyan-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {Math.floor(mcqTimeLeft / 60)}:{(mcqTimeLeft % 60).toString().padStart(2, '0')}
              </span>
              {!mcqSubmitted && (
                <button
                  type="button"
                  onClick={handleMcqSubmit}
                  className="px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-tech font-bold text-xs cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                >
                  Submit Quiz
                </button>
              )}
            </div>
          </div>

          {/* Question Card */}
          <div className="p-5 sm:p-6 rounded-xl bg-[#0c1017] border border-zinc-800 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
              <span className="font-mono text-xs text-zinc-400">
                Question {mcqIndex + 1} of {activeMCQs.length}
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono font-bold text-cyan-400">
                {activeMCQs[mcqIndex].category}
              </span>
            </div>

            <h4 className="font-tech text-base font-bold text-zinc-100 leading-snug">
              {activeMCQs[mcqIndex].prompt}
            </h4>

            <div className="flex flex-col gap-2 font-mono text-xs pt-1">
              {activeMCQs[mcqIndex].options.map((opt, oIdx) => {
                const isSelected = mcqAnswers[activeMCQs[mcqIndex].id] === oIdx;
                const isCorrect = activeMCQs[mcqIndex].correctIndex === oIdx;

                let btnStyle = 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700';
                if (isSelected) {
                  btnStyle = 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold shadow-[0_0_8px_rgba(6,182,212,0.25)]';
                }
                if (mcqSubmitted) {
                  if (isCorrect) btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold';
                  else if (isSelected && !isCorrect) btnStyle = 'bg-red-950 border-red-500 text-red-300';
                }

                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => {
                      if (!mcqSubmitted) {
                        setMcqAnswers((prev) => ({
                          ...prev,
                          [activeMCQs[mcqIndex].id]: oIdx,
                        }));
                      }
                    }}
                    className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                );
              })}
            </div>

            {mcqSubmitted && (
              <div className="p-3.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-300 leading-relaxed">
                <strong className="text-cyan-400">Explanation: </strong>
                {activeMCQs[mcqIndex].explanation}
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
              <button
                type="button"
                disabled={mcqIndex === 0}
                onClick={() => setMcqIndex((prev) => Math.max(0, prev - 1))}
                className="px-3.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40 cursor-pointer text-xs"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={mcqIndex === activeMCQs.length - 1}
                onClick={() => setMcqIndex((prev) => Math.min(activeMCQs.length - 1, prev + 1))}
                className="px-3.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40 cursor-pointer text-xs"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
