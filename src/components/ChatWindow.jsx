import React, { useState, useEffect, useRef } from "react";
import { agents } from "../agents/agentDefinitions";
import { runAgentStep } from "../agents/orchestrator";
import { renderMarkdown } from "../utils/markdown";

// Helper to get initial greeting for each agent
const getAgentGreeting = (agentId) => {
  switch (agentId) {
    case "coordinator":
      return "👋 Hello! I am your lead **General Placement Coordinator**. I can help you draft a preparation timeline, detail our study modules, or direct your questions to one of our technical specialist agents. What company and role are you aiming for?";
    case "dsa":
      return "💻 **DSA Coding Coach Online.** I can help you understand data structures, walk through algorithm dry-runs, write optimal code, and analyze time/space complexity (Big O). Paste a problem statement or your current code block, and let's optimize it!";
    case "company":
      return "🏢 **Placement Insights Agent Online.** I track interview processes, coding assessments, and hiring patterns for companies like Google, Amazon, Microsoft, TCS, and Infosys. Ask me about a company's round structure or past interview experiences!";
    case "resume":
      return "🔍 **Resume & Profile Auditor Online.** I grade resumes against SDE hiring parameters and ATS guidelines. Paste your resume text here, or head over to the dedicated **Resume Auditor** tab in the sidebar for a complete score analysis and Google X-Y-Z bullet rewrites!";
    case "cscore":
      return "📚 **CS Core & Aptitude Tutor Online.** I explain database normalization, SQL queries, OS scheduling/deadlocks, TCP handshakes, and quantitative aptitude shortcuts. What subject or formula would you like to review?";
    case "hr":
      return "🗣️ **HR & Behavioral Coach Online.** I conduct behavioral interview simulations and mock HR checks. Let's practice! Paste your draft answer to questions like *'Tell me about yourself'* or *'Describe a conflict you resolved'*, and I will structure it using the STAR method.";
    default:
      return "Hello! How can I help you today?";
  }
};

export default function ChatWindow() {
  const [selectedAgentId, setSelectedAgentId] = useState("coordinator");
  const [chats, setChats] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSources, setActiveSources] = useState({}); // Stores expanded state for RAG sources per message ID
  
  const messagesEndRef = useRef(null);

  // Check if a navigation from dashboard passed a temporary agent selector
  useEffect(() => {
    const tempAgent = localStorage.getItem("selected_agent_chat_temp");
    if (tempAgent && agents[tempAgent]) {
      setSelectedAgentId(tempAgent);
      localStorage.removeItem("selected_agent_chat_temp");
    }
  }, []);

  // Load chat history from localStorage
  useEffect(() => {
    const loadedChats = {};
    Object.keys(agents).forEach((agentId) => {
      const history = localStorage.getItem(`chat_history_${agentId}`);
      if (history) {
        loadedChats[agentId] = JSON.parse(history);
      } else {
        // Seed initial greeting
        loadedChats[agentId] = [
          {
            id: `greeting_${agentId}`,
            sender: "agent",
            agentId: agentId,
            text: getAgentGreeting(agentId),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sources: []
          }
        ];
      }
    });
    setChats(loadedChats);
  }, []);

  // Scroll to bottom when messages update or active agent changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, selectedAgentId]);

  const activeChat = chats[selectedAgentId] || [];
  const activeAgent = agents[selectedAgentId] || agents.coordinator;

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userMessageText = inputValue.trim();
    setInputValue("");
    setLoading(true);

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const messageId = `msg_${Date.now()}`;

    // 1. Append User Message
    const updatedHistory = [
      ...activeChat,
      {
        id: messageId,
        sender: "student",
        text: userMessageText,
        timestamp: timestamp,
        sources: []
      }
    ];

    setChats((prev) => {
      const newChats = { ...prev, [selectedAgentId]: updatedHistory };
      localStorage.setItem(`chat_history_${selectedAgentId}`, JSON.stringify(updatedHistory));
      return newChats;
    });

    try {
      const apiKey = localStorage.getItem("gemini_api_key");
      
      // 2. Execute Agent Orchestrator Step
      // Pass history (excluding first greeting and stripping formatting)
      const agentInputHistory = updatedHistory.slice(1, -1);
      const response = await runAgentStep(apiKey, selectedAgentId, userMessageText, agentInputHistory);
      
      // 3. Compile Agent Message
      const agentTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const agentMsgId = `msg_${Date.now() + 1}`;
      
      let finalResponseText = response.text;
      
      // Prepend routing indicator if Coordinator auto-routed
      if (response.routed) {
        const routedAgentName = agents[response.agentId]?.name || response.agentId;
        finalResponseText = `\`[Route: Coordinator -> ${routedAgentName}]\`\n\n${finalResponseText}`;
      }

      const agentMessage = {
        id: agentMsgId,
        sender: "agent",
        agentId: response.agentId, // Could be routed target agent
        text: finalResponseText,
        timestamp: agentTimestamp,
        sources: response.sources || []
      };

      setChats((prev) => {
        const newChats = { 
          ...prev, 
          // If routed from coordinator, we append the message to the coordinator's chat screen
          [selectedAgentId]: [...updatedHistory, agentMessage] 
        };
        localStorage.setItem(`chat_history_${selectedAgentId}`, JSON.stringify(newChats[selectedAgentId]));
        return newChats;
      });

    } catch (error) {
      console.error("Failed to generate response:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSourceExpand = (msgId) => {
    setActiveSources(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const clearChatHistory = () => {
    if (window.confirm(`Are you sure you want to clear chat history for ${activeAgent.name}?`)) {
      const cleared = [
        {
          id: `greeting_${selectedAgentId}`,
          sender: "agent",
          agentId: selectedAgentId,
          text: getAgentGreeting(selectedAgentId),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: []
        }
      ];
      setChats(prev => {
        const updated = { ...prev, [selectedAgentId]: cleared };
        localStorage.setItem(`chat_history_${selectedAgentId}`, JSON.stringify(cleared));
        return updated;
      });
    }
  };

  return (
    <div className="chat-layout">
      {/* Sidebar with Agents list */}
      <div className="agent-selector-sidebar">
        <div className="agent-selector-title">Consult Specialists</div>
        {Object.values(agents).map((agent) => {
          const isSelected = selectedAgentId === agent.id;
          return (
            <div
              key={agent.id}
              className={`agent-card ${isSelected ? "active" : ""}`}
              style={{ "--agent-accent": agent.color, "--agent-gradient": agent.gradient }}
              onClick={() => setSelectedAgentId(agent.id)}
            >
              <div className="agent-avatar">{agent.avatar}</div>
              <div className="agent-info">
                <div className="agent-name">{agent.name}</div>
                <div className="agent-role-tag">{agent.role.substring(0, 36)}...</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main chat arena */}
      <div className="chat-arena" style={{ "--agent-accent": activeAgent.color, "--agent-gradient": activeAgent.gradient }}>
        {/* Header */}
        <div className="chat-header">
          <div className="agent-avatar" style={{ "--agent-gradient": activeAgent.gradient, width: "38px", height: "38px", fontSize: "1rem" }}>
            {activeAgent.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: "600" }}>{activeAgent.name}</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{activeAgent.role}</p>
          </div>
          <button 
            className="btn btn-secondary" 
            style={{ padding: "6px 12px", fontSize: "0.75rem", borderRadius: "6px", borderColor: "rgba(244,67,54,0.3)", color: "rgba(255,255,255,0.8)" }}
            onClick={clearChatHistory}
          >
            Clear History
          </button>
        </div>

        {/* Chat message streams */}
        <div className="chat-messages">
          {activeChat.map((msg) => {
            const isUser = msg.sender === "student";
            const msgAgent = agents[msg.agentId] || activeAgent;
            return (
              <div key={msg.id} className={`message ${isUser ? "user" : "agent"}`}>
                <div 
                  className="message-bubble" 
                  style={{ 
                    "--agent-accent": isUser ? "var(--color-resume)" : msgAgent.color 
                  }}
                >
                  <div className="message-sender">
                    {isUser ? "You (Student)" : msgAgent.name}
                  </div>
                  <div 
                    className="markdown-content"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
                  />

                  {/* RAG citations block */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: "12px", paddingTop: "8px", borderTop: "1px solid hsla(217, 30%, 20%, 0.4)" }}>
                      <button 
                        style={{ 
                          background: "none", 
                          border: "none", 
                          color: "var(--color-coordinator)", 
                          fontSize: "0.75rem", 
                          fontWeight: "600",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          outline: "none",
                          padding: "4px 0"
                        }}
                        onClick={() => toggleSourceExpand(msg.id)}
                      >
                        {activeSources[msg.id] ? "▼ Hide Injected RAG Context" : `▲ View Injected RAG Context (${msg.sources.length} matches)`}
                      </button>

                      {activeSources[msg.id] && (
                        <div style={{ 
                          marginTop: "8px", 
                          display: "flex", 
                          flexDirection: "column", 
                          gap: "6px",
                          animation: "fadeIn 0.2s ease" 
                        }}>
                          {msg.sources.map((src, sIdx) => (
                            <div 
                              key={src.chunk.id} 
                              style={{ 
                                background: "rgba(0,0,0,0.2)", 
                                border: "1px solid var(--border-color)", 
                                padding: "8px 12px", 
                                borderRadius: "6px",
                                fontSize: "0.75rem"
                              }}
                            >
                              <div style={{ fontWeight: "700", marginBottom: "4px", display: "flex", justifyContent: "space-between", color: "var(--text-primary)" }}>
                                <span>{sIdx + 1}. {src.chunk.parentTitle} ({src.chunk.title})</span>
                                <span style={{ color: "var(--color-dsa)" }}>Score: {Math.round(src.score * 100)}%</span>
                              </div>
                              <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)", whiteSpace: "pre-wrap" }}>
                                {src.chunk.content.substring(0, 160)}...
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="message-meta">
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {loading && (
            <div className="message agent">
              <div className="message-bubble">
                <div className="message-sender">{activeAgent.name} is thinking</div>
                <div className="agent-typing">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="chat-input-area">
          <input
            type="text"
            className="chat-textarea"
            placeholder={`Message ${activeAgent.name}...`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit" 
            className="send-btn" 
            style={{ "--agent-gradient": activeAgent.gradient }}
            disabled={loading || !inputValue.trim()}
          >
            <span style={{ fontSize: "1.1rem", color: "hsl(224, 71%, 4%)", fontWeight: "700" }}>➔</span>
          </button>
        </form>
      </div>
    </div>
  );
}
