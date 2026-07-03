import { put, head } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

interface MemoNote {
  id: string;
  text: string;
  timestamp: string;
}

function blobKey(entryId: string) {
  return `memo-notes/${entryId}.json`;
}

// GET /api/notes?entryId=xxx  → return notes array
export async function GET(req: NextRequest) {
  const entryId = req.nextUrl.searchParams.get("entryId");
  if (!entryId) return NextResponse.json([], { status: 200 });

  try {
    const blobMeta = await head(blobKey(entryId)).catch(() => null);
    if (!blobMeta) return NextResponse.json([]);

    // Cache-bust to always get the latest content
    const res = await fetch(`${blobMeta.url}?t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) return NextResponse.json([]);
    const notes: MemoNote[] = await res.json();
    return NextResponse.json(notes, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json([]);
  }
}

// POST /api/notes?entryId=xxx  body: MemoNote[]  → save full array
export async function POST(req: NextRequest) {
  const entryId = req.nextUrl.searchParams.get("entryId");
  if (!entryId) return NextResponse.json({ error: "entryId required" }, { status: 400 });

  const notes: MemoNote[] = await req.json();
  const blob = await put(blobKey(entryId), JSON.stringify(notes), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    cacheControlMaxAge: 0,
  });

  return NextResponse.json({ url: blob.url });
}
