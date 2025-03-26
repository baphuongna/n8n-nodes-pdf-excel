import { IProcessor } from "./IProcessor";
import * as XLSX from "xlsx";

/**
 * Processor for Excel files
 * Implements the IProcessor interface for Excel-specific operations
 */
export class ExcelProcessor implements IProcessor {
  /**
   * Process an Excel file buffer with the specified operation
   * @param buffer - Buffer containing Excel file data
   * @param operation - Operation to perform ('readWorksheet' or 'getWorksheets')
   * @param options - Additional options for processing
   * @returns Promise resolving to the processing result
   * @throws Error if operation is not supported
   */
  public async process(
    buffer: Buffer,
    operation: string,
    options?: Record<string, any>
  ): Promise<any> {
    switch (operation) {
      case "readWorksheet":
        return this.readWorksheet(buffer, options?.worksheetName);
      case "getWorksheets":
        return this.getWorksheets(buffer);
      default:
        throw new Error(`Unsupported Excel operation: ${operation}`);
    }
  }

  /**
   * Read data from a specific worksheet
   * @param buffer - Buffer containing Excel file data
   * @param worksheetName - Name of the worksheet to read (defaults to first sheet)
   * @returns Promise resolving to the worksheet data as an array of objects
   */
  private async readWorksheet(buffer: Buffer, worksheetName?: string): Promise<{ data: any[] }> {
    try {
      const workbook = XLSX.read(buffer, { type: "buffer" });

      // Use specified worksheet or default to first sheet
      const sheetName = worksheetName || workbook.SheetNames[0];

      if (!workbook.SheetNames.includes(sheetName)) {
        throw new Error(`Worksheet '${sheetName}' not found in Excel file`);
      }

      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Convert to array of objects with column headers as keys
      const headers = data[0];
      const rows = data.slice(1).map((row: any) => {
        const obj: Record<string, any> = {};
        (headers as string[]).forEach((header: string, index: number) => {
          obj[header] = row[index];
        });
        return obj;
      });

      return { data: rows };
    } catch (error) {
      throw new Error(
        `Error reading Excel worksheet: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get list of all worksheets in the Excel file
   * @param buffer - Buffer containing Excel file data
   * @returns Promise resolving to an array of worksheet names
   */
  private async getWorksheets(buffer: Buffer): Promise<{ worksheets: string[] }> {
    try {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      return { worksheets: workbook.SheetNames };
    } catch (error) {
      throw new Error(
        `Error getting Excel worksheets: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
