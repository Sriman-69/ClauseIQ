# ClauseIQ

AI-Powered Legal, Tax, Compliance, Accounting, and Audit Research Assistant.

## Phase 2: Core RAG System

This is the implementation of the core RAG system for ClauseIQ.

### Backend

- **Framework**: FastAPI
- **Language**: Python
- **Dependencies**: See `backend/requirements.txt`

**To run the backend:**

1.  `cd backend`
2.  `python -m venv venv`
3.  `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
4.  `pip install -r requirements.txt`
5.  Create a `.env` file and add your `GEMINI_API_KEY`.
6.  `uvicorn app.main:app --reload`

The API will be available at `http://localhost:8000`.

### Frontend

- **Framework**: React (with Vite)
- **Language**: JavaScript (JSX)
- **Dependencies**: See `frontend/package.json`

**To run the frontend:**

1.  `cd frontend`
2.  `npm install`
3.  `npm run dev`

The application will be available at `http://localhost:5173`.
