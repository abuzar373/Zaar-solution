import { NextResponse } from "next/server";

export function databaseError(action: string, error: unknown) {
  console.error(`[api] ${action} failed`, error);
  return NextResponse.json(
    {
      error: `Database is not connected. Add DATABASE_URL for your Supabase PostgreSQL project, then retry ${action}.`,
    },
    { status: 503 }
  );
}

export function unexpectedError(action: string, error: unknown) {
  console.error(`[api] ${action} failed`, error);
  return NextResponse.json(
    { error: `Unable to ${action}. Please check the deployment logs and try again.` },
    { status: 500 }
  );
}
