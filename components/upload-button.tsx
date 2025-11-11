"use client"

import { UploadButton as UploadThingButton } from "@/lib/uploadthing"
import { useState } from "react"

interface UploadButtonProps {
  onUploadComplete: (urls: string[]) => void
}

export function UploadButton({ onUploadComplete }: UploadButtonProps) {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])

  return (
    <UploadThingButton
      endpoint="imageUploader"
      onClientUploadComplete={(res) => {
        const urls = res.map((file) => file.url)
        setUploadedUrls(urls)
        onUploadComplete(urls)
      }}
      onUploadError={(error: Error) => {
        console.error("Upload error:", error)
        alert("Upload failed. Please try again.")
      }}
    />
  )
}

