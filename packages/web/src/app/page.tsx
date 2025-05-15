'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [slug, setSlug] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (slug) {
      router.push(`/notes/${slug}`);
    }
  };

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-3xl font-bold text-center mb-8">BeePad</h1>
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            placeholder="Enter note name (e.g. my-new-note)"
            className="p-2 border rounded"
          />
          <button type="submit" className="p-2 bg-blue-500 text-white rounded" disabled={!slug}>
            Create Note
          </button>
        </form>
      </div>
    </main>
  );
}
