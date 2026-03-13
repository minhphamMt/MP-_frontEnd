import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiCheck, FiLink2, FiShare2 } from "react-icons/fi";
import { emitAppToast } from "../../utils/appToast";

const PREVIEW_MAX_WIDTH = 320;
const PREVIEW_VIEWPORT_PADDING = 16;
const PREVIEW_GAP = 14;
const PREVIEW_MIN_DESKTOP_WIDTH = 768;

const buildAbsoluteUrl = (path = "") => {
  if (typeof window === "undefined") return path || "";
  if (!path) return window.location.href;
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path, window.location.origin).toString();
};

const copyText = async (value) => {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }

  if (typeof document === "undefined") return false;

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  return copied;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function ShareLinkButton({
  path = "",
  title = "Chia sẻ",
  shareTitle,
  shareText,
  className = "",
  compact = false,
  variant = "default",
  preview = null,
  previewPlacement = "top",
}) {
  const [status, setStatus] = useState("idle");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewLayout, setPreviewLayout] = useState(null);
  const wrapperRef = useRef(null);
  const previewRef = useRef(null);
  const resolvedUrl = useMemo(() => buildAbsoluteUrl(path), [path]);
  const previewDomain = useMemo(
    () => resolvedUrl.replace(/^https?:\/\//i, "").replace(/\/$/, ""),
    [resolvedUrl]
  );

  useEffect(() => {
    if (status !== "success") return undefined;
    const timer = setTimeout(() => setStatus("idle"), 1800);
    return () => clearTimeout(timer);
  }, [status]);

  const updatePreviewLayout = () => {
    if (
      typeof window === "undefined" ||
      !wrapperRef.current ||
      window.innerWidth < PREVIEW_MIN_DESKTOP_WIDTH
    ) {
      setPreviewLayout(null);
      return;
    }

    const triggerRect = wrapperRef.current.getBoundingClientRect();
    const width = Math.min(
      PREVIEW_MAX_WIDTH,
      Math.max(220, window.innerWidth - PREVIEW_VIEWPORT_PADDING * 2)
    );
    const measuredHeight = previewRef.current?.offsetHeight || 288;
    const preferredPlacement = previewPlacement === "bottom" ? "bottom" : "top";
    const spaceAbove = triggerRect.top - PREVIEW_VIEWPORT_PADDING;
    const spaceBelow =
      window.innerHeight - triggerRect.bottom - PREVIEW_VIEWPORT_PADDING;

    let placement = preferredPlacement;
    if (preferredPlacement === "top" && spaceAbove < measuredHeight && spaceBelow > spaceAbove) {
      placement = "bottom";
    } else if (
      preferredPlacement === "bottom" &&
      spaceBelow < measuredHeight &&
      spaceAbove > spaceBelow
    ) {
      placement = "top";
    }

    const left = clamp(
      triggerRect.right - width,
      PREVIEW_VIEWPORT_PADDING,
      window.innerWidth - width - PREVIEW_VIEWPORT_PADDING
    );

    const top =
      placement === "bottom"
        ? clamp(
            triggerRect.bottom + PREVIEW_GAP,
            PREVIEW_VIEWPORT_PADDING,
            window.innerHeight - measuredHeight - PREVIEW_VIEWPORT_PADDING
          )
        : clamp(
            triggerRect.top - measuredHeight - PREVIEW_GAP,
            PREVIEW_VIEWPORT_PADDING,
            window.innerHeight - measuredHeight - PREVIEW_VIEWPORT_PADDING
          );

    setPreviewLayout({ left, top, width, placement });
  };

  useEffect(() => {
    if (!previewVisible) return undefined;

    updatePreviewLayout();

    const handleViewportChange = () => {
      if (window.innerWidth < PREVIEW_MIN_DESKTOP_WIDTH) {
        setPreviewVisible(false);
        setPreviewLayout(null);
        return;
      }
      updatePreviewLayout();
    };

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [previewPlacement, previewVisible]);

  useEffect(() => {
    if (!previewVisible) return undefined;
    const raf = window.requestAnimationFrame(() => {
      updatePreviewLayout();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [preview, previewVisible]);

  const openPreview = () => {
    if (!preview || compact || typeof window === "undefined") return;
    if (window.innerWidth < PREVIEW_MIN_DESKTOP_WIDTH) return;
    setPreviewVisible(true);
  };

  const closePreview = () => {
    setPreviewVisible(false);
  };

  const handleShare = async () => {
    const payload = {
      title: shareTitle || title,
      text:
        shareText ||
        preview?.description ||
        (shareTitle ? `${shareTitle} trên Khoaluan Music` : title),
      url: resolvedUrl,
    };

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share(payload);
        setStatus("success");
        emitAppToast({
          title: "Chia sẻ",
          message: "Đã mở bảng chia sẻ của thiết bị.",
        });
        return;
      }

      if (await copyText(resolvedUrl)) {
        setStatus("success");
        emitAppToast({
          title: "Đã sao chép",
          message: "Liên kết đã được sao chép vào bộ nhớ tạm.",
        });
        return;
      }

      setStatus("idle");
      emitAppToast({
        title: "Không thể chia sẻ",
        message: "Liên kết chưa thể được sao chép lúc này.",
      });
    } catch (error) {
      if (error?.name === "AbortError") return;
      setStatus("idle");
      emitAppToast({
        title: "Không thể chia sẻ",
        message: "Liên kết chưa thể được chia sẻ lúc này. Hãy thử lại sau.",
      });
    }
  };

  const isSuccess = status === "success";
  const Icon = isSuccess ? FiCheck : compact ? FiLink2 : FiShare2;
  const isToolbarVariant = variant === "toolbar";
  const showPreview = Boolean(preview && !compact && previewVisible && previewLayout);
  const baseClass = compact
    ? isToolbarVariant
      ? "ui-pressable inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#111314] text-white/78 ring-1 ring-inset ring-[#202425] shadow-[0_12px_28px_rgba(0,0,0,0.24)] transition md:hover:bg-[#171a1c] md:hover:text-white md:hover:ring-[#2a2f30]"
      : "ui-pressable inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-white/80 transition md:hover:border-white/30 md:hover:bg-white/[0.1] md:hover:text-white"
    : isToolbarVariant
      ? "ui-pressable inline-flex items-center gap-2 rounded-full bg-[#111314] px-4 py-2.5 text-sm font-semibold text-white/82 ring-1 ring-inset ring-[#202425] shadow-[0_12px_28px_rgba(0,0,0,0.24)] transition md:hover:bg-[#171a1c] md:hover:text-white md:hover:ring-[#2a2f30]"
      : "ui-pressable inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white/85 transition md:hover:border-white/30 md:hover:bg-white/[0.1] md:hover:text-white";

  return (
    <>
      <div
        ref={wrapperRef}
        className="relative inline-flex max-w-full"
        onMouseEnter={openPreview}
        onMouseLeave={closePreview}
        onFocusCapture={openPreview}
        onBlurCapture={(event) => {
          if (!wrapperRef.current?.contains(event.relatedTarget)) {
            closePreview();
          }
        }}
      >
        <button
          type="button"
          onClick={handleShare}
          className={[
            baseClass,
            isSuccess ? "border-emerald-400/40 bg-emerald-400/12 text-emerald-100" : "",
            className,
          ].join(" ")}
          aria-label={isSuccess ? "Đã sao chép liên kết" : title}
          title={isSuccess ? "Đã sao chép liên kết" : title}
        >
          <Icon className={compact ? "text-base" : "text-[15px]"} />
          {!compact ? <span>{isSuccess ? "Đã chép link" : title}</span> : null}
        </button>
      </div>

      {showPreview && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={previewRef}
              className="pointer-events-none fixed z-[120] ui-pop-in"
              style={{
                left: previewLayout.left,
                top: previewLayout.top,
                width: previewLayout.width,
              }}
            >
              <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0d0f10]/96 shadow-[0_30px_80px_rgba(0,0,0,0.58)] ring-1 ring-inset ring-white/6 backdrop-blur-2xl">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,_rgba(29,185,84,0.18),_transparent_72%)]" />
                <div className="relative p-3">
                  <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#151718]">
                    {preview?.image ? (
                      <img
                        src={preview.image}
                        alt={preview.title || title}
                        className="aspect-[16/9] w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[16/9] w-full items-center justify-center bg-[linear-gradient(135deg,rgba(29,185,84,0.16),rgba(255,255,255,0.06))] text-white/55">
                        <FiShare2 className="text-2xl" />
                      </div>
                    )}
                  </div>

                  <div className="mt-3 space-y-2 px-1">
                    {preview?.eyebrow ? (
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">
                        {preview.eyebrow}
                      </p>
                    ) : null}
                    <div>
                      <p className="line-clamp-2 text-base font-bold text-white">
                        {preview?.title || shareTitle || title}
                      </p>
                      {preview?.subtitle ? (
                        <p className="mt-1 text-sm text-emerald-200/82">{preview.subtitle}</p>
                      ) : null}
                    </div>
                    {preview?.description ? (
                      <p className="line-clamp-3 text-sm leading-relaxed text-white/62">
                        {preview.description}
                      </p>
                    ) : null}
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-[11px] text-white/46">
                      <span className="truncate">{previewDomain}</span>
                      <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/55">
                        Chia sẻ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
