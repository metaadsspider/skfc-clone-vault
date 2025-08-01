export async function onRequest(context: any) {
  const { request, params } = context;
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    // Reconstruct the original stream URL
    const pathSegments = params.path || [];
    const streamPath = pathSegments.join('/');
    
    // Handle different stream sources
    let streamUrl: string;
    let referer: string;
    let origin: string;
    
    if (pathSegments[0] === 'hotstar') {
      // Remove 'hotstar' prefix and reconstruct Hotstar URL
      streamUrl = `https://live12p.hotstar.com/${pathSegments.slice(1).join('/')}`;
      referer = 'https://www.hotstar.com/';
      origin = 'https://www.hotstar.com';
    } else {
      streamUrl = `https://in-mc-pdlive.fancode.com/${streamPath}`;
      referer = 'https://fancode.com/';
      origin = 'https://fancode.com';
    }
    
    console.log('Proxying stream URL:', streamUrl);

    // Fetch the stream with proper headers for each service
    const response = await fetch(streamUrl, {
      method: request.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': referer,
        'Origin': origin,
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
      },
    });

    // Create new response with CORS headers
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
    });

    // Add CORS headers
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', '*');
    newResponse.headers.set('Access-Control-Expose-Headers', '*');
    
    // Copy essential headers from original response
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'access-control-allow-origin') {
        newResponse.headers.set(key, value);
      }
    });

    return newResponse;
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response('Proxy Error', { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      }
    });
  }
}