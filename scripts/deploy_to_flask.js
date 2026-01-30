
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// --- CONFIGURATION ---
// Change this path to point to your Flask application's root directory
// Example: '../my-flask-backend'
const FLASK_APP_DIR = process.env.FLASK_APP_DIR || '../flask-backend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');

// Flask standard folders
const FLASK_STATIC_DIR = path.join(FLASK_APP_DIR, 'static');
const FLASK_TEMPLATES_DIR = path.join(FLASK_APP_DIR, 'templates');

// ANSI Colors
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    blue: "\x1b[34m"
};

const log = (color, msg) => console.log(`${color}${msg}${colors.reset}`);

const main = async () => {
    log(colors.blue, '🚀 Starting Deployment to Flask...');

    // 1. Check if Flask directory exists
    if (!fs.existsSync(FLASK_APP_DIR)) {
        log(colors.red, `❌ Flask directory not found at: ${FLASK_APP_DIR}`);
        log(colors.yellow, `👉 Please update the 'FLASK_APP_DIR' variable in scripts/deploy_to_flask.js or set FLASK_APP_DIR environment variable.`);
        process.exit(1);
    }

    // 2. Build the React App
    log(colors.blue, '📦 Building React Application...');
    try {
        execSync('npm run build', { stdio: 'inherit', cwd: PROJECT_ROOT });
    } catch (error) {
        log(colors.red, '❌ Build failed.');
        process.exit(1);
    }

    // 3. Prepare Flask directories
    log(colors.blue, '📂 Preparing Flask directories...');
    if (!fs.existsSync(FLASK_STATIC_DIR)) fs.mkdirSync(FLASK_STATIC_DIR, { recursive: true });
    if (!fs.existsSync(FLASK_TEMPLATES_DIR)) fs.mkdirSync(FLASK_TEMPLATES_DIR, { recursive: true });

    // 4. Move Files
    try {
        // Copy Index.html to templates
        const indexHtmlPath = path.join(DIST_DIR, 'index.html');
        if (fs.existsSync(indexHtmlPath)) {
            const targetHtml = path.join(FLASK_TEMPLATES_DIR, 'index.html');
            fs.copyFileSync(indexHtmlPath, targetHtml);
            log(colors.green, `✅ Copied index.html to ${targetHtml}`);
        }

        // Copy Assets to static
        const assetsDir = path.join(DIST_DIR, 'assets');
        if (fs.existsSync(assetsDir)) {
            // Remove old assets to avoid clutter
            const targetAssets = path.join(FLASK_STATIC_DIR, 'assets');
            if (fs.existsSync(targetAssets)) {
                fs.rmSync(targetAssets, { recursive: true, force: true });
            }

            // Node 16.7+ support cpSync. If older, use a library or manual copy.
            // Assuming modern Node given the project.
            fs.cpSync(assetsDir, targetAssets, { recursive: true });
            log(colors.green, `✅ Copied assets to ${targetAssets}`);
        }

        // Copy other public files (like favicon, etc.) if they are in root of dist
        // TODO: iterate dist contents if needed. For now, assets + index is main.

    } catch (error) {
        log(colors.red, `❌ Error moving files: ${error.message}`);
        process.exit(1);
    }

    log(colors.green, '✨ Deployment to Flask Complete!');
    log(colors.yellow, '📝 Note: Ensure your Flask app treats static folder as root for assets or update index.html refs if needed.');
};

main();
