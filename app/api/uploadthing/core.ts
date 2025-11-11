import { createUploadthing, type FileRouter } from "uploadthing/next"

// ✅ Correct usage (no argument needed)
const f = createUploadthing()

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 5 } })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata?.userId)
      console.log("file url", file.url)
      return { uploadedBy: metadata?.userId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter

