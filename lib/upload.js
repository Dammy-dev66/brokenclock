import Busboy from 'busboy';

const REQUIRED_FIELD_NAME = 'uploaded_document';
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

class UploadError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UploadError';
    this.statusCode = 400;
  }
}

function normalizeFileInfo(info = {}) {
  return {
    filename: info.filename || 'uploaded_document',
    mimeType: info.mimeType || info.mime || 'application/octet-stream',
  };
}

export function parseMultipartUpload(req) {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'] || '';

    if (!contentType.toLowerCase().startsWith('multipart/form-data')) {
      reject(new UploadError('Request must be multipart/form-data.'));
      return;
    }

    let resolved = false;
    let foundRequiredFile = false;

    const busboy = Busboy({
      headers: req.headers,
      limits: {
        files: 1,
        fileSize: MAX_FILE_SIZE_BYTES,
      },
    });

    busboy.on('file', (fieldName, fileStream, info) => {
      const fileInfo = normalizeFileInfo(info);

      if (fieldName !== REQUIRED_FIELD_NAME) {
        fileStream.resume();
        return;
      }

      foundRequiredFile = true;
      const chunks = [];
      let limitReached = false;

      fileStream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      fileStream.on('limit', () => {
        limitReached = true;
      });

      fileStream.on('error', (error) => {
        reject(error);
      });

      fileStream.on('end', () => {
        if (resolved) {
          return;
        }

        if (limitReached) {
          resolved = true;
          reject(new UploadError('Uploaded file is too large.'));
          return;
        }

        const buffer = Buffer.concat(chunks);

        if (buffer.length === 0) {
          resolved = true;
          reject(new UploadError('Uploaded file is empty.'));
          return;
        }

        resolved = true;
        resolve({
          filename: fileInfo.filename,
          mimeType: fileInfo.mimeType,
          buffer,
        });
      });
    });

    busboy.on('filesLimit', () => {
      if (!resolved) {
        resolved = true;
        reject(new UploadError('Only one uploaded_document file is allowed.'));
      }
    });

    busboy.on('error', (error) => {
      if (!resolved) {
        resolved = true;
        reject(error);
      }
    });

    busboy.on('finish', () => {
      if (!resolved && !foundRequiredFile) {
        resolved = true;
        reject(new UploadError('Missing uploaded_document file.'));
      }
    });

    req.pipe(busboy);
  });
}
