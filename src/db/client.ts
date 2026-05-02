import "server-only";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL ?? "./data/bus-schedule.sqlite";

declare global {
  var busScheduleSqlite: Database.Database | undefined;
}

const sqlite = globalThis.busScheduleSqlite ?? new Database(databaseUrl);
sqlite.pragma("foreign_keys = ON");

if (process.env.NODE_ENV !== "production") {
  globalThis.busScheduleSqlite = sqlite;
}

export const db = drizzle(sqlite, { schema });
