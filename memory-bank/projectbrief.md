# N8N PDF and Excel Node Project Brief

## Project Overview

Phát triển một custom node cho n8n để đọc và xử lý:

- File PDF từ đường dẫn hoặc binary data
- Trích xuất dữ liệu từ các file Excel
- Trả về nội dung đã xử lý dưới dạng cấu trúc

## Core Requirements

### Functional Requirements

1. Xử lý input file PDF:

   - Từ file path
   - Từ binary data
   - Hỗ trợ nhiều định dạng PDF khác nhau

2. Xử lý file Excel:

   - Đọc dữ liệu từ các sheet
   - Hỗ trợ các định dạng .xls, .xlsx
   - Xử lý các kiểu dữ liệu phổ biến (text, number, date)

3. Output:
   - Trả về nội dung đã được xử lý
   - Định dạng dữ liệu phù hợp để sử dụng trong workflow

### Technical Requirements

1. Tuân thủ cấu trúc và conventions của n8n node
2. Tương thích với các phiên bản n8n khác nhau (cloud & local)
3. Xử lý lỗi và validation đầy đủ
4. Tối ưu hiệu năng xử lý file lớn

## Success Criteria

1. Node hoạt động ổn định trên môi trường n8n
2. Xử lý được các file PDF và Excel với độ chính xác cao
3. Code được viết theo best practices và có documentation đầy đủ
4. Dễ dàng mở rộng và bảo trì
