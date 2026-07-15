import { randomUUID } from "crypto"

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { AppError } from "@/shared/lib/errors"
import {
  createUploadUrlSchema,
  type CreateUploadUrlInput,
} from "@/shared/lib/validators/uploads"

const UPLOAD_URL_TTL_SECONDS = 300

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
}

type S3Config = {
  region: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
}

function getS3Config(): S3Config {
  const region = process.env.AWS_REGION
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const bucket = process.env.S3_BUCKET_NAME

  if (!region || !accessKeyId || !secretAccessKey || !bucket) {
    throw new AppError(
      "Image uploads are not configured. Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY and S3_BUCKET_NAME.",
      "UPLOADS_NOT_CONFIGURED",
      503
    )
  }

  return { region, accessKeyId, secretAccessKey, bucket }
}

let cachedClient: S3Client | null = null

function getS3Client(config: S3Config): S3Client {
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })
  }
  return cachedClient
}

export type ImageUploadTicket = {
  uploadUrl: string
  method: "PUT"
  headers: { "Content-Type": string; "Content-Length": string }
  key: string
  publicUrl: string
  expiresInSeconds: number
}

/**
 * Presigned-URL flow: the API only signs the request; the device uploads the
 * image bytes straight to S3 (no large multipart bodies through the app server,
 * which suits slow mobile networks and serverless body-size limits).
 * The signature pins Content-Type and Content-Length, so the client must send
 * exactly what it declared.
 */
export async function createImageUploadUrl(
  userId: string,
  input: CreateUploadUrlInput
): Promise<ImageUploadTicket> {
  const data = createUploadUrlSchema.parse(input)
  const config = getS3Config()
  const client = getS3Client(config)

  const extension = EXTENSION_BY_CONTENT_TYPE[data.contentType]
  const key = `uploads/${data.folder}/${userId}/${randomUUID()}.${extension}`

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    ContentType: data.contentType,
    ContentLength: data.fileSize,
  })

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: UPLOAD_URL_TTL_SECONDS,
  })

  const publicBase =
    process.env.S3_PUBLIC_BASE_URL?.replace(/\/+$/, "") ??
    `https://${config.bucket}.s3.${config.region}.amazonaws.com`

  return {
    uploadUrl,
    method: "PUT",
    headers: {
      "Content-Type": data.contentType,
      "Content-Length": String(data.fileSize),
    },
    key,
    publicUrl: `${publicBase}/${key}`,
    expiresInSeconds: UPLOAD_URL_TTL_SECONDS,
  }
}
