import { createUploadthing, type FileRouter } from "uploadthing/next"

// ✅ Correct usage (no argument needed)
const f = createUploadthing()

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 5 } })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete, file url:", file.url)
      return { uploadedBy: "user" }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter

