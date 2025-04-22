"use client";

import React, { useRef, useState } from "react";
import { EpubService } from "../services/epubService";
import { EpubTocItem } from "../types/epub";

export default function Book() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bookTitle, setBookTitle] = useState<string | null>(null);
  const [toc, setToc] = useState<EpubTocItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setBookTitle(null);
    setToc(null);
    const file = e.target.files?.[0];
    if (!file) return;
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

  const renderToc = (items: EpubTocItem[]) => (
    <ul className="list-disc list-inside ml-4">
      {items.map((item, idx) => (
        <li key={idx}>
          <span className="text-blue-700">{item.label}</span>
          {item.children && item.children.length > 0 && renderToc(item.children)}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="p-6 border border-gray-300 rounded-lg bg-gray-50 max-w-xs shadow-md flex flex-col items-center">
      <h2 className="text-xl font-bold mb-2 text-gray-800">Book Component</h2>
      <input
        type="file"
        accept=".epub"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="mb-4 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {bookTitle && (
        <div className="mt-2 text-green-700 font-medium">Title: {bookTitle}</div>
      )}
      {toc && toc.length > 0 && (
        <div className="mt-4 w-full">
          <h3 className="font-semibold text-gray-800 mb-2">Table of Contents:</h3>
          {renderToc(toc)}
        </div>
      )}
      {error && (
        <div className="mt-2 text-red-600 font-medium">{error}</div>
      )}
    </div>
  );
}
