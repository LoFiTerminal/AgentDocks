FROM mcr.microsoft.com/playwright/python:v1.41.0-focal

# Install Python and pip
RUN apt-get update && apt-get install -y python3-pip

# Install Playwright Python package
RUN pip3 install playwright

# Install Chromium browser
RUN playwright install chromium

# Set working directory
WORKDIR /workspace

# Keep container running
CMD ["sleep", "infinity"]
