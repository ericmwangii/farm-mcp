export function exportToCsv(data: any[]): string {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);

  let csvContent = headers.join(',') + '\n';

  data.forEach(item => {
    const row = headers.map(header => {
      let value = item[header];
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvContent += row.join(',') + '\n';
  });

  return csvContent;
}


export type ExportFormat = 'json' | 'csv' | 'txt';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  data: any;
}

export function exportReport(options: ExportOptions): { content: string; filename: string } {
  const { format, data, filename = `report-${Date.now()}` } = options;
  let content = '';

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

  return {
    content,
    filename: `${filename}.${format}`
  };
}

function convertToCSV(data: any): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const rows = [];


  rows.push(headers.join(','));


  for (const item of data) {
    const row = headers.map(header => {
      const value = item[header];
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

    if (typeof data[0] === 'object' && data[0] !== null) {
      const headers = Object.keys(data[0]);
      const rows = data.map(item =>
        headers.map(header => item[header] ?? '')
      );

      const colWidths = headers.map((header, i) => {
        const maxContentLength = Math.max(
          String(header).length,
          ...rows.map(row => String(row[i] || '').length)
        );
        return Math.min(maxContentLength, 30);
      });


      const headerRow = headers
        .map((header, i) =>
          String(header).padEnd(colWidths[i]).substring(0, colWidths[i])
        )
        .join(' | ');


      const separator = colWidths.map(width => '-'.repeat(width)).join('-+-');


      const formattedRows = rows.map(row =>
        row
          .map((cell, i) =>
            String(cell || '').padEnd(colWidths[i]).substring(0, colWidths[i])
          )
          .join(' | ')
      );

      return [headerRow, separator, ...formattedRows].join('\n');
    }


    return data.join('\n');
  }


  if (typeof data === 'object' && data !== null) {
    return Object.entries(data)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }


  return String(data);
}
