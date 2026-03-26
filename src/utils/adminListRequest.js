export const ADMIN_LIST_TIMEOUT_MS = 8000;

const ADMIN_LIST_TIMEOUT_ERROR = "__ADMIN_LIST_TIMEOUT__";

export async function withAdminListTimeout(
  task,
  timeoutMs = ADMIN_LIST_TIMEOUT_MS
) {
  let timeoutId;

  try {
    return await Promise.race([
      Promise.resolve().then(task),
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          const timeoutError = new Error(ADMIN_LIST_TIMEOUT_ERROR);
          timeoutError.code = ADMIN_LIST_TIMEOUT_ERROR;
          reject(timeoutError);
        }, timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timeoutId);
  }
}

export function isAdminListTimeoutError(error) {
  return (
    error?.code === ADMIN_LIST_TIMEOUT_ERROR ||
    error?.message === ADMIN_LIST_TIMEOUT_ERROR
  );
}

export function getAdminListFallbackMessage(label, searchTerm = "") {
  const trimmedSearchTerm =
    typeof searchTerm === "string" ? searchTerm.trim() : "";

  if (trimmedSearchTerm) {
    return `Không tìm thấy ${label} phù hợp sau vài giây. Đang hiển thị trạng thái trống.`;
  }

  return `Chưa tải được danh sách ${label} lúc này. Đang hiển thị trạng thái trống.`;
}
