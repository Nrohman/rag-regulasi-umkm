import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { retrieveLegalContext } from "@/lib/rag/retriever";

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const body = await req.json();
    const userMessage = body.message;

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY belum dikonfigurasi di lingkungan server" },
        { status: 500 }
      );
    }

    // 1. Simpan pesan pengguna ke database PostgreSQL Supabase
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

    // 3. Tarik konteks hukum dari Pinecone (Strict RAG: status ACTIVE + adaptive thresholding)
    const retrieval = await retrieveLegalContext(userMessage, 3);

    // 4. Susun System Prompt Konsultan Hukum Ramah & Berintegritas
    const systemPrompt = `Anda adalah "UMKM Law AI Assistant", asisten hukum & perizinan resmi yang ramah, empatik, dan solutif bagi pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) di Indonesia.

PANDUAN UTAMA:
1. Integritas Fakta Hukum (Strict RAG): Jawab pertanyaan pengguna HANYA berdasarkan naskah peraturan resmi yang dilampirkan dalam KONTEKS di bawah. DILARANG KERAS mengarang pasal, ayat, angka batas omzet/biaya, atau kriteria fiktif.
2. Penomoran Sitasi: Setiap menyampaikan klaim hukum (syarat, batas omzet, tarif pajak, nama perizinan), CANTUMKAN sitasi langsung dengan format [Ref 1], [Ref 2], dsb. TEPAT setelah kalimat tersebut (misalnya: "Berdasarkan Pasal 12 ayat (1) [Ref 1]").
3. HANYA cantumkan sitasi [Ref X] yang benar-benar relevan dan Anda gunakan dalam jawaban. Jangan pernah mengutip referensi yang tidak berhubungan dengan topik pertanyaan pengguna.
4. Format Jawaban:
   - Berikan kesimpulan langsung yang jelas dan solutif bagi pelaku usaha di awal (misal: "Anda TIDAK WAJIB membayar PPh Final (Pajak = Rp 0 / Nihil)").
   - Paparkan dasar hukum secara terperinci dan spesifik hingga ke nomor pasal, nomor ayat, dan huruf/poinnya (misal: "Pasal 12 ayat (2) huruf a [Ref 1]").
   - Perhitungan Angka & Rumus: DILARANG KERAS menggunakan sintaks LaTeX atau kode seperti $$, $, \\text{}, \\mathbf{}, \\times. Tuliskan perhitungan matematika secara bersih dan rapi menggunakan cetak tebal (bold) bahasa Indonesia yang mudah dipahami.
     Contoh format yang benar:
     * **Dasar Pengenaan Pajak (DPP):** Rp 350.000.000 - Rp 500.000.000 = **Rp 0** (omzet belum melebihi batas bebas pajak Rp 500 juta)
     * **PPh Final Terutang (0,5%):** 0,5% × Rp 0 = **Rp 0 (Nihil)**
   - Gunakan format Markdown yang rapi (bullet points, bold).
5. Di luar Konteks: Jika pertanyaan pengguna di luar cakupan regulasi UMKM, sampaikan dengan sopan bahwa Anda berfokus pada regulasi bisnis UMKM dan sarankan instansi terkait.

KONTEKS REGULASI HUKUM RESMI:
${retrieval.contextText || "Tidak ada pasal hukum spesifik yang ditemukan."}`;

    // 5. Susun pesan untuk Gemini API
    const contents: any[] = [];
    
    // Masukkan riwayat obrolan terdahulu
    history.slice(0, -1).forEach((msg: any) => {
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

    // 6. Panggil Gemini Streaming API via SSE dengan fallback cerdas antar model
    const candidateModels = ["gemini-flash-latest", "gemini-3.5-flash", "gemini-2.5-flash"];
    let geminiResponse: Response | null = null;
    let lastError = "";

    for (const model of candidateModels) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
      try {
        const res = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.1,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        });

        if (res.ok) {
          geminiResponse = res;
          break;
        } else {
          lastError = await res.text();
          console.warn(`Model ${model} gagal (${res.status}), mencoba model alternatif...`);
        }
      } catch (err: any) {
        lastError = err.message;
      }
    }

    if (!geminiResponse) {
      throw new Error(`Semua model Gemini gagal dihubungi: ${lastError}`);
    }

    const geminiReader = geminiResponse.body?.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let fullAssistantResponse = "";

    // 7. Buat ReadableStream kustom untuk frontend
    const stream = new ReadableStream({
      async start(controller) {
        // Kirim metadata sitasi awal
        const initialCitations = retrieval.citations.map((c, i) => ({ ...c, refIndex: i + 1 }));
        const citationsPayload = JSON.stringify({
          type: "citations",
          citations: initialCitations,
        });
        controller.enqueue(encoder.encode(`data: ${citationsPayload}\n\n`));

        if (!geminiReader) {
          controller.close();
          return;
        }

        let buffer = "";

        try {
          while (true) {
            const { done, value } = await geminiReader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            // Pertahankan potongan baris terakhir yang belum lengkap di buffer
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith("data: ")) {
                try {
                  const json = JSON.parse(trimmed.slice(6));
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

          // Proses baris terakhir jika masih tersisa di buffer
          if (buffer.trim().startsWith("data: ")) {
            try {
              const json = JSON.parse(buffer.trim().slice(6));
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
            } catch {}
          }

          // Filter sitasi: Ambil HANYA sitasi yang benar-benar dirujuk oleh asisten dalam jawabannya
          const citedIndices = new Set<number>();
          const refRegex = /\[[^\]]*\bRef\s*(\d+)[^\]]*\]/gi;
          let match: RegExpExecArray | null;
          while ((match = refRegex.exec(fullAssistantResponse)) !== null) {
            const refNum = parseInt(match[1], 10);
            if (refNum >= 1 && refNum <= initialCitations.length) {
              citedIndices.add(refNum);
            }
          }

          const activeCitations = citedIndices.size > 0
            ? initialCitations.filter((c) => citedIndices.has(c.refIndex))
            : (initialCitations.length > 0 ? [initialCitations[0]] : []);

          // Kirim pembaruan sitasi final yang terverifikasi ke frontend
          const refinedPayload = JSON.stringify({
            type: "citations",
            citations: activeCitations,
          });
          controller.enqueue(encoder.encode(`data: ${refinedPayload}\n\n`));

          // Simpan balasan lengkap AI dan Sitasi terverifikasi ke database
          if (fullAssistantResponse.trim()) {
            try {
              await prisma.message.create({
                data: {
                  sessionId,
                  role: "assistant",
                  content: fullAssistantResponse,
                  citations: activeCitations as any,
                },
              });

              // Update session updatedAt
              await prisma.session.update({
                where: { id: sessionId },
                data: { updatedAt: new Date() },
              });
            } catch (dbErr) {
              console.error("Gagal menyimpan pesan asisten ke Prisma:", dbErr);
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
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
