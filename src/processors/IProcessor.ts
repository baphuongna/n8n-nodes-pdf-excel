/**
 * Interface for file processors
 * Defines the contract that all file processors must implement
 */
export interface IProcessor {
  /**
   * Process a file buffer with the specified operation
   * @param buffer - Buffer containing file data
   * @param operation - Operation to perform on the file
   * @param options - Additional options for processing
   * @returns Promise resolving to the processing result
   */
  process(
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
    worksheets?: any[];
    data?: any[];
  }>;
}
