export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_REGEX = /^[\x21-\x7E]+$/;
export const PASSWORD_REQUIREMENTS_TEXT =
  "Mật khẩu phải có ít nhất 6 ký tự, chỉ gồm chữ cái Latin, chữ số và ký tự đặc biệt thông dụng; không được có khoảng trắng hoặc emoji/icon.";

export const isValidPassword = (value) =>
  typeof value === "string" &&
  value.length >= PASSWORD_MIN_LENGTH &&
  PASSWORD_REGEX.test(value);

export const getPasswordValidationError = (
  value,
  { requiredMessage = "Vui lòng nhập mật khẩu." } = {}
) => {
  if (typeof value !== "string" || value.length === 0) {
    return requiredMessage;
  }

  return isValidPassword(value) ? "" : PASSWORD_REQUIREMENTS_TEXT;
};

export const getConfirmPasswordError = (
  password,
  confirmPassword,
  {
    requiredMessage = "Vui lòng nhập lại mật khẩu.",
    mismatchMessage = "Mật khẩu nhập lại chưa khớp.",
  } = {}
) => {
  if (!confirmPassword) {
    return requiredMessage;
  }

  return password === confirmPassword ? "" : mismatchMessage;
};
