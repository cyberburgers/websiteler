import "server-only";
import type { StaffSetup } from "@/components/admin/StaffEditor";
import { callsEnabled } from "@/lib/calls/store";
import { staffKey } from "./auth";

/**
 * What the panel needs for the tables' calls and orders: the key it reads and answers them with.
 * Without one (Vercel before Redis is connected) the panel says what is missing instead.
 */
export async function staffSetup(): Promise<StaffSetup> {
  const key = await staffKey();
  if (!key) return { key: "", enabled: false };
  return { key, enabled: callsEnabled() };
}
