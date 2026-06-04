import { documents } from "./documents";
import { GoogleGenerativeAI } from "@google/generative-ai";

// In-memory cache for computed document chunk embeddings
let chunkEmbeddingsCache = {};
let isEmbeddingInProgress = false;

/**
 * Dynamically chunks documents based on markdown headers (### or ####).
 * This allows RAG to retrieve precise sections of text instead of massive documents.
 */
export function getChunks() {
  const chunks = [];
  
  documents.forEach((doc) => {
    // Split content by headers (### or ####)
    const lines = doc.content.split("\n");
    let currentChunkTitle = doc.title;
    let currentChunkLines = [];
    let chunkIdCounter = 0;

    lines.forEach((line) => {
      if (line.startsWith("### ") || line.startsWith("#### ")) {
        // Save the previous chunk if it has content
        if (currentChunkLines.length > 0) {
          chunks.push({
            id: `${doc.id}_chunk_${chunkIdCounter++}`,
            parentId: doc.id,
            category: doc.category,
            parentTitle: doc.title,
            title: currentChunkTitle,
            content: currentChunkLines.join("\n").trim(),
            tags: doc.tags
          });
        }
        currentChunkTitle = line.replace(/^[#\s]+/, "");
        currentChunkLines = [line];
      } else {
        currentChunkLines.push(line);
      }
    });

    // Push the final chunk
    if (currentChunkLines.length > 0) {
      chunks.push({
        id: `${doc.id}_chunk_${chunkIdCounter++}`,
        parentId: doc.id,
        category: doc.category,
        parentTitle: doc.title,
        title: currentChunkTitle,
        content: currentChunkLines.join("\n").trim(),
        tags: doc.tags
      });
    }
  });

  return chunks;
}

/**
 * Computes cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Pre-computes embeddings for all chunks using Gemini API.
 * Caches them in memory to avoid redundant API requests.
 */
export async function initializeVectorCache(apiKey) {
  if (!apiKey || isEmbeddingInProgress || Object.keys(chunkEmbeddingsCache).length > 0) return;
  
  isEmbeddingInProgress = true;
  console.log("Pre-computing RAG vector embeddings...");
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const chunks = getChunks();

    // To keep it simple and within rate limits, embed each chunk sequentially
    for (const chunk of chunks) {
      // Create a search-friendly payload
      const textToEmbed = `Title: ${chunk.title}\nCategory: ${chunk.category}\nContent: ${chunk.content}`;
      const result = await model.embedContent({
        content: { parts: [{ text: textToEmbed }] }
      });
      if (result && result.embedding && result.embedding.values) {
        chunkEmbeddingsCache[chunk.id] = result.embedding.values;
      }
    }
    console.log("RAG vector embeddings pre-computed successfully!");
  } catch (error) {
    console.error("Failed to pre-compute vector embeddings:", error);
  } finally {
    isEmbeddingInProgress = false;
  }
}

/**
 * Simple TF-IDF/Keyword similarity matching as a robust offline fallback.
 */
function performKeywordSearch(chunks, query, categoryFilter) {
  const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  if (queryWords.length === 0) return chunks.map(c => ({ chunk: c, score: 0.1, type: "keyword" }));

  const results = chunks
    .filter(chunk => categoryFilter === "all" || chunk.category === categoryFilter)
    .map((chunk) => {
      let score = 0;
      const contentLower = chunk.content.toLowerCase();
      const titleLower = chunk.title.toLowerCase();
      const tagsLower = chunk.tags.map(t => t.toLowerCase());

      queryWords.forEach((word) => {
        // Tag match has highest weight
        if (tagsLower.includes(word)) score += 3.5;
        
        // Title match has high weight
        if (titleLower.includes(word)) score += 2.0;

        // Content matches
        const wordRegex = new RegExp("\\b" + word + "\\b", "g");
        const matches = contentLower.match(wordRegex);
        if (matches) {
          score += matches.length * 0.5;
        } else if (contentLower.includes(word)) {
          // Partial match
          score += 0.1;
        }
      });

      return {
        chunk,
        score: Math.min(score / 10, 1.0), // Normalize roughly
        type: "keyword"
      };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Primary RAG search function.
 * Performs Vector Search if API key is active and embeddings are cached,
 * else falls back to keyword matching.
 */
export async function searchRAG(query, categoryFilter = "all", apiKey = null) {
  const chunks = getChunks();
  
  if (apiKey) {
    try {
      // Ensure cache is loaded
      if (Object.keys(chunkEmbeddingsCache).length === 0) {
        await initializeVectorCache(apiKey);
      }

      // If vector cache successfully populated
      if (Object.keys(chunkEmbeddingsCache).length > 0) {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        
        // Generate query embedding
        const result = await model.embedContent({
          content: { parts: [{ text: query }] }
        });
        
        const queryVector = result.embedding.values;
        
        const results = chunks
          .filter(chunk => categoryFilter === "all" || chunk.category === categoryFilter)
          .map((chunk) => {
            const chunkVector = chunkEmbeddingsCache[chunk.id];
            // Calculate similarity
            const sim = cosineSimilarity(queryVector, chunkVector);
            
            // Boost similarity if tags match query keywords
            let boost = 0;
            const queryWords = query.toLowerCase().split(/\W+/);
            chunk.tags.forEach(tag => {
              if (queryWords.includes(tag.toLowerCase())) {
                boost += 0.05;
              }
            });

            return {
              chunk,
              score: Math.min(sim + boost, 1.0),
              type: "vector"
            };
          })
          .filter(r => r.score > 0.35) // Threshold
          .sort((a, b) => b.score - a.score);
          
        return results;
      }
    } catch (error) {
      console.error("Vector search failed, falling back to keyword search:", error);
    }
  }

  // Fallback to offline keyword search
  return performKeywordSearch(chunks, query, categoryFilter);
}
