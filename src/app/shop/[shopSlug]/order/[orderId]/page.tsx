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
          <CardTitle>Order placed</CardTitle>
          <CardDescription>
            Show this at {receipt.shopName}. Pay at pickup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/60 px-4 py-3">
            <p className="text-xs text-muted-foreground">Order ID</p>
            <p className="font-mono text-sm break-all">{receipt.id}</p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="capitalize font-medium">{receipt.status}</span>
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
