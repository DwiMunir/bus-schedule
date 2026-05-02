import { NextResponse } from "next/server";
import { z } from "zod";

import { getBusServices } from "@/server/busServices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  periodId: z.coerce.number().int().positive().optional(),
  serviceType: z.enum(["AKAP", "AKDP"]).optional(),
  search: z.string().trim().max(100).optional(),
});

export function GET(request: Request) {
  const searchParams = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = querySchema.safeParse(searchParams);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid query parameters",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const result = getBusServices(parsed.data);

  if (!result) {
    return NextResponse.json({ error: "Schedule period not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
