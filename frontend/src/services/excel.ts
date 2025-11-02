/**
 * Excel parsing utilities for prospect data extraction
 */
import * as XLSX from 'xlsx';

export interface ProspectRow {
  url: string;
  anrede: string;
  vorname: string;
  nachname: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  stadt: string;
}

const REQUIRED_COLUMNS = ['url', 'anrede', 'vorname', 'nachname', 'strasse', 'hausnummer', 'plz', 'stadt'];

/**
 * Parse Excel file and extract prospect data
 * @param file Excel file (XLSX, XLS, or CSV)
 * @returns Array of prospect rows
 */
export async function parseExcelFile(file: File): Promise<ProspectRow[]> {
  console.log('[Excel] Parsing file:', file.name);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Failed to read file'));
          return;
        }

        // Parse workbook
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          reject(new Error('Excel file has no sheets'));
          return;
        }

        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON array
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 'first',
          defval: '',
          raw: false
        });

        if (jsonData.length === 0) {
          reject(new Error('Excel file is empty or has no data rows'));
          return;
        }

        // Normalize column names (lowercase, trim)
        const normalizedData = jsonData.map((row: any) => {
          const normalized: any = {};
          Object.keys(row).forEach(key => {
            const normalizedKey = key.toLowerCase().trim();
            normalized[normalizedKey] = String(row[key] || '').trim();
          });
          return normalized;
        });

        // Validate and extract required columns
        const prospects: ProspectRow[] = [];
        const firstRow = normalizedData[0];
        const availableColumns = Object.keys(firstRow);

        // Check if all required columns exist
        const missingColumns = REQUIRED_COLUMNS.filter(col => !availableColumns.includes(col));
        if (missingColumns.length > 0) {
          reject(new Error(`Missing required columns: ${missingColumns.join(', ')}. Found columns: ${availableColumns.join(', ')}`));
          return;
        }

        // Extract prospect data
        for (let i = 0; i < normalizedData.length; i++) {
          const row = normalizedData[i];
          
          // Skip empty rows
          if (!row.url && !row.vorname && !row.nachname) {
            console.log('[Excel] Skipping empty row:', i + 1);
            continue;
          }

          // Validate required fields
          if (!row.url || !row.vorname || !row.nachname || !row.strasse || !row.plz || !row.stadt) {
            console.warn('[Excel] Skipping row with missing required fields:', i + 1, row);
            continue;
          }

          prospects.push({
            url: row.url,
            anrede: row.anrede || 'Herr', // Default value
            vorname: row.vorname,
            nachname: row.nachname,
            strasse: row.strasse,
            hausnummer: row.hausnummer || '', // Can be empty
            plz: row.plz,
            stadt: row.stadt
          });
        }

        if (prospects.length === 0) {
          reject(new Error('No valid prospect rows found in Excel file'));
          return;
        }

        console.log('[Excel] Successfully parsed', prospects.length, 'prospects from', jsonData.length, 'rows');
        resolve(prospects);
      } catch (error) {
        console.error('[Excel] Parsing error:', error);
        reject(error instanceof Error ? error : new Error('Failed to parse Excel file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    // Read file as binary string
    reader.readAsBinaryString(file);
  });
}

/**
 * Validate Excel file before parsing
 * @param file File to validate
 * @returns Validation result
 */
export function validateExcelFile(file: File): { valid: boolean; error?: string } {
  const validExtensions = ['.xlsx', '.xls', '.csv'];
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

  if (!validExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${validExtensions.join(', ')}`
    };
  }

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_SIZE / 1024 / 1024}MB`
    };
  }

  return { valid: true };
}

