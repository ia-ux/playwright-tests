FROM mcr.microsoft.com/playwright:v1.58.1-noble

WORKDIR /app

COPY package.json package-lock.json ./

RUN PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci --ignore-scripts=false

COPY . .

RUN chmod +x run-browserstack-tests.sh run-tests.sh

CMD ["bash", "run-tests.sh"]
