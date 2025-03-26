import { PdfProcessor } from "../PdfProcessor";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import Tesseract from "tesseract.js";

jest.mock("pdf-parse", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("tesseract.js", () => ({
  recognize: jest.fn(),
}));

import sharp from "sharp";

jest.mock("sharp", () => {
  const mockSharp = jest.fn(() => ({
    toFormat: jest.fn().mockReturnThis(),
    toBuffer: jest.fn(),
  }));
  return mockSharp;
});

describe("PdfProcessor", () => {
  let processor: PdfProcessor;
  const samplePdfPath = path.join(__dirname, "..", "..", "..", "test", "data", "CV3.pdf");
  const samplePdfBuffer = fs.existsSync(samplePdfPath)
    ? fs.readFileSync(samplePdfPath)
    : Buffer.from("sample pdf content");

  beforeEach(() => {
    processor = new PdfProcessor();
    jest.clearAllMocks();
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

      (sharp as unknown as jest.Mock).mockReturnValue({
        toFormat: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from("fake image data")),
      });

      const result = await processor.extractText(samplePdfBuffer, {
        fallbackToOCR: true,
      });

      expect(result.extractedText).toBe("OCR extracted text");
      expect(result.isOCR).toBe(true);
      expect(result.confidence).toBe(95);
    });

    it("should throw error when extraction fails without OCR fallback", async () => {
      (pdfParse as jest.Mock).mockRejectedValue(new Error("Extraction failed"));

      await expect(processor.extractText(samplePdfBuffer)).rejects.toThrow("Error extracting text from PDF");
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

      await expect(processor.getMetadata(samplePdfBuffer)).rejects.toThrow("Error getting metadata from PDF");
    });
  });

  describe("extractTextWithOCR", () => {
    it("should extract text using OCR", async () => {
      (pdfParse as jest.Mock).mockResolvedValue({ text: "" });

      const mockOcrText = "OCR extracted text";
      (Tesseract.recognize as jest.Mock).mockResolvedValue({
        data: { text: mockOcrText, confidence: 95 },
      });

      (sharp as unknown as jest.Mock).mockReturnValue({
        toFormat: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from("fake image data")),
      });

      const result = await processor.extractTextWithOCR(samplePdfBuffer);
      expect(result.extractedText).toBe(mockOcrText);
      expect(result.isOCR).toBe(true);
      expect(result.confidence).toBe(95);
    });

    it("should handle PDF with text without using OCR", async () => {
      const mockText = "PDF text content";
      (pdfParse as jest.Mock).mockResolvedValue({ text: mockText });

      const result = await processor.extractTextWithOCR(samplePdfBuffer);
      expect(result.extractedText).toBe(mockText);
      expect(result.isOCR).toBe(false);
    });

    it("should handle PDF with unsupported image format", async () => {
      (pdfParse as jest.Mock).mockResolvedValue({ text: "" });

      (sharp as unknown as jest.Mock).mockReturnValue({
        toFormat: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockRejectedValue(new Error("Input buffer contains unsupported image format")),
      });

      await expect(processor.extractTextWithOCR(samplePdfBuffer)).rejects.toThrow("Failed to convert PDF to image");
      await expect(processor.extractTextWithOCR(samplePdfBuffer)).rejects.toHaveProperty(
        "name",
        "UnsupportedImageFormat"
      );
    });

    it("should handle corrupted PDF files", async () => {
      (pdfParse as jest.Mock).mockRejectedValue(new Error("Invalid PDF structure"));

      (sharp as unknown as jest.Mock).mockReturnValue({
        toFormat: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockRejectedValue(new Error("Cannot process image")),
      });

      await expect(processor.extractTextWithOCR(samplePdfBuffer)).rejects.toThrow("Cannot process this PDF");
      await expect(processor.extractTextWithOCR(samplePdfBuffer)).rejects.toHaveProperty("name", "ProcessingError");
    });

    it("should handle invalid PDF format", async () => {
      (pdfParse as jest.Mock).mockResolvedValue({ text: "" });

      (sharp as unknown as jest.Mock).mockReturnValue({
        toFormat: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockRejectedValue(new Error("unsupported image format")),
      });

      await expect(processor.extractTextWithOCR(samplePdfBuffer)).rejects.toThrow("Failed to convert PDF to image");
      await expect(processor.extractTextWithOCR(samplePdfBuffer)).rejects.toHaveProperty(
        "name",
        "UnsupportedImageFormat"
      );
    });

    it("should handle OCR processing failure", async () => {
      (pdfParse as jest.Mock).mockResolvedValue({ text: "" });

      (sharp as unknown as jest.Mock).mockReturnValue({
        toFormat: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from("image data")),
      });

      (Tesseract.recognize as jest.Mock).mockRejectedValue(new Error("OCR failed"));

      await expect(processor.extractTextWithOCR(samplePdfBuffer)).rejects.toThrow("OCR processing failed");
    });
  });
});
