# Use an official Python base image
FROM python:3.10-slim

# Set work directory
WORKDIR /app

# Install system dependencies (for whisper, torch, etc.)
RUN apt-get update && \
    apt-get install -y ffmpeg git && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . .

# Expose FastAPI port
EXPOSE 6500

# Run the FastAPI app
CMD ["uvicorn", "WhisperApi:app", "--host", "0.0.0.0", "--port", "6500"]