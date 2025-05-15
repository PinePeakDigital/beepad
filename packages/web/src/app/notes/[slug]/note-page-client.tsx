'use client';

import { Editor } from '../../../components/editor';
import { EditorProvider } from '../../../context/EditorContext';
import Link from 'next/link';

interface Props {
  slug: string;
}

export default function NotePageClient({ slug }: Props) {
  return (
    <main className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-blue-500 hover:underline">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold">{slug}</h1>
        </div>
        <EditorProvider>
          <Editor docName={slug} />
        </EditorProvider>
      </div>
    </main>
  );
}