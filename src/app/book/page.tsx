"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EpubService } from "../../services/epubService";
import { EpubTocItem } from "../../types/epub";
import { translateText } from "../../services/translationService";

export default function Book() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bookTitle, setBookTitle] = useState<string | null>(null);
  const [toc, setToc] = useState<EpubTocItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [chapterContent, setChapterContent] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const hrefParam = searchParams.get("href");
  const [selectedChapter, setSelectedChapter] = useState<EpubTocItem | null>(null);
  const [translations, setTranslations] = useState<{ [idx: number]: string }>({});
  const [loadingIndices, setLoadingIndices] = useState<Set<number>>(new Set());

  // Reset all state on file change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setBookTitle(null);
    setToc(null);
    setFile(null);
    setChapterContent(null);
    setSelectedChapter(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);
    try {
      const [title, toc] = await Promise.all([
        EpubService.getBookTitle(file),
        EpubService.getBookToc(file),
      ]);
      setBookTitle(title || "No title found");
      setToc(toc || null);
    } catch (err) {
      setError("Failed to read EPUB file.");
    }
  };

  // When hrefParam changes, load the chapter content
  useEffect(() => {
    if (!file || !hrefParam || !toc) return;
    // Find chapter by href
    const findChapter = (items: EpubTocItem[]): EpubTocItem | null => {
      for (const item of items) {
        if (item.href === hrefParam) return item;
        if (item.children) {
          const found = findChapter(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    const chapter = findChapter(toc);
    setSelectedChapter(chapter);
    setLoading(true);
    setChapterContent(null);
    EpubService.getChapterContent(file, hrefParam)
      .then((content) => setChapterContent(content || "No content available."))
      .catch(() => setChapterContent("Failed to load chapter content."))
      .finally(() => setLoading(false));
  }, [file, hrefParam, toc]);

  // TOC item click navigates to chapter
  const handleChapterClick = (item: EpubTocItem) => {
    if (!item.href) return;
    router.push(`?href=${encodeURIComponent(item.href)}`);
  };

  // Back button navigates to TOC
  const handleBack = () => {
    router.push("/book");
  };

  // Render TOC
  const renderToc = (items: EpubTocItem[]) => (
    <ul className="pl-0">
      {items.map((item, idx) => (
        <li
          key={idx}
          className={
            item.children && item.children.length > 0
              ? "list-disc list-inside ml-4"
              : "list-none ml-0"
          }
        >
          <button
            className="text-blue-700 hover:underline font-semibold transition-colors duration-150 text-left"
            onClick={() => handleChapterClick(item)}
          >
            {item.label}
          </button>
          {item.children && item.children.length > 0 && renderToc(item.children)}
        </li>
      ))}
    </ul>
  );

  // Helper to extract visible text from HTML
  function extractVisibleSentences(html: string): string[] {
    // Remove tags and decode entities (simple)
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || '';
    // Split into sentences (naive)
    return text.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [];
  }

  // Handler for translation
  const handleTranslate = async (sentence: string, idx: number) => {
    if (loadingIndices.has(idx)) return;
    setLoadingIndices(prev => new Set(prev).add(idx));
    try {
      const translated = await translateText(sentence, "sentence");
      setTranslations(prev => ({ ...prev, [idx]: translated }));
    } finally {
      setLoadingIndices(prev => {
        const newSet = new Set(prev);
        newSet.delete(idx);
        return newSet;
      });
    }
  };

  // Main render
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center py-8 px-2">
      <div className="w-full h-full bg-white rounded-none shadow-none p-0 m-0 flex flex-col flex-1">
        <div className="relative flex flex-col sm:flex-row items-center gap-4 mb-6 w-full min-h-[48px]">
          <input
            type="file"
            accept=".epub"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="border rounded p-2 w-full sm:w-auto z-10"
          />
          {bookTitle && (
            <h2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-semibold text-gray-800 whitespace-nowrap m-0 p-0">
              {bookTitle}
            </h2>
          )}
        </div>
        {error && <div className="text-red-600 text-center mb-4">{error}</div>}
        {/* TOC view */}
        {!hrefParam && toc && (
          <div className="mb-6 w-full">
            <h3 className="text-lg font-semibold text-indigo-600 mb-2">Table of Contents</h3>
            <div className="overflow-auto border rounded p-3 bg-gray-50 w-full">
              {renderToc(toc)}
            </div>
          </div>
        )}
        {/* Chapter view */}
        {hrefParam && (
          <div className="w-full flex flex-col items-center">
            <button
              className="self-start mb-4 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded shadow"
              onClick={handleBack}
            >
              ← Back to Table of Contents
            </button>
            {loading ? (
              <div className="text-center text-indigo-500">Loading chapter...</div>
            ) : (
              <div className="prose prose-lg max-w-none w-full bg-gray-100 p-4 rounded shadow-inner min-h-[120px]">
                <h3 className="text-lg font-bold text-indigo-700 mb-3">{selectedChapter?.label}</h3>
                {chapterContent ? (
                  <div className="flex flex-col">
                    {extractVisibleSentences(chapterContent).map((sentence, idx) => (
                      <div key={idx} className="mb-2">
                        <div className="flex items-center gap-2 justify-between">
                          <span>{sentence.trim()}</span>
                          <button
                            className="ml-2 text-blue-600 hover:text-blue-900"
                            onClick={() => handleTranslate(sentence, idx)}
                            disabled={loadingIndices.has(idx)}
                            title="Translate sentence"
                          >
                            {loadingIndices.has(idx)
                              ? <span role="img" aria-label="loading">⏳</span>
                              : translations[idx]
                                ? <span role="img" aria-label="done">✅</span>
                                : <span role="img" aria-label="translate">🌐</span>
                            }
                          </button>
                        </div>
                        {translations[idx] && (
                          <div className="text-gray-500 text-base leading-snug mt-1">{translations[idx]}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">No content loaded.</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <footer className="text-gray-400 text-xs mt-8">&copy; {new Date().getFullYear()} EPUB Reader</footer>
    </div>
  );
}
