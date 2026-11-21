import { prisma } from '@/lib/db';

// Product photos. The URL carries ?v=<version>, so each version can be cached for a long time.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const img = await prisma.productImage.findUnique({ where: { productId: id } });
  if (!img) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(img.data), {
    headers: { 'Content-Type': img.mime, 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
}
