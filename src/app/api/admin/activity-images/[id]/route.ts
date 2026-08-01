import { requireAdminSession } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const imageId = Number(id);

  if (!Number.isInteger(imageId) || Number.isNaN(imageId)) {
    return NextResponse.json(
      { error: "id は整数である必要があります" },
      { status: 400 },
    );
  }

  const existing = await prisma.activityImage.findUnique({
    where: { id: imageId },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "指定された画像が見つかりません" },
      { status: 404 },
    );
  }

  await prisma.activityImage.delete({ where: { id: imageId } });
  return new NextResponse(null, { status: 204 });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const imageId = Number(id);

  if (!Number.isInteger(imageId) || Number.isNaN(imageId)) {
    return NextResponse.json(
      { error: "id は整数である必要があります" },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストボディが不正です" },
      { status: 400 },
    );
  }

  const { order } = body as { order?: unknown };
  if (typeof order !== "number" || !Number.isInteger(order)) {
    return NextResponse.json(
      { error: "order は整数である必要があります" },
      { status: 400 },
    );
  }

  const existing = await prisma.activityImage.findUnique({
    where: { id: imageId },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "指定された画像が見つかりません" },
      { status: 404 },
    );
  }

  const updated = await prisma.activityImage.update({
    where: { id: imageId },
    data: { order },
    select: { id: true, url: true, order: true, createdAt: true },
  });

  return NextResponse.json(updated);
}
