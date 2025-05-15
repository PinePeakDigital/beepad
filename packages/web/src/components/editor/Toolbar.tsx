import { useEditor } from '../../context/EditorContext';

export function Toolbar() {
  const { editor } = useEditor();

  if (!editor) {
    return null;
  }

  return (
    <div className="border-b mb-4 pb-2 flex gap-2">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`p-2 rounded ${editor.isActive('paragraph') ? 'bg-gray-200' : ''}`}
      >
        Paragraph
      </button>
    </div>
  );
}
