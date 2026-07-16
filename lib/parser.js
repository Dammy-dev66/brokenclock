import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

const DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const PDF_MIME_TYPE = 'application/pdf';
const TXT_MIME_TYPE = 'text/plain';

export class UnsupportedFileTypeError extends Error {
  constructor(message = 'Unsupported file type.') {
    super(message);
    this.name = 'UnsupportedFileTypeError';
  }
}

function normalizeMimeType(mimeType = '') {
  return mimeType.split(';')[0].trim().toLowerCase();
}

async function parseDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function parsePdf(buffer) {
  const result = await pdfParse(buffer);

  if (!result.text || result.text.trim().length === 0) {
    throw new Error('No extractable text found. Scanned PDFs and OCR are not supported.');
  }

  return result.text;
}

function parseTxt(buffer) {
  return buffer.toString('utf8');
}

export async function parseDocumentToText({ buffer, mimeType }) {
  const normalizedMimeType = normalizeMimeType(mimeType);

  switch (normalizedMimeType) {
    case DOCX_MIME_TYPE:
      return parseDocx(buffer);
    case PDF_MIME_TYPE:
      return parsePdf(buffer);
    case TXT_MIME_TYPE:
      return parseTxt(buffer);
    default:
      throw new UnsupportedFileTypeError();
  }
}
