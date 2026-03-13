import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Props {
  label: string;
  items: string[];
  placeholder: string;
  buttonLabel: string;
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
}

const ArrayFieldSection = ({ label, items, placeholder, buttonLabel, onAdd, onRemove }: Props) => {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-primary">{label}</label>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
      />
      <Button type="button" variant="default" className="w-full" onClick={handleAdd}>
        {buttonLabel}
      </Button>
      {items.length > 0 && (
        <ul className="space-y-1.5 mt-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground bg-muted rounded-md px-3 py-2">
              <span className="flex-1">{item}</span>
              <button type="button" onClick={() => onRemove(i)} className="text-destructive hover:text-destructive/80 shrink-0 mt-0.5">
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ArrayFieldSection;
