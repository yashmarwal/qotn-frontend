import { notFound } from 'next/navigation';

const VALID_CATEGORIES = new Set(['men', 'women', 'kids']);

// Metadata and structured data live in page.tsx. This layout only rejects unknown categories:
// notFound() here runs before any streaming starts, so the response is a real 404.
export default async function CategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!VALID_CATEGORIES.has(category)) {
    notFound();
  }
  return <>{children}</>;
}
