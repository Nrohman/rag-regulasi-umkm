import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    sessionId: string;
  };
}

/**
 * GET /api/sessions/[sessionId]
 * Mengambil detail sesi beserta seluruh riwayat pesannya
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { sessionId } = params;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Sesi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal mengambil data sesi", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/sessions/[sessionId]
 * Mengubah judul sesi obrolan (Rename)
 */
export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { sessionId } = params;
    const body = await req.json();

    if (!body?.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json(
        { error: "Judul sesi baru wajib disertakan" },
        { status: 400 }
      );
    }

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        title: body.title.trim(),
      },
    });

    return NextResponse.json(updatedSession);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal memperbarui judul sesi", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sessions/[sessionId]
 * Menghapus sesi obrolan beserta seluruh pesannya
 */
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { sessionId } = params;

    await prisma.session.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({
      message: "Sesi dan riwayat obrolan berhasil dihapus",
      id: sessionId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal menghapus sesi", details: error.message },
      { status: 500 }
    );
  }
}
