/**
 * Pasal-Aware Legal Text Splitter
 * Preserves legal context by chunking based on Article (Pasal) and Chapter (BAB) boundaries.
 */

export interface LegalChunk {
  pasal: string;
  content_raw: string;
  chunk_index: number;
}

export interface SplitLegalDocOptions {
  maxChunkChars?: number;
}

export function splitLegalDocument(
  text: string,
  options: SplitLegalDocOptions = {}
): LegalChunk[] {
  const maxChunkChars = options.maxChunkChars || 3000;
  const chunks: LegalChunk[] = [];

  // Normalize line endings
  const normalizedText = text.replace(/\r\n/g, "\n");

  // Split by "Pasal <number><letter>" pattern ONLY at line beginnings or start of document
  // Avoids matching cross-references in the middle of sentences (e.g. "sebagaimana dimaksud dalam Pasal 56")
  const articleRegex = /(?=(?:^|\n)\s*Pasal\s+\d+[A-Za-z]?\b)/gi;
  const rawSections = normalizedText.split(articleRegex);

  let chunkCounter = 0;

  for (const section of rawSections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    // Detect Pasal name from first line (e.g. "Pasal 56", "Pasal 43A")
    const matchPasal = trimmed.match(/^Pasal\s+\d+[A-Za-z]?/i);
    const pasalName = matchPasal ? matchPasal[0] : "Ketentuan Umum";

    // If section fits within max chunk limit, keep intact
    if (trimmed.length <= maxChunkChars) {
      chunks.push({
        pasal: pasalName,
        content_raw: trimmed,
        chunk_index: chunkCounter++,
      });
    } else {
      // Split large article by paragraphs or sentences while preserving Pasal header
      const paragraphs = trimmed.split(/\n\s*\n/);
      let currentSubChunk = "";

      for (const p of paragraphs) {
        const cleanP = p.trim();
        if (!cleanP) continue;

        if ((currentSubChunk + "\n\n" + cleanP).length > maxChunkChars) {
          if (currentSubChunk) {
            chunks.push({
              pasal: pasalName,
              content_raw: currentSubChunk.trim(),
              chunk_index: chunkCounter++,
            });
          }
          // Start next chunk with Pasal prefix for context continuity
          currentSubChunk = `[Lanjutan ${pasalName}]\n${cleanP}`;
        } else {
          currentSubChunk = currentSubChunk
            ? currentSubChunk + "\n\n" + cleanP
            : cleanP;
        }
      }

      if (currentSubChunk.trim()) {
        chunks.push({
          pasal: pasalName,
          content_raw: currentSubChunk.trim(),
          chunk_index: chunkCounter++,
        });
      }
    }
  }

  return chunks;
}
