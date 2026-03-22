import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck, FiEye, FiEyeOff, FiX } from "react-icons/fi";

const MotionDiv = motion.div;

const modalThemeClasses = {
  listener: "auth-shell-listener",
  artist: "auth-shell-artist",
};

const cardVariants = {
  hero: "auth-hero-card",
  main: "auth-main-card",
  soft: "auth-soft-card",
};

const messageTones = {
  error: "auth-ui-message--error",
  success: "auth-ui-message--success",
  info: "auth-ui-message--info",
  warning: "auth-ui-message--warning",
};

export function AuthCard({ variant = "main", className = "", children }) {
  return (
    <div className={clsx(cardVariants[variant] ?? cardVariants.main, "relative overflow-hidden rounded-[28px]", className)}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/12" />
      <div
        className="pointer-events-none absolute -right-10 top-8 h-20 w-20 rounded-full blur-[60px]"
        style={{ backgroundColor: "rgb(var(--auth-accent-rgb) / 0.14)" }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export function AuthPill({ children, muted = false, className = "" }) {
  return <span className={clsx(muted ? "auth-ui-pill auth-ui-pill--muted" : "auth-ui-pill", className)}>{children}</span>;
}

export function AuthMessage({ tone = "error", className = "", children }) {
  return <div className={clsx("auth-ui-message", messageTones[tone] ?? messageTones.error, className)}>{children}</div>;
}

export function AuthTabs({ items, value, onChange, className = "" }) {
  return (
    <div className={clsx("auth-ui-tab-list", className)}>
      {items.map((item) => {
        const active = value === item.key;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={clsx("auth-ui-tab", active && "is-active")}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export function AuthField({
  label,
  error = "",
  helper = "",
  as = "input",
  className = "",
  inputClassName = "",
  children = null,
  ...props
}) {
  const Component = as;

  return (
    <label className={clsx("block space-y-2 text-sm", className)}>
      {label ? <span className="auth-ui-kicker text-white/58">{label}</span> : null}
      {children ? (
        children
      ) : (
        <Component
          className={clsx("auth-ui-input", as === "textarea" && "auth-ui-textarea", inputClassName)}
          {...props}
        />
      )}
      {error ? <p className="text-xs text-rose-300">{error}</p> : helper ? <p className="text-xs text-white/42">{helper}</p> : null}
    </label>
  );
}

export function AuthPasswordField({
  label,
  value,
  onChange,
  autoComplete,
  showPassword,
  toggleShowPassword,
  error = "",
  helper = "",
  className = "",
  inputClassName = "",
  ...props
}) {
  return (
    <label className={clsx("block space-y-2 text-sm", className)}>
      <span className="auth-ui-kicker text-white/58">{label}</span>
      <div className="relative">
        <input
          className={clsx("auth-ui-input pr-12", inputClassName)}
          value={value}
          onChange={onChange}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          {...props}
        />
        <button
          type="button"
          onClick={toggleShowPassword}
          className="auth-ui-icon-button auth-ui-password-toggle absolute right-3 top-1/2"
          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>
      {error ? <p className="text-xs text-rose-300">{error}</p> : helper ? <p className="text-xs text-white/42">{helper}</p> : null}
    </label>
  );
}

export function AuthMetricCard({ value, label, description, className = "" }) {
  return (
    <div className={clsx("auth-soft-card rounded-[22px] px-4 py-3.5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[1.15rem] font-semibold tracking-[-0.04em] text-white">{value}</div>
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/46">{label}</div>
        </div>
        <div
          className="h-2.5 w-2.5 rounded-full shadow-[0_0_18px_rgba(255,255,255,0.18)]"
          style={{ background: "rgb(var(--auth-accent-rgb))" }}
        />
      </div>
      {description ? <p className="mt-3 text-[12px] leading-5 text-white/62">{description}</p> : null}
    </div>
  );
}

export function AuthChecklist({ items, className = "" }) {
  return (
    <div className={clsx("grid gap-2.5", className)}>
      {items.map((item) => {
        const entry = typeof item === "string" ? { title: item } : item;

        return (
          <div
            key={`${entry.title}-${entry.description || ""}`}
            className="auth-soft-card flex items-start gap-3 rounded-[20px] px-4 py-3"
          >
            <div
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/25"
              style={{ color: "rgb(var(--auth-accent-rgb))" }}
            >
              <FiCheck size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white/88">{entry.title}</p>
              {entry.description ? <p className="mt-1 text-[12px] leading-5 text-white/58">{entry.description}</p> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AuthDivider({ children }) {
  return (
    <div className="flex items-center gap-3 py-1.5 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-white/34">
      <span className="h-px flex-1 bg-white/10" />
      <span>{children}</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

export function AuthModal({
  open,
  onClose,
  icon = null,
  title,
  description,
  children,
  theme = "listener",
  className = "",
}) {
  const themeClassName = modalThemeClasses[theme] ?? modalThemeClasses.listener;

  return (
    <AnimatePresence>
      {open ? (
        <MotionDiv
          className={clsx("auth-ui-modal-backdrop", themeClassName)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <MotionDiv
            className={clsx("auth-ui-modal-card auth-main-card w-full max-w-[460px] rounded-[28px] p-5 sm:p-6", className)}
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.985 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {icon ? (
                  <div
                    className="auth-ui-modal-icon auth-soft-card flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px]"
                    style={{ color: "rgb(var(--auth-accent-rgb))" }}
                  >
                    {icon}
                  </div>
                ) : null}
                <div>
                  <h3 className="text-[1.25rem] font-semibold tracking-[-0.03em] text-white">{title}</h3>
                  {description ? <p className="mt-1 text-sm leading-6 text-white/58">{description}</p> : null}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="auth-ui-icon-button auth-ui-modal-close"
                aria-label="Đóng"
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="space-y-3">{children}</div>
          </MotionDiv>
        </MotionDiv>
      ) : null}
    </AnimatePresence>
  );
}
