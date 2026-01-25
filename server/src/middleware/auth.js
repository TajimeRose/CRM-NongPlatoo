const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'your_secure_token_here';

export const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No authorization token provided' });
    }

    if (token !== ADMIN_TOKEN) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = { role: 'admin' };
    next();
};

export const errorMiddleware = (err, req, res, next) => {
    console.error('Error:', err);

    if (err.name === 'ZodError') {
        return res.status(400).json({
            error: 'Validation error',
            details: err.errors,
        });
    }

    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        return res.status(500).json({ error: 'Database connection lost' });
    }

    if (err.code === 'ER_CON_COUNT_ERROR') {
        return res.status(500).json({ error: 'Database connection error' });
    }

    res.status(500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
    });
};
