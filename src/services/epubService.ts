import JSZip from "jszip";
import { EpubMetadata } from "../types/epub";

/**
 * Service for extracting metadata from EPUB files using JSZip.
 */
export class EpubService {
  /**
   * Extracts the book title from an EPUB file (as ArrayBuffer or File).
   * @param file - EPUB file as ArrayBuffer or File
   * @returns Book title (string) or null if not found
   */
  static async getBookTitle(file: ArrayBuffer | File): Promise<string | null> {
    let arrayBuffer: ArrayBuffer;
    if (file instanceof File) {
      arrayBuffer = await file.arrayBuffer();
    } else {
      arrayBuffer = file;
    }

    const zip = await JSZip.loadAsync(arrayBuffer);

    // Find the path to the content.opf file from META-INF/container.xml
    const containerXml = await zip.file("META-INF/container.xml")?.async("string");
    if (!containerXml) return null;
    const opfPathMatch = containerXml.match(/full-path=["']([^"']+)["']/);
    if (!opfPathMatch) return null;
    const opfPath = opfPathMatch[1];

    // Read the OPF file
    const opfXml = await zip.file(opfPath)?.async("string");
    if (!opfXml) return null;

    // Extract the title from the OPF XML
    const titleMatch = opfXml.match(/<dc:title[^>]*>([^<]*)<\/dc:title>/);
    return titleMatch ? titleMatch[1] : null;
  }
}
