import React, { useState, useEffect } from "react";
import { runAgentStep } from "../agents/orchestrator";
import { renderMarkdown } from "../utils/markdown";

const SAMPLE_RESUME = `DHARINEESH R
dhari@email.com | +91 9876543210 | github.com/dhari | linkedin.com/in/dhari

EDUCATION
B.E. Computer Science & Engineering | ABC Institute of Technology | CGPA: 8.9 | 2023 - 2027

TECHNICAL SKILLS
Languages: C++, Java, JavaScript, SQL
Web: HTML, CSS, React, Node.js, Express
Tools: Git, VS Code, Postman, MongoDB

PROJECTS
1. E-Commerce Website (React, Node.js, MongoDB)
- Built a web application for buying and selling products.
- Handled backend database setup and user accounts.
- Made the front-end interface look good and responsive.

2. Price Prediction Tool (Python, Machine Learning)
- Created a python script to predict prices based on past data.
- Handled dataset loading and cleaning.
- Improved accuracy by trying different models.

CO-CURRICULAR & LEADERSHIP
- Technical Club Member at college.
- Participated in internal hackathon.`;

export default function ResumeAuditor() {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState("");
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Load previously parsed score and text if they exist
    const savedScore = localStorage.getItem("resume_score");
    const savedText = localStorage.getItem("resume_raw_text");
    const savedResult = localStorage.getItem("resume_audit_result");

    if (savedScore) setScore(parseInt(savedScore, 10));
    if (savedText) setResumeText(savedText);
    if (savedResult) setAuditResult(savedResult);
  }, []);

  const handleAudit = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    setAuditResult("");

    try {
      const apiKey = localStorage.getItem("gemini_api_key");
      const prompt = `Please audit my resume. Assess its ATS suitability, rate my formatting, and rewrite my project bullets using the Google X-Y-Z formula. 

Here is my resume text:
---
${resumeText}
---

IMPORTANT instructions for output:
1. Provide a summary of positive points and top 3 critical issues.
2. Under a section called '### ATS Optimization & Google X-Y-Z Upgrades', rewrite my projects' bullets to be metric-driven.
3. Somewhere in your response, write exactly "ATS SCORE: [number]" (e.g. "ATS SCORE: 72") where the number is your realistic evaluation score out of 100, based on formatting, action verbs, and metric presence.`;

      // Call the Resume Auditor agent
      const response = await runAgentStep(apiKey, "resume", prompt, []);
      const resultText = response.text;
      setAuditResult(resultText);
      localStorage.setItem("resume_audit_result", resultText);
      localStorage.setItem("resume_raw_text", resumeText);

      // Parse score from the response
      // Look for "ATS SCORE: XX"
      const scoreMatch = resultText.match(/ATS SCORE:\s*\[?(\d+)\]?/i);
      let parsedScore = 0;
      if (scoreMatch && scoreMatch[1]) {
        parsedScore = parseInt(scoreMatch[1], 10);
      } else {
        // Fallback: look for any "XX/100"
        const slashMatch = resultText.match(/(\d{2})\/100/);
        if (slashMatch && slashMatch[1]) {
          parsedScore = parseInt(slashMatch[1], 10);
        } else {
          parsedScore = 75; // Default score if none found
        }
      }

      setScore(parsedScore);
      localStorage.setItem("resume_score", parsedScore.toString());
    } catch (err) {
      console.error("Resume audit failed:", err);
      setAuditResult("⚠️ **Audit Failed**: An error occurred while contacting the AI agent. Please check your internet connection and API key.");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setResumeText(SAMPLE_RESUME.trim());
  };

  const clearWorkspace = () => {
    setResumeText("");
    setAuditResult("");
    setScore(0);
    localStorage.removeItem("resume_score");
    localStorage.removeItem("resume_raw_text");
    localStorage.removeItem("resume_audit_result");
  };

  return (
    <div className="resume-workspace">
      {/* Left Pane - Paste Area */}
      <div className="resume-pane">
        <div className="resume-pane-header">
          <span>📋 Resume Raw Text Input</span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: "0.75rem", borderRadius: "4px" }} onClick={loadSample}>
              Load Sample Resume
            </button>
            <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: "0.75rem", borderRadius: "4px", borderColor: "rgba(244, 67, 54, 0.4)" }} onClick={clearWorkspace}>
              Clear
            </button>
          </div>
        </div>
        <textarea
          className="resume-editor"
          placeholder="Paste your resume text here (in plain text or markdown)..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
        ></textarea>
        <button
          className="btn btn-primary"
          style={{ marginTop: "16px", background: "var(--color-resume)", color: "var(--bg-main)" }}
          onClick={handleAudit}
          disabled={loading || !resumeText.trim()}
        >
          {loading ? "Auditing Resume..." : "🚀 Run AI Resume Audit"}
        </button>
      </div>

      {/* Right Pane - Results Feedback */}
      <div className="resume-feedback-pane glass-card" style={{ padding: "24px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
            <div className="agent-typing" style={{ marginBottom: "16px" }}>
              <div className="typing-dot" style={{ backgroundColor: "var(--color-resume)" }}></div>
              <div className="typing-dot" style={{ backgroundColor: "var(--color-resume)" }}></div>
              <div className="typing-dot" style={{ backgroundColor: "var(--color-resume)" }}></div>
            </div>
            <strong>Resume Auditor is analyzing your details...</strong>
            <p style={{ fontSize: "0.85rem", marginTop: "8px", textAlign: "center", maxWidth: "320px" }}>
              Reviewing section structure, grading keyword density, and generating Google X-Y-Z optimization bullets.
            </p>
          </div>
        ) : auditResult ? (
          <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Score circle */}
            <div className="resume-score-container">
              <div 
                className="resume-score-radial"
                style={{
                  border: `5px solid hsla(270, 95%, 70%, 0.1)`,
                  boxShadow: `0 0 20px hsla(270, 95%, 70%, 0.15)`
                }}
              >
                {score}
              </div>
              <div className="resume-score-text">
                <h3>ATS Suitability Score</h3>
                <p>
                  {score >= 80 
                    ? "🎉 Strong resume! Ready for product placement drives."
                    : score >= 60 
                    ? "⚠️ Decent structure, but needs more quantitative metrics."
                    : "❌ Poor ATS compatibility. Needs immediate improvements."}
                </p>
              </div>
            </div>

            {/* Scrollable feedback report */}
            <div 
              className="markdown-content" 
              style={{ flex: 1, overflowY: "auto", paddingRight: "8px" }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(auditResult) }}
            />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔍</div>
            <h3>ATS Auditor Ready</h3>
            <p style={{ fontSize: "0.9rem", maxWidth: "340px", marginTop: "8px" }}>
              Paste your current resume on the left and click Audit. We will analyze your metrics, action verbs, and section headers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
