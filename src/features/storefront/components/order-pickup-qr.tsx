"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"

export function OrderPickupQr({ code }: { code: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(code, {
      margin: 1,
      width: 200,
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url)
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null)
      })
    return () => {
      cancelled = true
    }
  }, [code])

  if (!dataUrl) {
    return (
      <div className="mx-auto flex size-48 items-center justify-center rounded-lg border bg-muted/40 text-xs text-muted-foreground">
        Generating QR…
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt={`Pickup code ${code}`}
      className="mx-auto size-48 rounded-lg border bg-white p-2"
    />
  )
}
