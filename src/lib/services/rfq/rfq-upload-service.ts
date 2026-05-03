import {
  buildRfqUploadSignature,
  verifyRfqUploadedFile,
  type RfqUploadSignatureInput,
} from "@/lib/imagekit";
import type { RfqPayload } from "@/validations/rfq";

export class RFQUploadService {
  createUploadSignature(input: RfqUploadSignatureInput) {
    return buildRfqUploadSignature(input);
  }

  async verifyFiles(files: RfqPayload["files"]): Promise<boolean> {
    const checks = await Promise.all(
      files.map((file) =>
        verifyRfqUploadedFile({
          fileId: file.fileId,
          url: file.url,
          type: file.type,
          mimeType: file.mimeType,
        }),
      ),
    );

    return checks.every(Boolean);
  }
}
