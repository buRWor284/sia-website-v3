/**
 * /api/signaliq/debug
 * Temporary endpoint to diagnose Supabase connectivity.
 * DELETE THIS FILE once the coverage cache is working.
 */
import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "NOT SET";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "NOT SET";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "NOT SET";

  const urlPreview = url === "NOT SET" ? "NOT SET" : url.slice(0, 40);
  const anonPreview = anonKey === "NOT SET" ? "NOT SET" : `${anonKey.slice(0, 10)}...`;
  const servicePreview = serviceKey === "NOT SET" ? "NOT SET" : `${serviceKey.slice(0, 10)}...`;

  let selectResult: string;
  let insertResult: string;

  try {
    const db = createSupabaseServiceClient();
    const { data, error } = await db.from("signaliq_coverage_cache").select("topic").limit(3);
    if (error) {
      selectResult = `ERROR: ${error.message} (code: ${error.code})`;
    } else {
      selectResult = `OK — ${data.length} rows returned: ${JSON.stringify(data)}`;
    }
  } catch (err) {
    selectResult = `THREW: ${err instanceof Error ? err.message : String(err)}`;
  }

  try {
    const db = createSupabaseServiceClient();
    const { error } = await db.from("signaliq_coverage_cache").upsert(
      { topic: "debug-test", volume: 0.1, trend: 0.0, article_count: 1, fetched_at: new Date().toISOString() },
      { onConflict: "topic" }
    );
    if (error) {
      insertResult = `ERROR: ${error.message} (code: ${error.code})`;
    } else {
      insertResult = "OK — upsert succeeded";
    }
  } catch (err) {
    insertResult = `THREW: ${err instanceof Error ? err.message : String(err)}`;
  }

  return NextResponse.json({
    env: { url: urlPreview, anonKey: anonPreview, serviceKey: servicePreview },
    selectResult,
    insertResult,
  });
}
