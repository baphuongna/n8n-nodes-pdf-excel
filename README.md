# n8n-nodes-pdf-excel

This is a node for [n8n](https://n8n.io/) that provides functionality for processing PDF and Excel files.

## Features

### PDF Processing

- **Extract Text**: Extract all text content from PDF files
- **Get Metadata**: Retrieve metadata information from PDF files

### Excel Processing

- **Read Worksheet**: Read data from a specific worksheet in an Excel file
- **Get Worksheets**: Get a list of all worksheets in an Excel file

## Installation

### In n8n

Go to **Settings > Community Nodes > Install a node from the npm registry** and enter `n8n-nodes-pdf-excel`

### Manually

1. Clone this repository
2. Navigate to the directory: `cd n8n-nodes-pdf-excel`
3. Install dependencies: `npm install`
4. Build the code: `npm run build`
5. Link to n8n: `npm link`
6. In your n8n installation directory: `npm link n8n-nodes-pdf-excel`

## Usage

### PDF Processor

1. Add the "PDF & Excel Processor" node to your workflow
2. Select "PDF" as the file type
3. Choose the operation (Extract Text or Get Metadata)
4. Specify the binary property containing the PDF data
5. Execute the node

### Excel Processor

1. Add the "PDF & Excel Processor" node to your workflow
2. Select "Excel" as the file type
3. Choose the operation (Read Worksheet or Get Worksheets)
4. For "Read Worksheet", specify the worksheet name (defaults to first sheet)
5. Specify the binary property containing the Excel data
6. Execute the node

## Development

### Build

```
npm run build
```

### Development Mode

```
npm run dev
```

### Lint

```
npm run lint
```

## License

MIT
