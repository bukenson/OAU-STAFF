import { Textarea } from "@/components/ui/textarea";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const RichTextSection = ({ label, value, onChange, placeholder }: Props) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-primary">{label}</label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
      />
    </div>
  );
};

export default RichTextSection;
