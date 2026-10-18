import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/sessions
 * Mengambil daftar seluruh sesi obrolan, diurutkan dari yang paling baru aktif
 */
export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { messages: true },
        },
      },
    });

    return NextResponse.json(sessions);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal mengambil daftar sesi", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sessions
 * Membuat sesi obrolan baru
 */
export async function POST(req: NextRequest) {
  try {
    let title = "Percakapan Baru";
    try {
      const body = await req.json();
      if (body?.title && typeof body.title === "string") {
        title = body.title.trim();
      }
    } catch {
      // Body opsional, gunakan judul default jika kosong
    }

    const newSession = await prisma.session.create({
      data: {
        title,
      },
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal membuat sesi baru", details: error.message },
      { status: 500 }
    );
  }
}
