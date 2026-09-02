TIMEFORMAT='It took %0R seconds.' 
time {
  npx playwright test --config=./playwright.config.ts --workers=${PLAYWRIGHT_WORKERS:-5} --fully-parallel
}
