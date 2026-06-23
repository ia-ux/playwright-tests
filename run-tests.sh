TIMEFORMAT='It took %0R seconds.' 
time {
  npx playwright test --config=./playwright.config.ts --workers=5 --fully-parallel
}
