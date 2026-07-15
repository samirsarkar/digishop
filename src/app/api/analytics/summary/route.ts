import { NextResponse } from "next/server"
import { z } from "zod"

import { getShopSummary } from "@/features/analytics/services/summary"
import { requireApiUserId } from "@/features/auth/services/session"
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

    const summary = await getShopSummary(userId, shopId)
    return NextResponse.json(summary)
  } catch (error) {
    return handleApiError(error)
  }
}
