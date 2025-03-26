import { PdfAdvancedProcessor } from "../PdfAdvancedProcessor";
import { ProcessorFactory } from "../ProcessorFactory";
import * as fs from "fs";
import * as path from "path";

describe("PdfAdvancedProcessor", () => {
  let processor: PdfAdvancedProcessor;

  beforeEach(() => {
    processor = new PdfAdvancedProcessor();
  });

  describe("Factory Creation", () => {
    it("should create PdfAdvancedProcessor for pdf-advanced type", () => {
      const processor = ProcessorFactory.getProcessor("pdf-advanced");
      expect(processor).toBeInstanceOf(PdfAdvancedProcessor);
    });
  });

  describe("OCR Processing", () => {
    it("should extract text using OCR", async () => {
      const testPdfPath = path.join(__dirname, "../../../test/data/CV3.pdf");
      const buffer = fs.readFileSync(testPdfPath);

      const result = await processor.process(buffer, "extract-text-ocr");

      expect(result.extractedText).toBeDefined();
      expect(result.isOCR).toBe(true);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.metadata).toBeDefined();
    });
  });

  describe("Form Processing", () => {
    it("should process PDF form fields", async () => {
      const testPdfPath = path.join(__dirname, "../../../test/data/05-versions-space.pdf");
      const buffer = fs.readFileSync(testPdfPath);

      const result = await processor.process(buffer, "process-form");

      expect(result.formData).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.hasForm).toBeDefined();
      expect(result.metadata?.numFields).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Error Handling", () => {
    it("should throw error for unsupported operation", async () => {
      const buffer = Buffer.from("test");
      await expect(processor.process(buffer, "invalid-op")).rejects.toThrow("Unsupported operation");
    });
  });
});
