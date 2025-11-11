"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Upload } from "lucide-react"

interface LocalUploadButtonProps {
  onUploadComplete: (urls: string[]) => void
}

export function LocalUploadButton({ onUploadComplete }: LocalUploadButtonProps) {
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const urls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.type.startsWith("image/")) {
          // Convert to base64 data URL for local storage
          const reader = new FileReader()
          const url = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
          urls.push(url)
        }
      }
      onUploadComplete(urls)
    } catch (error) {
      console.error("Upload error:", error)
      alert("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        id="file-upload"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => document.getElementById("file-upload")?.click()}
        disabled={uploading}
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        {uploading ? "Uploading..." : "Upload Photos"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Select one or more images (max 5, 4MB each)
      </p>
    </div>
  )
}

