# UMKM Law AI Assistant: RAG-Based Legal Navigator

Sistem asisten virtual berbasis kecerdasan buatan (*Artificial Intelligence*) yang dirancang khusus untuk membantu pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) bernavigasi dalam kompleksitas birokrasi perizinan dan regulasi perpajakan di Indonesia. 

Proyek ini mendemonstrasikan implementasi tingkat produksi dari arsitektur **Retrieval-Augmented Generation (RAG)** yang dilengkapi dengan *Fully Automated Data Pipeline* dan antarmuka obrolan multi-sesi, memastikan setiap panduan hukum yang diberikan akurat, terbarukan, dan bebas dari halusinasi AI.

---

## 🏗️ Cetak Biru Proyek (Project Blueprint)

### 1. Masalah Utama
*   **Kompleksitas Birokrasi:** Aturan perizinan (seperti OSS RBA) dan perpajakan berbentuk dokumen PDF ratusan halaman dengan bahasa hukum yang sulit dipahami UMKM secara instan.
*   **Kelemahan LLM Standar:** Model AI konvensional rentan mengalami *knowledge cutoff* (informasi kedaluwarsa) dan "halusinasi" (menciptakan pasal fiktif). Dalam ranah hukum, kesalahan informasi sangat berisiko.
*   **Keterlambatan Pembaruan Manual:** Mengandalkan unggah dokumen hukum secara manual sangat rentan tertinggal oleh cepatnya dinamika perubahan kebijakan (revisi undang-undang).

### 2. Solusi & Arsitektur
Proyek ini memecahkan masalah tersebut dengan memisahkan kemampuan berbahasa AI dari sumber pengetahuannya:
1.  **Strict RAG Implementation:** AI dikunci hanya untuk membaca dan merangkum konteks yang ditarik dari *Vector Database* internal (Pinecone). Jika jawaban tidak ada di *database*, AI diprogram untuk menolak menjawab.
2.  **Automated Data Pipeline:** Terintegrasi dengan API hukum eksternal via *Cron Job*. Sistem secara otomatis menarik aturan baru, memecahnya (*chunking*), dan menyimpannya ke *Vector DB* dengan metadata `status: ACTIVE`, sekaligus mengubah metadata aturan lama menjadi `REVOKED`.
3.  **Transparansi Audit:** Setiap jawaban AI disisipi kutipan langsung (*inline citation*). 

---

## ✨ Fitur Unggulan

*   💬 **Conversational UI Multi-Sesi (Gemini-Like):** 
    Antarmuka obrolan modern yang mendukung *streaming text*, pembuatan judul sesi otomatis, dan panel *sidebar* riwayat obrolan yang persisten (disimpan dalam PostgreSQL).
*   🔍 **Knowledge Audit Modal (Transparansi Sumber):** 
    Pengguna dapat mengklik nomor referensi di akhir kalimat AI. Sistem akan memunculkan *pop-up modal* berisi teks pasal asli (*raw chunk*) dan tautan langsung ke rilis dokumen resmi pemerintah.
*   ⚙️ **Otomatisasi & CRUD Admin:** 
    Berjalan secara mandiri (*autopilot*) untuk aturan umum via API. Namun, tetap menyediakan dasbor admin (CRUD) sebagai jalur *fallback* untuk mengunggah dokumen teknis spesifik format PDF (misal: Buku Panduan Teknis).

---

## 🛠️ Tech Stack & Infrastruktur

*   **Frontend / UI:** Next.js 14 (App Router), React 18, Tailwind CSS, Shadcn UI, Zustand (State Management).
*   **AI & Orkestrasi:** LangChain.js, OpenAI API / Gemini API.
*   **Vector Database (Knowledge Base):** Pinecone.
*   **Relational Database (Chat History):** PostgreSQL terintegrasi dengan Prisma ORM.
*   **Data Parser:** `pdf-parse` (untuk *ingestion* dokumen manual).

---

## 📂 Struktur Direktori Utama

```text
├── /app                  
│   ├── /api/chat/[sessionId] # Endpoint utama RAG & LLM Streaming
│   ├── /api/cron/fetch-law   # Skrip otomatisasi penarikan aturan hukum baru
│   ├── /c/[sessionId]        # Halaman obrolan dinamis per sesi
│   └── /admin                # Dasbor admin untuk audit vektor & unggah PDF manual
├── /components
│   ├── /layout/Sidebar.tsx   # Pengelola riwayat obrolan
│   └── /chat                 
│       ├── ChatArea.tsx      # Render obrolan dengan dukungan Markdown
│       └── KnowledgeAuditModal.tsx # Komponen modal transparansi referensi
├── /prisma
│   └── schema.prisma         # Skema relasional untuk Session dan Message
└── /lib/rag                  # Utilitas Chunking, Embedding, dan koneksi Pinecone