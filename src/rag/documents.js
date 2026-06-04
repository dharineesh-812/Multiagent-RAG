export const documents = [
  // --- DSA SHEET DOCUMENTS ---
  {
    id: "dsa_arrays_hashing",
    category: "dsa",
    title: "DSA Sheet - Arrays & Hashing Core Problems",
    tags: ["Arrays", "Hashing", "Striver SDE Sheet", "LeetCode"],
    content: `### Arrays & Hashing Interview Core Problems

Arrays and Hashing form the foundation of technical coding rounds. Most product-based company tests include at least one array-related question.

#### Essential Problems to Master:
1. **Two Sum**
   - **Problem**: Find two numbers in an array that add up to a target.
   - **Optimal Approach**: Use a Hash Map to store the complement \`(target - nums[i])\` and its index.
   - **Complexity**: Time: \`O(N)\`, Space: \`O(N)\`.

2. **Maximum Subarray (Kadane's Algorithm)**
   - **Problem**: Find the contiguous subarray with the largest sum.
   - **Optimal Approach**: Iterate through the array, maintaining a current sum. If the current sum becomes negative, reset it to 0. Keep track of the maximum sum seen so far.
   - **Complexity**: Time: \`O(N)\`, Space: \`O(1)\`.

3. **Merge Intervals**
   - **Problem**: Merge overlapping intervals.
   - **Optimal Approach**: Sort intervals by start time. Iterate through, checking if the current interval overlaps with the previous one. If yes, merge by updating the end time.
   - **Complexity**: Time: \`O(N log N)\` (due to sorting), Space: \`O(N)\` for output.

4. **Group Anagrams**
   - **Problem**: Group a list of strings that are anagrams of each other.
   - **Optimal Approach**: Use a hash map where the key is either the sorted string or a character count frequency array (length 26), and the value is a list of matching strings.
   - **Complexity**: Time: \`O(N * K log K)\` or \`O(N * K)\` (where K is max string length), Space: \`O(N * K)\`.

5. **Top K Frequent Elements**
   - **Problem**: Return the K most frequent elements.
   - **Optimal Approach**: Use a hash map to count frequencies, followed by bucket sort (where array indices represent frequencies).
   - **Complexity**: Time: \`O(N)\`, Space: \`O(N)\`.`
  },
  {
    id: "dsa_dynamic_programming",
    category: "dsa",
    title: "DSA Sheet - Dynamic Programming Patterns",
    tags: ["DP", "Optimization", "LeetCode", "Striver SDE Sheet"],
    content: `### Dynamic Programming (DP) Interview Patterns

Dynamic Programming is the most feared and frequently asked topic in top-tier company interviews (Google, Amazon, Uber). 

#### Core DP Patterns to Master:
1. **0/1 Knapsack Pattern**
   - **Description**: Decisions of including or excluding an item to maximize value within a weight capacity.
   - **Core Problems**: Subset Sum, Partition Equal Subset Sum, Target Sum.
   - **Transition**: \`dp[i][w] = max(val[i-1] + dp[i-1][w-wt[i-1]], dp[i-1][w])\`

2. **Unbounded Knapsack Pattern**
   - **Description**: Items can be chosen multiple times.
   - **Core Problems**: Coin Change, Coin Change II (number of ways), Rod Cutting.

3. **Longest Common Subsequence (LCS) Pattern**
   - **Description**: Matching sequences between two strings.
   - **Core Problems**: Longest Common Subsequence, Edit Distance, Longest Palindromic Subsequence.
   - **Transition**: If \`s1[i] == s2[j]\`, \`dp[i][j] = 1 + dp[i-1][j-1]\`. Else \`max(dp[i-1][j], dp[i][j-1])\`.

4. **Matrix Chain Multiplication (MCM) / Interval DP**
   - **Description**: Solving subproblems on ranges/intervals of an array.
   - **Core Problems**: Burst Balloons, Minimum Cost to Cut a Stick.

#### Tips for DP Questions in Interviews:
- Always start by describing the **recursive brute force** solution.
- Clearly state the state variables and the **memoization table** (Top-Down).
- Convert it to **Tabulation** (Bottom-Up) to optimize recursive call stack space.
- Discuss **space optimization** (e.g., using 1D arrays instead of 2D when only the previous row is needed).`
  },

  // --- COMPANY PLACEMENT INSIGHTS ---
  {
    id: "company_amazon",
    category: "company",
    title: "Amazon Placement Process & Interview Prep",
    tags: ["Amazon", "SDE", "Leadership Principles", "System Design"],
    content: `### Amazon Software Development Engineer (SDE) Preparation Guide

Amazon's hiring process is unique because it heavily weighs the **Amazon Leadership Principles (LPs)**. Around 50% of the evaluation in every round is based on LPs.

#### Interview Structure:
1. **Online Assessment (OA)**:
   - 2 coding questions (usually medium to hard arrays/graphs/DP) - 70 mins.
   - Work Simulation (scenario-based questions matching LPs).
   - Work Style Assessment.
2. **Technical Rounds (2-3 Rounds)**:
   - **DSA & Coding**: Strong emphasis on Trees, Graphs, Heap (Priority Queue), and LRU Cache design.
   - **Object-Oriented Design (OOD)**: Design Parking Lot, Design Movie Ticket Booking System, etc.
   - **System Design (for SDE-2)**: Design TinyURL, Design Messenger, Design Netflix-like system.
3. **Bar Raiser Round (1 Round)**:
   - Led by a neutral interviewer (not from the hiring team).
   - Deep LP evaluation + complex DSA or system design query.

#### The 16 Leadership Principles (Must-Knows):
- **Customer Obsession**: Prioritize customer requirements.
- **Ownership**: Act on behalf of the entire company, not just your team.
- **Bias for Action**: Speed matters in business. Many decisions are reversible.
- **Deep Dive**: Stay connected to details, audit frequently.
- **Deliver Results**: Focus on the key inputs and deliver them on time.

#### RAG Sample Interview Experiences:
- *"Asked to solve 'Merge K Sorted Lists' using min-heap. Interviewer followed up with LP questions on a time when I had to meet a tight deadline."*
- *"Asked to implement a custom cache with TTL (Time To Live). Evaluated on thread-safety, modular design, and LPs on Bias for Action vs Customer Obsession."*`
  },
  {
    id: "company_google",
    category: "company",
    title: "Google SDE Placement Prep & Coding Standards",
    tags: ["Google", "SDE", "Googliness", "Algorithms"],
    content: `### Google Software Engineer (SWE) Preparation Guide

Google focuses purely on algorithmic excellence, clean code, scalability, and "Googliness" (how you collaborate, deal with ambiguity, and act ethically).

#### Interview Structure:
1. **Technical Phone Screen (1 Round)**:
   - 45 minutes coding round. Usually a LeetCode Medium/Hard question.
2. **Onsite Rounds (4-5 Rounds)**:
   - **3-4 Coding Rounds**: Extremely algorithmic. Heavy focus on Advanced Graphs (Dijkstra, MST, Topological Sort, Union-Find), Recursion, Backtracking, and Binary Search (search in rotated array, search value space).
   - **1 Googliness & Leadership Round**: Behavioral interview evaluating cultural fit, dealing with ambiguity, bias mitigation, and collaboration.

#### Key Preparation Rules for Google:
- **Think Out Loud**: Google interviewers want to hear your thought process. Talk continuously.
- **Clarify Ambiguity**: Google problems are intentionally vague. Ask clarifying questions (e.g., "Are the numbers positive?", "Is the graph directed?", "What are the scale requirements?").
- **Dry Run Your Code**: Before saying you are done, manually trace your code with a small test case.
- **Time/Space Complexities**: Be extremely precise. Explain why an approach is \`O(N log K)\` instead of just \`O(N log N)\`.
- **Clean Code**: Use descriptive variable names, helper functions, and check for null/empty edge cases.`
  },
  {
    id: "company_tcs_infosys",
    category: "company",
    title: "Mass Recruiters (TCS, Infosys, Cognizant) Interview Process",
    tags: ["TCS", "Infosys", "Mass Recruiters", "Service Companies"],
    content: `### Mass Recruiter Preparation Guide (TCS Ninja/Digital, Infosys SE/Power Programmer)

Service-based companies hire a large volume of engineering students in India. They usually have two levels of hiring: Foundation/Ninja (low package, easier) and Advanced/Digital/Power Programmer (higher package, medium difficulty).

#### Selection Process:
1. **Aptitude & Technical MCQ Round**:
   - Quantitative aptitude, logical reasoning, verbal ability.
   - Pseudo-code tracing, SQL queries, and basic CS MCQs.
2. **Coding Round (Digital/Power Programmer profiles)**:
   - 2 coding questions. Topics: String manipulation, Array filtering, basic Math (GCD, Prime, Fibonacci), sorting, and basic recursion.
3. **Technical Interview**:
   - Explanation of Final Year Project.
   - Core CS Questions: OOPs concepts (Inheritance, Polymorphism, Abstraction, Encapsulation with real-world examples).
   - DBMS: SQL Joins, writing basic queries (e.g., 2nd highest salary).
   - Basic DSA: Linked list traversal, reverse a string, check palindrome.
4. **HR Round**:
   - Willingness to relocate, shifts, bond agreement, and basic communication check.

#### Key tips to crack:
- Build a solid, understandable **final year project** and know every line of its architecture.
- Master basic SQL queries. Practice \`SELECT\`, \`JOIN\`, \`GROUP BY\`, and \`HAVING\`.
- Be confident and exhibit excellent English communication skills.`
  },

  // --- CS CORE DOCUMENTS ---
  {
    id: "cs_dbms_normalization",
    category: "cs_core",
    title: "DBMS Cheat Sheet - Normalization & SQL Joins",
    tags: ["DBMS", "SQL", "Database", "Normalization"],
    content: `### DBMS Core Interview Cheat Sheet

Database Management Systems (DBMS) questions are asked in almost every technical round, especially for backend roles.

#### Database Normalization
Normalization is the process of organizing data in a database to avoid redundancy and anomalies.

1. **First Normal Form (1NF)**:
   - A relation is in 1NF if all attributes contain atomic (indivisible) values. No repeating groups.
2. **Second Normal Form (2NF)**:
   - Must be in 1NF.
   - No partial dependency: No non-prime attribute should be dependent on a proper subset of any candidate key.
3. **Third Normal Form (3NF)**:
   - Must be in 2NF.
   - No transitive dependency: Non-prime attributes should not determine other non-prime attributes.
4. **Boyce-Codd Normal Form (BCNF)**:
   - A stronger version of 3NF.
   - For any dependency \`A -> B\`, \`A\` must be a super key.

#### SQL Joins Summary
- **INNER JOIN**: Returns records that have matching values in both tables.
- **LEFT (OUTER) JOIN**: Returns all records from the left table, and matching records from the right table. If no match, NULL values are returned for right.
- **RIGHT (OUTER) JOIN**: Returns all records from the right table, and matching records from the left table.
- **FULL (OUTER) JOIN**: Returns all records when there is a match in either left or right table.

#### ACID Properties:
- **Atomicity**: Entire transaction succeeds or entire transaction fails.
- **Consistency**: Database transitions from one valid state to another.
- **Isolation**: Concurrent transactions run independently without interference.
- **Durability**: Committed transactions are saved permanently, even during power failures.`
  },
  {
    id: "cs_os_deadlocks",
    category: "cs_core",
    title: "Operating Systems Cheat Sheet - Deadlocks & Memory Management",
    tags: ["OS", "Operating Systems", "Deadlocks", "Paging"],
    content: `### Operating Systems Core Interview Cheat Sheet

Operating Systems concepts are standard in placement interviews. The interviewer will look for conceptual clarity regarding concurrency and memory management.

#### 1. Deadlock Conditions
A deadlock occurs when a set of processes are blocked because each process is holding a resource and waiting for another resource held by some other process.
Four **necessary and sufficient** conditions (Coffman Conditions) for deadlock:
1. **Mutual Exclusion**: At least one resource must be held in a non-shareable mode.
2. **Hold and Wait**: A process must be holding at least one resource and waiting to acquire additional resources held by other processes.
3. **No Preemption**: Resources cannot be preempted; they can only be released voluntarily by the process holding them.
4. **Circular Wait**: A set of processes \`{P0, P1, ..., Pn}\` must exist such that \`P0\` is waiting for a resource held by \`P1\`, \`P1\` is waiting for \`P2\`, and \`Pn\` is waiting for \`P0\`.

*How to handle deadlocks*: Prevention (negate one of the 4 conditions), Avoidance (Banker's Algorithm), Detection and Recovery, or Ignorance (Ostrich Algorithm).

#### 2. Paging and Virtual Memory
- **Paging**: A memory management scheme that eliminates the need for contiguous allocation of physical memory. It divides physical memory into fixed-size blocks called **Frames** and logical memory into blocks of the same size called **Pages**.
- **Page Table**: Maps logical page addresses to physical frame addresses.
- **Thrashing**: A state where the CPU spends more time swapping pages in and out of disk than executing instructions. Occurs when active page sets do not fit in physical memory.
- **Page Replacement Algorithms**: LRU (Least Recently Used), FIFO (First In First Out), Optimal Page Replacement.`
  },

  // --- HR & BEHAVIORAL ---
  {
    id: "hr_star_method",
    category: "hr",
    title: "HR Behavioral Prep - The STAR Method",
    tags: ["HR", "Behavioral", "STAR Method", "Interview Tips"],
    content: `### How to Crack HR Behavioral Interviews using the STAR Method

HR and behavioral interview questions evaluate your soft skills, problem-solving under stress, conflict resolution, and leadership capabilities. 

To give high-impact answers, structure your response using the **STAR Method**:

#### The STAR Framework:
1. **S - Situation**: Set the scene. Give context about the project, team, or challenge. Keep it concise (15-20% of your answer).
2. **T - Task**: Describe what needed to be done. What was the goal? What was your specific responsibility?
3. **A - Action**: Explain *exactly* what you did. How did you solve it? What tools/methods did you use? Focus on *your* contributions, use "I" instead of "We" (50-60% of your answer).
4. **R - Result**: Deliver the punchline. What was the outcome? How did it help the company/project? **Use metrics** whenever possible (e.g., "reduced latency by 30%", "delivered project 3 days early").

#### Example Answer: "Tell me about a conflict in a team project"
- **Situation**: During our 6th-semester Capstone project, our UI developer wanted to use Angular while our backend lead wanted React, causing a deadlock and delaying progress.
- **Task**: As the project coordinator, I had to resolve the conflict and set a unified tech stack within 2 days to meet our prototype submission.
- **Action**: I scheduled a meeting and had both developers list the pros and cons relative to our project criteria (development speed, familiarity, API integration). I noticed React had pre-built components that suited our short timeline, whereas Angular had a steeper learning curve for our mobile lead. I proposed using React + Vite and offered to help the UI developer get up to speed with a 2-hour crash course.
- **Result**: The team agreed. We completed the project 3 days before the deadline. The UI developer successfully learned React, and our project was selected among the top 10 in our department.`
  },

  // --- APTITUDE ---
  {
    id: "aptitude_quantitative",
    category: "aptitude",
    title: "Aptitude - Core Formulas & Quantitative Shortcuts",
    tags: ["Aptitude", "Quantitative", "Placement Test", "Shortcuts"],
    content: `### Quantitative Aptitude Key Cheat Sheet

Nearly all placement selection pipelines begin with an Online Aptitude Test. These short formulas will help you speed up calculations.

#### 1. Time & Work
- If A can do a piece of work in \`D1\` days and B in \`D2\` days:
  - Together they can complete the work in: \`(D1 * D2) / (D1 + D2)\` days.
- If A, B, and C can do the work in \`X\`, \`Y\`, and \`Z\` days respectively:
  - Together they complete in: \`(X * Y * Z) / (X*Y + Y*Z + Z*X)\` days.
- **Work = Efficiency × Time**

#### 2. Time, Speed & Distance
- **Speed = Distance / Time**
- Convert \`km/hr\` to \`m/s\`: Multiply by \`5/18\`.
- Convert \`m/s\` to \`km/hr\`: Multiply by \`18/5\`.
- **Average Speed**:
  - If a journey is split into two equal halves traveled at speeds \`x\` and \`y\`:
    - \`Average Speed = (2 * x * y) / (x + y)\`
  - If distance is constant, speed is inversely proportional to time.

#### 3. Permutations, Combinations & Probability
- **Permutation (Arrangement)**: \`nPr = n! / (n - r)!\`
- **Combination (Selection)**: \`nCr = n! / (r! * (n - r)!)\`
- **Probability of Event E**: \`P(E) = n(E) / n(S)\` (Number of favorable outcomes / Total outcomes in sample space).
- **Independent Events**: \`P(A ∩ B) = P(A) * P(B)\`.`
  }
];
