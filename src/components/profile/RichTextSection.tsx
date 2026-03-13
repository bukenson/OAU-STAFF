import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, RemoveFormatting } from "lucide-react";
import { useEffect } from "react";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const MenuButton = ({ active, onClick, children, title }: { active?: boolean; onClick: () => void; children: React.ReactNode; title: string }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`p-1.5 rounded transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
  >
    {children}
  </button>
);

const RichTextSection = ({ label, value, onChange, placeholder }: Props) => {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: value || "",
    editorProps: {
      attributes: {
        class: "min-h-[150px] px-3 py-2 text-sm focus:outline-none prose prose-sm max-w-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value]);

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-primary">{label}</label>
      <div className="border border-input rounded-md overflow-hidden bg-background">
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-input bg-muted/50 flex-wrap">
          <MenuButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
            <Bold size={16} />
          </MenuButton>
          <MenuButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
            <Italic size={16} />
          </MenuButton>
          <MenuButton active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
            <UnderlineIcon size={16} />
          </MenuButton>
          <div className="w-px h-5 bg-border mx-1" />
          <MenuButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List">
            <List size={16} />
          </MenuButton>
          <MenuButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered List">
            <ListOrdered size={16} />
          </MenuButton>
          <div className="w-px h-5 bg-border mx-1" />
          <MenuButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear Formatting">
            <RemoveFormatting size={16} />
          </MenuButton>
        </div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextSection;
