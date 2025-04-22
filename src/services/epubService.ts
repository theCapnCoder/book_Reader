import JSZip from "jszip";
import { EpubMetadata, EpubTocItem } from "../types/epub";

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

  /**
   * Extracts the Table of Contents (TOC) from an EPUB file.
   * Returns an array of EpubTocItem representing the TOC.
   */
  static async getBookToc(file: ArrayBuffer | File): Promise<EpubTocItem[] | null> {
    let arrayBuffer: ArrayBuffer;
    if (file instanceof File) {
      arrayBuffer = await file.arrayBuffer();
    } else {
      arrayBuffer = file;
    }

    const zip = await JSZip.loadAsync(arrayBuffer);
    const filesList = Object.keys(zip.files);
    const containerXml = await zip.file("META-INF/container.xml")?.async("string");
    if (!containerXml) return null;
    const opfPathMatch = containerXml.match(/full-path=["']([^"']+)["']/);
    if (!opfPathMatch) return null;
    const opfPath = opfPathMatch[1];
    const opfXml = await zip.file(opfPath)?.async("string");
    if (!opfXml) return null;

    // Find the NCX file path from the OPF XML
    const ncxHrefMatch = opfXml.match(/<item[^>]+href=["']([^"']+\.ncx)["'][^>]*>/i);
    let ncxPath = ncxHrefMatch ? ncxHrefMatch[1] : null;
    if (ncxPath) {
      // If the NCX path is relative, resolve it against the OPF path
      if (!/^[\/]/.test(ncxPath) && opfPath.includes("/")) {
        ncxPath = opfPath.substring(0, opfPath.lastIndexOf("/") + 1) + ncxPath;
      }
      const ncxXml = await zip.file(ncxPath)?.async("string");
      if (ncxXml) {
        // Use DOMParser for robust XML parsing
        const parser = new DOMParser();
        const ncxDoc = parser.parseFromString(ncxXml, "application/xml");
        const navPoints = Array.from(ncxDoc.querySelectorAll("navMap > navPoint"));
        const parseNavPoint = (navPoint: Element): EpubTocItem => {
          const label = navPoint.querySelector("navLabel > text")?.textContent || "";
          const href = navPoint.querySelector("content")?.getAttribute("src") || "";
          const children = Array.from(navPoint.querySelectorAll(":scope > navPoint")).map(parseNavPoint);
          return { label, href, children: children.length ? children : undefined };
        };
        const toc = navPoints.map(parseNavPoint);
        return toc;
      }
    }
    // Fallback: EPUB 3 nav.xhtml
    const navItemMatch = opfXml.match(/<item[^>]+properties=["'][^"']*nav[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>/i);
    let navPath = navItemMatch ? navItemMatch[1] : null;
    if (navPath) {
      if (!/^[\/]/.test(navPath) && opfPath.includes("/")) {
        navPath = opfPath.substring(0, opfPath.lastIndexOf("/") + 1) + navPath;
      }
      const navXhtml = await zip.file(navPath)?.async("string");
      if (navXhtml) {
        // Extract <nav>...</nav> block
        const navBlockMatch = navXhtml.match(/<nav[\s\S]*?<\/nav>/gi);
        if (!navBlockMatch) return null;
        // Find the TOC nav (with epub:type="toc")
        let tocNav = navBlockMatch.find(nav => /epub:type=["']toc["']/.test(nav));
        if (!tocNav) tocNav = navBlockMatch[0];
        // Extract <li>...</li> items recursively
        const extractListItems = (xml: string): EpubTocItem[] => {
          const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/g;
          const anchorRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/;
          const ulRegex = /<ul[^>]*>([\s\S]*?)<\/ul>/;
          const items: EpubTocItem[] = [];
          let match;
          while ((match = liRegex.exec(xml))) {
            const liContent = match[1];
            const anchorMatch = anchorRegex.exec(liContent);
            const label = anchorMatch ? anchorMatch[2] : "";
            const href = anchorMatch ? anchorMatch[1] : "";
            const ulMatch = ulRegex.exec(liContent);
            const children = ulMatch ? extractListItems(ulMatch[1]) : undefined;
            items.push({ label, href, children });
          }
          return items;
        };
        const toc = extractListItems(tocNav);
        return toc;
      }
    }
    return null;
  }
}
