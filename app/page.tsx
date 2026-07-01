"use client";

import { useState, useMemo, useEffect, useRef } from "react";

// ---- Types ----
interface MemoNote {
  id: string;
  text: string;
  timestamp: string;
}

interface Entry {
  id: number;
  title: string;
  source: string;
  category: string;
  tags: string[];
  body: string;
  actions: string[];
  date: string;
  url?: string;
}

// ---- Dummy Data ----
const ENTRIES: Entry[] = [
  {
    id: 1,
    title: "イーロンマスク SpaceXの軌跡",
    source: "書籍",
    category: "起業家精神",
    tags: ["#イーロンマスク", "#SpaceX", "#ビジョン", "#第一原理思考"],
    date: "2026-06-10",
    body: `イーロン・マスクがSpaceXを創業した背景には、「人類を多惑星種にする」という壮大なビジョンがあった。2002年に設立されたSpaceXは、当初ロケット技術の常識を覆す再利用可能なロケットの開発に挑んだ。「第一原理思考」を徹底し、既存のコストの前提を疑い続けた。例えばロケットの部品コストを原材料費まで分解して見直し、桁違いのコスト削減を実現した。

失敗を恐れず、ファルコン1の最初の3回の打ち上げ失敗にも諦めず、4回目で成功。その姿勢が今日のSpaceXの礎となった。`,
    actions: [
      "自分の仕事でも「第一原理思考」を試みる：コストや工数の前提を疑ってみる",
      "大きなビジョンを描き、逆算して今日やることを決める習慣をつける",
      "失敗を「データ収集」として捉え直し、次に活かすフレームを持つ",
    ],
  },
  {
    id: 2,
    title: "真のリーダーシップと起業家精神（田中塾）",
    source: "田中塾",
    category: "リーダーシップ",
    tags: ["#リーダーシップ", "#起業家精神", "#田中塾", "#影響力"],
    date: "2026-06-18",
    body: `田中塾での学び：真のリーダーシップとは「ポジションパワー」ではなく「影響力」であるという考え方。リーダーは答えを出す人ではなく、チームが自ら答えを出せる環境を整える人。「心理的安全性」を高め、メンバーが挑戦できる土壌を作ることが最重要。

起業家精神の本質は「オーナーシップ」。自分がこの事業・プロジェクトのオーナーだという意識で動くと、判断の質と速度が劇的に変わる。`,
    actions: [
      "週1回、チームメンバーに「何に困っているか」を聞くミーティングを設定する",
      "自分の担当業務を「オーナー目線」で見直し、改善提案を1つ上げる",
      "指示を出す前に「どう思う？」と聞く習慣をつける",
    ],
  },
  {
    id: 3,
    title: "主体性とやらされ仕事の転換（仕事での学び）",
    source: "仕事での学び",
    category: "マインドセット",
    tags: ["#主体性", "#マインドセット", "#モチベーション", "#孫子"],
    date: "2026-06-22",
    body: `日常の業務の中で気づいた「やらされ感」の正体と、それを主体性に転換する方法についての振り返り。

やらされ感の正体は「Why（なぜやるのか）」が自分の中で腹落ちしていないこと。指示された仕事でも、自分なりの意味づけをすることで主体性が生まれる。孫子の「彼を知り己を知れば百戦殆うからず」の精神で、自分の強みと仕事の要件を照らし合わせることで、やらされ感は消えていく。`,
    actions: [
      "毎朝「今日の仕事のWhyを1行で書く」朝ジャーナリングを始める",
      "指示された仕事に「自分ならではの付加価値」を1つ加える癖をつける",
      "「やらされ感」を感じたら、その仕事の社会的意義を3つ書き出す",
    ],
  },
  {
    id: 4,
    title: "自分の勝利条件とBモードへの変革（田中塾）",
    source: "田中塾",
    category: "戦略思考",
    tags: ["#勝利条件", "#Bモード", "#田中塾", "#戦略", "#孫子"],
    date: "2026-06-28",
    body: `田中塾での核心的な学び：「勝利条件」を明確に定義することが、すべての戦略の出発点。勝利条件とは「何をもって勝ちとするか」を自分で定義すること。他人や社会が決めた勝利条件で戦っている限り、本当の満足は得られない。

「Bモード（Being mode）」への変革とは、常に何かを「する（Doing）」ことで価値を証明しようとする状態から抜け出し、「存在そのもの」に価値があると感じられる状態に変わること。孫子が「戦わずして勝つ」と言ったように、自分の土俵で勝負する状態を作ることが最善策。`,
    actions: [
      "「3年後の自分の勝利条件」を5行以内で書き、月1回見直す",
      "Doingリストに追われている日は、夜に「今日のBeingは何だったか？」を問う",
      "自分の強みが活きる「土俵」を3つ書き出し、そこに時間を集中させる計画を立てる",
    ],
  },
];

// Static lists used in SourcePanel; in the main component these are derived dynamically from loaded entries
const STATIC_SOURCES = ["すべて", "書籍", "田中塾", "仕事での学び"];
const STATIC_CATEGORIES = ["すべて", "起業家精神", "リーダーシップ", "マインドセット", "戦略思考"];

// Moved outside component to avoid recreation on every render
const CATEGORY_COLOR_MAP: Record<string, string> = {
  起業家精神: "bg-orange-50 text-orange-600 border-orange-100",
  リーダーシップ: "bg-blue-50 text-blue-600 border-blue-100",
  マインドセット: "bg-green-50 text-green-600 border-green-100",
  戦略思考: "bg-purple-50 text-purple-600 border-purple-100",
};

function isSafeUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

// ---- Icon components ----
function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function IconChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}


function IconBookmark() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}

function IconZap() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

// ---- Sub-components ----

interface ChatPaneProps {
  entry: Entry;
}

// Self-contained memo pane. Notes are persisted in localStorage per entry.
// Use key={entry.id} from the parent so state resets when entry changes.
function MemoPane({ entry }: { entry: Entry }) {
  const storageKey = `memo-notes-${entry.id}`;
  const [notes, setNotes] = useState<MemoNote[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setNotes(JSON.parse(saved));
    } catch {
      // ignore parse errors
    }
  }, [storageKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    const note: MemoNote = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text,
      timestamp: new Date().toLocaleString("ja-JP", {
        month: "numeric", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      }),
    };
    const updated = [...notes, note];
    setNotes(updated);
    try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch { /* ignore */ }
    setInput("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleDelete = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch { /* ignore */ }
  };

  return (
    <>
      {/* Notes list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {notes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-8 text-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            <p className="text-xs text-gray-400 leading-relaxed">
              思ったことを自由に書き留めよう<br />
              <span className="text-gray-300">Enter で送信、Shift+Enter で改行</span>
            </p>
          </div>
        )}
        {notes.map((note) => (
          <div key={note.id} className="group flex items-end justify-end gap-1">
            <button
              onClick={() => handleDelete(note.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mb-1 text-gray-300 hover:text-red-400"
              aria-label="削除"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
              </svg>
            </button>
            <div className="max-w-[85%]">
              <div className="bg-indigo-600 text-white rounded-2xl rounded-br-sm px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words">
                {note.text}
              </div>
              <p className="text-right text-xs text-gray-400 mt-0.5 pr-1">{note.timestamp}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={2}
            placeholder="気づき・アイデア・問いを書き留める…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm px-3 py-2 bg-gray-100 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition-all placeholder:text-gray-400 resize-none"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 flex items-center justify-center text-white transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <IconSend />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-right">Shift+Enter で改行</p>
      </form>
    </>
  );
}

function DesktopChatPane({ entry }: ChatPaneProps) {
  return (
    <>
      <div className="px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          <p className="text-sm font-semibold text-gray-800">壁打ちメモ</p>
          <span className="ml-auto text-xs text-indigo-600 font-semibold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">自分メモ</span>
        </div>
      </div>
      <MemoPane key={entry.id} entry={entry} />
    </>
  );
}

function MobileChatSection({ entry }: ChatPaneProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">壁打ちメモ</span>
          <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-full">自分メモ</span>
        </div>
        <span className="text-gray-400"><IconChevronDown open={open} /></span>
      </button>
      {open && (
        <div className="flex flex-col" style={{ maxHeight: "360px" }}>
          <MemoPane key={entry.id} entry={entry} />
        </div>
      )}
    </div>
  );
}

function SourcePanel({
  selectedSource,
  setSelectedSource,
  selectedCategory,
  setSelectedCategory,
  sources,
  categories,
}: {
  selectedSource: string;
  setSelectedSource: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  sources: string[];
  categories: string[];
}) {
  return (
    <>
      <div className="p-3 border-b border-gray-100">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">ソース</p>
        {sources.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedSource(s)}
            className={`w-full text-left text-sm px-2.5 py-1.5 rounded-lg mb-0.5 transition-colors ${
              selectedSource === s
                ? "bg-indigo-50 text-indigo-700 font-semibold"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="p-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">カテゴリ</p>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`w-full text-left text-sm px-2.5 py-1.5 rounded-lg mb-0.5 transition-colors ${
              selectedCategory === c
                ? "bg-purple-50 text-purple-700 font-semibold"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </>
  );
}

// ---- Main Page ----
export default function ManabiSwitch() {
  const [selectedSource, setSelectedSource] = useState("すべて");
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState<Entry[]>(ENTRIES);
  const [selectedEntry, setSelectedEntry] = useState<Entry>(ENTRIES[0]);
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/entries");
        const data = await res.json();
        if (!res.ok) {
          setFetchError(data.error ?? "データ取得に失敗しました");
          return;
        }
        if (Array.isArray(data) && data.length > 0) {
          setEntries(data);
          setSelectedEntry(data[0]);
        }
      } catch (e) {
        setFetchError(String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchSource = selectedSource === "すべて" || entry.source === selectedSource;
      const matchCategory = selectedCategory === "すべて" || entry.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        q === "" ||
        entry.title.toLowerCase().includes(q) ||
        entry.body.toLowerCase().includes(q) ||
        entry.tags.some((t) => t.toLowerCase().includes(q));
      return matchSource && matchCategory && matchSearch;
    });
  }, [entries, selectedSource, selectedCategory, searchQuery]);

  const handleSelectEntry = (entry: Entry) => {
    setSelectedEntry(entry);
    setMobileView("detail");
  };

  // Derive unique source/category lists from loaded entries
  const dynamicSources = useMemo(() => {
    const unique = Array.from(new Set(entries.map((e) => e.source).filter(Boolean)));
    return ["すべて", ...unique];
  }, [entries]);

  const dynamicCategories = useMemo(() => {
    const unique = Array.from(new Set(entries.map((e) => e.category).filter(Boolean)));
    return ["すべて", ...unique];
  }, [entries]);

  const sources = loading ? STATIC_SOURCES : dynamicSources;
  const categories = loading ? STATIC_CATEGORIES : dynamicCategories;

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans overflow-hidden">
      {/* ===== Error / Loading banner ===== */}
      {fetchError && (
        <div className="shrink-0 bg-red-50 border-b border-red-200 px-4 py-2 flex items-start gap-2 text-sm text-red-700">
          <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
          <span>{fetchError}</span>
        </div>
      )}
      {loading && !fetchError && (
        <div className="shrink-0 bg-indigo-50 border-b border-indigo-100 px-4 py-1.5 flex items-center gap-2 text-xs text-indigo-600">
          <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          スプレッドシートからデータを読み込み中…
        </div>
      )}
      {/* ===== Header ===== */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shrink-0 z-10">
        <div className="flex items-center gap-2">
          {mobileView === "detail" && (
            <button
              className="lg:hidden p-1 -ml-1 mr-1 rounded-lg hover:bg-gray-100 text-gray-500 active:bg-gray-200 transition-colors"
              onClick={() => setMobileView("list")}
              aria-label="一覧に戻る"
            >
              <IconChevronLeft />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="font-bold text-gray-900 text-sm tracking-tight">まなびスイッチ</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {mobileView === "list" && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {filteredEntries.length}件
            </span>
          )}
          {mobileView === "detail" && (
            <span className="text-xs text-gray-500 font-medium hidden sm:block truncate max-w-[160px]">
              {selectedEntry.title}
            </span>
          )}
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 text-xs font-bold">I</span>
          </div>
        </div>
      </header>

      {/* ===== Main content area ===== */}
      <div className="flex flex-1 overflow-hidden">

        {/* ===== PC PANE 1: Source & Category sidebar ===== */}
        <aside className="hidden lg:flex w-44 shrink-0 flex-col bg-white border-r border-gray-200 overflow-y-auto">
          <SourcePanel
            selectedSource={selectedSource}
            setSelectedSource={setSelectedSource}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sources={sources}
            categories={categories}
          />
        </aside>

        {/* ===== PANE 2: Entry list — PC always visible, Mobile only in "list" view ===== */}
        <section
          className={`
            flex flex-col bg-gray-50 border-r border-gray-200 overflow-hidden
            w-full lg:w-72 shrink-0
            ${mobileView === "detail" ? "hidden lg:flex" : "flex"}
          `}
        >
          {/* Mobile: horizontal filter chips */}
          <div className="lg:hidden flex gap-2 px-3 pt-3 pb-1 overflow-x-auto no-scrollbar shrink-0">
            {sources.filter((s) => s !== "すべて").map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSource(selectedSource === s ? "すべて" : s)}
                className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-full border transition-colors shrink-0 ${
                  selectedSource === s
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-200"
                }`}
              >
                {s}
              </button>
            ))}
            {categories.filter((c) => c !== "すべて").map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(selectedCategory === c ? "すべて" : c)}
                className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-full border transition-colors shrink-0 ${
                  selectedCategory === c
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-600 border-gray-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="p-3 bg-white border-b border-gray-200 shrink-0">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <IconSearch />
              </span>
              <input
                type="text"
                placeholder="タイトル・タグ・本文で検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-100 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition-all placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  aria-label="検索をクリア"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Entry list */}
          <div className="flex-1 overflow-y-auto">
            {filteredEntries.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                <div className="text-2xl mb-2">🔍</div>
                <p>該当するメモが見つかりません</p>
              </div>
            ) : (
              filteredEntries.map((entry) => {
                const isSelected = selectedEntry.id === entry.id;
                return (
                  <button
                    key={entry.id}
                    onClick={() => handleSelectEntry(entry)}
                    className={`w-full text-left p-3.5 border-b border-gray-100 transition-all ${
                      isSelected
                        ? "bg-white border-l-[3px] border-l-indigo-500 pl-3"
                        : "hover:bg-white border-l-[3px] border-l-transparent"
                    }`}
                  >
                    <p className={`text-sm font-semibold leading-snug mb-1.5 ${isSelected ? "text-indigo-800" : "text-gray-800"}`}>
                      {entry.title}
                    </p>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md border ${
                        CATEGORY_COLOR_MAP[entry.category] ?? "bg-gray-50 text-gray-500 border-gray-100"
                      }`}>
                        {entry.category}
                      </span>
                      <span className="text-xs text-gray-400">{entry.source}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-500">{entry.date.replace("2026-", "")}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                      {entry.tags.length > 3 && (
                        <span className="text-xs text-gray-400">+{entry.tags.length - 3}</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* ===== PANE 3: Detail / 部品箱 — PC always, Mobile only in "detail" view ===== */}
        <main
          className={`
            flex-1 flex flex-col overflow-hidden bg-white
            ${mobileView === "list" ? "hidden lg:flex" : "flex"}
          `}
        >
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 lg:p-5 max-w-2xl">
              {/* Entry header */}
              <div className="mb-4">
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full">
                    {selectedEntry.source}
                  </span>
                  {selectedEntry.category !== selectedEntry.source && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      CATEGORY_COLOR_MAP[selectedEntry.category] ?? "bg-gray-50 text-gray-500 border-gray-100"
                    }`}>
                      {selectedEntry.category}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 ml-auto">{selectedEntry.date}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight mb-3">
                  {selectedEntry.title}
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {selectedEntry.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100 mb-4" />

              {/* Body */}
              <div className="mb-5">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="text-indigo-500"><IconBookmark /></span>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">メモ・学び</p>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 rounded-xl p-4 border border-gray-100">
                  {selectedEntry.body}
                </div>
              </div>

              {/* Actions */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="text-orange-500"><IconZap /></span>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">アクション</p>
                </div>
                <ul className="space-y-2.5">
                  {selectedEntry.actions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* URL */}
              {selectedEntry.url && isSafeUrl(selectedEntry.url) && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">ソースURL</p>
                  <a
                    href={selectedEntry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 underline underline-offset-2 break-all"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    </svg>
                    {selectedEntry.url}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Mobile: collapsible chat section below detail */}
          <div className="lg:hidden">
            <MobileChatSection
              entry={selectedEntry}
            />
          </div>
        </main>

        {/* ===== PC PANE 4: 壁打ち / AI Chat ===== */}
        <aside className="hidden lg:flex w-80 shrink-0 flex-col bg-gray-50 border-l border-gray-200">
          <DesktopChatPane
            entry={selectedEntry}
          />
        </aside>
      </div>
    </div>
  );
}
