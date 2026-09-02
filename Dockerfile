FROM mcr.microsoft.com/playwright:v1.58.1-noble

WORKDIR /app

COPY package.json package-lock.json ./

RUN PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci --ignore-scripts=false

# The base image ships Chromium but not Google Chrome, which is the channel
# playwright.config.ts and global-setup.ts ask for by default. Google publishes
# no Linux arm64 build, so install it only where it exists; on arm64 the
# container falls back to bundled Chromium via PLAYWRIGHT_CHANNEL (see
# docker-compose.yml).
RUN if [ "$(uname -m)" = "x86_64" ]; then \
      npx playwright install chrome; \
    else \
      echo "Skipping Google Chrome: no Linux arm64 build, using bundled Chromium"; \
    fi

COPY . .

RUN chmod +x run-browserstack-tests.sh run-tests.sh

CMD ["bash", "run-tests.sh"]
