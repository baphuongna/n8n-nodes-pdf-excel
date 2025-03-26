# Technical Context

## Development Environment

- Node.js v18 trở lên
- TypeScript
- N8N node development tools
- VSCode IDE

## Core Dependencies

### PDF Processing

1. pdf-parse

   - Version: ^1.1.1
   - Stable và được maintain thường xuyên
   - Support cả browser và Node.js

2. @pdf-lib/core
   - Version: ^1.17.1
   - Performance tốt với file lớn
   - API đơn giản và linh hoạt

### Excel Processing

1. xlsx

   - Version: ^0.18.5
   - Hỗ trợ nhiều định dạng (.xls, .xlsx, .csv)
   - Community lớn và active

2. exceljs
   - Version: ^4.3.0
   - High performance
   - Support streaming cho file lớn

### Testing

1. Jest for unit testing
2. ts-jest for TypeScript support
3. n8n testing utilities

## Project Structure

```
src/
├── nodes/
│   ├── PdfExcelNode/
│   │   ├── PdfExcelNode.node.ts
│   │   ├── PdfExcelNode.types.ts
│   │   └── methods/
│   │       ├── processExcel.ts
│   │       └── processPdf.ts
├── utils/
│   ├── fileHandlers/
│   ├── validators/
│   └── transformers/
└── tests/
    ├── unit/
    └── integration/
```

## Code Quality Tools

1. ESLint with n8n config
2. Prettier
3. TypeScript strict mode
4. Husky for git hooks

## Build & Deployment

1. TypeScript compilation
2. Webpack bundling
3. npm publishing
4. GitHub Actions CI/CD

## Performance Requirements

1. Memory efficient processing
2. Streaming support cho file lớn
3. Concurrent processing capabilities
4. Caching khi cần thiết

## Security Considerations

1. Input validation
2. File size limits
3. Memory usage monitoring
4. Safe file handling

## Documentation

1. README.md
2. API documentation
3. Usage examples
4. Contributing guidelines

## Version Control

1. Git repository
2. Semantic versioning
3. Change log
4. Release notes
