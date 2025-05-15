import { EditorContent as TiptapContent } from '@tiptap/react';
import { Editor } from '@tiptap/core';

interface EditorContentProps {
  editor: Editor | null;
}

export function EditorContent({ editor }: EditorContentProps) {
  return (
    <div className="min-h-[200px] w-full border rounded-lg p-4 bg-white">
      <TiptapContent editor={editor} />
    </div>
  );
}
