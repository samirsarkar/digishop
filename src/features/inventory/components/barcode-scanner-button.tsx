"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"
import { Camera, CameraOff, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type BarcodeScannerButtonProps = {
  onScan: (code: string) => void
  className?: string
}

export function BarcodeScannerButton({
  onScan,
  className,
}: BarcodeScannerButtonProps) {
  const [hasCamera, setHasCamera] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)

  useEffect(() => {
    let cancelled = false

    async function detect() {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
        return
      }
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const cams = devices.filter((d) => d.kind === "videoinput")
        if (!cancelled) setHasCamera(cams.length > 0)
      } catch {
        if (!cancelled) setHasCamera(false)
      }
    }

    void detect()
    return () => {
      cancelled = true
    }
  }, [])

  const stop = useCallback(() => {
    controlsRef.current?.stop()
    controlsRef.current = null
    readerRef.current = null
    const video = videoRef.current
    if (video?.srcObject instanceof MediaStream) {
      video.srcObject.getTracks().forEach((track) => track.stop())
      video.srcObject = null
    }
  }, [])

  useEffect(() => {
    if (!open) {
      stop()
      return
    }

    let active = true
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader

    async function start() {
      setError(null)
      try {
        if (!videoRef.current) return

        // Prefer rear camera on phones/tablets; fall back to any webcam / scanner.
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        }

        const controls = await reader.decodeFromConstraints(
          constraints,
          videoRef.current,
          (result, err) => {
            if (!active) return
            if (result) {
              onScan(result.getText())
              setOpen(false)
              stop()
            }
            // Ignore continuous "not found" while framing the code
            if (err && !/NotFoundException/i.test(String(err))) {
              setError(err.message || "Unable to read barcode")
            }
          }
        )
        controlsRef.current = controls
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Camera permission denied or unavailable"
        setError(message)
      }
    }

    void start()

    return () => {
      active = false
      stop()
    }
  }, [open, onScan, stop])

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!hasCamera}
        title={
          hasCamera
            ? "Scan barcode with camera"
            : "No camera or scanner detected on this device"
        }
        className={cn(className)}
        onClick={() => setOpen(true)}
      >
        {hasCamera ? (
          <Camera className="size-3.5" />
        ) : (
          <CameraOff className="size-3.5" />
        )}
        Scan
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-background shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="text-sm font-medium">Scan barcode</p>
              <button
                type="button"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                onClick={() => {
                  setOpen(false)
                  stop()
                }}
                aria-label="Close scanner"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <video
                ref={videoRef}
                className="aspect-video w-full rounded-lg bg-black object-cover"
                muted
                playsInline
              />
              <p className="text-xs text-muted-foreground">
                Point the rear camera (or webcam / USB scanner stream) at the
                barcode. Allow camera access if prompted.
              </p>
              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
