import { NextResponse } from "next/server"

import { getPublicShopCatalog } from "@/features/storefront/services/catalog"
import { AppError } from "@/shared/lib/errors"

type RouteContext = {
  params: Promise<{ slug: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error: {
            code: "DATABASE_NOT_CONFIGURED",
            message: "DATABASE_URL is not set",
          },
        },
        { status: 503 }
      )
    }

    const { slug } = await context.params
    const catalog = await getPublicShopCatalog(slug)
    return NextResponse.json(catalog)
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      )
    }

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to load shop catalog",
        },
      },
      { status: 500 }
    )
  }
}
