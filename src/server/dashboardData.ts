import { count, eq } from "drizzle-orm";

import { db } from "@/db/client";
import {
  busServices,
  departureSchedules,
  operators,
  routes,
} from "@/db/schema";
import { getBusServices } from "@/server/busServices";

export function getDashboardServices() {
  return getBusServices()?.data ?? [];
}

export function getDashboardRoutes() {
  return db
    .select({
      id: routes.id,
      routeText: routes.routeText,
      originName: routes.originName,
      destinationName: routes.destinationName,
      distanceKm: routes.distanceKm,
      distanceText: routes.distanceText,
      services: count(busServices.id),
    })
    .from(routes)
    .leftJoin(busServices, eq(busServices.routeId, routes.id))
    .groupBy(routes.id)
    .orderBy(routes.routeText)
    .all();
}

export function getDashboardSchedules() {
  return db
    .select({
      id: departureSchedules.id,
      departureTime: departureSchedules.departureTime,
      sortOrder: departureSchedules.sortOrder,
      serviceId: busServices.id,
      serviceTypeCode: busServices.serviceTypeCode,
      operatorName: operators.name,
      routeText: routes.routeText,
    })
    .from(departureSchedules)
    .innerJoin(busServices, eq(busServices.id, departureSchedules.busServiceId))
    .innerJoin(operators, eq(operators.id, busServices.operatorId))
    .innerJoin(routes, eq(routes.id, busServices.routeId))
    .orderBy(departureSchedules.departureTime, operators.name)
    .all();
}
