// app/api/upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "LANDLORD") {
      return NextResponse.json(
        { error: "Only landlords can upload property images" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > 6) {
      return NextResponse.json(
        { error: "Maximum 6 images allowed" },
        { status: 400 }
      );
    }

    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const MAX_SIZE_MB = 5;

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Only JPEG, PNG, and WebP allowed.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds ${MAX_SIZE_MB}MB limit.` },
          { status: 400 }
        );
      }
    }

    // ── Upload to Cloudinary ──
    const cloudName  = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey     = process.env.CLOUDINARY_API_KEY;
    const apiSecret  = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Image upload service not configured. Please contact support." },
        { status: 500 }
      );
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString("base64");
      const dataUri = `data:${file.type};base64,${base64}`;

      // Build Cloudinary signed upload request
      const timestamp = Math.round(Date.now() / 1000);
      const folder = "leasify/properties";

      // Generate signature
      const crypto = await import("crypto");
      const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto
        .createHash("sha1")
        .update(signatureString)
        .digest("hex");

      const uploadFormData = new FormData();
      uploadFormData.append("file", dataUri);
      uploadFormData.append("api_key", apiKey);
      uploadFormData.append("timestamp", timestamp.toString());
      uploadFormData.append("signature", signature);
      uploadFormData.append("folder", folder);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: uploadFormData,
        }
      );

      if (!cloudinaryRes.ok) {
        const errData = await cloudinaryRes.json();
        console.error("Cloudinary error:", errData);
        throw new Error(`Failed to upload ${file.name}`);
      }

      const cloudinaryData = await cloudinaryRes.json();
      uploadedUrls.push(cloudinaryData.secure_url);
    }

    return NextResponse.json({ urls: uploadedUrls });

  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload images", details: String(error) },
      { status: 500 }
    );
  }
}