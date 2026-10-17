import { ingestLegalDocument, LegalDocumentInput } from "../lib/rag/ingest";

const initialRegulations: LegalDocumentInput[] = [
  {
    document_id: "PP-7-2021-UMKM",
    title: "Peraturan Pemerintah No. 7 Tahun 2021 tentang Kemudahan, Pelindungan, dan Pemberdayaan Koperasi dan UMKM",
    category: "KRITERIA_UMKM",
    source_url: "https://peraturan.bpk.go.id/Details/161836/pp-no-7-tahun-2021",
    raw_text: `
Pasal 35
(1) Usaha Mikro, Kecil, dan Menengah dikelompokkan berdasarkan kriteria modal usaha atau hasil penjualan tahunan.
(2) Kriteria modal usaha sebagaimana dimaksud pada ayat (1) digunakan untuk pendirian atau pendaftaran kegiatan usaha.
(3) Kriteria modal usaha terdiri atas:
a. Usaha Mikro memiliki modal usaha sampai dengan paling banyak Rp1.000.000.000,00 (satu miliar rupiah) tidak termasuk tanah dan bangunan tempat usaha;
b. Usaha Kecil memiliki modal usaha lebih dari Rp1.000.000.000,00 (satu miliar rupiah) sampai dengan paling banyak Rp5.000.000.000,00 (lima miliar rupiah) tidak termasuk tanah dan bangunan tempat usaha; dan
c. Usaha Menengah memiliki modal usaha lebih dari Rp5.000.000.000,00 (lima miliar rupiah) sampai dengan paling banyak Rp10.000.000.000,00 (sepuluh miliar rupiah) tidak termasuk tanah dan bangunan tempat usaha.

Pasal 36
(1) Kriteria hasil penjualan tahunan (omzet) terdiri atas:
a. Usaha Mikro memiliki hasil penjualan tahunan sampai dengan paling banyak Rp2.000.000.000,00 (dua miliar rupiah);
b. Usaha Kecil memiliki hasil penjualan tahunan lebih dari Rp2.000.000.000,00 (dua miliar rupiah) sampai dengan paling banyak Rp15.000.000.000,00 (lima belas miliar rupiah); dan
c. Usaha Menengah memiliki hasil penjualan tahunan lebih dari Rp15.000.000.000,00 (lima belas miliar rupiah) sampai dengan paling banyak Rp50.000.000.000,00 (lima puluh miliar rupiah).

Pasal 42
(1) Perizinan Berusaha bagi Usaha Mikro dan Kecil diberikan melalui perizinan tunggal.
(2) Perizinan tunggal sebagaimana dimaksud pada ayat (1) meliputi Nomor Induk Berusaha (NIB) yang berlaku sebagai:
a. perizinan berusaha;
b. tanda daftar perusahaan (TDP);
c. angka pengenal impor (API);
d. hak akses kepabeanan;
e. sertifikasi jaminan produk halal untuk UMK risiko rendah; dan
f. izin edar atau tanda daftar edar makanan sesuai dengan ketentuan peraturan perundang-undangan.
`
  },
  {
    document_id: "PP-5-2021-OSS-RBA",
    title: "Peraturan Pemerintah No. 5 Tahun 2021 tentang Penyelenggaraan Perizinan Berusaha Berbasis Risiko (OSS RBA)",
    category: "PERIZINAN",
    source_url: "https://peraturan.bpk.go.id/Details/161834/pp-no-5-tahun-2021",
    raw_text: `
Pasal 6
(1) Perizinan Berusaha Berbasis Risiko dilakukan berdasarkan penetapan tingkat risiko dan peringkat skala usaha kegiatan usaha.
(2) Tingkat risiko sebagaimana dimaksud pada ayat (1) meliputi:
a. tingkat risiko rendah;
b. tingkat risiko menengah rendah;
c. tingkat risiko menengah tinggi; atau
d. tingkat risiko tinggi.

Pasal 10
(1) Perizinan Berusaha untuk kegiatan usaha dengan tingkat risiko rendah berupa Nomor Induk Berusaha (NIB).
(2) NIB sebagaimana dimaksud pada ayat (1) merupakan legalitas pelaksanaan kegiatan berusaha bagi pelaku usaha untuk melakukan kegiatan persiapan, operasional, dan/atau komersial.
(3) NIB untuk kegiatan usaha dengan tingkat risiko rendah diterbitkan secara otomatis oleh Lembaga OSS setelah pengisian data lengkap.

Pasal 12
(1) Perizinan Berusaha untuk kegiatan usaha dengan tingkat risiko menengah rendah berupa NIB dan Sertifikat Standar.
(2) Sertifikat Standar sebagaimana dimaksud pada ayat (1) merupakan legalitas berupa pernyataan mandiri (self-declaration) pelaku usaha untuk memenuhi standar usaha dalam rangka melakukan kegiatan usaha.
`
  },
  {
    document_id: "PP-55-2022-PAJAK-UMKM",
    title: "Peraturan Pemerintah No. 55 Tahun 2022 tentang Penyesuaian Pengaturan di Bidang Pajak Penghasilan (PPh Final UMKM)",
    category: "PAJAK",
    source_url: "https://peraturan.bpk.go.id/Details/234019/pp-no-55-tahun-2022",
    raw_text: `
Pasal 56
(1) Wajib Pajak dalam negeri yang memiliki peredaran bruto tertentu dikenai Pajak Penghasilan yang bersifat final dengan tarif 0,5% (nol koma lima persen).
(2) Peredaran bruto tertentu sebagaimana dimaksud pada ayat (1) tidak melebihi Rp4.800.000.000,00 (empat miliar delapan ratus juta rupiah) dalam 1 (satu) Tahun Pajak.

Pasal 60
(1) Wajib Pajak Orang Pribadi yang memiliki peredaran bruto dari usaha tertentu sebagaimana dimaksud dalam Pasal 56 ayat (1), atas bagian peredaran bruto sampai dengan Rp500.000.000,00 (lima ratus juta rupiah) dalam 1 (satu) Tahun Pajak tidak dikenai Pajak Penghasilan.
(2) Pengenaan Pajak Penghasilan dengan tarif 0,5% hanya dihitung atas bagian peredaran bruto yang melebihi batas Rp500.000.000,00 (lima ratus juta rupiah) dalam tahun pajak yang bersangkutan.
`
  },
  {
    document_id: "UU-33-2014-HALAL-UMK",
    title: "UU No. 33 Tahun 2014 jo. Perppu No. 2 Tahun 2022 tentang Jaminan Produk Halal bagi Usaha Mikro dan Kecil",
    category: "HALAL",
    source_url: "https://peraturan.bpk.go.id/Details/38749/uu-no-33-tahun-2014",
    raw_text: `
Pasal 4
Produk yang masuk, beredar, dan diperdagangkan di wilayah Indonesia wajib bersertifikat halal, dengan penahapan pemberlakuan bagi produk makanan dan minuman serta jasa terkait.

Pasal 43A
(1) Kewajiban bersertifikat halal bagi pelaku Usaha Mikro dan Kecil (UMK) didasarkan atas pernyataan pelaku usaha (Self-Declare).
(2) Pernyataan pelaku usaha sebagaimana dimaksud pada ayat (1) dilakukan berdasarkan standar halal yang ditetapkan oleh BPJPH dan fatwa halal Majelis Ulama Indonesia.
(3) Pelaku UMK yang memenuhi ketentuan pernyataan mandiri tidak dikenakan biaya sertifikasi halal (biaya Rp 0,- atau program SEHATI yang difasilitasi oleh Pemerintah).
`
  }
];

async function main() {
  console.log("🚀 Memulai proses Ingestion Regulasi Hukum UMKM ke Pinecone...");

  for (const doc of initialRegulations) {
    console.log(`\n⏳ Menginjeksi dokumen: ${doc.title}...`);
    const result = await ingestLegalDocument(doc);
    if (result.status === "SUCCESS") {
      console.log(`✅ Berhasil! ${result.chunks_created} pasal/chunk tersimpan di Pinecone.`);
    } else {
      console.error(`❌ Gagal menginjeksi ${doc.document_id}: ${result.error}`);
    }
  }

  console.log("\n🎉 Seluruh regulasi dasar UMKM berhasil disimpan dan aktif di Pinecone!");
}

main().catch(console.error);
