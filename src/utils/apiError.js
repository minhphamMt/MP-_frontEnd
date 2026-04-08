const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const extractApiFieldErrors = (error) => {
  const errors = error?.response?.data?.errors;

  if (!Array.isArray(errors)) {
    return {};
  }

  return errors.reduce((accumulator, entry) => {
    const field = entry?.field;
    const message = entry?.message;

    if (
      isNonEmptyString(field) &&
      isNonEmptyString(message) &&
      !accumulator[field]
    ) {
      accumulator[field] = message.trim();
    }

    return accumulator;
  }, {});
};

export const extractApiFieldError = (error, fieldNames = []) => {
  const fieldErrors = extractApiFieldErrors(error);

  for (const fieldName of fieldNames) {
    if (fieldErrors[fieldName]) {
      return fieldErrors[fieldName];
    }
  }

  return "";
};

export const extractApiErrorMessage = (
  error,
  fallback = "Có lỗi xảy ra."
) => {
  const apiMessage = error?.response?.data?.message;
  const firstFieldMessage = Object.values(extractApiFieldErrors(error))[0];

  if (
    isNonEmptyString(apiMessage) &&
    apiMessage.trim().toLowerCase() !== "validation error"
  ) {
    return apiMessage.trim();
  }

  if (isNonEmptyString(firstFieldMessage)) {
    return firstFieldMessage;
  }

  if (isNonEmptyString(error?.message)) {
    return error.message.trim();
  }

  return fallback;
};
