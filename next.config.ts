import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  outputFileTracingIncludes: {
    "/api/bus-services": ["./data/bus-schedule.sqlite"],
    "/api/schedule-periods": ["./data/bus-schedule.sqlite"],
    "/dashboard": ["./data/bus-schedule.sqlite"],
    "/dashboard/**/*": ["./data/bus-schedule.sqlite"],
  },
};

export default nextConfig;
