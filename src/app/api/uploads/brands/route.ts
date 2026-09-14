import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: { formErrors: ["No file provided"] } }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: { formErrors: ["Only JPG, PNG, or WebP images are allowed"] } },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: { formErrors: ["Image must be smaller than 5MB"] } },
      { status: 400 },
    );
  }

  const dir = path.join(process.cwd(), "public", "uploads", "brands");
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ data: { url: `/uploads/brands/${filename}` } }, { status: 201 });
}
