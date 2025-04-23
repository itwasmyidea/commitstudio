#!/usr/bin/env node

/**
 * Pre-publish validation script
 * Checks that everything is in order before publishing to npm
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Check package.json
console.log(chalk.blue('Checking package.json...'));
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));

// Verify version numbers match in all files
console.log(chalk.blue('Verifying version numbers...'));
const cliContent = fs.readFileSync(path.join(rootDir, 'bin/cli.js'), 'utf8');
const cliVersionMatch = cliContent.match(/\.version\(['"]([\d.]+)['"]\)/);

if (cliVersionMatch && cliVersionMatch[1] !== packageJson.version) {
  console.error(chalk.red(`Version mismatch: package.json (${packageJson.version}) and cli.js (${cliVersionMatch[1]})`));
  process.exit(1);
}

// Check required files exist
console.log(chalk.blue('Checking required files...'));
const requiredFiles = [
  'bin/cli.js',
  'src/index.js',
  'README.md',
  'CHANGELOG.md',
  'LICENSE'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(rootDir, file))) {
    console.error(chalk.red(`Missing required file: ${file}`));
    process.exit(1);
  }
}

// Check bin file has correct permissions
console.log(chalk.blue('Checking bin file permissions...'));
try {
  fs.accessSync(path.join(rootDir, 'bin/cli.js'), fs.constants.X_OK);
} catch (err) {
  console.warn(chalk.yellow('bin/cli.js is not executable, fixing...'));
  try {
    // Make bin file executable
    fs.chmodSync(path.join(rootDir, 'bin/cli.js'), '755');
    console.log(chalk.green('Fixed bin/cli.js permissions'));
  } catch (chmodErr) {
    console.error(chalk.red(`Failed to make bin/cli.js executable: ${chmodErr.message}`));
    process.exit(1);
  }
}

console.log(chalk.green('✓ Pre-publish validation passed!'));
console.log(chalk.dim('Ready to publish version', packageJson.version)); 