"use client"

import { UploadButton as UploadThingButton } from "@uploadthing/react"

export function UploadButton({
  endpoint,
  onClientUploadComplete,
  onUploadError,
}: {
  endpoint: string
  onClientUploadComplete?: (res: Array<{ url: string }>) => void
  onUploadError?: (error: Error) => void
}) {
  return (
    <UploadThingButton
      endpoint={endpoint}
      onClientUploadComplete={onClientUploadComplete}
      onUploadError={onUploadError}
      appearance={{
        button: "ut-ready:bg-primary ut-uploading:cursor-not-allowed rounded-r-none bg-primary text-primary-foreground hover:bg-primary/90",
        allowedContent: "text-xs text-muted-foreground",
      }}
    />
  )
}

