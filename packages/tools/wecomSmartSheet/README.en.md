# WeCom Smart Sheet Plugin

A comprehensive management toolset for WeChat Work (WeCom) Smart Sheets designed for FastGPT workflows. It supports full lifecycle management from document creation to child sheets, views, fields, and records, offering both "Simple" and "Advanced" modes for different scenarios.

## Core Tool Categories

### 1. Document & Structure Management
- **Create Smart Sheet (`wecomSmartSheetDoc`)**: Create new smart sheet documents in a specified space.
- **Table Management (`wecomSmartSheetTable`)**: Manage sheets within documents (add, delete, update, and get sheet metadata).
- **View Management (`wecomSmartSheetView`)**: Add, delete, update, and query sheet views, covering grid, kanban, gallery, and other view types.

### 2. Field Management
- **Simple Fields (`wecomSmartSheetFieldSimple`)**: Create fields with dropdowns and straightforward inputs with automated schema normalization.
- **Advanced Fields (`wecomSmartSheetFieldAdvanced`)**: Full JSON configuration support for granular property and validation control.

### 3. Record Management
- **Simple Records (`wecomSmartSheetRecordSimple`)**: Directly pass key-value pairs (`Field Title: Value`) with automatic type mapping.
- **Advanced Records (`wecomSmartSheetRecordAdvanced`)**: Native WeCom record JSON format for batch operations and cell-level formatting.

## Configuration

No manual activation required. Simply provide the following parameters in your workflow:
1. **accessToken**: WeChat Work API access token.
2. **docid**: Target Smart Sheet document ID.
3. **sheet_id**: Target child sheet ID.

## Quick Start

1. **Create Document**: Use `wecomSmartSheetDoc` to create a new sheet.
2. **Manage Structure**: Build your data model with `wecomSmartSheetTable` and `wecomSmartSheetView`.
3. **Configure Fields**: Quick additions using `wecomSmartSheetFieldSimple`.
4. **Manipulate Records**: Routine entry and queries via `wecomSmartSheetRecordSimple`.

## API References

Built on official WeChat Work APIs:
- [Smart Sheet Overview](https://developer.work.weixin.qq.com/document/path/96601)
- [Create Document API](https://developer.work.weixin.qq.com/document/path/97464)
- [View Management API](https://developer.work.weixin.qq.com/document/path/100199)
