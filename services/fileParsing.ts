import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

// Set worker source for PDF.js explicitly to the CDN URL
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

export const parseFile = async (file: File): Promise<string> => {
  const fileType = file.name.split('.').pop()?.toLowerCase();

  switch (fileType) {
    case 'pdf':
      return await parsePdf(file);
    case 'docx':
      return await parseDocx(file);
    case 'doc':
      return await parseLegacyDoc(file);
    case 'xlsx':
    case 'xls':
      return await parseExcel(file);
    case 'txt':
    case 'md':
      return await parseText(file);
    default:
      throw new Error('Định dạng file không được hỗ trợ. Vui lòng dùng .pdf, .docx, .doc, .xlsx, .txt');
  }
};

const parseText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

const parsePdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += `--- Trang ${i} ---\n${pageText}\n\n`;
  }
  return fullText;
};

const parseDocx = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

/**
 * Handles .doc (binary Word 97-2003) files.
 * Browser-side JS libraries (like mammoth) cannot natively parse binary .doc files accurately.
 * Strategy:
 * 1. Attempt to read as DOCX first (in case user renamed it).
 * 2. Fallback: Read as binary string and extract readable character sequences (Regex).
 */
const parseLegacyDoc = async (file: File): Promise<string> => {
  try {
    // Attempt 1: Try Mammoth (maybe it is a docx renamed to doc)
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (e) {
    // Attempt 2: "Dirty" Binary Extraction
    // This is a fallback to recover text from binary files without a backend server.
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const raw = e.target?.result as string;
            // Filter for sequences of readable characters (Vietnamese + English + Numbers + Punctuation)
            // Range \u00C0-\u1EF9 covers most Vietnamese chars.
            // We only keep sequences longer than 4 chars to remove binary noise.
            const regex = /[A-Za-z0-9\s\.,;:\-\_\(\)\"\'\u00C0-\u1EF9\u1E00-\u1EFF\/\\%&+]{4,}/g;
            const matches = raw.match(regex);
            
            if (matches && matches.length > 0) {
                const cleanedText = matches.join('\n');
                resolve(`[WARNING: Nội dung được trích xuất từ file .doc nhị phân. Định dạng có thể không chính xác]\n\n${cleanedText}`);
            } else {
                reject(new Error("Không thể đọc nội dung file .doc này. Vui lòng chuyển sang định dạng .docx"));
            }
        };
        reader.onerror = () => reject(new Error("Lỗi đọc file"));
        // Read as binary string (safe for Latin1/Windows-1258 common in older docs)
        reader.readAsBinaryString(file); 
    });
  }
};

const parseExcel = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  let fullText = '';

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const text = XLSX.utils.sheet_to_txt(sheet);
    fullText += `--- Sheet: ${sheetName} ---\n${text}\n\n`;
  });
  return fullText;
};