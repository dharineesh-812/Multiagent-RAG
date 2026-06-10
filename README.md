# Multiagent RAG — Placement Prep Assistant 🤖

An intelligent multi-agent RAG (Retrieval-Augmented Generation) system designed to assist students in campus placement preparation through AI-powered Q&A.

## 🌐 Live Demo

👉 [multiagent-rag.vercel.app](https://multiagent-rag.vercel.app)

## 🚀 Features

- Multi-agent architecture for specialized query handling
- RAG-based responses grounded in placement preparation content
- Covers DSA, CS fundamentals (OS, DBMS, CN), and interview tips
- Clean conversational UI built with React
- Fast and lightweight — deployed on Vercel

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, JavaScript, CSS |
| AI Layer | RAG (Retrieval-Augmented Generation) |
| Agent Framework | Multi-agent orchestration |
| Deployment | Vercel |
| Build Tool | Vite |

## ⚙️ How to Run Locally

```bash
git clone https://github.com/dharineesh-812/Multiagent-RAG.git
cd Multiagent-RAG
npm install
npm run dev
```

## 🧠 How It Works

1. User submits a placement-related question
2. The router agent identifies the query type (DSA / CS theory / HR)
3. The relevant specialized agent retrieves context from the knowledge base
4. RAG pipeline generates a grounded, accurate response
5. Answer is displayed in the conversational UI

## 🔮 Future Enhancements

- ChromaDB vector store integration for semantic search
- LangChain agent orchestration
- PDF upload for custom study material ingestion
- Mock interview simulation mode
- Performance analytics dashboard
