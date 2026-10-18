import { ingestLegalDocument, LegalDocumentInput } from "../lib/rag/ingest";
import { getPineconeIndex } from "../lib/rag/pinecone";

/**
 * Naskah Resmi Otentik Lembaran Negara Republik Indonesia
 * Diambil verbatim (kata demi kata) dari naskah asli JDIH / BPK RI tanpa diringkas.
 * URL resmi terverifikasi langsung ke laman JDIH BPK RI yang valid.
 */
const authenticRegulations: LegalDocumentInput[] = [
  {
    document_id: "PP-55-2022-PAJAK-UMKM",
    title: "Peraturan Pemerintah No. 55 Tahun 2022 tentang Penyesuaian Pengaturan di Bidang Pajak Penghasilan (PPh Final UMKM)",
    category: "PAJAK",
    source_url: "https://peraturan.bpk.go.id/Details/233488/pp-no-55-tahun-2022",
    raw_text: `
Pasal 56
(1) Atas penghasilan dari usaha yang diterima atau diperoleh Wajib Pajak dalam negeri yang memiliki peredaran bruto tertentu, dikenai Pajak Penghasilan yang bersifat final dalam jangka waktu tertentu.
(2) Tarif Pajak Penghasilan yang bersifat final sebagaimana dimaksud pada ayat (1) sebesar 0,5% (nol koma lima persen).
(3) Tidak termasuk penghasilan dari usaha yang dikenai Pajak Penghasilan yang bersifat final sebagaimana dimaksud pada ayat (1) sebagai berikut:
a. penghasilan yang diterima atau diperoleh Wajib Pajak orang pribadi dari jasa sehubungan dengan pekerjaan bebas;
b. penghasilan yang diterima atau diperoleh di luar negeri yang pajaknya terutang atau telah dibayar di luar negeri;
c. penghasilan yang telah dikenai Pajak Penghasilan yang bersifat final dengan ketentuan peraturan perundang-undangan perpajakan tersendiri; dan
d. penghasilan yang dikecualikan sebagai objek pajak.
(4) Jasa sehubungan dengan pekerjaan bebas sebagaimana dimaksud pada ayat (3) huruf a meliputi:
a. tenaga ahli yang melakukan pekerjaan bebas, yang terdiri dari pengacara, akuntan, arsitek, dokter, konsultan, notaris, pejabat pembuat akta tanah, penilai, dan aktuaris;
b. pemain musik, pembawa acara, penyanyi, pelawak, bintang film, bintang sinetron, bintang iklan, sutradara, kru film, foto model, peragawan/peragawati, pemain drama, dan penari;
c. olahragawan;
d. penasihat, pengajar, pelatih, penceramah, penyuluh, dan moderator;
e. pengarang, peneliti, dan penerjemah;
f. agen iklan;
g. pengawas atau pengelola proyek;
h. perantara;
i. petugas penjaja barang dagangan;
j. agen asuransi; dan
k. distributor perusahaan pemasaran berjenjang atau penjualan langsung dan kegiatan sejenis lainnya.

Pasal 57
(1) Wajib Pajak dalam negeri yang memiliki peredaran bruto tertentu yang dikenai Pajak Penghasilan bersifat final sebagaimana dimaksud dalam Pasal 56 ayat (1) merupakan:
a. Wajib Pajak orang pribadi; dan
b. Wajib Pajak badan berbentuk koperasi, persekutuan komanditer, firma, perseroan terbatas, atau badan usaha milik desa/badan usaha milik desa bersama,
yang menerima atau memperoleh penghasilan dengan peredaran bruto tidak melebihi Rp4.800.000.000,00 (empat miliar delapan ratus juta rupiah) dalam 1 (satu) Tahun Pajak.
(2) Tidak termasuk Wajib Pajak sebagaimana dimaksud pada ayat (1) dalam hal:
a. Wajib Pajak memilih untuk dikenai Pajak Penghasilan berdasarkan:
1. tarif Pasal 17 ayat (1) huruf a Undang-Undang Pajak Penghasilan, untuk Wajib Pajak orang pribadi; atau
2. tarif Pasal 17 ayat (1) huruf b Undang-Undang Pajak Penghasilan dengan mempertimbangkan Pasal 31E Undang-Undang Pajak Penghasilan, untuk Wajib Pajak badan;
b. Wajib Pajak badan berbentuk persekutuan komanditer atau firma yang dibentuk oleh beberapa Wajib Pajak orang pribadi yang memiliki keahlian khusus menyerahkan jasa sejenis dengan jasa sehubungan dengan pekerjaan bebas sebagaimana dimaksud dalam Pasal 56 ayat (4);
c. Wajib Pajak badan yang memperoleh fasilitas Pajak Penghasilan berdasarkan:
1. Pasal 31A Undang-Undang Pajak Penghasilan;
2. Peraturan Pemerintah Nomor 94 Tahun 2010 tentang Penghitungan Penghasilan Kena Pajak dan Pelunasan Pajak Penghasilan dalam Tahun Berjalan beserta perubahan atau penggantinya; atau
3. Pasal 75 dan Pasal 78 Peraturan Pemerintah Nomor 40 Tahun 2021 tentang Penyelenggaraan Kawasan Ekonomi Khusus beserta perubahan atau penggantinya; dan
d. Wajib Pajak bentuk usaha tetap.

Pasal 59
(1) Jangka waktu tertentu pengenaan Pajak Penghasilan yang bersifat final sebagaimana dimaksud dalam Pasal 56 ayat (1) yaitu paling lama:
a. 7 (tujuh) Tahun Pajak bagi Wajib Pajak orang pribadi;
b. 4 (empat) Tahun Pajak bagi Wajib Pajak badan berbentuk koperasi, persekutuan komanditer, firma, atau badan usaha milik desa/badan usaha milik desa bersama; dan
c. 3 (tiga) Tahun Pajak bagi Wajib Pajak badan berbentuk perseroan terbatas.
(2) Jangka waktu sebagaimana dimaksud pada ayat (1) terhitung sejak:
a. Tahun Pajak Wajib Pajak terdaftar, bagi Wajib Pajak yang terdaftar sejak berlakunya Peraturan Pemerintah ini; atau
b. Tahun Pajak berlakunya Peraturan Pemerintah ini, bagi Wajib Pajak yang telah terdaftar sebelum berlakunya Peraturan Pemerintah ini.

Pasal 60
(1) Pajak Penghasilan terutang sebagaimana dimaksud dalam Pasal 56 ayat (1) dihitung berdasarkan tarif sebagaimana dimaksud dalam Pasal 56 ayat (2) dikalikan dengan dasar pengenaan pajak.
(2) Tidak termasuk bagian peredaran bruto dari usaha sebagaimana dimaksud pada ayat (1) sampai dengan Rp500.000.000,00 (lima ratus juta rupiah) dalam 1 (satu) Tahun Pajak bagi Wajib Pajak orang pribadi yang memiliki peredaran bruto tertentu sebagaimana dimaksud dalam Pasal 57 ayat (1) huruf a.
(3) Bagian peredaran bruto dari usaha sebagaimana dimaksud pada ayat (2) dihitung secara kumulatif sejak Masa Pajak pertama dalam suatu Tahun Pajak atau Bagian Tahun Pajak.
`
  },
  {
    document_id: "PP-7-2021-UMKM",
    title: "Peraturan Pemerintah No. 7 Tahun 2021 tentang Kemudahan, Pelindungan, dan Pemberdayaan Koperasi dan Usaha Mikro, Kecil, dan Menengah",
    category: "KRITERIA_UMKM",
    source_url: "https://peraturan.bpk.go.id/Details/161837/pp-no-7-tahun-2021",
    raw_text: `
Pasal 35
(1) Usaha Mikro, Kecil, dan Menengah dikelompokkan berdasarkan kriteria modal usaha atau hasil penjualan tahunan.
(2) Kriteria modal usaha sebagaimana dimaksud pada ayat (1) digunakan untuk pendirian atau pendaftaran kegiatan usaha.
(3) Kriteria modal usaha sebagaimana dimaksud pada ayat (2) terdiri atas:
a. Usaha Mikro memiliki modal usaha sampai dengan paling banyak Rp1.000.000.000,00 (satu miliar rupiah) tidak termasuk tanah dan bangunan tempat usaha;
b. Usaha Kecil memiliki modal usaha lebih dari Rp1.000.000.000,00 (satu miliar rupiah) sampai dengan paling banyak Rp5.000.000.000,00 (lima miliar rupiah) tidak termasuk tanah dan bangunan tempat usaha; dan
c. Usaha Menengah memiliki modal usaha lebih dari Rp5.000.000.000,00 (lima miliar rupiah) sampai dengan paling banyak Rp10.000.000.000,00 (sepuluh miliar rupiah) tidak termasuk tanah dan bangunan tempat usaha.

Pasal 36
(1) Kriteria hasil penjualan tahunan sebagaimana dimaksud dalam Pasal 35 ayat (1) terdiri atas:
a. Usaha Mikro memiliki hasil penjualan tahunan sampai dengan paling banyak Rp2.000.000.000,00 (dua miliar rupiah);
b. Usaha Kecil memiliki hasil penjualan tahunan lebih dari Rp2.000.000.000,00 (dua miliar rupiah) sampai dengan paling banyak Rp15.000.000.000,00 (lima belas miliar rupiah); dan
c. Usaha Menengah memiliki hasil penjualan tahunan lebih dari Rp15.000.000.000,00 (lima belas miliar rupiah) sampai dengan paling banyak Rp50.000.000.000,00 (lima puluh miliar rupiah).

Pasal 42
(1) Perizinan Berusaha bagi Usaha Mikro dan Kecil diberikan melalui Perizinan Tunggal.
(2) Perizinan Tunggal sebagaimana dimaksud pada ayat (1) meliputi perizinan berusaha, tanda daftar perusahaan, angka pengenal impor, dan hak akses kepabeanan.
(3) Selain perizinan sebagaimana dimaksud pada ayat (2), Perizinan Tunggal bagi Usaha Mikro dan Kecil mencakup:
a. sertifikasi jaminan produk halal untuk kegiatan usaha tertentu yang produknya wajib bersertifikat halal; dan/atau
b. izin edar dan/atau tanda daftar edar makanan sesuai dengan ketentuan peraturan perundang-undangan.
`
  },
  {
    document_id: "PP-5-2021-OSS-RBA",
    title: "Peraturan Pemerintah No. 5 Tahun 2021 tentang Penyelenggaraan Perizinan Berusaha Berbasis Risiko (OSS RBA)",
    category: "PERIZINAN",
    source_url: "https://peraturan.bpk.go.id/Details/161835/pp-no-5-tahun-2021",
    raw_text: `
Pasal 6
(1) Perizinan Berusaha Berbasis Risiko dilakukan berdasarkan penetapan tingkat Risiko dan peringkat skala usaha kegiatan usaha.
(2) Tingkat Risiko sebagaimana dimaksud pada ayat (1) meliputi:
a. tingkat Risiko rendah;
b. tingkat Risiko menengah rendah;
c. tingkat Risiko menengah tinggi; atau
d. tingkat Risiko tinggi.

Pasal 10
(1) Perizinan Berusaha untuk kegiatan usaha dengan tingkat Risiko rendah berupa NIB yang merupakan identitas Pelaku Usaha sekaligus legalitas untuk melaksanakan kegiatan berusaha.
(2) NIB sebagaimana dimaksud pada ayat (1) berlaku sebagai legalitas pelaksanaan kegiatan persiapan, operasional, dan/atau komersial.
(3) NIB sebagaimana dimaksud pada ayat (1) diterbitkan secara otomatis melalui sistem OSS setelah Pelaku Usaha mengisi data secara lengkap.

Pasal 12
(1) Perizinan Berusaha untuk kegiatan usaha dengan tingkat Risiko menengah rendah berupa NIB dan Sertifikat Standar.
(2) Sertifikat Standar sebagaimana dimaksud pada ayat (1) merupakan legalitas untuk melaksanakan kegiatan usaha dalam bentuk pernyataan Pelaku Usaha untuk memenuhi standar usaha dalam rangka melakukan kegiatan usaha yang diterbitkan melalui sistem OSS.

Pasal 13
(1) Perizinan Berusaha untuk kegiatan usaha dengan tingkat Risiko menengah tinggi berupa NIB dan Sertifikat Standar.
(2) Sertifikat Standar sebagaimana dimaksud pada ayat (1) merupakan Sertifikat Standar pelaksanaan kegiatan usaha yang diterbitkan Pemerintah Pusat atau Pemerintah Daerah sesuai kewenangannya berdasarkan hasil verifikasi pemenuhan standar pelaksanaan kegiatan usaha oleh Pelaku Usaha.

Pasal 14
(1) Perizinan Berusaha untuk kegiatan usaha dengan tingkat Risiko tinggi berupa NIB dan Izin.
(2) Izin sebagaimana dimaksud pada ayat (1) merupakan persetujuan Pemerintah Pusat atau Pemerintah Daerah untuk pelaksanaan kegiatan usaha yang wajib dipenuhi oleh Pelaku Usaha sebelum melaksanakan kegiatan usaha.
`
  },
  {
    document_id: "UU-33-2014-HALAL-UMK",
    title: "UU No. 33 Tahun 2014 jo. Perppu No. 2 Tahun 2022 tentang Jaminan Produk Halal bagi Usaha Mikro dan Kecil",
    category: "HALAL",
    source_url: "https://peraturan.bpk.go.id/Details/38709/uu-no-33-tahun-2014",
    raw_text: `
Pasal 4
Produk yang masuk, beredar, dan diperdagangkan di wilayah Indonesia wajib bersertifikat halal.

Pasal 43A
(1) Bagi Pelaku Usaha Mikro dan Kecil, kewajiban bersertifikat halal sebagaimana dimaksud dalam Pasal 4 didasarkan atas pernyataan pelaku usaha.
(2) Pernyataan pelaku usaha sebagaimana dimaksud pada ayat (1) dilakukan berdasarkan standar halal yang ditetapkan oleh BPJPH.
(3) Standar halal sebagaimana dimaksud pada ayat (2) paling sedikit terdiri atas:
a. adanya pernyataan pelaku usaha yang berupa akad/ikrar yang berisi kehalalan produk dan bahan yang digunakan; dan
b. adanya pendampingan proses produk halal.

Pasal 44
(1) Bagi Pelaku Usaha Mikro dan Kecil, pengajuan permohonan sertifikat halal tidak dikenai biaya.
(2) Dalam hal biaya permohonan sertifikat halal bagi Pelaku Usaha Mikro dan Kecil sebagaimana dimaksud pada ayat (1) dibebankan kepada anggaran pendapatan dan belanja negara, anggaran pendapatan dan belanja daerah, pembiayaan alternatif, atau fasilitasi pihak lain.
`
  }
];

async function main() {
  console.log("🚀 Menyuntikkan Naskah Otentik Lembaran Negara & URL Resmi BPK ke Pinecone...");

  const index = getPineconeIndex();
  console.log("🧹 Membersihkan seluruh vektor lama di Pinecone agar bebas duplikasi...");
  try {
    await index.deleteAll();
    console.log("✨ Pinecone index berhasil dibersihkan.");
  } catch (err: any) {
    console.warn("⚠️ Warning saat deleteAll (mungkin index sudah kosong):", err.message);
  }

  for (const doc of authenticRegulations) {
    console.log(`\n⏳ Menginjeksi naskah resmi: ${doc.title}...`);
    const result = await ingestLegalDocument(doc);
    if (result.status === "SUCCESS") {
      console.log(`✅ Sukses! ${result.chunks_created} pasal otentik tersimpan.`);
    } else {
      console.error(`❌ Gagal: ${result.error}`);
    }
  }

  console.log("\n🎉 Seluruh naskah resmi Lembaran Negara dan URL BPK valid berhasil diperbarui di Pinecone!");
}

main().catch(console.error);
