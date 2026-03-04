import { useCallback, useEffect, useRef, useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { registerAdminDialogDispatcher } from "../../utils/adminDialog";

const toneClassMap = {
  default: {
    icon: "text-amber-300",
    confirm:
      "border border-white/15 bg-white/10 text-white md:hover:bg-white/20",
  },
  danger: {
    icon: "text-rose-300",
    confirm:
      "border border-rose-400/40 bg-rose-500/15 text-rose-100 md:hover:bg-rose-500/25",
  },
};

export default function AdminDialogHost() {
  const [activeTask, setActiveTask] = useState(null);
  const [promptValue, setPromptValue] = useState("");
  const queueRef = useRef([]);
  const isBusyRef = useRef(false);

  const tryOpenNext = useCallback(() => {
    if (isBusyRef.current || queueRef.current.length === 0) return;
    const nextTask = queueRef.current.shift();
    isBusyRef.current = true;
    setActiveTask(nextTask);
  }, []);

  const enqueueDialog = useCallback(
    (request) =>
      new Promise((resolve) => {
        queueRef.current.push({ request, resolve });
        tryOpenNext();
      }),
    [tryOpenNext]
  );

  useEffect(() => registerAdminDialogDispatcher(enqueueDialog), [enqueueDialog]);

  useEffect(() => {
    if (!activeTask) {
      isBusyRef.current = false;
      tryOpenNext();
      return;
    }
    setPromptValue(activeTask.request.initialValue || "");
  }, [activeTask, tryOpenNext]);

  const closeDialog = (value) => {
    if (!activeTask) return;
    activeTask.resolve(value);
    setActiveTask(null);
  };

  if (!activeTask) return null;

  const { request } = activeTask;
  const tone = toneClassMap[request.tone] || toneClassMap.default;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-4 py-8">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#141414] p-6 text-white shadow-[0_40px_120px_rgba(0,0,0,0.65)]">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 ${tone.icon}`}
          >
            <FiAlertTriangle />
          </div>
          <div className="min-w-0 space-y-2">
            <h3 className="text-base font-semibold">{request.title || "Thong bao"}</h3>
            {request.message && <p className="text-sm text-white/70">{request.message}</p>}
          </div>
        </div>

        {request.type === "prompt" && (
          <div className="mt-5">
            <input
              value={promptValue}
              onChange={(event) => setPromptValue(event.target.value)}
              placeholder={request.placeholder || "Nhap noi dung"}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
              autoFocus
            />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => closeDialog(request.type === "confirm" ? false : null)}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition md:hover:bg-white/10"
          >
            {request.cancelText || "Huy"}
          </button>
          <button
            type="button"
            onClick={() =>
              closeDialog(request.type === "confirm" ? true : promptValue.trim())
            }
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${tone.confirm}`}
          >
            {request.confirmText || "Xac nhan"}
          </button>
        </div>
      </div>
    </div>
  );
}
