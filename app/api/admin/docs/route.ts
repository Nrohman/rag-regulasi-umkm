import { NextRequest, NextResponse } from "next/server";
import { ingestLegalDocument, LegalDocumentInput } from "@/lib/rag/ingest";
import pdfParse from "pdf-parse";

export const dynamic = "force-dynamic";

/**
 * Admin Endpoint for Manual PDF Document Upload & Ingestion
 * Fallback mechanism for specific technical PDF guides
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const documentId = (formData.get("document_id") as string) || `MANUAL-${Date.now()}`;
    const title = (formData.get("title") as string) || file?.name || "Dokumen Panduan Teknis UMKM";
    const category = (formData.get("category") as any) || "PERIZINAN";
    const sourceUrl = (formData.get("source_url") as string) || "Unggahan Manual Admin";

    if (!file) {
      return NextResponse.json(
        { error: "File PDF wajib disertakan (field: 'file')" },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF
    const pdfData = await pdfParse(buffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: "Gagal mengekstrak teks dari file PDF atau file kosong." },
        { status: 400 }
      );
    }

    // Process ingestion
    const docInput: LegalDocumentInput = {
      document_id: documentId,
      title: title,
      category: category,
      source_url: sourceUrl,
      raw_text: extractedText,
    };

    const result = await ingestLegalDocument(docInput);

    if (result.status === "FAILED") {
      return NextResponse.json(
        { error: "Gagal menginjeksi dokumen PDF ke Pinecone", details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Dokumen PDF berhasil diekstraksi dan disimpan ke Pinecone",
      document_id: result.document_id,
      title: result.title,
      total_pages: pdfData.numpages,
      chunks_created: result.chunks_created,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat memproses PDF", details: error.message },
      { status: 500 }
    );
  }
}
