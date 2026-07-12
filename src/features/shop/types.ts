export type ShopRole = "owner" | "manager"

export type ContactType =
  | "phone"
  | "email"
  | "whatsapp"
  | "website"
  | "instagram"
  | "facebook"
  | "other"

export type ShopContactProfile = {
  id: string
  type: ContactType
  value: string
  label: string | null
  isPrimary: boolean
}

export type ShopProfile = {
  id: string
  ownerId: string
  name: string
  slug: string
  gst: string | null
  address: string | null
  contacts?: ShopContactProfile[]
  createdAt: Date
  updatedAt: Date
}
