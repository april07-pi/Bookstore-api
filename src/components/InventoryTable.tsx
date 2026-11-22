import {useMemo, useState} from 'react';
import {Copy, Check, RotateCcw, Search, RefreshCw} from 'lucide-react';
import type {Book, TargetMode} from '../types/bookstore';

interface InventoryTableProps {
  books: Book[];
  loading: boolean;
  error: string | null;
  targetMode: TargetMode;
  selectedBookId: string;
  onSelectBookForEdit: (book: Book) => void;
  onSelectBookForDelete: (id: string) => void;
  onRefresh: () => void;
  onResetSandbox: () => void;
}

export function InventoryTable({
  books,
  loading,
  error,
  targetMode,
  selectedBookId,
  onSelectBookForEdit,
  onSelectBookForDelete,
  onRefresh,
  onResetSandbox,
}: InventoryTableProps) {
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedJson, setCopiedJson] = useState(false);

  const filteredBooks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return books;
    return books.filter(
      (book) =>
        book.id.toLowerCase().includes(query) ||
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.rating.toLowerCase().includes(query),
    );
  }, [books, searchQuery]);

  const rawJson = useMemo(() => JSON.stringify(books, null, 2), [books]);

  async function handleCopyJson() {
    try {
      await navigator.clipboard.writeText(rawJson);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 1800);
    } catch {
      // Clipboard API unavailable
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            Books Resource Data
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            <span className="font-mono text-slate-700">/books</span>
            <span className="mx-1.5" aria-hidden="true">
              ·
            </span>
            <span className="tabular-nums">{books.length} records</span>
            <span className="mx-1.5" aria-hidden="true">
              ·
            </span>
            <span>Schema: id, title, author, rating (string)</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Data Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode('json')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'json'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Raw JSON
            </button>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {targetMode === 'sandbox' && (
            <button
              type="button"
              onClick={onResetSandbox}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset 5 Books</span>
            </button>
          )}
        </div>
      </div>

      {viewMode === 'table' && (
        <div className="border-b border-slate-200 px-5 py-3">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by id, title, author, or rating..."
              aria-label="Filter books"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-xs text-red-700">
          Request error: {error}
        </div>
      )}

      {viewMode === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                <th className="w-16 px-5 py-2.5">id</th>
                <th className="px-4 py-2.5">title</th>
                <th className="px-4 py-2.5">author</th>
                <th className="w-24 px-4 py-2.5 text-right">rating</th>
                <th className="w-40 px-5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && books.length === 0 ? (
                Array.from({length: 5}).map((_, idx) => (
                  <tr key={idx} className="h-11">
                    <td className="px-5 py-2.5">
                      <div className="h-3.5 w-6 rounded bg-slate-100" />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="h-3.5 w-44 rounded bg-slate-100" />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="h-3.5 w-32 rounded bg-slate-100" />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="ml-auto h-3.5 w-8 rounded bg-slate-100" />
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <div className="ml-auto h-3.5 w-20 rounded bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center">
                    <p className="text-sm font-medium text-slate-700">
                      {books.length === 0
                        ? 'No books currently stored in the resource.'
                        : 'No books match your search filter.'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {books.length === 0
                        ? 'Add a new book via POST or restore the 5 starter books.'
                        : 'Clear the filter input to see all stored books.'}
                    </p>
                    {books.length === 0 && targetMode === 'sandbox' && (
                      <button
                        type="button"
                        onClick={onResetSandbox}
                        className="mt-3 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-blue-700 cursor-pointer"
                      >
                        Restore 5 Starter Books
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => {
                  const isSelected = book.id === selectedBookId;
                  return (
                    <tr
                      key={book.id}
                      className={`h-11 transition-colors ${
                        isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-5 py-2.5 font-mono text-xs text-slate-700 tabular-nums">
                        &quot;{book.id}&quot;
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-900">
                        {book.title}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {book.author}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-800 tabular-nums">
                        &quot;{book.rating}&quot;
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <div className="inline-flex items-center gap-3 text-xs font-medium">
                          <button
                            type="button"
                            onClick={() => onSelectBookForEdit(book)}
                            className="text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            Use in PUT
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectBookForDelete(book.id)}
                            className="text-red-600 hover:text-red-800 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            Target DELETE
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Live JSON representation (double-quoted strings)
            </span>
            <button
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              {copiedJson ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Copied JSON</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>
          <pre className="max-h-80 overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-100">
            {rawJson}
          </pre>
        </div>
      )}
    </section>
  );
}
