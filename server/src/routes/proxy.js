import { Router } from 'express';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const router = Router();

// GET /proxy/image - Proxy external images to avoid CORS issues
router.get('/image', async (req, res) => { // NOTE: changed path to /image because it will be mounted at /api/proxy
    try {
        const imageUrl = req.query.url;

        if (!imageUrl) {
            res.status(400).json({ error: 'Missing url parameter' });
            return;
        }

        // Validate URL
        let parsedUrl;
        try {
            parsedUrl = new URL(imageUrl);
        } catch (e) {
            res.status(400).json({ error: 'Invalid URL' });
            return;
        }

        // Only allow specific domains to prevent abuse
        const allowedDomains = [
            'lh3.googleusercontent.com',
            'maps.googleapis.com',
            'maps.gstatic.com',
            'googleusercontent.com',
        ];

        const isAllowed = allowedDomains.some(domain =>
            parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
        );

        if (!isAllowed) {
            res.status(403).json({ error: 'Domain not allowed' });
            return;
        }

        // Determine protocol
        const protocol = parsedUrl.protocol === 'https:' ? https : http;

        // Make request to external URL
        protocol.get(imageUrl, (imageRes) => {
            // Forward status code
            res.status(imageRes.statusCode || 200);

            // Forward headers (especially content-type)
            const contentType = imageRes.headers['content-type'];
            if (contentType) {
                res.setHeader('Content-Type', contentType);
            }

            // Cache for 24 hours
            res.setHeader('Cache-Control', 'public, max-age=86400');

            // Pipe the image data
            imageRes.pipe(res);
        }).on('error', (err) => {
            console.error('Error fetching image:', err);
            res.status(500).json({ error: 'Failed to fetch image' });
        });

    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
