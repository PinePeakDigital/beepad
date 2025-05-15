'use client';

import NotePageClient from './note-page-client';

type Props = {
  params: { slug: string };
};

export default function Page({ params }: Props) {
  return <NotePageClient slug={params.slug} />;
}