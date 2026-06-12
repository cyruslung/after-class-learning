import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.wrongAnswer.update({
    where: { id },
    data: { reviewed: true },
  });

  return NextResponse.json({ success: true });
}
