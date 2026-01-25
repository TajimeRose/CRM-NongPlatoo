import fs from 'fs';
import csv from 'csv-parser';
import { CreatePlaceSchema } from '../validators/place.schema.js';
import { z } from 'zod';

/**
 * Parse CSV file and extract rows and column names
 */
export async function parseCSVFile(filePath) {
    return new Promise((resolve, reject) => {
        const rows = [];
        const columnNames = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('headers', (headers) => {
                columnNames.push(...headers);
            })
            .on('data', (row) => {
                rows.push(row);
            })
            .on('end', () => {
                resolve({ rows, columnNames });
            })
            .on('error', (err) => {
                reject(new Error(`Failed to parse CSV: ${err.message}`));
            });
    });
}

/**
 * Validate and transform CSV rows according to schema
 */
export async function validateCSVRows(rows, columnMapping) {
    const validRows = [];
    const invalidRows = [];

    for (let i = 0; i < rows.length; i++) {
        const csvRow = rows[i];
        const mappedData = {};

        // Map CSV columns to database columns
        for (const [csvCol, dbCol] of Object.entries(columnMapping)) {
            const value = csvRow[csvCol];
            if (value !== undefined && value !== '') {
                // Convert values based on expected types
                if (dbCol === 'latitude' || dbCol === 'longitude') {
                    mappedData[dbCol] = parseFloat(value);
                } else if (dbCol === 'price_min' || dbCol === 'price_max' || dbCol === 'rating') {
                    mappedData[dbCol] = parseFloat(value);
                } else if (dbCol === 'is_active') {
                    mappedData[dbCol] = value.toLowerCase() === 'true' || value === '1';
                } else {
                    mappedData[dbCol] = value;
                }
            }
        }

        try {
            const validated = CreatePlaceSchema.parse(mappedData);
            validRows.push(validated);
        } catch (error) {
            if (error instanceof z.ZodError) {
                invalidRows.push({
                    rowNumber: i + 2, // +2 because row 1 is headers and arrays are 0-indexed
                    data: csvRow,
                    errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
                });
            }
        }
    }

    return {
        validRows,
        invalidRows,
        totalRows: rows.length,
    };
}

/**
 * Clean up uploaded CSV file
 */
export function cleanupCSVFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (err) {
        console.error(`Failed to cleanup CSV file: ${err}`);
    }
}
