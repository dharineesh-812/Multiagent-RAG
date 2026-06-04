import React, { useState, useEffect } from "react";

const ROADMAP_SECTIONS = [
  {
    id: "phase_dsa",
    title: "Phase 1: DSA Coding Foundations",
    description: "Build logic in standard arrays, strings, and problem-solving patterns.",
    tasks: [
      { id: "dsa_arrays", text: "Arrays & Hashing (Two Sum, Anagrams, Kadane's)" },
      { id: "dsa_pointers", text: "Two Pointers & Sliding Window patterns" },
      { id: "dsa_trees", text: "Binary Trees & Traversal (DFS, BFS)" },
      { id: "dsa_graphs", text: "Graphs algorithms (Dijkstra, Cycle Detection)" },
      { id: "dsa_dp", text: "Dynamic Programming (Coin Change, LCS)" }
    ]
  },
  {
    id: "phase_cscore",
    title: "Phase 2: CS Core Theory & Aptitude",
    description: "Prepare for online MCQ screenings and technical subject questions.",
    tasks: [
      { id: "cs_normalization", text: "DBMS: Normalization Forms (1NF, 2NF, 3NF, BCNF)" },
      { id: "cs_sql", text: "DBMS SQL: Joins, Group By, Window functions" },
      { id: "cs_deadlocks", text: "Operating Systems: Deadlock Coffman conditions & paging" },
      { id: "cs_networks", text: "Computer Networks: TCP handshake, DNS lookup, OSI model" },
      { id: "apt_math", text: "Quantitative Aptitude: Time & Work, Speed & Distance shortcuts" }
    ]
  },
  {
    id: "phase_resume",
    title: "Phase 3: Resume Audit & ATS Alignment",
    description: "Craft a competitive resume matching automated ATS crawlers.",
    tasks: [
      { id: "res_format", text: "Clean single-column layout (no tables/bars/photos)" },
      { id: "res_xyz", text: "Write project accomplishments using Google X-Y-Z formula" },
      { id: "res_ats", text: "Run ATS score audit (aim for score > 80)" }
    ]
  },
  {
    id: "phase_company",
    title: "Phase 4: Target Company Tactics",
    description: "Deep dive into target company formats and past experiences.",
    tasks: [
      { id: "comp_oa", text: "Check past Online Assessment (OA) patterns" },
      { id: "comp_experiences", text: "Query company interview experiences database via RAG" }
    ]
  },
  {
    id: "phase_hr",
    title: "Phase 5: Behavioral & Soft Skills",
    description: "Acing the final rounds with structured, impactful communication.",
    tasks: [
      { id: "hr_yourself", text: "Perfect the 'Tell me about yourself' introduction (90s)" },
      { id: "hr_star", text: "Prepare 3 project stories in STAR structure" },
      { id: "hr_mock", text: "Simulate a mock HR round evaluating weaknesses and conflicts" }
    ]
  }
];

export default function RoadmapTracker() {
  const [progress, setProgress] = useState({});
  const [completedCount, setCompletedCount] = useState(0);
  const totalTasks = ROADMAP_SECTIONS.reduce((acc, sec) => acc + sec.tasks.length, 0);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("roadmap_progress") || "{}");
    setProgress(stored);
    calculateCompleted(stored);
  }, []);

  const calculateCompleted = (currentProgress) => {
    const count = Object.values(currentProgress).filter(val => val === true).length;
    setCompletedCount(count);
  };

  const handleToggleTask = (taskId) => {
    const newProgress = {
      ...progress,
      [taskId]: !progress[taskId]
    };
    setProgress(newProgress);
    localStorage.setItem("roadmap_progress", JSON.stringify(newProgress));
    calculateCompleted(newProgress);
  };

  const completionPercentage = Math.round((completedCount / totalTasks) * 100);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Header and Progress Bar */}
      <div className="glass-card" style={{ marginBottom: "32px", padding: "28px" }}>
        <h2 style={{ marginBottom: "12px" }}>🎯 Personalized Preparation Roadmap</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "20px", fontSize: "0.95rem" }}>
          Track your progress across these critical placement phases. Checking off items raises your readiness score on the dashboard.
        </p>

        {/* Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ flex: 1, height: "10px", backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "5px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
            <div 
              style={{ 
                height: "100%", 
                width: `${completionPercentage}%`, 
                background: "var(--grad-primary)",
                transition: "width 0.4s ease-out-in"
              }}
            ></div>
          </div>
          <span style={{ fontWeight: "700", color: "var(--color-coordinator)", fontSize: "1.1rem" }}>
            {completionPercentage}%
          </span>
        </div>
        <div style={{ fontSize: "0.8rem", color: "var(--text-muted-dark)", marginTop: "8px", textAlign: "right" }}>
          {completedCount} of {totalTasks} milestones achieved
        </div>
      </div>

      {/* Timeline nodes */}
      <div className="roadmap-timeline">
        {ROADMAP_SECTIONS.map((sec) => {
          const sectionCompletedCount = sec.tasks.filter(t => progress[t.id]).length;
          const isSectionComplete = sectionCompletedCount === sec.tasks.length;

          return (
            <div key={sec.id} className={`roadmap-node ${isSectionComplete ? "completed" : ""}`}>
              <div className="roadmap-node-dot"></div>
              <div className="glass-card roadmap-node-card">
                <div className="roadmap-node-header">
                  <div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: "600", marginBottom: "4px" }}>
                      {sec.title}
                    </h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      {sec.description}
                    </p>
                  </div>
                  <span 
                    className="badge" 
                    style={{ 
                      backgroundColor: isSectionComplete ? "rgba(76, 175, 80, 0.15)" : "rgba(255, 255, 255, 0.05)",
                      color: isSectionComplete ? "var(--color-dsa)" : "var(--text-muted)",
                      border: `1px solid ${isSectionComplete ? "var(--color-dsa)" : "var(--border-color)"}`
                    }}
                  >
                    {isSectionComplete ? "Complete" : `${sectionCompletedCount}/${sec.tasks.length} Done`}
                  </span>
                </div>

                <div className="roadmap-subtasks">
                  {sec.tasks.map((task) => {
                    const isChecked = !!progress[task.id];
                    return (
                      <div 
                        key={task.id} 
                        className={`roadmap-task-item ${isChecked ? "checked" : ""}`}
                        onClick={() => handleToggleTask(task.id)}
                      >
                        <div className="roadmap-task-checkbox">
                          {isChecked && "✓"}
                        </div>
                        <span>{task.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
