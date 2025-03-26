import { IProcessor } from "./IProcessor";
import { PdfProcessor } from "./PdfProcessor";
import { ExcelProcessor } from "./ExcelProcessor";
import { PdfAdvancedProcessor } from "./PdfAdvancedProcessor";

/**
 * Factory class for creating file processors based on file type
 * Implements Factory Pattern to create appropriate processor instances
 */
export class ProcessorFactory {
  /**
   * Get the appropriate processor for the given file type
   * @param fileType - Type of file to process:
   *                   - 'pdf': Basic PDF processing
   *                   - 'pdf-advanced': PDF with OCR and form support
   *                   - 'excel': Excel processing
   * @returns An instance of the appropriate processor
   * @throws Error if file type is not supported
   */
  public static getProcessor(fileType: string): IProcessor {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return new PdfProcessor();
      case "pdf-advanced":
        return new PdfAdvancedProcessor();
      case "excel":
        return new ExcelProcessor();
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }
}
