import { NextResponse } from "next/server"

import { requireApiUserId } from "@/features/auth/services/session"
import { createImageUploadUrl } from "@/features/uploads/services/s3"
import { handleApiError, parseJsonBody } from "@/shared/lib/api"
import { createUploadUrlSchema } from "@/shared/lib/validators/uploads"

/**
 * Presigned-upload flow (mobile-first):
 * 1. POST { contentType, fileSize, folder? } here.
 * 2. PUT the raw image bytes to the returned `uploadUrl` with the returned headers.
 * 3. Store `publicUrl` (e.g. as a product `imageUrl`).
 */
export async function POST(request: Request) {
  try {
    const userId = await requireApiUserId()
    const input = createUploadUrlSchema.parse(await parseJsonBody(request))

    const ticket = await createImageUploadUrl(userId, input)
    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
