"use client";

import React, { useRef, useState } from "react";
import { EpubService } from "../services/epubService";

export default function Book() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bookTitle, setBookTitle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setBookTitle(null);
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const title = await EpubService.getBookTitle(file);
      setBookTitle(title || "No title found");
    } catch (err) {
      setError("Failed to read EPUB file.");
    }
  };

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
      {error && (
        <div className="mt-2 text-red-600 font-medium">{error}</div>
      )}
    </div>
  );
}
