// Cloudflare Worker entry point for tools.oldlane17.com
// Serves static assets generated in dist/

export default {
  async fetch(request, env) {
    if (env.ASSETS) {
      const response = await env.ASSETS.fetch(request);
      if (response.status === 404) {
        // Fallback to custom 404.html
        const notFoundUrl = new URL('/404.html', request.url);
        const notFoundRes = await env.ASSETS.fetch(new Request(notFoundUrl, request));
        if (notFoundRes.status === 200) {
          return new Response(notFoundRes.body, {
            status: 404,
            statusText: 'Not Found',
            headers: notFoundRes.headers
          });
        }
      }
      return response;
    }

    return new Response("tools.oldlane17.com Worker running. Assets not found.", {
      status: 404,
      headers: { "Content-Type": "text/plain" }
    });
  }
};
