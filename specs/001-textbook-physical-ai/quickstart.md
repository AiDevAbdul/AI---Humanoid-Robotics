# Quickstart Guide: Physical AI & Humanoid Robotics Textbook

## Overview
This guide provides step-by-step instructions to get the Physical AI & Humanoid Robotics textbook platform running locally for development and testing.

## Prerequisites

### System Requirements
- **Operating System**: Linux, macOS, or Windows 10/11
- **Node.js**: v18+ (for Docusaurus frontend)
- **Python**: v3.11+ (for FastAPI backend)
- **Git**: v2.30+ for version control
- **Docker**: (optional) for local database setup
- **npm**: v8+ or yarn v1.22+ for package management

### External Services (Free Tier Options)
- **Neon**: Serverless PostgreSQL account (free tier available)
- **Qdrant Cloud**: Vector database account (free tier available)
- **OpenAI API**: API key for AI features
- **Google AI API**: API key for Gemini integration (for Urdu translation)

## Local Development Setup

### 1. Clone and Initialize Repository
```bash
git clone <repository-url>
cd <repository-name>
git checkout 001-textbook-physical-ai  # Feature branch
```

### 2. Backend Setup (FastAPI)
```bash
# Navigate to backend directory (or create if separate)
mkdir -p backend && cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn python-multipart python-jose[cryptography] passlib[bcrypt] sqlalchemy psycopg2-binary better-exceptions openai google-generativeai python-dotenv

# Create environment file
cp .env.example .env
# Edit .env with your API keys and database connection details
```

### 3. Frontend Setup (Docusaurus)
```bash
# Navigate to frontend directory
cd frontend  # or root directory if monorepo

# Install dependencies
npm install  # or yarn install

# Create environment file
cp .env.example .env
# Edit .env with your API endpoints and keys
```

### 4. Database Setup
```bash
# Option 1: Using Neon (recommended)
# 1. Create account at https://neon.tech
# 2. Create a project and get connection string
# 3. Update DATABASE_URL in your .env file

# Option 2: Using local PostgreSQL with Docker
docker run --name textbook-db -e POSTGRES_DB=textbook -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15

# Run database migrations
cd backend
python -m alembic upgrade head
```

### 5. Vector Database Setup (Qdrant)
```bash
# Option 1: Using Qdrant Cloud (recommended)
# 1. Create account at https://qdrant.tech
# 2. Get API key and cluster URL
# 3. Update QDRANT_URL and QDRANT_API_KEY in .env

# Option 2: Local Qdrant with Docker
docker run -d --name qdrant -p 6333:6333 qdrant/qdrant
```

### 6. Environment Configuration
Create `.env` files in both frontend and backend with the following variables:

**Backend (.env):**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/textbook
QDRANT_URL=https://your-cluster-url.qdrant.tech
QDRANT_API_KEY=your_api_key
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:3000
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_OPENAI_API_KEY=your_openai_api_key
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
```

## Running the Application

### 1. Start Backend Server
```bash
cd backend
source venv/bin/activate  # Activate virtual environment
uvicorn main:app --reload --port 8000
```

### 2. Start Frontend Development Server
```bash
cd frontend
npm start  # or yarn start
# Application will be available at http://localhost:3000
```

### 3. Running in Development Mode
For simultaneous development, use separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

## Initial Data Setup

### 1. Populate Database with Textbook Content
```bash
# From backend directory
python scripts/populate_textbook_content.py
```

### 2. Initialize Vector Database with Content
```bash
# From backend directory
python scripts/index_content_for_rag.py
```

## Testing the Application

### 1. Unit Tests
```bash
# Backend tests
cd backend
python -m pytest tests/unit/

# Frontend tests
cd frontend
npm test  # or yarn test
```

### 2. Integration Tests
```bash
# Backend integration tests
cd backend
python -m pytest tests/integration/
```

## Production Deployment

### 1. Build Frontend for Production
```bash
cd frontend
npm run build  # or yarn build
```

### 2. Deploy to GitHub Pages
```bash
# The build output is configured for GitHub Pages deployment
# Configure in docusaurus.config.js
```

### 3. Deploy Backend
Deploy the FastAPI application to your preferred cloud provider (AWS, GCP, Azure, or VPS).

## Common Issues and Solutions

### Issue: Database Connection Errors
**Solution**: Verify DATABASE_URL in .env and ensure PostgreSQL server is running

### Issue: API Keys Not Working
**Solution**: Check that API keys are correctly set in environment variables and have proper permissions

### Issue: Frontend Cannot Connect to Backend
**Solution**: Verify CORS settings in backend and ensure API_URL in frontend points to correct backend URL

### Issue: Urdu Translation Not Working
**Solution**: Confirm Gemini API key is properly configured and has translation permissions enabled

## Next Steps
1. Explore the API documentation at `/docs` when backend is running
2. Review the textbook content structure in `/content` directory
3. Configure authentication with Better-Auth
4. Set up monitoring and analytics for user engagement tracking