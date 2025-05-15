'use client';

import { Editor } from '../components/editor';
import { EditorProvider } from '../context/EditorContext';

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <h1 className="text-3xl font-bold text-center mb-8">BeePad</h1>
      <EditorProvider>
        <Editor />
      </EditorProvider>
    </main>
  );
}
