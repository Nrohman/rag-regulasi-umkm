import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { retrieveLegalContext, RetrievedLegalChunk } from "@/lib/rag/retriever";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    sessionId: string;
  };
}

export async function POST(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { sessionId } = params;
    const body = await req.json();
    const userMessage = body?.message?.trim();

    if (!userMessage) {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key Google Gemini belum dikonfigurasi di server" },
        { status: 500 }
      );
    }

    // 1. Simpan pesan pengguna ke Database Supabase
    await prisma.message.create({
      data: {
        sessionId,
        role: "user",
        content: userMessage,
      },
    });

    // 2. Ambil riwayat chat terakhir (sliding window 6 pesan)
    const recentMessages = await prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
    const history = recentMessages.reverse();

    // 3. Tarik konteks hukum dari Pinecone (Strict RAG: status ACTIVE)
    const retrieval = await retrieveLegalContext(userMessage, 3);

    // 4. Susun System Prompt Konsultan Hukum Ramah
    const systemPrompt = `Anda adalah "UMKM Law AI Assistant", asisten hukum & perizinan resmi yang ramah, empatik, dan solutif bagi pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) di Indonesia.

PANDUAN UTAMA:
1. Integritas Fakta Hukum (Strict RAG): Jawab pertanyaan pengguna HANYA berdasarkan konteks dokumen hukum resmi yang dilampirkan di bawah. JANGAN mengarang pasal, angka omzet, atau syarat izin fiktif.
2. Penomoran Sitasi: Setiap kali Anda menyampaikan klaim hukum (syarat, batas omzet, tarif pajak, nama perizinan), CANTUMKAN sitasi langsung dengan format [Ref 1], [Ref 2], dsb. yang bersesuaian tepat setelah kalimat tersebut.
3. Gaya Bahasa: Gunakan Bahasa Indonesia yang hangat, komunikatif, dan mudah dipahami orang awam. Hindari bahasa birokrasi berbelit-belit. Gunakan format Markdown (bold, bullet list, atau tabel jika ada klasifikasi).
4. Di luar Konteks: Jika pertanyaan tidak ada dalam konteks hukum yang dilampirkan, katakan dengan sopan bahwa Anda saat ini fokus pada regulasi UMKM inti (OSS-RBA PP 5/2021, Kriteria UMKM PP 7/2021, Pajak UMKM PP 55/2022, dan Sertifikasi Halal UMK) dan sarankan berkonsultasi ke dinas perizinan terkait.

KONTEKS REGULASI HUKUM RESMI:
${retrieval.contextText || "Tidak ada pasal hukum spesifik yang ditemukan."}`;

    // 5. Susun pesan untuk Gemini API
    const contents: any[] = [];
    
    // Masukkan riwayat obrolan terdahulu
    history.slice(0, -1).forEach((msg) => {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    });

    // Masukkan pesan terakhir dengan System Prompt
    contents.push({
      role: "user",
      parts: [
        {
          text: `${systemPrompt}\n\nPertanyaan Pengguna:\n${userMessage}`,
        },
      ],
    });

    // 6. Panggil Gemini Streaming API via SSE
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      throw new Error(`Gemini API Error (${geminiResponse.status}): ${errText}`);
    }

    const geminiReader = geminiResponse.body?.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let fullAssistantResponse = "";

    // 7. Buat ReadableStream kustom untuk frontend
    const stream = new ReadableStream({
      async start(controller) {
        // Kirim metadata sitasi hukum terlebih dahulu
        const citationsPayload = JSON.stringify({
          type: "citations",
          citations: retrieval.citations,
        });
        controller.enqueue(encoder.encode(`data: ${citationsPayload}\n\n`));

        if (!geminiReader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await geminiReader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const json = JSON.parse(line.slice(6));
                  const candidate = json.candidates?.[0];
                  const text = candidate?.content?.parts?.[0]?.text;

                  if (text) {
                    fullAssistantResponse += text;
                    const tokenPayload = JSON.stringify({
                      type: "token",
                      token: text,
                    });
                    controller.enqueue(encoder.encode(`data: ${tokenPayload}\n\n`));
                  }
                } catch {
                  // Ignore JSON parse errors from partial SSE chunks
                }
              }
            }
          }
        } catch (streamErr: any) {
          console.error("Stream reader error:", streamErr);
          const errPayload = JSON.stringify({
            type: "token",
            token: `\n\n*(Terjadi gangguan koneksi: ${streamErr.message})*`,
          });
          controller.enqueue(encoder.encode(`data: ${errPayload}\n\n`));
        } finally {
          controller.close();

          // 8. Simpan balasan lengkap AI dan Sitasi ke database PostgreSQL Supabase
          if (fullAssistantResponse.trim()) {
            try {
              await prisma.message.create({
                data: {
                  sessionId,
                  role: "assistant",
                  content: fullAssistantResponse,
                  citations: retrieval.citations as any,
                },
              });

              // Update session updatedAt
              await prisma.session.update({
                where: { id: sessionId },
                data: { updatedAt: new Date() },
              });

              // Jika sesi masih memiliki judul default, buatkan judul otomatis singkat
              const sessionData = await prisma.session.findUnique({
                where: { id: sessionId },
                include: { _count: { select: { messages: true } } },
              });

              if (sessionData && sessionData.title === "Percakapan Baru") {
                const words = userMessage.split(/\s+/).slice(0, 5).join(" ");
                await prisma.session.update({
                  where: { id: sessionId },
                  data: { title: words || "Konsultasi Regulasi" },
                });
              }
            } catch (dbErr) {
              console.error("Gagal menyimpan pesan AI ke Prisma:", dbErr);
            }
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada endpoint chat", details: error.message },
      { status: 500 }
    );
  }
}
