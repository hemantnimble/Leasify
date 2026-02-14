// app/api/auth/nonce/route.ts

import { NextResponse }           from "next/server";
import { generateNonce }          from "siwe";
import { storeNonce }             from "@/lib/nonceStore";

export async function GET() {
  const nonce = generateNonce();
  storeNonce(nonce);
  return NextResponse.json({ nonce });
}