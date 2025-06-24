import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  // Check if RAWG API key is available
  const rawgApiKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;
  
  if (!rawgApiKey) {
    console.warn('NEXT_PUBLIC_RAWG_API_KEY not found in environment variables');
    return NextResponse.json({ 
      error: 'Search functionality temporarily unavailable',
      results: [],
      count: 0
    }, { status: 503 });
  }

  try {
    const response = await fetch(
      `https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&key=${rawgApiKey}&page_size=10`,
      {
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000) // 10 second timeout
      }
    );

    if (!response.ok) {
      console.error(`RAWG API error: ${response.status} ${response.statusText}`);
      throw new Error(`RAWG API returned ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      results: data.results || [],
      count: data.count || 0
    });
  } catch (error) {
    console.error('Error searching games:', error);
    
    // Return a more user-friendly error
    return NextResponse.json({ 
      error: 'Search service temporarily unavailable',
      results: [],
      count: 0
    }, { status: 503 });
  }
} 