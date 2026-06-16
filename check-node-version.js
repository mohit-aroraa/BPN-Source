#!/usr/bin/env node

const requiredVersion = '18.20.0';
const currentVersion = process.version.slice(1); // Remove the 'v' prefix

// Simple version comparison function
function compareVersions(v1, v2) {
  const v1Parts = v1.split('.').map(Number);
  const v2Parts = v2.split('.').map(Number);

  for (let i = 0; i < v1Parts.length; i++) {
    if (v1Parts[i] > v2Parts[i]) {
      return 1;
    }
    if (v1Parts[i] < v2Parts[i]) {
      return -1;
    }
  }

  return 0;
}

if (compareVersions(currentVersion, requiredVersion) < 0) {
  console.error(
    '\x1b[31m%s\x1b[0m',
    `Error: This project requires Node.js version ${requiredVersion} or higher.`
  );
  console.error('\x1b[31m%s\x1b[0m', `You are currently using Node.js ${currentVersion}.`);
  console.error('\x1b[33m%s\x1b[0m', 'To switch to the correct version, run:');
  console.error('\x1b[36m%s\x1b[0m', '  nvm use');
  process.exit(1);
} else {
  console.log('\x1b[32m%s\x1b[0m', `Using Node.js ${currentVersion} ✓`);
}
