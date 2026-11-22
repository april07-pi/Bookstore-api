interface TopBarProps {
  onDownloadPython: () => void;
}

export function TopBar({onDownloadPython}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-6 py-3.5">
        <a
          href="#workspace"
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          Bookstore API Lab
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a
            href="#workspace"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Workspace
          </a>
          <a
            href="#python-script"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Python Script
          </a>
          <a
            href="#mockapi-seed"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            MockAPI Seed
          </a>
          <a
            href="#checklist"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Checklist
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onDownloadPython}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Download .py
          </button>
        </div>
      </div>
    </header>
  );
}
