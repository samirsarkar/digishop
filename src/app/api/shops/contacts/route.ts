import { NextResponse } from "next/server"
import { z } from "zod"

import { requireApiUserId } from "@/features/auth/services/session"
import {
  addShopContact,
  listShopContactsForUser,
} from "@/features/shop/services/contacts"
import {
  getQueryParams,
  handleApiError,
  parseJsonBody,
  requireDatabase,
} from "@/shared/lib/api"
import { createShopContactSchema } from "@/shared/lib/validators/shop"

const listQuerySchema = z.object({ shopId: z.string().uuid() })

export async function GET(request: Request) {
  try {
    requireDatabase()
    const userId = await requireApiUserId()
    const { shopId } = listQuerySchema.parse(getQueryParams(request))

    const contacts = await listShopContactsForUser(userId, shopId)
    return NextResponse.json({ contacts })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    requireDatabase()
    const userId = await requireApiUserId()
    const input = createShopContactSchema.parse(await parseJsonBody(request))

    const contact = await addShopContact(userId, input)
    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
