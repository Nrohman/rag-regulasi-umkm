# Project Architecture (Multi-Session RAG)

├── /app                  
│   ├── /api
│   │   ├── /sessions             # GET/POST riwayat chat dari Prisma
│   │   ├── /chat/[sessionId]     # Endpoint streaming RAG + Chat History
│   │   ├── /cron/fetch-law       # Cron job penarikan data API regulasi
│   │   └── /admin/docs           # CRUD dokumen (Manual fallback upload)
│   ├── /c/[sessionId]            # Halaman dinamis obrolan spesifik
│   ├── /admin                    # Dasbor Admin untuk manajemen dokumen
│   └── /page.tsx                 # Halaman utama (Memulai sesi chat baru)
├── /components
│   ├── /layout
│   │   └── Sidebar.tsx           # Panel riwayat sesi obrolan
│   ├── /chat
│   │   ├── ChatArea.tsx          # Area utama, mendukung streaming & loading skeleton
│   │   ├── ChatMessage.tsx       # Render pesan (Markdown support)
│   │   └── KnowledgeAuditModal.tsx # Modal referensi (Teks asli & sumber)
├── /prisma
│   └── schema.prisma             # Skema database relasional (Sesi & Pesan)
├── /lib                  
│   ├── /rag                      # Logika chunking, embedding, integrasi Pinecone
│   ├── /db                       # Prisma client initialization
│   └── /store                    # Zustand state management
└── /data                         # Folder referensi skema JSON