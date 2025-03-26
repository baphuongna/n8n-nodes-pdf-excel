# n8n-nodes-pdf-excel

N8N node for processing PDF and Excel files with advanced features.

## Features

### PDF Processing

- **Extract Text**: Extract all text content from PDF files (basic implementation)
- **Get Metadata**: Retrieve metadata information from PDF files
- **File Path Support**: Process PDF from file path or binary data
- **Error Handling**: Basic error handling for invalid files

### Excel Processing

- **Read Worksheet**: Read data from specific worksheet in Excel files
- **Get Worksheets**: List all worksheets in Excel file  
- **Multiple Formats**: Support for .xls and .xlsx formats
- **Data Validation**: Basic data validation for cell values

## Requirements

- Node.js v18+
- n8n v1.0+
- TypeScript v5.0+

## Installation

### In n8n

1. Go to **Settings > Community Nodes**
2. Select **Install a node from npm registry**
3. Enter `n8n-nodes-pdf-excel`
4. Click Install

### Manual Installation

```bash
npm install n8n-nodes-pdf-excel
# or
npm link n8n-nodes-pdf-excel
```

## Usage

### PDF Processing Example

1. Add "PDF & Excel Processor" node
2. Select "PDF" as file type  
3. Choose operation:
   - Extract Text
   - Get Metadata
4. Provide file path or binary data
5. Execute node

### Excel Processing Example

1. Add "PDF & Excel Processor" node
2. Select "Excel" as file type
3. Choose operation:
   - Read Worksheet
   - Get Worksheets  
4. For worksheet reading:
   - Specify sheet name (optional)
5. Provide file path or binary data
6. Execute node

## Development

### Setup

```bash
git clone https://github.com/your-repo/n8n-nodes-pdf-excel.git
cd n8n-nodes-pdf-excel
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Lint

```bash  
npm run lint
```

## Roadmap

- [x] Basic PDF text extraction
- [x] Basic Excel data reading
- [ ] Advanced PDF features (OCR, forms)
- [ ] Advanced Excel features (formulas, styling)
- [ ] Performance optimizations

## License

MIT License
