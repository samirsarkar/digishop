import { NextResponse } from "next/server"
import { z } from "zod"

import { requireApiUserId } from "@/features/auth/services/session"
import { listProductCategories } from "@/features/inventory/services/products"
import {
  getQueryParams,
  handleApiError,
  requireDatabase,
} from "@/shared/lib/api"

const querySchema = z.object({ shopId: z.string().uuid() })

export async function GET(request: Request) {
  try {
    requireDatabase()
    const userId = await requireApiUserId()
    const { shopId } = querySchema.parse(getQueryParams(request))

    const categories = await listProductCategories(userId, shopId)
    return NextResponse.json({ categories })
  } catch (error) {
    return handleApiError(error)
  }
}
