import "server-only";
import { ParseSpeeds, PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import { fingerprint, maskEmail, toWinAnsi } from "./fingerprint";

export interface Buyer {
  name: string;
  email: string;
  orderId: string;
  purchasedAt: string;
}

/**
 * Returns a new PDF with a visible footer, a faint repeating diagonal
 * watermark, metadata and an invisible per-order fingerprint on every page.
 * The original bytes are never returned.
 */
export async function stampPdf(original: Uint8Array, buyer: Buyer): Promise<Uint8Array> {
  const doc = await PDFDocument.load(original, { updateMetadata: false, parseSpeed: ParseSpeeds.Fastest });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fp = fingerprint(buyer.orderId);

  const name = toWinAnsi(buyer.name).slice(0, 60);
  const orderId = toWinAnsi(buyer.orderId);
  const footer = `Licensed to ${name} · ${toWinAnsi(maskEmail(buyer.email))} · Order ${orderId}`;
  const mark = `${orderId} · ${name}`;

  const footerSize = 7;
  const markSize = 22;
  const markWidth = font.widthOfTextAtSize(mark, markSize);

  // The watermark is built once per page size as a reusable form XObject, so
  // 40 pages cost 40 cheap draw calls instead of hundreds of text operators.
  const layers = new Map<string, Awaited<ReturnType<typeof doc.embedPage>>>();
  async function watermarkLayer(width: number, height: number) {
    const key = `${Math.round(width)}x${Math.round(height)}`;
    const hit = layers.get(key);
    if (hit) return hit;
    const tmp = await PDFDocument.create();
    const tmpFont = await tmp.embedFont(StandardFonts.Helvetica);
    const tp = tmp.addPage([width, height]);
    const stepX = markWidth + 90;
    const stepY = 260;
    for (let y = -height * 0.2; y < height * 1.1; y += stepY) {
      const offset = (Math.round(y / stepY) % 2) * (stepX / 2);
      for (let x = -width * 0.2 + offset; x < width * 1.0; x += stepX) {
        tp.drawText(mark, {
          x,
          y,
          size: markSize,
          font: tmpFont,
          color: rgb(0.5, 0.5, 0.5),
          opacity: 0.1,
          rotate: degrees(35),
        });
      }
    }
    const embedded = await doc.embedPage(tp);
    layers.set(key, embedded);
    return embedded;
  }

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    page.drawPage(await watermarkLayer(width, height), { x: 0, y: 0, width, height });

    // Footer on a faint strip so it stays readable on any background.
    const fw = font.widthOfTextAtSize(footer, footerSize);
    page.drawRectangle({
      x: Math.max(0, (width - fw) / 2 - 6),
      y: 8,
      width: Math.min(width, fw + 12),
      height: 13,
      color: rgb(1, 1, 1),
      opacity: 0.75,
    });
    page.drawText(footer, {
      x: Math.max(4, (width - fw) / 2),
      y: 12,
      size: footerSize,
      font,
      color: rgb(0.25, 0.25, 0.25),
    });

    // Invisible fingerprint: 1pt, near-zero opacity, tucked in the top corner.
    page.drawText(`fp:${fp}`, {
      x: 2,
      y: height - 3,
      size: 1,
      font,
      color: rgb(1, 1, 1),
      opacity: 0.02,
    });
  }

  doc.setTitle(`NNG Store worksheet - ${orderId}`);
  doc.setAuthor("NNG Store");
  doc.setSubject(`Licensed copy, order ${orderId}`);
  doc.setKeywords([`fp:${fp}`, `order:${orderId}`, `purchased:${toWinAnsi(buyer.purchasedAt)}`]);
  doc.setProducer("NNG Store");
  doc.setCreator("NNG Store");

  return doc.save({ useObjectStreams: false });
}
