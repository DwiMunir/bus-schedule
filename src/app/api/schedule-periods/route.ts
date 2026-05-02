import { NextResponse } from "next/server";

import { getSchedulePeriods } from "@/server/busServices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ data: getSchedulePeriods() });
}
