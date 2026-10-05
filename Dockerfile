# TripProof: Project-Linked Travel Expense & Tax Intelligence Engine
# Production Container for Hugging Face Spaces & Render Deployment

FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PORT=7860 \
    HOST=0.0.0.0

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/
COPY storage/ ./storage/

# Copy built frontend assets
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose standard Hugging Face Spaces & container port
EXPOSE 7860

# Launch FastAPI application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
