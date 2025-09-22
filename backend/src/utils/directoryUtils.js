// utils/directoryUtils.js
const fs = require('fs');
const path = require('path');

/**
 * Recursively creates directories like mkdir -p
 * @param {string} dirPath - The directory path to create
 * @param {Object} options - Options for mkdirSync
 */
function ensureDirectoryExists(dirPath, options = { recursive: true }) {
  if (fs.existsSync(dirPath)) {
    return true;
  }
  
  try {
    fs.mkdirSync(dirPath, options);
    console.log(`Directory created: ${dirPath}`);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Create parent directory first
      ensureDirectoryExists(path.dirname(dirPath), options);
      // Try again
      return ensureDirectoryExists(dirPath, options);
    }
    throw error;
  }
}

/**
 * Recursively creates all directories in a path
 * @param {string} filePath - The full file path including filename
 */
function ensureFileDirectoryExists(filePath) {
  const dirPath = path.dirname(filePath);
  return ensureDirectoryExists(dirPath);
}

module.exports = {
  ensureDirectoryExists,
  ensureFileDirectoryExists
};