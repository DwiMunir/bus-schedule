const XLSX = require('xlsx');
const fs = require('fs');
const wb = XLSX.readFile('REKAP_BUS_AKAP_AKDP_KUTOARJO_APRIL2026.xlsx');

// Build full unique schedules from DETAIL sheets
const detailSchedules = {};

['DETAIL AKAP', 'DETAIL AKDP'].forEach(sheetName => {
  const jenisLayanan = sheetName.includes('AKAP') ? 'AKAP' : 'AKDP';
  const ws = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});
  data.slice(2).forEach(row => {
    if (!row[0] || !row[2] || !row[3]) return;
    const nama = String(row[2]).trim().replace(/\s+/g, ' ');
    const rute = String(row[4]).trim();
    const key = `${jenisLayanan}|${nama}|${rute}`;
    if (!detailSchedules[key]) detailSchedules[key] = new Set();
    detailSchedules[key].add(String(row[3]).trim());
  });
});

// Convert sets to sorted arrays
const scheduleMap = {};
Object.entries(detailSchedules).forEach(([key, times]) => {
  scheduleMap[key] = Array.from(times).sort();
});

// Build final data from REKAP sheets
const busData = [];

['REKAP AKAP', 'REKAP AKDP'].forEach(sheetName => {
  const jenisLayanan = sheetName.includes('AKAP') ? 'AKAP' : 'AKDP';
  const ws = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});
  data.slice(3).forEach(row => {
    if (!row[0] || row[0] === 'TOTAL') return;
    const nama = String(row[1]).trim().replace(/\s+/g, ' ');
    const rute = String(row[2]).trim();
    const key = `${jenisLayanan}|${nama}|${rute}`;
    const fullSchedule = scheduleMap[key] || [];
    busData.push({
      nama_po: nama,
      rute: rute,
      jarak: String(row[3]).trim(),
      tarif: String(row[4]).trim(),
      jadwal: fullSchedule,
      jenis_layanan: jenisLayanan,
    });
  });
});

const tsContent = `// Auto-generated from REKAP_BUS_AKAP_AKDP_KUTOARJO_APRIL2026.xlsx
// Data periode: April 2026 - Terminal Kutoarjo, Kab. Purworejo

export type JenisLayanan = 'AKAP' | 'AKDP';

export interface BusData {
  nama_po: string;
  rute: string;
  jarak: string;
  tarif: string;
  jadwal: string[];
  jenis_layanan: JenisLayanan;
}

export const busData: BusData[] = ${JSON.stringify(busData, null, 2)};
`;

fs.writeFileSync('src/lib/busData.ts', tsContent);
console.log('Generated src/lib/busData.ts with', busData.length, 'entries');
busData.forEach(b => console.log(`  [${b.jenis_layanan}] ${b.nama_po} | ${b.rute} | ${b.jadwal.length} schedules`));
