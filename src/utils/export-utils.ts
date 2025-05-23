import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export function exportToCsv(data: any[]): string {
  if (!data || data.length === 0) return '';
  
  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  let csvContent = headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(item => {
    const row = headers.map(header => {
      // Handle nested objects and arrays
      let value = item[header];
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      // Escape quotes and wrap in quotes if contains comma or newline
      if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvContent += row.join(',') + '\n';
  });
  
  return csvContent;
}

// Ensure reports directory exists
const REPORTS_DIR = path.join(process.cwd(), 'reports');
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

export type ExportFormat = 'json' | 'csv' | 'txt';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  data: any;
}

export function exportReport(options: ExportOptions): string {
  const { format, data, filename = `report-${Date.now()}` } = options;
  const filePath = path.join(REPORTS_DIR, `${filename}.${format}`);
  let content = '';

  try {
    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        break;
      case 'csv':
        content = convertToCSV(data);
        break;
      case 'txt':
      default:
        content = convertToText(data);
        break;
    }

    fs.writeFileSync(filePath, content, 'utf8');
    return filePath;
  } catch (error) {
    console.error('Error exporting report:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    throw new Error(`Failed to export report: ${errorMessage}`);
  }
}

function convertToCSV(data: any): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  const rows = [];

  // Add header row
  rows.push(headers.join(','));

  // Add data rows
  for (const item of data) {
    const row = headers.map(header => {
      const value = item[header];
      // Escape quotes and wrap in quotes if contains comma or newline
      if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    });
    rows.push(row.join(','));
  }

  return rows.join('\n');
}

function convertToText(data: any): string {
  if (Array.isArray(data)) {
    if (data.length === 0) return 'No data available';

    // If it's an array of objects, format as a table
    if (typeof data[0] === 'object' && data[0] !== null) {
      const headers = Object.keys(data[0]);
      const rows = data.map(item =>
        headers.map(header => item[header] ?? '')
      );

      // Calculate column widths
      const colWidths = headers.map((header, i) => {
        const maxContentLength = Math.max(
          String(header).length,
          ...rows.map(row => String(row[i] || '').length)
        );
        return Math.min(maxContentLength, 30); // Cap width at 30 chars
      });

      // Format header
      const headerRow = headers
        .map((header, i) =>
          String(header).padEnd(colWidths[i]).substring(0, colWidths[i])
        )
        .join(' | ');

      // Add separator
      const separator = colWidths.map(width => '-'.repeat(width)).join('-+-');

      // Format rows
      const formattedRows = rows.map(row =>
        row
          .map((cell, i) =>
            String(cell || '').padEnd(colWidths[i]).substring(0, colWidths[i])
          )
          .join(' | ')
      );

      return [headerRow, separator, ...formattedRows].join('\n');
    }

    // Simple array
    return data.join('\n');
  }

  // Single object
  if (typeof data === 'object' && data !== null) {
    return Object.entries(data)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }

  // Primitive value
  return String(data);
}
