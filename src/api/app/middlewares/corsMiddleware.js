const corsMiddleware = (req, res, next) => {
    // res.setHeader('Access-Control-Allow-Origin', '*');
    // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    // res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Add Cross-Origin-Resource-Policy header
    // If the resource and your site are served from the same site:
    // res.setHeader('Cross-Origin-Resource-Policy', 'same-site');

    // If the resource is served from another location than your website:
    // res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    res.append('Cache-Control', 'no-store, private');
    // res.append('Referrer-Policy', 'origin-when-cross-origin');
    res.append('Strict-Transport-Security', 'max-age=86400');
    res.append('X-XSS-Protection', '1; mode=block');
    // res.append('X-Content-Type-Options', 'nosniff');
    // Uncomment and specify the Link header if needed.
    // res.append('Link', 'https://sitisarm.tk; rel=canonical');
    // Set the allowed origins for Timing-Allow-Origin.
    // res.append('Timing-Allow-Origin', 'https://example.com');
    res.removeHeader('X-Powered-By');
    res.removeHeader('Expires');
    res.setHeader('Server', 'tgnsa.ru'); // Optionally change the server name.
    next();
};

export default corsMiddleware;