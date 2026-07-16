# Proofreading Document-to-Text API

A small Vercel Serverless Function that receives one uploaded document and returns extracted plain text.

The API has one responsibility only: convert supported uploaded documents into plain text.

## Supported File Types

- `.docx` using MIME type `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `.pdf` using MIME type `application/pdf`
- `.txt` using MIME type `text/plain`

File type is detected from the MIME type, not the file extension.

Scanned PDFs and OCR are not supported.

## Project Structure

```text
proofreading-api/
  api/
    convert.js
  lib/
    upload.js
    parser.js
  package.json
  .gitignore
  README.md
```

## Installation

```bash
npm install
```

## Running Locally

Install or run the Vercel CLI, then start the local development server:

```bash
vercel dev
```

The endpoint will be available at:

```text
POST /api/convert
```

## API Usage

The endpoint accepts `multipart/form-data`.

The uploaded file field name must be:

```text
uploaded_document
```

## Example curl Request

```bash
curl -X POST http://localhost:3000/api/convert \
  -F "uploaded_document=@Essay.docx;type=application/vnd.openxmlformats-officedocument.wordprocessingml.document"
```

For a text file:

```bash
curl -X POST http://localhost:3000/api/convert \
  -F "uploaded_document=@notes.txt;type=text/plain"
```

For a text-based PDF:

```bash
curl -X POST http://localhost:3000/api/convert \
  -F "uploaded_document=@Essay.pdf;type=application/pdf"
```

## Example Success Response

```json
{
  "success": true,
  "filename": "Essay.docx",
  "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text": "The extracted plain text..."
}
```

## Example Unsupported File Response

```json
{
  "success": false,
  "error": "Unsupported file type."
}
```

## Deployment to GitHub

Create a GitHub repository, then push this project:

```bash
git init
git add .
git commit -m "Initial document conversion API"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

## Deployment to Vercel

1. Import the GitHub repository into Vercel.
2. Use the default Vercel settings.
3. Deploy.

After deployment, the API will be available at:

```text
https://YOUR_PROJECT.vercel.app/api/convert
```

## Notes

- This project does not include word counting, pricing, Stripe, authentication, databases, Google Drive, OpenAI, OCR, email, logging systems, proofreading business logic, frontend code, or HTML pages.
- The API returns plain text only.
