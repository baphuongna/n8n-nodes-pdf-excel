# System Patterns

## Architecture Overview

### Core Components

1. PDF Processor

   - Input handlers (file path/binary)
   - PDF parsing engine
   - Text extraction module
   - Error handling layer

2. Excel Processor

   - Sheet reader
   - Data formatter
   - Cell type handler
   - Validation layer

3. Common Utilities
   - File validation
   - Data transformation
   - Error handling
   - Response formatting

## Design Patterns

### Factory Pattern

- Tạo các processor instances dựa trên file type
- Đảm bảo extensibility cho các file types mới

### Strategy Pattern

- Xử lý các định dạng file khác nhau
- Linh hoạt trong việc thêm strategy mới

### Observer Pattern

- Theo dõi và report progress khi xử lý file lớn
- Emit events cho logging và monitoring

### Builder Pattern

- Xây dựng output objects theo cấu trúc
- Customize output format dựa trên configuration

## Technical Architecture

### Input Layer

```
[File Input] -> [Validator] -> [Processor Factory]
```

### Processing Layer

```
[Processor] -> [Parser] -> [Extractor] -> [Formatter]
```

### Output Layer

```
[Data Builder] -> [Validator] -> [Response]
```

## Error Handling

1. Validation Errors

   - File format
   - Size limits
   - Content validation

2. Processing Errors

   - Corrupt files
   - Unsupported features
   - Memory issues

3. System Errors
   - IO operations
   - Network issues
   - Resource limits

## Performance Considerations

1. Streaming large files
2. Memory management
3. Concurrent processing
4. Caching strategies

## Security Patterns

1. Input validation
2. File sanitization
3. Resource limits
4. Access control
