import Link from "next/link"
import { notFound } from "next/navigation"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  getOrderStatusDescription,
  getOrderStatusHeadline,
  getOrderStatusLabel,
} from "@/features/orders/constants"
import { OrderPickupQr } from "@/features/storefront/components/order-pickup-qr"
import { getPublicOrderReceipt } from "@/features/storefront/services/checkout"
import { formatInr } from "@/shared/lib/money"
import { cn } from "@/lib/utils"

type PageProps = {
  params: Promise<{ shopSlug: string; orderId: string }>
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { shopSlug, orderId } = await params

  if (!process.env.DATABASE_URL) {
    notFound()
  }

  let receipt
  try {
    receipt = await getPublicOrderReceipt(orderId)
  } catch {
    notFound()
  }

  if (receipt.shopSlug !== shopSlug) {
    notFound()
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>{getOrderStatusHeadline(receipt.status)}</CardTitle>
          <CardDescription>
            {getOrderStatusDescription(receipt.status, receipt.shopName)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {receipt.pickupCode ? (
            <div className="space-y-3 rounded-lg border px-4 py-4 text-center">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Pickup code
              </p>
              <p className="font-numeric text-3xl font-bold tracking-[0.2em]">
                {receipt.pickupCode}
              </p>
              <OrderPickupQr code={receipt.pickupCode} />
              <p className="text-xs text-muted-foreground">
                Show this code or QR at the counter
              </p>
            </div>
          ) : null}
          <div className="rounded-lg bg-muted/60 px-4 py-3">
            <p className="text-xs text-muted-foreground">Order ID</p>
            <p className="font-mono text-sm break-all">{receipt.id}</p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium">
              {getOrderStatusLabel(receipt.status)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Payment</span>
            <span className="font-medium">Pay at pickup (COD)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-numeric text-lg font-semibold">
              {formatInr(receipt.totalAmount)}
            </span>
          </div>
          {receipt.notes ? (
            <p className="text-xs text-muted-foreground">{receipt.notes}</p>
          ) : null}
          <Link
            href={`/shop/${shopSlug}`}
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            Back to shop
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
