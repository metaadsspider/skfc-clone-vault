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
    // Reconstruct the FanCode API URL
    const pathParam = params?.path;
    const pathSegments = Array.isArray(pathParam) ? pathParam : (pathParam ? String(pathParam).split('/') : []);
    const apiPath = pathSegments.filter(Boolean).join('/');
    
    const fancodeUrl = `https://www.fancode.com/api/${apiPath}`;
    
    console.log('Proxying FanCode API URL:', fancodeUrl);

    // Fetch from FanCode API with proper headers
    const response = await fetch(fancodeUrl, {
      method: request.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.fancode.com/',
        'Origin': 'https://www.fancode.com',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: request.method !== 'GET' ? await request.text() : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Create new response with CORS headers
    const responseData = await response.text();
    
    return new Response(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Expose-Headers': '*',
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('FanCode API Proxy error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch from FanCode API' }), { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json',
      }
    });
  }
}