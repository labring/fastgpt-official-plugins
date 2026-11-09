# DocDiff Document Comparison Tool

A FastGPT tool for comparing differences between two Markdown documents and generating a visual HTML diff report.

## Features

- 📝 **Line-level Diff**: Line-by-line analysis for precise change identification
- 🎨 **Visual Report**: Generates an aesthetic side-by-side HTML comparison report
- 🔄 **Change Navigation**: Jump between changes using buttons or keyboard shortcuts
- 📊 **Change Statistics**: Shows counts of added, deleted, modified, and unchanged lines
- 🔒 **Security Protection**: Automatic HTML entity escaping to prevent XSS attacks
- 📱 **Responsive Design**: Mobile-friendly layout
- ⚡ **High Performance**: Smart character-level similarity matching algorithm

## Usage

### Inputs

- **originalText** (required): Original Markdown document content
- **modifiedText** (required): Modified Markdown document content
- **title** (optional): Title of the comparison report (defaults to "Document Comparison Report")

### Outputs

Returns an HTML file URL containing:
- Document title and generation timestamp
- Change statistics overview
- Side-by-side comparison view (left: original, right: modified)
- Interactive navigation controls
- Responsive layout support

## Comparison Algorithm

The tool uses a similarity matching algorithm:
1. **Line Splitting**: Divides documents by newline characters
2. **Similarity Computation**: Character-level similarity evaluation
3. **Change Categorization**:
   - Unchanged (>80% similarity)
   - Modified (10% - 80% similarity)
   - Added (exists only in modified document)
   - Deleted (exists only in original document)
4. **Best Match**: Pairs up the most similar lines
