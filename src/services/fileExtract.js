/**
 * Extract plain text from uploaded files in the browser.
 * PDF uses pdfjs-dist; txt/csv use FileReader.
 */

import * as pdfjs from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

let workerConfigured = false;

function ensurePdfWorker() {
  if (workerConfigured) return;
  workerConfigured = true;
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

/**
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function extractTextFromFile(file) {
  const name = file.name?.toLowerCase() || "";
  const type = file.type || "";

  if (type === "application/pdf" || name.endsWith(".pdf")) {
    return extractPdfText(file);
  }
  if (
    type.startsWith("text/") ||
    name.endsWith(".txt") ||
    name.endsWith(".csv")
  ) {
    return readFileAsText(file);
  }
  throw new Error(`Unsupported file type: ${type || name || "unknown"}`);
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result ?? ""));
    r.onerror = () => reject(r.error);
    r.readAsText(file);
  });
}

async function extractPdfText(file) {
  ensurePdfWorker();
  let doc;
  try {
    const buf = await file.arrayBuffer();
    doc = await pdfjs.getDocument({ data: buf }).promise;
  } catch (e) {
    const hint = e?.message || String(e);
    throw new Error(
      `Could not open PDF (${file.name}). ${hint}. If the file is password-protected, unlock it first.`
    );
  }
  const parts = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const line = content.items.map((i) => i.str || "").join(" ");
    parts.push(line);
  }
  const joined = parts.join("\n").trim();
  if (!joined) {
    throw new Error(
      "No selectable text found in this PDF. Scanned transcripts need OCR elsewhere first, or upload CSV/TXT."
    );
  }
  return joined;
}
