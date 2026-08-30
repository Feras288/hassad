import { ChangeEvent, useEffect, useRef } from "react";
import { Bold, Heading2, ImagePlus, Italic, Link, List, ListOrdered, Quote, Underline } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onUploadImage: (file: File) => void;
  uploading: boolean;
};

type ToolButtonProps = { title: string; onClick: () => void; children: React.ReactNode };
function ToolButton({ title, onClick, children }: ToolButtonProps) {
  return <button type="button" title={title} aria-label={title} onMouseDown={(event) => event.preventDefault()} onClick={onClick} className="grid h-8 w-8 place-items-center rounded-md text-slate-300 transition-colors hover:bg-slate-700 hover:text-[#A5E4A7]">{children}</button>;
}

export default function ArticleRichTextEditor({ value, onChange, onUploadImage, uploading }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value;
  }, [value]);
  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML ?? "");
  };
  const insertLink = () => {
    const url = window.prompt("أدخل رابط الوجهة كاملاً");
    if (!url) return;
    if (!/^(https?:\/\/|mailto:)/i.test(url.trim())) return window.alert("استخدم رابطاً يبدأ بـ https:// أو http:// أو mailto:");
    runCommand("createLink", url.trim());
  };
  const selectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onUploadImage(file);
  };
  return <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800 focus-within:border-[#81C784]">
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-700/70 bg-slate-900/70 p-2">
      <ToolButton title="عريض" onClick={() => runCommand("bold")}><Bold className="h-4 w-4" /></ToolButton>
      <ToolButton title="مائل" onClick={() => runCommand("italic")}><Italic className="h-4 w-4" /></ToolButton>
      <ToolButton title="تحته خط" onClick={() => runCommand("underline")}><Underline className="h-4 w-4" /></ToolButton>
      <span className="mx-1 h-5 w-px bg-slate-700" />
      <ToolButton title="عنوان فرعي" onClick={() => runCommand("formatBlock", "h2")}><Heading2 className="h-4 w-4" /></ToolButton>
      <ToolButton title="قائمة نقطية" onClick={() => runCommand("insertUnorderedList")}><List className="h-4 w-4" /></ToolButton>
      <ToolButton title="قائمة مرقمة" onClick={() => runCommand("insertOrderedList")}><ListOrdered className="h-4 w-4" /></ToolButton>
      <ToolButton title="اقتباس" onClick={() => runCommand("formatBlock", "blockquote")}><Quote className="h-4 w-4" /></ToolButton>
      <span className="mx-1 h-5 w-px bg-slate-700" />
      <ToolButton title="إضافة رابط" onClick={insertLink}><Link className="h-4 w-4" /></ToolButton>
      <ToolButton title="إدراج صورة داخل المقال" onClick={() => imageInputRef.current?.click()}><ImagePlus className="h-4 w-4" /></ToolButton>
      <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={selectImage} />
      {uploading && <span className="mr-2 text-xs font-bold text-[#A5E4A7]">جارٍ رفع الصورة…</span>}
    </div>
    <div ref={editorRef} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" aria-label="محتوى المقال المنسق" data-placeholder="اكتب محتوى المقال هنا، ثم استخدم أدوات التنسيق لإضافة العناوين والقوائم والروابط والصور." onInput={(event) => onChange(event.currentTarget.innerHTML)} className="article-editor min-h-72 px-4 py-3 text-sm leading-8 text-white outline-none empty:before:pointer-events-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-500 [&_a]:text-[#A5E4A7] [&_a]:underline [&_blockquote]:my-3 [&_blockquote]:border-r-2 [&_blockquote]:border-[#81C784] [&_blockquote]:pr-3 [&_blockquote]:text-slate-300 [&_h2]:my-4 [&_h2]:text-xl [&_h2]:font-black [&_h2]:text-[#D7F0D8] [&_img]:my-4 [&_img]:max-h-80 [&_img]:rounded-xl [&_img]:object-contain [&_ol]:mr-5 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:mr-5 [&_ul]:list-disc" />
  </div>;
}
