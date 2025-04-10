TIMEFORMAT='It took %0R seconds.' 
time {
  npx browserstack-node-sdk playwright test 
  # npx browserstack-node-sdk playwright test ./tests/av
  # npx browserstack-node-sdk playwright test ./tests/about
  # npx browserstack-node-sdk playwright test ./tests/books
  # npx browserstack-node-sdk playwright test ./tests/collection
  # npx browserstack-node-sdk playwright test ./tests/details
  # npx browserstack-node-sdk playwright test ./tests/donation
  # npx browserstack-node-sdk playwright test ./tests/home
  # npx browserstack-node-sdk playwright test ./tests/login
  # npx browserstack-node-sdk playwright test ./tests/music
  # npx browserstack-node-sdk playwright test ./tests/profile
  # npx browserstack-node-sdk playwright test ./tests/search
  # npx browserstack-node-sdk playwright test ./tests/static
}
