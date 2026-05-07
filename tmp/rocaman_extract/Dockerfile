# Use official Python image
FROM python:3.12

# Set working directory
WORKDIR /app

# Copy dependencies
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose port 8000
EXPOSE 8000

# Run Django application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "RocaMan.wsgi:application"]