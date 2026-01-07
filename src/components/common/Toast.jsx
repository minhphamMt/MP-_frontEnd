import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";

export default function Toast({
  title = "Thông báo",
  message,
  onClose,
  duration = 3500,
}) {
  useEffect(() => {
    if (!message) return undefined;

    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  return createPortal(
    <div
      className="
        fixed top-6 left-1/2 -translate-x-1/2 z-[70] max-w-sm
        rounded-xl border border-white/10
        bg-[#0e1a2f] px-4 py-3 text-sm text-white
        shadow-2xl shadow-cyan-500/20
        animate-[toast-in_0.35s_cubic-bezier(0.22,1,0.36,1)]
      "
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="flex items-start gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">
            {title}
          </p>
          <p className="font-semibold leading-relaxed">{message}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onClose();
          }}
          className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20"
          aria-label="Đóng thông báo"
        >
          <FiX />
        </button>
      </div>

      <style>
        {`
          @keyframes toast-in {
            from {
              opacity: 0;
              transform: translate(-50%, -14px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
        `}
      </style>
    </div>,
    document.body
  );
}