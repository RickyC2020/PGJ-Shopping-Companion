#!/usr/bin/env node

/**
 * Pre-build Environment & Secrets Audit Script
 * Verifies that client bundles never receive un-prefixed .env variables
 * or private administrative credentials prior to Vite build.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SENSITIVE_KEYWORDS = [
  'SECRET',
  'ADMIN',
  'PRIVATE_KEY',
  'PASSWORD',
  'DB_PASS',
  'DATABASE_URL',
  'MASTER_KEY',
  'STAGING_CREDENTIAL',
  'SERVICE_ACCOUNT'
];

export function auditEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return { isSafe: true, violations: [] };

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const match = trimmed.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (!match) return;

    const key = match[1];
    const value = match[2];

    // Check 1: Non-VITE variables defined in .env should not be present
    if (!key.startsWith('VITE_') && !key.startsWith('BASE_') && !key.startsWith('MODE')) {
      const isSensitive = SENSITIVE_KEYWORDS.some(word => key.toUpperCase().includes(word));
      if (isSensitive) {
        violations.push({
          file: path.basename(filePath),
          line: index + 1,
          key,
          reason: `High-risk un-prefixed variable '${key}' detected in client .env file.`
        });
      }
    }

    // Check 2: VITE_ prefixed variables must not contain private admin credentials
    if (key.startsWith('VITE_')) {
      const isDangerousAdminKey = ['ADMIN_', 'PRIVATE_KEY', 'DATABASE_URL', 'SECRET_KEY'].some(
        word => key.toUpperCase().includes(word)
      );
      if (isDangerousAdminKey) {
        violations.push({
          file: path.basename(filePath),
          line: index + 1,
          key,
          reason: `VITE_ prefixed variable '${key}' exposes administrative secret to client bundle!`
        });
      }
    }
  });

  return {
    isSafe: violations.length === 0,
    violations
  };
}

export function runPreBuildAudit() {
  console.log('🔍 [Pre-Build Audit] Inspecting environment and client configuration hygiene...');

  const envFiles = ['.env', '.env.local', '.env.production', '.env.development'];
  let allViolations = [];

  for (const file of envFiles) {
    const fullPath = path.join(rootDir, file);
    const result = auditEnvFile(fullPath);
    if (!result.isSafe) {
      allViolations = allViolations.concat(result.violations);
    }
  }

  if (allViolations.length > 0) {
    console.error('\n❌ [BUILD REJECTED] Environment variables security audit failed:');
    allViolations.forEach(v => {
      console.error(`   - [${v.file}:${v.line}] ${v.reason}`);
    });
    console.error('\nEnsure only safe public variables (prefixed with VITE_ and whitelisted) are in client .env.\n');
    return false;
  }

  console.log('✅ [Pre-Build Audit] Environment hygiene verified. No leaked credentials detected.');
  return true;
}

// Execute when invoked directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const passed = runPreBuildAudit();
  if (!passed) {
    process.exit(1);
  }
}
