import { z } from 'zod';

// Schema for the 'places' table
export const PlaceSchema = z.object({
    id: z.number().int().positive().optional(),
    name: z.string().min(1, 'Name is required').max(255),
    description: z.string().max(5000).optional().nullable(),
    address: z.string().optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    category: z.string().optional().nullable(),
    price_min: z.number().min(0).optional().nullable(),
    price_max: z.number().min(0).optional().nullable(),
    price_range: z.string().optional().nullable(),
    rating: z.number().min(0).max(5).optional().nullable(),
    image_url: z.string().optional().nullable(),
    google_maps_link: z.string().optional().nullable(),
    opening_hours: z.string().optional().nullable(),
    attraction_type: z.string().optional().nullable(),
    is_active: z.boolean().default(true),
    created_at: z.date().optional(),
    updated_at: z.date().optional(),
});

// Validation for CRUD operations
export const CreatePlaceSchema = PlaceSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
}).extend({
    name: z.string().min(1, 'Name is required').max(255),
});

export const UpdatePlaceSchema = z.object({
    name: z.string().optional(),
    description: z.any().optional(),
    address: z.any().optional(),
    latitude: z.any().optional(),
    longitude: z.any().optional(),
    category: z.any().optional(),
    opening_hours: z.any().optional(),
    price_range: z.any().optional(),
    price_min: z.any().optional(),
    price_max: z.any().optional(),
    rating: z.any().optional(),
    image_url: z.any().optional(),
    google_maps_link: z.any().optional(),
    is_active: z.any().optional(),
});
