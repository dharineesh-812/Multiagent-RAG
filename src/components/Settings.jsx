import React, { useState, useEffect } from "react";

export default function Settings({ onSettingsSaved }) {
  const [apiKey, setApiKey] = useState("");
  const [targetCompany, setTargetCompany] = useState("Amazon");
  const [targetRole, setTargetRole] = useState("Software Development Engineer (SDE-1)");
  const [dsaLevel, setDsaLevel] = useState("Beginner");
  const [branch, setBranch] = useState("Computer Science & Engineering");
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    // Load existing settings
    const storedKey = localStorage.getItem("gemini_api_key") || "";
    const storedCompany = localStorage.getItem("target_company") || "Amazon";
    const storedRole = localStorage.getItem("target_role") || "Software Development Engineer (SDE-1)";
    const storedDsa = localStorage.getItem("dsa_level") || "Beginner";
    const storedBranch = localStorage.getItem("branch") || "Computer Science & Engineering";

    setApiKey(storedKey);
    setTargetCompany(storedCompany);
    setTargetRole(storedRole);
    setDsaLevel(storedDsa);
    setBranch(storedBranch);
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem("gemini_api_key", apiKey.trim());
    localStorage.setItem("target_company", targetCompany);
    localStorage.setItem("target_role", targetRole);
    localStorage.setItem("dsa_level", dsaLevel);
    localStorage.setItem("branch", branch);

    setSaveStatus("success");
    setTimeout(() => setSaveStatus(""), 3000);

    if (onSettingsSaved) {
      onSettingsSaved({
        apiKey: apiKey.trim(),
        targetCompany,
        targetRole,
        dsaLevel,
        branch
      });
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: "650px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
        ⚙️ Profile & System Settings
      </h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "24px", fontSize: "0.95rem" }}>
        Configure your target placement profile and provide your Gemini API key. The API key is stored locally in your browser's memory and is only sent directly to Google APIs.
      </p>

      <form onSubmit={handleSave}>
        <div className="input-group">
          <label className="input-label">Gemini API Key</label>
          <input
            type="password"
            className="text-input"
            placeholder={apiKey ? "••••••••••••••••••••••••••••••••" : "Paste your Gemini API Key here..."}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted-dark)" }}>
            Need a key? Get one for free from Google AI Studio. Leave empty to run the app in offline Demo Mode.
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div className="input-group">
            <label className="input-label">Target Company</label>
            <select
              className="text-input"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              style={{ background: "var(--bg-surface-solid)", cursor: "pointer" }}
            >
              <option value="Amazon">Amazon</option>
              <option value="Google">Google</option>
              <option value="Microsoft">Microsoft</option>
              <option value="TCS">TCS (Ninja/Digital)</option>
              <option value="Infosys">Infosys (SE/Power Programmer)</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Current DSA Skill Level</label>
            <select
              className="text-input"
              value={dsaLevel}
              onChange={(e) => setDsaLevel(e.target.value)}
              style={{ background: "var(--bg-surface-solid)", cursor: "pointer" }}
            >
              <option value="Beginner">Beginner (No coding experience)</option>
              <option value="Intermediate">Intermediate (Know arrays, strings, basic recursion)</option>
              <option value="Advanced">Advanced (Comfortable with trees, graphs, dynamic programming)</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Target Role</label>
          <input
            type="text"
            className="text-input"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Software Development Engineer (SDE-1)"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Academic Branch</label>
          <input
            type="text"
            className="text-input"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="e.g. Computer Science & Engineering"
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "24px" }}>
          <button type="submit" className="btn btn-primary">
            Save Profile Configuration
          </button>
          
          {saveStatus === "success" && (
            <span style={{ color: "var(--color-dsa)", fontWeight: "600", fontSize: "0.9rem" }}>
              ✓ Settings saved successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
