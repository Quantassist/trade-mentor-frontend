import { UploadClient } from "@uploadcare/upload-client"

// Lazy-initialized UploadClient to avoid module-level instantiation
let _uploadClient: UploadClient | null = null

export const upload = {
  uploadFile: async (file: File) => {
    if (!_uploadClient) {
      _uploadClient = new UploadClient({
        publicKey: process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY as string,
      })
    }
    return _uploadClient.uploadFile(file)
  },
}
