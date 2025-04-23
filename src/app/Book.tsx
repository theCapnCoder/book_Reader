"use client";

import React, { useRef, useState, useEffect } from "react";
import { EpubService } from "../services/epubService";
import { EpubTocItem } from "../types/epub";

export default function Book() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bookTitle, setBookTitle] = useState<string | null>(null);
  const [toc, setToc] = useState<EpubTocItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [chapterContent, setChapterContent] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedChapter, setSelectedChapter] = useState<EpubTocItem | null>(null);

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

  // TOC item click navigates to chapter
  const handleChapterClick = (item: EpubTocItem) => {
    if (!item.href) return;
    setSelectedChapter(item);
    setLoading(true);
    setChapterContent(null);
    if (file && item.href) {
      EpubService.getChapterContent(file, item.href)
        .then((content) => setChapterContent(content || "No content available."))
        .catch(() => setChapterContent("Failed to load chapter content."))
        .finally(() => setLoading(false));
    }
  };

  // Back button navigates to TOC
  const handleBack = () => {
    setSelectedChapter(null);
    setChapterContent(null);
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

  // Main render
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center py-8 px-2">
      <div className="w-full h-full bg-white rounded-none shadow-none p-0 m-0 flex flex-col flex-1">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <input
            type="file"
            accept=".epub"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="border rounded p-2 w-full sm:w-auto"
          />
        </div>
        {error && <div className="text-red-600 text-center mb-4">{error}</div>}
        {bookTitle && <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">{bookTitle}</h2>}
        {/* TOC view */}
        {!selectedChapter && toc && (
          <div className="mb-6 w-full">
            <h3 className="text-lg font-semibold text-indigo-600 mb-2">Table of Contents</h3>
            <div className="overflow-auto border rounded p-3 bg-gray-50 w-full">
              {renderToc(toc)}
            </div>
          </div>
        )}
        {/* Chapter view */}
        {selectedChapter && (
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
                <h3 className="text-lg font-bold text-indigo-700 mb-3">{selectedChapter.label}</h3>
                {chapterContent ? (
                  <div dangerouslySetInnerHTML={{ __html: chapterContent }} />
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
