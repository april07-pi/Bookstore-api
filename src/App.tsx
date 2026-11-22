import {useCallback, useEffect, useState} from 'react';
import {TopBar} from './components/TopBar';
import {InventoryTable} from './components/InventoryTable';
import {RestOperationsPanel} from './components/RestOperationsPanel';
import {PythonScriptStudio} from './components/PythonScriptStudio';
import {SeedAndChecklist} from './components/SeedAndChecklist';
import {
  DEFAULT_MOCKAPI_PLACEHOLDER,
  DEFAULT_SCRIPT_CONFIG,
  generateBookstorePythonScript,
} from './data/bookstoreTemplates';
import type {
  Book,
  HttpMethod,
  RestLogEntry,
  ScriptConfig,
  ScriptMode,
  TargetMode,
} from './types/bookstore';

const CHECKLIST_STORAGE_KEY = 'bookstore_api_lab_checklist_v1';

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState<boolean>(true);
  const [booksError, setBooksError] = useState<string | null>(null);
  const [busyOperation, setBusyOperation] = useState<boolean>(false);

  const [targetMode, setTargetMode] = useState<TargetMode>('sandbox');
  const [mockApiUrl, setMockApiUrl] = useState<string>('');
  const [scriptMode, setScriptMode] = useState<ScriptMode>('bonus');
  const [config, setConfig] = useState<ScriptConfig>(DEFAULT_SCRIPT_CONFIG);
  const [logs, setLogs] = useState<RestLogEntry[]>([]);

  const [completedChecklistIds, setCompletedChecklistIds] = useState<string[]>(
    () => {
      try {
        const raw = localStorage.getItem(CHECKLIST_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as string[]) : [];
      } catch {
        return [];
      }
    },
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        CHECKLIST_STORAGE_KEY,
        JSON.stringify(completedChecklistIds),
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [completedChecklistIds]);

  const activeEndpointUrl =
    targetMode === 'mockapi' && mockApiUrl.trim()
      ? mockApiUrl.trim().replace(/\/+$/, '')
      : '/api/books';

  useEffect(() => {
    setConfig((prev) => ({
      ...prev,
      apiUrl:
        targetMode === 'mockapi' && mockApiUrl.trim()
          ? mockApiUrl.trim().replace(/\/+$/, '')
          : DEFAULT_MOCKAPI_PLACEHOLDER,
    }));
  }, [targetMode, mockApiUrl]);

  const appendLog = useCallback((entry: RestLogEntry) => {
    setLogs((prev) => [entry, ...prev].slice(0, 24));
  }, []);

  const performRestCall = useCallback(
    async (
      stepLabel: string,
      method: HttpMethod,
      pathSuffix: string,
      body?: unknown,
    ): Promise<{status: number; ok: boolean; data: unknown}> => {
      const start = performance.now();

      if (targetMode === 'mockapi') {
        const base = mockApiUrl.trim().replace(/\/+$/, '');
        if (!base) {
          throw new Error(
            'Enter your mockapi.io books URL before running live MockAPI requests.',
          );
        }
        const fullTargetUrl = pathSuffix ? `${base}${pathSuffix}` : base;

        const proxyRes = await fetch('/api/proxy', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            targetUrl: fullTargetUrl,
            method,
            body,
          }),
        });

        const proxyPayload = await proxyRes.json();
        if (!proxyRes.ok) {
          throw new Error(proxyPayload?.error || 'Proxy request failed.');
        }

        appendLog({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          stepLabel,
          method,
          url: fullTargetUrl,
          status: proxyPayload.status,
          statusText: proxyPayload.statusText || '',
          ok: Boolean(proxyPayload.ok),
          durationMs: proxyPayload.durationMs ?? Math.round(performance.now() - start),
          requestBody: body,
          responseBody: proxyPayload.data,
          timestamp: new Date().toLocaleTimeString(),
        });

        return {
          status: proxyPayload.status,
          ok: Boolean(proxyPayload.ok),
          data: proxyPayload.data,
        };
      }

      const url = pathSuffix ? `/api/books${pathSuffix}` : '/api/books';
      const res = await fetch(url, {
        method,
        headers:
          method === 'POST' || method === 'PUT'
            ? {'Content-Type': 'application/json'}
            : undefined,
        body:
          method === 'POST' || method === 'PUT'
            ? JSON.stringify(body ?? {})
            : undefined,
      });

      const rawText = await res.text();
      let parsedData: unknown = rawText;
      try {
        parsedData = JSON.parse(rawText);
      } catch {
        parsedData = rawText;
      }

      const durationMs = Math.round(performance.now() - start);
      appendLog({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        stepLabel,
        method,
        url: `${window.location.origin}${url}`,
        status: res.status,
        statusText: res.statusText || (res.ok ? 'OK' : 'Error'),
        ok: res.ok,
        durationMs,
        requestBody: body,
        responseBody: parsedData,
        timestamp: new Date().toLocaleTimeString(),
      });

      return {
        status: res.status,
        ok: res.ok,
        data: parsedData,
      };
    },
    [targetMode, mockApiUrl, appendLog],
  );

  const loadBooks = useCallback(async () => {
    setLoadingBooks(true);
    setBooksError(null);
    try {
      if (targetMode === 'mockapi') {
        const base = mockApiUrl.trim().replace(/\/+$/, '');
        if (!base) {
          setBooks([]);
          setBooksError('Paste your https://...mockapi.io/api/v1/books URL above to load live records, or switch to the Built-in Sandbox.');
          setLoadingBooks(false);
          return;
        }
        const proxyRes = await fetch('/api/proxy', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({targetUrl: base, method: 'GET'}),
        });
        const payload = await proxyRes.json();
        if (!proxyRes.ok || !payload.ok) {
          throw new Error(
            payload?.error || `HTTP ${payload?.status ?? 500} loading MockAPI books.`,
          );
        }
        setBooks(Array.isArray(payload.data) ? payload.data : []);
      } else {
        const res = await fetch('/api/books');
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} loading sandbox books.`);
        }
        const data = (await res.json()) as Book[];
        setBooks(data);
      }
    } catch (err) {
      setBooksError(
        err instanceof Error ? err.message : 'Unable to fetch books.',
      );
    } finally {
      setLoadingBooks(false);
    }
  }, [targetMode, mockApiUrl]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  async function handleResetSandbox() {
    if (targetMode !== 'sandbox') return;
    setBusyOperation(true);
    setBooksError(null);
    try {
      const res = await fetch('/api/books/reset', {method: 'POST'});
      if (!res.ok) throw new Error('Failed to reset sandbox inventory.');
      const data = (await res.json()) as Book[];
      setBooks(data);
    } catch (err) {
      setBooksError(
        err instanceof Error ? err.message : 'Failed to reset inventory.',
      );
    } finally {
      setBusyOperation(false);
    }
  }

  async function handleExecuteGetAll() {
    setBusyOperation(true);
    setBooksError(null);
    try {
      const result = await performRestCall('1a. GET all books', 'GET', '');
      if (result.ok && Array.isArray(result.data)) {
        setBooks(result.data as Book[]);
      }
    } catch (err) {
      setBooksError(
        err instanceof Error ? err.message : 'GET request failed.',
      );
    } finally {
      setBusyOperation(false);
    }
  }

  async function handleExecutePost() {
    setBusyOperation(true);
    setBooksError(null);
    try {
      await performRestCall('1b. POST 6th new book', 'POST', '', config.postBook);
      await loadBooks();
    } catch (err) {
      setBooksError(
        err instanceof Error ? err.message : 'POST request failed.',
      );
    } finally {
      setBusyOperation(false);
    }
  }

  async function handleExecutePut() {
    const targetId = config.putTargetId.trim();
    if (!targetId) {
      setBooksError('Specify a Target Book ID before sending PUT.');
      return;
    }
    setBusyOperation(true);
    setBooksError(null);
    try {
      await performRestCall(
        `1c. PUT replace book #${targetId}`,
        'PUT',
        `/${encodeURIComponent(targetId)}`,
        config.putBook,
      );
      await loadBooks();
    } catch (err) {
      setBooksError(
        err instanceof Error ? err.message : 'PUT request failed.',
      );
    } finally {
      setBusyOperation(false);
    }
  }

  async function handleExecuteDeleteAndVerify() {
    const targetId = config.deleteTargetId.trim();
    if (!targetId) {
      setBooksError('Specify a Book ID before sending DELETE.');
      return;
    }
    setBusyOperation(true);
    setBooksError(null);
    try {
      await performRestCall(
        `1d. DELETE book #${targetId}`,
        'DELETE',
        `/${encodeURIComponent(targetId)}`,
      );
      await performRestCall(
        `1d. Verify GET #${targetId} returns HTTPError`,
        'GET',
        `/${encodeURIComponent(targetId)}`,
      );
      await loadBooks();
    } catch (err) {
      setBooksError(
        err instanceof Error ? err.message : 'DELETE verification failed.',
      );
    } finally {
      setBusyOperation(false);
    }
  }

  async function handleRunFullSequence() {
    setBusyOperation(true);
    setBooksError(null);
    try {
      await performRestCall('1a. GET all books', 'GET', '');
      await performRestCall('1b. POST 6th new book', 'POST', '', config.postBook);

      const putId = config.putTargetId.trim() || '2';
      await performRestCall(
        `1c. PUT replace book #${putId}`,
        'PUT',
        `/${encodeURIComponent(putId)}`,
        config.putBook,
      );

      const delId = config.deleteTargetId.trim() || '4';
      await performRestCall(
        `1d. DELETE book #${delId}`,
        'DELETE',
        `/${encodeURIComponent(delId)}`,
      );
      await performRestCall(
        `1d. Verify GET #${delId} returns HTTPError`,
        'GET',
        `/${encodeURIComponent(delId)}`,
      );

      await loadBooks();
    } catch (err) {
      setBooksError(
        err instanceof Error ? err.message : 'Sequence execution failed.',
      );
    } finally {
      setBusyOperation(false);
    }
  }

  function handleDownloadPython() {
    const scriptContent = generateBookstorePythonScript(config, scriptMode);
    const blob = new Blob([scriptContent], {type: 'text/x-python'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bookstore_api.py';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function handleSelectBookForEdit(book: Book) {
    setConfig((prev) => ({
      ...prev,
      putTargetId: book.id,
      putBook: {
        title: book.title,
        author: book.author,
        rating: book.rating,
      },
    }));
  }

  function handleSelectBookForDelete(id: string) {
    setConfig((prev) => ({
      ...prev,
      deleteTargetId: id,
    }));
  }

  function handleToggleChecklistItem(id: string) {
    setCompletedChecklistIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopBar onDownloadPython={handleDownloadPython} />

      <main className="mx-auto max-w-[1440px] space-y-6 px-6 py-8">
        <section
          id="workspace"
          className="rounded-xl border border-slate-200 bg-white px-6 py-5"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-medium text-slate-500">
                Unit 5 Practical Exercise · Bookstore Inventory REST Backend &amp; Python Client
              </p>
              <h1
                className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
                style={{textWrap: 'balance'}}
              >
                Bookstore Inventory API &amp; Python Workbench
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Test all four REST operations (<span className="font-mono text-xs text-slate-800">GET</span>,{' '}
                <span className="font-mono text-xs text-slate-800">POST</span>,{' '}
                <span className="font-mono text-xs text-slate-800">PUT</span>,{' '}
                <span className="font-mono text-xs text-slate-800">DELETE</span> + 404 check) against the built-in sandbox or your own{' '}
                <span className="font-mono text-xs text-slate-800">mockapi.io</span> URL, then download your ready-to-submit{' '}
                <span className="font-mono text-xs text-slate-800">bookstore_api.py</span>.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:min-w-[420px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-slate-700">
                  API Target Environment
                </span>
                <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setTargetMode('sandbox')}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      targetMode === 'sandbox'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Built-in Sandbox
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetMode('mockapi')}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      targetMode === 'mockapi'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    My MockAPI.io URL
                  </button>
                </div>
              </div>

              {targetMode === 'mockapi' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={mockApiUrl}
                    onChange={(e) => setMockApiUrl(e.target.value)}
                    placeholder="https://YOUR_PROJECT_ID.mockapi.io/api/v1/books"
                    aria-label="MockAPI.io books URL"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={loadBooks}
                    className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Connect
                  </button>
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600">
                  Active Endpoint: {activeEndpointUrl} (5 starter books loaded)
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7">
            <InventoryTable
              books={books}
              loading={loadingBooks}
              error={booksError}
              targetMode={targetMode}
              selectedBookId={config.putTargetId}
              onSelectBookForEdit={handleSelectBookForEdit}
              onSelectBookForDelete={handleSelectBookForDelete}
              onRefresh={loadBooks}
              onResetSandbox={handleResetSandbox}
            />
          </div>

          <div className="lg:col-span-5">
            <RestOperationsPanel
              config={config}
              busy={busyOperation}
              logs={logs}
              onChangeConfig={setConfig}
              onExecuteGetAll={handleExecuteGetAll}
              onExecutePost={handleExecutePost}
              onExecutePut={handleExecutePut}
              onExecuteDeleteAndVerify={handleExecuteDeleteAndVerify}
              onRunFullSequence={handleRunFullSequence}
              onClearLogs={() => setLogs([])}
            />
          </div>
        </div>

        <PythonScriptStudio
          config={config}
          scriptMode={scriptMode}
          logs={logs}
          onChangeScriptMode={setScriptMode}
          onDownloadScript={handleDownloadPython}
        />

        <SeedAndChecklist
          completedIds={completedChecklistIds}
          onToggleChecklistItem={handleToggleChecklistItem}
        />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 py-4 text-xs text-slate-500">
          <span>Bookstore API Lab · Practical Exercise Companion</span>
          <span>
            Supports GET, POST (201), PUT, and DELETE + 404 verification
          </span>
        </div>
      </footer>
    </div>
  );
}
