import { useState, useRef, KeyboardEvent } from "react";
import { X } from "lucide-react";

interface ChipInputProps {
  label: string;
  items: string[];
  placeholder?: string;
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
}

const ChipInput = ({ label, items, placeholder = "Type and press Enter", onAdd, onRemove }: ChipInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      onAdd(inputValue.trim());
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && items.length > 0) {
      onRemove(items.length - 1);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-primary">{label}</label>
      <div
        className="flex flex-wrap items-center gap-1.5 border border-input bg-background rounded-md px-2 py-2 min-h-[42px] cursor-text focus-within:ring-2 focus-within:ring-ring"
        onClick={() => inputRef.current?.focus()}
      >
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium rounded-full pl-2.5 pr-1 py-1"
          >
            {item}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(i); }}
              className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={items.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <p className="text-xs text-muted-foreground">Press Enter or comma to add</p>
    </div>
  );
};

export default ChipInput;
