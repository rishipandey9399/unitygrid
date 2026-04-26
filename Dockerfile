# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Flask
FROM python:3.11-slim
WORKDIR /app/backend

# Install system dependencies if required by some python packages (like pytesseract)
RUN apt-get update && apt-get install -y tesseract-ocr libtesseract-dev && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
# Copy dist to /app/dist so that '../dist' from /app/backend resolves correctly
COPY --from=frontend-build /app/dist /app/dist

ENV PORT=8080
EXPOSE 8080

CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "1", "--threads", "8", "--timeout", "0", "app:app"]
