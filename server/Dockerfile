FROM python:3.11-slim

# Install ffmpeg + runtime libs
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
# create output dir for HLS segments
RUN mkdir -p /app/streams

EXPOSE 5000
CMD ["python", "app.py"]
