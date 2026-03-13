export const stripUnderlineClasses = (value = "") =>
  String(value)
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => token !== "underline" && !token.endsWith(":underline"))
    .join(" ");
