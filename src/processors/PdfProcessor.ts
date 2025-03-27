import { IProcessor } from "./IProcessor";
import pdfParse from "pdf-parse";
import Tesseract from "tesseract.js";
import sharp from "sharp";

// --- Custom Error Classes ---
export class PdfProcessingError extends Error {
  public cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
  }
}

export class UnsupportedImageFormatError extends PdfProcessingError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class ProcessingError extends PdfProcessingError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class ConversionError extends PdfProcessingError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class OcrProcessingError extends PdfProcessingError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}
// --- End Custom Error Classes ---

export class PdfProcessor implements IProcessor {
  public async process(
    buffer: Buffer,
    operation: string,
    options?: Record<string, any>,
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
    options?: Record<string, any>,
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
      // Consider throwing a more specific custom error here too if needed
      throw new Error(
        `Error extracting text from PDF: ${error instanceof Error ? error.message : String(error)}`,
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
      // Consider throwing a more specific custom error here too if needed
      throw new Error(
        `Error getting metadata from PDF: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async convertToImage(buffer: Buffer): Promise<Buffer> {
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

    let lastError: Error | null = null;

    for (const option of conversionOptions) {
      try {
        console.log(`Attempting to convert PDF to ${option.description} (${option.format})`);
        const image = await sharp(buffer, {
          density: option.density,
          pages: 1, // Process only the first page for OCR efficiency
        })
          .toFormat(option.format as any, option.options || {})
          .toBuffer();

        if (image) {
          console.log(`Successfully converted PDF to ${option.format} image`);
          return image;
        }
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(`Failed to convert PDF to ${option.format}:`, lastError);
      }
    }

    console.log("All conversion attempts failed");

    // Directly create and throw the appropriate error based on the last error message
    const lastErrorMessage = lastError?.message || "Unknown error";

    if (lastErrorMessage.includes("unsupported image format")) {
      throw new UnsupportedImageFormatError(
        "Failed to convert PDF to image",
        lastError || undefined,
      );
    }

    if (lastErrorMessage.includes("Cannot process image")) {
      throw new ProcessingError("Cannot process this PDF", lastError || undefined);
    }

    throw new ConversionError("Failed to convert PDF to image", lastError || undefined);
  }

  public async extractTextWithOCR(
    buffer: Buffer,
    options?: Record<string, any>,
  ): Promise<{
    extractedText: string;
    isOCR: boolean;
    confidence?: number;
  }> {
    try {
      const data = await pdfParse(buffer, { max: 1 });
      if (data.text?.trim()) {
        return {
          extractedText: data.text,
          isOCR: false,
        };
      }
    } catch (pdfError) {
      console.log("Error parsing PDF structure (continuing to OCR):", pdfError);
    }

    const lang = options?.language || "eng";

    try {
      const processedImage = await this.convertToImage(buffer);
      console.log("Successfully converted PDF to image for OCR");

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
      if (error instanceof UnsupportedImageFormatError || error instanceof ProcessingError) {
        throw error;
      }

      throw new OcrProcessingError(
        `OCR processing failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined,
      );
    }
  }
}
