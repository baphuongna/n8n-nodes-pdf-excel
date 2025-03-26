import { IExecuteFunctions } from "n8n-workflow";
import {
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeConnectionType,
} from "n8n-workflow";

import { ProcessorFactory } from "../../processors/ProcessorFactory";

export class PdfExcelNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: "PDF & Excel Processor",
    name: "pdfExcelProcessor",
    group: ["transform"],
    version: 1,
    description: "Process PDF and Excel files",
    defaults: {
      name: "PDF & Excel Processor",
    },
    inputs: ["main" as NodeConnectionType],
    outputs: ["main" as NodeConnectionType],
    properties: [
      {
        displayName: "File Type",
        name: "fileType",
        type: "options",
        options: [
          {
            name: "PDF",
            value: "pdf",
          },
          {
            name: "Excel",
            value: "excel",
          },
        ],
        default: "pdf",
        description: "Type of file to process",
      },
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        displayOptions: {
          show: {
            fileType: ["pdf"],
          },
        },
        options: [
          {
            name: "Extract Text",
            value: "extractText",
            description: "Extract text from PDF",
          },
          {
            name: "Extract Text with OCR",
            value: "extractTextWithOCR",
            description: "Extract text from image-based PDF using OCR",
          },
          {
            name: "Get Metadata",
            value: "getMetadata",
            description: "Get PDF metadata",
          },
        ],
        default: "extractText",
        description: "Operation to perform on PDF",
      },
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        displayOptions: {
          show: {
            fileType: ["excel"],
          },
        },
        options: [
          {
            name: "Read Worksheet",
            value: "readWorksheet",
            description: "Read data from worksheet",
          },
          {
            name: "Get Worksheets",
            value: "getWorksheets",
            description: "Get list of worksheets",
          },
        ],
        default: "readWorksheet",
        description: "Operation to perform on Excel",
      },
      {
        displayName: "Binary Property",
        name: "binaryPropertyName",
        type: "string",
        default: "data",
        required: true,
        description: "Name of the binary property containing the file data",
      },
      {
        displayName: "Worksheet Name",
        name: "worksheetName",
        type: "string",
        displayOptions: {
          show: {
            fileType: ["excel"],
            operation: ["readWorksheet"],
          },
        },
        default: "Sheet1",
        description: "Name of the worksheet to read",
      },
      {
        displayName: "OCR Language",
        name: "language",
        type: "options",
        options: [
          {
            name: "English",
            value: "eng",
          },
          {
            name: "Vietnamese",
            value: "vie",
          },
          {
            name: "French",
            value: "fra",
          },
          {
            name: "German",
            value: "deu",
          },
          {
            name: "Spanish",
            value: "spa",
          },
          {
            name: "Chinese (Simplified)",
            value: "chi_sim",
          },
          {
            name: "Japanese",
            value: "jpn",
          },
        ],
        displayOptions: {
          show: {
            fileType: ["pdf"],
            operation: ["extractTextWithOCR"],
          },
        },
        default: "eng",
        description: "Language to use for OCR",
      },
      {
        displayName: "Fallback to OCR",
        name: "fallbackToOCR",
        type: "boolean",
        displayOptions: {
          show: {
            fileType: ["pdf"],
            operation: ["extractText"],
          },
        },
        default: false,
        description: "Whether to fallback to OCR if standard text extraction fails",
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const fileType = this.getNodeParameter("fileType", i) as string;
        const operation = this.getNodeParameter("operation", i) as string;
        const binaryPropertyName = this.getNodeParameter("binaryPropertyName", i) as string;

        // Ensure binary property exists and handle TypeScript undefined check
        if (!items[i].binary) {
          throw new NodeOperationError(this.getNode(), "No binary data found", {
            itemIndex: i,
          });
        }

        // Since we've already checked that items[i].binary exists, we can safely assert its type
        const binary = items[i].binary as Record<string, any>;
        if (!binary[binaryPropertyName]) {
          throw new NodeOperationError(
            this.getNode(),
            `Binary property '${binaryPropertyName}' not found`,
            { itemIndex: i }
          );
        }

        const binaryData = binary[binaryPropertyName];

        // Validate that binaryData has the required 'data' property
        if (!binaryData || !binaryData.data) {
          throw new NodeOperationError(
            this.getNode(),
            `Binary data in property '${binaryPropertyName}' is invalid or missing data content`,
            { itemIndex: i }
          );
        }

        // Create buffer from binary data with proper error handling
        let buffer;
        try {
          buffer = Buffer.from(binaryData.data, "base64");
        } catch (bufferError) {
          throw new NodeOperationError(
            this.getNode(),
            `Failed to create buffer from binary data: ${
              bufferError instanceof Error ? bufferError.message : String(bufferError)
            }`,
            { itemIndex: i }
          );
        }

        // Use factory pattern to get the appropriate processor
        const processor = ProcessorFactory.getProcessor(fileType);
        let result;

        if (fileType === "pdf") {
          // Get OCR options if applicable
          const options: Record<string, any> = {};

          if (operation === "extractTextWithOCR") {
            options.language = this.getNodeParameter("language", i) as string;
          } else if (operation === "extractText") {
            options.fallbackToOCR = this.getNodeParameter("fallbackToOCR", i, false) as boolean;
            if (options.fallbackToOCR) {
              // Default language for fallback OCR
              options.language = "eng";
            }
          }

          result = await processor.process(buffer, operation, options);
        } else if (fileType === "excel") {
          const worksheetName =
            operation === "readWorksheet"
              ? (this.getNodeParameter("worksheetName", i) as string)
              : undefined;
          result = await processor.process(buffer, operation, {
            worksheetName,
          });
        }

        const newItem: INodeExecutionData = {
          json: {
            ...items[i].json,
            pdfResults: {
              ...result,
              operation,
              success: true,
              timestamp: new Date().toISOString(),
            },
          },
          binary: items[i].binary || {},
        };

        returnData.push(newItem);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error instanceof Error ? error.message : String(error),
            },
            binary: items[i].binary || {},
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
