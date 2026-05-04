import "server-only";

import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema";

const defaultDatabasePath = path.join(process.cwd(), "data", "bus-schedule.sqlite");
const isProduction = process.env.NODE_ENV === "production";
const configuredDatabaseUrl = process.env.DATABASE_URL;
const databaseUrl = resolveDatabaseUrl(configuredDatabaseUrl ?? defaultDatabasePath);
const isBundledProductionDatabase = isProduction && databaseUrl === defaultDatabasePath;

declare global {
  var busScheduleSqlite: Database.Database | undefined;
}

const sqlite =
  globalThis.busScheduleSqlite ??
  new Database(databaseUrl, {
    fileMustExist: isBundledProductionDatabase,
    readonly: isBundledProductionDatabase,
  });
sqlite.pragma("foreign_keys = ON");

if (!isProduction) {
  globalThis.busScheduleSqlite = sqlite;
}

export const db = drizzle(sqlite, { schema });

function resolveDatabaseUrl(url: string) {
  const resolvedUrl = path.isAbsolute(url)
    ? url
    : path.resolve(/*turbopackIgnore: true*/ process.cwd(), url);
  const directory = path.dirname(resolvedUrl);

  if (!existsSync(directory)) {
    if (isProduction) {
      throw new Error(
        `SQLite database directory does not exist: ${directory}. Make sure data/bus-schedule.sqlite is included in the deployment bundle.`,
      );
    }

    mkdirSync(directory, { recursive: true });
  }

  return resolvedUrl;
}
