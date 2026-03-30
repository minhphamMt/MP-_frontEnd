export const AUTH_REQUIRED_EVENT = "app:auth-required";

const DEFAULT_MESSAGE = "Vui lòng đăng nhập để tận hưởng thêm nhiều tính năng.";

export const emitAuthRequired = (message = DEFAULT_MESSAGE) => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(AUTH_REQUIRED_EVENT, {
      detail: { message },
    })
  );
};

export const getAuthRequiredMessage = () => DEFAULT_MESSAGE;
