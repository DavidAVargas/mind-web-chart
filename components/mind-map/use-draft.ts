import { useState, type ChangeEvent } from "react";

/**
 * Props for a text field that saves to the chart as you type. The chart
 * catches up a moment after each change, so while the field has focus it
 * shows its own copy instead. Otherwise every change would rewrite the text
 * mid-word, which breaks dictation: each guess it types gets added on
 * instead of replacing the last one.
 */
export function useDraft(value: string, save: (next: string) => void) {
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);

  return {
    value: editing ? draft : value,
    onFocus: () => {
      setDraft(value);
      setEditing(true);
    },
    onBlur: () => setEditing(false),
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setDraft(event.target.value);
      save(event.target.value);
    },
  };
}
