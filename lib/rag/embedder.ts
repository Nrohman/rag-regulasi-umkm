/**
 * Embedder Module using Google Gemini
 * Generates 1536-dimensional embeddings natively compatible with our Pinecone index.
 */

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const EMBED_MODEL = "models/gemini-embedding-001";
const EMBED_DIMENSION = 1536;

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY or GEMINI_API_KEY is not defined in environment variables");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/${EMBED_MODEL}:embedContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBED_MODEL,
      content: {
        parts: [{ text: text.trim() }],
      },
      outputDimensionality: EMBED_DIMENSION,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini Embedding API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data.embedding || !data.embedding.values) {
    throw new Error("Invalid response format from Gemini Embedding API");
  }

  return data.embedding.values as number[];
}

export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  // Process with concurrency limit / sequentially to avoid hitting rate limits
  for (const text of texts) {
    const vector = await generateEmbedding(text);
    results.push(vector);
  }
  return results;
}
