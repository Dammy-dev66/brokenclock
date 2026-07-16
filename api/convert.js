import { parseMultipartUpload } from '../lib/upload.js';
import { UnsupportedFileTypeError, parseDocumentToText } from '../lib/parser.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, statusCode, payload) {
  setCorsHeaders(res);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, {
      success: false,
      error: 'Method not allowed. Use POST.',
    });
  }

  try {
    const uploadedFile = await parseMultipartUpload(req);
    const text = await parseDocumentToText(uploadedFile);

    return sendJson(res, 200, {
      success: true,
      filename: uploadedFile.filename,
      mimeType: uploadedFile.mimeType,
      text,
    });
  } catch (error) {
    if (error instanceof UnsupportedFileTypeError || error.statusCode === 400) {
      return sendJson(res, 400, {
        success: false,
        error: error.message,
      });
    }

    return sendJson(res, 500, {
      success: false,
      error: error.message || 'Unexpected server error.',
    });
  }
}
