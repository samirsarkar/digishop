import { NextResponse } from "next/server"
import { z } from "zod"

import { requireApiUserId } from "@/features/auth/services/session"
import {
  deleteShopContact,
  updateShopContact,
} from "@/features/shop/services/contacts"
import {
  handleApiError,
  parseJsonBody,
  requireDatabase,
} from "@/shared/lib/api"
import { shopContactFieldsSchema } from "@/shared/lib/validators/shop"

type RouteContext = {
  params: Promise<{ contactId: string }>
}

const contactIdSchema = z.string().uuid("Invalid contact id")
const updateBodySchema = shopContactFieldsSchema.partial()

export async function PATCH(request: Request, context: RouteContext) {
  try {
    requireDatabase()
    const userId = await requireApiUserId()
    const contactId = contactIdSchema.parse((await context.params).contactId)
    const fields = updateBodySchema.parse(await parseJsonBody(request))

    const contact = await updateShopContact(userId, { ...fields, contactId })
    return NextResponse.json(contact)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    requireDatabase()
    const userId = await requireApiUserId()
    const contactId = contactIdSchema.parse((await context.params).contactId)

    const result = await deleteShopContact(userId, contactId)
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
