import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { HttpError } from "../lib/httpError.js";

function pageText(items) {
  return items
    .map((item) => (item && typeof item.str === "string" ? item.str : ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function extractPdfText(buffer) {
  let doc;
  try {
    const task = getDocument({
      data: new Uint8Array(buffer),
      disableWorker: true,
      disableFontFace: true,
      isEvalSupported: false,
    });
    doc = await task.promise;
  } catch {
    throw new HttpError(400, "This PDF could not be read. Export it again or upload a text file.");
  }

  const pages = [];
  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push({ page: pageNumber, text: pageText(content.items) });
  }

  return {
    pageCount: doc.numPages,
    pages,
    text: pages.map((page) => page.text).filter(Boolean).join("\n"),
  };
}

export function extractPlainText(buffer) {
  const text = buffer.toString("utf8").replace(/^\uFEFF/, "");
  return {
    pageCount: 1,
    pages: [{ page: 1, text: text.trim() }],
    text,
  };
}
