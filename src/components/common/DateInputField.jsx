import { useEffect, useRef, useState } from "react";
import { FiCalendar } from "react-icons/fi";
import {
  formatDateInputDisplay,
  normalizeDateInputValue,
  parseDateInputDisplay,
} from "../../utils/date";

const ISO_LIKE_PATTERN = /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/;

const maskDateInputValue = (value) => {
  const digits = String(value || "")
    .replace(/\D/g, "")
    .slice(0, 8);

  if (!digits) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

export default function DateInputField({
  value,
  onChange,
  className = "",
  id,
  name,
  placeholder = "dd/mm/yyyy",
  disabled = false,
  buttonLabel = "Mở lịch",
}) {
  const nativeInputRef = useRef(null);
  const [displayValue, setDisplayValue] = useState(
    formatDateInputDisplay(value, "")
  );

  useEffect(() => {
    setDisplayValue(formatDateInputDisplay(value, ""));
  }, [value]);

  const updateValue = (nextValue) => {
    if (typeof onChange === "function") {
      onChange(nextValue);
    }
  };

  const handleTextChange = (event) => {
    const rawValue = event.target.value;

    if (!rawValue.trim()) {
      setDisplayValue("");
      updateValue("");
      return;
    }

    if (ISO_LIKE_PATTERN.test(rawValue.trim())) {
      const parsedIsoValue = parseDateInputDisplay(rawValue);
      if (parsedIsoValue) {
        setDisplayValue(formatDateInputDisplay(parsedIsoValue));
        updateValue(parsedIsoValue);
        return;
      }
    }

    const maskedValue = maskDateInputValue(rawValue);
    setDisplayValue(maskedValue);

    const parsedValue = parseDateInputDisplay(maskedValue);
    if (parsedValue) {
      updateValue(parsedValue);
    }
  };

  const handleBlur = () => {
    if (!displayValue.trim()) {
      setDisplayValue("");
      updateValue("");
      return;
    }

    const parsedValue = parseDateInputDisplay(displayValue);
    if (parsedValue) {
      setDisplayValue(formatDateInputDisplay(parsedValue));
      updateValue(parsedValue);
      return;
    }

    setDisplayValue(formatDateInputDisplay(value, ""));
  };

  const handleNativeChange = (event) => {
    const nextValue = normalizeDateInputValue(event.target.value);
    setDisplayValue(formatDateInputDisplay(nextValue, ""));
    updateValue(nextValue);
  };

  const openPicker = () => {
    if (disabled) return;

    const input = nativeInputRef.current;
    if (!input) return;

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.focus();
    input.click();
  };

  return (
    <div className="shared-date-input-shell">
      <input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={displayValue}
        onChange={handleTextChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`shared-date-input-field ${className}`.trim()}
      />
      <button
        type="button"
        onClick={openPicker}
        disabled={disabled}
        aria-label={buttonLabel}
        className="shared-date-input-button"
      >
        <FiCalendar />
      </button>
      <input
        ref={nativeInputRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        value={normalizeDateInputValue(value)}
        onChange={handleNativeChange}
        className="shared-date-input-native"
      />
    </div>
  );
}
