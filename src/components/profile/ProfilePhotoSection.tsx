import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { compressImage } from "@/lib/compressImage";

interface Props {
  imageUrl: string;
  userName: string;
  userId?: string;
  onImageChange: (url: string) => void;
}

const ProfilePhotoSection = ({ imageUrl, userName, userId, onImageChange }: Props) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    const compressed = await compressImage(file);
    const path = `${userId}/avatar.jpg`;
    const { error } = await supabase.storage.from("staff-photos").upload(path, compressed, { upsert: true, contentType: "image/jpeg" });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage.from("staff-photos").getPublicUrl(path);
      onImageChange(urlData.publicUrl + "?t=" + Date.now());
      toast({ title: "Photo uploaded!" });
    }
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-primary">Your Photo:</label>
      <div className="flex items-center gap-4">
        {imageUrl ? (
          <div className="w-20 h-24 rounded-lg overflow-hidden border border-border shrink-0">
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover object-top" />
          </div>
        ) : (
          <div className="w-20 h-24 rounded-lg border border-border bg-muted flex items-center justify-center shrink-0">
            <span className="font-display text-2xl font-bold text-muted-foreground">{userName?.charAt(0) || "?"}</span>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label className="inline-flex items-center gap-2 cursor-pointer border border-input bg-background text-foreground text-sm px-4 py-2 rounded-md hover:bg-accent transition-colors">
            <Upload size={14} />
            {uploading ? "Uploading…" : "Choose File"}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading} onChange={handleUpload} />
          </label>
          {imageUrl && (
            <button type="button" onClick={() => onImageChange("")} className="text-xs text-destructive hover:text-destructive/80 text-left">
              Remove photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePhotoSection;
