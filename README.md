# n8n-nodes-pdf-excel

N8N node for processing PDF and Excel files with advanced features including OCR and form handling.

## Features

### PDF Processing

- **Basic Features**:
  - Extract text from PDF files
  - Get metadata information
  - Process files from path or binary data
- **Advanced Features** (new):
  - OCR text extraction using Tesseract.js
  - PDF form field processing
  - Support for multiple languages (English, Vietnamese)
  - Memory efficient processing

### Excel Processing

- **Read Worksheet**: Read data from specific worksheet
- **Get Worksheets**: List all worksheets in file
- **Multiple Formats**: Support for .xls and .xlsx formats
- **Data Validation**: Basic data validation for cell values

## Requirements

- Node.js v18+
- n8n v1.0+
- TypeScript v5.0+

New dependencies:

- Tesseract.js for OCR
- pdf-lib for form processing

## Installation

### In n8n

1. Go to **Settings > Community Nodes**
2. Select **Install a node from npm registry**
3. Enter `n8n-nodes-pdf-excel`
4. Click Install

### Manual Installation

```bash
# Install with dependencies
npm install n8n-nodes-pdf-excel tesseract.js pdf-lib

# Or link for development
npm link n8n-nodes-pdf-excel
```

## Usage

### Basic PDF Processing

1. Add "PDF & Excel Processor" node
2. Select "PDF" as file type
3. Choose operation:
   - Extract Text
   - Get Metadata
4. Provide file path or binary data
5. Execute node

### Advanced PDF Features (New)

1. Add "PDF & Excel Processor" node
2. Select "PDF Advanced" as file type
3. Choose operation:
   - Extract Text with OCR
   - Process Form Fields
4. Optional: Configure OCR settings
5. Execute node

### Excel Processing

1. Add "PDF & Excel Processor" node
2. Select "Excel" as file type
3. Choose operation:
   - Read Worksheet
   - Get Worksheets
4. For worksheet reading:
   - Specify sheet name (optional)
5. Execute node

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
- [x] Advanced PDF features (OCR, forms)
- [ ] Advanced Excel features (formulas, styling)
- [x] Performance optimizations

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines for details.
