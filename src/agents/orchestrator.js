import { GoogleGenerativeAI } from "@google/generative-ai";
import { agents } from "./agentDefinitions";
import { searchRAG, getChunks } from "../rag/ragEngine";

/**
 * Runs a single step of the multi-agent system.
 * 1. Checks if Coordinator needs to route the query to a specialized agent.
 * 2. Runs RAG search to pull relevant context.
 * 3. Builds system prompts and calls the Gemini API.
 * 4. Falls back to realistic mock responses if no API key is set (Demo Mode).
 */
export async function runAgentStep(apiKey, targetAgentId, userQuery, history = []) {
  let activeAgentId = targetAgentId;
  let routedFromCoordinator = false;

  // Standardize target category filters for RAG
  let categoryFilter = "all";
  if (targetAgentId === "dsa") categoryFilter = "dsa";
  else if (targetAgentId === "company") categoryFilter = "company";
  else if (targetAgentId === "hr") categoryFilter = "hr";
  else if (targetAgentId === "resume") categoryFilter = "resume";
  else if (targetAgentId === "cscore") {
    // If the CS core tutor, check if they are asking aptitude
    categoryFilter = userQuery.toLowerCase().includes("aptitude") || 
                     userQuery.toLowerCase().includes("math") || 
                     userQuery.toLowerCase().includes("work") || 
                     userQuery.toLowerCase().includes("speed")
                     ? "aptitude" 
                     : "cs_core";
  }

  // Perform RAG search (will use Vector Search if API key is present)
  let ragResults = [];
  try {
    ragResults = await searchRAG(userQuery, categoryFilter, apiKey);
  } catch (err) {
    console.error("RAG search failed:", err);
  }

  // Compile RAG context block
  let contextText = "";
  if (ragResults.length > 0) {
    contextText = "RELEVANT PLACEMENT RESOURCES RETRIEVED VIA RAG:\n" + 
      ragResults.slice(0, 3).map(r => `[Doc: ${r.chunk.parentTitle} - Section: ${r.chunk.title}] (Match Score: ${Math.round(r.score * 100)}%)\n${r.chunk.content}`).join("\n\n");
  } else {
    contextText = "No direct documentation matches in local files. Fall back to standard guidelines.";
  }

  // 1. COORDINATOR ROUTING STEP (Requires API key for LLM decision, else mock routing)
  if (targetAgentId === "coordinator") {
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const routingPrompt = `Analyze this student placement preparation query. Determine which specialized agent is best suited to answer it.
        
        Agents:
        - 'dsa': Solving coding questions, LeetCode, arrays, trees, graphs, sorting, time complexity.
        - 'company': Company-specific interview experience, hiring processes, online assessments (OA), Google/Amazon/TCS round structures.
        - 'resume': Resume formatting, project points improvement, ATS compliance, LinkedIn optimization.
        - 'cscore': Core CS subjects (DBMS SQL queries, normalization, OS deadlocks, paging, networks TCP) or quantitative aptitude math.
        - 'hr': HR behaviorals, soft skills, STAR method, "Tell me about yourself".
        - 'coordinator': Simple greetings, general check-ins, creating roadmaps, or general planning questions.
        
        Student Query: "${userQuery}"
        
        Respond with exactly ONE word corresponding to the agent ID: "dsa", "company", "resume", "cscore", "hr", or "coordinator". Do not include formatting, punctuation, or explanations.`;
        
        const result = await model.generateContent(routingPrompt);
        const decision = result.response.text().trim().toLowerCase();
        
        if (agents[decision] && decision !== "coordinator") {
          activeAgentId = decision;
          routedFromCoordinator = true;
          // Re-fetch RAG results with the new routed category to be precise
          categoryFilter = decision === "cscore" ? "cs_core" : decision;
          ragResults = await searchRAG(userQuery, categoryFilter, apiKey);
          if (ragResults.length > 0) {
            contextText = "RELEVANT PLACEMENT RESOURCES RETRIEVED VIA RAG:\n" + 
              ragResults.slice(0, 3).map(r => `[Doc: ${r.chunk.parentTitle} - Section: ${r.chunk.title}] (Match Score: ${Math.round(r.score * 100)}%)\n${r.chunk.content}`).join("\n\n");
          }
        }
      } catch (err) {
        console.error("Orchestrator routing step failed, default to Coordinator:", err);
      }
    } else {
      // Mock routing based on keywords in offline mode
      const queryLower = userQuery.toLowerCase();
      let routedId = "coordinator";
      
      if (queryLower.includes("code") || queryLower.includes("array") || queryLower.includes("dsa") || queryLower.includes("complexity") || queryLower.includes("sort") || queryLower.includes("sum")) {
        routedId = "dsa";
      } else if (queryLower.includes("amazon") || queryLower.includes("google") || queryLower.includes("microsoft") || queryLower.includes("tcs") || queryLower.includes("infosys") || queryLower.includes("company") || queryLower.includes("rounds")) {
        routedId = "company";
      } else if (queryLower.includes("resume") || queryLower.includes("cv") || queryLower.includes("ats") || queryLower.includes("project")) {
        routedId = "resume";
      } else if (queryLower.includes("dbms") || queryLower.includes("os") || queryLower.includes("sql") || queryLower.includes("deadlock") || queryLower.includes("network") || queryLower.includes("aptitude") || queryLower.includes("formula")) {
        routedId = "cscore";
      } else if (queryLower.includes("hr") || queryLower.includes("behavioral") || queryLower.includes("star") || queryLower.includes("weakness") || queryLower.includes("introduce")) {
        routedId = "hr";
      }

      if (routedId !== "coordinator") {
        activeAgentId = routedId;
        routedFromCoordinator = true;
        // Mock re-run RAG for fallback visibility
        categoryFilter = routedId === "cscore" ? "cs_core" : routedId;
        ragResults = getMockRAGOffline(userQuery, categoryFilter);
        if (ragResults.length > 0) {
          contextText = "RELEVANT PLACEMENT RESOURCES RETRIEVED VIA RAG:\n" + 
            ragResults.slice(0, 3).map(r => `[Doc: ${r.chunk.parentTitle} - Section: ${r.chunk.title}] (Match Score: ${Math.round(r.score * 100)}%)\n${r.chunk.content}`).join("\n\n");
        }
      }
    }
  }

  // 2. RUN DEMO/MOCK RESPONDER IF NO API KEY
  if (!apiKey) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResponse = getMockResponse(activeAgentId, userQuery, routedFromCoordinator, ragResults);
        resolve(mockResponse);
      }, 1000); // Simulate thinking delay
    });
  }

  // 3. EXECUTE GEMINI API CALL
  const activeAgent = agents[activeAgentId];
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Inject system guidelines and matching RAG context
    const fullSystemPrompt = `${activeAgent.systemPrompt}\n\n${contextText}\n\nIMPORTANT: Use the retrieved RAG resources context above when applicable to back up your suggestions. If the context is empty, rely on your deep engineering domain knowledge. Keep formatting clear, using markdown (headers, bolding, code fences).`;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: fullSystemPrompt
    });

    // Compile Gemini contents array from chat history
    const contents = [];
    history.forEach((msg) => {
      // Clean up sender labels
      const role = msg.sender === "student" ? "user" : "model";
      // Ignore intermediate routing notes
      let textContent = msg.text;
      if (textContent.startsWith("`[Route:")) {
        textContent = textContent.substring(textContent.indexOf("]`") + 2).trim();
      }
      contents.push({
        role: role,
        parts: [{ text: textContent }]
      });
    });

    // Add current user query
    contents.push({
      role: "user",
      parts: [{ text: userQuery }]
    });

    const response = await model.generateContent({
      contents: contents,
      generationConfig: {
        maxOutputTokens: 1500,
        temperature: 0.7
      }
    });

    const textResponse = response.response.text();
    
    return {
      agentId: activeAgentId,
      text: textResponse,
      routed: routedFromCoordinator,
      sources: ragResults.slice(0, 3)
    };
  } catch (error) {
    console.error("Gemini API execution error:", error);
    return {
      agentId: activeAgentId,
      text: `⚠️ **API Execution Error**: ${error.message}\n\nPlease verify that your Gemini API Key in the settings panel is correct and active. Fallback mock answer provided below:\n\n${getMockResponse(activeAgentId, userQuery, routedFromCoordinator, ragResults).text}`,
      routed: routedFromCoordinator,
      sources: ragResults.slice(0, 3)
    };
  }
}

/**
 * Offline keyword RAG filter for Demo mode
 */
function getMockRAGOffline(query, category) {
  try {
    const chunks = getChunks();
    const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    if (queryWords.length === 0) return [];
    
    return chunks
      .filter(c => category === "all" || c.category === category)
      .map(c => {
        let score = 0;
        const contentLower = c.content.toLowerCase();
        queryWords.forEach(w => {
          if (contentLower.includes(w)) score += 0.2;
        });
        return { chunk: c, score: Math.min(score, 0.9), type: "keyword" };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);
  } catch (e) {
    console.error("Offline RAG filter failed:", e);
    return [];
  }
}

/**
 * High-quality mock responses for Demo Mode (Offline)
 */
function getMockResponse(agentId, query, routed, ragResults) {
  const queryLower = query.toLowerCase();
  let text = "";
  
  const sourcesText = ragResults.length > 0 
    ? `\n\n*(Injected RAG context from: **${ragResults[0].chunk.parentTitle}** - similarity ${Math.round(ragResults[0].score * 100)}%)*`
    : "\n\n*(Offline Search: No exact local RAG files matched the keywords)*";

  if (agentId === "coordinator") {
    if (queryLower.includes("hello") || queryLower.includes("hi")) {
      text = `👋 **Hello! Welcome to your Personalized Placement Preparation Workspace.**

I am your lead **General Coordinator Agent**. I can help you:
1. Formulate a personalized study roadmap.
2. Route you to our specialist coaches (DSA Coding, Resume Auditor, HR Behavioral, CS Core, Company Insights).
3. Track your overall preparation status.

What company or role are you targetting? Or what topic would you like to practice today?`;
    } else if (queryLower.includes("roadmap") || queryLower.includes("plan")) {
      text = `📅 **Your Customized Placement Roadmap**

Based on typical engineering placement cycles in India, here is the structured phase plan:

1. **Phase 1: Foundations (Month 1)**
   - Speak to the **DSA Coding Coach** to cover Arrays, Maps, Two-Pointer, and String manipulation.
   - Set up your GitHub profile.
2. **Phase 2: CS Core & Aptitude (Month 2)**
   - Speak to the **CS Core & Aptitude Tutor** for DBMS (SQL queries) and Operating Systems (Deadlocks).
   - Practice daily quantitative puzzles (Time & Work, Speed).
3. **Phase 3: Profiling & Outreach (Month 3)**
   - Paste your project details in the **Resume Auditor** to rewrite bullet points using the Google X-Y-Z formula.
   - Study past interview patterns via the **Placement Insights Agent**.
4. **Phase 4: Final Sprint (Month 4)**
   - Practice full behavioral mocks with the **HR & Behavioral Coach** using the STAR method.
   
Would you like to deep-dive into any specific phase?`;
    } else {
      text = `I'm here as your general coordinator. I can help map out your placement timeline, or redirect you to specialized agents. 

For example:
- Ask me about code optimization to route to the **DSA Coach**.
- Ask about Amazon or Google rounds to route to **Placement Insights**.
- Ask about resume styling to route to the **Resume Auditor**.
- Ask about SQL queries to route to the **CS Core Tutor**.
- Ask about mock HR interviews to route to the **HR Coach**.`;
    }
  } 
  
  else if (agentId === "dsa") {
    if (queryLower.includes("two sum") || queryLower.includes("sum")) {
      text = `### Two Sum - Optimal Approach

The Two Sum problem is a classic arrays & hashing interview question.

#### 1. Brute Force Approach
Nested loops checking every pair:
- **Time Complexity**: \\(O(N^2)\\)
- **Space Complexity**: \\(O(1)\\)

#### 2. Optimal Approach (Hash Map)
Iterate once. Store each number's index in a hash map. For the current number \`x\`, check if \`target - x\` already exists in the map. If yes, return their indices.

\`\`\`python
def twoSum(nums, target):
    num_map = {} # val -> index
    for i, num in enumerate(nums):
        diff = target - num
        if diff in num_map:
            return [num_map[diff], i]
        num_map[num] = i
    return []
\`\`\`

- **Time Complexity**: \\(O(N)\\) - single pass.
- **Space Complexity**: \\(O(N)\\) - storing items in the hash map.`;
    } else if (queryLower.includes("dp") || queryLower.includes("dynamic")) {
      text = `### Introduction to Dynamic Programming (DP)

Dynamic Programming is simply **recursion with caching**. It is used to solve optimization problems that exhibit two properties:
1. **Overlapping Subproblems**: The same subproblem is solved multiple times (e.g. Fibonacci).
2. **Optimal Substructure**: The optimal solution to the problem can be constructed from optimal solutions to its subproblems.

#### DP Recipe:
1. Draft the **Recursive Relation** (Brute Force).
2. Add **Memoization** (Top-down, caching results in a 1D/2D array or map).
3. Convert to **Tabulation** (Bottom-up, iterative table filling) to save call stack space.
4. Apply **Space Optimization** if only preceding rows/states are needed.

*Would you like to write the solution for a specific DP pattern like 0/1 Knapsack or Longest Common Subsequence?*`;
    } else {
      text = `💻 **DSA Coach Online**

Let's work on coding! I can guide you through:
- **Arrays & Hashing**: Sliding window, Two-pointer, HashMaps.
- **Linked Lists & Trees**: Recursion, DFS, BFS traversal.
- **Graphs**: Dijkstra's algorithm, BFS, topological sort.
- **Dynamic Programming**: Memoization tables and transition formulas.

Explain a problem you are stuck on, paste your code, and let's optimize it!`;
    }
  } 
  
  else if (agentId === "company") {
    if (queryLower.includes("amazon")) {
      text = `🧡 **Amazon SDE Interview Insights**

Amazon evaluates technical skills alongside the **16 Leadership Principles (LPs)**. 

#### Key Interview Milestones:
1. **Online Assessment (OA)**:
   - 2 coding questions (sliding window, heaps, or graphs are common).
   - Work simulation scenario test.
2. **Technical Rounds (2 to 3)**:
   - Evaluates coding, modular design, and LPs.
   - Common DSA topics: LRU Cache, Binary Tree boundary traversal, Course Schedule (graphs).
3. **Bar Raiser Round**:
   - Led by a trained neutral evaluator. Focuses heavily on customer obsession, bias for action, and handling project failures.

#### Pro Tip:
Always structure your LP answers using the **STAR method**. When writing code, write highly modular functions and state edge cases (null inputs, overflows) before coding.`;
    } else if (queryLower.includes("google")) {
      text = `💛 **Google SWE Interview Insights**

Google interviews are notoriously challenging, focusing purely on algorithmic depth, code clarity, and "Googliness".

#### Key Interview Milestones:
1. **Phone Screen**: 45 mins. Dynamic programming or graph search.
2. **Onsite Coding (3-4 Rounds)**:
   - Focuses on advanced algorithms: Segment trees, Union-Find, Dijkstra, Topological sorting, or binary search on custom value spaces.
   - Clean, production-ready code is expected.
3. **Googliness & Leadership**:
   - Evaluates your ability to work under ambiguity, cultural fit, ethics, and collaboration.

#### Pro Tip:
Google interviewers *expect* you to ask clarifying questions first. Never start coding immediately. Talk out loud throughout the 45 minutes!`;
    } else if (queryLower.includes("tcs") || queryLower.includes("infosys")) {
      text = `💚 **TCS & Infosys Prep Insights**

Mass recruiters in India typically hire for two streams: Ninja/Foundation (standard package) and Digital/Power Programmer (elevated package).

#### Core Stages:
1. **Cognitive Aptitude & MCQ**:
   - Quantitative aptitude, logical coding snippets, basic SQL.
2. **Coding Test**:
   - 1-2 basic questions: palindromes, string formatting, GCD, matrix multiplication.
3. **Technical Interview**:
   - Focuses on **Final Year Project**, OOPs definitions, and database joins.
   
#### SQL Joins Quick Prep:
- **INNER JOIN**: Shared rows in both tables.
- **LEFT JOIN**: All from left, matches from right (NULL if none).

*Be prepared to write code for reversing a string, checking primes, or explaining polymorphism.*`;
    } else {
      text = `🏢 **Placement Insights Hub**

I have prep dossiers for top companies. Ask me about:
- **Amazon SDE**: Online Assessment, LP Questions, System Design.
- **Google SWE**: Googliness, algorithmic expectations, dry runs.
- **Microsoft SDE**: Core coding, low-level design.
- **TCS / Infosys**: Final year project prep, basic coding, SQL Joins.

Which company's recruitment drive are you preparing for?`;
    }
  } 
  
  else if (agentId === "resume") {
    if (queryLower.includes("project") || queryLower.includes("bullet") || queryLower.includes("aud")) {
      text = `📝 **ATS Project Bullet Audit**

To make your project details stand out, we must convert passive bullet points into results-oriented sentences using **Google's X-Y-Z formula**:
*“Accomplished [X] as measured by [Y], by doing [Z]”*

#### Before (Weak):
- "Worked on an e-commerce website using React and Node.js. Used MongoDB for database."

#### After (Strong, Google X-Y-Z):
- "Developed a responsive e-commerce web application [X] achieving a 35% reduction in page load speeds [Y] by implementing lazy loading and Redis caching [Z] for 2,000+ daily active users."

#### Before (Weak):
- "Built a machine learning model to predict prices."

#### After (Strong, Google X-Y-Z):
- "Built and deployed a random forest regression model [X] that predicted housing prices with 92% accuracy [Y] by analyzing 50k+ scraped listings using Pandas and Scikit-Learn [Z]."

*Paste a bullet point from your resume, and I will rewrite it for you!*`;
    } else {
      text = `🔍 **Resume Auditor Workspace**

I review resumes against ATS (Applicant Tracking Systems) and SDE hiring benchmarks.

#### Key Tips:
1. **Single Page**: Keep your resume to exactly 1 page.
2. **No Graphics**: Avoid double-column layouts, progress bars, star ratings for skills, or profile photos (these break ATS parsers).
3. **Metrics-driven**: Every project must have numeric impacts (%, $, ms).
4. **Clean Stack**: Group your skills into Languages, Developer Tools, and Frameworks.

*Paste your resume text here, and I'll generate a review with a score out of 100!*`;
    }
  } 
  
  else if (agentId === "cscore") {
    if (queryLower.includes("deadlock") || queryLower.includes("os")) {
      text = `🖥️ **OS - Deadlocks & Paging**

#### Deadlock Conditions (Coffman Conditions)
Four conditions must hold simultaneously for a deadlock to occur:
1. **Mutual Exclusion**: At least one resource is held in non-shareable mode.
2. **Hold and Wait**: Process holds a resource and waits for another.
3. **No Preemption**: Resources cannot be taken away.
4. **Circular Wait**: Processes form a circular dependency chain.

#### Paging vs Virtual Memory
- **Paging**: Breaks physical memory into fixed Frames and logical memory into Pages to avoid fragmentation.
- **Thrashing**: Occurs when active pages are constantly swapped, causing high disk activity and dropping CPU utilization to near zero.`;
    } else if (queryLower.includes("join") || queryLower.includes("dbms") || queryLower.includes("normal")) {
      text = `🗄️ **DBMS - Joins & Normalization**

#### Normalization Quick Reference:
- **1NF**: Atomic values, no multi-valued attributes.
- **2NF**: In 1NF + No Partial Dependency (all non-key columns depend on the entire primary key).
- **3NF**: In 2NF + No Transitive Dependency (non-key columns do not depend on other non-key columns).
- **BCNF**: Stronger 3NF. For any dependency \\(A \\rightarrow B\\), \\(A\\) must be a super key.

#### SQL Query Example (2nd Highest Salary):
\`\`\`sql
SELECT MAX(Salary) 
FROM Employee 
WHERE Salary < (SELECT MAX(Salary) FROM Employee);
\`\`\``;
    } else if (queryLower.includes("aptitude") || queryLower.includes("speed") || queryLower.includes("work")) {
      text = `🧮 **Aptitude Shortcut - Time & Work**

**Concept**: Work = Efficiency × Time.

- **Formula**: If A does work in \\(X\\) days and B does work in \\(Y\\) days, together they complete it in:
  $$\\text{Days} = \\frac{X \\times Y}{X + Y}$$
  
- **Short-cut Example**: If A takes 10 days and B takes 15 days:
  $$\\text{Together} = \\frac{10 \\times 15}{10 + 15} = \\frac{150}{25} = 6 \\text{ days}$$
  
- **Time, Speed, Distance**: To convert km/hr to m/s, multiply by \\(\\frac{5}{18}\\). To convert m/s to km/hr, multiply by \\(\\frac{18}{5}\\).`;
    } else {
      text = `📚 **CS Core & Aptitude Tutor**

I can explain core computer science topics and aptitude shortcuts:
- **DBMS**: Normalization, Joins, Transactions, Indexing.
- **Operating Systems**: Deadlock prevention, Paging, Process states.
- **Computer Networks**: TCP/IP stack, DNS lookup, HTTP vs HTTPS.
- **Quantitative Aptitude**: Time/Work, Speed/Distance, Probability, Permutations.

What subject or formula would you like to review?`;
    }
  } 
  
  else if (agentId === "hr") {
    if (queryLower.includes("yourself") || queryLower.includes("introduce")) {
      text = `🤝 **How to Answer: "Tell me about yourself"**

This is the icebreaker. Keep it to **90 seconds** and structure it using the **Present-Past-Future framework**:

1. **Present (30s)**: Introduce your name, branch, current college, and your core technical specialties (e.g. "I am a final year Computer Science student specializing in full-stack web development and cloud-native systems").
2. **Past (40s)**: Mention 1 key project or internship achievement (e.g. "Recently, I interned at Tech Corp where I optimized their database, or I built a RAG-based search system that solved scattered resource problems for 500 college peers").
3. **Future (20s)**: Align with the target role and company (e.g. "I'm highly passionate about writing highly concurrent code, which is why I'm excited about the SDE role at your company").

*Try writing a 3-sentence introduction, and I will critique it!*`;
    } else if (queryLower.includes("weakness")) {
      text = `⚠️ **How to Answer: "What is your biggest weakness?"**

**Goal**: Show self-awareness, honesty, and an active plan for self-improvement. Never say "I am a perfectionist" or "I work too hard" (interviewers hate cliché fake weaknesses).

#### Structure:
1. **State a real, non-fatal weakness** (not a core job requirement; e.g. public speaking, or difficulty delegating tasks, or getting too caught up in details).
2. **Give context**: Briefly explain how this weakness affected your work.
3. **Show the remedy**: Explain what concrete actions you are taking to overcome it.

#### Example:
"My biggest weakness used to be public speaking. In group projects, I preferred doing all the coding rather than presenting our slides. Knowing this would limit me, I joined our college's toastmasters club and volunteered to present our weekly project updates. It's still a work in progress, but I now feel much more confident speaking in front of panels."`;
    } else {
      text = `🗣️ **HR & Behavioral Coach**

Behavioral interviews are where candidates win or lose. Let's practice:
- **The STAR Method**: Structure situation, task, action, and results.
- **Standard Questions**: "Tell me about yourself", "Why this company?", "Describe a failure".
- **Conflict Resolution**: How you handle team disagreements.

Type a draft answer to a question, and let's critique it!`;
    }
  }

  return {
    agentId: agentId,
    text: text + sourcesText,
    routed: routed,
    sources: ragResults.slice(0, 3)
  };
}
