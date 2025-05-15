import { useEditor as useTiptap } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import { useEditor } from '../../context/EditorContext';
import { EditorContent } from './EditorContent';
import { Toolbar } from './Toolbar';

interface EditorProps {
  content?: string;
  onUpdate?: (content: string) => void;
}

export function Editor({ content = '', onUpdate }: EditorProps) {
  const { setEditor } = useEditor();
  
  const editor = useTiptap({
    extensions: [
      StarterKit,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML());
    },
  });

  useEffect(() => {
    setEditor(editor);
    return () => {
      editor?.destroy();
      setEditor(null);
    };
  }, [editor, setEditor]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Toolbar />
      <EditorContent editor={editor} />
    </div>
  );
}
