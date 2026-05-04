import { and, desc, eq, or, sql } from "drizzle-orm";

import { db } from "@/db/client";
import {
  busServices,
  departureSchedules,
  operators,
  routes,
  schedulePeriods,
  terminals,
} from "@/db/schema";

export type ServiceTypeFilter = "AKAP" | "AKDP";

export type BusServicesFilters = {
  periodId?: number;
  serviceType?: ServiceTypeFilter;
  search?: string;
};

export type SchedulePeriodDto = {
  id: number;
  name: string;
  month: number;
  year: number;
  startsOn: string | null;
  endsOn: string | null;
  isPublished: boolean;
  terminal: {
    id: number;
    name: string;
    regency: string | null;
    province: string | null;
  };
};

export type BusServiceDto = {
  id: number;
  nama_po: string;
  rute: string;
  jarak: string;
  tarif: string;
  jadwal: string[];
  jenis_layanan: ServiceTypeFilter;
  operator: {
    id: number;
    name: string;
  };
  route: {
    id: number;
    routeText: string;
    originName: string | null;
    destinationName: string | null;
    distanceKm: number | null;
    distanceText: string | null;
  };
  fare: {
    min: number | null;
    max: number | null;
    text: string;
  };
};

export type BusServicesResponse = {
  data: BusServiceDto[];
  meta: {
    total: number;
    stats: {
      all: number;
      AKAP: number;
      AKDP: number;
    };
    period: SchedulePeriodDto;
  };
};

type ServiceRow = {
  serviceId: number;
  serviceTypeCode: ServiceTypeFilter;
  distanceText: string | null;
  fareMin: number | null;
  fareMax: number | null;
  fareText: string;
  operatorId: number;
  operatorName: string;
  routeId: number;
  routeText: string;
  originName: string | null;
  destinationName: string | null;
  distanceKm: number | null;
  routeDistanceText: string | null;
  departureTime: string | null;
};

export function getSchedulePeriods(): SchedulePeriodDto[] {
  return db
    .select({
      id: schedulePeriods.id,
      name: schedulePeriods.name,
      month: schedulePeriods.month,
      year: schedulePeriods.year,
      startsOn: schedulePeriods.startsOn,
      endsOn: schedulePeriods.endsOn,
      isPublished: schedulePeriods.isPublished,
      terminalId: terminals.id,
      terminalName: terminals.name,
      terminalRegency: terminals.regency,
      terminalProvince: terminals.province,
    })
    .from(schedulePeriods)
    .innerJoin(terminals, eq(terminals.id, schedulePeriods.terminalId))
    .orderBy(desc(schedulePeriods.year), desc(schedulePeriods.month))
    .all()
    .map((period) => ({
      id: period.id,
      name: period.name,
      month: period.month,
      year: period.year,
      startsOn: period.startsOn,
      endsOn: period.endsOn,
      isPublished: period.isPublished,
      terminal: {
        id: period.terminalId,
        name: period.terminalName,
        regency: period.terminalRegency,
        province: period.terminalProvince,
      },
    }));
}

export function getBusServices(filters: BusServicesFilters = {}): BusServicesResponse | null {
  const period = getSelectedPeriod(filters.periodId);
  if (!period) return null;

  const rows = getServiceRows(period.id, filters);
  const data = groupServiceRows(rows);
  const stats = getServiceStats(period.id);

  return {
    data,
    meta: {
      total: data.length,
      stats,
      period,
    },
  };
}

export function getBusServiceById(serviceId: number): BusServiceDto | null {
  const rows = db
    .select({
      serviceId: busServices.id,
      serviceTypeCode: busServices.serviceTypeCode,
      distanceText: busServices.distanceText,
      fareMin: busServices.fareMin,
      fareMax: busServices.fareMax,
      fareText: busServices.fareText,
      operatorId: operators.id,
      operatorName: operators.name,
      routeId: routes.id,
      routeText: routes.routeText,
      originName: routes.originName,
      destinationName: routes.destinationName,
      distanceKm: routes.distanceKm,
      routeDistanceText: routes.distanceText,
      departureTime: departureSchedules.departureTime,
    })
    .from(busServices)
    .innerJoin(operators, eq(operators.id, busServices.operatorId))
    .innerJoin(routes, eq(routes.id, busServices.routeId))
    .leftJoin(departureSchedules, eq(departureSchedules.busServiceId, busServices.id))
    .where(eq(busServices.id, serviceId))
    .orderBy(departureSchedules.sortOrder, departureSchedules.departureTime)
    .all() as ServiceRow[];

  return groupServiceRows(rows)[0] ?? null;
}

function getSelectedPeriod(periodId?: number): SchedulePeriodDto | null {
  const periods = getSchedulePeriods();

  if (periodId) {
    return periods.find((period) => period.id === periodId) ?? null;
  }

  return periods.find((period) => period.isPublished) ?? periods[0] ?? null;
}

function getServiceRows(periodId: number, filters: BusServicesFilters): ServiceRow[] {
  const whereClauses = [eq(busServices.periodId, periodId)];

  if (filters.serviceType) {
    whereClauses.push(eq(busServices.serviceTypeCode, filters.serviceType));
  }

  const search = filters.search?.trim().toLowerCase();
  if (search) {
    const pattern = `%${search}%`;
    whereClauses.push(
      or(
        sql`lower(${operators.name}) like ${pattern}`,
        sql`lower(${routes.routeText}) like ${pattern}`,
      )!,
    );
  }

  return db
    .select({
      serviceId: busServices.id,
      serviceTypeCode: busServices.serviceTypeCode,
      distanceText: busServices.distanceText,
      fareMin: busServices.fareMin,
      fareMax: busServices.fareMax,
      fareText: busServices.fareText,
      operatorId: operators.id,
      operatorName: operators.name,
      routeId: routes.id,
      routeText: routes.routeText,
      originName: routes.originName,
      destinationName: routes.destinationName,
      distanceKm: routes.distanceKm,
      routeDistanceText: routes.distanceText,
      departureTime: departureSchedules.departureTime,
    })
    .from(busServices)
    .innerJoin(operators, eq(operators.id, busServices.operatorId))
    .innerJoin(routes, eq(routes.id, busServices.routeId))
    .leftJoin(departureSchedules, eq(departureSchedules.busServiceId, busServices.id))
    .where(and(...whereClauses))
    .orderBy(
      busServices.serviceTypeCode,
      operators.name,
      routes.routeText,
      departureSchedules.sortOrder,
      departureSchedules.departureTime,
    )
    .all() as ServiceRow[];
}

function groupServiceRows(rows: ServiceRow[]): BusServiceDto[] {
  const services = new Map<number, BusServiceDto>();

  for (const row of rows) {
    const existing = services.get(row.serviceId);

    if (!existing) {
      services.set(row.serviceId, {
        id: row.serviceId,
        nama_po: row.operatorName,
        rute: row.routeText,
        jarak: row.distanceText ?? row.routeDistanceText ?? "",
        tarif: row.fareText,
        jadwal: row.departureTime ? [row.departureTime] : [],
        jenis_layanan: row.serviceTypeCode,
        operator: {
          id: row.operatorId,
          name: row.operatorName,
        },
        route: {
          id: row.routeId,
          routeText: row.routeText,
          originName: row.originName,
          destinationName: row.destinationName,
          distanceKm: row.distanceKm,
          distanceText: row.routeDistanceText,
        },
        fare: {
          min: row.fareMin,
          max: row.fareMax,
          text: row.fareText,
        },
      });
      continue;
    }

    if (row.departureTime) {
      existing.jadwal.push(row.departureTime);
    }
  }

  return Array.from(services.values());
}

function getServiceStats(periodId: number): BusServicesResponse["meta"]["stats"] {
  const rows = db
    .select({
      serviceTypeCode: busServices.serviceTypeCode,
      count: sql<number>`count(*)`,
    })
    .from(busServices)
    .where(eq(busServices.periodId, periodId))
    .groupBy(busServices.serviceTypeCode)
    .all();

  const stats = { all: 0, AKAP: 0, AKDP: 0 };

  for (const row of rows) {
    const count = Number(row.count);
    stats[row.serviceTypeCode] = count;
    stats.all += count;
  }

  return stats;
}
