export const APP_TOAST_EVENT = "app:toast";

export const emitAppToast = ({
  title = "Thông báo",
  message = "",
  duration = 2600,
} = {}) => {
  if (typeof window === "undefined" || !message) return;

  window.dispatchEvent(
    new CustomEvent(APP_TOAST_EVENT, {
      detail: {
        title,
        message,
        duration,
      },
    })
  );
};
