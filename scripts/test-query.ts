import { retrieveLegalContext } from "../lib/rag/retriever";

async function testRAG() {
  const query = "Berapa batas omset usaha mikro dan apakah ada fasilitas bebas pajak?";
  console.log("🔍 Pertanyaan Pengguna:", query);
  
  const result = await retrieveLegalContext(query, 2);
  console.log(`\n📄 Ditemukan ${result.citations.length} referensi pasal hukum:`);
  
  result.citations.forEach((c, idx) => {
    console.log(`\n[Ref ${idx + 1}] ${c.title}`);
    console.log(`📍 Pasal: ${c.pasal} | Kategori: ${c.category} | Relevansi: ${(c.score * 100).toFixed(1)}%`);
    console.log(`🔗 Sumber Resmi: ${c.source_url}`);
    console.log(`📜 Cuplikan Teks:\n"${c.content_raw}"`);
  });
}

testRAG().catch(console.error);
