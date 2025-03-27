import {
  PdfProcessor,
  UnsupportedImageFormatError, // Import custom errors
  ProcessingError,
  OcrProcessingError,
} from "../PdfProcessor";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import Tesseract from "tesseract.js";
import sharp from "sharp";

type MockSharp = {
  toFormat: jest.Mock;
  toBuffer: jest.Mock;
};

jest.mock("pdf-parse", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("tesseract.js", () => ({
  recognize: jest.fn(),
}));

// Mock sharp with an initial mock function that will be replaced in beforeEach
jest.mock("sharp", () => jest.fn());

describe("PdfProcessor", () => {
  let processor: PdfProcessor;
  let mockSharpInstance: MockSharp;
  const samplePdfPath = path.join(__dirname, "..", "..", "..", "test", "data", "CV3.pdf");
  const samplePdfBuffer = fs.existsSync(samplePdfPath)
    ? fs.readFileSync(samplePdfPath)
    : Buffer.from("sample pdf content");

  beforeEach(() => {
    processor = new PdfProcessor();
    jest.clearAllMocks();
    // Create fresh mock instance for each test
    mockSharpInstance = {
      toFormat: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue(Buffer.from("fake image data")),
    };
    (sharp as unknown as jest.Mock).mockReturnValue(mockSharpInstance);
  });

  describe("extractText", () => {
    it("should extract text from PDF buffer", async () => {
      const mockText = "Sample extracted text";
      (pdfParse as jest.Mock).mockResolvedValue({ text: mockText });

      const result = await processor.extractText(samplePdfBuffer);
      expect(result.extractedText).toBe(mockText);
      expect(pdfParse).toHaveBeenCalledWith(samplePdfBuffer);
    });

    it("should fallback to OCR when extraction fails", async () => {
      (pdfParse as jest.Mock).mockRejectedValue(new Error("Extraction failed"));
      (Tesseract.recognize as jest.Mock).mockResolvedValue({
        data: { text: "OCR extracted text", confidence: 95 },
      });

      const result = await processor.extractText(samplePdfBuffer, { fallbackToOCR: true });
      expect(result.extractedText).toBe("OCR extracted text");
      expect(result.isOCR).toBe(true);
      expect(result.confidence).toBe(95);
    });

    it("should throw error when extraction fails without OCR fallback", async () => {
      (pdfParse as jest.Mock).mockRejectedValue(new Error("Extraction failed"));
      const promise = processor.extractText(samplePdfBuffer);
      // Keep this as is, or create a specific custom error for basic extraction failure
      await expect(promise).rejects.toThrow("Error extracting text from PDF");
    });
  });

  describe("getMetadata", () => {
    it("should return PDF metadata", async () => {
      const mockMetadata = {
        info: { Title: "Test PDF" },
        metadata: { Author: "Tester" },
      };
      (pdfParse as jest.Mock).mockResolvedValue(mockMetadata);

      const result = await processor.getMetadata(samplePdfBuffer);
      expect(result).toEqual(mockMetadata);
    });

    it("should throw error when metadata extraction fails", async () => {
      (pdfParse as jest.Mock).mockRejectedValue(new Error("Metadata extraction failed"));
      const promise = processor.getMetadata(samplePdfBuffer);
      // Keep this as is, or create a specific custom error for metadata failure
      await expect(promise).rejects.toThrow("Error getting metadata from PDF");
    });
  });

  describe("extractTextWithOCR", () => {
    it("should extract text using OCR", async () => {
      (pdfParse as jest.Mock).mockResolvedValue({ text: "" }); // Simulate no text found initially
      const mockOcrText = "OCR extracted text";
      (Tesseract.recognize as jest.Mock).mockResolvedValue({
        data: { text: mockOcrText, confidence: 95 },
      });

      const result = await processor.extractTextWithOCR(samplePdfBuffer);
      expect(result.extractedText).toBe(mockOcrText);
      expect(result.isOCR).toBe(true);
      expect(result.confidence).toBe(95);
    });

    it("should handle PDF with text without using OCR", async () => {
      const mockText = "PDF text content";
      (pdfParse as jest.Mock).mockResolvedValue({ text: mockText }); // Simulate text found

      const result = await processor.extractTextWithOCR(samplePdfBuffer);
      expect(result.extractedText).toBe(mockText);
      expect(result.isOCR).toBe(false);
      expect(Tesseract.recognize).not.toHaveBeenCalled(); // Ensure OCR was skipped
    });

    it("should throw UnsupportedImageFormatError when conversion fails due to format", async () => {
      (pdfParse as jest.Mock).mockResolvedValue({ text: "" });
      const error = new Error("Input buffer contains unsupported image format");
      // Simulate sharp failing on all attempts with this error
      mockSharpInstance.toBuffer.mockRejectedValue(error);

      // Expect the specific custom error class
      await expect(processor.extractTextWithOCR(samplePdfBuffer)).rejects.toThrow(
        UnsupportedImageFormatError,
      );
      // Optionally check message if needed, but class check is often sufficient
      await expect(processor.extractTextWithOCR(samplePdfBuffer)).rejects.toThrow(
        "Failed to convert PDF to image",
      );
    });

    it("should throw ProcessingError when conversion fails due to processing issue", async () => {
      // Simulate pdfParse failing first (optional, but covers the path)
      (pdfParse as jest.Mock).mockRejectedValue(new Error("Invalid PDF structure"));
      const error = new Error("Cannot process image");
      // Simulate sharp failing on all attempts with this error
      mockSharpInstance.toBuffer.mockRejectedValue(error);

      await processor.extractTextWithOCR(samplePdfBuffer).catch((e) => {
        expect(e).toBeInstanceOf(ProcessingError);
        expect(e.message).toBe("Cannot process this PDF");
        expect(e.cause).toBeInstanceOf(Error);
        expect(e.cause?.message).toBe("Cannot process image");
      });
    });

    it("should throw OcrProcessingError when Tesseract fails", async () => {
      (pdfParse as jest.Mock).mockResolvedValue({ text: "" });
      mockSharpInstance.toBuffer.mockResolvedValue(Buffer.from("fake image data"));
      const tesseractError = new Error("Tesseract engine error");
      (Tesseract.recognize as jest.Mock).mockRejectedValue(tesseractError);

      await processor.extractTextWithOCR(samplePdfBuffer).catch((e) => {
        expect(e).toBeInstanceOf(OcrProcessingError);
        expect(e.message).toBe("OCR processing failed: Tesseract engine error");
        expect(e.cause).toBe(tesseractError);
      });
    });
  });
});
