import { requireAdminSession } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const activityIdParam = searchParams.get("activityId");

  if (!activityIdParam) {
    return NextResponse.json(
      { error: "activityId は必須です" },
      { status: 400 },
    );
  }

  const activityId = Number(activityIdParam);
  if (!Number.isInteger(activityId) || Number.isNaN(activityId)) {
    return NextResponse.json(
      { error: "activityId は整数である必要があります" },
      { status: 400 },
    );
  }

  const images = await prisma.activityImage.findMany({
    where: { activityId },
    orderBy: { order: "asc" },
    select: { id: true, url: true, order: true, createdAt: true },
  });

  return NextResponse.json(images);
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdminSession();
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストボディが不正です" },
      { status: 400 },
    );
  }

  const { activityId, url, order } = body as {
    activityId?: unknown;
    url?: unknown;
    order?: unknown;
  };

  if (typeof activityId !== "number" || !Number.isInteger(activityId)) {
    return NextResponse.json(
      { error: "activityId は整数である必要があります" },
      { status: 400 },
    );
  }

  if (typeof url !== "string" || url.trim() === "") {
    return NextResponse.json(
      { error: "url は空にできません" },
      { status: 400 },
    );
  }

  if (typeof order !== "number" || !Number.isInteger(order)) {
    return NextResponse.json(
      { error: "order は整数である必要があります" },
      { status: 400 },
    );
  }

  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
  });

  if (!activity) {
    return NextResponse.json(
      { error: "指定された Activity が見つかりません" },
      { status: 404 },
    );
  }

  const image = await prisma.activityImage.create({
    data: { activityId, url: url.trim(), order },
    select: { id: true, url: true, order: true, createdAt: true },
  });

  return NextResponse.json(image, { status: 201 });
}
