import {useState} from 'react';
import {Play, Trash2} from 'lucide-react';
import type {RestLogEntry, ScriptConfig} from '../types/bookstore';

interface RestOperationsPanelProps {
  config: ScriptConfig;
  busy: boolean;
  logs: RestLogEntry[];
  onChangeConfig: (next: ScriptConfig) => void;
  onExecuteGetAll: () => Promise<void>;
  onExecutePost: () => Promise<void>;
  onExecutePut: () => Promise<void>;
  onExecuteDeleteAndVerify: () => Promise<void>;
  onRunFullSequence: () => Promise<void>;
  onClearLogs: () => void;
}

type OperationTab = 'get' | 'post' | 'put' | 'delete';

export function RestOperationsPanel({
  config,
  busy,
  logs,
  onChangeConfig,
  onExecuteGetAll,
  onExecutePost,
  onExecutePut,
  onExecuteDeleteAndVerify,
  onRunFullSequence,
  onClearLogs,
}: RestOperationsPanelProps) {
  const [activeTab, setActiveTab] = useState<OperationTab>('get');

  const latestLog = logs[0] ?? null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            REST Operations Runner
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Test Part B operations individually or execute steps a through d in order.
          </p>
        </div>

        <button
          type="button"
          onClick={onRunFullSequence}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Play className="h-3.5 w-3.5" />
          <span>Run Full Sequence (a → b → c → d)</span>
        </button>
      </div>

      <div className="border-b border-slate-200 px-5 py-3">
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
          {(
            [
              {id: 'get', label: '1a. GET All'},
              {id: 'post', label: '1b. POST 6th Book'},
              {id: 'put', label: '1c. PUT Update'},
              {id: 'delete', label: '1d. DELETE & Verify 404'},
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {activeTab === 'get' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">
                  Fetch all books from the inventory
                </p>
                <p className="font-mono text-xs text-slate-500">
                  GET {config.apiUrl}
                </p>
              </div>
              <button
                type="button"
                onClick={onExecuteGetAll}
                disabled={busy}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Send GET Request
              </button>
            </div>
          </div>
        )}

        {activeTab === 'post' && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Title (string)
                </label>
                <input
                  type="text"
                  value={config.postBook.title}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      postBook: {...config.postBook, title: e.target.value},
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Author (string)
                </label>
                <input
                  type="text"
                  value={config.postBook.author}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      postBook: {...config.postBook, author: e.target.value},
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Rating (string)
                </label>
                <input
                  type="text"
                  value={config.postBook.rating}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      postBook: {...config.postBook, rating: e.target.value},
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 font-mono text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-xs text-slate-500">
                POST {config.apiUrl} · Expects 201 Created
              </span>
              <button
                type="button"
                onClick={onExecutePost}
                disabled={busy}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Send POST Request
              </button>
            </div>
          </div>
        )}

        {activeTab === 'put' && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Target Book ID
                </label>
                <input
                  type="text"
                  value={config.putTargetId}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      putTargetId: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  New Title
                </label>
                <input
                  type="text"
                  value={config.putBook.title}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      putBook: {...config.putBook, title: e.target.value},
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  New Author
                </label>
                <input
                  type="text"
                  value={config.putBook.author}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      putBook: {...config.putBook, author: e.target.value},
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  New Rating
                </label>
                <input
                  type="text"
                  value={config.putBook.rating}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      putBook: {...config.putBook, rating: e.target.value},
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-xs text-slate-500">
                PUT {config.apiUrl}/{config.putTargetId || 'id'} · Expects 200 OK
              </span>
              <button
                type="button"
                onClick={onExecutePut}
                disabled={busy}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Send PUT Request
              </button>
            </div>
          </div>
        )}

        {activeTab === 'delete' && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Book ID to Delete &amp; Verify
                </label>
                <input
                  type="text"
                  value={config.deleteTargetId}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      deleteTargetId: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2 flex items-end">
                <p className="text-xs text-slate-600">
                  Runs <span className="font-mono">DELETE /books/{config.deleteTargetId || 'id'}</span> followed immediately by{' '}
                  <span className="font-mono">GET /books/{config.deleteTargetId || 'id'}</span> to verify a 404 HTTP error is returned.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-xs text-slate-500">
                2 requests: DELETE then GET /{config.deleteTargetId || 'id'}
              </span>
              <button
                type="button"
                onClick={onExecuteDeleteAndVerify}
                disabled={busy}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                DELETE &amp; Verify 404
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-700">
            HTTP Response Log ({logs.length})
          </h3>
          {logs.length > 0 && (
            <button
              type="button"
              onClick={onClearLogs}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear Log</span>
            </button>
          )}
        </div>

        {!latestLog ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-5 text-center text-xs text-slate-500">
            No requests executed yet. Click any REST action above or run the full sequence to inspect live status codes and JSON payloads.
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {logs.map((entry) => {
              const statusColor = entry.ok
                ? 'text-emerald-700'
                : entry.status === 404
                  ? 'text-amber-700'
                  : 'text-red-700';
              const statusLabel = entry.ok
                ? 'NOMINAL'
                : entry.status === 404
                  ? 'HTTPERROR CONFIRMED'
                  : 'ERROR';

              return (
                <div
                  key={entry.id}
                  className="rounded-lg border border-slate-200 bg-white p-3.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-semibold text-slate-900">
                        {entry.method}
                      </span>
                      <span className="text-slate-400" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-slate-700">{entry.stepLabel}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <span className={`font-semibold ${statusColor}`}>
                        {entry.status} {entry.statusText} ({statusLabel})
                      </span>
                      <span className="text-slate-400" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-slate-500">{entry.durationMs} ms</span>
                    </div>
                  </div>
                  <p className="mt-1 truncate font-mono text-[11px] text-slate-500">
                    {entry.url}
                  </p>
                  <pre className="mt-2.5 max-h-44 overflow-auto rounded-md bg-slate-950 p-3 font-mono text-xs text-slate-100">
                    {typeof entry.responseBody === 'string'
                      ? entry.responseBody
                      : JSON.stringify(entry.responseBody, null, 2)}
                  </pre>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
