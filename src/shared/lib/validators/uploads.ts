import { z } from "zod"

export const IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

export const createUploadUrlSchema = z.object({
  contentType: z.enum(IMAGE_CONTENT_TYPES),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(MAX_IMAGE_SIZE_BYTES, "Image must be 5 MB or smaller"),
  folder: z.enum(["products", "shops"]).default("products"),
})

export type CreateUploadUrlInput = z.infer<typeof createUploadUrlSchema>
