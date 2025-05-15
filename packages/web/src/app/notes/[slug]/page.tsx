"use client";

import { useEffect, useState } from "react";
import NotePageClient from "./note-page-client";

type Props = {
  params: Promise<{ slug: string }>;
};

export default function Page({ params }: Props) {
  const [slug, setSlug] = useState<string>();

  useEffect(() => {
    params.then(({ slug: newSlug }) => setSlug(newSlug));
  }, [params]);

  return <>{slug && <NotePageClient slug={slug} />}</>;
}
