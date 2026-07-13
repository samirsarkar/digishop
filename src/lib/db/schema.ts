import { relations } from "drizzle-orm"
import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

export const memberRoleEnum = pgEnum("member_role", ["owner", "manager"])

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "ready",
  "completed",
  "cancelled",
])

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "upi",
  "card",
  "cod",
  "razorpay",
])

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
])

export const contactTypeEnum = pgEnum("contact_type", [
  "phone",
  "email",
  "whatsapp",
  "website",
  "instagram",
  "facebook",
  "other",
])

export const shops = pgTable(
  "shops",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: text("owner_id").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    gst: text("gst"),
    address: text("address"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("shops_slug_idx").on(table.slug)]
)

/** Flexible contact channels — phone, email, social, etc. (many per shop). */
export const shopContacts = pgTable(
  "shop_contacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    shopId: uuid("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    type: contactTypeEnum("type").notNull(),
    value: text("value").notNull(),
    label: text("label"),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("shop_contacts_shop_type_value_idx").on(
      table.shopId,
      table.type,
      table.value
    ),
  ]
)

export const shopMembers = pgTable(
  "shop_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkId: text("clerk_id").notNull(),
    shopId: uuid("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    role: memberRoleEnum("role").notNull().default("owner"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("shop_members_clerk_shop_idx").on(table.clerkId, table.shopId),
  ]
)

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    shopId: uuid("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category"),
    sku: text("sku"),
    barcode: text("barcode"),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    costPrice: numeric("cost_price", { precision: 12, scale: 2 }),
    imageUrl: text("image_url"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("products_shop_barcode_idx").on(table.shopId, table.barcode),
    uniqueIndex("products_shop_sku_idx").on(table.shopId, table.sku),
  ]
)

export const inventory = pgTable(
  "inventory",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    shopId: uuid("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("inventory_product_idx").on(table.productId),
  ]
)

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  shopId: uuid("shop_id")
    .notNull()
    .references(() => shops.id, { onDelete: "cascade" }),
  customerId: text("customer_id"),
  status: orderStatusEnum("status").notNull().default("pending"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull().default("cash"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
})

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const shopsRelations = relations(shops, ({ many }) => ({
  members: many(shopMembers),
  contacts: many(shopContacts),
  products: many(products),
  inventory: many(inventory),
  orders: many(orders),
}))

export const shopContactsRelations = relations(shopContacts, ({ one }) => ({
  shop: one(shops, {
    fields: [shopContacts.shopId],
    references: [shops.id],
  }),
}))

export const shopMembersRelations = relations(shopMembers, ({ one }) => ({
  shop: one(shops, {
    fields: [shopMembers.shopId],
    references: [shops.id],
  }),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  shop: one(shops, {
    fields: [products.shopId],
    references: [shops.id],
  }),
  inventory: one(inventory, {
    fields: [products.id],
    references: [inventory.productId],
  }),
  orderItems: many(orderItems),
}))

export const inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id],
  }),
  shop: one(shops, {
    fields: [inventory.shopId],
    references: [shops.id],
  }),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  shop: one(shops, {
    fields: [orders.shopId],
    references: [shops.id],
  }),
  items: many(orderItems),
  transactions: many(transactions),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
  order: one(orders, {
    fields: [transactions.orderId],
    references: [orders.id],
  }),
}))

export type Shop = typeof shops.$inferSelect
export type NewShop = typeof shops.$inferInsert
export type ShopContact = typeof shopContacts.$inferSelect
export type NewShopContact = typeof shopContacts.$inferInsert
export type ShopMember = typeof shopMembers.$inferSelect
export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type Inventory = typeof inventory.$inferSelect
export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type OrderItem = typeof orderItems.$inferSelect
export type Transaction = typeof transactions.$inferSelect
