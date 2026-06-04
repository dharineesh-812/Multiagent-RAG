import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import ChatWindow from "./components/ChatWindow";
import ResumeAuditor from "./components/ResumeAuditor";
import RoadmapTracker from "./components/RoadmapTracker";
import KnowledgeExplorer from "./components/KnowledgeExplorer";
import Settings from "./components/Settings";
import { initializeVectorCache } from "./rag/ragEngine";
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profileSummary, setProfileSummary] = useState({
    targetCompany: "Amazon",
    targetRole: "Software Development Engineer (SDE-1)"
  });

  // Load profile summaries for workspace header
  const loadProfileSummary = () => {
    const targetCompany = localStorage.getItem("target_company") || "Amazon";
    const targetRole = localStorage.getItem("target_role") || "Software Development Engineer (SDE-1)";
    setProfileSummary({ targetCompany, targetRole });
  };

  useEffect(() => {
    loadProfileSummary();
    
    // Check if API key is present and initialize vector embeddings in background
    const key = localStorage.getItem("gemini_api_key");
    if (key) {
      initializeVectorCache(key);
    }
  }, []);

  const handleSettingsSaved = (newSettings) => {
    loadProfileSummary();
    if (newSettings.apiKey) {
      initializeVectorCache(newSettings.apiKey);
    }
  };

  const getWorkspaceTitle = () => {
    switch (activeTab) {
      case "dashboard": return "Placement Control Center";
      case "chat": return "AI Specialist Multi-Agent Chat";
      case "resume": return "ATS Resume Auditor Workspace";
      case "roadmap": return "Personalized Preparation Milestones";
      case "knowledge": return "RAG Search Console & Library";
      case "settings": return "System Settings & Profile";
      default: return "Placement Assistant";
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <div className="sidebar-header">
          <span style={{ fontSize: "1.6rem" }}>⚡</span>
          <div className="sidebar-logo">PrepAgent RAG</div>
        </div>

        <div className="sidebar-nav">
          <div 
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <span>📊</span> Dashboard
          </div>
          <div 
            className={`nav-item ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            <span>💬</span> Specialist Chat
          </div>
          <div 
            className={`nav-item ${activeTab === "resume" ? "active" : ""}`}
            onClick={() => setActiveTab("resume")}
          >
            <span>📝</span> Resume Auditor
          </div>
          <div 
            className={`nav-item ${activeTab === "roadmap" ? "active" : ""}`}
            onClick={() => setActiveTab("roadmap")}
          >
            <span>🎯</span> Roadmap Tracker
          </div>
          <div 
            className={`nav-item ${activeTab === "knowledge" ? "active" : ""}`}
            onClick={() => setActiveTab("knowledge")}
          >
            <span>📚</span> Knowledge Base
          </div>
          <div 
            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <span>⚙️</span> Settings
          </div>
        </div>

        <div className="sidebar-footer">
          <div>PrepAgent RAG v1.0.0</div>
          <div style={{ marginTop: "4px", fontSize: "0.75rem" }}>Engineering Placements</div>
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="main-workspace">
        {/* Workspace Header */}
        <div className="workspace-header">
          <h2 className="header-title">{getWorkspaceTitle()}</h2>
          <div className="header-actions">
            <span 
              className="badge" 
              style={{ 
                backgroundColor: "hsla(180, 100%, 50%, 0.08)",
                color: "var(--color-coordinator)",
                border: "1px solid hsla(180, 100%, 50%, 0.2)"
              }}
            >
              Target: {profileSummary.targetCompany} ({profileSummary.targetRole.split(" ")[0]})
            </span>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
              <span 
                style={{ 
                  width: "8px", 
                  height: "8px", 
                  borderRadius: "50%", 
                  backgroundColor: localStorage.getItem("gemini_api_key") ? "var(--color-dsa)" : "var(--color-cscore)"
                }}
              ></span>
              {localStorage.getItem("gemini_api_key") ? "API Active (Vector RAG)" : "Demo Mode (Keyword RAG)"}
            </div>
          </div>
        </div>

        {/* Workspace Scrollable Content */}
        <div className="workspace-content">
          {activeTab === "dashboard" && (
            <Dashboard onNavigateTo={(tab) => setActiveTab(tab)} />
          )}
          {activeTab === "chat" && (
            <ChatWindow />
          )}
          {activeTab === "resume" && (
            <ResumeAuditor />
          )}
          {activeTab === "roadmap" && (
            <RoadmapTracker />
          )}
          {activeTab === "knowledge" && (
            <KnowledgeExplorer />
          )}
          {activeTab === "settings" && (
            <Settings onSettingsSaved={handleSettingsSaved} />
          )}
        </div>
      </div>
    </div>
  );
}
