import fs from 'fs';

async function globalSetup() {
  fs.mkdirSync('.auth', { recursive: true });

  const emptyState = JSON.stringify({ cookies: [], origins: [] });

  if (!fs.existsSync('.auth/patron.json')) {
    fs.writeFileSync('.auth/patron.json', emptyState);
  }

  if (!fs.existsSync('.auth/admin.json')) {
    fs.writeFileSync('.auth/admin.json', emptyState);
  }
}

export default globalSetup;
