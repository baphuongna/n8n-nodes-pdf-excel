import { createWorker } from "tesseract.js";
import { PDFDocument, PDFField } from "pdf-lib";
import { IProcessor } from "./IProcessor";

type ProcessingResult = {
  extractedText?: string;
  metadata?: Record<string, any>;
  numPages?: number;
  isOCR?: boolean;
  confidence?: number;
  info?: any;
  worksheets?: any[];
  data?: any[];
  formData?: Record<string, any>;
};

/**
 * Advanced PDF processor with OCR and form handling capabilities
 */
export class PdfAdvancedProcessor implements IProcessor {
  private worker: any = null;

  /**
   * Process PDF with advanced features
   */
  async process(
    buffer: Buffer,
    operation: string,
    options?: Record<string, any>,
  ): Promise<ProcessingResult> {
    try {
      switch (operation) {
        case "extract-text-ocr":
          return await this.extractTextWithOCR(buffer);
        case "process-form":
          return await this.processForm(buffer);
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }
    } finally {
      if (this.worker) {
        await this.worker.terminate();
        console.log("OCR worker terminated");
      }
    }
  }

  /**
   * Extract text from PDF using OCR
   */
  private async extractTextWithOCR(buffer: Buffer): Promise<ProcessingResult> {
    if (!this.worker) {
      console.log("Initializing OCR worker");
      this.worker = await createWorker();
    }

    try {
      console.log("Starting OCR processing");
      const result = await this.worker.recognize(buffer);
      console.log("OCR processing completed");

      return {
        extractedText: result.data.text,
        isOCR: true,
        confidence: result.data.confidence,
        info: result.data,
        metadata: {
          engine: "tesseract",
          version: result.data.version,
        },
      };
    } catch (error) {
      console.log("OCR processing failed:", error);
      throw new Error(
        `OCR processing failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Process PDF form fields
   */
  private async processForm(buffer: Buffer): Promise<ProcessingResult> {
    try {
      console.log("Loading PDF document");
      const pdfDoc = await PDFDocument.load(buffer);
      const form = pdfDoc.getForm();
      const fields = form.getFields();

      console.log(`Processing ${fields.length} form fields`);
      const formData: Record<string, any> = {};
      fields.forEach((field: PDFField) => {
        const fieldType = field.constructor.name.replace("PDF", "");
        let value: any;

        if (fieldType.includes("Button")) {
          value = (field as any).isChecked();
        } else if (fieldType.includes("Dropdown") || fieldType.includes("OptionList")) {
          value = (field as any).getSelected();
        } else {
          value = (field as any).getText();
        }

        formData[field.getName()] = {
          type: fieldType,
          value: value,
        };
      });

      console.log("Form processing completed");
      return {
        formData,
        metadata: {
          hasForm: fields.length > 0,
          numFields: fields.length,
          pdfVersion: pdfDoc.getProducer(),
        },
      };
    } catch (error) {
      console.log("Form processing failed:", error);
      throw new Error(
        `Error processing PDF form: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
