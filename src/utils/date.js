const DATE_PREFIX_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/;
const YEAR_FIRST_PATTERN = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/;
const DISPLAY_DATE_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/;

const padDateUnit = (value) => String(value).padStart(2, "0");

const buildValidatedDate = (year, month, day) => {
  const date = new Date(year, month - 1, day);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
};

export const parseDateValue = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  }

  if (typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) return null;

  const datePrefixMatch = DATE_PREFIX_PATTERN.exec(trimmed);
  if (datePrefixMatch) {
    return buildValidatedDate(
      Number(datePrefixMatch[1]),
      Number(datePrefixMatch[2]),
      Number(datePrefixMatch[3])
    );
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const normalizeDateInputValue = (value) => {
  const date = parseDateValue(value);
  if (!date) return "";

  return [
    date.getFullYear(),
    padDateUnit(date.getMonth() + 1),
    padDateUnit(date.getDate()),
  ].join("-");
};

const normalizeTwoDigitYear = (value) => {
  if (value.length !== 2) return Number(value);
  const year = Number(value);
  return year >= 70 ? 1900 + year : 2000 + year;
};

export const parseDateInputDisplay = (value) => {
  if (!value) return "";

  const trimmed = String(value).trim();
  if (!trimmed) return "";

  const normalizedIsoValue = normalizeDateInputValue(trimmed);
  if (normalizedIsoValue && DATE_PREFIX_PATTERN.test(trimmed)) {
    return normalizedIsoValue;
  }

  const yearFirstMatch = YEAR_FIRST_PATTERN.exec(trimmed);
  if (yearFirstMatch) {
    return normalizeDateInputValue(
      buildValidatedDate(
        Number(yearFirstMatch[1]),
        Number(yearFirstMatch[2]),
        Number(yearFirstMatch[3])
      )
    );
  }

  const normalizedDisplayValue = trimmed.replaceAll(".", "/").replaceAll("-", "/");
  const match = DISPLAY_DATE_PATTERN.exec(normalizedDisplayValue);
  if (!match) return "";

  const date = buildValidatedDate(
    normalizeTwoDigitYear(match[3]),
    Number(match[2]),
    Number(match[1])
  );

  return normalizeDateInputValue(date);
};

export const formatDateDisplay = (
  value,
  fallback = "Chưa cập nhật",
  options = {}
) => {
  const { includeYear = true, year = "numeric" } = options;
  const date = parseDateValue(value);
  if (!date) return fallback || (value ? String(value) : "");

  const day = padDateUnit(date.getDate());
  const month = padDateUnit(date.getMonth() + 1);

  if (!includeYear) {
    return `${day}/${month}`;
  }

  const fullYear = String(date.getFullYear());
  const displayYear = year === "numeric" ? fullYear : fullYear.slice(-2);

  return `${day}/${month}/${displayYear}`;
};

export const formatDateInputDisplay = (value, fallback = "") =>
  formatDateDisplay(value, fallback, { year: "numeric" });
