# PRD: Dynamic Bus Schedule Website

## Ringkasan

Aplikasi awalnya menampilkan jadwal bus Terminal Kutoarjo dari file TypeScript statis. Migrasi ini mengubah sumber data menjadi SQLite agar data PO, rute, tarif, periode rekap, dan jam keberangkatan dapat dikelola, diperbarui, dan di-query tanpa rebuild data manual.

## Tujuan

- Menyimpan data jadwal bus dalam database SQLite lokal.
- Menyediakan schema yang mendukung data dari Excel April 2026 dan periode berikutnya.
- Memisahkan data master seperti terminal, PO, rute, dan jenis layanan dari data periodik seperti tarif dan jadwal.
- Menjaga UI publik tetap dapat menampilkan filter AKAP/AKDP, pencarian PO/rute, jumlah hasil, dan daftar jadwal lengkap.
- Menyiapkan fondasi untuk import ulang dari file Excel melalui script seed/import pada tahap berikutnya.

## Non-Tujuan Tahap Ini

- Belum membuat halaman admin CRUD.
- Belum mengubah UI `page.tsx` agar membaca database.
- Belum membuat API route publik.
- Belum menjalankan migrasi fisik karena dependency Drizzle belum terpasang di `node_modules`.
- Belum membuat autentikasi atau otorisasi admin.

## Pengguna

- Penumpang: mencari jadwal berdasarkan nama PO, rute, dan jenis layanan.
- Petugas/operator data: mengimpor atau memperbarui data rekap dari Excel.
- Pengelola aplikasi: memantau periode data yang sedang dipublikasikan.

## Kebutuhan Data

### Data Master

- Terminal: nama terminal, kabupaten/kota, provinsi.
- Jenis layanan: kode layanan (`AKAP`, `AKDP`) dan nama lengkap.
- Operator/PO: nama perusahaan otobus.
- Rute: teks rute asli, titik asal, titik tujuan, dan jarak jika dapat dinormalisasi.

### Data Periodik

- Periode jadwal: bulan, tahun, rentang tanggal berlaku, terminal, status publikasi, dan file sumber.
- Entri layanan: kombinasi periode, terminal, PO, rute, jenis layanan, jarak, dan tarif.
- Jam keberangkatan: daftar jam unik per entri layanan.

### Data Import

- Nama file sumber.
- Nama sheet sumber.
- Waktu import.
- Metadata opsional seperti jumlah baris dan catatan import.

## Aturan Bisnis

- Satu entri layanan merepresentasikan kombinasi unik `periode + terminal + PO + rute + jenis layanan`.
- Satu jam keberangkatan tidak boleh duplikat dalam entri layanan yang sama.
- Jenis layanan saat ini dibatasi pada `AKAP` dan `AKDP`, tetapi schema tetap bisa diperluas.
- Tarif disimpan sebagai angka minimum/maksimum jika dapat diparse, dan teks asli tetap disimpan untuk mempertahankan tampilan.
- Jarak disimpan sebagai angka kilometer jika dapat diparse, dan teks asli tetap disimpan untuk nilai seperti `~115 km`.
- Data periode hanya satu yang aktif untuk tampilan default, tetapi database mendukung banyak periode.

## Kebutuhan Query UI Publik

- Ambil semua layanan untuk periode aktif.
- Filter berdasarkan jenis layanan.
- Cari berdasarkan nama PO dan teks rute.
- Hitung total PO/rute, total AKAP, total AKDP.
- Ambil semua jam keberangkatan per layanan, berurutan naik.

## Kriteria Penerimaan Tahap Ini

- Ada PRD yang menjelaskan kebutuhan data dan arah migrasi.
- Ada schema Drizzle ORM untuk SQLite.
- Schema memiliki relasi untuk terminal, PO, rute, periode, layanan, jadwal, dan import source.
- Schema memiliki constraint unik untuk mencegah jadwal duplikat.
- Config Drizzle dasar tersedia untuk generate migration pada tahap berikutnya.

## Rencana Tahap Berikutnya

1. Install dependency `drizzle-orm`, `drizzle-kit`, dan driver SQLite.
2. Generate migration dari schema.
3. Buat script seed/import dari `REKAP_BUS_AKAP_AKDP_KUTOARJO_APRIL2026.xlsx`.
4. Buat query layer server-side.
5. Pecah UI menjadi Server Component untuk data fetching dan Client Component untuk filter/expand interaktif.
