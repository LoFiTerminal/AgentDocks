import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Forward to backend
    const response = await fetch('http://localhost:8000/api/agent/run-with-files', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      return new Response(response.body, {
        status: response.status,
        headers: response.headers,
      });
    }

    // Return the streaming response
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ error: 'Proxy error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
