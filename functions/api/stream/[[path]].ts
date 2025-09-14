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
    const pathParam = params?.path;
    const pathSegments = Array.isArray(pathParam) ? pathParam : (pathParam ? String(pathParam).split('/') : []);
    const streamPath = pathSegments.filter(Boolean).join('/');
    
    // Handle different stream sources
    let streamUrl: string;
    let referer: string;
    let origin: string;
    
    console.log('Received path segments:', pathSegments);
    console.log('Stream path:', streamPath);
    
    if (pathSegments[0] === 'hotstar') {
      // Remove 'hotstar' prefix and reconstruct Hotstar URL
      streamUrl = `https://live12p.hotstar.com/${pathSegments.slice(1).join('/')}`;
      referer = 'https://www.hotstar.com/';
      origin = 'https://www.hotstar.com';
    } else if (pathSegments[0] === 'bbc') {
      // Remove 'bbc' prefix and reconstruct BBC URL
      streamUrl = `https://${pathSegments.slice(1).join('/')}`;
      referer = 'https://www.bbc.com/';
      origin = 'https://www.bbc.com';
    } else if (pathSegments[0] === 'fancode' && pathSegments[1] === 'fdlive') {
      // Handle fdlive fancode URLs: fancode/fdlive/mumbai/...
      streamUrl = `https://in-mc-fdlive.fancode.com/${pathSegments.slice(2).join('/')}`;
      referer = 'https://fancode.com/';
      origin = 'https://fancode.com';
    } else if (pathSegments[0] === 'fancode') {
      // Handle regular fancode URLs: fancode/mumbai/...
      streamUrl = `https://in-mc-pdlive.fancode.com/${pathSegments.slice(1).join('/')}`;
      referer = 'https://fancode.com/';
      origin = 'https://fancode.com';
    } else if (pathSegments[0] === 'dai.google.com') {
      // Handle Google DAI URLs specifically
      const remainingPath = pathSegments.slice(1).join('/');
      const url = new URL(request.url);
      const queryString = url.search;
      
      streamUrl = `https://dai.google.com/${remainingPath}${queryString}`;
      referer = 'https://fancode.com/';
      origin = 'https://fancode.com';
    } else if (pathSegments[0]?.includes('.')) {
      // Handle direct hostname URLs (like Sony, Akamai, etc.)
      const hostname = pathSegments[0];
      const remainingPath = pathSegments.slice(1).join('/');
      
      // Get query parameters from original request
      const url = new URL(request.url);
      const queryString = url.search;
      
      streamUrl = `https://${hostname}/${remainingPath}${queryString}`;
      
      // Set appropriate referer based on domain
      if (hostname.includes('sony') || hostname.includes('akamaized')) {
        referer = 'https://www.sonyliv.com/';
        origin = 'https://www.sonyliv.com';
      } else if (hostname.includes('fancode')) {
        referer = 'https://fancode.com/';
        origin = 'https://fancode.com';
      } else if (hostname.includes('google') || hostname.includes('dai')) {
        referer = 'https://www.google.com/';
        origin = 'https://www.google.com';
      } else {
        referer = 'https://www.google.com/';
        origin = 'https://www.google.com';
      }
    } else {
      // Default to pdlive for backward compatibility
      streamUrl = `https://in-mc-pdlive.fancode.com/${streamPath}`;
      referer = 'https://fancode.com/';
      origin = 'https://fancode.com';
    }
    
    console.log('Proxying stream URL:', streamUrl);

    // Set up headers based on the stream type
    const baseHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Referer': referer,
      'Origin': origin,
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site',
    };

    // Special handling for different stream types
    if (pathSegments[0] === 'dai.google.com') {
      // Google DAI specific headers - more permissive approach
      baseHeaders['Accept-Encoding'] = 'gzip, deflate';
      baseHeaders['Cache-Control'] = 'no-cache';
      baseHeaders['Pragma'] = 'no-cache';
      baseHeaders['DNT'] = '1';
      // Use a more generic referer for DAI
      baseHeaders['Referer'] = 'https://www.google.com/';
      baseHeaders['Origin'] = 'https://www.google.com';
    } else if (pathSegments[0]?.includes('sony') || pathSegments[0]?.includes('akamaized')) {
      // Sony/Akamai specific headers
      baseHeaders['Accept-Encoding'] = 'gzip, deflate';
      baseHeaders['Cache-Control'] = 'no-cache';
      baseHeaders['X-Forwarded-For'] = '8.8.8.8';
      baseHeaders['Referer'] = 'https://www.sonyliv.com/';
      baseHeaders['Origin'] = 'https://www.sonyliv.com';
    } else if (pathSegments[0] === 'bbc') {
      // BBC specific headers
      baseHeaders['X-Requested-With'] = 'XMLHttpRequest';
      baseHeaders['Cache-Control'] = 'no-cache';
      baseHeaders['Accept-Encoding'] = 'gzip, deflate, br';
    } else {
      baseHeaders['Accept-Encoding'] = 'gzip, deflate, br';
    }

    // Fetch the stream with proper headers for each service
    const response = await fetch(streamUrl, {
      method: request.method,
      headers: baseHeaders,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

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