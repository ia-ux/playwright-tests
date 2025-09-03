TIMEFORMAT='It took %0R seconds.' 
time {
  # npx browserstack-node-sdk playwright test - this is failing due to timeout

  echo "\nRun ./tests/av"
  npx browserstack-node-sdk playwright test ./tests/av

  echo "\nRun ./tests/about"
  npx browserstack-node-sdk playwright test ./tests/about

  echo "\nRun ./tests/books"
  npx browserstack-node-sdk playwright test ./tests/books

  echo "\nRun ./tests/collection"
  npx browserstack-node-sdk playwright test ./tests/collection

  echo "\nRun ./tests/details"
  npx browserstack-node-sdk playwright test ./tests/details

  echo "\nRun ./tests/donation"
  npx browserstack-node-sdk playwright test ./tests/donation

  echo "\nRun ./tests/home"
  npx browserstack-node-sdk playwright test ./tests/home

  echo "\nRun ./tests/legal"
  npx browserstack-node-sdk playwright test ./tests/legal

  echo "\nRun ./tests/login"
  npx browserstack-node-sdk playwright test ./tests/login

  echo "Run ./tests/music"
  npx browserstack-node-sdk playwright test ./tests/music

  echo "\nRun ./tests/profile"
  npx browserstack-node-sdk playwright test ./tests/profile

  echo "Run ./tests/search"
  npx browserstack-node-sdk playwright test ./tests/search

  echo "\nRun ./tests/static"
  npx browserstack-node-sdk playwright test ./tests/static
}
