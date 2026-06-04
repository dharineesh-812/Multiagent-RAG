import React, { useState, useEffect } from "react";
import { agents } from "../agents/agentDefinitions";

export default function Dashboard({ onNavigateTo }) {
  const [profile, setProfile] = useState({
    targetCompany: "Amazon",
    targetRole: "Software Development Engineer (SDE-1)",
    dsaLevel: "Beginner",
    branch: "Computer Science & Engineering"
  });

  const [stats, setStats] = useState({
    resumeScore: 0,
    roadmapTotal: 15,
    roadmapCompleted: 0,
    readiness: 10
  });

  useEffect(() => {
    // Read profile settings
    const targetCompany = localStorage.getItem("target_company") || "Amazon";
    const targetRole = localStorage.getItem("target_role") || "Software Development Engineer (SDE-1)";
    const dsaLevel = localStorage.getItem("dsa_level") || "Beginner";
    const branch = localStorage.getItem("branch") || "Computer Science & Engineering";
    setProfile({ targetCompany, targetRole, dsaLevel, branch });

    // Read resume score
    const storedResumeScore = parseInt(localStorage.getItem("resume_score") || "0", 10);
    
    // Read roadmap tasks
    const storedRoadmap = JSON.parse(localStorage.getItem("roadmap_progress") || "{}");
    const completedCount = Object.values(storedRoadmap).filter(val => val === true).length;

    // Default roadmap item total is 15 (defined in RoadmapTracker)
    const totalRoadmap = 15;
    
    // Compute readiness score (Simple weighted average)
    // 40% from Resume Score, 40% from Roadmap completion, 20% from profile setup completeness
    const profileCompleteness = targetCompany && targetRole ? 100 : 50;
    const roadmapPercentage = totalRoadmap > 0 ? (completedCount / totalRoadmap) * 100 : 0;
    const resumeScoreValue = storedResumeScore > 0 ? storedResumeScore : 0;
    
    const computedReadiness = Math.round(
      (resumeScoreValue * 0.40) + 
      (roadmapPercentage * 0.40) + 
      (profileCompleteness * 0.20)
    );

    setStats({
      resumeScore: storedResumeScore,
      roadmapTotal: totalRoadmap,
      roadmapCompleted: completedCount,
      readiness: computedReadiness || 15 // min 15 for demo layout
    });
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Hero Welcome banner */}
      <div className="dashboard-hero">
        <h1 style={{ fontSize: "2rem", marginBottom: "8px", fontWeight: "700" }}>
          Welcome back to Prep Assistant
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: "800px" }}>
          Your personalized agent team is ready to help you prepare for <strong style={{ color: "var(--text-primary)" }}>{profile.targetCompany}</strong>. You are currently studying as an <strong style={{ color: "var(--text-primary)" }}>{profile.dsaLevel}</strong> candidate.
        </p>
        <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <button className="btn btn-primary" onClick={() => onNavigateTo("chat")}>
            Launch Chat Workspace
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigateTo("settings")}>
            Edit Placement Target
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-grid">
        <div className="glass-card stat-card">
          <div>
            <div className="input-label" style={{ marginBottom: "6px" }}>Readiness Score</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px" }}>Calculated prep index</div>
            <div className="stat-val">{stats.readiness}%</div>
          </div>
          <div 
            style={{ 
              width: "70px", 
              height: "70px", 
              borderRadius: "50%", 
              background: `conic-gradient(var(--color-coordinator) ${stats.readiness}%, transparent ${stats.readiness}% 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "5px"
            }}
          >
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "var(--bg-surface-solid)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: "600" }}>
              Ready
            </div>
          </div>
        </div>

        <div className="glass-card stat-card" style={{ cursor: "pointer" }} onClick={() => onNavigateTo("resume")}>
          <div>
            <div className="input-label" style={{ marginBottom: "6px" }}>Resume Rating</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px" }}>ATS auditor evaluation</div>
            <div className="stat-val" style={{ color: "var(--color-resume)" }}>
              {stats.resumeScore > 0 ? `${stats.resumeScore}/100` : "Not Scored"}
            </div>
          </div>
          <div style={{ fontSize: "2rem" }}>📝</div>
        </div>

        <div className="glass-card stat-card" style={{ cursor: "pointer" }} onClick={() => onNavigateTo("roadmap")}>
          <div>
            <div className="input-label" style={{ marginBottom: "6px" }}>Roadmap Status</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px" }}>Syllabus checklist completion</div>
            <div className="stat-val" style={{ color: "var(--color-dsa)" }}>
              {stats.roadmapCompleted}/{stats.roadmapTotal}
            </div>
          </div>
          <div style={{ fontSize: "2rem" }}>🎯</div>
        </div>
      </div>

      {/* Agents status list */}
      <div>
        <h3 style={{ marginBottom: "16px", fontSize: "1.2rem", fontWeight: "600" }}>Your Dedicated Multi-Agent Squad</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {Object.values(agents).map((agent) => (
            <div 
              key={agent.id} 
              className="glass-card" 
              style={{ 
                padding: "20px", 
                display: "flex", 
                flexDirection: "column", 
                gap: "12px",
                borderColor: `hsla(${agent.id === "coordinator" ? "180" : agent.id === "dsa" ? "142" : agent.id === "company" ? "195" : agent.id === "resume" ? "270" : agent.id === "cscore" ? "45" : "340"}, 40%, 30%, 0.3)`
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div 
                  className="agent-avatar" 
                  style={{ 
                    "--agent-gradient": agent.gradient,
                    width: "36px",
                    height: "36px",
                    fontSize: "0.95rem",
                    borderRadius: "8px"
                  } }
                >
                  {agent.avatar}
                </div>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: "600" }}>{agent.name}</h4>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#4caf50", display: "inline-block" }}></span>
                    Online & Active
                  </div>
                </div>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", flex: 1 }}>{agent.role}</p>
              <button 
                className="btn btn-secondary" 
                style={{ alignSelf: "flex-start", padding: "6px 12px", fontSize: "0.8rem", borderRadius: "6px" }}
                onClick={() => {
                  localStorage.setItem("selected_agent_chat_temp", agent.id);
                  onNavigateTo("chat");
                }}
              >
                Consult Agent
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Target Placement Summary */}
      <div className="glass-card" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
        <div>
          <div className="input-label">Placement Stream</div>
          <p style={{ fontWeight: "600", fontSize: "1.05rem", marginTop: "4px" }}>{profile.branch}</p>
        </div>
        <div>
          <div className="input-label">Target Role</div>
          <p style={{ fontWeight: "600", fontSize: "1.05rem", marginTop: "4px" }}>{profile.targetRole}</p>
        </div>
        <div>
          <div className="input-label">Target Company</div>
          <p style={{ fontWeight: "600", fontSize: "1.05rem", marginTop: "4px" }}>{profile.targetCompany}</p>
        </div>
        <div>
          <div className="input-label">Initial DSA Focus</div>
          <p style={{ fontWeight: "600", fontSize: "1.05rem", marginTop: "4px" }}>{profile.dsaLevel} Syllabus</p>
        </div>
      </div>
    </div>
  );
}
