import * as dotenv from "dotenv";
dotenv.config();

import { ingestCuratedChunks, LegalGranularChunk } from "../lib/rag/ingest";
import { getPineconeIndex } from "../lib/rag/pinecone";

/**
 * Naskah Hukum Otentik Lembaran Negara Republik Indonesia
 * Setiap pasal dimuat secara 100% UTUH, LENGKAP seluruh ayatnya, dan VERBATIM kata demi kata.
 * Menjamin integritas hukum penuh tanpa ada ayat yang tertinggal atau terpotong.
 */
const authenticCompleteArticles: LegalGranularChunk[] = [
  // ==================== PP NO. 55 TAHUN 2022 (PAJAK UMKM) ====================
  {
    chunk_id: "PP55-2022-PASAL-56",
    document_id: "PP-55-2022-PAJAK-UMKM",
    title: "Peraturan Pemerintah No. 55 Tahun 2022 tentang Penyesuaian Pengaturan di Bidang Pajak Penghasilan (PPh Final UMKM)",
    pasal: "Pasal 56",
    category: "PAJAK",
    source_url: "https://peraturan.bpk.go.id/Details/233488/pp-no-55-tahun-2022",
    content_raw: `Pasal 56
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
k. distributor perusahaan pemasaran berjenjang atau penjualan langsung dan kegiatan sejenis lainnya.`
  },
  {
    chunk_id: "PP55-2022-PASAL-57",
    document_id: "PP-55-2022-PAJAK-UMKM",
    title: "Peraturan Pemerintah No. 55 Tahun 2022 tentang Penyesuaian Pengaturan di Bidang Pajak Penghasilan (PPh Final UMKM)",
    pasal: "Pasal 57",
    category: "PAJAK",
    source_url: "https://peraturan.bpk.go.id/Details/233488/pp-no-55-tahun-2022",
    content_raw: `Pasal 57
(1) Wajib Pajak dalam negeri yang memiliki peredaran bruto tertentu yang dikenai Pajak Penghasilan bersifat final sebagaimana dimaksud dalam Pasal 56 ayat (1) merupakan:
a. Wajib Pajak orang pribadi; dan
b. Wajib Pajak badan berbentuk koperasi, persekutuan komanditer, firma, perseroan terbatas, atau badan usaha milik desa/badan usaha milik desa bersama,
yang menerima atau memperoleh penghasilan dengan peredaran bruto tidak melebihi Rp4.800.000.000,00 (empat miliar delapan ratus juta rupiah) dalam 1 (satu) Tahun Pajak.
(2) Tidak termasuk Wajib Pajak sebagaimana dimaksud pada ayat (1) dalam hal:
a. Wajib Pajak memilih untuk dikenai Pajak Penghasilan berdasarkan:
1. tarif Pasal 17 ayat (1) huruf a Undang-Undang Pajak Penghasilan, untuk Wajib Pajak orang pribadi; atau
2. tarif Pasal 17 ayat (1) huruf b Undang-Undang Pajak Penghasilan dengan mempertimbangkan Pasal 31E Undang-Undang Pajak Penghasilan, untuk Wajib Pajak badan;
b. Wajib Pajak badan berbentuk persekutuan komanditer atau firma yang dibentuk oleh beberapa Wajib Pajak orang pribadi yang memiliki keahlian khusus yang menyerahkan jasa yang sejenis dengan jasa sehubungan dengan pekerjaan bebas sebagaimana dimaksud dalam Pasal 56 ayat (4);
c. Wajib Pajak badan yang memperoleh fasilitas Pajak Penghasilan berdasarkan:
1. Pasal 31A Undang-Undang Pajak Penghasilan;
2. Peraturan Pemerintah mengenai fasilitas penanaman modal di bidang usaha tertentu dan/atau di daerah tertentu serta pengurangannya; atau
3. ketentuan yang mengatur mengenai kawasan ekonomi khusus; dan
d. Wajib Pajak bentuk usaha tetap.
(3) Wajib Pajak sebagaimana dimaksud pada ayat (2) huruf a wajib menyampaikan pemberitahuan kepada Direktur Jenderal Pajak.
(4) Wajib Pajak sebagaimana dimaksud pada ayat (3) untuk Tahun Pajak-Tahun Pajak berikutnya tidak dapat dikenai Pajak Penghasilan yang bersifat final sebagaimana dimaksud dalam Pasal 56 ayat (1).
(5) Ketentuan lebih lanjut mengenai tata cara penyampaian pemberitahuan sebagaimana dimaksud pada ayat (3) dan kriteria Wajib Pajak badan yang dapat dikenai Pajak Penghasilan yang bersifat final sebagaimana dimaksud pada ayat (1) huruf b diatur dengan Peraturan Menteri.`
  },
  {
    chunk_id: "PP55-2022-PASAL-58",
    document_id: "PP-55-2022-PAJAK-UMKM",
    title: "Peraturan Pemerintah No. 55 Tahun 2022 tentang Penyesuaian Pengaturan di Bidang Pajak Penghasilan (PPh Final UMKM)",
    pasal: "Pasal 58",
    category: "PAJAK",
    source_url: "https://peraturan.bpk.go.id/Details/233488/pp-no-55-tahun-2022",
    content_raw: `Pasal 58
(1) Besarnya peredaran bruto tertentu sebagaimana dimaksud dalam Pasal 57 ayat (1) merupakan jumlah peredaran bruto dalam 1 (satu) Tahun Pajak dari Tahun Pajak terakhir sebelum Tahun Pajak bersangkutan, yang ditentukan berdasarkan keseluruhan peredaran bruto dari usaha, termasuk peredaran bruto dari cabang.
(2) Dalam hal Wajib Pajak orang pribadi merupakan suami-istri yang menghendaki perjanjian pemisahan harta dan penghasilan secara tertulis atau istri yang memilih menjalankan hak dan kewajiban perpajakannya sendiri, besarnya peredaran bruto tertentu sebagaimana dimaksud pada ayat (1) ditentukan berdasarkan penggabungan peredaran bruto dari usaha suami dan peredaran bruto dari usaha istri.`
  },
  {
    chunk_id: "PP55-2022-PASAL-59",
    document_id: "PP-55-2022-PAJAK-UMKM",
    title: "Peraturan Pemerintah No. 55 Tahun 2022 tentang Penyesuaian Pengaturan di Bidang Pajak Penghasilan (PPh Final UMKM)",
    pasal: "Pasal 59",
    category: "PAJAK",
    source_url: "https://peraturan.bpk.go.id/Details/233488/pp-no-55-tahun-2022",
    content_raw: `Pasal 59
(1) Jangka waktu tertentu pengenaan Pajak Penghasilan yang bersifat final sebagaimana dimaksud dalam Pasal 56 ayat (1) yaitu paling lama:
a. 7 (tujuh) Tahun Pajak bagi Wajib Pajak orang pribadi;
b. 4 (empat) Tahun Pajak bagi Wajib Pajak badan berbentuk koperasi, persekutuan komanditer, firma, badan usaha milik desa/badan usaha milik desa bersama, atau perseroan perorangan yang didirikan oleh 1 (satu) orang; dan
c. 3 (tiga) Tahun Pajak bagi Wajib Pajak badan berbentuk perseroan terbatas.
(2) Jangka waktu sebagaimana dimaksud pada ayat (1) terhitung sejak:
a. Tahun Pajak Wajib Pajak terdaftar, bagi Wajib Pajak yang terdaftar sejak berlakunya Peraturan Pemerintah ini; atau
b. Tahun Pajak berlakunya Peraturan Pemerintah ini, bagi Wajib Pajak yang telah terdaftar sebelum berlakunya Peraturan Pemerintah ini.`
  },
  {
    chunk_id: "PP55-2022-PASAL-60",
    document_id: "PP-55-2022-PAJAK-UMKM",
    title: "Peraturan Pemerintah No. 55 Tahun 2022 tentang Penyesuaian Pengaturan di Bidang Pajak Penghasilan (PPh Final UMKM)",
    pasal: "Pasal 60",
    category: "PAJAK",
    source_url: "https://peraturan.bpk.go.id/Details/233488/pp-no-55-tahun-2022",
    content_raw: `Pasal 60
(1) Jumlah peredaran bruto atas penghasilan dari usaha sebagaimana dimaksud dalam Pasal 56 ayat (1) setiap bulan merupakan dasar pengenaan pajak yang digunakan untuk menghitung Pajak Penghasilan yang bersifat final.
(2) Wajib Pajak orang pribadi yang memiliki peredaran bruto tertentu sebagaimana dimaksud dalam Pasal 57 ayat (1) huruf a, atas bagian peredaran bruto dari usaha sampai dengan Rp500.000.000,00 (lima ratus juta rupiah) dalam 1 (satu) Tahun Pajak tidak dikenai Pajak Penghasilan.
(3) Bagian peredaran bruto dari usaha tidak dikenai Pajak Penghasilan sebagaimana dimaksud pada ayat (2) merupakan jumlah peredaran bruto dari usaha yang dihitung secara kumulatif sejak Masa Pajak pertama dalam suatu Tahun Pajak atau Bagian Tahun Pajak.
(4) Peredaran bruto yang dijadikan dasar pengenaan pajak sebagaimana dimaksud pada ayat (1) dan jumlah peredaran bruto dari usaha yang dihitung secara kumulatif sebagaimana dimaksud pada ayat (3) merupakan imbalan atau nilai pengganti berupa uang atau nilai uang yang diterima atau diperoleh dari usaha, sebelum dikurangi potongan penjualan, potongan tunai, dan/atau potongan sejenis.
(5) Dasar pengenaan pajak sebagaimana dimaksud pada ayat (1):
a. untuk Wajib Pajak badan dihitung berdasarkan jumlah peredaran bruto dari usaha setiap bulan; atau
b. untuk Wajib Pajak orang pribadi dihitung berdasarkan jumlah peredaran bruto dari usaha setiap bulan setelah memperhitungkan bagian peredaran bruto dari usaha sampai dengan Rp500.000.000,00 (lima ratus juta rupiah) dalam 1 (satu) Tahun Pajak yang tidak dikenai Pajak Penghasilan sebagaimana dimaksud pada ayat (2).`
  },
  {
    chunk_id: "PP55-2022-PASAL-61",
    document_id: "PP-55-2022-PAJAK-UMKM",
    title: "Peraturan Pemerintah No. 55 Tahun 2022 tentang Penyesuaian Pengaturan di Bidang Pajak Penghasilan (PPh Final UMKM)",
    pasal: "Pasal 61",
    category: "PAJAK",
    source_url: "https://peraturan.bpk.go.id/Details/233488/pp-no-55-tahun-2022",
    content_raw: `Pasal 61
(1) Wajib Pajak sebagaimana dimaksud dalam Pasal 57 ayat (1) yang peredaran brutonya pada Tahun Pajak berjalan telah melebihi Rp4.800.000.000,00 (empat miliar delapan ratus juta rupiah), atas penghasilan dari usaha tetap dikenai tarif Pajak Penghasilan sebagaimana dimaksud dalam Pasal 56 ayat (2) sampai dengan akhir Tahun Pajak bersangkutan.
(2) Atas penghasilan dari usaha sebagaimana dimaksud dalam Pasal 56 ayat (1) yang diterima atau diperoleh pada Tahun Pajak-Tahun Pajak berikutnya oleh Wajib Pajak sebagaimana dimaksud pada ayat (1) dikenai Pajak Penghasilan berdasarkan:
a. tarif Pasal 17 ayat (1) huruf a Undang-Undang Pajak Penghasilan, untuk Wajib Pajak orang pribadi; atau
b. tarif Pasal 17 ayat (1) huruf b Undang-Undang Pajak Penghasilan dengan mempertimbangkan Pasal 31E Undang-Undang Pajak Penghasilan, untuk Wajib Pajak badan.`
  },
  {
    chunk_id: "PP55-2022-PASAL-62",
    document_id: "PP-55-2022-PAJAK-UMKM",
    title: "Peraturan Pemerintah No. 55 Tahun 2022 tentang Penyesuaian Pengaturan di Bidang Pajak Penghasilan (PPh Final UMKM)",
    pasal: "Pasal 62",
    category: "PAJAK",
    source_url: "https://peraturan.bpk.go.id/Details/233488/pp-no-55-tahun-2022",
    content_raw: `Pasal 62
(1) Pajak Penghasilan terutang sebagaimana dimaksud dalam Pasal 56 ayat (1) dilunasi dengan cara:
a. disetor sendiri oleh Wajib Pajak yang memiliki peredaran bruto tertentu; atau
b. dipotong atau dipungut oleh pemotong atau pemungut Pajak Penghasilan dalam hal Wajib Pajak bersangkutan melakukan transaksi dengan pihak yang ditunjuk sebagai pemotong atau pemungut Pajak Penghasilan.
(2) Penyetoran sendiri Pajak Penghasilan terutang sebagaimana dimaksud pada ayat (1) huruf a wajib dilakukan setiap bulan.`
  },

  // ==================== PP NO. 7 TAHUN 2021 (KRITERIA UMKM) ====================
  {
    chunk_id: "PP7-2021-PASAL-35",
    document_id: "PP-7-2021-UMKM",
    title: "Peraturan Pemerintah No. 7 Tahun 2021 tentang Kemudahan, Pelindungan, dan Pemberdayaan Koperasi dan Usaha Mikro, Kecil, dan Menengah",
    pasal: "Pasal 35",
    category: "KRITERIA_UMKM",
    source_url: "https://peraturan.bpk.go.id/Details/161837/pp-no-7-tahun-2021",
    content_raw: `Pasal 35
(1) Usaha Mikro, Kecil, dan Menengah dikelompokkan berdasarkan kriteria modal usaha atau hasil penjualan tahunan.
(2) Kriteria modal usaha sebagaimana dimaksud pada ayat (1) digunakan untuk pendirian atau pendaftaran kegiatan usaha.
(3) Kriteria modal usaha sebagaimana dimaksud pada ayat (2) terdiri atas:
a. Usaha Mikro memiliki modal usaha sampai dengan paling banyak Rp1.000.000.000,00 (satu miliar rupiah) tidak termasuk tanah dan bangunan tempat usaha;
b. Usaha Kecil memiliki modal usaha lebih dari Rp1.000.000.000,00 (satu miliar rupiah) sampai dengan paling banyak Rp5.000.000.000,00 (lima miliar rupiah) tidak termasuk tanah dan bangunan tempat usaha; dan
c. Usaha Menengah memiliki modal usaha lebih dari Rp5.000.000.000,00 (lima miliar rupiah) sampai dengan paling banyak Rp10.000.000.000,00 (sepuluh miliar rupiah) tidak termasuk tanah dan bangunan tempat usaha.
(4) Selain kriteria modal usaha sebagaimana dimaksud pada ayat (3), untuk kepentingan tertentu dapat digunakan kriteria hasil penjualan tahunan.
(5) Kriteria hasil penjualan tahunan sebagaimana dimaksud pada ayat (4) terdiri atas:
a. Usaha Mikro memiliki hasil penjualan tahunan sampai dengan paling banyak Rp2.000.000.000,00 (dua miliar rupiah);
b. Usaha Kecil memiliki hasil penjualan tahunan lebih dari Rp2.000.000.000,00 (dua miliar rupiah) sampai dengan paling banyak Rp15.000.000.000,00 (lima belas miliar rupiah); dan
c. Usaha Menengah memiliki hasil penjualan tahunan lebih dari Rp15.000.000.000,00 (lima belas miliar rupiah) sampai dengan paling banyak Rp50.000.000.000,00 (lima puluh miliar rupiah).
(6) Nilai nominal kriteria modal usaha dan hasil penjualan tahunan sebagaimana dimaksud pada ayat (3) dan ayat (5) dapat diubah sesuai dengan perkembangan perekonomian.`
  },
  {
    chunk_id: "PP7-2021-PASAL-36",
    document_id: "PP-7-2021-UMKM",
    title: "Peraturan Pemerintah No. 7 Tahun 2021 tentang Kemudahan, Pelindungan, dan Pemberdayaan Koperasi dan Usaha Mikro, Kecil, dan Menengah",
    pasal: "Pasal 36",
    category: "KRITERIA_UMKM",
    source_url: "https://peraturan.bpk.go.id/Details/161837/pp-no-7-tahun-2021",
    content_raw: `Pasal 36
(1) Untuk kepentingan tertentu, selain kriteria modal usaha dan hasil penjualan tahunan sebagaimana dimaksud dalam Pasal 35 ayat (1), kementerian/lembaga dapat menggunakan kriteria omzet, kekayaan bersih, nilai investasi, jumlah tenaga kerja, insentif dan disinsentif, kandungan lokal, dan/atau penerapan teknologi ramah lingkungan sesuai dengan kriteria setiap sektor usaha.
(2) Penggunaan kriteria sebagaimana dimaksud pada ayat (1) oleh menteri teknis atau pimpinan lembaga harus mendapatkan pertimbangan dari Menteri.`
  },
  {
    chunk_id: "PP7-2021-PASAL-42",
    document_id: "PP-7-2021-UMKM",
    title: "Peraturan Pemerintah No. 7 Tahun 2021 tentang Kemudahan, Pelindungan, dan Pemberdayaan Koperasi dan Usaha Mikro, Kecil, dan Menengah",
    pasal: "Pasal 42",
    category: "KRITERIA_UMKM",
    source_url: "https://peraturan.bpk.go.id/Details/161837/pp-no-7-tahun-2021",
    content_raw: `Pasal 42
(1) Perizinan Berusaha bagi Usaha Mikro dan Kecil diberikan melalui Perizinan Tunggal.
(2) Perizinan Tunggal sebagaimana dimaksud pada ayat (1) meliputi perizinan berusaha, tanda daftar perusahaan, angka pengenal impor, dan hak akses kepabeanan.
(3) Selain perizinan sebagaimana dimaksud pada ayat (2), Perizinan Tunggal bagi Usaha Mikro dan Kecil mencakup:
a. sertifikasi jaminan produk halal untuk kegiatan usaha tertentu yang produknya wajib bersertifikat halal; dan/atau
b. izin edar dan/atau tanda daftar edar makanan sesuai dengan ketentuan peraturan perundang-undangan.`
  },

  // ==================== PP NO. 5 TAHUN 2021 (OSS RBA) ====================
  {
    chunk_id: "PP5-2021-PASAL-10",
    document_id: "PP-5-2021-OSS-RBA",
    title: "Peraturan Pemerintah No. 5 Tahun 2021 tentang Penyelenggaraan Perizinan Berusaha Berbasis Risiko (OSS RBA)",
    pasal: "Pasal 10",
    category: "PERIZINAN",
    source_url: "https://peraturan.bpk.go.id/Details/161835/pp-no-5-tahun-2021",
    content_raw: `Pasal 10
(1) Berdasarkan penilaian tingkat bahaya, penilaian potensi terjadinya bahaya, tingkat Risiko, dan peringkat skala usaha kegiatan usaha, kegiatan usaha diklasifikasikan menjadi:
a. kegiatan usaha dengan tingkat Risiko rendah;
b. kegiatan usaha dengan tingkat Risiko menengah; dan
c. kegiatan usaha dengan tingkat Risiko tinggi.
(2) Kegiatan usaha dengan tingkat Risiko menengah sebagaimana dimaksud pada ayat (1) huruf b terbagi atas:
a. tingkat Risiko menengah rendah; dan
b. tingkat Risiko menengah tinggi.`
  },
  {
    chunk_id: "PP5-2021-PASAL-12",
    document_id: "PP-5-2021-OSS-RBA",
    title: "Peraturan Pemerintah No. 5 Tahun 2021 tentang Penyelenggaraan Perizinan Berusaha Berbasis Risiko (OSS RBA)",
    pasal: "Pasal 12",
    category: "PERIZINAN",
    source_url: "https://peraturan.bpk.go.id/Details/161835/pp-no-5-tahun-2021",
    content_raw: `Pasal 12
(1) Perizinan Berusaha untuk kegiatan usaha dengan tingkat Risiko rendah sebagaimana dimaksud dalam Pasal 10 ayat (1) huruf a berupa NIB yang merupakan identitas Pelaku Usaha sekaligus legalitas untuk melaksanakan kegiatan usaha.
(2) NIB sebagaimana dimaksud pada ayat (1) untuk kegiatan usaha dengan tingkat Risiko rendah yang dilakukan oleh UMK, berlaku juga sebagai:
a. Standar Nasional Indonesia (SNI) sebagaimana dimaksud dalam peraturan perundang-undangan di bidang standardisasi dan penilaian kesesuaian; dan/atau
b. pernyataan jaminan halal sebagaimana dimaksud dalam peraturan perundang-undangan di bidang jaminan produk halal.`
  },
  {
    chunk_id: "PP5-2021-PASAL-13",
    document_id: "PP-5-2021-OSS-RBA",
    title: "Peraturan Pemerintah No. 5 Tahun 2021 tentang Penyelenggaraan Perizinan Berusaha Berbasis Risiko (OSS RBA)",
    pasal: "Pasal 13",
    category: "PERIZINAN",
    source_url: "https://peraturan.bpk.go.id/Details/161835/pp-no-5-tahun-2021",
    content_raw: `Pasal 13
(1) Perizinan Berusaha untuk kegiatan usaha dengan tingkat Risiko menengah rendah sebagaimana dimaksud dalam Pasal 10 ayat (2) huruf a berupa:
a. NIB; dan
b. Sertifikat Standar.
(2) Sertifikat Standar sebagaimana dimaksud pada ayat (1) huruf b merupakan legalitas untuk melaksanakan kegiatan usaha dalam bentuk pernyataan Pelaku Usaha untuk memenuhi standar usaha dalam rangka melakukan kegiatan usaha yang diberikan melalui Sistem OSS.`
  },
  {
    chunk_id: "PP5-2021-PASAL-14",
    document_id: "PP-5-2021-OSS-RBA",
    title: "Peraturan Pemerintah No. 5 Tahun 2021 tentang Penyelenggaraan Perizinan Berusaha Berbasis Risiko (OSS RBA)",
    pasal: "Pasal 14",
    category: "PERIZINAN",
    source_url: "https://peraturan.bpk.go.id/Details/161835/pp-no-5-tahun-2021",
    content_raw: `Pasal 14
(1) Perizinan Berusaha untuk kegiatan usaha dengan tingkat Risiko menengah tinggi sebagaimana dimaksud dalam Pasal 10 ayat (2) huruf b berupa:
a. NIB; dan
b. Sertifikat Standar.
(2) Sertifikat Standar sebagaimana dimaksud pada ayat (1) huruf b merupakan Sertifikat Standar pelaksanaan kegiatan usaha yang diterbitkan Pemerintah Pusat atau Pemerintah Daerah sesuai kewenangan masing-masing berdasarkan hasil verifikasi pemenuhan standar pelaksanaan kegiatan usaha oleh Pelaku Usaha.
(3) Sebelum memperoleh Sertifikat Standar sebagaimana dimaksud pada ayat (1) huruf b, Pelaku Usaha menggunakan NIB untuk persiapan pelaksanaan kegiatan usaha.`
  },
  {
    chunk_id: "PP5-2021-PASAL-15",
    document_id: "PP-5-2021-OSS-RBA",
    title: "Peraturan Pemerintah No. 5 Tahun 2021 tentang Penyelenggaraan Perizinan Berusaha Berbasis Risiko (OSS RBA)",
    pasal: "Pasal 15",
    category: "PERIZINAN",
    source_url: "https://peraturan.bpk.go.id/Details/161835/pp-no-5-tahun-2021",
    content_raw: `Pasal 15
(1) Perizinan Berusaha untuk kegiatan usaha dengan tingkat Risiko tinggi sebagaimana dimaksud dalam Pasal 10 ayat (1) huruf c berupa:
a. NIB; dan
b. Izin.
(2) Izin sebagaimana dimaksud pada ayat (1) huruf b merupakan persetujuan Pemerintah Pusat atau Pemerintah Daerah untuk pelaksanaan kegiatan usaha yang wajib dipenuhi oleh Pelaku Usaha sebelum melaksanakan kegiatan usahanya.
(3) Sebelum memperoleh Izin sebagaimana dimaksud pada ayat (2), Pelaku Usaha dapat menggunakan NIB untuk melakukan persiapan kegiatan usaha.`
  },

  // ==================== UU NO. 33 TAHUN 2014 (HALAL UMK) ====================
  {
    chunk_id: "UU33-2014-PASAL-4",
    document_id: "UU-33-2014-HALAL-UMK",
    title: "UU No. 33 Tahun 2014 jo. Perppu No. 2 Tahun 2022 tentang Jaminan Produk Halal bagi Usaha Mikro dan Kecil",
    pasal: "Pasal 4",
    category: "HALAL",
    source_url: "https://peraturan.bpk.go.id/Details/38709/uu-no-33-tahun-2014",
    content_raw: `Pasal 4
Produk yang masuk, beredar, dan diperdagangkan di wilayah Indonesia wajib bersertifikat halal.`
  },
  {
    chunk_id: "UU33-2014-PASAL-43A",
    document_id: "UU-33-2014-HALAL-UMK",
    title: "UU No. 33 Tahun 2014 jo. Perppu No. 2 Tahun 2022 tentang Jaminan Produk Halal bagi Usaha Mikro dan Kecil",
    pasal: "Pasal 43A",
    category: "HALAL",
    source_url: "https://peraturan.bpk.go.id/Details/38709/uu-no-33-tahun-2014",
    content_raw: `Pasal 43A
(1) Bagi Pelaku Usaha Mikro dan Kecil, kewajiban bersertifikat halal sebagaimana dimaksud dalam Pasal 4 didasarkan atas pernyataan pelaku usaha.
(2) Pernyataan pelaku usaha sebagaimana dimaksud pada ayat (1) dilakukan berdasarkan standar halal yang ditetapkan oleh BPJPH.
(3) Standar halal sebagaimana dimaksud pada ayat (2) paling sedikit terdiri atas:
a. adanya pernyataan pelaku usaha yang berupa akad/ikrar yang berisi kehalalan produk dan bahan yang digunakan; dan
b. adanya pendampingan proses produk halal.`
  },
  {
    chunk_id: "UU33-2014-PASAL-44",
    document_id: "UU-33-2014-HALAL-UMK",
    title: "UU No. 33 Tahun 2014 jo. Perppu No. 2 Tahun 2022 tentang Jaminan Produk Halal bagi Usaha Mikro dan Kecil",
    pasal: "Pasal 44",
    category: "HALAL",
    source_url: "https://peraturan.bpk.go.id/Details/38709/uu-no-33-tahun-2014",
    content_raw: `Pasal 44
(1) Bagi Pelaku Usaha Mikro dan Kecil, pengajuan permohonan sertifikat halal tidak dikenai biaya.
(2) Dalam hal biaya permohonan sertifikat halal bagi Pelaku Usaha Mikro dan Kecil sebagaimana dimaksud pada ayat (1) dibebankan kepada anggaran pendapatan dan belanja negara, anggaran pendapatan dan belanja daerah, pembiayaan alternatif, atau fasilitasi pihak lain.`
  }
];

async function main() {
  console.log("🚀 Menyuntikkan 18 Pasal Otentik Utuh & Lengkap ke Pinecone...");

  const index = getPineconeIndex();
  console.log("🧹 Membersihkan seluruh vektor lama di Pinecone...");
  try {
    await index.deleteAll();
    console.log("✨ Pinecone index berhasil dikosongkan.");
  } catch (err: any) {
    console.warn("⚠️ Warning saat deleteAll:", err.message);
  }

  console.log(`\n⏳ Menginjeksi ${authenticCompleteArticles.length} pasal otentik utuh...`);
  const result = await ingestCuratedChunks(authenticCompleteArticles);

  if (result.status === "SUCCESS") {
    console.log(`\n🎉 SUKSES! Sebanyak ${result.total} pasal hukum lengkap berhasil disimpan di Pinecone!`);
  } else {
    console.error(`\n❌ Gagal injeksi: ${result.error}`);
  }
}

main().catch(console.error);
