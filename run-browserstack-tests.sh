TIMEFORMAT='It took %0R seconds.' 
time {
  npx browserstack-node-sdk playwright test -- --test=av
  npx browserstack-node-sdk playwright test -- --test=about
  npx browserstack-node-sdk playwright test -- --test=books
  npx browserstack-node-sdk playwright test -- --test=collection
  # npx browserstack-node-sdk playwright test -- --test=details
  npx browserstack-node-sdk playwright test -- --test=donation
  npx browserstack-node-sdk playwright test -- --test=home
  # npx browserstack-node-sdk playwright test -- --test=login
  # npx browserstack-node-sdk playwright test -- --test=music
  npx browserstack-node-sdk playwright test -- --test=profile
  # npx browserstack-node-sdk playwright test -- --test=search
}
