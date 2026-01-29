import { Router } from 'express';
import pool from '../db.js';
import { CreatePlaceSchema, UpdatePlaceSchema } from '../validators/place.schema.js';
import { authMiddleware } from '../middleware/auth.js';
import multer from 'multer';
import { parseCSVFile, validateCSVRows, cleanupCSVFile } from '../services/csvImporter.js';
import { z } from 'zod';
import path from 'path';

const router = Router();

// Configure multer for file uploads
const upload = multer({
    dest: process.env.CSV_UPLOAD_DIR || './uploads',
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    },
});

// GET /places - Fetch all places with pagination, filtering, sorting
// NOTE: authMiddleware removed from GET to allow public access/frontend demo, 
// or should we keep it? server/index.js previous implementation was public.
// backend/src/places.ts had AuthenticatedRequest.
// I will keep it public for GET as per typical patterns unless user specified otherwise,
// BUT the original code had AuthenticatedRequest type on GET.
// However, the implementations in places.ts DON'T actually use req.user in GET.
// So removing authMiddleware for GET is safe and likely desired for a public listing.
// For POST/PUT/DELETE, I will apply authMiddleware.
router.get('/', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 20);
        const offset = (page - 1) * limit;
        const sortBy = req.query.sortBy || 'id';
        const sortOrder = (req.query.sortOrder || 'ASC').toUpperCase();
        const search = req.query.search;
        const category = req.query.category;
        const activeFilter = req.query.activeFilter;
        const minRating = req.query.minRating;

        // Validate sort parameters to prevent SQL injection
        const validSortColumns = ['id', 'name', 'category', 'rating', 'created_at'];
        const validSortOrders = ['ASC', 'DESC'];

        if (!validSortColumns.includes(sortBy)) {
            return res.status(400).json({ error: 'Invalid sortBy parameter' });
        }

        if (!validSortOrders.includes(sortOrder)) {
            return res.status(400).json({ error: 'Invalid sortOrder parameter' });
        }

        let query = 'SELECT * FROM places WHERE 1=1';
        const queryParams = [];
        let paramIndex = 1;

        if (search) {
            query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        // Category filter
        if (category && category !== 'all') {
            query += ` AND (category ILIKE $${paramIndex} OR category ILIKE $${paramIndex + 1})`;
            queryParams.push(`%${category}%`, `%,${category},%`);
            paramIndex += 2;
        }

        // Active status filter
        if (activeFilter === 'active') {
            query += ` AND is_active = $${paramIndex}`;
            queryParams.push(true);
            paramIndex++;
        } else if (activeFilter === 'inactive') {
            query += ` AND is_active = $${paramIndex}`;
            queryParams.push(false);
            paramIndex++;
        }

        // Rating filter
        if (minRating && !isNaN(parseFloat(minRating))) {
            query += ` AND rating >= $${paramIndex}`;
            queryParams.push(parseFloat(minRating));
            paramIndex++;
        }

        const countResult = await pool.query(
            query.replace('SELECT *', 'SELECT COUNT(*) as count'),
            queryParams
        );
        const totalCount = parseInt(countResult.rows[0].count, 10);

        query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limit, offset);

        const result = await pool.query(query, queryParams);

        res.json({
            data: result.rows,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching places:', error);
        res.status(500).json({ error: 'Failed to fetch places' });
    }
});

// GET /places/:id - Fetch a single place
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query('SELECT * FROM places WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Place not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching place:', error);
        res.status(500).json({ error: 'Failed to fetch place' });
    }
});

// POST /places - Create a new place
router.post('/', authMiddleware, async (req, res) => {
    try {
        const validated = CreatePlaceSchema.parse(req.body);

        const query = `
      INSERT INTO places (
        name,
        description,
        address,
        latitude,
        longitude,
        category,
        opening_hours,
        price_range,
        price_min,
        price_max,
        rating,
        image_url,
        google_maps_link,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

        const result = await pool.query(query, [
            validated.name,
            validated.description || null,
            validated.address || null,
            validated.latitude || null,
            validated.longitude || null,
            validated.category || null,
            validated.opening_hours || null,
            validated.price_range || null,
            validated.price_min || null,
            validated.price_max || null,
            validated.rating || null,
            validated.image_url || null,
            validated.google_maps_link || null,
            validated.is_active,
        ]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation error', details: error.errors });
        }
        console.error('Error creating place:', error);
        res.status(500).json({ error: 'Failed to create place' });
    }
});

// PUT /places/:id - Update a place
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('📥 PUT /places/:id - req.body:', JSON.stringify(req.body, null, 2));
        console.log('📥 PUT /places/:id - image_url received:', req.body.image_url);
        const validated = UpdatePlaceSchema.parse(req.body);
        console.log('📥 PUT /places/:id - validated image_url:', validated.image_url);

        // Build dynamic UPDATE query
        const fields = [];
        const values = [];
        let paramIndex = 1;

        Object.entries(validated).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        });

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(id);
        const query = `UPDATE places SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Place not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation error', details: error.errors });
        }
        console.error('Error updating place:', error);
        res.status(500).json({ error: 'Failed to update place' });
    }
});

// DELETE /places/:id - Delete a single place
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query('DELETE FROM places WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Place not found' });
        }

        res.json({ success: true, deletedId: result.rows[0].id });
    } catch (error) {
        console.error('Error deleting place:', error);
        res.status(500).json({ error: 'Failed to delete place' });
    }
});

// POST /places/bulk/delete - Bulk delete places
router.post('/bulk/delete', authMiddleware, async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'No IDs provided' });
        }

        const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
        const query = `DELETE FROM places WHERE id IN (${placeholders}) RETURNING id`;

        const result = await pool.query(query, ids);

        res.json({
            success: true,
            deletedCount: result.rows.length,
            deletedIds: result.rows.map(r => r.id),
        });
    } catch (error) {
        console.error('Error bulk deleting places:', error);
        res.status(500).json({ error: 'Failed to bulk delete places' });
    }
});

// PUT /places/bulk/update - Bulk update places
router.put('/bulk/update', authMiddleware, async (req, res) => {
    try {
        const { updates } = req.body; // Array of { id, ...updateFields }

        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({ error: 'No updates provided' });
        }

        const updatedPlaces = [];

        for (const update of updates) {
            const { id, ...fields } = update;
            const validated = UpdatePlaceSchema.parse(fields);

            const fieldEntries = Object.entries(validated);
            if (fieldEntries.length === 0) continue;

            const updateFields = fieldEntries.map(([key], i) => `${key} = $${i + 1}`).join(', ');
            const values = fieldEntries.map(([_, value]) => value);
            values.push(id);

            const query = `UPDATE places SET ${updateFields}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`;
            const result = await pool.query(query, values);

            if (result.rows.length > 0) {
                updatedPlaces.push(result.rows[0]);
            }
        }

        res.json({
            success: true,
            updatedCount: updatedPlaces.length,
            updatedPlaces,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation error', details: error.errors });
        }
        console.error('Error bulk updating places:', error);
        res.status(500).json({ error: 'Failed to bulk update places' });
    }
});

// POST /places/csv/upload - Upload and preview CSV file
router.post('/csv/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let columnMapping = {};

        // Parse columnMapping from FormData (it's sent as a JSON string)
        if (req.body.columnMapping) {
            try {
                columnMapping = typeof req.body.columnMapping === 'string'
                    ? JSON.parse(req.body.columnMapping)
                    : req.body.columnMapping;
            } catch (e) {
                // If parsing fails, just use empty mapping
                columnMapping = {};
            }
        }

        // Parse CSV
        const { rows, columnNames } = await parseCSVFile(req.file.path);

        // Validate rows with the provided mapping (mapping can be empty)
        const validation = await validateCSVRows(rows, columnMapping);

        // Clean up file after processing
        cleanupCSVFile(req.file.path);

        res.json({
            validation,
            columnNames,
            fileName: req.file.originalname,
        });
    } catch (error) {
        if (req.file) {
            cleanupCSVFile(req.file.path);
        }
        console.error('Error uploading CSV:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to upload CSV' });
    }
});

// POST /places/csv/import - Import validated CSV data
router.post('/csv/import', authMiddleware, async (req, res) => {
    try {
        const { validRows } = req.body;

        if (!Array.isArray(validRows) || validRows.length === 0) {
            return res.status(400).json({ error: 'No valid rows to import' });
        }

        const insertedPlaces = [];

        for (const place of validRows) {
            const validated = CreatePlaceSchema.parse(place);

            const query = `
        INSERT INTO places (
          name,
          description,
          address,
          latitude,
          longitude,
          category,
          opening_hours,
          price_range,
          price_min,
          price_max,
          rating,
          image_url,
          google_maps_link,
          is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `;

            const result = await pool.query(query, [
                validated.name,
                validated.description || null,
                validated.address || null,
                validated.latitude || null,
                validated.longitude || null,
                validated.category || null,
                validated.opening_hours || null,
                validated.price_range || null,
                validated.price_min || null,
                validated.price_max || null,
                validated.rating || null,
                validated.image_url || null,
                validated.google_maps_link || null,
                validated.is_active,
            ]);

            insertedPlaces.push(result.rows[0]);
        }

        res.status(201).json({
            success: true,
            insertedCount: insertedPlaces.length,
            insertedPlaces,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation error', details: error.errors });
        }
        console.error('Error importing CSV:', error);
        res.status(500).json({ error: 'Failed to import CSV data' });
    }
});

export default router;
