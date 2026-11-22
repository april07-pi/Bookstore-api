import {useMemo, useState} from 'react';
import {Check, Copy, Download, Terminal} from 'lucide-react';
import {generateBookstorePythonScript} from '../data/bookstoreTemplates';
import type {RestLogEntry, ScriptConfig, ScriptMode} from '../types/bookstore';

interface PythonScriptStudioProps {
  config: ScriptConfig;
  scriptMode: ScriptMode;
  logs: RestLogEntry[];
  onChangeScriptMode: (mode: ScriptMode) => void;
  onDownloadScript: () => void;
}

export function PythonScriptStudio({
  config,
  scriptMode,
  logs,
  onChangeScriptMode,
  onDownloadScript,
}: PythonScriptStudioProps) {
  const [copied, setCopied] = useState(false);
  const [activePane, setActivePane] = useState<'code' | 'stdout'>('code');

  const pythonCode = useMemo(
    () => generateBookstorePythonScript(config, scriptMode),
    [config, scriptMode],
  );

  const simulatedStdout = useMemo(() => {
    if (logs.length === 0) {
      return `# Click "Run Full Sequence (a -> b -> c -> d)" in the REST Runner above\n# to preview the exact Python stdout output for your current configuration.\n\n$ python bookstore_api.py\n(waiting for execution...)`;
    }

    const ordered = [...logs].reverse();
    const lines: string[] = ['$ python bookstore_api.py', ''];
    for (const entry of ordered) {
      lines.push(`--- ${entry.stepLabel} ---`);
      if (entry.ok) {
        lines.push(`Status Code: ${entry.status}`);
        lines.push(
          `Response JSON: ${JSON.stringify(entry.responseBody)}`,
        );
      } else {
        lines.push(
          `Confirmed HTTP Error: ${entry.status} ${entry.statusText} for url: ${entry.url}`,
        );
        lines.push(`Response Body: ${JSON.stringify(entry.responseBody)}`);
      }
      lines.push('');
    }
    return lines.join('\n');
  }, [logs]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(pythonCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable
    }
  }

  return (
    <section
      id="python-script"
      className="rounded-xl border border-slate-200 bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            bookstore_api.py Generator
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Part B script with <span className="font-mono">requests</span>,{' '}
            <span className="font-mono">.raise_for_status()</span>,{' '}
            <span className="font-mono">HTTPError</span> handling, and post-DELETE verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => onChangeScriptMode('bonus')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                scriptMode === 'bonus'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bonus Functions
            </button>
            <button
              type="button"
              onClick={() => onChangeScriptMode('sequential')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                scriptMode === 'sequential'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Step-by-Step Main
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onDownloadScript}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download bookstore_api.py</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-5 py-2.5">
        <div className="flex items-center gap-1 rounded-lg bg-slate-200/70 p-0.5">
          <button
            type="button"
            onClick={() => setActivePane('code')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activePane === 'code'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            bookstore_api.py
          </button>
          <button
            type="button"
            onClick={() => setActivePane('stdout')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activePane === 'stdout'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="h-3 w-3" />
            <span>Terminal Output Preview</span>
          </button>
        </div>

        <span className="font-mono text-xs text-slate-500">
          {scriptMode === 'bonus'
            ? 'get_books · add_book · update_book · delete_book'
            : 'Linear 1a -> 1b -> 1c -> 1d'}
        </span>
      </div>

      <div className="p-5">
        <pre className="max-h-[540px] overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-100">
          <code>{activePane === 'code' ? pythonCode : simulatedStdout}</code>
        </pre>
      </div>
    </section>
  );
}
