export interface EpubTocItem {
  label: string;
  href: string;
  children?: EpubTocItem[];
}

export interface EpubMetadata {
  title: string | null;
  toc?: EpubTocItem[];
}
