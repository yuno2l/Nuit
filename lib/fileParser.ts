// Utility functions for parsing CVE files (TXT, CSV, XLSX)

export function parseTxtFile(content: string): string[] {
  // Extract CVE IDs from text file (format: CVE-YYYY-NNNNN)
  const cvePattern = /CVE-\d{4}-\d{4,}/gi;
  const matches = content.match(cvePattern);
  return matches ? [...new Set(matches.map(id => id.toUpperCase()))] : [];
}

export function parseCsvFile(content: string): string[] {
  const cvePattern = /CVE-\d{4}-\d{4,}/gi;
  const lines = content.split(/\r?\n/);
  const cveIds = new Set<string>();

  lines.forEach(line => {
    const matches = line.match(cvePattern);
    if (matches) {
      matches.forEach(id => cveIds.add(id.toUpperCase()));
    }
  });

  return Array.from(cveIds);
}

export async function parseExcelFile(file: File): Promise<string[]> {
  // For Excel files, we'll need to use a library
  // For now, convert to text and parse
  const text = await file.text();
  return parseTxtFile(text);
}

export async function parseUploadedFile(file: File): Promise<string[]> {
  const fileName = file.name.toLowerCase();
  const content = await file.text();

  if (fileName.endsWith('.txt')) {
    return parseTxtFile(content);
  } else if (fileName.endsWith('.csv')) {
    return parseCsvFile(content);
  } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
    // For Excel, we'll parse as text for now
    // In production, you'd use a library like xlsx
    return parseTxtFile(content);
  }

  throw new Error('Unsupported file format. Please use TXT, CSV, or XLSX.');
}

export function validateCveId(id: string): boolean {
  const cvePattern = /^CVE-\d{4}-\d{4,}$/i;
  return cvePattern.test(id);
}
