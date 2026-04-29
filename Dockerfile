# Use the official Python image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Create and set the working directory
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Run the application using Gunicorn (production WSGI server)
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app
