import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const terminals = sqliteTable(
  "terminals",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    city: text("city"),
    regency: text("regency"),
    province: text("province"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("terminals_name_unique").on(table.name)],
);

export const serviceTypes = sqliteTable(
  "service_types",
  {
    code: text("code", { enum: ["AKAP", "AKDP"] }).primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
  },
  (table) => [
    check("service_types_code_check", sql`${table.code} in ('AKAP', 'AKDP')`),
  ],
);

export const operators = sqliteTable(
  "operators",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("operators_name_unique").on(table.name)],
);

export const routes = sqliteTable(
  "routes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    routeText: text("route_text").notNull(),
    originName: text("origin_name"),
    destinationName: text("destination_name"),
    distanceKm: real("distance_km"),
    distanceText: text("distance_text"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("routes_route_text_unique").on(table.routeText),
    index("routes_origin_destination_idx").on(table.originName, table.destinationName),
  ],
);

export const importSources = sqliteTable("import_sources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sourceFile: text("source_file").notNull(),
  sourceSheet: text("source_sheet"),
  importedAt: text("imported_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  rowCount: integer("row_count"),
  notes: text("notes"),
});

export const schedulePeriods = sqliteTable(
  "schedule_periods",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    terminalId: integer("terminal_id")
      .notNull()
      .references(() => terminals.id, { onDelete: "restrict", onUpdate: "cascade" }),
    importSourceId: integer("import_source_id").references(() => importSources.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    name: text("name").notNull(),
    month: integer("month").notNull(),
    year: integer("year").notNull(),
    startsOn: text("starts_on"),
    endsOn: text("ends_on"),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("schedule_periods_terminal_month_year_unique").on(
      table.terminalId,
      table.month,
      table.year,
    ),
    index("schedule_periods_published_idx").on(table.isPublished),
    check("schedule_periods_month_check", sql`${table.month} between 1 and 12`),
  ],
);

export const busServices = sqliteTable(
  "bus_services",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    periodId: integer("period_id")
      .notNull()
      .references(() => schedulePeriods.id, { onDelete: "cascade", onUpdate: "cascade" }),
    terminalId: integer("terminal_id")
      .notNull()
      .references(() => terminals.id, { onDelete: "restrict", onUpdate: "cascade" }),
    operatorId: integer("operator_id")
      .notNull()
      .references(() => operators.id, { onDelete: "restrict", onUpdate: "cascade" }),
    routeId: integer("route_id")
      .notNull()
      .references(() => routes.id, { onDelete: "restrict", onUpdate: "cascade" }),
    serviceTypeCode: text("service_type_code", { enum: ["AKAP", "AKDP"] })
      .notNull()
      .references(() => serviceTypes.code, { onDelete: "restrict", onUpdate: "cascade" }),
    fareMin: integer("fare_min"),
    fareMax: integer("fare_max"),
    fareText: text("fare_text").notNull(),
    distanceText: text("distance_text"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("bus_services_period_operator_route_service_unique").on(
      table.periodId,
      table.operatorId,
      table.routeId,
      table.serviceTypeCode,
    ),
    index("bus_services_public_filter_idx").on(table.periodId, table.serviceTypeCode),
    index("bus_services_operator_idx").on(table.operatorId),
    index("bus_services_route_idx").on(table.routeId),
  ],
);

export const departureSchedules = sqliteTable(
  "departure_schedules",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    busServiceId: integer("bus_service_id")
      .notNull()
      .references(() => busServices.id, { onDelete: "cascade", onUpdate: "cascade" }),
    departureTime: text("departure_time").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("departure_schedules_service_time_unique").on(
      table.busServiceId,
      table.departureTime,
    ),
    index("departure_schedules_service_order_idx").on(
      table.busServiceId,
      table.sortOrder,
      table.departureTime,
    ),
    check(
      "departure_schedules_time_check",
      sql`${table.departureTime} glob '[0-2][0-9]:[0-5][0-9]'`,
    ),
  ],
);

export const serviceTypeSeedRows = [
  { code: "AKAP", name: "Antar Kota Antar Provinsi" },
  { code: "AKDP", name: "Antar Kota Dalam Provinsi" },
] as const;

export const terminalsRelations = relations(terminals, ({ many }) => ({
  periods: many(schedulePeriods),
  services: many(busServices),
}));

export const serviceTypesRelations = relations(serviceTypes, ({ many }) => ({
  services: many(busServices),
}));

export const operatorsRelations = relations(operators, ({ many }) => ({
  services: many(busServices),
}));

export const routesRelations = relations(routes, ({ many }) => ({
  services: many(busServices),
}));

export const importSourcesRelations = relations(importSources, ({ many }) => ({
  periods: many(schedulePeriods),
}));

export const schedulePeriodsRelations = relations(schedulePeriods, ({ one, many }) => ({
  terminal: one(terminals, {
    fields: [schedulePeriods.terminalId],
    references: [terminals.id],
  }),
  importSource: one(importSources, {
    fields: [schedulePeriods.importSourceId],
    references: [importSources.id],
  }),
  services: many(busServices),
}));

export const busServicesRelations = relations(busServices, ({ one, many }) => ({
  period: one(schedulePeriods, {
    fields: [busServices.periodId],
    references: [schedulePeriods.id],
  }),
  terminal: one(terminals, {
    fields: [busServices.terminalId],
    references: [terminals.id],
  }),
  operator: one(operators, {
    fields: [busServices.operatorId],
    references: [operators.id],
  }),
  route: one(routes, {
    fields: [busServices.routeId],
    references: [routes.id],
  }),
  serviceType: one(serviceTypes, {
    fields: [busServices.serviceTypeCode],
    references: [serviceTypes.code],
  }),
  schedules: many(departureSchedules),
}));

export const departureSchedulesRelations = relations(departureSchedules, ({ one }) => ({
  busService: one(busServices, {
    fields: [departureSchedules.busServiceId],
    references: [busServices.id],
  }),
}));

export type Terminal = typeof terminals.$inferSelect;
export type NewTerminal = typeof terminals.$inferInsert;
export type ServiceType = typeof serviceTypes.$inferSelect;
export type NewServiceType = typeof serviceTypes.$inferInsert;
export type Operator = typeof operators.$inferSelect;
export type NewOperator = typeof operators.$inferInsert;
export type Route = typeof routes.$inferSelect;
export type NewRoute = typeof routes.$inferInsert;
export type ImportSource = typeof importSources.$inferSelect;
export type NewImportSource = typeof importSources.$inferInsert;
export type SchedulePeriod = typeof schedulePeriods.$inferSelect;
export type NewSchedulePeriod = typeof schedulePeriods.$inferInsert;
export type BusService = typeof busServices.$inferSelect;
export type NewBusService = typeof busServices.$inferInsert;
export type DepartureSchedule = typeof departureSchedules.$inferSelect;
export type NewDepartureSchedule = typeof departureSchedules.$inferInsert;
