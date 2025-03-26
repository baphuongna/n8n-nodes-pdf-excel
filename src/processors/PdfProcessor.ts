import { IProcessor } from "./IProcessor";
import pdfParse from "pdf-parse";
import Tesseract from "tesseract.js";
import sharp from "sharp";

export class PdfProcessor implements IProcessor {
  public async process(
    buffer: Buffer,
    operation: string,
    options?: Record<string, any>
  ): Promise<{
    extractedText?: string;
    metadata?: Record<string, any>;
    numPages?: number;
    isOCR?: boolean;
    confidence?: number;
    info?: any;
  }> {
    switch (operation) {
      case "extractText":
        return this.extractText(buffer, options);
      case "extractTextWithOCR":
        return this.extractTextWithOCR(buffer, options);
      case "getMetadata":
        return this.getMetadata(buffer);
      default:
        throw new Error(`Unsupported PDF operation: ${operation}`);
    }
  }

  public async extractText(
    buffer: Buffer,
    options?: Record<string, any>
  ): Promise<{
    extractedText: string;
    metadata?: any;
    numPages?: number;
    isOCR?: boolean;
    confidence?: number;
  }> {
    try {
      const data = await pdfParse(buffer);
      return {
        extractedText: data.text,
        metadata: data.metadata,
        numPages: data.numpages,
        isOCR: false,
      };
    } catch (error) {
      if (options?.fallbackToOCR) {
        console.log("Standard text extraction failed, falling back to OCR");
        return this.extractTextWithOCR(buffer, options);
      }
      throw new Error(
        `Error extracting text from PDF: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  public async getMetadata(buffer: Buffer): Promise<{ metadata: any; info: any }> {
    try {
      const data = await pdfParse(buffer);
      return {
        metadata: data.metadata,
        info: data.info,
      };
    } catch (error) {
      throw new Error(
        `Error getting metadata from PDF: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  public async extractTextWithOCR(
    buffer: Buffer,
    options?: Record<string, any>
  ): Promise<{
    extractedText: string;
    isOCR: boolean;
    confidence?: number;
  }> {
    try {
      const data = await pdfParse(buffer, { max: 1 });
      if (data.text && data.text.trim()) {
        return {
          extractedText: data.text,
          isOCR: false,
        };
      }
    } catch (pdfError) {
      console.log("Error parsing PDF structure:", pdfError);
    }

    let lastError: Error | null = null;
    let image: Buffer | null = null;

    const conversionOptions = [
      {
        format: "png",
        density: 300,
        description: "PNG 300dpi",
        options: { compressionLevel: 9 },
      },
      {
        format: "jpeg",
        density: 300,
        quality: 100,
        description: "JPEG 100% quality 300dpi",
        options: { mozjpeg: true },
      },
      {
        format: "tiff",
        density: 300,
        description: "TIFF 300dpi",
        options: { compression: "lzw" },
      },
      {
        format: "png",
        density: 150,
        description: "PNG 150dpi",
        options: { compressionLevel: 6 },
      },
      {
        format: "jpeg",
        density: 150,
        quality: 90,
        description: "JPEG 90% quality 150dpi",
        options: { mozjpeg: true },
      },
    ];

    for (const options of conversionOptions) {
      try {
        console.log(`Attempting to convert PDF to ${options.description} (${options.format})`);
        image = await sharp(buffer, {
          density: options.density,
          pages: 1,
        })
          .toFormat(options.format as any, options.options || {})
          .toBuffer();

        if (image) {
          console.log(`Successfully converted PDF to ${options.format} image`);
          break;
        }
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(`Failed to convert PDF to ${options.format}:`, lastError);
      }
    }

    if (!image) {
      console.log("All conversion attempts failed");
      const errorMsg = "Failed to convert PDF to image";

      if (lastError && lastError.message.includes("unsupported image format")) {
        const error = new Error(errorMsg);
        error.name = "UnsupportedImageFormat";
        throw error;
      } else if (lastError && lastError.message.includes("Cannot process image")) {
        const error = new Error("Cannot process this PDF");
        error.name = "ProcessingError";
        throw error;
      } else {
        const error = new Error(errorMsg);
        error.name = "ConversionError";
        throw error;
      }
    }

    const lang = options?.language || "eng";

    console.log("Attempting to process PDF as image");
    let processedImage: Buffer;
    try {
      processedImage = await sharp(buffer, { density: 300 }).toFormat("png").toBuffer();
      console.log("Successfully converted PDF to PNG");
    } catch (firstError) {
      console.log("First conversion attempt failed, trying with default settings");
      try {
        processedImage = await sharp(buffer).toFormat("png").toBuffer();
      } catch (error) {
        console.log("PDF to image conversion failed:", error);
        let errorMsg = "Failed to process PDF file";

        if (error instanceof Error) {
          if (error.message.includes("unsupported image format")) {
            errorMsg = "Unsupported PDF/image format. Please convert to a standard format first.";
          } else if (error.message.includes("Cannot process image")) {
            errorMsg = "Corrupted or invalid PDF file. Please verify the file integrity.";
          }
        }

        throw new Error(errorMsg);
      }
    }

    try {
      const { data } = await Tesseract.recognize(processedImage, lang, {
        logger: (m) => console.log(m.status),
      });

      console.log("OCR Confidence:", data.confidence);

      if (data.confidence < 60) {
        console.log("Low OCR confidence - extracted text may be inaccurate");
      }

      return {
        extractedText: data.text,
        isOCR: true,
        confidence: data.confidence,
      };
    } catch (error) {
      console.log("OCR processing failed:", error);
      throw new Error(
        `OCR processing failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
