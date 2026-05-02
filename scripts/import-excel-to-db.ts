import Database from "better-sqlite3";
import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import XLSX from "xlsx";
import {
  busServices,
  departureSchedules,
  importSources,
  operators,
  routes,
  schedulePeriods,
  serviceTypeSeedRows,
  serviceTypes,
  terminals,
  type NewBusService,
  type NewDepartureSchedule,
  type NewRoute,
} from "../src/db/schema";

type ServiceTypeCode = "AKAP" | "AKDP";

type RekapRow = {
  serviceTypeCode: ServiceTypeCode;
  operatorName: string;
  routeText: string;
  distanceText: string;
  fareText: string;
};

type ImportSummary = {
  rekapRows: number;
  detailRows: number;
  services: number;
  schedules: number;
};

const DEFAULT_EXCEL_PATH = "REKAP_BUS_AKAP_AKDP_KUTOARJO_APRIL2026.xlsx";
const DEFAULT_DATABASE_PATH = process.env.DATABASE_URL ?? "./data/bus-schedule.sqlite";
const TERMINAL_NAME = "Terminal Kutoarjo";
const PERIOD_MONTH = 4;
const PERIOD_YEAR = 2026;
const PERIOD_NAME = "April 2026";
const SOURCE_SHEETS = "REKAP AKAP, REKAP AKDP, DETAIL AKAP, DETAIL AKDP";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const sqlite = new Database(DEFAULT_DATABASE_PATH);
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite);

function normalizeText(value: unknown): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function normalizeTime(value: unknown): string {
  const text = normalizeText(value);
  if (!timePattern.test(text)) {
    throw new Error(`Invalid departure time: ${text}`);
  }
  return text;
}

function parseDistanceKm(distanceText: string): number | null {
  const match = distanceText.replace(",", ".").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

function parseFareRange(fareText: string): Pick<NewBusService, "fareMin" | "fareMax"> {
  const values = Array.from(fareText.matchAll(/Rp\s*([\d.]+)/gi)).map((match) =>
    Number(match[1].replace(/\./g, "")),
  );

  return {
    fareMin: values[0] ?? null,
    fareMax: values[1] ?? values[0] ?? null,
  };
}

function parseRouteEndpoints(routeText: string): Pick<NewRoute, "originName" | "destinationName"> {
  const parts = routeText
    .split(/\s+-\s+/)
    .map((part) => normalizeText(part))
    .filter(Boolean);

  return {
    originName: parts[0] ?? null,
    destinationName: parts.length > 1 ? parts[parts.length - 1] : null,
  };
}

function getRows(workbook: XLSX.WorkBook, sheetName: string): unknown[][] {
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error(`Missing sheet: ${sheetName}`);
  }

  return XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, defval: "" });
}

function parseRekapRows(workbook: XLSX.WorkBook): RekapRow[] {
  const sheetPairs = [
    ["REKAP AKAP", "AKAP"],
    ["REKAP AKDP", "AKDP"],
  ] as const;

  return sheetPairs.flatMap(([sheetName, serviceTypeCode]) =>
    getRows(workbook, sheetName)
      .slice(3)
      .filter((row) => row[0] && row[0] !== "TOTAL")
      .map((row) => ({
        serviceTypeCode,
        operatorName: normalizeText(row[1]),
        routeText: normalizeText(row[2]),
        distanceText: normalizeText(row[3]),
        fareText: normalizeText(row[4]),
      })),
  );
}

function parseDetailSchedules(workbook: XLSX.WorkBook): {
  scheduleMap: Map<string, string[]>;
  detailRowCount: number;
} {
  const sheetPairs = [
    ["DETAIL AKAP", "AKAP"],
    ["DETAIL AKDP", "AKDP"],
  ] as const;

  let detailRowCount = 0;
  const scheduleMap = new Map<string, Set<string>>();

  for (const [sheetName, serviceTypeCode] of sheetPairs) {
    for (const row of getRows(workbook, sheetName).slice(2)) {
      if (!row[0] || !row[2] || !row[3] || !row[4]) continue;

      detailRowCount += 1;

      const operatorName = normalizeText(row[2]);
      const departureTime = normalizeTime(row[3]);
      const routeText = normalizeText(row[4]);
      const key = scheduleKey(serviceTypeCode, operatorName, routeText);

      if (!scheduleMap.has(key)) {
        scheduleMap.set(key, new Set<string>());
      }

      scheduleMap.get(key)?.add(departureTime);
    }
  }

  return {
    detailRowCount,
    scheduleMap: new Map(
      Array.from(scheduleMap.entries()).map(([key, times]) => [key, Array.from(times).sort()]),
    ),
  };
}

function scheduleKey(serviceTypeCode: ServiceTypeCode, operatorName: string, routeText: string): string {
  return `${serviceTypeCode}|${operatorName}|${routeText}`;
}

function ensureTerminal(): number {
  const existing = db
    .select({ id: terminals.id })
    .from(terminals)
    .where(eq(terminals.name, TERMINAL_NAME))
    .get();

  if (existing) return existing.id;

  return db
    .insert(terminals)
    .values({
      name: TERMINAL_NAME,
      regency: "Kab. Purworejo",
      province: "Jawa Tengah",
    })
    .returning({ id: terminals.id })
    .get().id;
}

function ensureOperator(name: string): number {
  const existing = db.select({ id: operators.id }).from(operators).where(eq(operators.name, name)).get();
  if (existing) return existing.id;

  return db.insert(operators).values({ name }).returning({ id: operators.id }).get().id;
}

function ensureRoute(row: RekapRow): number {
  const existing = db
    .select({ id: routes.id })
    .from(routes)
    .where(eq(routes.routeText, row.routeText))
    .get();

  if (existing) return existing.id;

  return db
    .insert(routes)
    .values({
      routeText: row.routeText,
      distanceKm: parseDistanceKm(row.distanceText),
      distanceText: row.distanceText,
      ...parseRouteEndpoints(row.routeText),
    })
    .returning({ id: routes.id })
    .get().id;
}

function seedServiceTypes() {
  for (const row of serviceTypeSeedRows) {
    db.insert(serviceTypes)
      .values(row)
      .onConflictDoUpdate({
        target: serviceTypes.code,
        set: {
          name: row.name,
        },
      })
      .run();
  }
}

function recreatePeriod(terminalId: number, importSourceId: number): number {
  const existing = db
    .select({ id: schedulePeriods.id })
    .from(schedulePeriods)
    .where(
      and(
        eq(schedulePeriods.terminalId, terminalId),
        eq(schedulePeriods.month, PERIOD_MONTH),
        eq(schedulePeriods.year, PERIOD_YEAR),
      ),
    )
    .get();

  if (existing) {
    db.delete(schedulePeriods).where(eq(schedulePeriods.id, existing.id)).run();
  }

  return db
    .insert(schedulePeriods)
    .values({
      terminalId,
      importSourceId,
      name: PERIOD_NAME,
      month: PERIOD_MONTH,
      year: PERIOD_YEAR,
      startsOn: "2026-04-01",
      endsOn: "2026-04-30",
      isPublished: true,
    })
    .returning({ id: schedulePeriods.id })
    .get().id;
}

function createImportSource(excelPath: string, rowCount: number): number {
  const existing = db
    .select({ id: importSources.id })
    .from(importSources)
    .where(eq(importSources.sourceFile, excelPath))
    .orderBy(importSources.id)
    .get();

  if (existing) {
    db.update(importSources)
      .set({
        sourceSheet: SOURCE_SHEETS,
        importedAt: sql`CURRENT_TIMESTAMP`,
        rowCount,
        notes: "Imported from Excel workbook into normalized SQLite tables.",
      })
      .where(eq(importSources.id, existing.id))
      .run();

    db.delete(importSources)
      .where(and(eq(importSources.sourceFile, excelPath), sql`${importSources.id} <> ${existing.id}`))
      .run();

    return existing.id;
  }

  return db
    .insert(importSources)
    .values({
      sourceFile: excelPath,
      sourceSheet: SOURCE_SHEETS,
      rowCount,
      notes: "Imported from Excel workbook into normalized SQLite tables.",
    })
    .returning({ id: importSources.id })
    .get().id;
}

function importWorkbook(excelPath: string): ImportSummary {
  const workbook = XLSX.readFile(excelPath);
  const rekapRows = parseRekapRows(workbook);
  const { scheduleMap, detailRowCount } = parseDetailSchedules(workbook);

  let insertedServices = 0;
  let insertedSchedules = 0;

  db.transaction(() => {
    seedServiceTypes();

    const terminalId = ensureTerminal();
    const importSourceId = createImportSource(excelPath, rekapRows.length + detailRowCount);
    const periodId = recreatePeriod(terminalId, importSourceId);

    for (const row of rekapRows) {
      const operatorId = ensureOperator(row.operatorName);
      const routeId = ensureRoute(row);
      const fareRange = parseFareRange(row.fareText);
      const service = db
        .insert(busServices)
        .values({
          periodId,
          terminalId,
          operatorId,
          routeId,
          serviceTypeCode: row.serviceTypeCode,
          fareText: row.fareText,
          distanceText: row.distanceText,
          ...fareRange,
        })
        .returning({ id: busServices.id })
        .get();

      insertedServices += 1;

      const times = scheduleMap.get(scheduleKey(row.serviceTypeCode, row.operatorName, row.routeText)) ?? [];
      const scheduleRows: NewDepartureSchedule[] = times.map((departureTime, index) => ({
        busServiceId: service.id,
        departureTime,
        sortOrder: index + 1,
      }));

      if (scheduleRows.length > 0) {
        db.insert(departureSchedules).values(scheduleRows).run();
        insertedSchedules += scheduleRows.length;
      }
    }

    db.run(sql`update ${terminals} set updated_at = CURRENT_TIMESTAMP where id = ${terminalId}`);
  });

  return {
    rekapRows: rekapRows.length,
    detailRows: detailRowCount,
    services: insertedServices,
    schedules: insertedSchedules,
  };
}

const excelPath = process.argv[2] ?? DEFAULT_EXCEL_PATH;
const summary = importWorkbook(excelPath);

console.log(`Imported ${excelPath} into ${DEFAULT_DATABASE_PATH}`);
console.table(summary);
