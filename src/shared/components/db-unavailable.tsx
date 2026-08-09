import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MerchantShell } from "@/features/shop/components/merchant-shell"
import { cn } from "@/lib/utils"

export function DbUnavailableView({
  retryHref,
  shopName,
}: {
  retryHref: string
  shopName?: string
}) {
  return (
    <MerchantShell shopName={shopName}>
      <Card>
        <CardHeader>
          <CardTitle>Database temporarily unavailable</CardTitle>
          <CardDescription>
            Could not reach Neon. Wait a moment and refresh — free-tier
            databases often sleep after idle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={retryHref} className={cn(buttonVariants())}>
            Retry
          </Link>
        </CardContent>
      </Card>
    </MerchantShell>
  )
}
