import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { sanitizeUrl } from "@/lib/sanitize";

const LINK_TYPES = ["Google Scholar", "ResearchGate", "ORCID", "Academia.edu", "LinkedIn", "Other"];

interface Props {
  links: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
}

const ProfileLinksSection = ({ links, onAdd, onRemove }: Props) => {
  const [linkType, setLinkType] = useState("Google Scholar");
  const [linkUrl, setLinkUrl] = useState("");

  const handleAdd = () => {
    const sanitized = sanitizeUrl(linkUrl);
    if (sanitized) {
      onAdd(sanitized);
      setLinkUrl("");
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-primary">Your Profile Links</label>
      <Select value={linkType} onValueChange={setLinkType}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {LINK_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
        </SelectContent>
      </Select>
      <Input
        value={linkUrl}
        onChange={(e) => setLinkUrl(e.target.value)}
        placeholder={`Enter link URL (e.g., https://scholar.google.com)`}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
      />
      <Button type="button" variant="default" className="w-full" onClick={handleAdd}>
        Add Link
      </Button>
      {links.length > 0 && (
        <ul className="space-y-1.5 mt-2">
          {links.map((link, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground bg-muted rounded-md px-3 py-2">
              <a href={link} target="_blank" rel="noopener noreferrer" className="flex-1 text-primary underline break-all">{link}</a>
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

export default ProfileLinksSection;
