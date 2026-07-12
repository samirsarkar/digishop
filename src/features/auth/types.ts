/** Aligns with role boundaries defined in docs/VISION.md */
export type UserRole = "owner" | "manager" | "customer"

export type AuthSession = {
  userId: string
  role?: UserRole
}
