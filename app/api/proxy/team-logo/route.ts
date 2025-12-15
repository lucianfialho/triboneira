import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy para logos de times do HLTV
 * Resolve o problema do hash de validação nas URLs
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
  }

  // Validar que é uma URL do HLTV
  if (!url.includes('hltv.org')) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    // Fazer fetch com headers do browser
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.hltv.org/',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      // Cache por 24 horas
      next: { revalidate: 86400 }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch (error) {
    console.error('Error proxying team logo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
