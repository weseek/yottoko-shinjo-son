import { requireAdminSession } from "@/lib/auth-guard";
import { uploadImage, validateImageFile } from "@/lib/storage";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "ファイルが見つかりません" },
      { status: 400 },
    );
  }

  const validationError = validateImageFile(file);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const url = await uploadImage(file);
  return NextResponse.json({ url });
}
