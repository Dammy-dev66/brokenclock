import { parseMultipartUpload } from '../lib/upload.js';
import { UnsupportedFileTypeError, parseDocumentToText } from '../lib/parser.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
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
