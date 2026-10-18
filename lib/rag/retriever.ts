import { getPineconeIndex } from "./pinecone";
import { generateEmbedding } from "./embedder";

export interface RetrievedLegalChunk {
  document_id: string;
  title: string;
  pasal: string;
  category: string;
  content_raw: string;
  source_url: string;
  score: number;
}

export interface RetrievalResult {
  contextText: string;
  citations: RetrievedLegalChunk[];
}

/**
 * Retrieves legally active chunks from Pinecone strictly filtered by status: ACTIVE,
 * with adaptive similarity thresholding to avoid irrelevant cross-domain noise.
 */
export async function retrieveLegalContext(
  query: string,
  topK: number = 5
): Promise<RetrievalResult> {
  const index = getPineconeIndex();

  // 1. Generate query embedding (1536-dim via Gemini)
  const queryVector = await generateEmbedding(query);

  // 2. Query Pinecone with STRICT metadata filter: status === 'ACTIVE'
  const queryResponse = await index.query({
    vector: queryVector,
    topK,
    filter: {
      status: { $eq: "ACTIVE" },
    },
    includeMetadata: true,
  });

  const rawMatches = (queryResponse.matches || []).filter(
    (m) => m.metadata && (m.score || 0) >= 0.62
  );

  if (rawMatches.length === 0) {
    return { contextText: "", citations: [] };
  }

  // 3. Adaptive Relevance Thresholding:
  // Discard chunks that diverge significantly from the top match score (> 0.12 delta)
  const topScore = rawMatches[0].score || 0;
  const filteredMatches = rawMatches
    .filter((m) => topScore - (m.score || 0) <= 0.12)
    .slice(0, 3);

  const citations: RetrievedLegalChunk[] = [];
  const contextParts: string[] = [];

  filteredMatches.forEach((match, index) => {
    const meta = match.metadata as any;
    if (!meta) return;

    const chunkData: RetrievedLegalChunk = {
      document_id: meta.document_id || "UNKNOWN",
      title: meta.title || "Regulasi Hukum UMKM",
      pasal: meta.pasal || "Pasal",
      category: meta.category || "UMKM",
      content_raw: meta.content_raw || "",
      source_url: meta.source_url || "",
      score: match.score || 0,
    };

    citations.push(chunkData);

    // Format context with index number [Ref 1], [Ref 2] for LLM citation grounding
    contextParts.push(
      `[Ref ${index + 1}] ${chunkData.title} (${chunkData.pasal})\nKategori: ${chunkData.category}\nIsi Teks Asli:\n"${chunkData.content_raw}"\nSumber Resmi: ${chunkData.source_url}`
    );
  });

  return {
    contextText: contextParts.join("\n\n---\n\n"),
    citations,
  };
}
