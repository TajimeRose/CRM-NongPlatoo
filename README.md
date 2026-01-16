# CRM NongPlatoo

## Project Info

ระบบ CRM สำหรับการท่องเที่ยวจังหวัดสมุทรสงคราม

**Technologies:**
- Frontend: Vite + React + TypeScript + Tailwind CSS + shadcn-ui
- Backend: Node.js + Express
- Database: PostgreSQL + Firebase

---

## 🚀 Deployment on Coolify

### Prerequisites
- Coolify instance running
- PostgreSQL database (external or managed)
- Firebase project with service account

### Quick Deploy

1. **Connect Repository**
   - Add your Git repository to Coolify
   - Select "Docker Compose" as deployment type

2. **Configure Environment Variables**
   
   Add these in Coolify's Environment Variables section:

   ```env
   # Firebase
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # Database
   DATABASE_URL=postgresql://user:password@host:5432/database
   POSTGRES_HOST=your_host
   POSTGRES_PORT=5432
   POSTGRES_DB=postgres
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_password

   # API
   VITE_API_URL=/api
   OPENAI_API_KEY=your_openai_key
   NODE_ENV=production
   ```

3. **Firebase Service Account**
   - Upload `serviceAccountKey.json` to your server
   - Mount it as volume: `./serviceAccountKey.json:/app/server/serviceAccountKey.json:ro`

4. **Deploy**
   - Click Deploy in Coolify
   - Wait for build to complete

### Ports
- **80**: Frontend (nginx)
- **3001**: Backend API

### Health Check
- Endpoint: `http://your-domain/health`

---

## 💻 Local Development

### Frontend
```sh
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend API
```sh
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```sh
# Build frontend
npm run build

# Preview production build
npm run preview
```

---

## 🐳 Docker Local Testing

```sh
# Build and run with Docker Compose
docker-compose up --build

# Access at http://localhost
```

---

## 📁 Project Structure

```
├── src/                 # Frontend source code
│   ├── components/      # React components
│   ├── pages/           # Page components
│   └── lib/             # Utilities
├── server/              # Backend API
│   ├── index.js         # Express server
│   └── package.json     
├── public/              # Static assets
├── Dockerfile           # Multi-stage Docker build
├── docker-compose.yml   # Docker Compose config
├── nginx.conf           # Nginx configuration
└── supervisord.conf     # Process manager config
```

---

## 📝 Environment Files

| File | Purpose |
|------|---------|
| `.env` | Local development (git-ignored) |
| `.env.example` | Template for environment variables |
| `serviceAccountKey.json` | Firebase Admin SDK (git-ignored) |
