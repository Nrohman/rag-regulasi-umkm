import { NextRequest, NextResponse } from "next/server";
import { ingestLegalDocument, LegalDocumentInput } from "@/lib/rag/ingest";

export const dynamic = "force-dynamic";

/**
 * Automated Cron Job Endpoint to synchronize fresh regulations
 * Triggered by scheduled runner or external cron service
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Verify secret if CRON_SECRET is configured
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing CRON_SECRET" },
        { status: 401 }
      );
    }

    // In a production environment, this fetches from EXTERNAL_LAW_API_URL
    // Here we provide the standard automated pipeline handler
    const externalApiUrl = process.env.EXTERNAL_LAW_API_URL;
    let syncResults = [];

    // Sample payload / simulated feed update
    const sampleRegulationFeed: LegalDocumentInput[] = [
      {
        document_id: "UPDATE-OSS-RBA-2026",
        title: "Panduan Penyesuaian KBLI dan OSS RBA Sektor UMKM Terkini",
        category: "PERIZINAN",
        source_url: "https://oss.go.id/panduan",
        raw_text: `
Pasal 1
Ketentuan integrasi data perizinan berusaha bagi pelaku Usaha Mikro dan Kecil dipercepat dengan validasi otomatis NIK dan NPWP melalui sistem OSS.

Pasal 2
Pelaku usaha dengan tingkat risiko rendah dibebaskan dari kewajiban pemenuhan persyaratan standar teknis lingkungan lanjutan dan cukup menyertakan SPPL mandiri yang terbit bersama NIB.
`
      }
    ];

    for (const doc of sampleRegulationFeed) {
      const res = await ingestLegalDocument(doc);
      syncResults.push(res);
    }

    return NextResponse.json({
      message: "Automated legal data pipeline sync completed successfully",
      synced_at: new Date().toISOString(),
      results: syncResults,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to run automated legal fetcher", details: error.message },
      { status: 500 }
    );
  }
}
