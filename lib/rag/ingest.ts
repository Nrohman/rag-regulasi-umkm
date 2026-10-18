import { getPineconeIndex } from "./pinecone";
import { generateEmbedding } from "./embedder";
import { splitLegalDocument } from "./splitter";

export interface LegalDocumentInput {
  document_id: string;
  title: string;
  category: "PERIZINAN" | "PAJAK" | "KRITERIA_UMKM" | "HALAL" | "BPOM" | "KETENAGAKERJAAN";
  source_url: string;
  raw_text: string;
}

export interface LegalGranularChunk {
  chunk_id: string;
  document_id: string;
  title: string;
  pasal: string;
  category: "PERIZINAN" | "PAJAK" | "KRITERIA_UMKM" | "HALAL" | "BPOM" | "KETENAGAKERJAAN";
  source_url: string;
  content_raw: string;
}

export interface IngestionResult {
  document_id: string;
  title: string;
  chunks_created: number;
  status: "SUCCESS" | "FAILED";
  error?: string;
}

/**
 * Ingests a complete legal document into Pinecone Vector DB with strict metadata injection.
 */
export async function ingestLegalDocument(
  doc: LegalDocumentInput
): Promise<IngestionResult> {
  try {
    const index = getPineconeIndex();
    const chunks = splitLegalDocument(doc.raw_text, { maxChunkChars: 3000 });

    if (chunks.length === 0) {
      throw new Error(`Dokumen ${doc.document_id} tidak menghasilkan chunk yang valid.`);
    }

    const vectorsToUpsert = [];

    for (const chunk of chunks) {
      const vectorId = `${doc.document_id}#chunk-${chunk.chunk_index}`;
      
      // Generate 1536-dim embedding using Gemini
      const embedding = await generateEmbedding(
        `${doc.title} - ${chunk.pasal}:\n${chunk.content_raw}`
      );

      vectorsToUpsert.push({
        id: vectorId,
        values: embedding,
        metadata: {
          document_id: doc.document_id,
          title: doc.title,
          pasal: chunk.pasal,
          category: doc.category,
          chunk_index: chunk.chunk_index,
          content_raw: chunk.content_raw,
          status: "ACTIVE",
          source_url: doc.source_url,
          last_updated: new Date().toISOString(),
        },
      });
    }

    // Upsert to Pinecone in batches of 50
    const batchSize = 50;
    for (let i = 0; i < vectorsToUpsert.length; i += batchSize) {
      const batch = vectorsToUpsert.slice(i, i + batchSize);
      await index.upsert(batch);
    }

    return {
      document_id: doc.document_id,
      title: doc.title,
      chunks_created: chunks.length,
      status: "SUCCESS",
    };
  } catch (error: any) {
    return {
      document_id: doc.document_id,
      title: doc.title,
      chunks_created: 0,
      status: "FAILED",
      error: error.message || "Unknown ingestion error",
    };
  }
}

/**
 * Ingests pre-curated, highly-granular legal chunks (Article & Ayat specific)
 * for 100% deterministic retrieval accuracy without chunking ambiguities.
 */
export async function ingestCuratedChunks(
  chunks: LegalGranularChunk[]
): Promise<{ status: "SUCCESS" | "FAILED"; total: number; error?: string }> {
  try {
    const index = getPineconeIndex();
    const vectorsToUpsert = [];

    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i];
      // Generate embedding with clean contextual anchor
      const embeddingText = `${c.title} - ${c.pasal}:\n${c.content_raw}`;
      const embedding = await generateEmbedding(embeddingText);

      vectorsToUpsert.push({
        id: c.chunk_id,
        values: embedding,
        metadata: {
          document_id: c.document_id,
          title: c.title,
          pasal: c.pasal,
          category: c.category,
          chunk_index: i,
          content_raw: c.content_raw,
          status: "ACTIVE",
          source_url: c.source_url,
          last_updated: new Date().toISOString(),
        },
      });
    }

    const batchSize = 50;
    for (let i = 0; i < vectorsToUpsert.length; i += batchSize) {
      const batch = vectorsToUpsert.slice(i, i + batchSize);
      await index.upsert(batch);
    }

    return { status: "SUCCESS", total: vectorsToUpsert.length };
  } catch (error: any) {
    return { status: "FAILED", total: 0, error: error.message || "Unknown ingestion error" };
  }
}
