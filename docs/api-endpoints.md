# API Endpoints

## GET /api/schedule-periods

Mengembalikan daftar periode jadwal yang tersedia.

### Response

```json
{
  "data": [
    {
      "id": 1,
      "name": "April 2026",
      "month": 4,
      "year": 2026,
      "startsOn": "2026-04-01",
      "endsOn": "2026-04-30",
      "isPublished": true,
      "terminal": {
        "id": 1,
        "name": "Terminal Kutoarjo",
        "regency": "Kab. Purworejo",
        "province": "Jawa Tengah"
      }
    }
  ]
}
```

## GET /api/bus-services

Mengembalikan daftar layanan bus untuk periode aktif atau `periodId` tertentu. Bentuk `data` menjaga kontrak tampilan lama agar UI mudah mengonsumsi data dari database.

### Query Params

- `periodId`: optional number. Jika kosong, API memakai periode terbaru yang `is_published = true`.
- `serviceType`: optional enum, `AKAP` atau `AKDP`.
- `search`: optional string. Mencari pada nama PO dan teks rute.

### Response

```json
{
  "data": [
    {
      "id": 1,
      "nama_po": "AGRA MAS",
      "rute": "Yogyakarta - Jakarta",
      "jarak": "565 km",
      "tarif": "Rp 150.000 - Rp 250.000",
      "jadwal": ["09:38", "10:05"],
      "jenis_layanan": "AKAP",
      "operator": { "id": 1, "name": "AGRA MAS" },
      "route": { "id": 1, "routeText": "Yogyakarta - Jakarta" },
      "fare": { "min": 150000, "max": 250000, "text": "Rp 150.000 - Rp 250.000" }
    }
  ],
  "meta": {
    "total": 17,
    "stats": { "all": 17, "AKAP": 11, "AKDP": 6 },
    "period": {
      "id": 1,
      "name": "April 2026",
      "month": 4,
      "year": 2026
    }
  }
}
```
