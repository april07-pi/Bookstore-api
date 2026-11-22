import {useMemo, useState} from 'react';
import {Check, Copy, Download} from 'lucide-react';
import {
  ASSIGNMENT_CHECKLIST,
  PART_A_SEED_BOOKS,
} from '../data/bookstoreTemplates';

interface SeedAndChecklistProps {
  completedIds: string[];
  onToggleChecklistItem: (id: string) => void;
}

export function SeedAndChecklist({
  completedIds,
  onToggleChecklistItem,
}: SeedAndChecklistProps) {
  const [copiedSeed, setCopiedSeed] = useState(false);

  const seedJson = useMemo(
    () => JSON.stringify(PART_A_SEED_BOOKS, null, 2),
    [],
  );

  async function handleCopySeed() {
    try {
      await navigator.clipboard.writeText(seedJson);
      setCopiedSeed(true);
      setTimeout(() => setCopiedSeed(false), 1800);
    } catch {
      // Clipboard API unavailable
    }
  }

  function handleDownloadSeed() {
    const blob = new Blob([seedJson], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'books_seed_5.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  const sections = [
    'Part A: MockAPI Setup',
    'Part B: Python Script',
    'Bonus & Submission',
  ] as const;

  const completedCount = completedIds.length;
  const totalCount = ASSIGNMENT_CHECKLIST.length;

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-stretch">
      <section
        id="mockapi-seed"
        className="lg:col-span-6 flex flex-col rounded-xl border border-slate-200 bg-white"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Part A: MockAPI.io Seed Data (5 Books)
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Paste directly into the <span className="font-medium text-slate-700">books</span> Data tab on mockapi.io. All fields are double-quoted strings.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySeed}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copiedSeed ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Copied JSON</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Seed JSON</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownloadSeed}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download .json</span>
            </button>
          </div>
        </div>

        <div className="flex-1 p-5 flex flex-col justify-between gap-4">
          <pre className="max-h-96 overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-100">
            <code>{seedJson}</code>
          </pre>

          <div className="grid gap-3 sm:grid-cols-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
            <div>
              <p className="font-medium text-slate-900">Project &amp; Resource</p>
              <p className="mt-0.5">
                Project: <span className="font-mono text-slate-800">Bookstore</span> · Resource: <span className="font-mono text-slate-800">books</span>
              </p>
            </div>
            <div>
              <p className="font-medium text-slate-900">Required String Fields</p>
              <p className="mt-0.5 font-mono text-slate-800">
                id, title, author, rating
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="checklist"
        className="lg:col-span-6 flex flex-col rounded-xl border border-slate-200 bg-white"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Submission Verification Checklist
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Track every Part A, Part B, Bonus, and ZIP submission requirement.
            </p>
          </div>
          <span className="font-mono text-xs font-medium text-slate-700 tabular-nums">
            {completedCount} / {totalCount} complete
          </span>
        </div>

        <div className="flex-1 divide-y divide-slate-100 px-5 py-2">
          {sections.map((sectionName) => {
            const items = ASSIGNMENT_CHECKLIST.filter(
              (item) => item.section === sectionName,
            );
            return (
              <div key={sectionName} className="py-3.5">
                <h3 className="mb-2.5 text-xs font-semibold text-slate-900">
                  {sectionName}
                </h3>
                <ul className="space-y-2.5">
                  {items.map((item) => {
                    const checked = completedIds.includes(item.id);
                    return (
                      <li key={item.id}>
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => onToggleChecklistItem(item.id)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <p
                              className={`text-xs font-medium leading-snug ${
                                checked
                                  ? 'text-slate-400 line-through'
                                  : 'text-slate-800 group-hover:text-slate-950'
                              }`}
                            >
                              {item.label}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              {item.detail}
                            </p>
                          </div>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
