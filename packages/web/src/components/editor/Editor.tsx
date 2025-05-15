import { useEditor as useTiptap } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useEffect, useMemo } from "react";
import { useEditor } from "../../context/EditorContext.js";
import { EditorContent } from "./EditorContent.js";
import { Toolbar } from "./Toolbar.js";

interface EditorProps {
  docName: string;
  content?: string;
  onUpdate?: (content: string) => void;
}

export function Editor({ docName, content = "", onUpdate }: EditorProps) {
  const { setEditor } = useEditor();

  // Initialize Yjs document
  const ydoc = useMemo(() => new Y.Doc(), []);
  const provider = useMemo(
    () =>
      new WebsocketProvider(
        "ws://localhost:3001",
        docName, // Use the note slug as the document name
        ydoc,
      ),
    [docName, ydoc],
  );
  const ytext = ydoc.getText("content");

  const editor = useTiptap({
    extensions: [
      StarterKit,
      Collaboration.configure({
        document: ydoc,
        field: "content", // Match the field name with ytext
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
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
      provider.destroy();
      ydoc.destroy();
    };
  }, [editor, setEditor, provider, ydoc]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Toolbar />
      <EditorContent editor={editor} />
    </div>
  );
}
