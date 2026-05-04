"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db/client";
import { busServices, departureSchedules, operators, routes } from "@/db/schema";
import { getOperatorSession } from "@/server/auth";

export type EditServiceActionState = {
  errors?: {
    serviceId?: string[];
    operatorName?: string[];
    routeText?: string[];
    distanceText?: string[];
    fareText?: string[];
    serviceTypeCode?: string[];
    schedulesText?: string[];
  };
  message?: string;
};

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const editServiceSchema = z.object({
  serviceId: z.coerce.number().int().positive("ID layanan tidak valid"),
  operatorName: z.string().trim().min(1, "Nama PO wajib diisi").max(120),
  routeText: z.string().trim().min(1, "Rute wajib diisi").max(240),
  distanceText: z.string().trim().min(1, "Jarak wajib diisi").max(40),
  fareText: z.string().trim().min(1, "Tarif wajib diisi").max(120),
  serviceTypeCode: z.enum(["AKAP", "AKDP"], {
    error: "Jenis layanan harus AKAP atau AKDP",
  }),
  schedulesText: z.string().trim().min(1, "Minimal satu jadwal wajib diisi"),
});

export async function updateBusServiceAction(
  _state: EditServiceActionState | undefined,
  formData: FormData,
): Promise<EditServiceActionState | undefined> {
  const session = await getOperatorSession();
  if (!session) redirect("/auth");

  const parsed = editServiceSchema.safeParse({
    serviceId: formData.get("serviceId"),
    operatorName: formData.get("operatorName"),
    routeText: formData.get("routeText"),
    distanceText: formData.get("distanceText"),
    fareText: formData.get("fareText"),
    serviceTypeCode: formData.get("serviceTypeCode"),
    schedulesText: formData.get("schedulesText"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const schedules = parseSchedules(parsed.data.schedulesText);
  if (schedules.length === 0) {
    return {
      errors: {
        schedulesText: ["Minimal satu jadwal valid wajib diisi"],
      },
    };
  }

  const invalidSchedule = schedules.find((time) => !timePattern.test(time));
  if (invalidSchedule) {
    return {
      errors: {
        schedulesText: [`Format jam tidak valid: ${invalidSchedule}`],
      },
    };
  }

  try {
    db.transaction(() => {
      const operatorId = ensureOperator(parsed.data.operatorName);
      const routeId = ensureRoute(parsed.data.routeText, parsed.data.distanceText);
      const fare = parseFareRange(parsed.data.fareText);

      db.update(busServices)
        .set({
          operatorId,
          routeId,
          serviceTypeCode: parsed.data.serviceTypeCode,
          distanceText: parsed.data.distanceText,
          fareText: parsed.data.fareText,
          fareMin: fare.fareMin,
          fareMax: fare.fareMax,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(busServices.id, parsed.data.serviceId))
        .run();

      db.delete(departureSchedules)
        .where(eq(departureSchedules.busServiceId, parsed.data.serviceId))
        .run();

      db.insert(departureSchedules)
        .values(
          schedules.map((departureTime, index) => ({
            busServiceId: parsed.data.serviceId,
            departureTime,
            sortOrder: index + 1,
          })),
        )
        .run();
    });
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Data gagal disimpan. Periksa kombinasi PO, rute, dan jenis layanan.",
    };
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

function parseSchedules(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[\s,;]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).sort();
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function ensureOperator(name: string) {
  const normalizedName = normalizeText(name);
  const existing = db
    .select({ id: operators.id })
    .from(operators)
    .where(eq(operators.name, normalizedName))
    .get();

  if (existing) return existing.id;

  return db.insert(operators).values({ name: normalizedName }).returning({ id: operators.id }).get().id;
}

function ensureRoute(routeText: string, distanceText: string) {
  const normalizedRoute = normalizeText(routeText);
  const existing = db
    .select({ id: routes.id })
    .from(routes)
    .where(eq(routes.routeText, normalizedRoute))
    .get();

  if (existing) return existing.id;

  const endpoints = parseRouteEndpoints(normalizedRoute);

  return db
    .insert(routes)
    .values({
      routeText: normalizedRoute,
      distanceText,
      distanceKm: parseDistanceKm(distanceText),
      originName: endpoints.originName,
      destinationName: endpoints.destinationName,
    })
    .returning({ id: routes.id })
    .get().id;
}

function parseRouteEndpoints(routeText: string) {
  const parts = routeText
    .split(/\s+-\s+/)
    .map((part) => normalizeText(part))
    .filter(Boolean);

  return {
    originName: parts[0] ?? null,
    destinationName: parts.length > 1 ? parts[parts.length - 1] : null,
  };
}

function parseDistanceKm(distanceText: string) {
  const match = distanceText.replace(",", ".").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

function parseFareRange(fareText: string) {
  const values = Array.from(fareText.matchAll(/Rp\s*([\d.]+)/gi)).map((match) =>
    Number(match[1].replace(/\./g, "")),
  );

  return {
    fareMin: values[0] ?? null,
    fareMax: values[1] ?? values[0] ?? null,
  };
}
