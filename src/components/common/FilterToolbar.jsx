import { FiSearch, FiX } from "react-icons/fi";

export default function FilterToolbar({
  value = "",
  onChange,
  placeholder = "Tìm kiếm",
  actions = null,
  children = null,
  summary = "",
  className = "",
}) {
  return (
    <section
      className={[
        "rounded-[24px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:p-5",
        className,
      ].join(" ")}
    >
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
        <label className="flex min-w-0 items-center gap-3 rounded-full border border-white/10 bg-[#101010] px-4 py-3 text-sm text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <FiSearch className="shrink-0 text-white/45" />
          <input
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
            placeholder={placeholder}
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
          />
          {value ? (
            <button
              type="button"
              onClick={() => onChange?.("")}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-white/50 transition md:hover:bg-white/[0.1] md:hover:text-white"
              aria-label="Xóa từ khóa"
            >
              <FiX size={14} />
            </button>
          ) : null}
        </label>

        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>

      {children ? <div className="mt-4">{children}</div> : null}
      {summary ? (
        <p className="mt-3 text-xs leading-relaxed text-white/48">{summary}</p>
      ) : null}
    </section>
  );
}
