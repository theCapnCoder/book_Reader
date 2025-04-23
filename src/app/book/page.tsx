"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EpubService } from "../../services/epubService";
import { EpubTocItem } from "../../types/epub";
import { translateText } from "../../services/translationService";
import { FiSettings, FiGlobe, FiCheck, FiLoader } from "react-icons/fi";
import { DEFAULT_WORD_PROMPT, DEFAULT_SENTENCE_PROMPT } from "../../config/translationConfig";

// LocalStorage keys
const WORD_PROMPT_KEY = 'epub_word_prompt';
const SENTENCE_PROMPT_KEY = 'epub_sentence_prompt';

// Move SettingsModal outside of the Book component body so it is not re-created on every render
function SettingsModal({
  pendingWordPrompt,
  setPendingWordPrompt,
  pendingSentencePrompt,
  setPendingSentencePrompt,
  showSettings,
  setShowSettings,
  handleConfirmPrompts,
  showOriginal,
  setShowOriginal,
}: {
  pendingWordPrompt: string;
  setPendingWordPrompt: (v: string) => void;
  pendingSentencePrompt: string;
  setPendingSentencePrompt: (v: string) => void;
  showSettings: boolean;
  setShowSettings: (v: boolean) => void;
  handleConfirmPrompts: () => void;
  showOriginal: boolean;
  setShowOriginal: (v: boolean) => void;
}) {
  if (!showSettings) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowSettings(false)} title="Close">✕</button>
        <h2 className="text-lg font-bold mb-4">Settings</h2>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-gray-700 text-sm">Original text</span>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={showOriginal}
              onChange={() => setShowOriginal(!showOriginal)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600 transition" />
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-5" />
          </label>
        </div>
        <div className="mb-3">
          <label className="block text-xs text-gray-500 mb-1">Prompt for word translation:</label>
          <textarea
            className="w-full p-2 border rounded text-xs"
            value={pendingWordPrompt}
            onChange={e => setPendingWordPrompt(e.target.value)}
            rows={2}
          />
        </div>
        <div className="mb-3">
          <label className="block text-xs text-gray-500 mb-1">Prompt for sentence/paragraph translation:</label>
          <textarea
            className="w-full p-2 border rounded text-xs"
            value={pendingSentencePrompt}
            onChange={e => setPendingSentencePrompt(e.target.value)}
            rows={2}
          />
        </div>
        <button
          className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold text-sm transition"
          onClick={handleConfirmPrompts}
        >
          Confirm
        </button>
        <div className="text-xs text-gray-500 mt-3">Prompts will only be saved after pressing Confirm. Defaults are used if you leave fields empty.</div>
      </div>
    </div>
  );
}

export default function Book() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bookTitle, setBookTitle] = useState<string | null>(null);
  const [toc, setToc] = useState<EpubTocItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [chapterContent, setChapterContent] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const [selectedChapter, setSelectedChapter] = useState<EpubTocItem | null>(null);
  const [translations, setTranslations] = useState<{ [idx: number]: string }>({});
  const [loadingIndices, setLoadingIndices] = useState<Set<number>>(new Set());
  const [paragraphTranslations, setParagraphTranslations] = useState<{ [idx: number]: string }>({});
  const [paragraphLoadingIndices, setParagraphLoadingIndices] = useState<Set<number>>(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [wordTranslation, setWordTranslation] = useState<string | null>(null);
  const [wordLoading, setWordLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [pendingWordPrompt, setPendingWordPrompt] = useState<string>("");
  const [pendingSentencePrompt, setPendingSentencePrompt] = useState<string>("");
  const [wordPrompt, setWordPrompt] = useState<string>("");
  const [sentencePrompt, setSentencePrompt] = useState<string>("");

  // On mount, load prompts from localStorage or use defaults
  useEffect(() => {
    const wp = typeof window !== 'undefined' ? localStorage.getItem(WORD_PROMPT_KEY) : null;
    const sp = typeof window !== 'undefined' ? localStorage.getItem(SENTENCE_PROMPT_KEY) : null;
    setWordPrompt(wp !== null ? wp : DEFAULT_WORD_PROMPT);
    setSentencePrompt(sp !== null ? sp : DEFAULT_SENTENCE_PROMPT);
  }, []);

  // When opening settings, sync local state (only when modal opens, not on every render)
  const handleOpenSettings = () => {
    setPendingWordPrompt(wordPrompt);
    setPendingSentencePrompt(sentencePrompt);
    setShowSettings(true);
  };

  // Only update prompts on confirm, not on every keystroke
  const handleConfirmPrompts = () => {
    setWordPrompt(pendingWordPrompt);
    setSentencePrompt(pendingSentencePrompt);
    if (typeof window !== 'undefined') {
      localStorage.setItem(WORD_PROMPT_KEY, pendingWordPrompt);
      localStorage.setItem(SENTENCE_PROMPT_KEY, pendingSentencePrompt);
    }
    setShowSettings(false);
  };

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

  useEffect(() => {
    if (!file || !toc) return;
    setSelectedChapter(null);
    setChapterContent(null);
  }, [file, toc]);

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

  const handleBackToToc = () => {
    setSelectedChapter(null);
    setChapterContent(null);
  };

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

  function extractVisibleSentences(html: string): string[] {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || '';
    return text.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [];
  }

  function extractParagraphs(html: string): string[] {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const paragraphs = Array.from(tmp.querySelectorAll('p')).map(p => p.textContent?.trim() || '').filter(Boolean);
    // fallback: if no <p> tags, treat the whole text as one paragraph
    if (paragraphs.length === 0) {
      const text = tmp.textContent || tmp.innerText || '';
      return text ? [text] : [];
    }
    return paragraphs;
  }

  async function handleWordClick(word: string) {
    setSelectedWord(word);
    setWordLoading(true);
    setWordTranslation(null);
    try {
      const prompt = pendingWordPrompt || wordPrompt || DEFAULT_WORD_PROMPT;
      const translated = await translateText(word, "word", prompt);
      setWordTranslation(translated);
    } catch {
      setWordTranslation("Translation failed.");
    } finally {
      setWordLoading(false);
    }
  }

  const handleTranslate = async (sentence: string, idx: number) => {
    if (loadingIndices.has(idx)) return;
    setLoadingIndices(prev => new Set(prev).add(idx));
    try {
      const prompt = pendingSentencePrompt || sentencePrompt || DEFAULT_SENTENCE_PROMPT;
      const translated = await translateText(sentence, "sentence", prompt);
      setTranslations(prev => ({ ...prev, [idx]: translated }));
    } catch (e) {
      setTranslations(prev => ({ ...prev, [idx]: "Translation failed." }));
    } finally {
      setLoadingIndices(prev => {
        const newSet = new Set(prev);
        newSet.delete(idx);
        return newSet;
      });
    }
  };

  const handleTranslateParagraph = async (paragraph: string, idx: number) => {
    if (paragraphLoadingIndices.has(idx)) return;
    setParagraphLoadingIndices(prev => new Set(prev).add(idx));
    try {
      const prompt = pendingSentencePrompt || sentencePrompt || DEFAULT_SENTENCE_PROMPT;
      const translated = await translateText(paragraph, "sentence", prompt);
      setParagraphTranslations(prev => ({ ...prev, [idx]: translated }));
    } catch (e) {
      setParagraphTranslations(prev => ({ ...prev, [idx]: "Translation failed." }));
    } finally {
      setParagraphLoadingIndices(prev => {
        const newSet = new Set(prev);
        newSet.delete(idx);
        return newSet;
      });
    }
  };

  function renderTextWithWordClicks(text: string) {
    return text.split(/(\s+)/).map((word, i) => {
      if (/^\s+$/.test(word)) {
        return word;
      }
      return (
        <span
          key={i}
          className="cursor-pointer hover:underline hover:text-indigo-600 transition"
          onClick={() => handleWordClick(word)}
        >
          {word}
        </span>
      );
    });
  }

  useEffect(() => {
    if (selectedWord) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedWord]);

  function WordTranslationModal() {
    if (!selectedWord) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
        {/* Backdrop for closing modal by clicking outside */}
        <div
          className="fixed inset-0 bg-black bg-opacity-10 z-40 pointer-events-auto"
          onClick={() => { setSelectedWord(null); setWordTranslation(null); setWordLoading(false); }}
        />
        <div
          className="relative w-full max-w-lg bg-white rounded-t-2xl shadow-2xl border-t border-gray-200 p-6 flex flex-col items-center animate-fadeIn z-50 pointer-events-auto"
          style={{ minHeight: '120px', maxHeight: '40vh' }}
          onClick={e => e.stopPropagation()}
        >
          <button
            className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 bg-white rounded-full w-8 h-8 flex items-center justify-center border border-gray-200 shadow"
            onClick={() => { setSelectedWord(null); setWordTranslation(null); setWordLoading(false); }}
            title="Close"
          >
            ×
          </button>
          {/* First line: always show which word is being translated */}
          <div className="w-full text-xs text-gray-400 mb-2 text-center border-b pb-2">Translation for: <span className="font-semibold text-gray-700">{selectedWord}</span></div>
          <div className="flex-1 w-full flex flex-col justify-center items-center min-h-[80px] overflow-y-auto" style={{maxHeight: '30vh'}}>
            {wordLoading ? (
              <span className="text-indigo-500 text-base">Loading...</span>
            ) : (
              <div className="text-base text-gray-700 text-center break-words whitespace-pre-line w-full">{wordTranslation}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-2"
            title="Settings"
            onClick={handleOpenSettings}
          >
            <FiSettings className="w-6 h-6" />
          </button>
        </div>
        {showSettings && (
          <SettingsModal
            pendingWordPrompt={pendingWordPrompt}
            setPendingWordPrompt={setPendingWordPrompt}
            pendingSentencePrompt={pendingSentencePrompt}
            setPendingSentencePrompt={setPendingSentencePrompt}
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            handleConfirmPrompts={handleConfirmPrompts}
            showOriginal={showOriginal}
            setShowOriginal={setShowOriginal}
          />
        )}
        {error && <div className="text-red-600 text-center mb-4">{error}</div>}
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
              onClick={handleBackToToc}
            >
              ← Back to Table of Contents
            </button>
            {loading ? (
              <div className="text-center text-indigo-500">Loading chapter...</div>
            ) : (
              <div className="prose prose-lg max-w-none w-full bg-gray-100 p-4 rounded shadow-inner min-h-[120px]">
                <h3 className="text-lg font-bold text-indigo-700 mb-3">{selectedChapter.label}</h3>
                {chapterContent ? (
                  showOriginal
                    ? extractParagraphs(chapterContent).map((paragraph, idx) => (
                        <div key={idx} className="mb-1">
                          <div className="flex items-center gap-2 justify-between">
                            <span>{renderTextWithWordClicks(paragraph)}</span>
                            <button
                              className="ml-2 text-blue-600 hover:text-blue-900"
                              onClick={() => handleTranslateParagraph(paragraph, idx)}
                              disabled={paragraphLoadingIndices.has(idx)}
                              title="Translate paragraph"
                            >
                              {paragraphLoadingIndices.has(idx)
                                ? <FiLoader className="animate-spin w-5 h-5" aria-label="loading" />
                                : paragraphTranslations[idx]
                                  ? <FiCheck className="text-green-600 w-5 h-5" aria-label="done" />
                                  : <FiGlobe className="w-5 h-5" aria-label="translate" />
                              }
                            </button>
                          </div>
                          {paragraphTranslations[idx] && (
                            <div className="text-gray-500 text-base leading-snug mt-1">{paragraphTranslations[idx]}</div>
                          )}
                        </div>
                      ))
                    : extractVisibleSentences(chapterContent).map((sentence, idx) => (
                        <div key={idx} className="mb-2">
                          <div className="flex items-center gap-2 justify-between">
                            <span>{renderTextWithWordClicks(sentence.trim())}</span>
                            <button
                              className="ml-2 text-blue-600 hover:text-blue-900"
                              onClick={() => handleTranslate(sentence, idx)}
                              disabled={loadingIndices.has(idx)}
                              title="Translate sentence"
                            >
                              {loadingIndices.has(idx)
                                ? <FiLoader className="animate-spin w-5 h-5" aria-label="loading" />
                                : translations[idx]
                                  ? <FiCheck className="text-green-600 w-5 h-5" aria-label="done" />
                                  : <FiGlobe className="w-5 h-5" aria-label="translate" />
                              }
                            </button>
                          </div>
                          {translations[idx] && (
                            <div className="text-gray-500 text-base leading-snug mt-1">{translations[idx]}</div>
                          )}
                        </div>
                      ))
                ) : (
                  <div className="text-gray-500">No content loaded.</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Word Translation Modal (always at root) */}
      <WordTranslationModal />
      <footer className="text-gray-400 text-xs mt-8">&copy; {new Date().getFullYear()} EPUB Reader</footer>
    </div>
  );
}
