import { NextResponse } from "next/server"

import { requireApiUserId } from "@/features/auth/services/session"
import {
  createShop,
  getShopForUser,
  updateShop,
} from "@/features/shop/services/shop"
import {
  handleApiError,
  parseJsonBody,
  requireDatabase,
} from "@/shared/lib/api"
import {
  createShopSchema,
  updateShopSchema,
} from "@/shared/lib/validators/shop"

export async function GET() {
  try {
    requireDatabase()
    const userId = await requireApiUserId()

    const shop = await getShopForUser(userId)
    return NextResponse.json({ shop })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    requireDatabase()
    const userId = await requireApiUserId()
    const input = createShopSchema.parse(await parseJsonBody(request))

    const shop = await createShop(userId, input)
    return NextResponse.json(shop, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: Request) {
  try {
    requireDatabase()
    const userId = await requireApiUserId()
    const input = updateShopSchema.parse(await parseJsonBody(request))

    const shop = await updateShop(userId, input)
    return NextResponse.json(shop)
  } catch (error) {
    return handleApiError(error)
  }
}
