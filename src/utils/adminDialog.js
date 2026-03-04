let dialogDispatcher = null;

export const registerAdminDialogDispatcher = (dispatcher) => {
  dialogDispatcher = dispatcher;
  return () => {
    if (dialogDispatcher === dispatcher) {
      dialogDispatcher = null;
    }
  };
};

const runDialog = (request, fallback) => {
  if (typeof dialogDispatcher === "function") {
    return dialogDispatcher(request);
  }
  return Promise.resolve(fallback());
};

export const confirmAdminAction = async ({
  title = "Xac nhan thao tac",
  message = "",
  confirmText = "Xac nhan",
  cancelText = "Huy",
  tone = "default",
} = {}) =>
  runDialog(
    {
      type: "confirm",
      title,
      message,
      confirmText,
      cancelText,
      tone,
    },
    () => window.confirm(message || title)
  );

export const promptAdminInput = async ({
  title = "Nhap thong tin",
  message = "",
  placeholder = "",
  initialValue = "",
  confirmText = "Xac nhan",
  cancelText = "Huy",
  tone = "default",
} = {}) =>
  runDialog(
    {
      type: "prompt",
      title,
      message,
      placeholder,
      initialValue,
      confirmText,
      cancelText,
      tone,
    },
    () => {
      const value = window.prompt(message || title, initialValue);
      return value === null ? null : value;
    }
  );
