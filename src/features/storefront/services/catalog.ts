import { listProductsByShopSlug } from "@/features/inventory/services/products"
import { listShopContacts } from "@/features/shop/services/contacts"
import { getShopBySlug } from "@/features/shop/services/shop"
import { AppError } from "@/shared/lib/errors"

export async function getPublicShopCatalog(slug: string) {
  const shop = await getShopBySlug(slug)
  if (!shop) {
    throw new AppError("Shop not found", "SHOP_NOT_FOUND", 404)
  }

  const [products, contacts] = await Promise.all([
    listProductsByShopSlug(slug),
    listShopContacts(shop.id),
  ])

  return {
    shop: {
      id: shop.id,
      name: shop.name,
      slug: shop.slug,
      address: shop.address,
      contacts: contacts.map((contact) => ({
        type: contact.type,
        value: contact.value,
        label: contact.label,
        isPrimary: contact.isPrimary,
      })),
    },
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      imageUrl: product.imageUrl,
      description: product.description,
      quantity: product.quantity,
    })),
  }
}
